import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderLayout } from './layout';

export interface WelcomePayload {
  email: string;
  customerName?: string;
  planName?: string;
  dashboardUrl: string;
}

/**
 * Correo de bienvenida que llega inmediatamente después de un pago
 * exitoso. Lo importante: comunicar el siguiente paso (ingresar al
 * dashboard a llenar el brief) y dar contexto del producto.
 */
export const welcomeTemplate: EmailTemplate<WelcomePayload> = ({
  email,
  customerName,
  planName,
  dashboardUrl,
}) => {
  const c = BRAND.colors;
  const greeting = customerName
    ? `Hola ${escapeHtml(customerName)},`
    : 'Hola,';

  const body = `
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${c.text};font-weight:600;">
              ${greeting}
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              ¡Gracias por confiar en <strong>${BRAND.name}</strong>! Tu compra del plan
              <strong>${escapeHtml(planName || 'PLIA')}</strong> fue procesada con éxito.
            </p>

            <h2 style="margin:24px 0 8px;font-size:17px;color:${c.text};font-weight:700;">¿Qué sigue?</h2>
            <ol style="margin:0 0 16px;padding-left:22px;font-size:14px;line-height:1.8;color:${c.text};">
              <li>Ingresa a tu cuenta <strong>${escapeHtml(email)}</strong> con la contraseña que configuraste.</li>
              <li>Completa el brief de tu negocio (paso a paso, te toma ~5 minutos).</li>
              <li>Nuestra IA construirá tu web profesional en menos de 24 horas.</li>
              <li>Revísala, pide ajustes si necesitas, y publícala.</li>
            </ol>

            <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${c.textMuted};">
              Si en algún momento te bloqueas o tienes dudas, respondemos rápido en
              <a href="mailto:${BRAND.supportEmail}" style="color:${c.text};font-weight:600;">${BRAND.supportEmail}</a>.
            </p>`;

  return {
    subject: `Bienvenido a ${BRAND.name}, ${customerName || 'emprendedor'} 🎉`,
    html: renderLayout({
      preheader: 'Tu cuenta está activa. Empieza a construir tu web ahora.',
      heading: `Bienvenido a ${BRAND.name}`,
      subheading: 'Tu cuenta está lista. Empecemos.',
      body,
      cta: { label: 'Ir a mi dashboard', href: dashboardUrl },
    }),
    text: `Bienvenido a PLIA, ${customerName || ''}.\n\nTu compra del plan ${planName || 'PLIA'} fue procesada con éxito.\n\nIngresa a tu dashboard: ${dashboardUrl}`,
  };
};
