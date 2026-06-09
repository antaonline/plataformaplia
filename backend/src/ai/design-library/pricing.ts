/**
 * BIBLIOTECA DE PRICING — Plia Design Library
 * Arquetipos de secciones de precios/planes (HTML-safe), destilados de los
 * componentes descargados de 21st.dev. Descripciones de patrón que el
 * generador inyecta para que Claude genere precios frescos adaptados.
 */

export interface PricingArchetype {
  id: string;
  name: string;
  bestFor: string;
  pattern: string;
}

export const PRICING_ARCHETYPES: PricingArchetype[] = [
  {
    id: 'three-tier-highlight',
    name: 'Three-Tier con plan destacado',
    bestFor: 'SaaS, servicios por niveles, suscripciones',
    pattern: `3 tarjetas de plan lado a lado (grid md:grid-cols-3). La del MEDIO destacada: escalada ligeramente (scale-105), borde accent, badge "Más popular" arriba, sombra de color. Cada card: nombre del plan, precio grande (font-mono o font-black 4-5xl) + sufijo /mes, descripción corta, lista de features con checkmarks SVG (check en círculo accent), y CTA pill al fondo (el destacado sólido accent, los otros outline). Fondo alternado.`,
  },
  {
    id: 'single-pricing-card',
    name: 'Single Pricing Card',
    bestFor: 'producto único, servicio con un solo plan, lifetime',
    pattern: `Una sola tarjeta de precio centrada y prominente: badge superior, precio grande con el ahorro tachado al lado si aplica, lista de TODO lo incluido con checkmarks, CTA grande full-width. Glassmorphism o borde accent. Ideal cuando hay una sola oferta. Rodeada de mucho espacio.`,
  },
  {
    id: 'bento-pricing',
    name: 'Bento Pricing',
    bestFor: 'startups modernas, productos tech',
    pattern: `Layout bento: tarjetas de distintos tamaños en grid asimétrico. El plan principal ocupa más espacio. Cards con backdrop-blur, bordes sutiles, badge + precio mono + features. Moderno y dinámico, rompe la simetría de las 3 columnas clásicas.`,
  },
  {
    id: 'pricing-table-comparison',
    name: 'Tabla comparativa',
    bestFor: 'B2B, software con muchas features, comparar planes',
    pattern: `Tabla de comparación: filas = features, columnas = planes. Headers de columna con nombre+precio+CTA sticky. Celdas con checkmarks SVG (incluido) o guion (no incluido), valores donde aplique. La columna recomendada resaltada con fondo accent suave. Clara para decisiones racionales.`,
  },
  {
    id: 'toggle-monthly-annual',
    name: 'Con toggle mensual/anual',
    bestFor: 'suscripciones con descuento anual',
    pattern: `3 planes + un TOGGLE arriba (switch "Mensual / Anual") que cambia los precios (con un <script> vanilla simple que actualiza los números y muestra "ahorra 20%"). Badge de ahorro en anual. Cards estándar con features y CTA. Interactivo sin librerías.`,
  },
  {
    id: 'glassy-animated',
    name: 'Glassy Animated Pricing',
    bestFor: 'marcas premium, productos elegantes',
    pattern: `Cards de precio con glassmorphism fuerte (backdrop-blur, fondo translúcido, borde con gradiente), sobre un fondo oscuro con un glow sutil detrás del plan destacado. Hover: la card se eleva (translateY) con sombra de color. Precio grande, features con íconos. Sofisticado.`,
  },
];

export function pickPricingArchetype(vibe?: string, brief?: string): PricingArchetype {
  const hay = `${vibe || ''} ${brief || ''}`.toLowerCase();
  const has = (kw: string[]) => kw.some((k) => hay.includes(k));
  let id = 'three-tier-highlight';
  if (has(['b2b', 'empresa', 'software', 'comparar', 'features'])) id = 'pricing-table-comparison';
  else if (has(['suscrip', 'membres', 'mensual', 'anual', 'plan'])) id = 'toggle-monthly-annual';
  else if (has(['premium', 'elegante', 'lujo', 'exclusiv'])) id = 'glassy-animated';
  else if (has(['startup', 'tech', 'moderno'])) id = 'bento-pricing';
  else if (has(['unico', 'lifetime', 'producto'])) id = 'single-pricing-card';
  return PRICING_ARCHETYPES.find((p) => p.id === id) || PRICING_ARCHETYPES[0];
}
