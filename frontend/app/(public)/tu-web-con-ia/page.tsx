"use client";

import { Bot, Sparkles, TimerReset } from "lucide-react";

import { ComingSoonPage } from "@/components/shared/ComingSoonPage";

export default function TuWebConIAPage() {
  return (
    <ComingSoonPage
      badge="Próximamente"
      eyebrow="Tu web con IA"
      title="Estamos preparando una experiencia para crear tu web en segundos"
      description="Muy pronto podrás lanzar una web asistida por IA con una experiencia más rápida, más guiada y completamente alineada al estilo de PLIA."
      highlights={[
        {
          title: "Asistencia guiada",
          description: "Un flujo más corto para pasar de idea a sitio publicado con ayuda de IA.",
          icon: Bot,
        },
        {
          title: "Entrega inmediata",
          description: "Buscamos una experiencia que se sienta veloz desde el primer clic.",
          icon: Sparkles,
        },
        {
          title: "Ajustes simples",
          description: "Cambios rápidos para que tu web siga evolucionando sin complicarte.",
          icon: TimerReset,
        },
      ]}
    />
  );
}
