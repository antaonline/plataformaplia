import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  Res,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { IsObject, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { PreviewService } from './preview.service';
import * as http from 'http';
import type { Response as ExpressResponse } from 'express';

class PreviewFilesDto {
  @IsObject()
  @IsOptional()
  files?: Record<string, string>;
}

/** Endpoints protegidos por JWT: start, sync, stop, status. */
@Controller('experimental/preview')
@UseGuards(JwtAuthGuard)
export class PreviewController {
  constructor(
    private readonly previewService: PreviewService,
    private readonly prisma: PrismaService,
  ) {}

  private async assertOwner(chatId: number, userId: number) {
    const chat = await this.prisma.aiChat.findUnique({ where: { id: chatId } });
    if (!chat || chat.userId !== userId) {
      throw new NotFoundException('Chat no encontrado');
    }
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: PreviewFilesDto,
  ) {
    await this.assertOwner(id, req.user.id);
    return this.previewService.start(id, body.files || {});
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  async sync(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: PreviewFilesDto,
  ) {
    await this.assertOwner(id, req.user.id);
    return this.previewService.sync(id, body.files || {});
  }

  @Post(':id/stop')
  @HttpCode(HttpStatus.OK)
  async stop(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    await this.assertOwner(id, req.user.id);
    return this.previewService.stop(id);
  }

  @Get(':id/status')
  async status(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    await this.assertOwner(id, req.user.id);
    return this.previewService.getStatus(id);
  }
}

/**
 * Proxy público (sin JWT) hacia el servidor Vite local.
 * El iframe del Studio apunta a /experimental/preview/:id/serve/* para no
 * tener que acceder directamente a http://127.0.0.1:PORT (inaccesible desde el
 * browser del cliente). La URL sólo la conoce quien recibió el previewUrl.
 */
@Controller('experimental/preview')
export class PreviewProxyController {
  constructor(private readonly previewService: PreviewService) {}

  // Matchea /serve y /serve/cualquier/ruta. *path captura el segmento opcional.
  @Get(':id/serve*path')
  async serveProxy(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Res() res: ExpressResponse,
  ) {
    const localUrl = this.previewService.getLocalUrl(id);
    if (!localUrl) {
      this.sendStatusHtml(res, id, 503);
      return;
    }

    // IMPORTANTE: NO recortamos el prefijo. Vite ahora corre con
    // `--base /api/experimental/preview/<id>/serve/` (ver preview.service.ts),
    // asi que espera recibir las requests con ESA URL completa. Si le
    // mandaramos solo "/", Vite asume que el cliente esta fuera de su base
    // y devuelve un 302 redirect AL base — el browser sigue el redirect,
    // vuelve al proxy, mismo path, loop infinito (ERR_TOO_MANY_REDIRECTS).
    //
    // Pasando req.url tal cual, Vite ve "/api/.../serve/src/main.tsx",
    // reconoce que esta dentro de su base, y sirve "/src/main.tsx".
    const vitePath: string = req.url || '/';

    const parsed = new URL(localUrl);
    const proxyReq = http.request(
      {
        host: '127.0.0.1',
        port: Number(parsed.port),
        path: vitePath,
        method: 'GET',
        headers: { host: `127.0.0.1:${parsed.port}` },
      },
      (proxyRes) => {
        res.status(proxyRes.statusCode || 200);
        for (const [k, v] of Object.entries(proxyRes.headers)) {
          // Saltar hop-by-hop + headers de embedding (los re-seteamos abajo).
          if (
            [
              'connection',
              'transfer-encoding',
              'x-frame-options',
              'content-security-policy',
            ].includes(k)
          )
            continue;
          res.setHeader(k, v as string | string[]);
        }
        // Permitir embedding del preview desde el Studio. El frontend corre
        // en localhost:3001 (dev) o el dominio publico del Studio (prod).
        // Para que el iframe pueda cargar este recurso desde otro origen
        // (Studio en :3001, backend en :3002), usamos CSP frame-ancestors
        // configurable y NO seteamos X-Frame-Options (deprecated, ademas
        // conflictua con CSP en navegadores modernos).
        const frameAncestors =
          process.env.CSP_FRAME_ANCESTORS ||
          "'self' http://localhost:3001 http://localhost:3000 http://127.0.0.1:3001";
        res.setHeader(
          'Content-Security-Policy',
          `frame-ancestors ${frameAncestors}`,
        );
        res.setHeader('Access-Control-Allow-Origin', '*');
        proxyRes.pipe(res);
      },
    );

    proxyReq.on('error', () => {
      if (!res.headersSent) this.sendStatusHtml(res, id, 502);
    });

    proxyReq.end();
  }

  /**
   * Cuando Vite no responde (no spawneado todavía, instalando deps, o crash),
   * en vez de devolver JSON crudo al iframe (que se ve como texto plano),
   * servimos una página HTML que muestra el estado actual y los últimos
   * logs del motor. Auto-refresca cada 2.5s así que apenas Vite levanta,
   * el cliente ve su preview sin tener que hacer F5 manualmente.
   */
  private sendStatusHtml(
    res: ExpressResponse,
    chatId: number,
    statusCode: number,
  ): void {
    const info = this.previewService.getStatus(chatId);
    const phase = info.status; // 'starting' | 'installing' | 'running' | 'stopped' | 'error'
    const phaseLabel: Record<string, string> = {
      starting: 'Arrancando motor Vite…',
      installing: 'Instalando dependencias del proyecto…',
      running: 'Reconectando al preview…',
      stopped: 'Preview detenido',
      error: 'Error al iniciar el preview',
    };
    const phaseColor: Record<string, string> = {
      starting: '#6366f1',
      installing: '#f59e0b',
      running: '#10b981',
      stopped: '#64748b',
      error: '#dc2626',
    };
    const color = phaseColor[phase] || '#64748b';
    const label = phaseLabel[phase] || phase;
    const recent = (info.logs || [])
      .slice(-12)
      .map((l) =>
        String(l)
          .replace(/\x1b\[\d+(?:;\d+)*m/g, '') // strip ANSI
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;'),
      )
      .join('\n');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="refresh" content="2.5" />
  <title>PLIA Preview · ${phase}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
      background: #0d1117; color: #f8fafc;
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 40px;
    }
    .card {
      max-width: 640px; width: 100%;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px; padding: 36px 32px;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 999px;
      background: ${color}22; color: ${color};
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.12em; margin-bottom: 16px;
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: ${color};
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.45; transform: scale(1.35); }
    }
    h1 { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
    .hint { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 24px; line-height: 1.55; }
    .logs {
      background: #050709; border-radius: 12px; padding: 16px;
      font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
      font-size: 11px; color: rgba(255,255,255,0.7);
      white-space: pre-wrap; word-break: break-word;
      max-height: 280px; overflow-y: auto;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .logs:empty::before { content: 'Sin logs todavía…'; opacity: 0.4; font-style: italic; }
    .footer { margin-top: 18px; font-size: 11px; color: rgba(255,255,255,0.35); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span>${label}</div>
    <h1>El preview está casi listo</h1>
    <p class="hint">
      ${phase === 'installing'
        ? 'La primera vez que se abre un proyecto, instalamos las dependencias del scaffold (~30-90s en Windows). Esta pantalla se recarga sola apenas Vite esté listo.'
        : phase === 'error'
        ? 'El motor de preview tuvo un problema al iniciar. Mirá los logs abajo y compartilos con soporte si no es claro.'
        : phase === 'stopped'
        ? 'El preview está detenido. Refrescá el editor o pulsá "Reiniciar preview" para volver a levantarlo.'
        : 'Estamos arrancando Vite y conectando el iframe. Esto se recarga solo cada 2-3 segundos.'}
    </p>
    <pre class="logs">${recent}</pre>
    <div class="footer">Project ${chatId} · status: ${phase} · HTTP ${statusCode}</div>
  </div>
</body>
</html>`;
    res.status(statusCode);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    // Permitir embedding desde el Studio (mismo CSP que el proxy normal).
    const frameAncestors =
      process.env.CSP_FRAME_ANCESTORS ||
      "'self' http://localhost:3001 http://localhost:3000 http://127.0.0.1:3001";
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors ${frameAncestors}`,
    );
    res.send(html);
  }
}
