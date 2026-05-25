import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderDataCard, renderLayout } from './layout';

export interface ProjectFailedPayload {
  projectId: number;
  projectName: string;
  customerEmail?: string;
  errorMessage: string;
  retries: number;
  adminUrl: string;
}

/**
 * Alerta interna que se envía al admin (no al cliente) cuando un proyecto
 * marca aiGeneration FAILED tras N reintentos. Sirve para intervenir
 * manualmente antes de que el cliente se queje.
 */
export const projectFailedTemplate: EmailTemplate<ProjectFailedPayload> = (
  p,
) => {
  const c = BRAND.colors;
  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              El sistema marcó como <strong style="color:${c.danger};">FAILED</strong> la generación de IA del proyecto
              <strong>${escapeHtml(p.projectName)}</strong> tras <strong>${p.retries}</strong> reintentos automáticos.
            </p>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${c.text};">
              Es necesario revisar manualmente antes de que el cliente intente acceder a la web.
            </p>

            ${renderDataCard({
              title: 'Detalle del fallo',
              tone: 'warning',
              rows: [
                { label: 'Proyecto ID', value: String(p.projectId) },
                { label: 'Nombre', value: p.projectName },
                p.customerEmail
                  ? { label: 'Cliente', value: p.customerEmail }
                  : undefined,
                { label: 'Reintentos', value: String(p.retries) },
                { label: 'Error', value: p.errorMessage },
              ].filter(Boolean) as Array<{ label: string; value: string }>,
            })}

            <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${c.textMuted};">
              Acciones sugeridas: revisar logs de PM2, ejecutar <code style="background:${c.surfaceMuted};padding:1px 6px;border-radius:4px;">POST /api/projects/${p.projectId}/generate-now</code>, o eliminar el proyecto si es irrecuperable.
            </p>`;

  return {
    subject: `⚠️ Proyecto #${p.projectId} en estado FAILED`,
    html: renderLayout({
      preheader: `Generación AI fallida tras ${p.retries} reintentos`,
      heading: 'Alerta: proyecto FAILED',
      subheading: 'Requiere intervención manual',
      body,
      cta: { label: 'Revisar en panel admin', href: p.adminUrl },
    }),
    text: `Proyecto ${p.projectName} (id ${p.projectId}) en FAILED tras ${p.retries} reintentos.\nError: ${p.errorMessage}\nAdmin: ${p.adminUrl}`,
  };
};
