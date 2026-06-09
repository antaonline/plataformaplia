/**
 * BIBLIOTECA DE HEROS — Plia Design Library
 * ─────────────────────────────────────────
 * Arquetipos de hero curados, cubriendo las familias de diseño de la comunidad
 * de 21st.dev. Descripciones de patrón (NO código copiado) que el generador
 * inyecta para que Claude genere un hero fresco en ese estilo.
 *
 * htmlSafe: true  → apto para landings HTML estáticas (CSS/Tailwind, ligero).
 * htmlSafe: false → usa WebGL/three.js/shaders/canvas pesado. SOLO para iachat
 *                   (React). En HTML el generador lo omite o lo simplifica.
 */

export interface HeroArchetype {
  id: string;
  name: string;
  bestFor: string;
  htmlSafe: boolean;
  pattern: string;
}

export const HERO_ARCHETYPES: HeroArchetype[] = [
  // ── LIGEROS (aptos para HTML landing) ──────────────────────────────
  {
    id: 'split-image-text',
    name: 'Split Image + Text',
    bestFor: 'productos, servicios, negocios con foto fuerte',
    htmlSafe: true,
    pattern: `Hero en 2 columnas: izquierda titular grande (clamp 3-6rem font-black), subtítulo, 2 CTAs y badge de confianza; derecha imagen grande con bordes redondeados, sombra profunda y un badge flotante superpuesto (ej: "100% origen"). En mobile se apila. Fondo limpio. Equilibrado y directo.`,
  },
  {
    id: 'fullbleed-overlay',
    name: 'Full-Bleed Image Overlay',
    bestFor: 'restaurantes, hoteles, experiencias, lifestyle',
    htmlSafe: true,
    pattern: `Hero min-h-screen con imagen de fondo a sangre completa (object-cover) + overlay con gradiente COMPLEJO de 3 stops oscureciendo para legibilidad. Contenido centrado o alineado: badge de ubicación arriba, titular huge con una palabra en accent/italic, subtítulo, 2 CTAs. Scroll indicator abajo. Cinematográfico, premium.`,
  },
  {
    id: 'gradient-aurora',
    name: 'Aurora Gradient Background',
    bestFor: 'tech, startups, SaaS, productos digitales',
    htmlSafe: true,
    pattern: `Hero con fondo de gradiente "aurora" animado solo con CSS (background con conic/linear-gradient + animation de posición suave, o blobs difuminados que flotan con @keyframes). Titular centrado huge, subtítulo, CTA pill con glow. Sin WebGL — el aurora se logra con gradientes CSS y blur. Moderno y etéreo.`,
  },
  {
    id: 'spotlight-glow',
    name: 'Spotlight / Lamp Glow',
    bestFor: 'tech premium, lanzamientos, marcas oscuras elegantes',
    htmlSafe: true,
    pattern: `Hero oscuro con un foco de luz (spotlight) detrás del titular: un gradiente radial/cónico que ilumina desde arriba (efecto "lamp") logrado con CSS (radial-gradient + blur + opacity). Titular centrado brillante, subtítulo tenue, CTA. Dramático, foco total en el mensaje. Fondo casi negro.`,
  },
  {
    id: 'grid-dot-pattern',
    name: 'Grid / Dot Pattern Background',
    bestFor: 'tech, B2B, herramientas, dashboards',
    htmlSafe: true,
    pattern: `Hero con fondo de patrón de cuadrícula o puntos sutil (CSS background-image con linear-gradient repetido o radial-gradient dots), con un fade radial (mask) hacia los bordes. Titular grande, subtítulo, CTAs. Opcional: un "beam" de luz que cruza la grid. Limpio, técnico, ordenado.`,
  },
  {
    id: 'badge-pill-centered',
    name: 'Badge/Pill Centered Hero',
    bestFor: 'SaaS, anuncios de producto, startups',
    htmlSafe: true,
    pattern: `Hero centrado clásico-premium: arriba un PILL/BADGE pequeño con borde y punto (ej: "Novedad · 2x1 los viernes") a veces con animación de brillo; debajo titular huge font-black, subtítulo max-w-2xl, 2 CTAs centrados, y opcionalmente logos de confianza o avatares + rating. Mucho aire. El estándar de los mejores SaaS.`,
  },
  {
    id: 'text-animation',
    name: 'Animated Text Hero',
    bestFor: 'agencias, portfolios, marcas con actitud',
    htmlSafe: true,
    pattern: `Hero centrado donde el TITULAR tiene una palabra que cambia/anima: rotación de palabras (text-rotate), typewriter, o reveal por letras — logrado con CSS @keyframes + un pequeño <script> vanilla (sin librerías). Ej: "El mejor café [peruano/de especialidad/artesanal]". Subtítulo, CTA. Dinámico y memorable.`,
  },
  {
    id: 'product-mockup',
    name: 'Product Mockup Hero',
    bestFor: 'apps, software, productos digitales, e-commerce',
    htmlSafe: true,
    pattern: `Hero con texto arriba (titular + subtítulo + CTAs centrados) y debajo un MOCKUP grande del producto (screenshot en un marco de navegador/dispositivo) con sombra profunda y un sutil tilt/perspective. El mockup puede tener un border-beam o glow. Ideal para mostrar el producto en acción.`,
  },
  {
    id: 'enterprise-dual-cta',
    name: 'Enterprise Dual-CTA',
    bestFor: 'empresas, servicios profesionales, B2B',
    htmlSafe: true,
    pattern: `Hero corporativo: titular sobrio pero grande, subtítulo claro de propuesta de valor, 2 CTAs (primario "Empezar" + secundario "Hablar con ventas"), fila de logos de clientes/partners en escala de grises abajo. Layout centrado o split. Transmite confianza y solidez. Paleta profesional.`,
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean Hero',
    bestFor: 'profesionales, estudios de diseño, marcas premium sobrias',
    htmlSafe: true,
    pattern: `Hero minimalista: muchísimo espacio en blanco/negro, titular grande con tipografía de carácter (serif elegante o sans geométrica), una línea de subtítulo, un solo CTA discreto. Sin imágenes de fondo ni adornos. La tipografía y el espacio SON el diseño. Sofisticado, "menos es más".`,
  },
  {
    id: 'shape-geometric',
    name: 'Geometric Shapes Hero',
    bestFor: 'creativos, marcas modernas, eventos',
    htmlSafe: true,
    pattern: `Hero con formas geométricas flotantes de fondo (círculos, blobs, líneas, paths) en colores de la paleta con baja opacidad, animadas suavemente con CSS (@keyframes float/rotate). Titular centrado encima. Composición lúdica pero elegante. Todo CSS, sin librerías pesadas.`,
  },
  {
    id: 'meteors-beams',
    name: 'Meteors / Beams Hero',
    bestFor: 'tech oscuro, lanzamientos, gaming, cripto',
    htmlSafe: true,
    pattern: `Hero oscuro con "meteoros" o "beams" de luz cruzando el fondo (líneas con gradiente que se desplazan vía CSS @keyframes), o haces de luz verticales sutiles. Titular brillante centrado, CTA con glow. Efecto logrado con CSS + spans posicionados, sin canvas. Futurista.`,
  },
  {
    id: 'glassmorphism-trust',
    name: 'Glassmorphism Trust Hero',
    bestFor: 'fintech, salud, servicios que venden confianza',
    htmlSafe: true,
    pattern: `Hero con una tarjeta de cristal (glassmorphism: backdrop-blur, fondo semitransparente, borde sutil) flotando sobre un fondo con gradiente suave. Dentro de la card: titular, subtítulo, CTA y elementos de confianza (rating, "+200 clientes", badges). Profesional y moderno.`,
  },
  {
    id: 'gallery-scroll',
    name: 'Image Gallery / Bento Hero',
    bestFor: 'fotografía, portfolios, lifestyle, inmobiliaria',
    htmlSafe: true,
    pattern: `Hero donde el protagonista es un mosaico/bento de imágenes (grid asimétrico de 3-5 fotos de distintos tamaños) con hover scale, y el texto (titular + CTA) integrado en una de las celdas o superpuesto. Visual, rico, muestra mucho contenido de golpe.`,
  },
  {
    id: 'gradient-bar-side',
    name: 'Gradient Bar / Asymmetric Hero',
    bestFor: 'marcas creativas, música, moda',
    htmlSafe: true,
    pattern: `Hero asimétrico con una barra/bloque de gradiente vibrante a un lado (o diagonal con clip-path), titular grande del otro lado, y composición que rompe la simetría. Colores saturados con gradientes multi-stop. Energético y con personalidad.`,
  },
  {
    id: 'video-background',
    name: 'Video Background Hero',
    bestFor: 'restaurantes, eventos, marcas con buen material audiovisual',
    htmlSafe: true,
    pattern: `Hero con <video> de fondo en loop, muted, autoplay, playsinline + poster (imagen de respaldo). Overlay oscuro para legibilidad. Titular + CTAs encima. NOTA: solo usar si hay video; si no, caer a fullbleed-overlay con imagen. Inmersivo.`,
  },
  {
    id: 'noise-grain-gradient',
    name: 'Grain Gradient Hero',
    bestFor: 'marcas premium, editorial, café/gastronomía gourmet',
    htmlSafe: true,
    pattern: `Hero con fondo de gradiente cálido + una textura sutil de grano/ruido (CSS con SVG feTurbulence como background, opacity baja). Da una sensación táctil, editorial, analógica. Titular serif elegante, subtítulo, CTA. Sofisticado y cálido.`,
  },

  // ── PESADOS (solo React / iachat — WebGL, three.js, shaders) ───────
  {
    id: 'shader-fluid',
    name: 'Shader / Fluid Background (React only)',
    bestFor: 'tech de vanguardia, productos AI, lanzamientos premium',
    htmlSafe: false,
    pattern: `Hero con fondo de shader WebGL (fluido, aurora generativa, ondas). Requiere three.js/ogl/canvas. Titular encima. SOLO para apps React (iachat) con las librerías instaladas. En HTML estático, sustituir por 'gradient-aurora' (versión CSS).`,
  },
  {
    id: 'particles-interactive',
    name: 'Interactive Particles (React only)',
    bestFor: 'tech, AI, gaming, experiencias interactivas',
    htmlSafe: false,
    pattern: `Hero con sistema de partículas interactivo (reaccionan al cursor) vía canvas/WebGL. Titular encima. SOLO React (iachat). En HTML sustituir por 'meteors-beams' o 'grid-dot-pattern'.`,
  },
  {
    id: 'three-d-object',
    name: '3D Object Hero (React only)',
    bestFor: 'productos 3D, gaming, tech, robótica',
    htmlSafe: false,
    pattern: `Hero con un objeto 3D interactivo (globo, robot, modelo de producto) renderizado con three.js/react-three-fiber. SOLO React (iachat). En HTML sustituir por 'product-mockup' (imagen) o 'spotlight-glow'.`,
  },
  {
    id: 'scroll-expansion',
    name: 'Scroll Expansion / Parallax Hero (React only)',
    bestFor: 'storytelling, productos premium, portfolios',
    htmlSafe: false,
    pattern: `Hero donde una imagen/contenedor se expande o hace parallax al hacer scroll (container-scroll, hero-parallax). Requiere framer-motion + scroll listeners. SOLO React (iachat). En HTML sustituir por 'fullbleed-overlay' con un parallax CSS simple.`,
  },
  {
    id: 'ascii-vhs-retro',
    name: 'ASCII / VHS / Retro Hero (React only)',
    bestFor: 'gaming retro, marcas con estética techno/glitch',
    htmlSafe: false,
    pattern: `Hero con efecto ASCII art, VHS glitch o dithering animado vía canvas/shader. SOLO React (iachat). En HTML sustituir por 'text-animation' o 'noise-grain-gradient'.`,
  },
];

/** Elige un hero según el vibe/sector y si necesitamos versión HTML-safe. */
export function pickHeroArchetype(
  vibe: string | undefined,
  brief: string | undefined,
  htmlOnly: boolean,
): HeroArchetype {
  const hay = `${vibe || ''} ${brief || ''}`.toLowerCase();
  const pool = htmlOnly ? HERO_ARCHETYPES.filter((h) => h.htmlSafe) : HERO_ARCHETYPES;
  const match = (kw: string[]) => kw.some((k) => hay.includes(k));

  let id = '';
  if (match(['restaur', 'cafe', 'hotel', 'bar', 'gastron', 'comida'])) id = 'fullbleed-overlay';
  else if (match(['cafe gourmet', 'editorial', 'premium', 'artesan'])) id = 'noise-grain-gradient';
  else if (match(['tech', 'software', 'saas', 'app', 'startup', 'digital', 'ai', 'plataforma'])) id = 'gradient-aurora';
  else if (match(['empresa', 'corporat', 'b2b', 'consultor', 'servicio', 'legal', 'contab'])) id = 'enterprise-dual-cta';
  else if (match(['foto', 'portfolio', 'inmobil', 'galer', 'lifestyle', 'arquitect'])) id = 'gallery-scroll';
  else if (match(['fintech', 'salud', 'clinic', 'dental', 'segur'])) id = 'glassmorphism-trust';
  else if (match(['producto', 'tienda', 'ecommerce', 'shop'])) id = 'product-mockup';
  else if (match(['creativ', 'agencia', 'estudio', 'musica', 'moda', 'arte'])) id = 'gradient-bar-side';
  else if (match(['profesional', 'minimal', 'abogad', 'coach'])) id = 'minimal-clean';
  else id = 'split-image-text';

  const found = pool.find((h) => h.id === id);
  if (found) return found;
  // Fallback a uno HTML-safe sólido
  return pool.find((h) => h.id === 'fullbleed-overlay') || pool[0];
}
