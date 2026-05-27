import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nosotros — La empresa peruana detrás de PLIA",
  description:
    "PLIA es una empresa peruana fundada para que cualquier emprendedor pueda tener una web profesional sin saber de tecnología. Conoce nuestra misión.",
  keywords: [
    "PLIA empresa",
    "equipo PLIA",
    "empresa diseño web Lima",
    "startup peruana",
    "empresa hosting Peru",
    "PLIA Peru",
    "nosotros PLIA",
  ],
  alternates: { canonical: "/sobre-nosotros" },
  openGraph: {
    title: "Sobre Nosotros — PLIA",
    description:
      "La empresa peruana detrás de PLIA. Nuestra misión: web profesional para cada emprendedor.",
    url: "/sobre-nosotros",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre PLIA",
    description: "La empresa peruana detrás de PLIA.",
  },
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
