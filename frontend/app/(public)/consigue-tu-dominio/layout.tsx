import type { Metadata } from "next";

export const metadata: Metadata = {
  // VERACIDAD: PLIA no vende dominios (la página es un "Próximamente").
  // No prometer registro ni activación inmediata hasta que el servicio exista.
  title: "Consigue tu Dominio .pe o .com para tu web — Te ayudamos a conectarlo",
  description:
    "¿Ya tienes tu dominio .pe, .com o .com.pe? En PLIA lo conectamos gratis a tu página web. Y muy pronto podrás buscar y resolver tu dominio sin salir de la plataforma.",
  keywords: [
    "comprar dominio .pe",
    "registrar dominio Peru",
    "dominio peruano",
    "dominio .com.pe",
    "dominio para mi negocio",
    "registrar dominio fácil",
    "dominio con hosting",
    "PLIA dominio",
  ],
  alternates: { canonical: "/consigue-tu-dominio" },
  openGraph: {
    title: "Consigue tu Dominio — PLIA",
    description:
      "Conectamos gratis tu dominio .pe, .com o .com.pe a tu página web. Pronto podrás gestionarlo todo desde PLIA.",
    url: "/consigue-tu-dominio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tu Dominio con PLIA",
    description: "Conectamos gratis tu dominio .pe, .com o .com.pe a tu web.",
  },
};

export default function DominioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
