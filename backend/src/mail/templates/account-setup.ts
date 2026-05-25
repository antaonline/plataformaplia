import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderLayout } from './layout';

export interface AccountSetupPayload {
  email: string;
  setupUrl: string;
}

/**
 * Correo que se envía después de un pago exitoso para que el cliente
 * configure su contraseña y acceda a su cuenta por primera vez.
 */
export const accountSetupTemplate: EmailTemplate<AccountSetupPayload> = ({
  email,
  setupUrl,
}) => {
  const c = BRAND.colors;
  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              ¡Bienvenido a <strong>${BRAND.name}</strong>! Tu cuenta ha sido creada con el correo <strong>${escapeHtml(email)}</strong>.
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              Para acceder, primero configura tu contraseña haciendo clic en el botón.
              El enlace es de un solo uso y caduca en 24 horas.
            </p>`;

  return {
    subject: 'Configura tu contraseña PLIA',
    html: renderLayout({
      preheader: 'Crea tu contraseña para acceder a tu cuenta PLIA',
      heading: 'Configura tu contraseña',
      subheading: `Activa tu cuenta ${email}`,
      body,
      cta: { label: 'Configurar contraseña', href: setupUrl },
      footerNote:
        'Si no esperabas este correo, ignóralo. Nadie puede acceder a tu cuenta sin completar este paso.',
    }),
    text: `Bienvenido a PLIA. Configura tu contraseña aquí: ${setupUrl}\n\nEl enlace caduca en 24 horas.`,
  };
};
