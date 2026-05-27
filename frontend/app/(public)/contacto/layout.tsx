import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto y Soporte — PLIA Perú",
  description:
    "Contáctanos por WhatsApp, correo o formulario. Soporte web 24/7 en español. Respuesta garantizada en menos de 1 hora hábil.",
  keywords: [
    "contacto PLIA",
    "soporte web Peru",
    "WhatsApp PLIA",
    "soporte hosting Peru",
    "ayuda página web Peru",
    "PLIA Lima contacto",
  ],
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto — PLIA",
    description: "Soporte 24/7 en español. WhatsApp, correo y formulario.",
    url: "/contacto",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto PLIA",
    description: "Soporte 24/7 en español.",
  },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
