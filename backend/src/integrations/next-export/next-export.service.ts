import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { SiteSpec } from '../../ai/ai.types';

@Injectable()
export class NextExportService {
  private readonly logger = new Logger(NextExportService.name);

  private get templateDir() {
    return process.env.NEXT_EXPORT_TEMPLATE_DIR || join(process.cwd(), 'templates', 'next-export');
  }

  private get workRoot() {
    return process.env.NEXT_EXPORT_WORKDIR || join(process.cwd(), 'generated', 'next');
  }

  private get outputDir() {
    return 'out';
  }

  private get previewRoot() {
    return join(process.cwd(), 'uploads', 'previews');
  }

  private copyDir(src: string, dest: string) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const from = join(src, entry.name);
      const to = join(dest, entry.name);
      if (entry.isDirectory()) {
        this.copyDir(from, to);
      } else {
        fs.copyFileSync(from, to);
      }
    }
  }

  private writeJson(path: string, data: any) {
    fs.mkdirSync(join(path, '..'), { recursive: true });
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
  }

  private createPreview(projectId: number, sourceDir: string) {
    const previewDir = join(this.previewRoot, String(projectId));
    if (fs.existsSync(previewDir)) {
      fs.rmSync(previewDir, { recursive: true, force: true });
    }
    this.copyDir(sourceDir, previewDir);
    const appUrl = (process.env.APP_URL || 'http://localhost:3001').replace(/\/$/, '');
    return `${appUrl}/uploads/previews/${projectId}/index.html`;
  }

  private toPages(spec: SiteSpec) {
    const pages = spec.pages?.length
      ? spec.pages
      : [
          {
            slug: 'index',
            title: spec.brand.name,
            sections: spec.sections,
          },
        ];
    return pages.map((page) => ({
      slug: page.slug === 'home' ? 'index' : page.slug,
      title: page.title,
      sections: page.sections,
    }));
  }

  private copyGeneratedImages(projectId: number, destPublicDir: string) {
    const sourceDir = join(process.cwd(), 'uploads', 'generated', String(projectId));
    if (!fs.existsSync(sourceDir)) return [];
    const destDir = join(destPublicDir, 'assets');
    fs.mkdirSync(destDir, { recursive: true });
    const files = fs.readdirSync(sourceDir);
    const assets: string[] = [];
    for (const file of files) {
      const from = join(sourceDir, file);
      const to = join(destDir, file);
      fs.copyFileSync(from, to);
      assets.push(`/assets/${file}`);
    }
    return assets;
  }

  exportSite(projectId: number, spec: SiteSpec, domain: string) {
    const workDir = join(this.workRoot, String(projectId));
    const siteRoot = join(workDir, 'site');
    if (fs.existsSync(siteRoot)) {
      fs.rmSync(siteRoot, { recursive: true, force: true });
    }
    this.copyDir(this.templateDir, siteRoot);

    const pages = this.toPages(spec);
    const dataDir = join(siteRoot, 'data');
    this.writeJson(join(dataDir, 'site.json'), {
      brand: spec.brand,
      palette: spec.palette,
      typography: spec.typography,
    });
    this.writeJson(join(dataDir, 'pages.json'), { pages });

    const publicDir = join(siteRoot, 'public');
    const assets = this.copyGeneratedImages(projectId, publicDir);
    this.writeJson(join(dataDir, 'assets.json'), { assets });

    try {
      execSync('npm install --no-fund --no-audit', { cwd: siteRoot, stdio: 'ignore' });
    } catch (error: any) {
      this.logger.warn(`npm install fallo en export template: ${error?.message || error}`);
    }

    try {
      execSync('npm run export', { cwd: siteRoot, stdio: 'pipe' });
    } catch (error: any) {
      const stderr = error?.stderr?.toString?.() || '';
      const stdout = error?.stdout?.toString?.() || '';
      this.logger.error(`next export fallo: ${stderr || stdout || error?.message || error}`);
      throw error;
    }

    const outDir = join(siteRoot, this.outputDir);
    const cyberRoot = process.env.CYBERPANEL_SITES_ROOT || '/home';
    const publicHtml = process.env.CYBERPANEL_PUBLIC_DIR || 'public_html';
    const target = join(cyberRoot, domain, publicHtml);

    this.copyDir(outDir, target);
    const targetIndex = join(target, 'index.html');
    if (!fs.existsSync(targetIndex)) {
      throw new Error(`No se encontro index.html en el destino publicado: ${targetIndex}`);
    }
    const previewUrl = this.createPreview(projectId, outDir);
    return { target, previewUrl };
  }
}
