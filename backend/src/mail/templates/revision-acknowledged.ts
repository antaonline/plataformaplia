import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderLayout } from './layout';

export interface RevisionAcknowledgedPayload {
  projectName: string;
  businessName?: string;
  revisionMessage: string;
  revisionsLeft: number;
  revisionsAllowed: number;
  dashboardUrl: string;
}

/**
 * Acuse de recibo cuando el cliente envía una solicitud de cambios
 * dentro del periodo de revisiones.
 */
export const revisionAcknowledgedTemplate: EmailTemplate<RevisionAcknowledgedPayload> = (
  p,
) => {
  const c = BRAND.colors;
  const displayName = p.businessName || p.projectName;

  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              Recibimos tu solicitud de cambios para <strong>${escapeHtml(displayName)}</strong>.
              Nuestra IA está procesándolos ahora mismo.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;border-left:3px solid ${c.cta};background:${c.surfaceMuted};">
              <tr>
                <td style="padding:14px 18px;">
                  <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:800;color:${c.textMuted};margin-bottom:6px;">Tus instrucciones</div>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${c.text};white-space:pre-wrap;">${escapeHtml(p.revisionMessage)}</p>
                </td>
              </tr>
            </table>

            <p style="margin:18px 0 8px;font-size:14px;line-height:1.6;color:${c.text};">
              En cuanto los cambios estén aplicados, te llegará otro correo confirmándolo.
            </p>

            <p style="margin:0 0 0;font-size:13px;line-height:1.6;color:${c.textMuted};">
              Revisiones restantes: <strong>${p.revisionsLeft} de ${p.revisionsAllowed}</strong>
            </p>`;

  return {
    subject: `Recibimos tus cambios para ${displayName}`,
    html: renderLayout({
      preheader: 'Estamos aplicando tus cambios. Te avisamos cuando esté listo.',
      heading: 'Solicitud de cambios recibida',
      subheading: `${displayName}`,
      body,
      cta: { label: 'Ver mi proyecto', href: p.dashboardUrl },
    }),
    text: `Recibimos tu solicitud de cambios para ${displayName}.\n\nInstrucciones:\n${p.revisionMessage}\n\nRevisiones restantes: ${p.revisionsLeft} de ${p.revisionsAllowed}\n\nDashboard: ${p.dashboardUrl}`,
  };
};
