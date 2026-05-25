import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderLayout } from './layout';

export interface TwoFactorPayload {
  code: string;
  email: string;
}

/**
 * Código 2FA grande y centrado, estilo Facebook/Apple/Google.
 * El código se separa visualmente del resto para que sea fácil de leer
 * incluso desde la vista previa del cliente de correo.
 */
export const twoFactorTemplate: EmailTemplate<TwoFactorPayload> = ({
  code,
  email,
}) => {
  const c = BRAND.colors;
  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              Recibimos una solicitud de inicio de sesión para tu cuenta <strong>${escapeHtml(email)}</strong>.
              Ingresa este código en la pantalla de verificación:
            </p>

            <div style="margin:28px 0;text-align:center;">
              <div style="display:inline-block;padding:24px 36px;background:${c.surfaceMuted};border:2px solid ${c.cta};border-radius:18px;">
                <div style="font-family:'Courier New',ui-monospace,monospace;font-size:44px;font-weight:800;letter-spacing:0.28em;color:${c.text};line-height:1;">
                  ${escapeHtml(code)}
                </div>
              </div>
              <p style="margin:14px 0 0;font-size:12px;color:${c.textMuted};letter-spacing:0.04em;">
                EL CÓDIGO EXPIRA EN 10 MINUTOS
              </p>
            </div>

            <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${c.textMuted};">
              Si no fuiste tú quien intentó iniciar sesión, ignora este correo.
              Tu contraseña sigue siendo segura.
            </p>`;

  return {
    subject: `Tu código de verificación PLIA: ${code}`,
    html: renderLayout({
      preheader: `Tu código de verificación es ${code}`,
      heading: 'Código de verificación',
      subheading: 'Úsalo para completar tu inicio de sesión',
      body,
    }),
    text: `Tu código de verificación PLIA es: ${code}\n\nEste código expira en 10 minutos.\n\nSi no fuiste tú quien intentó iniciar sesión, ignora este correo.`,
  };
};
