/**
 * CATÁLOGO DE SECTORES para los demos de plia.pe/ejemplos.
 * Cada sector es un "plan" propio: paleta, tipografías, estructura de bloques,
 * copy real (español peruano) y queries de Pexels. Esto es lo que hace que
 * cada demo se vea DISTINTO y específico de su rubro (no una plantilla).
 *
 * plan[] = orden de bloques (nombres de funciones en blocks.js).
 * pexels{} = queries (en inglés rinden mejor) que build.js resuelve a URLs.
 */

const BASE = [
  /* ════════════════ GASTRONOMÍA — cevichería ════════════════ */
  {
    slug: 'restaurante',
    category: 'Gastronomía',
    label: 'Restaurante / Cevichería',
    brand: 'La Mar Brava',
    fonts: { heading: 'Fraunces', body: 'Inter' },
    palette: { primary: '#C0432B', secondary: '#15323D', accent: '#E29A2E', bg: '#FBF6EE', text: '#2A2018' },
    plan: ['nav', 'heroFullBg', 'stats', 'menu', 'featureSplit', 'gallery', 'testimonials', 'ctaBanner', 'contact', 'footer'],
    nav: ['Inicio', 'Carta', 'Nosotros', 'Galería', 'Contacto'],
    navCta: 'Reservar',
    eyebrow: 'Cocina marina peruana',
    h1: 'El sabor del mar, fresco cada mañana',
    sub: 'Ceviche recién preparado, pescados del día y la sazón limeña de siempre. En el corazón de Miraflores.',
    cta1: 'Reserva tu mesa', cta2: 'Ver la carta',
    stats: [{ n: '12 años', l: 'sirviendo Miraflores' }, { n: '4.9★', l: 'en Google y TripAdvisor' }, { n: '100%', l: 'pescado fresco del día' }, { n: '+30', l: 'platos en carta' }],
    menuEyebrow: 'Nuestra carta', menuTitle: 'Lo más pedido de la casa',
    menu: [
      { t: 'Ceviche La Mar Brava', d: 'Pescado del día, leche de tigre, camote glaseado y cancha', p: 'S/ 42' },
      { t: 'Tiradito al ají amarillo', d: 'Finas láminas de lenguado en crema de ají amarillo', p: 'S/ 38' },
      { t: 'Arroz con mariscos', d: 'Arroz meloso con mariscos frescos y culantro', p: 'S/ 45' },
      { t: 'Causa rellena de cangrejo', d: 'Papa amarilla, palta y cangrejo fresco', p: 'S/ 32' },
      { t: 'Chicharrón de pescado', d: 'Crocante, con yuca dorada y salsa criolla', p: 'S/ 36' },
      { t: 'Pulpo al olivo', d: 'Pulpo tierno en mayonesa de aceituna botija', p: 'S/ 40' },
      { t: 'Jalea mixta', d: 'Para compartir: mariscos y pescado apanados', p: 'S/ 68' },
      { t: 'Pisco Sour', d: 'El clásico, bien batido y espumoso', p: 'S/ 22' },
    ],
    aboutTitle: 'Tres generaciones cocinando con el mismo amor',
    aboutBody: 'La Mar Brava nació en una caleta del sur. Hoy traemos esa misma frescura a Miraflores: compramos el pescado cada madrugada en el terminal y lo servimos el mismo día. Sin atajos, sin congelados.',
    aboutBullets: ['Pescado y mariscos frescos, nunca congelados', 'Recetas de familia con más de 40 años', 'Ambiente cálido para reuniones y celebraciones'],
    galleryEyebrow: 'Galería', galleryTitle: 'Para abrir el apetito',
    testiTitle: 'Lo que dicen nuestros comensales',
    testimonials: [
      { q: 'El mejor ceviche que he probado en Lima. Volvimos tres veces en una semana.', n: 'Andrea Quispe', r: 'Comensal frecuente' },
      { q: 'Atención de primera y el pescado siempre fresquísimo. Un clásico de Miraflores.', n: 'Carlos Mendoza', r: 'Google Reviews' },
      { q: 'Celebré el cumpleaños de mi mamá aquí y todo fue perfecto. Recomendadísimo.', n: 'Lucía Ferreyra', r: 'TripAdvisor' },
    ],
    ctaTitle: '¿Reservamos tu mesa?', ctaSub: 'Escríbenos por WhatsApp y aseguramos tu lugar para hoy mismo.',
    contactTitle: 'Visítanos o reserva', contactSub: 'Te esperamos con el mar servido en la mesa.',
    phone: '+51 987 654 321', address: 'Av. La Mar 1248, Miraflores, Lima', hours: 'Mar–Dom · 12:00 – 23:00',
    contactCta: 'Reservar mesa', email: 'reservas@lamarbrava.pe',
    footerAbout: 'Cocina marina peruana en el corazón de Miraflores. Pescado fresco del día, todos los días.',
    whatsappHref: 'https://wa.me/51987654321',
    pexels: {
      hero: 'ceviche peruvian seafood',
      about: 'chef cooking restaurant kitchen',
      gallery: ['ceviche dish', 'seafood platter', 'peruvian food', 'restaurant interior cozy', 'cocktail pisco', 'grilled fish plate'],
    },
  },

  /* ════════════════ JURÍDICO — estudio de abogados ════════════════ */
  {
    slug: 'juridico',
    category: 'Servicios profesionales',
    label: 'Estudio jurídico',
    brand: 'Vargas & Asociados',
    fonts: { heading: 'Playfair Display', body: 'Source Sans 3' },
    palette: { primary: '#1F3A5F', secondary: '#14233B', accent: '#B8924A', bg: '#F8F7F4', text: '#1A1D24' },
    plan: ['nav', 'heroSplit', 'stats', 'servicesGrid', 'process', 'team', 'testimonials', 'faq', 'contact', 'footer'],
    nav: ['Inicio', 'Servicios', 'Equipo', 'Contacto'],
    navCta: 'Agenda una cita',
    eyebrow: 'Estudio jurídico · Lima',
    h1: 'Defendemos lo que más te importa',
    sub: 'Más de 20 años brindando asesoría legal clara y resultados sólidos a empresas y familias en todo el Perú.',
    cta1: 'Agenda tu consulta', cta2: 'Áreas de práctica',
    heroPills: ['Primera consulta sin costo', 'Respuesta en 24h'],
    stats: [{ n: '20+', l: 'años de experiencia' }, { n: '1,200+', l: 'casos resueltos' }, { n: '95%', l: 'tasa de éxito' }, { n: '8', l: 'áreas de práctica' }],
    servicesEyebrow: 'Áreas de práctica', servicesTitle: 'Asesoría legal integral', servicesSub: 'Acompañamos cada caso con rigor, cercanía y total transparencia.',
    services: [
      { t: 'Derecho Corporativo', d: 'Constitución de empresas, contratos, fusiones y cumplimiento normativo.' },
      { t: 'Derecho Laboral', d: 'Asesoría a empleadores y trabajadores, ceses, beneficios y conflictos.' },
      { t: 'Derecho de Familia', d: 'Divorcios, tenencia, alimentos y sucesiones con trato humano.' },
      { t: 'Derecho Civil', d: 'Contratos, obligaciones, responsabilidad y procesos civiles.' },
      { t: 'Derecho Penal', d: 'Defensa técnica especializada en todas las etapas del proceso.' },
      { t: 'Derecho Tributario', d: 'Planificación fiscal, fiscalizaciones SUNAT y reclamaciones.' },
    ],
    processTitle: 'Cómo llevamos tu caso',
    process: [
      { t: 'Consulta inicial', d: 'Escuchamos tu caso y evaluamos las mejores opciones, sin costo.' },
      { t: 'Estrategia', d: 'Diseñamos un plan legal claro con plazos y escenarios.' },
      { t: 'Acción', d: 'Ejecutamos con rigor y te mantenemos informado en cada paso.' },
      { t: 'Resultado', d: 'Buscamos siempre la solución más favorable para ti.' },
    ],
    teamTitle: 'Abogados que te acompañan',
    team: [
      { n: 'Dr. Ricardo Vargas', r: 'Socio fundador · Corporativo' },
      { n: 'Dra. Patricia León', r: 'Derecho Laboral' },
      { n: 'Dr. Manuel Ríos', r: 'Derecho Penal' },
      { n: 'Dra. Sofía Campos', r: 'Derecho de Familia' },
    ],
    testiTitle: 'La confianza de nuestros clientes',
    testimonials: [
      { q: 'Resolvieron un conflicto laboral complejo con total profesionalismo. Recomendados.', n: 'Jorge Salazar', r: 'Gerente General, Constructora ABC' },
      { q: 'Me sentí acompañada en todo momento. Explican todo con claridad.', n: 'María Huamán', r: 'Cliente, Derecho de Familia' },
      { q: 'Un equipo serio y resolutivo. Nuestra empresa los tiene como aliados.', n: 'Diego Torres', r: 'Director, Importadora del Sur' },
    ],
    faqTitle: 'Preguntas frecuentes',
    faq: [
      { q: '¿La primera consulta tiene costo?', a: 'No. La primera consulta es totalmente gratuita y sin compromiso.' },
      { q: '¿Atienden fuera de Lima?', a: 'Sí, atendemos casos a nivel nacional de forma presencial y virtual.' },
      { q: '¿Cuánto demora un proceso?', a: 'Depende del tipo de caso; en la consulta te damos un estimado realista de plazos.' },
    ],
    contactTitle: 'Agenda tu consulta gratuita', contactSub: 'Cuéntanos tu caso. Te respondemos en menos de 24 horas.',
    phone: '+51 1 442 8800', address: 'Av. Javier Prado Este 560, San Isidro, Lima', hours: 'Lun–Vie · 9:00 – 18:00',
    contactCta: 'Solicitar consulta', email: 'contacto@vargasasociados.pe',
    footerAbout: 'Estudio jurídico con más de 20 años defendiendo a empresas y familias en todo el Perú.',
    whatsappHref: 'https://wa.me/5114428800',
    pexels: {
      hero: 'law office lawyer professional',
      about: 'lawyer meeting client office',
      team: ['businessman portrait suit', 'businesswoman portrait professional', 'lawyer portrait office', 'professional woman portrait'],
    },
  },

  /* ════════════════ INMOBILIARIA ════════════════ */
  {
    slug: 'inmobiliaria',
    category: 'Inmobiliario',
    label: 'Inmobiliaria',
    brand: 'Terra Nova Propiedades',
    fonts: { heading: 'Sora', body: 'Inter' },
    palette: { primary: '#2E6B4F', secondary: '#1C2B25', accent: '#C9A24B', bg: '#FAF8F3', text: '#22271F' },
    plan: ['nav', 'heroSplit', 'stats', 'cards', 'featureSplit', 'process', 'testimonials', 'ctaBanner', 'contact', 'footer'],
    nav: ['Inicio', 'Propiedades', 'Nosotros', 'Contacto'],
    navCta: 'Agenda una visita',
    eyebrow: 'Inmobiliaria · Lima',
    h1: 'Encuentra el hogar que estabas buscando',
    sub: 'Propiedades seleccionadas, asesoría honesta y acompañamiento en cada paso de tu compra o alquiler.',
    cta1: 'Ver propiedades', cta2: 'Agenda una visita',
    heroPills: ['Asesoría sin costo', 'Financiamiento bancario'],
    stats: [{ n: '+450', l: 'familias con casa nueva' }, { n: '15 años', l: 'en el mercado limeño' }, { n: '120+', l: 'propiedades disponibles' }, { n: '4.8★', l: 'satisfacción de clientes' }],
    cardsEyebrow: 'Propiedades destacadas', cardsTitle: 'Disponibles esta semana', cardsCta: 'Ver detalle',
    cards: [
      { tag: 'Venta', t: 'Departamento en Miraflores', d: '3 dorm · 2 baños · 120 m² · vista al parque', p: 'US$ 285,000' },
      { tag: 'Alquiler', t: 'Casa en La Molina', d: '4 dorm · jardín · cochera doble · 240 m²', p: 'S/ 4,800 /mes' },
      { tag: 'Venta', t: 'Loft en Barranco', d: '1 dorm · estreno · a pasos del malecón', p: 'US$ 168,000' },
      { tag: 'Venta', t: 'Departamento en San Isidro', d: '2 dorm · 95 m² · edificio con piscina', p: 'US$ 220,000' },
      { tag: 'Alquiler', t: 'Oficina en San Borja', d: '80 m² · implementada · estacionamiento', p: 'S/ 3,200 /mes' },
      { tag: 'Venta', t: 'Casa de playa en Asia', d: '3 dorm · frente al mar · club exclusivo', p: 'US$ 340,000' },
    ],
    aboutTitle: 'Te acompañamos, no solo te vendemos',
    aboutBody: 'En Terra Nova creemos que comprar una casa es una de las decisiones más importantes de tu vida. Por eso te asesoramos con honestidad, te mostramos solo lo que encaja contigo y te guiamos hasta la firma y más allá.',
    aboutBullets: ['Propiedades verificadas legalmente', 'Apoyo con crédito hipotecario', 'Acompañamiento hasta la entrega de llaves'],
    processTitle: 'Tu camino a la nueva casa',
    process: [
      { t: 'Conversamos', d: 'Entendemos qué buscas, tu presupuesto y tus tiempos.' },
      { t: 'Seleccionamos', d: 'Te mostramos solo propiedades que realmente encajan.' },
      { t: 'Visitamos', d: 'Coordinamos las visitas y resolvemos todas tus dudas.' },
      { t: 'Cerramos', d: 'Te apoyamos con el financiamiento y toda la documentación.' },
    ],
    testiTitle: 'Familias que ya están en casa',
    testimonials: [
      { q: 'Nos ayudaron a encontrar nuestro primer depa y con el crédito del banco. Excelentes.', n: 'Familia Rojas', r: 'Compraron en Miraflores' },
      { q: 'Transparentes y atentos. Nunca nos presionaron, nos guiaron.', n: 'Paola Núñez', r: 'Alquiló en La Molina' },
      { q: 'Vendieron mi departamento en menos de un mes al precio justo.', n: 'Enrique Vidal', r: 'Vendió en San Isidro' },
    ],
    ctaTitle: '¿Buscas o quieres vender?', ctaSub: 'Escríbenos por WhatsApp y un asesor te atiende hoy mismo.',
    contactTitle: 'Conversemos', contactSub: 'Cuéntanos qué buscas y te enviamos opciones a tu medida.',
    phone: '+51 956 220 110', address: 'Av. El Derby 254, Santiago de Surco, Lima', hours: 'Lun–Sáb · 9:00 – 19:00',
    contactCta: 'Quiero asesoría', email: 'contacto@terranova.pe',
    footerAbout: 'Inmobiliaria con 15 años ayudando a familias limeñas a encontrar y vender su hogar.',
    whatsappHref: 'https://wa.me/51956220110',
    pexels: {
      hero: 'modern luxury house exterior',
      about: 'real estate agent handshake',
      cards: ['modern apartment living room', 'luxury house exterior', 'modern loft interior', 'apartment building modern', 'office space interior', 'beach house modern'],
    },
  },
];

/* ── Categorías adicionales (un archivo por categoría) ───────────
 * Cada require devuelve un array de sectores. Se concatenan a BASE.
 * Tolerante a archivos aún no creados (se irán agregando por lotes). */
const CATEGORY_FILES = [
  './sectors/salud',
  './sectors/profesionales',
  './sectors/construccion',
  './sectors/educacion',
  './sectors/gastronomia',
  './sectors/belleza',
  './sectors/retail',
  './sectors/logistica',
  './sectors/turismo',
  './sectors/automotriz',
  './sectors/industria',
  './sectors/tecnologia',
  './sectors/finanzas',
  './sectors/hogar',
  './sectors/fitness',
  './sectors/institucional',
];

const extra = [];
for (const f of CATEGORY_FILES) {
  try { extra.push(...require(f)); }
  catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
}

module.exports = [...BASE, ...extra];
