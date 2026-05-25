/**
 * Tokens de marca PLIA centralizados para todos los emails.
 * Cambiar aquí afecta TODOS los templates de una sola vez.
 */

export const BRAND = {
  name: 'PLIA',
  tagline: 'Tu Web Fácil',
  supportEmail: 'soporte@plia.pe',
  websiteUrl: 'https://plia.pe',

  /**
   * Paleta derivada de globals.css de la plataforma:
   *   --cta: 75 100% 50%       -> #BFFF00 (lime electric PLIA)
   *   --cta-foreground: 220 20% 10% -> #141A21 (dark navy)
   */
  colors: {
    // Fondos
    darkBg: '#141A21',
    darkBg2: '#1F2730',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    // Marca
    cta: '#BFFF00',
    ctaForeground: '#141A21',
    ctaHover: '#A8E600',
    // Texto
    text: '#141A21',
    textMuted: '#6B7280',
    textInverse: '#FFFFFF',
    textInverseMuted: '#CBD5E1',
    // Bordes / divisores
    border: '#E5E7EB',
    borderDark: '#2A3441',
    // Estados
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
  },

  /**
   * Logos PNG (más compatibles con clientes de correo que SVG).
   * Como tenemos solo SVG, los servimos desde plia.pe; los principales
   * clientes (Gmail, Outlook web, Apple Mail) renderizan SVG remotos.
   * Si en el futuro hay problemas, exportar a PNG y actualizar aquí.
   */
  logos: {
    light: 'https://plia.pe/plia-logo-white.svg', // para fondos oscuros
    dark: 'https://plia.pe/plia-logo-black.svg', // para fondos claros
    icon: 'https://plia.pe/iconplia.svg', // solo el ícono "P"
  },
};

/**
 * Escape de HTML para evitar inyección desde datos del usuario.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formatea una fecha en formato legible para correos en español.
 */
export function formatDateEs(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * Formatea un monto en Soles con separadores y 2 decimales.
 */
export function formatMoney(amount: number | string | null | undefined): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'S/ 0.00';
  return `S/ ${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
