/**
 * Layout base reutilizable para TODOS los emails de PLIA.
 * Cualquier template solo se ocupa de construir el `body` y opcionalmente
 * un `cta`; el header dark con logo + accent lime + footer dark vienen
 * incluidos para garantizar consistencia visual de marca.
 */

import { BRAND, escapeHtml } from './brand';

export interface LayoutPayload {
  /** Texto preview que algunos clientes muestran en la lista de inbox. */
  preheader?: string;
  /** Título principal grande en el header dark. */
  heading: string;
  /** Subtítulo en el header (gris claro). */
  subheading?: string;
  /** HTML del cuerpo del correo (puede incluir tablas, párrafos, cards). */
  body: string;
  /** Botón principal de acción opcional. */
  cta?: { label: string; href: string };
  /** Nota chiquita gris debajo del CTA. */
  footerNote?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Construye el HTML completo de un correo PLIA.
 */
export function renderLayout(payload: LayoutPayload): string {
  const { preheader, heading, subheading, body, cta, footerNote } = payload;
  const c = BRAND.colors;

  const preheaderHtml = preheader
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>`
    : '';

  const subheadingHtml = subheading
    ? `<p style="margin:0;font-size:15px;line-height:1.5;color:${c.textInverseMuted};font-weight:500;">${escapeHtml(subheading)}</p>`
    : '';

  const ctaHtml = cta
    ? `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
              <tr>
                <td>
                  <a href="${escapeHtml(cta.href)}" style="display:inline-block;background:${c.cta};color:${c.ctaForeground};text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:800;font-size:15px;letter-spacing:0.01em;mso-padding-alt:0;">${escapeHtml(cta.label)}</a>
                </td>
              </tr>
            </table>
            <p style="margin:14px 0 0;font-size:12px;color:${c.textMuted};line-height:1.6;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
              <span style="color:${c.textMuted};word-break:break-all;">${escapeHtml(cta.href)}</span>
            </p>`
    : '';

  const footerNoteHtml = footerNote
    ? `<p style="margin:24px 0 0;font-size:13px;color:${c.textMuted};line-height:1.6;">${footerNote}</p>`
    : '';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;color:${c.text};-webkit-font-smoothing:antialiased;">

${preheaderHtml}

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f6fa;padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:${c.surface};border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(15,23,42,0.06);">

        <!-- HEADER DARK con logo + heading + subheading -->
        <tr>
          <td style="background:${c.darkBg};padding:32px 36px 28px;">
            <img src="${BRAND.logos.light}" alt="${BRAND.name}" height="32" style="display:block;height:32px;width:auto;border:0;outline:none;text-decoration:none;" />
            <h1 style="margin:24px 0 6px;font-size:26px;line-height:1.25;color:${c.textInverse};font-weight:800;letter-spacing:-0.01em;">${escapeHtml(heading)}</h1>
            ${subheadingHtml}
          </td>
        </tr>

        <!-- ACCENT LIME (4px) -->
        <tr>
          <td style="background:${c.cta};height:4px;line-height:4px;font-size:4px;mso-line-height-rule:exactly;">&nbsp;</td>
        </tr>

        <!-- BODY blanco -->
        <tr>
          <td style="padding:32px 36px;background:${c.surface};color:${c.text};">
${body}
${ctaHtml}
${footerNoteHtml}
          </td>
        </tr>

        <!-- FOOTER DARK -->
        <tr>
          <td style="background:${c.darkBg};padding:24px 36px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;line-height:1.6;font-weight:600;">
              ${BRAND.name} <span style="color:${c.cta};">·</span> ${BRAND.tagline}
            </p>
            <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
              ¿Necesitas ayuda? <a href="mailto:${BRAND.supportEmail}" style="color:${c.cta};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>
            </p>
          </td>
        </tr>

      </table>

      <p style="margin:16px auto 0;font-size:11px;color:#9ca3af;line-height:1.6;text-align:center;max-width:600px;">
        Este correo fue enviado automáticamente por ${BRAND.name}. Si lo recibiste por error, por favor ignóralo.
      </p>
    </td>
  </tr>
</table>

</body>
</html>`;
}

/**
 * Bloque reutilizable: tarjeta destacada con datos clave (ej. credenciales).
 */
export function renderDataCard(args: {
  title: string;
  rows: Array<{ label: string; value: string }>;
  tone?: 'lime' | 'neutral' | 'warning';
}): string {
  const c = BRAND.colors;
  const tone = args.tone || 'lime';
  const bg = tone === 'lime' ? '#F7FFE0' : tone === 'warning' ? '#FEF3C7' : '#F1F5F9';
  const border =
    tone === 'lime' ? '#BFFF00' : tone === 'warning' ? '#F59E0B' : '#CBD5E1';
  const labelColor = tone === 'lime' ? '#4D6B00' : tone === 'warning' ? '#92400E' : c.textMuted;
  const rowsHtml = args.rows
    .map(
      (r) => `
              <tr>
                <td style="padding:6px 0;font-size:13px;color:${c.text};line-height:1.6;">
                  <strong style="display:inline-block;min-width:96px;color:${c.text};">${escapeHtml(r.label)}:</strong>
                  <span style="color:${c.text};">${escapeHtml(r.value)}</span>
                </td>
              </tr>`,
    )
    .join('');
  return `
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;border:1px solid ${border};border-radius:14px;background:${bg};">
              <tr>
                <td style="padding:18px 22px;">
                  <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;font-weight:800;color:${labelColor};margin-bottom:12px;">${escapeHtml(args.title)}</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rowsHtml}
                  </table>
                </td>
              </tr>
            </table>`;
}

/**
 * Tipo común de cualquier template: recibe un payload, retorna asunto + html + text fallback.
 */
export type EmailTemplate<T> = (payload: T) => RenderedEmail;
