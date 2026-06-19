import type { Metadata } from "next";

// INTERNO: /ejemplos NO se indexa ni se rastrea (galería de uso interno).
// No aparece en el sitemap y aquí se fuerza noindex,nofollow.
export const metadata: Metadata = {
  title: "Ejemplos — PLIA (interno)",
  description: "Galería interna de ejemplos por rubro.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function EjemplosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
