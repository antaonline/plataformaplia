"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Sparkles, type LucideIcon } from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";

type ComingSoonPageProps = {
  badge: string;
  title: string;
  description: string;
  eyebrow: string;
  highlights: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
  }>;
};

export function ComingSoonPage({
  badge,
  title,
  description,
  eyebrow,
  highlights,
}: ComingSoonPageProps) {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,255,0,0.17),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(30,41,59,0.75),transparent_24%),linear-gradient(135deg,#0d1117_0%,#131a23_42%,#1b2531_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="section-container relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <AnimatedSection className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <Clock3 className="h-4 w-4 text-cta" />
              {badge}
            </span>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-cta">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white">
              {description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-cta text-cta-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-snug text-white">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button variant="cta" size="lg" asChild>
                <Link href="/contacto">
                  Hablar con un asesor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/planes">Ver planes actuales</Link>
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1} direction="scale">
            <div className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="rounded-[24px] border border-white/10 bg-[#121922] p-6">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cta text-cta-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cta">
                      Próximamente
                    </p>
                    <p className="text-lg font-semibold">Estamos afinando la experiencia</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[22px] border border-white/8 bg-black/20 p-5">
                  <div className="flex items-center justify-between border-b border-white/8 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/45">Estado</p>
                      <p className="mt-2 text-xl font-semibold text-white">En diseño y definición final</p>
                    </div>
                    <div className="rounded-full bg-cta/15 px-3 py-1 text-sm font-semibold text-cta">
                      Activo
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {highlights.map((item, index) => (
                      <div key={item.title} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm font-semibold text-white/70">
                          {index + 1}
                        </div>
                        <div className="h-px flex-1 bg-white/10" />
                        <p className="min-w-[12rem] text-right text-sm text-white">{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
