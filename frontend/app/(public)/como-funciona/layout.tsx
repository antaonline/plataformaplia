import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo Funciona PLIA — Tu Web Lista en 3 Pasos",
  description:
    "Nos cuentas de tu negocio y nosotros creamos y publicamos tu web. Tu página profesional con hosting incluido y tu dominio conectado, en menos de 24 horas.",
  keywords: [
    "cómo funciona PLIA",
    "crear página web fácil",
    "pasos para tener una web",
    "proceso página web",
    "PLIA paso a paso",
    "guía crear web Peru",
    "web en 24 horas",
  ],
  alternates: { canonical: "/como-funciona" },
  openGraph: {
    title: "Cómo Funciona PLIA — Tu Web en 3 Pasos",
    description:
      "Tu página web profesional en menos de 24 horas. Diseño con IA y publicación inmediata.",
    url: "/como-funciona",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo Funciona PLIA",
    description: "Tu web en 3 pasos. Sin complicaciones técnicas.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto demora PLIA en entregar mi página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tu página web está lista en menos de 24 horas. La IA genera el diseño en minutos y nuestro equipo la revisa y publica.",
      },
    },
    {
      "@type": "Question",
      name: "¿Necesito saber programar o diseñar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Solo nos cuentas qué hace tu negocio y la IA crea todo: diseño, textos e imágenes. Nosotros nos encargamos del resto.",
      },
    },
    {
      "@type": "Question",
      name: "¿El dominio y el hosting están incluidos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El hosting profesional, el SSL y el soporte están incluidos en todos los planes, más un subdominio gratis para publicar de inmediato. El dominio propio (.pe o .com) lo registras tú y nosotros lo conectamos sin costo.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo pedir cambios después?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Cada plan incluye revisiones gratuitas. Puedes solicitar ajustes desde tu dashboard y los aplicaremos en horas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta tener una página web con PLIA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Los planes web tienen pago único desde S/390 (con prueba gratis de 30 días), y el hosting puro va desde S/16/mes. Todo incluye diseño, hosting y soporte.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo vender online con PLIA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Ofrecemos tiendas online con pagos por Yape, Plin, tarjeta y transferencia. Catálogo, stock y envíos incluidos.",
      },
    },
  ],
};

export default function ComoFuncionaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
