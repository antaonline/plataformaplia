/**
 * DESPLIEGUE DE DEMOS AL VPS — plia.pe/ejemplos
 * ─────────────────────────────────────────────
 * Crea de GOLPE los subdominios d-<slug>.plia.pe en CyberPanel (reutilizando el
 * CyberpanelService ya probado en producción) y despliega el index.html de cada
 * demo a su public_html. Idempotente: si el subdominio ya existe, solo redepliega
 * los archivos.
 *
 * EJECUTAR EN EL VPS (donde corre CyberPanel + el backend):
 *   cd backend
 *   npx ts-node -r tsconfig-paths/register scripts/deploy-demos.ts [opciones]
 *   # o: npm run demos:deploy -- [opciones]
 *
 * Opciones:
 *   --only=restaurante,juridico   solo esos slugs
 *   --dry-run                     no crea ni copia; muestra lo que haría
 *   --no-create                   no crea subdominios; solo redepliega archivos
 *   --owner=admin                 fuerza el websiteOwner (def: CYBERPANEL_ADMIN_USER)
 *
 * Variables de entorno usadas (ya presentes en el backend):
 *   CYBERPANEL_DOMAIN_BASE (def 'plia.pe'), CYBERPANEL_ADMIN_USER,
 *   CYBERPANEL_ADMIN_PASS | CYBERPANEL_EXISTING_USER_PASSWORD,
 *   CYBERPANEL_SITES_ROOT (def '/home'), CYBERPANEL_PUBLIC_DIR (def 'public_html').
 */
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

import { AppModule } from '../src/app.module';
import { CyberpanelService } from '../src/integrations/cyberpanel/cyberpanel.service';

const arg = (name: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : undefined;
};
const flag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const buildDir = join(__dirname, '..', 'demos-build');
  const root = process.env.CYBERPANEL_SITES_ROOT || '/home';
  const publicDir = process.env.CYBERPANEL_PUBLIC_DIR || 'public_html';
  const master = process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe';
  const owner = arg('owner') || process.env.CYBERPANEL_ADMIN_USER || 'admin';
  const ownerPassword =
    process.env.CYBERPANEL_ADMIN_PASS || process.env.CYBERPANEL_EXISTING_USER_PASSWORD || '';
  const dryRun = flag('dry-run');
  const noCreate = flag('no-create');
  const only = (arg('only') || '').split(',').map((s) => s.trim()).filter(Boolean);

  if (!fs.existsSync(buildDir)) {
    throw new Error(`No existe ${buildDir}. Corre primero: node scripts/demos/build.js`);
  }
  if (!noCreate && !ownerPassword && !dryRun) {
    throw new Error('Falta CYBERPANEL_ADMIN_PASS (o CYBERPANEL_EXISTING_USER_PASSWORD) para crear subdominios. Usa --no-create para solo desplegar archivos.');
  }

  // Lista de demos: del manifest si existe, si no escaneando carpetas d-*.
  let slugs: string[] = [];
  const manifestPath = join(buildDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    slugs = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')).map((m: any) => m.slug);
  } else {
    slugs = fs.readdirSync(buildDir).filter((d) => d.startsWith('d-')).map((d) => d.replace(/^d-/, ''));
  }
  if (only.length) slugs = slugs.filter((s) => only.includes(s));
  if (!slugs.length) { console.log('No hay demos que desplegar.'); return; }

  console.log(`\n🚀 Desplegando ${slugs.length} demo(s) a *.${master}  (dryRun=${dryRun}, create=${!noCreate})\n`);

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const cyber = app.get(CyberpanelService);
  let created = 0, deployed = 0, skipped = 0, failed = 0;

  try {
    for (const slug of slugs) {
      const sub = `d-${slug}`;
      const fullDomain = `${sub}.${master}`;
      const srcHtml = join(buildDir, `d-${slug}`, 'index.html');
      const destDir = join(root, fullDomain, publicDir);
      if (!fs.existsSync(srcHtml)) { console.warn(`  ⚠ ${fullDomain}: falta ${srcHtml}`); failed++; continue; }

      // 1) Crear subdominio (tolerante: si existe, seguimos al deploy)
      if (!noCreate) {
        if (dryRun) {
          console.log(`  [dry] crearía childDomain ${fullDomain}`);
        } else {
          try {
            await cyber.createChildDomain({ masterDomain: master, subdomain: sub, websiteOwner: owner, ownerPassword });
            created++;
            console.log(`  ✓ creado ${fullDomain}`);
          } catch (e: any) {
            const msg = String(e?.message || e);
            if (/exist|ya|already|duplicate/i.test(msg)) { console.log(`  • ${fullDomain} ya existía`); skipped++; }
            else { console.warn(`  ⚠ no se pudo crear ${fullDomain}: ${msg} (intento deploy igual)`); }
          }
        }
      }

      // 2) Desplegar index.html
      if (dryRun) { console.log(`  [dry] copiaría index.html → ${destDir}`); deployed++; continue; }
      try {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcHtml, join(destDir, 'index.html'));
        // Permisos + dueño para que LiteSpeed sirva (best-effort).
        try {
          execSync(`chown -R ${owner}:${owner} ${JSON.stringify(join(root, fullDomain, publicDir))}`, { stdio: 'ignore' });
          execSync(`chmod 644 ${JSON.stringify(join(destDir, 'index.html'))}`, { stdio: 'ignore' });
        } catch { /* sin permisos de chown: ignorar */ }
        deployed++;
        console.log(`  ✓ desplegado ${fullDomain}`);
      } catch (e: any) {
        console.error(`  ✗ deploy ${fullDomain}: ${e?.message || e}`); failed++;
      }
    }
  } finally {
    await app.close();
  }

  console.log(`\n📦 Resumen: creados=${created} existían=${skipped} desplegados=${deployed} fallidos=${failed}`);
  console.log(`   Cobertura SSL: wildcard *.${master} (sin cert por subdominio).`);
  console.log(`   Verifica: https://d-${slugs[0]}.${master}\n`);
}

void main().catch((e) => { console.error(e?.message || e); process.exit(1); });
