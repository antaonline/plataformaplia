import type { Metadata } from "next";

// Esta pagina es un embudo de calificacion SOLO para anuncios de Facebook.
// No debe ser rastreada ni indexada por Google (el trafico llega directo desde
// el anuncio, no por busqueda). page.tsx es 'use client' y no puede exportar
// metadata, por eso el noindex vive aqui en el layout de servidor.
export const metadata: Metadata = {
  title: "Tu pagina web hoy | PLIA",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: { canonical: undefined },
};

export default function TuWebHoyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
