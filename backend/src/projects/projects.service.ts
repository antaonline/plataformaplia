import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { ProjectStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { addDays, addHours } from 'date-fns';
import { AiService } from '../ai/ai.service';
import { enforceContactForms } from '../ai/contact-form-enforcer';
import { CyberpanelService } from '../integrations/cyberpanel/cyberpanel.service';
import { MailService } from '../mail/mail.service';
import * as fs from 'fs';
import { join } from 'path';

const LANDING_DEVELOPMENT_HOURS = 24;
const WEB_DEVELOPMENT_DAYS = 2;

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private cyberpanelService: CyberpanelService,
    private mailService: MailService,
  ) {}

  private normalizeSubdomain(value: unknown, baseDomain?: string) {
    let raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    const suffix = (baseDomain || process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe')
      .trim()
      .toLowerCase();

    raw = raw.replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (suffix && raw.endsWith(`.${suffix}`)) {
      raw = raw.slice(0, -(`.${suffix}`.length));
    }

    const cleaned = raw
      .normalize('NFD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    if (!cleaned || cleaned.length < 3) return '';
    return cleaned.slice(0, 30);
  }

  private hasGeneratedOutput(projectId: number, onboardingData: any) {
    const aiGeneration = onboardingData?.aiGeneration || {};
    if (aiGeneration.status !== 'READY') {
      return false;
    }

    // AHORA: Verificamos que exista la salida en la carpeta de previsualizacion
    // ya que la escritura en public_html se pospone hasta la publicacion oficial.
    const previewIndex = join(process.cwd(), 'uploads', 'previews', String(projectId), 'index.html');
    const hasPreview = fs.existsSync(previewIndex);
    
    return hasPreview;
  }

  private copyFolderRecursive(source: string, target: string) {
    if (!fs.existsSync(source)) {
      this.logger.error(`Source directory does not exist: ${source}`);
      return;
    }
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    for (const file of files) {
      const curSource = join(source, file);
      const curTarget = join(target, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        this.copyFolderRecursive(curSource, curTarget);
      } else {
        fs.copyFileSync(curSource, curTarget);
        // this.logger.log(`Copied ${file} to ${target}`);
      }
    }
  }

  /**
   * Migra los assets generados (imagenes IA) del directorio compartido de
   * uploads/ al hosting del cliente y reescribe el HTML para que apunte a
   * rutas relativas. Luego limpia los archivos en uploads/ para que el
   * almacenamiento del servidor de PLIA no crezca con assets que ya viven
   * en el hosting del cliente. Una vez publicado, los archivos son
   * 100% del cliente.
   *
   * Estructura resultante en public_html del cliente:
   *   public_html/
   *     index.html (y otros .html)
   *     assets/
   *       images/
   *         hero-0.webp, tcg-1.webp, etc.
   */
  private migrateAssetsToHosting(projectId: number, targetDir: string) {
    const previewRoot = join(process.cwd(), 'uploads', 'previews', String(projectId));
    const generatedRoot = join(process.cwd(), 'uploads', 'generated', String(projectId));

    let imagesCopied = 0;

    // 1) Copiar todas las imagenes a public_html/assets/images/
    if (fs.existsSync(generatedRoot)) {
      const targetAssetsDir = join(targetDir, 'assets', 'images');
      try {
        fs.mkdirSync(targetAssetsDir, { recursive: true });
        for (const file of fs.readdirSync(generatedRoot)) {
          const src = join(generatedRoot, file);
          if (fs.lstatSync(src).isFile()) {
            fs.copyFileSync(src, join(targetAssetsDir, file));
            imagesCopied += 1;
          }
        }
        this.logger.log(
          `Migrados ${imagesCopied} assets a ${targetAssetsDir} para project=${projectId}`,
        );
      } catch (err: any) {
        this.logger.error(
          `Error copiando assets a ${targetAssetsDir} para project=${projectId}: ${err?.message || err}`,
        );
      }
    }

    // 2) Reescribir referencias absolutas a relativas en cada .html del hosting.
    //    Captura cualquier URL del tipo:
    //      https://api.plia.pe/uploads/generated/<projectId>/<archivo>
    //      http://...:3002/uploads/generated/<projectId>/<archivo>
    //    y la convierte a "assets/images/<archivo>".
    if (fs.existsSync(targetDir)) {
      const absoluteUrlRegex = new RegExp(
        `https?://[^/'"\\s)]+/uploads/generated/${projectId}/([^'"\\s)]+)`,
        'g',
      );
      let htmlRewrites = 0;
      for (const file of fs.readdirSync(targetDir)) {
        if (!/\.html?$/i.test(file)) continue;
        const filePath = join(targetDir, file);
        try {
          const before = fs.readFileSync(filePath, 'utf-8');
          const after = before.replace(absoluteUrlRegex, 'assets/images/$1');
          if (after !== before) {
            fs.writeFileSync(filePath, after, 'utf-8');
            htmlRewrites += 1;
          }
        } catch (err: any) {
          this.logger.warn(
            `No se pudo reescribir ${filePath}: ${err?.message || err}`,
          );
        }
      }
      this.logger.log(
        `Reescritas ${htmlRewrites} paginas HTML con paths relativos para project=${projectId}`,
      );
    }

    // 3) Limpiar uploads/generated y uploads/previews del servidor PLIA.
    //    El cliente ya tiene todo en su hosting; no duplicamos almacenamiento.
    for (const dir of [generatedRoot, previewRoot]) {
      try {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
          this.logger.log(`Limpieza: eliminado ${dir}`);
        }
      } catch (err: any) {
        this.logger.warn(
          `No se pudo eliminar ${dir} tras publicacion: ${err?.message || err}`,
        );
      }
    }
  }

  private buildPreviewUrl(projectId: number) {
    // Los /uploads los sirve el backend, no el frontend (APP_URL).
    const appUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
    return `${appUrl}/uploads/previews/${projectId}/index.html`;
  }

  /**
   * HTML de la landing temporal "en desarrollo" que ve el cliente durante
   * las 24h de espera. Incluye cuenta regresiva en vivo hasta el deadline
   * y botones de contacto (WhatsApp/Instagram/Facebook) si el cliente los
   * proporciono en el onboarding.
   */
  private buildTempLandingHtml(
    data: any,
    deadline: Date | null,
    fallbackName: string,
  ): string {
    const esc = (s: any) =>
      String(s ?? '').replace(/[&<>"']/g, (c) =>
        (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]),
      );

    const businessName = esc(data?.businessName || fallbackName || 'Tu sitio web');
    const deadlineMs =
      (deadline instanceof Date && !isNaN(deadline.getTime()))
        ? deadline.getTime()
        : Date.now() + 24 * 60 * 60 * 1000;
    const deadlineIso = new Date(deadlineMs).toISOString();

    const contactButtons: string[] = [];

    if (data?.whatsapp) {
      const num = String(data.whatsapp).replace(/[^0-9]/g, '');
      if (num.length >= 8) {
        contactButtons.push(
          `<a href="https://wa.me/${num}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 rounded-full text-sm font-medium transition"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5C18.3 1.3 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12 0-3.2-1.3-6.3-3.5-8.4zM12 21.8c-1.8 0-3.6-.5-5.2-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.5-1.5-5.4 0-5.5 4.5-10 10-10 2.7 0 5.2 1 7.1 2.9 1.9 1.9 2.9 4.4 2.9 7.1 0 5.5-4.5 10-10 10z"/></svg>WhatsApp</a>`,
        );
      }
    }

    if (data?.instagram) {
      const user = String(data.instagram)
        .replace(/^@/, '')
        .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
        .replace(/\/+$/, '')
        .trim();
      if (user) {
        contactButtons.push(
          `<a href="https://instagram.com/${esc(user)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/30 rounded-full text-sm font-medium transition"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.42-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.37-1.06-.42-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.37 2.23-.42 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.69.93 3.36.62 4.14.32 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.35 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.35 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13C21.31 1.34 20.64.93 19.86.62c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16s2.76 6.16 6.16 6.16 6.16-2.76 6.16-6.16S15.4 5.84 12 5.84zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>Instagram</a>`,
        );
      }
    }

    if (data?.facebook) {
      let fb = String(data.facebook).trim();
      if (!/^https?:\/\//i.test(fb)) {
        fb = /^facebook\.com\//i.test(fb)
          ? `https://${fb}`
          : `https://facebook.com/${fb.replace(/^@/, '')}`;
      }
      contactButtons.push(
        `<a href="${esc(fb)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 rounded-full text-sm font-medium transition"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.09 24 12.07z"/></svg>Facebook</a>`,
      );
    }

    const contactsBlock = contactButtons.length
      ? `<div class="mt-10 pt-8 border-t border-white/10"><p class="text-sm text-slate-400 mb-4">Mientras tanto, contactanos:</p><div class="flex flex-wrap gap-3 justify-center">${contactButtons.join('')}</div></div>`
      : '';

    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${businessName} | En desarrollo</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>body{font-family:'Inter',sans-serif;}</style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
<main class="min-h-screen flex flex-col items-center justify-center px-6 py-12">
<div class="max-w-2xl w-full text-center">
<div class="inline-flex items-center justify-center mb-8">
<img src="https://plia.pe/iconblack-plia.svg" alt="PLIA" width="88" height="88" style="display:block;width:88px;height:88px;border-radius:18px;filter:drop-shadow(0 0 24px rgba(191,255,0,0.35));" class="animate-pulse" />
</div>
<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">${businessName}</h1>
<p class="mt-4 text-xl md:text-2xl text-slate-300 font-semibold">Estamos trabajando en tu sitio web</p>
<p class="mt-2 text-sm text-slate-400">Nuestro equipo esta construyendo tu web profesional</p>
<div class="mt-12">
<p class="text-sm uppercase tracking-wider text-slate-400">Estara disponible en</p>
<div class="mt-4 inline-flex justify-center gap-3 md:gap-5">
<div class="flex flex-col items-center min-w-[78px] px-3 py-3 rounded-2xl bg-white/5 border border-white/10"><span id="cd-hours" class="text-4xl md:text-5xl font-bold tabular-nums leading-none">--</span><span class="text-[10px] uppercase tracking-wider text-slate-400 mt-2">horas</span></div>
<div class="flex flex-col items-center min-w-[78px] px-3 py-3 rounded-2xl bg-white/5 border border-white/10"><span id="cd-mins" class="text-4xl md:text-5xl font-bold tabular-nums leading-none">--</span><span class="text-[10px] uppercase tracking-wider text-slate-400 mt-2">minutos</span></div>
<div class="flex flex-col items-center min-w-[78px] px-3 py-3 rounded-2xl bg-white/5 border border-white/10"><span id="cd-secs" class="text-4xl md:text-5xl font-bold tabular-nums leading-none">--</span><span class="text-[10px] uppercase tracking-wider text-slate-400 mt-2">segundos</span></div>
</div>
</div>
${contactsBlock}
<footer class="mt-16 text-xs text-slate-500">Sitio en construccion por <span class="text-lime-400 font-semibold">PLIA</span> &middot; Tu Web Facil</footer>
</div>
</main>
<script>
(function(){
var deadline = new Date(${JSON.stringify(deadlineIso)}).getTime();
var hEl = document.getElementById('cd-hours');
var mEl = document.getElementById('cd-mins');
var sEl = document.getElementById('cd-secs');
function pad(n){return String(n).padStart(2,'0');}
function tick(){
var diff = Math.max(0, deadline - Date.now());
var totalSecs = Math.floor(diff/1000);
var h = Math.floor(totalSecs/3600);
var m = Math.floor((totalSecs%3600)/60);
var s = totalSecs%60;
hEl.textContent = pad(h);
mEl.textContent = pad(m);
sEl.textContent = pad(s);
if(diff===0){clearInterval(timer);setTimeout(function(){location.reload();},2000);}
}
tick();
var timer = setInterval(tick,1000);
})();
</script>
</body>
</html>`;
  }

  /**
   * Escribe la landing temporal a uploads/preview-temp/<id>/index.html y
   * retorna la URL publica servida por el backend. Esta landing se ve
   * durante las 24h de espera. No se mezcla con uploads/previews/ (donde
   * la IA escribe el sitio real) para evitar colisiones.
   */
  private writeTempLanding(
    projectId: number,
    data: any,
    deadline: Date | null,
    fallbackName: string,
  ): string {
    const html = this.buildTempLandingHtml(data, deadline, fallbackName);
    const dir = join(process.cwd(), 'uploads', 'preview-temp', String(projectId));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(join(dir, 'index.html'), html, 'utf-8');
    const baseUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
    return `${baseUrl}/uploads/preview-temp/${projectId}/index.html`;
  }

  private getTargetDirectory(projectId: number, onboardingData: any) {
    const aiGeneration = onboardingData?.aiGeneration || {};
    if (typeof aiGeneration.target === 'string' && aiGeneration.target.trim()) {
      return aiGeneration.target.trim();
    }

    const domain = typeof onboardingData?.publicDomain === 'string' ? onboardingData.publicDomain.trim() : '';
    if (!domain) {
      return null;
    }

    const root = process.env.CYBERPANEL_SITES_ROOT || '/home';
    const publicDir = process.env.CYBERPANEL_PUBLIC_DIR || 'public_html';
    return join(root, domain, publicDir);
  }

  private async getProjectOrThrow(projectId: number, userId?: number, isAdmin = false) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        order: { include: { plan: true } },
        user: true,
        subscription: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    if (!isAdmin && userId && project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    return project;
  }

  async getGenerationDiagnostics(projectId: number, userId?: number, isAdmin = false) {
    const project = await this.getProjectOrThrow(projectId, userId, isAdmin);
    const onboardingData = JSON.parse((project.onboardingData as string) || '{}');
    const aiGeneration = onboardingData.aiGeneration || {};
    const cyberpanel = onboardingData.cyberpanel || {};
    const previewPath = join(process.cwd(), 'uploads', 'previews', String(projectId), 'index.html');
    const previewExists = fs.existsSync(previewPath);
    const targetDir = this.getTargetDirectory(projectId, onboardingData);
    const targetIndexPath = targetDir ? join(targetDir, 'index.html') : null;
    const targetExists = targetIndexPath ? fs.existsSync(targetIndexPath) : false;

    return {
      projectId: project.id,
      projectName: project.name,
      type: project.type,
      status: project.status,
      publicDomain: onboardingData.publicDomain ?? null,
      publicUrl: onboardingData.publicUrl ?? null,
      aiGeneration: {
        status: aiGeneration.status ?? null,
        error: aiGeneration.error ?? null,
        mode: aiGeneration.mode ?? null,
        model: aiGeneration.model ?? null,
        startedAt: aiGeneration.startedAt ?? null,
        updatedAt: aiGeneration.updatedAt ?? null,
        finishedAt: aiGeneration.finishedAt ?? null,
        previewUrl: aiGeneration.previewUrl ?? (previewExists ? this.buildPreviewUrl(projectId) : null),
      },
      cyberpanel: {
        status: cyberpanel.status ?? null,
        error: cyberpanel.error ?? null,
        owner: cyberpanel.owner ?? null,
        requestedDomain: cyberpanel.requestedDomain ?? null,
      },
      filesystem: {
        previewPath,
        previewExists,
        targetDir,
        targetIndexPath,
        targetExists,
      },
      outputVerified: this.hasGeneratedOutput(projectId, onboardingData),
    };
  }

  async runManualGeneration(projectId: number, userId?: number, isAdmin = false, reprovision = false) {
    let project = await this.getProjectOrThrow(projectId, userId, isAdmin);

    if (reprovision || !JSON.parse((project.onboardingData as string) || '{}')?.publicDomain) {
      const provision = await this.cyberpanelService.ensureSite(projectId);
      project = await this.getProjectOrThrow(projectId, userId, isAdmin);
      const projectData = JSON.parse((project.onboardingData as string) || '{}');
      if (!provision.domain && !projectData?.publicDomain) {
        const cyberpanelError =
          projectData?.cyberpanel?.error ||
          'No se pudo crear el subdominio en CyberPanel. La generación no puede publicarse.';
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: JSON.stringify({
              ...projectData,
              aiGeneration: {
                ...(projectData.aiGeneration || {}),
                status: 'FAILED',
                error: cyberpanelError,
                updatedAt: new Date().toISOString(),
              },
            }),
          },
        });
        throw new BadRequestException(cyberpanelError);
      }
    }

    await this.aiService.generateForProject(projectId);
    return this.getGenerationDiagnostics(projectId, userId, isAdmin);
  }

  // ✅ ONBOARDING POR PASOS (CORRECTO)
  async saveOnboarding(projectId: number, dto: SaveOnboardingDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        order: { include: { plan: true } },
        user: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    const existingData = JSON.parse((project.onboardingData as string) || '{}');

    const normalizedSubdomain = this.normalizeSubdomain(
      dto?.data?.subdomain ?? existingData?.subdomain,
    );

    const mergedData = {
      ...existingData,
      ...dto.data,
      ...(normalizedSubdomain ? { subdomain: normalizedSubdomain } : {}),
    };

    const shouldStart = dto.completed === true;
    const startedAt = project.startedAt ?? (shouldStart ? new Date() : null);
    let deadline = project.deadline ?? null;

    if (shouldStart) {
      const isLanding =
        project.type === 'LANDING' ||
        project.order?.plan?.slug?.toLowerCase().includes('landing') ||
        project.order?.plan?.name?.toLowerCase().includes('landing');

      if (isLanding) {
        deadline = addHours(new Date(), LANDING_DEVELOPMENT_HOURS);
      } else {
        deadline = addDays(new Date(), WEB_DEVELOPMENT_DAYS);
      }
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
        onboardingStep: dto.step,
        status: dto.completed
          ? ProjectStatus.IN_PROGRESS
          : ProjectStatus.IN_PROGRESS,
        startedAt,
        deadline,
        completedAt: null,
      } as Prisma.ProjectUpdateInput,
    });

    if (shouldStart) {
      this.logger.log(
        `Onboarding project=${projectId} rawSubdomain=${JSON.stringify(
          dto?.data?.subdomain ?? null,
        )} normalizedSubdomain=${JSON.stringify(normalizedSubdomain || null)} storedSubdomain=${JSON.stringify(
          (mergedData as any).subdomain ?? null,
        )}`,
      );
      let cyberpanelProvision: any;
      try {
        cyberpanelProvision = await this.cyberpanelService.ensureSite(projectId);
      } catch (cpErr: any) {
        // Si ensureSite lanza (no debe tras los try/catch internos, pero por
        // si acaso), persistimos el error visible para no dejar el proyecto
        // mudo en "En progreso".
        const errMsg = cpErr?.message || 'Error desconocido en CyberPanel.';
        this.logger.error(
          `saveOnboarding project=${projectId}: ensureSite lanzo: ${errMsg}`,
          cpErr?.stack,
        );
        const currentRaw = (await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { onboardingData: true },
        }))?.onboardingData;
        const current = JSON.parse((currentRaw as string) || JSON.stringify(mergedData));
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: JSON.stringify({
              ...current,
              cyberpanel: {
                ...(current?.cyberpanel || {}),
                status: 'FAILED',
                stage: 'saveOnboarding.ensureSite',
                error: errMsg,
                updatedAt: new Date().toISOString(),
              },
              aiGeneration: {
                ...(current?.aiGeneration || {}),
                status: 'FAILED',
                error: `No se pudo crear el subdominio en CyberPanel: ${errMsg}`,
                updatedAt: new Date().toISOString(),
              },
            }),
          },
        });
        throw new BadRequestException(
          `No se pudo crear el subdominio en CyberPanel: ${errMsg}`,
        );
      }
      const refreshedProject = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { onboardingData: true },
      });
      const refreshedData = JSON.parse((refreshedProject?.onboardingData as string) || JSON.stringify(mergedData));
      const resolvedDomain = cyberpanelProvision.domain || refreshedData.publicDomain || null;
      if (!resolvedDomain) {
        const cyberpanelError =
          refreshedData?.cyberpanel?.error ||
          'No se pudo crear el subdominio en CyberPanel. La generación IA se detuvo.';
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: JSON.stringify({
              ...refreshedData,
              aiGeneration: {
                ...(refreshedData.aiGeneration || {}),
                status: 'FAILED',
                error: cyberpanelError,
                updatedAt: new Date().toISOString(),
              },
            }),
          },
        });
        throw new BadRequestException(cyberpanelError);
      }
      if (
        cyberpanelProvision.createdWebsite &&
        cyberpanelProvision.accountCreated &&
        cyberpanelProvision.account &&
        cyberpanelProvision.plainPassword &&
        project.user?.email
      ) {
        const loginUrl = `${process.env.APP_URL ?? 'http://localhost:3001'}/login`;
        await this.mailService.sendProjectReady(project.user.email, {
          projectName: project.name,
          loginUrl,
          hostingAccess: {
            panelUrl: cyberpanelProvision.account.panelUrl,
            username: cyberpanelProvision.account.username,
            password: cyberpanelProvision.plainPassword,
          },
        });
      }

      // Landing temporal con cuenta regresiva: el cliente la ve en "Tu web"
      // durante las 24h de espera, hasta que el cron publica el sitio real
      // al cumplirse el deadline. Si esto falla, no bloqueamos el resto.
      try {
        const tempLandingUrl = this.writeTempLanding(
          projectId,
          refreshedData,
          deadline,
          project.name,
        );
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: JSON.stringify({
              ...refreshedData,
              tempLandingUrl,
            }),
          },
        });
      } catch (tempErr: any) {
        this.logger.warn(
          `saveOnboarding project=${projectId}: no se pudo escribir la landing temporal: ${tempErr?.message || tempErr}`,
        );
      }

      void this.aiService.generateForProject(projectId).catch((err) => {
        this.logger.error(`Error en la generación automática de IA para el proyecto ${projectId}: ${err.message}`, err.stack);
      });
    }

    return updated;
  }

  // ✅ CREAR PROYECTO DESDE ORDEN (CORRECTO)
  async createFromOrder(orderOrId: any) {
    const order =
      typeof orderOrId === 'number'
        ? await this.prisma.order.findUnique({ where: { id: orderOrId }, include: { plan: true } })
        : orderOrId;

    if (!order) {
      throw new NotFoundException('Order no encontrada');
    }
    if (!order.userId) {
      throw new BadRequestException('Order sin usuario');
    }

    // Si el order llego como objeto sin la relacion plan (p.ej. desde
    // payments.service), la cargamos por planId para poder detectar
    // correctamente si el plan es LANDING. Sin esto el proyecto quedaba
    // como WEB por defecto y la generacion de IA fallaba.
    let plan = order.plan;
    if (!plan && order.planId) {
      plan = await this.prisma.plan.findUnique({
        where: { id: order.planId },
      });
    }

    // Determinar tipo por slug o nombre if available
    const planSlug = plan?.slug?.toLowerCase() || '';
    const planName = plan?.name?.toLowerCase() || '';
    const isLanding =
      planSlug.includes('landing') || planName.includes('landing') || order.planId === 1;

    return this.prisma.project.create({
      data: {
        name: `Proyecto ${order.id}`,
        type: isLanding ? 'LANDING' : 'WEB',
        status: ProjectStatus.WAITING_INFO,

        user: {
          connect: { id: order.userId },
        },

        order: {
          connect: { id: order.id },
        },
      },
    });
  }


  async listByUser(userId: number) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        order: { include: { plan: true } },
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.project.findFirst({
      where: { userId },
      include: {
        order: {
          include: {
            plan: true,
          },
        },
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProjectByUser(projectId: number, userId: number) {
    return this.prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        order: {
          include: {
            plan: true,
          },
        },
        subscription: true,
      },
    });
  }

  async listForAdmin() {
    return this.prisma.project.findMany({
      include: {
        user: true,
        order: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForAdmin(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        order: {
          include: { plan: true },
        },
      },
    });
  }

  async publishProject(id: number, data: { publicUrl?: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    if (project.status === ProjectStatus.DELIVERED) {
      return project;
    }

    const currentData = JSON.parse((project.onboardingData as string) || '{}');
    if (!this.hasGeneratedOutput(project.id, currentData)) {
      throw new BadRequestException(
        'El sitio aun no fue generado y verificado correctamente. No se puede publicar.',
      );
    }

    const publishedAt = new Date();
    const revisionsAllowed = project.type === 'LANDING' ? 1 : 2;
    const revisionWindowEndsAt = addHours(publishedAt, 48);

    // LOGICA DE PUBLICACION FISICA: Copiar de previews a public_html
    const aiGeneration = currentData.aiGeneration || {};
    const previewRoot = join(process.cwd(), 'uploads', 'previews', String(id));
    const targetDir = aiGeneration.target;

    if (targetDir && fs.existsSync(previewRoot)) {
      try {
        this.logger.log(`Publicando archivos fisicos para proyecto ${id} en ${targetDir}...`);
        this.copyFolderRecursive(previewRoot, targetDir);
        this.logger.log(`Publicacion fisica exitosa para proyecto ${id}.`);
        // Tras copiar el HTML, migrar imagenes generadas + reescribir paths
        // + limpiar uploads/ para que el cliente tenga TODO en su hosting
        // y nuestro servidor no duplique el almacenamiento.
        this.migrateAssetsToHosting(id, targetDir);
      } catch (err: any) {
        this.logger.error(`Error al copiar archivos a public_html para proyecto ${id}: ${err.message}`);
        throw new Error(`Fallo la copia fisica de archivos: ${err.message}`);
      }
    } else {
      this.logger.warn(`Proyecto ${id} no tiene targetDir (${targetDir}) o previewRoot (${previewRoot}) no existe. Se omite copia fisica.`);
    }

    const mergedData = {
      ...currentData,
      ...(data.publicUrl
        ? { publicUrl: data.publicUrl }
        : currentData.publicDomain
          ? { publicUrl: `https://${currentData.publicDomain}` }
          : {}),
      publishedAt: publishedAt.toISOString(),
      revisionsAllowed,
      revisionWindowEndsAt: revisionWindowEndsAt.toISOString(),
    };

    return this.prisma.project.update({
      where: { id },
      data: {
        onboardingData: JSON.stringify(mergedData),
        status: ProjectStatus.DELIVERED,
        completed: true,
        completedAt: publishedAt,
      },
    });
  }

  /**
   * Retro-aplica enforceContactForms a TODOS los HTML del sitio publicado.
   * Lee /home/<dominio>/public_html, parchea cada .html, lo escribe de
   * vuelta. Util para arreglar sitios viejos donde la IA genero forms
   * rotos (sin action, sin handler, con names en espanol). No regenera
   * con IA — es un fix textual local, casi instantaneo.
   */
  async fixContactFormForProject(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project no encontrado.');

    const onboarding = JSON.parse((project.onboardingData as string) || '{}');
    const domain = onboarding?.publicDomain;
    if (!domain) {
      throw new BadRequestException(
        'El proyecto no esta publicado (sin publicDomain).',
      );
    }
    const sitesRoot = process.env.CYBERPANEL_SITES_ROOT || '/home';
    const publicDir = process.env.CYBERPANEL_PUBLIC_DIR || 'public_html';
    const targetDir = `${sitesRoot}/${domain}/${publicDir}`;
    if (!fs.existsSync(targetDir)) {
      throw new BadRequestException(
        `No existe el directorio publicado: ${targetDir}`,
      );
    }

    const apiBase = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
    const formEndpoint = `${apiBase}/api/site-contact/${projectId}`;

    const htmlFiles = fs
      .readdirSync(targetDir)
      .filter((f) => /\.html$/i.test(f));
    let changed = 0;
    for (const f of htmlFiles) {
      const full = `${targetDir}/${f}`;
      const orig = fs.readFileSync(full, 'utf-8');
      const fixed = enforceContactForms(orig, formEndpoint);
      if (fixed !== orig) {
        fs.writeFileSync(full, fixed, 'utf-8');
        changed += 1;
      }
    }
    return {
      ok: true,
      domain,
      filesScanned: htmlFiles.length,
      filesUpdated: changed,
      formEndpoint,
    };
  }

  async configureDb(id: number, data: { dbName?: string; dbUser?: string; dbPassword?: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    const existingData = JSON.parse((project.onboardingData as string) || '{}');
    const mergedData = {
      ...existingData,
      dbConfigured: true,
      dbName: data.dbName ?? null,
      dbUser: data.dbUser ?? null,
      dbPassword: data.dbPassword ?? null,
    };

    return this.prisma.project.update({
      where: { id },
      data: {
        onboardingData: JSON.stringify(mergedData),
      },
    });
  }

  async saveLogo(projectId: number, userId: number, logoUrl: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    const currentData = JSON.parse((project.onboardingData as string) || '{}');
    const mergedData = { ...currentData, logoUrl };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
      },
    });
  }

  async saveMedia(projectId: number, userId: number, urls: string[]) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    if (urls.length > 5) {
      throw new BadRequestException('Solo puedes subir hasta 5 imagenes en total.');
    }
    const data = JSON.parse((project.onboardingData as string) || '{}');
    const mergedData = { ...data, images: urls };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
      },
    });
  }

  async saveDocument(projectId: number, userId: number, fieldKey: string, documentUrl: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    const currentData = JSON.parse((project.onboardingData as string) || '{}');
    const mergedData = {
      ...currentData,
      [fieldKey]: documentUrl,
    };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
      },
    });
  }

  async requestRevision(projectId: number, userId: number, message: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { order: true, user: true },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    const data = JSON.parse((project.onboardingData as string) || '{}');
    const publishedAtRaw = data.publishedAt;
    if (!publishedAtRaw) {
      throw new BadRequestException('El proyecto aun no esta publicado.');
    }

    const publishedAt = new Date(publishedAtRaw);
    const windowEndsAt = addHours(publishedAt, 48);
    if (new Date() > windowEndsAt) {
      throw new BadRequestException('El periodo de cambios ya vencio.');
    }

    const allowed = project.type === 'LANDING' ? 1 : 2;
    const existing = Array.isArray(data.revisionRequests) ? data.revisionRequests : [];
    if (existing.length >= allowed) {
      throw new BadRequestException('Ya alcanzaste el limite de revisiones.');
    }

    const next = [
      ...existing,
      {
        message,
        createdAt: new Date().toISOString(),
      },
    ];

    const mergedData = {
      ...data,
      revisionRequests: next,
      revisionWindowEndsAt: windowEndsAt.toISOString(),
      revisionsAllowed: allowed,
    };

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
      },
    });

    void this.aiService.generateForProject(projectId, message);

    // Acuse de recibo al cliente. No bloqueamos si el SMTP falla.
    if (project.user?.email) {
      const appBase = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
      void this.mailService.sendRevisionAcknowledged(project.user.email, {
        projectName: project.name,
        businessName: data.businessName,
        revisionMessage: message,
        revisionsLeft: Math.max(0, allowed - next.length),
        revisionsAllowed: allowed,
        dashboardUrl: `${appBase}/dashboard/detalles-proyecto/${projectId}`,
      });
    }

    return updated;
  }

  async autoPublishReadyProjects() {
    const readyProjects = await this.prisma.project.findMany({
      where: {
        status: ProjectStatus.IN_PROGRESS,
        deadline: { lte: new Date() },
      },
      include: {
        user: true,
      },
    });

    for (const project of readyProjects) {
      try {
        const data = JSON.parse((project.onboardingData as string) || '{}');

        this.logger.log(`Procesando auto-publicacion para proyecto ${project.id} (${project.name})...`);

        // AUTO-REPARACION: si la IA no quedo lista (fallo, nunca corrio por
        // un reinicio, o no dejo preview), en vez de saltar para siempre
        // RE-DISPARAMOS la generacion. Con tope de intentos para no loopear.
        const aiReady =
          data.aiGeneration?.status === 'READY' &&
          this.hasGeneratedOutput(project.id, data);

        if (!aiReady) {
          const MAX_RETRIES = 3;
          const retries = Number(data.aiGeneration?.autoRetries || 0);

          if (retries >= MAX_RETRIES) {
            this.logger.error(
              `Proyecto ${project.id}: IA no se completo tras ${retries} reintentos. Marcado FAILED.`,
            );
            await this.prisma.project.update({
              where: { id: project.id },
              data: {
                onboardingData: JSON.stringify({
                  ...data,
                  aiGeneration: {
                    ...(data.aiGeneration || {}),
                    status: 'FAILED',
                    error:
                      'La generacion automatica no pudo completarse tras varios intentos. Reintenta o contacta soporte.',
                    updatedAt: new Date().toISOString(),
                  },
                }),
              },
            });
            // Alerta interna al admin para intervenir antes de que el cliente
            // se queje. No bloquea el cron.
            const adminBase = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
            void this.mailService.sendProjectFailed({
              projectId: project.id,
              projectName: project.name,
              customerEmail: project.user?.email,
              errorMessage:
                data.aiGeneration?.error ||
                'La generacion automatica no pudo completarse tras varios intentos.',
              retries,
              adminUrl: `${adminBase}/dashboard/detalles-proyecto/${project.id}`,
            });
            continue;
          }

          this.logger.warn(
            `Proyecto ${project.id}: IA status=${data.aiGeneration?.status}, sin salida lista. Reintento ${retries + 1}/${MAX_RETRIES}.`,
          );
          await this.prisma.project.update({
            where: { id: project.id },
            data: {
              onboardingData: JSON.stringify({
                ...data,
                aiGeneration: {
                  ...(data.aiGeneration || {}),
                  status: 'GENERATING',
                  autoRetries: retries + 1,
                  updatedAt: new Date().toISOString(),
                },
              }),
            },
          });
          try {
            // Awaited (no fire-and-forget): si el backend se reinicia, el
            // proximo cron reintenta; si termina, publicamos abajo.
            await this.aiService.generateForProject(project.id);
          } catch (genErr: any) {
            this.logger.error(
              `Reintento de generacion fallo para proyecto ${project.id}: ${genErr?.message || genErr}`,
            );
            continue;
          }
          const fresh = await this.prisma.project.findUnique({
            where: { id: project.id },
          });
          const freshData = JSON.parse((fresh?.onboardingData as string) || JSON.stringify(data));
          if (
            freshData.aiGeneration?.status !== 'READY' ||
            !this.hasGeneratedOutput(project.id, freshData)
          ) {
            this.logger.warn(
              `Proyecto ${project.id}: tras reintento sigue sin estar listo; se reintentara el proximo ciclo.`,
            );
            continue;
          }
          // Quedo listo en este reintento: continuamos a publicar con datos frescos.
          Object.assign(data, freshData);
        }

        const publicUrl = data.publicUrl;
        await this.publishProject(project.id, { publicUrl });

        if (project.user?.email) {
          const appBase = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
          const resolvedPublicUrl =
            data.publicUrl ||
            (data.publicDomain ? `https://${data.publicDomain}` : appBase);
          await this.mailService.sendProjectPublished(project.user.email, {
            projectName: project.name,
            businessName: data.businessName,
            publicUrl: resolvedPublicUrl,
            dashboardUrl: `${appBase}/dashboard`,
            revisionsAllowed:
              data.revisionsAllowed ?? (project.type === 'LANDING' ? 1 : 2),
            revisionsLeft:
              (data.revisionsAllowed ?? (project.type === 'LANDING' ? 1 : 2)) -
              (Array.isArray(data.revisionRequests)
                ? data.revisionRequests.length
                : 0),
          });
        }
        this.logger.log(`Proyecto ${project.id} publicado exitosamente por el cron.`);
      } catch (error: any) {
        this.logger.error(`Error procesando auto-publicacion para proyecto ${project.id}: ${error.message}`);
        // Continuamos con el siguiente proyecto
      }
    }
  }

  /**
   * Elimina un proyecto por completo: el sitio en CyberPanel, los archivos de
   * preview en disco y el registro en la base de datos. El Order asociado se
   * conserva como historial de compra.
   */
  async deleteProject(projectId: number, userId: number, isAdmin = false) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (!isAdmin && project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    // 1. Eliminar el sitio en CyberPanel (libera el slot del paquete). No
    // bloqueamos el borrado de DB si CyberPanel falla; solo lo registramos.
    try {
      await this.cyberpanelService.deleteSiteByProject(projectId);
    } catch (err: any) {
      this.logger.error(
        `deleteProject project=${projectId}: fallo al eliminar sitio en CyberPanel: ${err?.message || err}`,
      );
    }

    // 2. Limpiar archivos de preview generados en disco.
    try {
      const previewDir = join(
        process.cwd(),
        'uploads',
        'previews',
        String(projectId),
      );
      if (fs.existsSync(previewDir)) {
        fs.rmSync(previewDir, { recursive: true, force: true });
      }
    } catch (err: any) {
      this.logger.warn(
        `deleteProject project=${projectId}: no se pudo limpiar previews: ${err?.message || err}`,
      );
    }

    // 3. Eliminar el proyecto de la base de datos.
    await this.prisma.project.delete({ where: { id: projectId } });

    this.logger.log(
      `deleteProject project=${projectId} eliminado correctamente.`,
    );
    return { success: true, id: projectId };
  }
}
