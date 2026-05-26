import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderLayout } from './layout';

export interface RevisionDeployedPayload {
  projectName: string;
  businessName?: string;
  publicUrl: string;
  dashboardUrl: string;
}

/**
 * Cierra el ciclo de revisiones: el cliente envió cambios, los recibimos,
 * los aplicamos y ahora el sitio publicado refleja la solicitud. Este
 * correo le confirma que ya puede ir a verlo.
 */
export const revisionDeployedTemplate: EmailTemplate<RevisionDeployedPayload> = (
  p,
) => {
  const c = BRAND.colors;
  const displayName = p.businessName || p.projectName;

  const body = `
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${c.text};font-weight:600;">
              Tus cambios ya están aplicados ✨
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              Hemos terminado de aplicar los ajustes que pediste para
              <strong>${escapeHtml(displayName)}</strong>. Ya puedes visitar tu sitio
              para revisar el resultado.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;border:2px solid ${c.cta};border-radius:14px;background:${c.surfaceMuted};">
              <tr>
                <td style="padding:18px 22px;text-align:center;">
                  <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;font-weight:800;color:${c.textMuted};margin-bottom:8px;">Tu sitio actualizado</div>
                  <a href="${escapeHtml(p.publicUrl)}" style="display:inline-block;font-size:18px;font-weight:700;color:${c.text};text-decoration:none;word-break:break-all;">
                    ${escapeHtml(p.publicUrl.replace(/^https?:\/\//, ''))}
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${c.textMuted};">
              Si quieres pedir otra ronda de cambios y aún tienes revisiones
              disponibles, vuelve a tu dashboard y usa "Enviar cambios".
            </p>`;

  return {
    subject: `✨ Cambios aplicados en ${displayName}`,
    html: renderLayout({
      preheader: 'Tus ajustes ya están aplicados y publicados',
      heading: 'Cambios aplicados',
      subheading: 'Tu sitio ya refleja los ajustes',
      body,
      cta: { label: 'Ver mi sitio actualizado', href: p.publicUrl },
      footerNote: `También puedes administrarlo desde tu <a href="${escapeHtml(p.dashboardUrl)}" style="color:${c.text};font-weight:600;">dashboard PLIA</a>.`,
    }),
    text: `Tus cambios para ${displayName} ya están aplicados.\n\nURL: ${p.publicUrl}\nDashboard: ${p.dashboardUrl}`,
  };
};
