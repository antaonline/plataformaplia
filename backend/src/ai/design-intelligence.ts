/**
 * PLIA DESIGN INTELLIGENCE
 * ────────────────────────
 * El "cerebro de diseño" propio de Plia. Es nuestra versión interna de un
 * skill tipo "UI/UX Pro Max": un conjunto denso de principios de diseño
 * premium que se inyecta en el system prompt del generador para elevar la
 * calidad de TODA web generada.
 *
 * Filosofía: no le decimos a la IA "hazlo bonito"; le damos las DECISIONES
 * concretas que toman los mejores estudios (Stripe, Linear, Vercel, Apple,
 * Awwwards winners) para que las aplique con criterio.
 *
 * Mantener DENSO y de alta señal — cada línea debe valer su costo en tokens.
 */

export const PLIA_DESIGN_INTELLIGENCE = `
═══════════════════════════════════════════════════════════
PLIA DESIGN INTELLIGENCE — criterio de estudio de élite
═══════════════════════════════════════════════════════════

JERARQUÍA TIPOGRÁFICA (la base de todo diseño premium):
- Escala modular clara: hero clamp(3rem,7vw,6rem) → títulos sección clamp(2rem,4vw,3.25rem) → subtítulos 1.25-1.5rem → body 1-1.125rem → labels 0.7-0.8rem uppercase tracking-widest.
- Contraste de peso DRAMÁTICO: títulos font-black/800-900, body font-light/300-400. El contraste de pesos es lo que se ve "caro".
- Títulos con tracking-tight (letter-spacing:-0.02em) y line-height ajustado (1.05-1.15). Body con line-height generoso (1.7-1.85) para legibilidad.
- Una palabra clave del título en color accent o italic para foco visual (ej: "El alma del <em>café peruano</em>").

ESPACIADO Y RITMO (lo que separa amateur de pro):
- Secciones con padding vertical generoso: py-20 a py-32. El "aire" comunica lujo.
- Contenido en contenedor max-w-7xl mx-auto px-6. Nunca texto de borde a borde.
- Ritmo vertical consistente: usar múltiplos (gap-4, gap-8, gap-16). Espaciado entre título de sección y contenido: mb-12/mb-16.
- Ancho de línea de lectura: max-w-2xl/max-w-prose en párrafos largos (45-75 caracteres por línea).

COLOR CON SOFISTICACIÓN:
- NUNCA negro puro (#000) ni blanco puro (#fff). Usar #0a0a0a, #111827, #f9fafb, #fafafa.
- Gradientes multi-stop (3+ paradas), no planos. Overlays de hero con gradientes complejos.
- Sombras de COLOR, no grises: box-shadow con el tono del accent a baja opacidad (ej: 0 20px 60px rgba(accent,.15)).
- Bordes sutiles: 1px con el accent a baja opacidad (rgba(accent,.15-.3)) en cards oscuras.
- Paleta de 3: primary (base/oscuro), accent (acción/destaque), neutral (texto/fondos). Disciplina cromática.

LAYOUT INTENCIONAL (romper la monotonía):
- ALTERNAR: si una sección es centrada, la siguiente split 2-col; si una es clara, la siguiente oscura. Dos secciones consecutivas iguales = error.
- Composiciones asimétricas donde aporten: hero con texto a un lado + visual al otro; galería con grid masonry (una imagen grande + varias pequeñas).
- Bento grids para features/stats (cajas de distintos tamaños).
- Storytelling/nosotros: SIEMPRE split texto + imagen lateral grande, nunca card centrada de texto.

PROFUNDIDAD Y CAPAS:
- Glassmorphism con criterio: backdrop-blur en nav sticky y en cards flotantes sobre imágenes (bg-white/10 backdrop-blur border border-white/15).
- Elementos decorativos sutiles: círculos de gradiente radial difuminados detrás de secciones (radial-gradient con opacity .03-.08), líneas finas de acento.
- Badges flotantes superpuestos a imágenes (un "100% origen" sobre la foto del producto) para dinamismo.

MICROINTERACCIONES (el detalle que enamora):
- Botones: hover con translateY(-2px) + sombra de color + filter brightness. Transición .25-.3s cubic-bezier(.4,0,.2,1).
- Cards: hover translateY(-6px) + sombra más profunda + borde accent.
- Imágenes: hover scale(1.05-1.08) con overflow-hidden en el contenedor y transition .5-.6s.
- Links de nav: underline animado (background-size 0 100% → 100% 100%).
- CTAs principales: un sutil pulse o glow para llamar la atención.

ICONOGRAFÍA:
- SVG inline estilo Lucide/Heroicons (stroke 1.5-2px, paths reales y elegantes). NUNCA emojis como iconos principales.
- Iconos en contenedores: círculo/cuadrado redondeado con fondo accent a baja opacidad, icono en color accent.

CONVERSIÓN (es una página que VENDE):
- Hero: propuesta de valor clara en 1 frase + subtítulo que explica el beneficio + 2 CTAs (primario sólido + secundario outline). Badge de confianza arriba (ubicación, años, rating).
- Prueba social temprana: stats o mini-testimonios cerca del hero generan confianza.
- CTAs repetidos a lo largo del scroll (hero, mitad, CTA banner final). Verbos de acción ("Reserva", "Descubre", "Visítanos").
- Testimonios con rostro/inicial, nombre, rol y resultado específico — concretos, no genéricos.
- Reducir fricción en el formulario: solo campos necesarios.

ESTÁNDAR FINAL:
Si la página se ve como una plantilla genérica de Bootstrap, FALLASTE. Debe sentirse diseñada a medida por un estudio que cobra miles de dólares: tipografía con carácter, espaciado respirado, color sofisticado, layouts que rompen el ritmo, y detalles que sorprenden al hacer scroll.
`.trim();
