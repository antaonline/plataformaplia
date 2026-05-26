import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderDataCard, renderLayout } from './layout';

export interface SiteContactSubmissionPayload {
  /** A quién le mandamos (dueño del sitio = cliente PLIA). */
  recipientEmail: string;
  /** Nombre del negocio (para identificar fácil en el inbox). */
  businessName: string;
  /** Quién envía el formulario (visitante del sitio). */
  submitterName: string;
  submitterEmail: string;
  message: string;
  /** Cualquier campo extra del formulario (teléfono, asunto, fecha, etc.). */
  customFields?: Record<string, string>;
  /** URL del sitio desde donde se envió, para contexto. */
  sourceUrl?: string;
}

/**
 * Notifica al cliente PLIA cuando alguien envía el formulario de
 * contacto de su sitio web. El replyTo se setea al email del visitante,
 * así el cliente solo le da "Responder" en Gmail y se contesta directo.
 */
export const siteContactSubmissionTemplate: EmailTemplate<SiteContactSubmissionPayload> = (
  p,
) => {
  const c = BRAND.colors;

  const customRows = Object.entries(p.customFields || {}).map(([k, v]) => ({
    label: humanizeKey(k),
    value: v,
  }));

  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              Recibiste un nuevo mensaje en el formulario de contacto de
              <strong>${escapeHtml(p.businessName)}</strong>.
            </p>

            ${renderDataCard({
              title: 'Datos del visitante',
              tone: 'lime',
              rows: [
                { label: 'Nombre', value: p.submitterName },
                { label: 'Email', value: p.submitterEmail },
                ...customRows,
              ],
            })}

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;border-left:3px solid ${c.cta};background:${c.surfaceMuted};">
              <tr>
                <td style="padding:14px 18px;">
                  <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:800;color:${c.textMuted};margin-bottom:6px;">Mensaje</div>
                  <p style="margin:0;font-size:14px;line-height:1.7;color:${c.text};white-space:pre-wrap;">${escapeHtml(p.message)}</p>
                </td>
              </tr>
            </table>

            <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${c.textMuted};">
              Para responder, simplemente dale a "Responder" a este correo — irá directo a <strong>${escapeHtml(p.submitterEmail)}</strong>.
            </p>
            ${p.sourceUrl ? `<p style="margin:8px 0 0;font-size:12px;color:${c.textMuted};">Enviado desde <a href="${escapeHtml(p.sourceUrl)}" style="color:${c.text};">${escapeHtml(p.sourceUrl.replace(/^https?:\/\//, ''))}</a></p>` : ''}`;

  return {
    subject: `📬 Nuevo mensaje en ${p.businessName}: ${p.submitterName}`,
    html: renderLayout({
      preheader: `${p.submitterName} te contactó desde tu sitio`,
      heading: 'Nuevo mensaje de contacto',
      subheading: `Recibido en ${p.businessName}`,
      body,
    }),
    text: `Nuevo mensaje en ${p.businessName}\n\nDe: ${p.submitterName} <${p.submitterEmail}>\n\n${p.message}\n\n${p.sourceUrl || ''}`,
  };
};

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
