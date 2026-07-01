// Parámetros del programa de afiliados. Centralizados aquí para poder moverlos
// a una tabla de settings editable por admin más adelante sin tocar la lógica.

// Monto mínimo (en soles) que el afiliado debe tener disponible para retirar.
export const AFFILIATE_MIN_WITHDRAWAL = 50;

// Máximo de solicitudes de retiro que un afiliado puede hacer por mes calendario.
export const AFFILIATE_MAX_WITHDRAWALS_PER_MONTH = 2;

// SLA de pago: días hábiles dentro de los cuales se le paga al afiliado.
export const AFFILIATE_PAYOUT_SLA_BUSINESS_DAYS = 3

// Comisión de hosting: porcentaje del total pagado. El hosting cobra por plan
// (profesional/premium/agencia) y por plazo (1/12/24/48 meses), así que un
// monto fijo no sirve; el % escala solo con ambas variables. Landing/Web usan
// monto fijo (plan.affiliateCommission); solo hosting usa este porcentaje.
export const AFFILIATE_HOSTING_PERCENT = 5;

// Cookie de atribución y su duración (ventana de comisión).
export const AFFILIATE_COOKIE_NAME = 'plia_ref';
export const AFFILIATE_COOKIE_DAYS = 30;
