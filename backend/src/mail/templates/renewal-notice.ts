import { BRAND, escapeHtml, formatMoney } from './brand';
import { EmailTemplate, renderLayout } from './layout';

export interface RenewalNoticePayload {
  customerName?: string;
  daysLeft: 14 | 7 | 1;
  amount?: number;
  renewUrl: string;
}

/**
 * Aviso de renovación de hosting. Tres tonos según los días que quedan
 * (14, 7, 1).
 */
export const renewalNoticeTemplate: EmailTemplate<RenewalNoticePayload> = (p) => {
  const c = BRAND.colors;
  const isUrgent = p.daysLeft <= 1;
  const isWarning = p.daysLeft <= 7;

  const heading = isUrgent
    ? 'Tu hosting vence mañana'
    : isWarning
      ? `Tu hosting vence en ${p.daysLeft} días`
      : 'Renovación de hosting pendiente';

  const tone = isUrgent
    ? 'urgente'
    : isWarning
      ? 'importante'
      : 'recordatorio';

  const intro = isUrgent
    ? `Tu hosting <strong>vence mañana</strong>. Si no renuevas, tu sitio será eliminado del servidor para liberar recursos.`
    : isWarning
      ? `Tu hosting vence en <strong>${p.daysLeft} días</strong>. Renueva ahora para evitar interrupciones en tu sitio.`
      : `Tu hosting vence en <strong>14 días</strong>. Te queda tiempo de sobra para renovar.`;

  const amountLine = p.amount
    ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${c.text};">
              Monto a renovar: <strong>${formatMoney(p.amount)}</strong>
            </p>`
    : '';

  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              ${intro}
            </p>
            ${amountLine}
            <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${c.textMuted};">
              Si ya renovaste, ignora este correo. Podemos tardar unos minutos en sincronizar.
            </p>`;

  return {
    subject: heading,
    html: renderLayout({
      preheader: `${tone}: tu hosting vence en ${p.daysLeft} día${p.daysLeft === 1 ? '' : 's'}`,
      heading,
      subheading: 'No pierdas tu sitio web',
      body,
      cta: { label: 'Renovar ahora', href: p.renewUrl },
    }),
    text: `${heading}.\n\nRenueva aquí: ${p.renewUrl}`,
  };
};
