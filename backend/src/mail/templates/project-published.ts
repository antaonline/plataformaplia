import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderLayout } from './layout';

export interface ProjectPublishedPayload {
  projectName: string;
  businessName?: string;
  publicUrl: string;
  dashboardUrl: string;
  revisionsAllowed?: number;
  revisionsLeft?: number;
}

/**
 * Se envía cuando el cron auto-publica el sitio al cumplirse las 24h.
 * Es la GRAN noticia para el cliente: su sitio ya está online.
 */
export const projectPublishedTemplate: EmailTemplate<ProjectPublishedPayload> = (
  p,
) => {
  const c = BRAND.colors;
  const displayName = p.businessName || p.projectName;
  const revisionsText =
    typeof p.revisionsLeft === 'number' && typeof p.revisionsAllowed === 'number'
      ? `Tienes <strong>${p.revisionsLeft} de ${p.revisionsAllowed} revisiones</strong> disponibles para pedir ajustes durante las próximas 48 horas.`
      : 'Puedes pedir ajustes desde tu cuenta si necesitas cambios.';

  const body = `
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${c.text};font-weight:600;">
              Tu sitio web ya está en línea 🎉
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              <strong>${escapeHtml(displayName)}</strong> ya está publicado y disponible
              para que el mundo lo vea.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;border:2px solid ${c.cta};border-radius:14px;background:${c.surfaceMuted};">
              <tr>
                <td style="padding:18px 22px;text-align:center;">
                  <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;font-weight:800;color:${c.textMuted};margin-bottom:8px;">Tu sitio web</div>
                  <a href="${escapeHtml(p.publicUrl)}" style="display:inline-block;font-size:18px;font-weight:700;color:${c.text};text-decoration:none;word-break:break-all;">
                    ${escapeHtml(p.publicUrl.replace(/^https?:\/\//, ''))}
                  </a>
                </td>
              </tr>
            </table>

            <h2 style="margin:24px 0 8px;font-size:17px;color:${c.text};font-weight:700;">¿Qué puedes hacer ahora?</h2>
            <ul style="margin:0 0 16px;padding-left:22px;font-size:14px;line-height:1.8;color:${c.text};">
              <li><strong>Visita tu sitio</strong> en el botón de abajo y revisa cómo quedó.</li>
              <li><strong>Compártelo</strong> con tus clientes, en redes sociales o en tu firma de correo.</li>
              <li>${revisionsText}</li>
            </ul>`;

  return {
    subject: `🎉 ${displayName} ya está publicado`,
    html: renderLayout({
      preheader: `Tu web ${displayName} ya está online en ${p.publicUrl}`,
      heading: 'Tu web ya está publicada',
      subheading: 'Compártela con el mundo',
      body,
      cta: { label: 'Ver mi sitio web', href: p.publicUrl },
      footerNote: `También puedes administrarla desde tu <a href="${escapeHtml(p.dashboardUrl)}" style="color:${c.text};font-weight:600;">dashboard de PLIA</a>.`,
    }),
    text: `Tu sitio web ${displayName} ya está publicado.\n\nURL: ${p.publicUrl}\nDashboard: ${p.dashboardUrl}\n\n${revisionsText.replace(/<[^>]+>/g, '')}`,
  };
};
