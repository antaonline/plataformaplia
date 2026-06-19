/**
 * BIBLIOTECA DE FOOTERS — Plia Design Library
 * ───────────────────────────────────────────
 * Arquetipos de footer curados (inspirados en patrones de 21st.dev community).
 * NO son código copiado — son DESCRIPCIONES DE PATRÓN que el generador inyecta
 * para que Claude genere un footer fresco en ese estilo, adaptado al negocio.
 *
 * Cada arquetipo cubre una "familia" visual distinta. El generador elige uno
 * según el vibe del proyecto (o aleatorio para variedad).
 */

import { pickFrom } from './_seed';

export interface FooterArchetype {
  id: string;
  name: string;
  /** Para qué tipo de negocio/vibe encaja mejor */
  bestFor: string;
  /** Descripción del patrón que se inyecta en el prompt */
  pattern: string;
}

export const FOOTER_ARCHETYPES: FooterArchetype[] = [
  {
    id: 'large-name',
    name: 'Large Name Footer',
    bestFor: 'marcas con personalidad, creativos, restaurantes premium',
    pattern: `Footer con el NOMBRE DE LA MARCA en tamaño GIGANTE (clamp(4rem,12vw,9rem), font-black, tracking-tight) ocupando todo el ancho como elemento gráfico dominante, en color con baja opacidad o gradiente sutil. Arriba del nombre gigante: una fila compacta con links de navegación y redes sociales (SVG). Debajo: copyright pequeño. Fondo oscuro. El nombre enorme ES la decoración. Impactante y memorable.`,
  },
  {
    id: 'glassmorphism-glow',
    name: 'Glassmorphism Glow Footer',
    bestFor: 'tecnología, startups, productos modernos, spa/bienestar',
    pattern: `Footer con efecto GLASSMORPHISM: contenedor con backdrop-blur, fondo radial semitransparente y borde sutil. Detrás, 2 círculos difuminados grandes (blur) en color accent creando un glow ambiental. Logo con ícono en círculo de gradiente accent. 3 columnas de navegación (con headers text-xs uppercase tracking-widest en accent). Redes sociales en íconos SVG con hover. Texto en color/70. Elegante, etéreo, premium.`,
  },
  {
    id: 'multi-column-corporate',
    name: 'Multi-Column Corporate Footer',
    bestFor: 'empresas, servicios profesionales, B2B, institucional',
    pattern: `Footer corporativo en grid responsivo de 5 columnas: 2 columnas para logo + descripción breve de la marca + redes sociales; 3 columnas de links agrupados en categorías (ej: Servicios, Empresa, Legal/Contacto) con headers font-medium. Separadores sutiles (borde top y bottom). Copyright abajo: centrado en mobile, alineado izquierda en desktop. Links con hover a color primary. Limpio, organizado, confiable.`,
  },
  {
    id: 'gradient-social',
    name: 'Gradient Centered Footer',
    bestFor: 'negocios locales amigables, cafeterías, tiendas, eventos',
    pattern: `Footer centrado con fondo de GRADIENTE vertical (de un tono oscuro de la marca a otro más profundo). Todo centrado verticalmente: logo/ícono arriba, nombre de marca, una frase corta de cierre emocional, fila de íconos de redes sociales (SVG) con hover scale, y copyright. Cálido, simple, acogedor. py-20 generoso.`,
  },
  {
    id: 'stacked-circular',
    name: 'Stacked Circular Footer',
    bestFor: 'marcas creativas, portfolios, productos lifestyle',
    pattern: `Footer con composición apilada y centrada: logo en círculo, navegación en fila, y redes sociales como íconos dentro de círculos con borde (rounded-full border) que al hover se rellenan con accent. Newsletter opcional (input + botón pill). Separador de línea fina. Copyright. Equilibrado, con los círculos como motivo visual repetido.`,
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean Footer',
    bestFor: 'profesionales independientes, consultores, diseño minimalista',
    pattern: `Footer minimalista: una sola fila (o dos en mobile) con logo/nombre a la izquierda, links centrales discretos, y redes sociales a la derecha. Línea divisoria fina arriba. Mucho espacio en blanco/negro. Copyright en una línea. Tipografía limpia, sin adornos. "Menos es más". Solo py-12.`,
  },
  {
    id: 'animated-underline',
    name: 'Animated Underline Footer',
    bestFor: 'agencias creativas, estudios, marcas con actitud',
    pattern: `Footer con links que tienen UNDERLINE ANIMADO al hover (background-size 0 100% → 100% 100%, transition .4s). Layout en columnas con CTA destacado (newsletter o "trabajemos juntos"). Header de columna en uppercase tracking-widest. Microinteracciones cuidadas en cada link. Fondo oscuro con un acento de color en hovers. Moderno y pulido.`,
  },
  {
    id: 'cta-banner-footer',
    name: 'CTA Banner + Footer',
    bestFor: 'negocios orientados a conversión, servicios, reservas',
    pattern: `Footer precedido por un BANNER CTA full-width: fondo con gradiente o color accent, titular grande ("¿Listo para empezar?"/"Visítanos hoy"), subtítulo y botón grande contrastante. Debajo, el footer real multi-columna con marca, links, redes y copyright sobre fondo oscuro. El banner cierra la venta antes del footer. Alto impacto de conversión.`,
  },
  {
    id: 'bento-footer',
    name: 'Bento Grid Footer',
    bestFor: 'tecnología, productos, marcas modernas, SaaS',
    pattern: `Footer en BENTO GRID: una retícula de tarjetas redondeadas (rounded-2xl/3xl, gap-3) de distintos tamaños sobre fondo oscuro. Una tarjeta grande con marca + claim, una con mapa/ubicación, una con newsletter (input + botón), una con redes (íconos grandes), una con links rápidos. Cada tarjeta con su propio fondo (color-mix sutil) y hover. Moderno, modular, tipo dashboard.`,
  },
  {
    id: 'newsletter-spotlight',
    name: 'Newsletter Spotlight Footer',
    bestFor: 'medios, e-commerce, comunidades, marcas que captan leads',
    pattern: `Footer cuyo PROTAGONISTA es la suscripción: bloque superior centrado con titular grande ("Únete a la comunidad"), input + botón pill en una fila ancha, y nota de privacidad pequeña. Debajo, fila inferior con marca a la izquierda, columnas de links compactas al centro y redes a la derecha, separadas por un borde fino. Fondo oscuro con un spotlight radial sutil detrás del titular.`,
  },
  {
    id: 'split-editorial',
    name: 'Split Editorial Footer',
    bestFor: 'estudios, arquitectura, moda, marcas editoriales premium',
    pattern: `Footer EDITORIAL a dos mitades: izquierda con un titular tipográfico grande tipo manifiesto ("Construyamos algo memorable") y un botón de contacto; derecha con columnas de links bien espaciadas en tipografía serif/elegante. Línea divisoria vertical fina entre ambas. Abajo, una franja con copyright, ubicación y redes en texto pequeño tracking-wide. Mucho aire, sofisticado.`,
  },
];

/**
 * Devuelve el CONJUNTO de footers compatibles con el vibe/rubro (no uno solo).
 * Así dos negocios del mismo rubro pueden recibir footers distintos.
 */
function compatibleFooters(vibe?: string, sector?: string): string[] {
  const hay = `${vibe || ''} ${sector || ''}`.toLowerCase();
  const match = (kw: string[]) => kw.some((k) => hay.includes(k));
  const pool = new Set<string>();

  if (match(['tech', 'software', 'startup', 'saas', 'app', 'digital', 'soporte'])) {
    ['glassmorphism-glow', 'bento-footer', 'animated-underline', 'minimal-clean', 'newsletter-spotlight'].forEach((x) => pool.add(x));
  }
  if (match(['empresa', 'corporat', 'consultor', 'b2b', 'legal', 'juridic', 'institucional', 'inmobil', 'contab', 'finanz', 'seguro', 'ingenier'])) {
    ['multi-column-corporate', 'minimal-clean', 'cta-banner-footer', 'split-editorial'].forEach((x) => pool.add(x));
  }
  if (match(['cafe', 'restaur', 'tienda', 'local', 'food', 'bar', 'panader', 'polleria', 'comercio', 'retail'])) {
    ['gradient-social', 'large-name', 'cta-banner-footer', 'stacked-circular', 'newsletter-spotlight'].forEach((x) => pool.add(x));
  }
  if (match(['creativ', 'agencia', 'estudio', 'portfolio', 'diseñ', 'arte', 'foto', 'arquitect', 'moda', 'boutique', 'joyer'])) {
    ['large-name', 'animated-underline', 'stacked-circular', 'split-editorial', 'minimal-clean'].forEach((x) => pool.add(x));
  }
  if (match(['spa', 'bienestar', 'yoga', 'salud', 'belleza', 'estetic', 'dental', 'fitness', 'gimnasio'])) {
    ['glassmorphism-glow', 'gradient-social', 'stacked-circular', 'cta-banner-footer'].forEach((x) => pool.add(x));
  }

  // Si no hubo match (o para garantizar variedad), usa TODOS los arquetipos.
  if (pool.size < 2) return FOOTER_ARCHETYPES.map((f) => f.id);
  return [...pool];
}

/**
 * Elige un arquetipo de footer ROTANDO entre los compatibles.
 * @param seed  texto estable (ej. nombre de marca) → mismo proyecto = mismo footer,
 *              distintos proyectos del mismo rubro = footers distintos.
 *              Si se omite, elige aleatorio (máxima variedad).
 */
export function pickFooterArchetype(vibe?: string, sector?: string, seed?: string): FooterArchetype {
  return byId(pickFrom(compatibleFooters(vibe, sector), seed));
}

function byId(id: string): FooterArchetype {
  return FOOTER_ARCHETYPES.find((f) => f.id === id) || FOOTER_ARCHETYPES[0];
}
