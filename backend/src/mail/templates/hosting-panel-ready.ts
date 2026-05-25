import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderDataCard, renderLayout } from './layout';

export interface HostingPanelReadyPayload {
  planName?: string;
  loginUrl: string;
  hostingAccess: {
    panelUrl: string;
    username: string;
    password: string;
  };
}

/**
 * Se envía cuando el cliente compra un plan de hosting (sin web) y la
 * cuenta CyberPanel queda activada.
 */
export const hostingPanelReadyTemplate: EmailTemplate<HostingPanelReadyPayload> = (
  p,
) => {
  const c = BRAND.colors;
  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              <strong>${escapeHtml(p.planName || 'Tu plan PLIA')}</strong> ya está activo y
              tu cuenta técnica de hosting fue creada en CyberPanel.
            </p>
            <p style="margin:0 0 8px;font-size:13px;color:${c.textMuted};line-height:1.6;">
              Por seguridad, la contraseña completa solo se muestra en este correo.
              Guárdala en un gestor seguro.
            </p>

            ${renderDataCard({
              title: 'Acceso técnico',
              tone: 'lime',
              rows: [
                { label: 'Panel', value: p.hostingAccess.panelUrl },
                { label: 'Usuario', value: p.hostingAccess.username },
                { label: 'Contraseña', value: p.hostingAccess.password },
              ],
            })}`;

  return {
    subject: 'Tu cuenta de hosting PLIA ya está activa',
    html: renderLayout({
      preheader: 'Tu plan está activo. Aquí están tus credenciales técnicas.',
      heading: 'Tu hosting está activo',
      subheading: 'Listo para crear sitios',
      body,
      cta: { label: 'Ir a mi dashboard de hosting', href: p.loginUrl },
    }),
    text: `Tu hosting PLIA está activo.\n\nPanel: ${p.hostingAccess.panelUrl}\nUsuario: ${p.hostingAccess.username}\nContraseña: ${p.hostingAccess.password}\n\nDashboard: ${p.loginUrl}`,
  };
};
