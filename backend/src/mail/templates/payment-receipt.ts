import { BRAND, escapeHtml, formatDateEs, formatMoney } from './brand';
import { EmailTemplate, renderDataCard, renderLayout } from './layout';

export interface PaymentReceiptPayload {
  customerEmail: string;
  /** Datos de facturación del cliente al momento del pago. */
  billingName?: string;
  billingAddress?: string;
  billingDepartment?: string;
  billingEmail?: string;
  /** Detalles de la compra. */
  planName: string;
  amount: number | string;
  currency?: string; // 'PEN' por defecto (Soles)
  orderId: number | string;
  paymentMethod?: string; // 'Tarjeta', 'Yape', etc.
  paidAt?: Date | string;
  invoiceNumber?: string;
  dashboardUrl: string;
}

/**
 * Comprobante de pago / recibo. Llega al cliente Y al admin (hola@plia.pe)
 * inmediatamente después de un pago confirmado por Izipay.
 */
export const paymentReceiptTemplate: EmailTemplate<PaymentReceiptPayload> = (
  p,
) => {
  const c = BRAND.colors;
  const billing = [
    p.billingName && { label: 'Razón social / Nombre', value: p.billingName },
    p.billingAddress && { label: 'Dirección', value: p.billingAddress },
    p.billingDepartment && { label: 'Departamento', value: p.billingDepartment },
    (p.billingEmail || p.customerEmail) && {
      label: 'Correo facturación',
      value: p.billingEmail || p.customerEmail,
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const purchase = [
    { label: 'Orden', value: `#${p.orderId}` },
    p.invoiceNumber && { label: 'Comprobante', value: p.invoiceNumber },
    { label: 'Plan', value: p.planName },
    p.paymentMethod && { label: 'Método', value: p.paymentMethod },
    p.paidAt && { label: 'Fecha', value: formatDateEs(p.paidAt) },
    { label: 'Total pagado', value: formatMoney(p.amount) },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const body = `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.text};">
              Hemos recibido tu pago correctamente. Este correo sirve como comprobante de tu compra.
            </p>

            ${renderDataCard({ title: 'Detalle de la compra', rows: purchase, tone: 'lime' })}

            ${
              billing.length > 0
                ? renderDataCard({
                    title: 'Datos de facturación',
                    rows: billing,
                    tone: 'neutral',
                  })
                : ''
            }

            <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:${c.textMuted};">
              Conserva este correo para tus registros. Si necesitas un comprobante formal SUNAT, escríbenos a
              <a href="mailto:${BRAND.supportEmail}" style="color:${c.text};font-weight:600;">${BRAND.supportEmail}</a>.
            </p>`;

  return {
    subject: `Recibo de pago PLIA — Orden #${p.orderId}`,
    html: renderLayout({
      preheader: `Comprobante de tu compra ${p.planName} por ${formatMoney(p.amount)}`,
      heading: 'Pago confirmado',
      subheading: `Gracias por tu compra · Orden #${p.orderId}`,
      body,
      cta: { label: 'Ir a mi cuenta', href: p.dashboardUrl },
    }),
    text: `Recibo de pago PLIA\n\nOrden: #${p.orderId}\nPlan: ${p.planName}\nMonto: ${formatMoney(p.amount)}\nFecha: ${formatDateEs(p.paidAt)}\n\nGracias por tu compra.`,
  };
};
