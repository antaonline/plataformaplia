"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Cpu,
  Globe2,
  LifeBuoy,
  Mail,
  MoveRight,
  PanelsTopLeft,
  Server,
  ShieldCheck,
  Wand2,
  type LucideIcon,
} from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FAQItem } from "@/components/shared/FAQItem";
import { PlanCard } from "@/components/shared/PlanCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";

const termOptions = [
  { months: 1, label: "1 mes", note: "Flexibilidad total" },
  { months: 12, label: "12 meses", note: "La mejor base para empezar" },
  { months: 24, label: "24 meses", note: "Más ahorro por sitio" },
  { months: 48, label: "48 meses", note: "El menor costo mensual" },
] as const;

const hostingPlans = [
  {
    slug: "profesional",
    name: "Profesional",
    regularMonthly: 28,
    description: "Para negocios pequeños que necesitan estabilidad y facilidad desde el primer día.",
    monthlyPricing: {
      1: 28,
      12: 20,
      24: 18,
      48: 16,
    },
    freeHosting: "SSL incluido y operación simple",
    isPopular: false,
    features: [
      "Crea hasta 2 sitios web",
      "5 GB de almacenamiento",
      "SSL incluido",
      "1 mailbox por sitio web",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    regularMonthly: 56,
    description: "El punto ideal para marcas que quieren crecer sin pelearse con un panel técnico.",
    monthlyPricing: {
      1: 56,
      12: 40,
      24: 36,
      48: 32,
    },
    freeHosting: "El plan destacado para operar con holgura",
    isPopular: true,
    features: [
      "Crea hasta 5 sitios web",
      "15 GB de almacenamiento",
      "SSL incluido",
      "2 mailbox por sitio web",
    ],
  },
  {
    slug: "agencia",
    name: "Agencia",
    regularMonthly: 112,
    description: "Pensado para equipos, estudios y agencias que administran múltiples proyectos.",
    monthlyPricing: {
      1: 112,
      12: 80,
      24: 72,
      48: 64,
    },
    freeHosting: "Capacidad para operar varias cuentas con orden",
    isPopular: false,
    features: [
      "Crea hasta 50 sitios web",
      "100 GB de almacenamiento",
      "SSL incluido",
      "5 mailbox por sitio web",
    ],
  },
] as const;

const valueBlocks = [
  {
    icon: PanelsTopLeft,
    title: "Dashboard propio y directo al grano",
    description:
      "Una interfaz pensada para que gestiones sitios, SSL y correos sin tener que descifrar un panel lleno de funciones irrelevantes.",
  },
  {
    icon: Wand2,
    title: "WordPress y puesta en marcha guiada",
    description:
      "Una base lista para arrancar con WordPress o sitios similares sin convertir la configuración inicial en una tarea técnica pesada.",
  },
  {
    icon: MoveRight,
    title: "Migración y conexión sin freno",
    description:
      "Pensado para mover proyectos o empezar nuevos sin bloquearte en pasos de dominio, DNS o publicación.",
  },
  {
    icon: LifeBuoy,
    title: "Soporte que sí destraba",
    description:
      "Ayuda para tareas concretas como SSL, correo, dominio o publicación sin obligarte a resolver todo por tu cuenta.",
  },
] as const;

const splitSections = [
  {
    eyebrow: "Hosting fácil de usar",
    title: "Un panel hecho para decidir rápido y operar sin perder tiempo",
    description:
      "Tu hosting no debería sentirse como una cabina de avión. En PLIA queremos que las tareas importantes estén a mano: crear sitios, revisar capacidad, activar SSL, gestionar correos y avanzar sin ruido técnico.",
    bullets: [
      "Dashboard propio con foco en tareas reales",
      "Flujos cortos para publicar, revisar y mantener",
      "Menos pasos para llegar a lo importante",
    ],
    statLabel: "Enfoque",
    statValue: "Simple",
    cardTitle: "Centro de operación PLIA",
    cardLines: [
      "Sitios y dominios",
      "SSL y seguridad",
      "Correos por proyecto",
      "Accesos y mantenimiento",
    ],
  },
  {
    eyebrow: "WordPress y CMS",
    title: "Lanzar WordPress debería sentirse rápido, no técnico",
    description:
      "Tomamos la lógica de hosting administrado para WordPress, mantenimiento integrado y facilidad de arranque para aterrizarla a una experiencia PLIA más clara, más guiada y menos técnica.",
    bullets: [
      "Instalación guiada para WordPress",
      "SSL y estructura lista desde el inicio",
      "Base preparada para publicar sin fricción",
    ],
    statLabel: "Listo para",
    statValue: "WordPress",
    cardTitle: "Lanzamiento más corto",
    cardLines: [
      "Instala y configura",
      "Conecta dominio",
      "Activa SSL",
      "Publica más rápido",
    ],
  },
] as const;

const comparisonRows = [
  { feature: "Sitios web incluidos", profesional: "2", premium: "5", agencia: "50" },
  { feature: "Almacenamiento", profesional: "5 GB", premium: "15 GB", agencia: "100 GB" },
  { feature: "SSL", profesional: "Incluido", premium: "Incluido", agencia: "Incluido" },
  { feature: "Mailbox por sitio", profesional: "1", premium: "2", agencia: "5" },
  { feature: "Panel de gestión", profesional: "Simple", premium: "Simple", agencia: "Simple" },
  { feature: "Ideal para", profesional: "Negocio local", premium: "Pyme en crecimiento", agencia: "Agencias y equipos" },
] as const;

const faqs = [
  {
    question: "¿Qué cambia según el tiempo de contratación?",
    answer:
      "El precio mensual baja cuando contratas por más tiempo. El plan de 12 meses es la referencia principal, 24 meses ahorra más y 48 meses te da el costo mensual más bajo.",
  },
  {
    question: "¿El hosting está pensado para alguien sin perfil técnico?",
    answer:
      "Sí. La propuesta está diseñada para reducir pasos y hablar en lenguaje claro, especialmente en tareas como publicar, activar SSL, usar WordPress o gestionar correos.",
  },
  {
    question: "¿Puedo usar WordPress en estos planes?",
    answer:
      "Sí. La idea del servicio es acompañarte para instalar y operar WordPress o un CMS similar con una experiencia más simple y orientada a negocio.",
  },
  {
    question: "¿Todos los planes incluyen SSL y correo?",
    answer:
      "Sí. Los tres planes incluyen SSL y mailbox por sitio web. Lo que cambia es la cantidad de buzones y la capacidad total del plan.",
  },
] as const;

const formatMoney = (value: number) => `S/ ${value}`;

function VisualPanel({
  title,
  lines,
  statLabel,
  statValue,
  icon: Icon,
}: {
  title: string;
  lines: readonly string[];
  statLabel: string;
  statValue: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[32px] border border-border bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="rounded-[24px] bg-[#111821] p-6 text-primary-foreground">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cta">{statLabel}</p>
            <p className="mt-2 text-2xl font-bold">{statValue}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cta text-cta-foreground">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-lg font-semibold">{title}</p>
          <div className="mt-4 space-y-3">
            {lines.map((line, index) => (
              <div
                key={line}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/70">
                    {index + 1}
                  </div>
                  <span className="text-sm text-white/86">{line}</span>
                </div>
                <span className="rounded-full bg-cta/15 px-3 py-1 text-xs font-semibold text-cta">
                  listo
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WebHostingPage() {
  const [selectedTerm, setSelectedTerm] = useState<(typeof termOptions)[number]["months"]>(12);

  return (
    <>
      <section className="relative overflow-hidden bg-[#0d1117] pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,255,0,0.18),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(30,41,59,0.78),transparent_28%),linear-gradient(135deg,#0d1117_0%,#141b24_42%,#1f2b37_100%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="section-container relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <AnimatedSection className="max-w-2xl" direction="left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-sm font-medium text-white/90">
                <Globe2 className="h-4 w-4 text-cta" />
                Hosting claro, rápido y orientado a negocio
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Todo lo que necesitas para alojar tu web, sin tener que hablar técnico
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white">
                Un hosting pensado para resolver dominio, SSL, WordPress, correos y operación diaria
                desde una experiencia más fácil de entender y más rápida de usar.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Dashboard propio y más directo",
                  "WordPress y CMS con arranque simple",
                  "SSL incluido en todos los planes",
                  "Soporte para tareas técnicas reales",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 backdrop-blur-sm"
                  >
                    <Check className="h-4 w-4 text-cta" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button variant="cta" size="lg" asChild>
                  <Link href="#planes-hosting">
                    Ver planes de hosting
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/contacto">Hablar con un asesor</Link>
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} direction="right">
              <div className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="rounded-[24px] border border-white/10 bg-[#111821] p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: "Sitios incluidos", value: "Hasta 50", icon: Server },
                      { label: "WordPress", value: "Listo para operar", icon: Wand2 },
                      { label: "SSL", value: "Siempre incluido", icon: ShieldCheck },
                      { label: "Correos", value: "Hasta 5 por sitio", icon: Mail },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cta text-cta-foreground">
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/45">
                            {item.label}
                          </p>
                          <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-5">
                    <p className="text-sm uppercase tracking-[0.16em] text-cta">Inspiración útil</p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      Selector de duración, WordPress, migración y soporte como ejes del servicio
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white">
                      Una combinación de selector por tiempo, foco en WordPress, migración,
                      soporte y operación simple, aterrizada a una experiencia PLIA más directa y
                      más enfocada en negocio.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="section-container">
          <SectionHeader
            badge="Por qué se siente diferente"
            title="Menos fricción operativa. Más control en lo que sí importa."
            description="Reordenamos la propuesta para que el hosting se entienda como una herramienta de trabajo, no como un laberinto técnico."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {valueBlocks.map((item, index) => {
              const Icon = item.icon;

              return (
                <AnimatedSection key={item.title} delay={index * 0.08}>
                  <div className="rounded-[28px] border border-border bg-white p-6 shadow-card">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cta/10 text-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {splitSections.map((section, index) => (
        <section
          key={section.title}
          className={index % 2 === 0 ? "bg-secondary/30 py-20 md:py-24" : "py-20 md:py-24"}
        >
          <div className="section-container">
            <div className={`grid items-center gap-10 lg:grid-cols-[1fr_1fr] ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <AnimatedSection className="max-w-2xl" direction={index % 2 === 0 ? "left" : "right"}>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0f8b68]">
                  {section.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
                  {section.title}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  {section.description}
                </p>

                <div className="mt-8 space-y-3">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cta/15 text-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-foreground">{bullet}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1} direction={index % 2 === 0 ? "right" : "left"}>
                <VisualPanel
                  title={section.cardTitle}
                  lines={section.cardLines}
                  statLabel={section.statLabel}
                  statValue={section.statValue}
                  icon={index === 0 ? PanelsTopLeft : index === 1 ? Cpu : LifeBuoy}
                />
              </AnimatedSection>
            </div>
          </div>
        </section>
      ))}

      <section id="planes-hosting" className="bg-secondary/30 py-20 md:py-24">
        <div className="section-container">
          <SectionHeader
            badge="Planes de hosting"
            title="Elige la duración y mira el costo real por mes"
            description="Tomamos la lógica de selector por tiempo para que entiendas rápido cuánto pagas ahora, cuánto ahorras y a cuánto renueva luego."
          />

          <AnimatedSection delay={0.1} className="mx-auto mt-12 max-w-5xl">
            <div className="rounded-[28px] border border-border bg-white p-4 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0f8b68]">
                    Duración de contratación
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A mayor tiempo, menor costo mensual. Si quieres flexibilidad máxima, también
                    puedes contratar por 1 mes.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {termOptions.map((option) => (
                    <button
                      key={option.months}
                      type="button"
                      onClick={() => setSelectedTerm(option.months)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                        selectedTerm === option.months
                          ? "border-cta bg-cta/10 shadow-sm"
                          : "border-border bg-secondary/30 hover:bg-secondary/60"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{option.note}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {hostingPlans.map((plan, index) => {
              const monthlyPrice = plan.monthlyPricing[selectedTerm];
              const discount = Math.max(0, Math.round((1 - monthlyPrice / plan.regularMonthly) * 100));
              const totalPrice = monthlyPrice * selectedTerm;
              const regularTotal = plan.regularMonthly * selectedTerm;
              const detail =
                selectedTerm === 1
                  ? `Contrata 1 mes por ${formatMoney(totalPrice)}. Tarifa flexible de ${formatMoney(plan.regularMonthly)}/mes.`
                  : `Obtén ${selectedTerm} meses por ${formatMoney(totalPrice)} (precio regular ${formatMoney(regularTotal)}). Renueva a ${formatMoney(plan.regularMonthly)}/mes.`;

              return (
                <PlanCard
                  key={plan.name}
                  name={plan.name}
                  price={monthlyPrice}
                  originalPrice={plan.regularMonthly}
                  discount={discount}
                  description={plan.description}
                  detalle={detail}
                  features={plan.features}
                  freeHosting={plan.freeHosting}
                  isPopular={plan.isPopular}
                  ctaHref={`/checkout/hosting?plan=${plan.slug}&term=${selectedTerm}`}
                  ctaLabel="Comprar hosting"
                  priceSuffix="/mes"
                  paymentLabel={`Facturación por ${selectedTerm} ${selectedTerm === 1 ? "mes" : "meses"}`}
                  delay={index * 0.12}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="section-container">
          <SectionHeader
            badge="Comparativa rápida"
            title="Qué cambia entre Profesional, Premium y Agencia"
            description="Una tabla corta para entender el salto entre planes sin tener que leer una lista interminable."
          />

          <AnimatedSection delay={0.15} className="mt-12">
            <div className="overflow-hidden rounded-[28px] border border-border bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-5 text-left text-sm font-semibold text-foreground">Característica</th>
                      <th className="p-5 text-center text-sm font-semibold text-foreground">Profesional</th>
                      <th className="bg-cta/5 p-5 text-center text-sm font-semibold text-foreground">Premium</th>
                      <th className="p-5 text-center text-sm font-semibold text-foreground">Agencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.feature} className="border-b border-border last:border-b-0">
                        <td className="p-5 text-sm text-foreground">{row.feature}</td>
                        <td className="p-5 text-center text-sm text-muted-foreground">{row.profesional}</td>
                        <td className="bg-cta/5 p-5 text-center text-sm font-medium text-foreground">{row.premium}</td>
                        <td className="p-5 text-center text-sm text-muted-foreground">{row.agencia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-secondary/30 py-20 md:py-24" id="faq-hosting">
        <div className="section-container">
          <SectionHeader
            badge="Preguntas frecuentes"
            title="Lo esencial antes de contratar tu hosting"
            description="Las dudas más comunes sobre plazos, WordPress, SSL, correo y operación."
          />

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                delay={index * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground py-20 text-primary-foreground md:py-24">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold md:text-5xl">
              Un hosting que te deja avanzar sin depender de saber infraestructura
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/70">
              Si quieres ayuda para elegir entre Profesional, Premium o Agencia, te orientamos según
              cuántos sitios vas a manejar y cuánto control necesitas.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="cta" size="lg" asChild>
                <Link href="/contacto">
                  Solicitar asesoría
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="white" size="lg" asChild>
                <Link href="#planes-hosting">Volver a los planes</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
