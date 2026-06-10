/**
 * Meta Pixel (Facebook Pixel) — Utilidades
 *
 * Cómo obtener tu Pixel ID:
 * 1. Ir a Meta Business Suite → Events Manager
 * 2. Crear un nuevo Pixel (si no tienes uno)
 * 3. Copiar el Pixel ID (16 dígitos, ej: 1234567890123456)
 * 4. Agregarlo a tu .env.local:
 *    NEXT_PUBLIC_META_PIXEL_ID=tu_pixel_id_aqui
 *
 * Eventos que se trackean:
 * - PageView: automático en cada página (layout.tsx)
 * - ViewContent: cuando alguien ve la página de planes
 * - Lead: cuando alguien hace click en "Ir a WhatsApp" o "Contactar"
 * - InitiateCheckout: cuando alguien llega a /checkout
 * - Purchase: cuando el pago se confirma
 *
 * Con estos eventos puedes crear en Ads Manager:
 * - Audiencia de retargeting: "Visitaron checkout pero no compraron"
 * - Audiencia de Lookalike: "Similar a mis clientes" (basado en Purchase)
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Tipos de eventos estándar de Meta
export type MetaPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Lead'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Contact'
  | 'CustomizeProduct';

// Parámetros opcionales para eventos
export interface PixelEventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}

/**
 * Trackea un evento de Meta Pixel.
 * Solo funciona en el cliente (usa window.fbq).
 */
export function trackEvent(
  event: MetaPixelEvent,
  params?: PixelEventParams,
): void {
  if (typeof window === 'undefined') return;
  if (!META_PIXEL_ID) return;
  if (!(window as any).fbq) return;

  try {
    if (params) {
      (window as any).fbq('track', event, params);
    } else {
      (window as any).fbq('track', event);
    }
  } catch (e) {
    // Silencioso — no queremos errores del pixel en producción
  }
}

/**
 * Trackea ViewContent cuando alguien ve la página de planes.
 * Llamar desde la página /planes o la home.
 */
export function trackViewPlans(planName?: string): void {
  trackEvent('ViewContent', {
    content_name: planName || 'Planes Plia',
    content_category: 'planes',
    currency: 'PEN',
  });
}

/**
 * Trackea Lead cuando alguien hace click en el botón de WhatsApp.
 * Llamar desde el componente del botón de WhatsApp.
 */
export function trackWhatsAppClick(planName?: string): void {
  trackEvent('Lead', {
    content_name: planName || 'WhatsApp Contact',
    content_category: 'contacto',
  });
}

/**
 * Trackea InitiateCheckout cuando alguien llega a /checkout.
 * Llamar desde la página de checkout.
 */
export function trackInitiateCheckout(plan: 'landing' | 'web'): void {
  trackEvent('InitiateCheckout', {
    content_name: plan === 'landing' ? 'Plan Landing Page' : 'Plan Web Corporativa',
    content_category: 'checkout',
    value: plan === 'landing' ? 390 : 690,
    currency: 'PEN',
    num_items: 1,
  });
}

/**
 * Trackea Purchase cuando el pago se confirma.
 * Llamar desde la página de confirmación de pago (/checkout/success o similar).
 */
export function trackPurchase(plan: 'landing' | 'web', orderId?: string): void {
  trackEvent('Purchase', {
    content_name: plan === 'landing' ? 'Plan Landing Page' : 'Plan Web Corporativa',
    content_category: 'compra',
    value: plan === 'landing' ? 390 : 690,
    currency: 'PEN',
    content_ids: orderId ? [orderId] : undefined,
  });
}
