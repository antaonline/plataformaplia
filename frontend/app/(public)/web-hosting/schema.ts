// JSON-LD del PILAR /web-hosting. Vive en un archivo propio (no en
// layout.tsx) porque el layout envuelve también a las subpáginas del silo
// (/web-hosting/wordpress, /web-hosting/migracion) y los schemas se
// duplicarían en cada una. La página pilar (page.tsx) importa y renderiza
// estos objetos como <script type="application/ld+json">.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plia.pe";

export const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Web Hosting",
  name: "Hosting Web PLIA",
  provider: {
    "@type": "Organization",
    name: "PLIA",
    url: siteUrl,
  },
  areaServed: { "@type": "Country", name: "Peru" },
  url: `${siteUrl}/web-hosting`,
  description:
    "Servicio de web hosting de PLIA en Perú: servidores LiteSpeed, discos NVMe, subdominio gratis, SSL, correos y soporte 24/7 incluidos. Más de 10,000 clientes alojados. Servicio independiente del diseño de páginas web.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "PEN",
    lowPrice: "16",
    highPrice: "112",
    offerCount: "3",
  },
};

// IMPORTANTE: estas FAQs deben coincidir con las visibles en page.tsx
// (const faqs). Si cambias una allá, actualízala aquí también — Google
// penaliza el schema FAQPage que no coincide con el contenido visible.
export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿El hosting está pensado para alguien sin perfil técnico?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. La propuesta está diseñada para reducir pasos y hablar en lenguaje claro, especialmente en tareas como publicar, activar SSL, usar WordPress o gestionar correos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué es el almacenamiento NVMe y por qué importa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NVMe es una tecnología de almacenamiento mucho más rápida que los discos SSD tradicionales. Esto reduce drásticamente el tiempo de carga de tu web, mejorando la experiencia del usuario y tu posicionamiento en Google.",
      },
    },
    {
      "@type": "Question",
      name: "¿Mi hosting viene con dominio gratis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Incluye un subdominio gratis para que publiques de inmediato. El dominio propio (.pe o .com) no lo vendemos: lo registras tú con el proveedor que prefieras y nosotros te ayudamos a vincularlo a tu hosting sin costo.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué diferencia hay entre este hosting y el incluido en los planes web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Son servicios distintos. Si contratas un plan de diseño web (Landing o Web Institucional), el hosting de tu página va gratis el primer año y luego solo lo renuevas desde tu panel. Esta página describe nuestro servicio de hosting puro: para quienes ya tienen su web o la administran por su cuenta, con un panel enfocado 100% en hosting.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué pasa si supero los límites de mi plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Te avisaremos con antelación. Puedes escalar a un plan superior en cualquier momento pagando solo la diferencia prorrateada, sin caídas de servicio.",
      },
    },
    {
      "@type": "Question",
      name: "¿Incluyen certificado SSL?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, todos nuestros planes incluyen certificados SSL gratuitos e ilimitados de Let's Encrypt que se renuevan automáticamente.",
      },
    },
  ],
};

export const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Hosting Web en Perú", item: `${siteUrl}/web-hosting` },
  ],
};
