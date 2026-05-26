import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Options,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SiteContactService } from './site-contact.service';
import { BRAND } from '../mail/templates/brand';

/**
 * Endpoint publico que reciben los formularios de los sitios generados
 * por la IA. Acepta tanto application/x-www-form-urlencoded (submit
 * tradicional desde un <form>) como application/json (fetch desde JS).
 *
 * Respuesta:
 * - Si la peticion fue x-www-form-urlencoded: redirige a una pagina HTML
 *   con un "gracias" branded.
 * - Si fue JSON: responde JSON con {ok, message}.
 *
 * CORS: el browser hace POST cross-origin desde <subdominio>.plia.pe
 * hacia api.plia.pe. Para submits tradicionales (no AJAX) CORS no aplica
 * porque el browser navega — pero por si la IA usa fetch, devolvemos
 * Access-Control-Allow-Origin: * para esta ruta especifica (info publica,
 * no usa cookies de sesion).
 */
@Controller('site-contact')
export class SiteContactController {
  constructor(private readonly svc: SiteContactService) {}

  // Preflight para AJAX cross-origin.
  @Options(':projectId')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type, Accept')
  @Header('Access-Control-Max-Age', '86400')
  @HttpCode(HttpStatus.NO_CONTENT)
  preflight() {
    return;
  }

  @Post(':projectId')
  @Header('Access-Control-Allow-Origin', '*')
  async submit(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() body: Record<string, any>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        ?.trim() || req.ip;
    const acceptsJson = (req.headers.accept || '')
      .toLowerCase()
      .includes('application/json');

    try {
      const result = await this.svc.submit(projectId, body, ipAddress);

      if (acceptsJson) {
        return res.status(200).json(result);
      }

      // Submit tradicional: devolver HTML branded de "gracias".
      const back = result.publicUrl
        ? `<a href="${escapeHtml(result.publicUrl)}" style="display:inline-block;margin-top:24px;background:${BRAND.colors.cta};color:${BRAND.colors.ctaForeground};text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:800;">Volver al sitio</a>`
        : '';
      const meta = result.publicUrl
        ? `<meta http-equiv="refresh" content="6;url=${escapeHtml(result.publicUrl)}">`
        : '';

      return res
        .status(200)
        .type('text/html; charset=utf-8')
        .send(renderThanksPage({ meta, backButton: back, message: result.message }));
    } catch (error: any) {
      const errMsg = error?.response?.message || error?.message || 'No se pudo enviar el mensaje.';

      if (acceptsJson) {
        return res.status(error?.status || 400).json({ ok: false, message: errMsg });
      }

      return res
        .status(error?.status || 400)
        .type('text/html; charset=utf-8')
        .send(renderErrorPage(errMsg));
    }
  }
}

// ============================================================
// Renderers de paginas HTML "gracias" / "error" con paleta PLIA.
// ============================================================

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderThanksPage(args: { meta: string; backButton: string; message: string }) {
  const c = BRAND.colors;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${args.meta}
<title>¡Mensaje enviado! · ${BRAND.name}</title>
<style>
body{margin:0;background:#f4f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;color:${c.text};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.card{max-width:480px;width:100%;background:#fff;border-radius:20px;padding:48px 32px;text-align:center;box-shadow:0 4px 16px rgba(15,23,42,0.08);border:1px solid ${c.border};}
.icon{width:72px;height:72px;background:${c.cta};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;}
.icon svg{width:36px;height:36px;}
h1{margin:0 0 12px;font-size:24px;font-weight:800;color:${c.text};}
p{margin:0;font-size:15px;line-height:1.6;color:${c.textMuted};}
.brand{margin-top:32px;font-size:11px;color:${c.textMuted};letter-spacing:0.16em;text-transform:uppercase;font-weight:700;}
.brand strong{color:${c.cta};}
</style>
</head>
<body>
<div class="card">
  <div class="icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="${c.ctaForeground}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  </div>
  <h1>${escapeHtml(args.message)}</h1>
  <p>Tu mensaje llegó correctamente. Te responderemos lo antes posible.</p>
  ${args.backButton}
  <div class="brand">${BRAND.name} <strong>·</strong> ${BRAND.tagline}</div>
</div>
</body>
</html>`;
}

function renderErrorPage(message: string) {
  const c = BRAND.colors;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Error · ${BRAND.name}</title>
<style>
body{margin:0;background:#f4f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;color:${c.text};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.card{max-width:480px;width:100%;background:#fff;border-radius:20px;padding:48px 32px;text-align:center;box-shadow:0 4px 16px rgba(15,23,42,0.08);border:1px solid ${c.border};}
.icon{width:72px;height:72px;background:#fee2e2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;}
.icon svg{width:36px;height:36px;}
h1{margin:0 0 12px;font-size:22px;font-weight:800;color:${c.text};}
p{margin:0;font-size:14px;line-height:1.6;color:${c.textMuted};}
.back{margin-top:24px;display:inline-block;color:${c.textMuted};text-decoration:underline;font-size:13px;}
</style>
</head>
<body>
<div class="card">
  <div class="icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </div>
  <h1>No se pudo enviar</h1>
  <p>${escapeHtml(message)}</p>
  <a class="back" href="javascript:history.back()">Volver e intentar de nuevo</a>
</div>
</body>
</html>`;
}
