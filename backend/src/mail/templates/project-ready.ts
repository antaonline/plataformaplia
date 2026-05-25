import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderDataCard, renderLayout } from './layout';

export interface ProjectReadyPayload {
  projectName: string;
  loginUrl: string;
  hostingAccess?: {
    panelUrl: string;
    username: string;
    password: string;
  };
}

/**
 * Se envía cuando el cliente termina el onboarding y la cuenta de
 * hosting queda creada. Combina dos casos:
 * - Si vino con hostingAccess: el cliente recibe sus credenciales técnicas.
 * - Si no: solo confirma que arrancó el desarrollo y que puede revisar.
 */
export const projectReadyTemplate: EmailTemplate<ProjectReadyPayload> = (p) => {
  const c = BRAND.colors;
  const hasAccess = Boolean(p.hostingAccess);
  const heading = hasAccess
    ? 'Tu acceso de hosting está listo'
    : 'Tu web está en desarrollo';
  const subheading = hasAccess
    ? 'Cuenta técnica creada en PLIA Hosting'
    : 'Estamos construyéndola con IA';

  const introHtml = hasAccess
    ? `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              <strong>${escapeHtml(p.projectName)}</strong> ya tiene su acceso inicial de hosting.
              Usa estas credenciales para entrar al panel técnico cuando necesites
              gestionar archivos, bases de datos o dominios.
            </p>
            <p style="margin:0 0 8px;font-size:13px;color:${c.textMuted};line-height:1.6;">
              Por seguridad, la contraseña completa solo se muestra en este correo.
              Guárdala en un gestor seguro.
            </p>`
    : `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              <strong>${escapeHtml(p.projectName)}</strong> ya está en producción.
              Nuestra IA está construyendo tu web profesional ahora mismo.
            </p>
            <p style="margin:0 0 8px;font-size:14px;color:${c.text};line-height:1.6;">
              <strong>Te tomará aproximadamente 24 horas</strong>. Cuando esté lista,
              te avisaremos con otro correo y podrás revisarla en tu cuenta.
            </p>`;

  const hostingCard = p.hostingAccess
    ? renderDataCard({
        title: 'Acceso CyberPanel',
        rows: [
          { label: 'Panel', value: p.hostingAccess.panelUrl },
          { label: 'Usuario', value: p.hostingAccess.username },
          { label: 'Contraseña', value: p.hostingAccess.password },
        ],
        tone: 'lime',
      })
    : '';

  const body = `${introHtml}\n${hostingCard}`;

  return {
    subject: hasAccess
      ? 'Tu acceso de hosting PLIA ya está listo'
      : `${p.projectName} está en desarrollo`,
    html: renderLayout({
      preheader: hasAccess
        ? 'Cuenta técnica creada en PLIA Hosting'
        : 'Tu web profesional estará lista en 24h',
      heading,
      subheading,
      body,
      cta: { label: 'Ingresar a mi cuenta', href: p.loginUrl },
    }),
    text: hasAccess
      ? `Tu acceso de hosting PLIA está listo.\n\nPanel: ${p.hostingAccess?.panelUrl}\nUsuario: ${p.hostingAccess?.username}\nContraseña: ${p.hostingAccess?.password}\n\nIngresar: ${p.loginUrl}`
      : `${p.projectName} está en desarrollo. Te avisaremos cuando esté listo.\n\nIngresar: ${p.loginUrl}`,
  };
};
