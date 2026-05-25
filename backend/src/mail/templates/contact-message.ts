import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderDataCard, renderLayout } from './layout';

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone: string;
  business?: string;
  message: string;
}

/**
 * Notificación interna al admin cuando alguien envía el formulario
 * de contacto público.
 */
export const contactMessageTemplate: EmailTemplate<ContactMessagePayload> = (
  p,
) => {
  const c = BRAND.colors;
  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              Nuevo mensaje desde el formulario de contacto.
            </p>

            ${renderDataCard({
              title: 'Datos del contacto',
              tone: 'lime',
              rows: [
                { label: 'Nombre', value: p.name },
                { label: 'Correo', value: p.email },
                { label: 'Teléfono', value: p.phone },
                { label: 'Negocio', value: p.business || '-' },
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
              Responde directamente a este correo (replyTo configurado).
            </p>`;

  return {
    subject: `Nuevo contacto: ${p.name}`,
    html: renderLayout({
      preheader: `${p.name} (${p.email}) te envió un mensaje`,
      heading: 'Nuevo mensaje de contacto',
      subheading: `Desde plia.pe/contacto`,
      body,
    }),
    text: `Nuevo contacto desde plia.pe/contacto\n\nNombre: ${p.name}\nCorreo: ${p.email}\nTeléfono: ${p.phone}\nNegocio: ${p.business || '-'}\n\nMensaje:\n${p.message}`,
  };
};
