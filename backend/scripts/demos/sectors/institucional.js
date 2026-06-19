/* INSTITUCIONAL / OTROS — 2 rubros. */
const CAT = 'Institucional';

module.exports = [
  /* ONG / fundación */
  {
    slug: 'ong', category: CAT, label: 'ONG / Fundación', brand: 'Fundación Manos Unidas',
    fonts: { heading: 'Sora', body: 'Inter' },
    palette: { primary: '#1E8C8C', secondary: '#14333A', accent: '#F0A82E', bg: '#F4FBFB', text: '#16292F' },
    plan: ['nav', 'heroFullBg', 'stats', 'servicesGrid', 'featureSplit', 'gallery', 'ctaBanner', 'contact', 'footer'],
    nav: ['Inicio', 'Programas', 'Nosotros', 'Galería', 'Contacto'], navCta: 'Quiero ayudar',
    eyebrow: 'Organización sin fines de lucro', h1: 'Juntos transformamos vidas', sub: 'Trabajamos cada día por las comunidades más vulnerables del Perú. Tu apoyo hace posible la educación, la salud y la esperanza.',
    cta1: 'Quiero donar', cta2: 'Conoce nuestra labor',
    stats: [{ n: '15,000+', l: 'personas ayudadas' }, { n: '20 años', l: 'de labor social' }, { n: '12', l: 'regiones del Perú' }, { n: '100%', l: 'transparencia' }],
    servicesEyebrow: 'Programas', servicesTitle: 'Nuestras causas',
    services: [{ t: 'Educación para niños', d: 'Becas, útiles y refuerzo escolar en zonas rurales.' }, { t: 'Salud y nutrición', d: 'Campañas médicas y alimentación a comunidades.' }, { t: 'Apoyo a adultos mayores', d: 'Acompañamiento y cuidado a quienes más lo necesitan.' }, { t: 'Emprendimiento social', d: 'Capacitación para generar ingresos dignos.' }, { t: 'Voluntariado', d: 'Suma tus manos a nuestras campañas.' }, { t: 'Ayuda humanitaria', d: 'Respuesta rápida ante emergencias.' }],
    aboutTitle: 'Creemos en un Perú más justo', aboutBody: 'Desde hace 20 años llevamos esperanza a las comunidades que más lo necesitan. Cada proyecto nace del compromiso de un equipo y de personas como tú, que creen que juntos podemos construir un futuro mejor.',
    aboutBullets: ['Transparencia total en cada donación', 'Proyectos con impacto medible', 'Un equipo y voluntarios comprometidos'],
    galleryEyebrow: 'Nuestra labor', galleryTitle: 'Historias que construimos juntos',
    ctaTitle: 'Tu ayuda transforma vidas', ctaSub: 'Dona o súmate como voluntario. Escríbenos por WhatsApp y te contamos cómo.',
    contactTitle: 'Súmate a la causa', contactSub: 'Dona, sé voluntario o crea una alianza. Juntos hacemos más.',
    phone: '+51 1 433 1010', address: 'Av. Arequipa 2890, Lince, Lima', hours: 'Lun–Vie · 9:00 – 18:00', contactCta: 'Quiero ayudar', email: 'contacto@manosunidas.org.pe',
    footerAbout: 'Fundación con 20 años transformando vidas en el Perú a través de la educación, la salud y la esperanza.',
    whatsappHref: 'https://wa.me/5114331010',
    pexels: { hero: 'volunteers helping community charity', about: 'volunteer children community help', gallery: ['volunteers community', 'children education rural', 'food donation campaign', 'medical campaign community', 'elderly care support', 'volunteer team helping'] },
  },

  /* Iglesia */
  {
    slug: 'iglesia', category: CAT, label: 'Iglesia', brand: 'Comunidad de Fe',
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    palette: { primary: '#8C6A45', secondary: '#2A2018', accent: '#C8A45C', bg: '#FAF6F0', text: '#2A2118' },
    plan: ['nav', 'heroFullBg', 'stats', 'servicesGrid', 'featureSplit', 'gallery', 'ctaBanner', 'contact', 'footer'],
    nav: ['Inicio', 'Ministerios', 'Nosotros', 'Galería', 'Contacto'], navCta: 'Visítanos',
    eyebrow: 'Comunidad de fe', h1: 'Un lugar para crecer en fe y comunidad', sub: 'Te damos la bienvenida a una familia que cree, sirve y ama. Ven tal como eres y encuentra un hogar espiritual.',
    cta1: 'Visítanos este domingo', cta2: 'Conoce más',
    stats: [{ n: '2,000+', l: 'miembros' }, { n: '25 años', l: 'sirviendo' }, { n: '10+', l: 'ministerios' }, { n: 'Todas', l: 'las edades' }],
    servicesEyebrow: 'Ministerios', servicesTitle: 'Hay un lugar para ti',
    services: [{ t: 'Servicios dominicales', d: 'Celebra con nosotros cada domingo.' }, { t: 'Ministerio de niños', d: 'Un espacio seguro y divertido para los pequeños.' }, { t: 'Jóvenes', d: 'Comunidad y propósito para la nueva generación.' }, { t: 'Grupos de hogar', d: 'Conexión y crecimiento durante la semana.' }, { t: 'Matrimonios', d: 'Fortalece tu familia en comunidad.' }, { t: 'Acción social', d: 'Servimos a quienes más lo necesitan.' }],
    aboutTitle: 'Una familia que te espera', aboutBody: 'Somos una comunidad diversa unida por la fe, el amor y el servicio. Creemos en una iglesia que acompaña en cada etapa de la vida, que celebra junta y que tiende la mano. Aquí siempre tendrás un lugar.',
    aboutBullets: ['Bienvenida cálida para nuevas familias', 'Ministerios para todas las edades', 'Comunidad que sirve y acompaña'],
    galleryEyebrow: 'Nuestra comunidad', galleryTitle: 'Momentos que vivimos juntos',
    ctaTitle: 'Te esperamos este domingo', ctaSub: 'Ven a conocernos. Escríbenos por WhatsApp y te damos la bienvenida.',
    contactTitle: 'Visítanos', contactSub: 'Conoce nuestros horarios y ven a ser parte de la familia.',
    phone: '+51 945 110 220', address: 'Av. Universitaria 1450, San Miguel, Lima', hours: 'Domingos · 9:00 y 11:00 · Miércoles · 19:30', contactCta: 'Quiero visitarlos', email: 'contacto@comunidaddefe.pe',
    footerAbout: 'Comunidad de fe en Lima. Un hogar espiritual para crecer, servir y amar, con ministerios para toda la familia.',
    whatsappHref: 'https://wa.me/51945110220',
    pexels: { hero: 'church community worship people', about: 'church congregation together', gallery: ['church worship service', 'community group people', 'children church activity', 'youth group together', 'church choir music', 'volunteers helping church'] },
  },
];
