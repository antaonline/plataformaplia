"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Cpu,
  Globe2,
  Headphones,
  LifeBuoy,
  Mail,
  MoveRight,
  PanelsTopLeft,
  Server,
  ShieldCheck,
  Wand2,
  Zap,
  Shield,
  Search,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  type LucideIcon,
} from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FAQItem } from "@/components/shared/FAQItem";
import { PlanCard } from "@/components/shared/PlanCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      "5 GB de almacenamiento NVMe",
      "SSL Let's Encrypt gratuito",
      "1 mailbox profesional",
      "Backup semanal automático",
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
      "15 GB de almacenamiento NVMe",
      "SSL Let's Encrypt gratuito",
      "2 mailbox profesionales",
      "Backup diario automático",
      "Recursos de CPU dedicados",
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
      "100 GB de almacenamiento NVMe",
      "SSL Let's Encrypt gratuito",
      "5 mailbox profesionales",
      "Soporte prioritario 24/7",
      "White Label (Opcional)",
    ],
  },
] as const;

const valueBlocks = [
  {
    icon: Zap,
    title: "Velocidad con discos NVMe",
    description:
      "Nuestras máquinas corren sobre almacenamiento NVMe de última generación, logrando que tu web cargue hasta 20 veces más rápido que un hosting tradicional.",
  },
  {
    icon: Shield,
    title: "Seguridad blindada",
    description:
      "Protección contra ataques DDoS y malware integrada. Filtramos el tráfico malicioso antes de que llegue a tu servidor para mantener tu web siempre online.",
  },
  {
    icon: PanelsTopLeft,
    title: "Dashboard Intuitivo",
    description:
      "Olvídate de paneles complejos. Gestiona dominios, correos y archivos desde una interfaz limpia diseñada para humanos, no para expertos en IT.",
  },
  {
    icon: Wand2,
    title: "WordPress Optimizado",
    description:
      "Lanzamiento de WordPress en un clic con optimizaciones de caché a nivel de servidor (LiteSpeed) para un rendimiento máximo.",
  },
] as const;

const comparisonRows = [
  { feature: "Sitios web incluidos", profesional: "2", premium: "5", agencia: "50" },
  { feature: "Almacenamiento NVMe", profesional: "5 GB", premium: "15 GB", agencia: "100 GB" },
  { feature: "Tecnología Servidor", profesional: "LiteSpeed", premium: "LiteSpeed Enterprise", agencia: "LiteSpeed Enterprise" },
  { feature: "SSL Let's Encrypt", profesional: "Gratis Ilimitado", premium: "Gratis Ilimitado", agencia: "Gratis Ilimitado" },
  { feature: "Mailbox profesional", profesional: "1 por sitio", profesionalCheck: true, premium: "2 por sitio", premiumCheck: true, agencia: "5 por sitio", agenciaCheck: true },
  { feature: "Backups automáticos", profesional: "Semanales", premium: "Diarios", agencia: "Diarios (On-demand)" },
  { feature: "Migración gratuita", profesional: "Incluida", profesionalCheck: true, premium: "Incluida", premiumCheck: true, agencia: "Incluida", agenciaCheck: true },
] as const;

const faqs = [
  {
    question: "¿El hosting está pensado para alguien sin perfil técnico?",
    answer:
      "Sí. La propuesta está diseñada para reducir pasos y hablar en lenguaje claro, especialmente en tareas como publicar, activar SSL, usar WordPress o gestionar correos.",
  },
  {
    question: "¿Qué es el almacenamiento NVMe y por qué importa?",
    answer:
      "NVMe es una tecnología de almacenamiento mucho más rápida que los discos SSD tradicionales. Esto significa que tu base de datos y archivos se leen casi instantáneamente, lo que reduce drásticamente el tiempo de carga de tu web.",
  },
  {
    question: "¿Mi hosting viene con dominio gratis?",
    answer:
      "El dominio es un servicio aparte, pero si ya tienes uno, te ayudamos a conectarlo sin costo adicional. Si necesitas comprar uno nuevo, puedes hacerlo directamente desde nuestro portal.",
  },
  {
    question: "¿Qué pasa si supero los límites de mi plan?",
    answer:
      "Te avisaremos con antelación. Puedes escalar a un plan superior en cualquier momento pagando solo la diferencia, sin interrupciones en tu servicio.",
  },
  {
    question: "¿Incluyen certificado SSL?",
    answer:
      "Sí, todos nuestros planes incluyen certificados SSL gratuitos de Let's Encrypt que se renuevan automáticamente, asegurando el candado verde en tu navegador.",
  },
] as const;

const formatMoney = (value: number) => `S/ ${value}`;

function TechVisual() {
  return (
    <div className="relative group">
      {/* Background Glow */}
      <div className="absolute -inset-4 bg-cta/10 blur-2xl rounded-[40px] opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0d1117] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cta/10 border border-cta/20">
                <Server className="h-5 w-5 text-cta" />
             </div>
             <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none">Global Network</p>
                <p className="mt-1 text-sm font-bold text-white">PLIA Infrastructure</p>
             </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1 px-3">
             99.9% Uptime
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             {[
               { label: "LiteSpeed", value: "Enterprise", color: "text-cta" },
               { label: "MariaDB", value: "v10.6", color: "text-blue-400" },
             ].map(item => (
               <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{item.label}</p>
                  <p className={cn("mt-1 text-lg font-bold", item.color)}>{item.value}</p>
               </div>
             ))}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
             <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white/60 uppercase">Real-time Performance</span>
                <span className="text-xs font-mono text-cta">0.24ms</span>
             </div>
             <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cta/20 via-cta to-cta/20 w-[85%] animate-pulse shadow-[0_0_15px_#bf3]" />
             </div>
             <div className="mt-4 flex gap-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={cn("h-4 flex-1 rounded-sm", i < 5 ? "bg-cta/40" : "bg-white/5")} />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="relative">
      {/* Decorative Circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cta/10 blur-[80px] rounded-full" />
      
      <div className="relative w-full max-w-[450px] mx-auto">
        <div className="overflow-hidden rounded-[40px] bg-[#f8fafc] border border-border shadow-2xl">
          {/* Header */}
          <div className="bg-foreground p-6 text-white flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-cta flex items-center justify-center shrink-0">
               <Bot className="h-6 w-6 text-cta-foreground" />
            </div>
            <div>
               <p className="font-bold text-lg leading-none">Plia soporte</p>
               <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Estamos listos para ayudarte
               </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 min-h-[350px] flex flex-col">
            <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-border/50 shadow-sm max-w-[85%]">
               <p className="text-sm font-medium text-foreground">
                  ¡Hola! 👋 Soy tu asistente en PLIA. ¿En qué puedo ayudarte hoy?
               </p>
            </div>

            <div className="space-y-3 pt-4">
               {[
                 "Quiero migrar mi hosting gratis",
                 "Ayúdame a configurar mi dominio",
                 "¿Cómo instalo WordPress?",
                 "Necesito asesoría técnica"
               ].map((text, i) => (
                 <button 
                    key={i}
                    className="w-full flex items-center justify-between group text-left px-5 py-3 rounded-2xl bg-white border border-border hover:border-cta hover:bg-cta/5 transition-all"
                 >
                    <span className="text-sm font-bold text-foreground/80 group-hover:text-cta">{text}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                 </button>
               ))}
            </div>

            <div className="mt-auto pt-6">
               <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-white border border-border">
                  <div className="flex-1 text-xs text-muted-foreground italic">Escribe tu duda técnica aquí...</div>
                  <ArrowRight className="h-4 w-4 text-cta" />
               </div>
            </div>
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,255,0,0.12),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(30,41,59,0.5),transparent_28%),linear-gradient(135deg,#0d1117_0%,#141b24_42%,#1f2b37_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="section-container relative z-10">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <AnimatedSection className="max-w-2xl" direction="left">
              <Badge variant="outline" className="mb-6 border-cta/30 bg-cta/5 text-cta py-1.5 px-4 text-xs font-bold uppercase tracking-widest">
                Hosting NVMe Ultra Rápido
              </Badge>
              <h1 className="text-5xl font-bold leading-[1.1] text-white md:text-6xl lg:text-7xl">
                El motor que tu <span className="text-cta">web</span> merece.
              </h1>
              <p className="mt-8 max-w-xl text-xl leading-relaxed text-white/70">
                Alojamiento profesional diseñado para la velocidad. Servidores LiteSpeed, discos NVMe y seguridad blindada para que tu negocio nunca se detenga.
              </p>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button variant="cta" size="xl" className="rounded-full h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(191,255,0,0.3)] hover:scale-105 transition-transform" asChild>
                  <Link href="#planes-hosting">
                    Empezar ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  asChild
                  className="rounded-full h-14 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/contacto">Ver comparativa</Link>
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} direction="right" className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-cta/10 blur-[100px] rounded-full" />
              <div className="rounded-[40px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-md">
                <div className="relative overflow-hidden rounded-[32px] bg-[#111821] p-8 border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono">
                      server_status: healthy
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cta/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white/60">Server Load</span>
                        <span className="text-xs text-cta font-mono">12%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cta w-[12%] shadow-[0_0_10px_#bf3]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <Zap className="h-5 w-5 text-cta mb-3" />
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Speed Score</p>
                        <p className="text-2xl font-bold text-white">99/100</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <ShieldCheck className="h-5 w-5 text-cta mb-3" />
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Security</p>
                        <p className="text-2xl font-bold text-white">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="section-container">
          <SectionHeader
            badge="Tecnología de Vanguardia"
            title="Más que un simple hosting."
            description="Hemos seleccionado el hardware y software más potente del mercado para garantizar que tu web sea la más rápida de su sector."
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {valueBlocks.map((item, index) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.title} delay={index * 0.1}>
                  <div className="group h-full rounded-[32px] border border-border bg-white p-8 transition-all hover:border-cta/50 hover:shadow-xl hover:shadow-cta/5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-secondary/50 text-foreground group-hover:bg-cta group-hover:text-cta-foreground transition-all duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sección Tecnología Dynamic */}
      <section className="bg-[#f8fafc] py-24 border-y border-border/50">
        <div className="section-container">
          <div className="grid items-center gap-20 lg:grid-cols-[1fr_1fr]">
            <AnimatedSection direction="left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border shadow-sm mb-6">
                  <div className="w-2 h-2 rounded-full bg-cta animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground/60">Infraestructura Global</span>
               </div>
               <h2 className="text-4xl font-bold leading-[1.15] text-foreground md:text-5xl lg:text-6xl">
                 Tecnología <span className="text-cta">LiteSpeed</span> para una respuesta inmediata
               </h2>
               <p className="mt-8 text-xl leading-relaxed text-muted-foreground">
                 Utilizamos servidores LiteSpeed Web Server, el estándar de oro en rendimiento web. Esto permite que tu contenido llegue a tus clientes en milisegundos, mejorando tu posicionamiento en Google.
               </p>

               <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  {[
                    "Caché inteligente LSCache",
                    "Optimización automática",
                    "Soporte HTTP/3 + QUIC",
                    "Base de datos MariaDB"
                  ].map(text => (
                    <div key={text} className="flex items-center gap-3">
                       <Check className="h-5 w-5 text-cta shrink-0" />
                       <span className="text-base font-bold text-foreground/80">{text}</span>
                    </div>
                  ))}
               </div>
               
               <div className="mt-12">
                  <Button variant="outline" size="lg" className="rounded-full font-bold group" asChild>
                    <Link href="#planes-hosting">
                      Descubre la potencia <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
               </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} direction="right">
               <TechVisual />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Sección Soporte Dynamic - Estilo Kodee */}
      <section className="py-24 overflow-hidden">
        <div className="section-container">
          <div className="grid items-center gap-20 lg:grid-cols-[0.9fr_1.1fr]">
            <AnimatedSection direction="left" className="order-2 lg:order-1">
               <ChatVisual />
            </AnimatedSection>

            <AnimatedSection direction="right" className="order-1 lg:order-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border mb-6">
                  <Bot className="h-4 w-4 text-cta" />
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground/60">Expertos en Línea</span>
               </div>
               <h2 className="text-4xl font-bold leading-[1.15] text-foreground md:text-5xl lg:text-6xl">
                 Expertos que hablan tu mismo <span className="text-cta">idioma</span>.
               </h2>
               <p className="mt-8 text-xl leading-relaxed text-muted-foreground">
                 No más respuestas genéricas. Nuestro equipo técnico entiende los retos de tu negocio y te ayuda a resolver problemas reales de publicación, DNS y correo.
               </p>

               <div className="mt-10 space-y-6">
                  {[
                    { title: "Soporte Humano 24/7", desc: "Personas reales listas para resolver tus dudas." },
                    { title: "Migración Garantizada", desc: "Movemos tu web actual sin cobrarte ni un sol." }
                  ].map(item => (
                    <div key={item.title} className="flex gap-4">
                       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cta/10 text-cta">
                          <Headphones className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-lg font-bold text-foreground">{item.title}</p>
                          <p className="text-muted-foreground text-sm">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section id="planes-hosting" className="bg-[#f1f5f9] py-24">
        <div className="section-container">
          <SectionHeader
            badge="Tarifas transparentas"
            title="Calidad Enterprise a precios locales"
            description="Sin cargos ocultos. Elige el periodo que mejor se adapte a tu flujo de caja."
          />

          <AnimatedSection delay={0.1} className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-[40px] border border-border bg-white/60 p-3 shadow-xl backdrop-blur-sm">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {termOptions.map((option) => (
                  <button
                    key={option.months}
                    type="button"
                    onClick={() => setSelectedTerm(option.months)}
                    className={`rounded-[30px] px-6 py-4 text-center transition-all duration-300 ${
                      selectedTerm === option.months
                        ? "bg-foreground text-white shadow-lg scale-[1.02]"
                        : "text-muted-foreground hover:bg-white hover:text-foreground"
                    }`}
                  >
                    <p className="text-sm font-bold">{option.label}</p>
                    <p className={`mt-0.5 text-[10px] uppercase font-bold tracking-wider ${
                      selectedTerm === option.months ? "text-cta" : "text-muted-foreground/50"
                    }`}>{option.note}</p>
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {hostingPlans.map((plan, index) => {
              const monthlyPrice = plan.monthlyPricing[selectedTerm];
              const discount = Math.max(0, Math.round((1 - monthlyPrice / plan.regularMonthly) * 100));
              const totalPrice = monthlyPrice * selectedTerm;
              const regularTotal = plan.regularMonthly * selectedTerm;
              const detail =
                selectedTerm === 1
                  ? `Flexibilidad mensual de ${formatMoney(plan.regularMonthly)}. Cancela cuando quieras.`
                  : `Ahorras ${formatMoney(regularTotal - totalPrice)} en tu primer periodo de ${selectedTerm} meses.`;

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
                  ctaLabel="Adquirir ahora"
                  priceSuffix="/mes"
                  paymentLabel={selectedTerm === 1 ? "Facturación mensual" : `Total: S/ ${totalPrice} por ${selectedTerm} meses`}
                  delay={index * 0.15}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-border/50">
        <div className="section-container">
          <SectionHeader
            badge="Transparencia"
            title="Comparativa detallada de características"
            description="Porque sabemos que los detalles técnicos importan cuando buscas estabilidad."
          />

          <AnimatedSection delay={0.2} className="mt-16">
            <div className="overflow-hidden rounded-[32px] border border-border bg-white shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="p-6 text-left text-sm font-bold text-foreground">Especificaciones</th>
                      <th className="p-6 text-center text-sm font-bold text-foreground">Profesional</th>
                      <th className="p-6 text-center text-sm font-bold text-foreground border-x border-border bg-cta/5">Premium</th>
                      <th className="p-6 text-center text-sm font-bold text-foreground">Agencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row) => (
                      <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                        <td className="p-6 text-sm font-semibold text-foreground">{row.feature}</td>
                        <td className="p-6 text-center text-sm text-muted-foreground">
                          {row.profesionalCheck ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : row.profesional}
                        </td>
                        <td className="p-6 text-center text-sm font-bold text-foreground border-x border-border bg-cta/5">
                          {row.premiumCheck ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : row.premium}
                        </td>
                        <td className="p-6 text-center text-sm text-muted-foreground">
                          {row.agenciaCheck ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : row.agencia}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-[#f8fafc] py-24" id="faq-hosting">
        <div className="section-container">
          <SectionHeader
            badge="FAQ"
            title="Dudas frecuentes sobre nuestro Hosting"
            description="Todo lo que necesitas saber antes de dar el salto a PLIA."
          />

          <div className="mx-auto mt-16 max-w-4xl grid gap-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-foreground py-24 text-primary-foreground md:py-32">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cta/0 via-cta to-cta/0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(191,255,0,0.1),transparent_70%)]" />

        <div className="section-container relative z-10 text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-bold md:text-6xl tracking-tight">
              ¿Listo para darle velocidad a tu web?
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-primary-foreground/60">
              Únete a las empresas que ya confían en la infraestructura de PLIA para sus proyectos más ambiciosos.
            </p>
            <div className="mt-14 flex flex-col justify-center gap-6 sm:flex-row">
              <Button variant="cta" size="xl" className="rounded-full px-10 h-16 text-lg font-bold shadow-2xl hover:scale-105 transition-transform" asChild>
                <Link href="#planes-hosting">
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="white" size="xl" className="rounded-full px-10 h-16 text-lg font-bold" asChild>
                <Link href="/contacto">Hablar con soporte</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
