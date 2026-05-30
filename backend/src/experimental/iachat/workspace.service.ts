import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import { dirname, join, sep } from 'path';

/**
 * Sprint 2 — Workspace por proyecto para PLIA Studio (iachatweb).
 *
 * Cada proyecto del chat tiene su propio directorio en
 * `backend/workspaces/<chatId>/` que es una copia del scaffold Vite +
 * React + shadcn. La IA escribe sus archivos generados ahí. Al
 * "Publicar", corremos `npm run build` y copiamos el `dist/` resultante
 * a `backend/uploads/studio-dist/<chatId>/`, servido como estatico por
 * el backend (Nest already useStaticAssets /uploads).
 *
 * node_modules NO se copia por proyecto: se mantiene un solo `node_modules`
 * en `backend/scaffolds/plia-studio-base/` (instalado una sola vez con
 * `npm install` durante el setup) y cada workspace lo accede via symlink.
 * Asi cada proyecto pesa <1MB en disco y el init es instantaneo.
 *
 * El usuario debe correr UNA vez en el server:
 *   cd backend/scaffolds/plia-studio-base && npm install
 * Despues cada publish toma 15-30 seg (solo vite build).
 */
@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  private get scaffoldDir() {
    return join(process.cwd(), 'scaffolds', 'plia-studio-base');
  }

  private workspaceDir(chatId: number | string) {
    return join(process.cwd(), 'workspaces', String(chatId));
  }

  private deployDir(chatId: number | string) {
    return join(process.cwd(), 'uploads', 'studio-dist', String(chatId));
  }

  /**
   * Devuelve true si el scaffold tiene `node_modules` instalado.
   * Si no, los builds van a fallar y el caller debe instruir al admin.
   */
  isScaffoldReady(): boolean {
    return fs.existsSync(join(this.scaffoldDir, 'node_modules'));
  }

  /**
   * Inicializa el workspace de un proyecto: copia los archivos del
   * scaffold y crea un symlink a `node_modules` para no duplicar 500MB.
   * Idempotente: si ya existe, no hace nada (preserva edits previos).
   */
  init(chatId: number | string): string {
    const target = this.workspaceDir(chatId);
    if (fs.existsSync(target)) return target;

    if (!fs.existsSync(this.scaffoldDir)) {
      throw new BadRequestException(
        `Scaffold no encontrado en ${this.scaffoldDir}`,
      );
    }

    fs.mkdirSync(target, { recursive: true });

    // Copiar archivos del scaffold (excluyendo node_modules, dist, .git).
    this.copyRecursive(this.scaffoldDir, target, [
      'node_modules',
      'dist',
      '.git',
      'pnpm-lock.yaml',
    ]);

    // Symlink a node_modules del scaffold maestro.
    const masterNm = join(this.scaffoldDir, 'node_modules');
    const wsNm = join(target, 'node_modules');
    if (fs.existsSync(masterNm) && !fs.existsSync(wsNm)) {
      try {
        // junction en Windows (sin permisos admin), symlink dir en Linux.
        const type = process.platform === 'win32' ? 'junction' : 'dir';
        fs.symlinkSync(masterNm, wsNm, type);
      } catch (e: any) {
        this.logger.warn(
          `Symlink fallo, node_modules quedara faltante para chat=${chatId}: ${e?.message || e}. Corre npm install en el workspace.`,
        );
      }
    }

    this.logger.log(`Workspace iniciado: ${target}`);
    return target;
  }

  /**
   * Vuelca los archivos generados por la IA en el workspace.
   * Solo permite escritura dentro de `src/` y `public/` (anti
   * path-traversal y proteccion de package.json/tsconfig).
   */
  writeFiles(chatId: number | string, files: Record<string, string>) {
    const target = this.workspaceDir(chatId);
    if (!fs.existsSync(target)) {
      throw new BadRequestException(
        `Workspace no iniciado para chat=${chatId}. Llama init() primero.`,
      );
    }

    let written = 0;
    let skipped = 0;
    for (const [rawPath, content] of Object.entries(files)) {
      if (typeof content !== 'string') {
        skipped += 1;
        continue;
      }
      // Normalizar paths que la IA puede mandar con "/" inicial o "./".
      let rel = rawPath
        .replace(/^\.?\//, '')
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/');

      // Saltar metadata interna del iachat (no es codigo).
      if (rel.startsWith('__') || rel.startsWith('.iachat')) {
        skipped += 1;
        continue;
      }

      // COMPAT legacy Sprint 0: AppMain.tsx -> src/pages/Index.tsx (lo que
      // el App.tsx del scaffold actual realmente importa).
      if (/^(src\/)?AppMain\.tsx$/i.test(rel)) {
        rel = 'src/pages/Index.tsx';
      }

      // Solo permitir src/ y public/ (proteger package.json/configs).
      if (!/^(src|public)\//.test(rel)) {
        this.logger.warn(`writeFiles skip fuera de src/public: ${rawPath}`);
        skipped += 1;
        continue;
      }

      const filePath = join(target, rel);
      // Anti path traversal: el resuelto debe seguir dentro del target.
      if (!filePath.startsWith(target + sep) && filePath !== target) {
        this.logger.warn(`writeFiles skip path-traversal: ${rawPath}`);
        skipped += 1;
        continue;
      }

      fs.mkdirSync(dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf-8');
      written += 1;
    }
    this.logger.log(
      `writeFiles chat=${chatId} written=${written} skipped=${skipped}`,
    );
  }

  /**
   * Corre `npm run build` en el workspace. Devuelve la ruta del dist.
   * Lanza si la salida no produce dist/index.html.
   */
  build(chatId: number | string): string {
    const target = this.workspaceDir(chatId);
    if (!fs.existsSync(target)) {
      throw new BadRequestException(
        `Workspace no iniciado para chat=${chatId}.`,
      );
    }
    if (!this.isScaffoldReady()) {
      throw new BadRequestException(
        'El scaffold de PLIA Studio aun no tiene node_modules instalado. Pidele al admin que corra `npm install` en backend/scaffolds/plia-studio-base/.',
      );
    }

    try {
      const out = execFileSync('npm', ['run', 'build'], {
        cwd: target,
        timeout: 240_000, // 4 min hard cap
        stdio: ['ignore', 'pipe', 'pipe'],
        // Windows necesita shell para resolver npm.cmd; Linux no lo necesita
        // pero tampoco lo rompe.
        shell: process.platform === 'win32',
      });
      this.logger.log(
        `build chat=${chatId} OK. Output:\n${out.toString().slice(-1500)}`,
      );
    } catch (err: any) {
      const stderr = (err?.stderr || err?.stdout || '').toString();
      this.logger.error(
        `build chat=${chatId} FALLO: ${err?.message || err}\n${stderr.slice(-2000)}`,
      );
      throw new BadRequestException(
        `Build fallo: ${stderr.slice(-800) || err?.message}`,
      );
    }

    const distDir = join(target, 'dist');
    if (!fs.existsSync(join(distDir, 'index.html'))) {
      throw new BadRequestException(
        'El build no produjo dist/index.html. Revisa los logs.',
      );
    }
    return distDir;
  }

  /**
   * Despliega el dist al directorio servido como estatico por Nest:
   * `uploads/studio-dist/<chatId>/`. Vite ya emite paths relativos
   * (base: "./") y el SPA usa HashRouter, asi que funciona desde
   * cualquier subpath. Retorna la URL publica resultante.
   */
  deployLocal(chatId: number | string): string {
    const distDir = join(this.workspaceDir(chatId), 'dist');
    if (!fs.existsSync(distDir)) {
      throw new BadRequestException('No hay dist/ para deployar. Build primero.');
    }
    const target = this.deployDir(chatId);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    fs.mkdirSync(target, { recursive: true });
    this.copyRecursive(distDir, target);

    const apiBase = (process.env.PREVIEW_PROXY_BASE || process.env.APP_URL || 'http://localhost:3002').replace(/\/$/, '');
    const url = `${apiBase}/uploads/studio-dist/${chatId}/index.html`;
    this.logger.log(`deployLocal chat=${chatId} -> ${url}`);
    return url;
  }

  /**
   * Despliega el dist al public_html de un dominio CyberPanel (cuando el
   * cliente conecta su propio dominio a este proyecto iachatweb).
   * Borra el contenido previo (preserva .well-known para Let's Encrypt).
   */
  deployToCyberPanel(chatId: number | string, domain: string): string {
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      throw new BadRequestException('Dominio invalido.');
    }
    const distDir = join(this.workspaceDir(chatId), 'dist');
    if (!fs.existsSync(distDir)) {
      throw new BadRequestException('No hay dist/ para deployar. Build primero.');
    }
    const sitesRoot = process.env.CYBERPANEL_SITES_ROOT || '/home';
    const publicDir = process.env.CYBERPANEL_PUBLIC_DIR || 'public_html';
    const target = join(sitesRoot, domain, publicDir);
    if (!fs.existsSync(target)) {
      throw new BadRequestException(
        `Directorio publico no existe: ${target}. Crea el sitio en CyberPanel primero.`,
      );
    }
    this.cleanDirPreserving(target, ['.well-known']);
    this.copyRecursive(distDir, target);
    this.logger.log(`deployToCyberPanel chat=${chatId} -> ${domain}`);
    return `https://${domain}`;
  }

  // ─── helpers privados ─────────────────────────────────────────────

  private copyRecursive(src: string, dst: string, exclude: string[] = []) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      if (exclude.includes(entry.name)) continue;
      const s = join(src, entry.name);
      const d = join(dst, entry.name);
      if (entry.isDirectory()) {
        this.copyRecursive(s, d, exclude);
      } else if (entry.isSymbolicLink()) {
        // Resolver el symlink y copiar el destino (no el link).
        try {
          const realSrc = fs.realpathSync(s);
          if (fs.statSync(realSrc).isDirectory()) {
            this.copyRecursive(realSrc, d, exclude);
          } else {
            fs.copyFileSync(realSrc, d);
          }
        } catch {
          /* ignore broken symlinks */
        }
      } else {
        fs.copyFileSync(s, d);
      }
    }
  }

  private cleanDirPreserving(rootPath: string, preserve: string[] = []) {
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
      return;
    }
    for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      if (preserve.includes(entry.name)) continue;
      fs.rmSync(join(rootPath, entry.name), { recursive: true, force: true });
    }
  }
}
