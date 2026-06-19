/**
 * BIBLIOTECA DE TESTIMONIOS — Plia Design Library
 * Arquetipos de secciones de prueba social (HTML-safe), destilados de los
 * componentes descargados de 21st.dev.
 */

import { pickFrom } from './_seed';

export interface TestimonialArchetype {
  id: string;
  name: string;
  bestFor: string;
  pattern: string;
}

export const TESTIMONIAL_ARCHETYPES: TestimonialArchetype[] = [
  {
    id: 'cards-grid',
    name: 'Grid de tarjetas',
    bestFor: 'la mayoría de negocios, prueba social directa',
    pattern: `Grid de 2-3 tarjetas de testimonio. Cada card: comilla decorativa grande (font-serif 6-8rem, opacity .08, posición absolute detrás), texto del testimonio entrecomillado, abajo avatar circular (inicial del nombre en círculo con gradiente accent), nombre en bold, rol/ubicación, y 5 estrellas SVG. Hover: la card se eleva con sombra. Fondo alternado.`,
  },
  {
    id: 'masonry-columns',
    name: 'Columnas masonry',
    bestFor: 'cuando hay muchos testimonios, marcas con tracción',
    pattern: `Varias columnas de testimonios de distinta altura (columns-1 md:columns-3, estilo masonry/Pinterest). Cada tarjeta compacta: texto + avatar + nombre + rol. Da sensación de abundancia de reseñas. Opcional: efecto de scroll vertical infinito sutil con CSS animation en cada columna (direcciones alternas).`,
  },
  {
    id: 'single-featured',
    name: 'Testimonio destacado grande',
    bestFor: 'un caso de éxito potente, marca personal',
    pattern: `Un solo testimonio protagonista, centrado y grande: comilla, frase impactante en tipografía grande (2-3rem, font-light), y abajo avatar + nombre + rol + empresa. Mucho aire alrededor. Foco total en una historia poderosa. Opcional: logo de la empresa del cliente.`,
  },
  {
    id: 'carousel-slider',
    name: 'Carrusel deslizante',
    bestFor: 'ahorrar espacio, varios testimonios rotando',
    pattern: `Carrusel horizontal de testimonios con flechas y/o dots de navegación, controlado por un <script> vanilla (scroll-snap + botones prev/next). Cada slide: card con texto, avatar, nombre, rol, estrellas. Auto-play opcional. Compacto y elegante. Usa scroll-snap-type para suavidad sin librerías.`,
  },
  {
    id: 'with-stats-bar',
    name: 'Testimonios + barra de stats',
    bestFor: 'reforzar con números de confianza',
    pattern: `2-3 tarjetas de testimonio arriba + una BARRA DE STATS abajo: 3 números grandes (ej: 4.9 rating, +320 reseñas, 98% recompra) con etiqueta, separados por líneas finas, sobre fondo accent suave. Combina prueba social cualitativa (testimonios) y cuantitativa (números).`,
  },
  {
    id: 'glass-swiper',
    name: 'Glass Testimonial Swiper',
    bestFor: 'marcas premium, productos elegantes',
    pattern: `Testimonios en tarjetas glassmorphism (backdrop-blur, borde translúcido) sobre fondo oscuro con glow. Una card central destacada más grande, laterales más pequeñas/difuminadas (efecto coverflow logrado con transform/opacity en CSS). Avatar con anillo accent. Sofisticado.`,
  },
];

/** Conjunto de testimonios compatibles con el vibe/rubro (varios, no uno). */
function compatibleTestimonials(vibe?: string, brief?: string): string[] {
  const hay = `${vibe || ''} ${brief || ''}`.toLowerCase();
  const has = (kw: string[]) => kw.some((k) => hay.includes(k));
  const pool = new Set<string>();
  if (has(['premium', 'elegante', 'lujo', 'exclusiv', 'spa', 'estetic', 'joyer', 'hotel'])) {
    ['glass-swiper', 'single-featured', 'cards-grid'].forEach((x) => pool.add(x));
  }
  if (has(['marca personal', 'coach', 'caso de exito', 'consultor', 'abogad', 'juridic'])) {
    ['single-featured', 'cards-grid', 'with-stats-bar'].forEach((x) => pool.add(x));
  }
  if (has(['startup', 'saas', 'tech', 'traccion', 'muchos', 'software', 'app'])) {
    ['masonry-columns', 'cards-grid', 'carousel-slider', 'with-stats-bar'].forEach((x) => pool.add(x));
  }
  if (has(['rating', 'reseñas', 'confianza', 'numeros', 'salud', 'clinic', 'restaur', 'tienda'])) {
    ['with-stats-bar', 'cards-grid', 'carousel-slider'].forEach((x) => pool.add(x));
  }
  if (pool.size < 2) return TESTIMONIAL_ARCHETYPES.map((t) => t.id);
  return [...pool];
}

/** Elige testimonios rotando entre los compatibles (seed = marca para variar). */
export function pickTestimonialArchetype(vibe?: string, brief?: string, seed?: string): TestimonialArchetype {
  const chosen = pickFrom(compatibleTestimonials(vibe, brief), seed);
  return TESTIMONIAL_ARCHETYPES.find((t) => t.id === chosen) || TESTIMONIAL_ARCHETYPES[0];
}
