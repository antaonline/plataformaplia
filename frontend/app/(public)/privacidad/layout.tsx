import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo PLIA recolecta, protege y trata los datos personales de nuestros usuarios. Cumplimos con la Ley de Protección de Datos Personales del Perú (Ley N° 29733).",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: true },
};

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
