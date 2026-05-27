import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo Funciona PLIA — Tu Web Lista en 3 Pasos",
  description:
    "Te contamos tu negocio, la IA crea tu web, nosotros la publicamos. Tu página web profesional con dominio y hosting en menos de 24 horas.",
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
        text: "Sí. Dominio .pe o .com, hosting profesional, SSL y correos están incluidos en todos los planes.",
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
        text: "Nuestros planes van desde S/19/mes para emprendedores hasta planes Agencia para múltiples sitios. Todo incluye diseño, hosting, dominio y soporte 24/7.",
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
