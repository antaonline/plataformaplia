/**
 * INTENCIONES DE SITIO — "¿Qué necesitas?"
 * ─────────────────────────────────────────
 * Define el OBJETIVO de la web que elige el cliente. Cada intención dirige la
 * generación: qué secciones priorizar, el tono del copy y la estrategia de CTA.
 * Esto hace que la web sea mucho más precisa y personalizada.
 *
 * El frontend muestra estas opciones como tarjetas grandes; el id viaja en el
 * brief y aquí se traduce en una DIRECTIVA concreta para la IA.
 */

export interface SiteIntent {
  id: string;
  plan: 'LANDING' | 'WEB';
  label: string;
  description: string; // lo que ve el cliente
  /** Directiva para la IA: secciones, tono, CTA */
  directive: string;
}

export const SITE_INTENTS: SiteIntent[] = [
  // ── LANDING ──────────────────────────────────────────────
  {
    id: 'sales',
    plan: 'LANDING',
    label: 'Landing de venta',
    description: 'Ideal para vender un producto o servicio. Incluye beneficios, precios, testimonios y botones de compra. Diseñada para convertir visitantes en clientes.',
    directive: `OBJETIVO: VENDER. Estructura de alta conversión: hero con propuesta de valor fuerte + CTA, beneficios claros, servicios/productos con precios, prueba social (testimonios + stats), sección de garantía/confianza, FAQ que elimine objeciones, y CTA banner final con urgencia. Tono persuasivo y directo. CTAs repetidos y accionables ("Compra ahora", "Reserva tu lugar"). Genera sensación de valor y urgencia sutil.`,
  },
  {
    id: 'sales-letter',
    plan: 'LANDING',
    label: 'Carta de venta',
    description: 'Una página larga y persuasiva que cuenta una historia: el problema de tu cliente y cómo lo resuelves. Mucho texto convincente. Perfecta para ventas que necesitan explicar valor.',
    directive: `OBJETIVO: PERSUADIR con copy largo (long-form sales letter). Estructura narrativa: hook inicial que identifica el dolor del cliente, agitación del problema, presentación de la solución como historia, beneficios transformadores, prueba social abundante, oferta clara con bonos/garantía, manejo de objeciones, y múltiples CTAs a lo largo del scroll. MUCHO copy persuasivo y emocional (párrafos reales, no bullets cortos). Tono cercano y convincente, primera persona.`,
  },
  {
    id: 'informational',
    plan: 'LANDING',
    label: 'Landing informativa',
    description: 'Presenta tu negocio sin presión de venta: qué ofreces, tu menú o catálogo, ubicación y contacto. Ideal para que te conozcan y te encuentren.',
    directive: `OBJETIVO: INFORMAR y dar a conocer. Estructura: hero con identidad de marca, sobre nosotros/historia, qué ofrecemos (menú/catálogo/servicios), galería, ubicación con mapa, horarios, y contacto. Tono cálido e informativo, SIN presión de venta agresiva. Foco en que el cliente entienda el negocio y sepa cómo llegar/contactar. CTA suave ("Conócenos", "Visítanos").`,
  },
  {
    id: 'lead-capture',
    plan: 'LANDING',
    label: 'Landing de captación',
    description: 'Enfocada en conseguir datos de contacto (correos, leads). Un formulario protagonista y mínimas distracciones. Para campañas y construir tu base de clientes.',
    directive: `OBJETIVO: CAPTAR LEADS. Estructura minimalista y enfocada: hero con una promesa clara + formulario protagonista (o lead magnet: ebook/descuento/consulta gratis), beneficios breves de por qué dejar sus datos, prueba social mínima, y CTA único repetido. POCAS distracciones, sin navegación que desvíe. El formulario es el centro. Tono directo orientado a la acción de registro.`,
  },
  {
    id: 'booking',
    plan: 'LANDING',
    label: 'Reservas / Citas',
    description: 'Para que tus clientes agenden o reserven fácil. Muestra tus servicios, horarios y un botón claro de reserva (WhatsApp o formulario). Ideal para restaurantes, salones, clínicas.',
    directive: `OBJETIVO: GENERAR RESERVAS/CITAS. Estructura: hero con CTA de reserva prominente, servicios con duración/precio, horarios de atención claros, equipo/profesionales (si aplica), galería del local, testimonios, y sección de reserva destacada (botón WhatsApp + formulario de cita con fecha/hora/servicio). Ubicación con mapa. CTA "Reservar"/"Agendar cita" repetido y muy visible. Tono confiable y cercano.`,
  },
  {
    id: 'event',
    plan: 'LANDING',
    label: 'Landing de evento',
    description: 'Para promocionar un evento o lanzamiento: fecha, cuenta regresiva, agenda y registro. Genera expectativa y asistentes.',
    directive: `OBJETIVO: PROMOCIONAR UN EVENTO. Estructura: hero con nombre del evento + fecha + cuenta regresiva (countdown con script vanilla), descripción del evento, agenda/programa, speakers/invitados (si aplica), ubicación/modalidad, precios de entrada si aplica, y CTA de registro/inscripción prominente. Genera expectativa. Tono entusiasta y urgente (plazas limitadas, fecha próxima).`,
  },

  // ── WEB INSTITUCIONAL ────────────────────────────────────
  {
    id: 'corporate',
    plan: 'WEB',
    label: 'Web corporativa',
    description: 'Sitio completo de varias páginas: inicio, nosotros, servicios y contacto. Para proyectar profesionalismo y solidez de tu empresa.',
    directive: `OBJETIVO: WEB CORPORATIVA multipágina. ESTRUCTURA: inicio (hero institucional + propuesta de valor + áreas de negocio + indicadores de confianza), nosotros (historia, misión, visión, valores, equipo con fotos), servicios (grid detallado), y contacto (formulario + datos + mapa). Tono PROFESIONAL, sobrio y sólido. Paleta corporativa. Proyecta confianza empresarial y trayectoria. Navegación clara entre páginas.`,
  },
  {
    id: 'services',
    plan: 'WEB',
    label: 'Web de servicios',
    description: 'Detalla tus servicios, tu proceso de trabajo y resultados. Para consultoras, agencias y profesionales que venden servicios.',
    directive: `OBJETIVO: WEB DE SERVICIOS. ESTRUCTURA: hero (propuesta clara + CTA cotización), servicios detallados (cada uno: qué incluye, beneficios, para quién), proceso/metodología de trabajo en PASOS numerados (timeline visual), casos de éxito/resultados con métricas, testimonios, y contacto/cotización destacado. Tono EXPERTO y orientado a resultados. CTA "Solicitar cotización"/"Agendar consulta" repetido. El PROCESO de trabajo es protagonista — muéstralo visualmente.`,
  },
  {
    id: 'portfolio',
    plan: 'WEB',
    label: 'Portafolio',
    description: 'Muestra tus mejores trabajos o proyectos con galerías visuales. Ideal para fotógrafos, diseñadores, arquitectos y creativos.',
    directive: `OBJETIVO: PORTAFOLIO visual. ESTRUCTURA: hero minimalista e impactante (nombre + especialidad + una imagen potente), GALERÍA DE TRABAJOS protagonista (grid masonry/bento grande, cada proyecto con su imagen a máxima calidad, hover elegante, posible lightbox), proyectos destacados con detalle, breve "sobre mí/nosotros", servicios ofrecidos, y contacto. El TRABAJO VISUAL es el 80% de la página — imágenes GRANDES que respiran, mucho espacio en blanco, tipografía de carácter, minimalista. Tono CREATIVO y sofisticado. NADA de cards pequeñas de texto: aquí mandan las imágenes.`,
  },
  {
    id: 'catalog',
    plan: 'WEB',
    label: 'Catálogo',
    description: 'Organiza y exhibe tus productos o servicios de forma ordenada y atractiva. Para tiendas y negocios con variedad de oferta.',
    directive: `OBJETIVO: CATÁLOGO de productos/servicios. ESTRUCTURA: hero breve (qué vendes + CTA "Ver catálogo"/"Pedir por WhatsApp"), CATÁLOGO protagonista organizado POR CATEGORÍAS (cada categoría con su título y un grid de cards de producto: imagen + nombre + precio + descripción corta + botón "Pedir"), barra de categorías/filtros visuales arriba, sección de cómo pedir/envíos, y contacto (WhatsApp prominente). Si hay contenido del PDF del catálogo, usa esos productos y precios REALES. Tono COMERCIAL y claro. Fácil de navegar y pedir. El GRID DE PRODUCTOS es el corazón de la página.`,
  },
];

/** Devuelve la directiva de generación para una intención dada. */
export function getIntentDirective(intentId?: string): string {
  if (!intentId) return '';
  const intent = SITE_INTENTS.find((i) => i.id === intentId);
  if (!intent) return '';
  return `\n═══════════════════════════════════════════
🎯 OBJETIVO DE LA WEB — "${intent.label}" (OBLIGATORIO)
═══════════════════════════════════════════
Esta selección DEFINE la estructura, las secciones y el tono. NO uses una estructura
genérica: adapta TODO a este objetivo específico. Un "${intent.label}" debe verse y
funcionar distinto a cualquier otro tipo de web.
${intent.directive}
═══════════════════════════════════════════`;
}

/** Intenciones disponibles para un plan (para el frontend). */
export function intentsForPlan(plan: 'LANDING' | 'WEB'): SiteIntent[] {
  return SITE_INTENTS.filter((i) => i.plan === plan);
}
