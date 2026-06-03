import { BRAND, escapeHtml } from './brand';
import { EmailTemplate, renderLayout } from './layout';

export interface CustomDomainAttachedPayload {
  customerName: string;
  customDomain: string;        // ej. "mi-marca.com"
  subdomain: string;           // ej. "cevicheriaperu.plia.pe"
  primaryUrl: string;          // ej. "https://mi-marca.com"
  fallbackUrl: string;         // ej. "https://cevicheriaperu.plia.pe"
}

/**
 * Se envía cuando el cliente vincula su dominio propio al sitio. El sitio
 * sigue funcionando en el subdominio plia.pe (como redirect 301), pero
 * ahora también responde en su dominio principal con SSL válido.
 */
export const customDomainAttachedTemplate: EmailTemplate<CustomDomainAttachedPayload> = (
  p,
) => {
  const c = BRAND.colors;
  const domain = p.customDomain;

  const body = `
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${c.text};font-weight:600;">
              ¡Hola ${escapeHtml(p.customerName)}! 🚀
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              Tu dominio <strong>${escapeHtml(domain)}</strong> ya está vinculado a tu sitio web.
              Cuando alguien visite tu dominio, va a ver tu web con SSL válido (candado verde 🔒).
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;border:2px solid ${c.cta};border-radius:14px;background:${c.surfaceMuted};">
              <tr>
                <td style="padding:20px 22px;text-align:center;">
                  <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;font-weight:800;color:${c.textMuted};margin-bottom:8px;">Tu dominio principal</div>
                  <a href="${escapeHtml(p.primaryUrl)}" style="display:inline-block;font-size:20px;font-weight:700;color:${c.text};text-decoration:none;word-break:break-all;">
                    ${escapeHtml(domain)}
                  </a>
                </td>
              </tr>
            </table>

            <h2 style="margin:24px 0 8px;font-size:17px;color:${c.text};font-weight:700;">¿Y el subdominio ${escapeHtml(p.subdomain)}?</h2>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${c.text};">
              Sigue funcionando como respaldo. Si alguien lo escribe, se le redirige
              automáticamente a tu dominio principal. Así no perdés visitas que vinieran
              con tu URL anterior.
            </p>

            <h2 style="margin:24px 0 8px;font-size:17px;color:${c.text};font-weight:700;">Próximos pasos sugeridos</h2>
            <ul style="margin:0 0 16px;padding-left:22px;font-size:14px;line-height:1.8;color:${c.text};">
              <li><strong>Actualizá tus redes sociales</strong> (Instagram, Facebook, LinkedIn) con tu nueva URL.</li>
              <li><strong>Cambiá la URL en tus tarjetas de presentación</strong> en próximas impresiones.</li>
              <li><strong>Tu firma de correo</strong> debería usar ${escapeHtml(domain)} de ahora en más.</li>
              <li>Si usás Google Search Console o Analytics, agregá la propiedad nueva.</li>
            </ul>

            <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${c.textMuted};">
              💡 La propagación DNS puede tardar hasta 24h en algunos puntos del mundo.
              Si alguien todavía no ve el sitio en ${escapeHtml(domain)}, esperá un rato más.
            </p>`;

  return {
    subject: `🌐 Tu dominio ${domain} ya está conectado`,
    html: renderLayout({
      preheader: `Tu web ya está disponible en ${p.primaryUrl}`,
      heading: 'Tu dominio propio ya está activo',
      subheading: domain,
      body,
      cta: { label: 'Visitar mi sitio', href: p.primaryUrl },
      footerNote: `El subdominio <code>${escapeHtml(p.subdomain)}</code> sigue funcionando como redirect automático.`,
    }),
    text: `¡Hola ${p.customerName}!

Tu dominio ${domain} ya está vinculado a tu sitio web.
Visitalo en: ${p.primaryUrl}

El subdominio ${p.subdomain} sigue funcionando como redirect al dominio principal.

Próximos pasos:
- Actualizá tus redes con la nueva URL
- Cambiá la URL en tarjetas y firma de correo
- Si usás Search Console o Analytics, agregá la propiedad nueva

La propagación DNS puede tardar hasta 24h en algunos puntos del mundo.

— PLIA`,
  };
};
