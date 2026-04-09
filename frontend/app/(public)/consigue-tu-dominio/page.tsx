"use client";

import { Globe2, Search, Store } from "lucide-react";

import { ComingSoonPage } from "@/components/shared/ComingSoonPage";

export default function ConsigueTuDominioPage() {
  return (
    <ComingSoonPage
      badge="Próximamente"
      eyebrow="Dominios"
      title="Estamos trabajando en una forma más simple de conseguir tu dominio"
      description="Pronto vas a poder buscar el dominio ideal para tu negocio desde PLIA y resolverlo sin salir del flujo de creación de tu sitio."
      highlights={[
        {
          title: "Búsqueda clara",
          description: "Encuentra opciones de nombre entendibles a primera lectura para tu marca.",
          icon: Search,
        },
        {
          title: "Pensado para negocio",
          description: "La experiencia estará enfocada en marcas, servicios y tiendas reales.",
          icon: Store,
        },
        {
          title: "Todo desde PLIA",
          description: "Queremos unir dominio, sitio y publicación en una sola experiencia.",
          icon: Globe2,
        },
      ]}
    />
  );
}
