"use client";

import { CreditCard, PackageCheck, ShoppingBag } from "lucide-react";

import { ComingSoonPage } from "@/components/shared/ComingSoonPage";

export default function EcommercePage() {
  return (
    <ComingSoonPage
      badge="Próximamente"
      eyebrow="Ecommerce"
      title="Estamos preparando una solución ecommerce más simple, rápida y comercial"
      description="Muy pronto podrás lanzar una tienda online con el estilo de PLIA: menos complejidad técnica, más claridad para vender, cobrar y operar desde un solo flujo."
      highlights={[
        {
          title: "Catálogo listo para vender",
          description: "Una estructura enfocada en mostrar productos y llevar al cliente a la compra.",
          icon: ShoppingBag,
        },
        {
          title: "Cobro y confianza",
          description: "Una experiencia pensada para transmitir seguridad desde la primera visita.",
          icon: CreditCard,
        },
        {
          title: "Operación más clara",
          description: "Un enfoque directo para gestionar productos, pedidos y atención sin enredarte.",
          icon: PackageCheck,
        },
      ]}
    />
  );
}
