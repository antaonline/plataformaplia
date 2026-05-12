"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Headphones,
  Server,
  ShieldCheck,
  Wand2,
  Zap,
  Shield,
  ChevronRight,
  Bot,
  Star,
  CheckCircle2,
  PanelsTopLeft,
} from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FAQItem } from "@/components/shared/FAQItem";
import { PlanCard } from "@/components/shared/PlanCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeepParticleField } from "@/components/shared/DeepParticleField";

const termOptions = [
  { months: 1, label: "1 mes", note: "Flexibilidad" },
  { months: 12, label: "12 meses", note: "Ideal para empezar" },
  { months: 24, label: "24 meses", note: "Mejor valor" },
  { months: 48, label: "48 meses", note: "Máximo ahorro" },
] as const;

const hostingPlans = [
  {
    slug: "profesional",
    name: "Profesional",
    regularMonthly: 28,
    description: "Para negocios pequeños que necesitan estabilidad y facilidad desde el primer día.",
    monthlyPricing: { 1: 28, 12: 20, 24: 18, 48: 16 },
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
    monthlyPricing: { 1: 56, 12: 40, 24: 36, 48: 32 },
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
    monthlyPricing: { 1: 112, 12: 80, 24: 72, 48: 64 },
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
    title: "Velocidad Extrema NVMe",
    description: "Alojamiento sobre discos NVMe para que tu web cargue hasta 20 veces más rápido que en un hosting tradicional. Mejor rendimiento, mejor SEO.",
  },
  {
    icon: Shield,
    title: "Seguridad Blindada",
    description: "Protección DDoS, escáner de malware en tiempo real y firewall de aplicaciones (WAF) para mantener tu inversión segura 24/7.",
  },
  {
    icon: PanelsTopLeft,
    title: "Panel Diseñado para Ti",
    description: "Gestiona todo sin ser un experto. Instala apps, revisa estadísticas y crea correos desde una interfaz moderna e intuitiva.",
  },
  {
    icon: Wand2,
    title: "WordPress Optimizado",
    description: "LiteSpeed Enterprise incluido. Tu WordPress volará con caché a nivel de servidor, listo en 1 clic.",
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
];

const faqs = [
  {
    question: "¿El hosting está pensado para alguien sin perfil técnico?",
    answer: "Sí. La propuesta está diseñada para reducir pasos y hablar en lenguaje claro, especialmente en tareas como publicar, activar SSL, usar WordPress o gestionar correos.",
  },
  {
    question: "¿Qué es el almacenamiento NVMe y por qué importa?",
    answer: "NVMe es una tecnología de almacenamiento mucho más rápida que los discos SSD tradicionales. Esto reduce drásticamente el tiempo de carga de tu web, mejorando la experiencia del usuario y tu posicionamiento en Google.",
  },
  {
    question: "¿Mi hosting viene con dominio gratis?",
    answer: "El dominio es un servicio aparte, pero si ya tienes uno, te ayudamos a conectarlo sin costo. También puedes adquirir dominios de manera sencilla a través de nosotros.",
  },
  {
    question: "¿Qué pasa si supero los límites de mi plan?",
    answer: "Te avisaremos con antelación. Puedes escalar a un plan superior en cualquier momento pagando solo la diferencia prorrateada, sin caídas de servicio.",
  },
  {
    question: "¿Incluyen certificado SSL?",
    answer: "Sí, todos nuestros planes incluyen certificados SSL gratuitos e ilimitados de Let's Encrypt que se renuevan automáticamente.",
  },
] as const;

const formatMoney = (value: number) => `S/ ${value}`;

function FloatingServerVisual() {
  return (
    <motion.div 
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex justify-center items-center w-full max-w-[600px] mx-auto"
    >
       <div className="absolute inset-0 bg-cta/20 blur-[120px] rounded-full scale-150" />
       <Image 
         src="/assets/3d_hosting_server.png" 
         alt="Modern Web Server Infrastructure" 
         width={800} 
         height={800} 
         className="relative z-10 drop-shadow-[0_0_50px_rgba(191,255,0,0.2)] object-contain w-full h-auto"
         style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 72%)', maskImage: 'radial-gradient(circle at center, black 45%, transparent 72%)' }}
         priority
       />
       {/* Floating Badges */}
       <motion.div 
         animate={{ y: [0, -15, 0] }}
         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
         className="absolute -right-4 top-1/4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl z-20 flex items-center gap-3"
       >
          <div className="bg-cta p-2 rounded-lg"><Zap className="w-5 h-5 text-black" /></div>
          <div>
            <p className="text-xs text-white/70 font-medium">Uptime</p>
            <p className="text-sm font-bold text-white">99.9% Garantizado</p>
          </div>
       </motion.div>
       <motion.div 
         animate={{ y: [0, 15, 0] }}
         transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
         className="absolute -left-8 bottom-1/3 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl z-20 flex items-center gap-3"
       >
          <div className="bg-blue-500 p-2 rounded-lg"><ShieldCheck className="w-5 h-5 text-white" /></div>
          <div>
            <p className="text-xs text-white/70 font-medium">Seguridad</p>
            <p className="text-sm font-bold text-white">DDoS Protection</p>
          </div>
       </motion.div>
    </motion.div>
  );
}

function FloatingShieldVisual() {
  return (
    <motion.div 
      initial={{ y: 0 }}
      animate={{ y: [-15, 15, -15] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex justify-center items-center w-full max-w-[500px] mx-auto"
    >
       <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full scale-150" />
       <Image 
         src="/assets/3d_speed_shield.png" 
         alt="Speed and Security Shield" 
         width={600} 
         height={600} 
         className="relative z-10 drop-shadow-2xl object-contain w-full h-auto"
         style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 72%)', maskImage: 'radial-gradient(circle at center, black 45%, transparent 72%)' }}
       />
    </motion.div>
  );
}

export default function WebHostingPage() {
  const [selectedTerm, setSelectedTerm] = useState<(typeof termOptions)[number]["months"]>(48);

  return (
    <>
      {/* HERO SECTION - HOSTINGER STYLE */}
      <section className="relative overflow-hidden bg-[#0d1117] pt-32 pb-24 md:pt-44 md:pb-32">
        {/* Background Gradients & Particles */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(191,255,0,0.15),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.8),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <DeepParticleField />

        <div className="section-container relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <AnimatedSection className="max-w-3xl" direction="left">
              {/* Trust Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-cta text-cta" />
                  ))}
                </div>
                <span className="text-sm font-medium text-white/90">
                  <span className="font-bold text-white">4.9/5</span> por más de 10,000 clientes
                </span>
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.05] text-white md:text-6xl lg:text-[72px] tracking-tight">
                Hosting Web <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cta via-[#d4ff55] to-cta animate-shimmer">
                  Ultra Rápido y Seguro.
                </span>
              </h1>
              
              <p className="mt-8 max-w-xl text-lg md:text-xl leading-relaxed text-white/70">
                Todo lo que necesitas para lanzar tu sitio web al éxito. Servidores LiteSpeed, discos NVMe y soporte experto 24/7. Rendimiento de nivel empresarial, hecho simple.
              </p>

              {/* Quick Features */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                 {[
                   "Dominio Gratis (1er año)",
                   "Migración Web Gratuita",
                   "Soporte Experto 24/7",
                   "Certificado SSL Ilimitado"
                 ].map((feature, idx) => (
                   <div key={idx} className="flex items-center gap-2">
                     <CheckCircle2 className="h-5 w-5 text-cta" />
                     <span className="text-sm font-medium text-white/90">{feature}</span>
                   </div>
                 ))}
              </div>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button variant="cta" size="xl" className="rounded-full h-16 px-10 text-xl font-bold shadow-[0_0_30px_rgba(191,255,0,0.25)] hover:shadow-[0_0_40px_rgba(191,255,0,0.4)] hover:-translate-y-1 transition-all" asChild>
                  <Link href="#planes-hosting">
                    Ver Planes de Hosting
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                   <ShieldCheck className="w-4 h-4 text-emerald-400" />
                   Garantía de reembolso de 30 días
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} direction="right" className="relative hidden lg:block">
               <FloatingServerVisual />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* PRICING SECTION - HOSTINGER STYLE */}
      <section id="planes-hosting" className="bg-white py-24 relative z-20 -mt-10 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">
              Elige el plan perfecto para ti
            </h2>
            <p className="text-xl text-muted-foreground">
              Precios transparentes. Ahorra más contratando a largo plazo.
            </p>
          </div>

          {/* Pricing Toggle */}
          <AnimatedSection delay={0.1} className="mx-auto mb-16 flex justify-center">
            <div className="inline-flex rounded-full border border-border bg-[#f8fafc] p-1.5 shadow-inner">
              {termOptions.map((option) => (
                <button
                  key={option.months}
                  type="button"
                  onClick={() => setSelectedTerm(option.months)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-full px-8 py-3 text-sm font-bold transition-all duration-300",
                    selectedTerm === option.months
                      ? "bg-foreground text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{option.label}</span>
                  {option.months === 48 && (
                    <span className="absolute -top-3 -right-2 bg-cta text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse-soft">
                      Ahorra más
                    </span>
                  )}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Cards Container */}
          <div className="grid gap-8 md:grid-cols-3 max-w-[1200px] mx-auto items-center">
            {hostingPlans.map((plan, index) => {
              const monthlyPrice = plan.monthlyPricing[selectedTerm];
              const discount = Math.max(0, Math.round((1 - monthlyPrice / plan.regularMonthly) * 100));
              const totalPrice = monthlyPrice * selectedTerm;
              const regularTotal = plan.regularMonthly * selectedTerm;
              
              const isPremium = plan.isPopular;

              return (
                <AnimatedSection 
                   key={plan.name} 
                   delay={index * 0.1}
                   className={cn(
                     "relative rounded-[32px] p-8 transition-all duration-300 hover:-translate-y-2",
                     isPremium 
                       ? "bg-[#0d1117] text-white shadow-2xl scale-105 border border-cta/30 z-10" 
                       : "bg-white border border-border shadow-lg"
                   )}
                >
                  {isPremium && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cta text-black px-4 py-1.5 rounded-full text-sm font-extrabold uppercase tracking-wide shadow-[0_0_15px_rgba(191,255,0,0.5)]">
                      El Más Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={cn("text-2xl font-bold mb-2", isPremium ? "text-white" : "text-foreground")}>
                      {plan.name}
                    </h3>
                    <p className={cn("text-sm", isPremium ? "text-white/70" : "text-muted-foreground")}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                       <span className={cn("text-sm line-through font-medium", isPremium ? "text-white/50" : "text-muted-foreground/60")}>
                         S/ {plan.regularMonthly}/mes
                       </span>
                       {discount > 0 && (
                         <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md", isPremium ? "bg-cta/20 text-cta" : "bg-emerald-100 text-emerald-700")}>
                           Ahorra {discount}%
                         </span>
                       )}
                    </div>
                    <div className="flex items-baseline gap-1">
                       <span className={cn("text-5xl font-extrabold tracking-tight", isPremium ? "text-white" : "text-foreground")}>
                         S/ {monthlyPrice}
                       </span>
                       <span className={cn("text-sm font-medium", isPremium ? "text-white/70" : "text-muted-foreground")}>/mes</span>
                    </div>
                    {selectedTerm > 1 && (
                      <p className={cn("text-xs mt-2 font-medium", isPremium ? "text-white/60" : "text-muted-foreground/80")}>
                        S/ {totalPrice} por los primeros {selectedTerm} meses
                      </p>
                    )}
                  </div>

                  <Button 
                    variant={isPremium ? "cta" : "outline"} 
                    className={cn(
                      "w-full h-12 rounded-xl font-bold text-base mb-8",
                      !isPremium && "border-border hover:bg-secondary"
                    )}
                    asChild
                  >
                    <Link href={`/checkout/hosting?plan=${plan.slug}&term=${selectedTerm}`}>
                      Añadir al carrito
                    </Link>
                  </Button>

                  <div className="space-y-4">
                    <p className={cn("text-sm font-bold", isPremium ? "text-white" : "text-foreground")}>
                      Características destacadas:
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className={cn("h-5 w-5 shrink-0", isPremium ? "text-cta" : "text-emerald-500")} />
                          <span className={cn("text-sm font-medium", isPremium ? "text-white/90" : "text-muted-foreground")}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES GRID - HOSTINGER STYLE */}
      <section className="py-24 bg-[#f8fafc] border-y border-border/50">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight">
              Diseñado para el rendimiento absoluto.
            </h2>
            <p className="text-lg text-muted-foreground">
              Nuestra arquitectura de hosting te proporciona la velocidad, seguridad y confiabilidad que tu proyecto web exige.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {valueBlocks.map((item, index) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.title} delay={index * 0.1}>
                  <div className="group h-full rounded-[24px] border border-border bg-white p-8 transition-all duration-300 hover:border-cta/50 hover:shadow-[0_8px_30px_rgba(191,255,0,0.1)]">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#f1f5f9] text-foreground transition-all duration-500 group-hover:bg-cta group-hover:text-black group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* SPEED & SECURITY SHOWCASE */}
      <section className="py-24 overflow-hidden bg-white">
        <div className="section-container">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1fr]">
            <AnimatedSection direction="left" className="order-2 lg:order-1">
               <FloatingShieldVisual />
            </AnimatedSection>

            <AnimatedSection direction="right" className="order-1 lg:order-2">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Seguridad Total Inluida</span>
               </div>
               <h2 className="text-4xl font-extrabold leading-[1.15] text-foreground md:text-5xl lg:text-[56px] tracking-tight">
                 Tu sitio web, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">protegido</span> de todo mal.
               </h2>
               <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                 Prevenimos los ataques antes de que sucedan. Nuestra infraestructura cuenta con medidas proactivas que garantizan el 99.9% de Uptime sin importar el tráfico o los intentos de vulneración.
               </p>

               <div className="mt-10 space-y-6">
                  {[
                    { title: "Escáner de Malware 24/7", desc: "Detectamos y eliminamos archivos sospechosos automáticamente." },
                    { title: "Firewall de Aplicaciones Web (WAF)", desc: "Bloquea inyecciones SQL y ataques de fuerza bruta." },
                    { title: "Backups Automatizados", desc: "Copias de seguridad listas para ser restauradas en 1 clic." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <CheckCircle2 className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-lg font-bold text-foreground">{item.title}</p>
                          <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-24 bg-[#f8fafc] border-t border-border/50">
        <div className="section-container">
          <SectionHeader
            badge="Transparencia"
            title="Compara todos los detalles técnicos"
            description="Revisa a fondo lo que incluye cada plan y encuentra el ajuste perfecto."
          />

          <AnimatedSection delay={0.2} className="mt-16">
            <div className="overflow-hidden rounded-[32px] border border-border bg-white shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="p-6 text-left text-sm font-bold text-foreground w-1/4">Características</th>
                      <th className="p-6 text-center text-sm font-bold text-foreground w-1/4">Profesional</th>
                      <th className="p-6 text-center text-sm font-bold text-foreground w-1/4 border-x border-border/50 bg-[#0d1117] text-white">Premium</th>
                      <th className="p-6 text-center text-sm font-bold text-foreground w-1/4">Agencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row) => (
                      <tr key={row.feature} className="hover:bg-muted/20 transition-colors group">
                        <td className="p-6 text-sm font-semibold text-foreground group-hover:text-cta-hover transition-colors">{row.feature}</td>
                        <td className="p-6 text-center text-sm text-muted-foreground">
                          {row.profesionalCheck ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : row.profesional}
                        </td>
                        <td className="p-6 text-center text-sm font-bold text-foreground border-x border-border/50 bg-secondary/10">
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

      {/* FAQ */}
      <section className="bg-white py-24" id="faq-hosting">
        <div className="section-container">
          <SectionHeader
            badge="Preguntas Frecuentes"
            title="Resolvemos tus dudas"
            description="Todo lo que necesitas saber antes de dar el salto a PLIA."
          />

          <div className="mx-auto mt-16 max-w-3xl grid gap-4">
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

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[#0d1117] py-24 text-white md:py-32 m-4 rounded-[40px] mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cta/0 via-cta to-cta/0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(191,255,0,0.15),transparent_60%)]" />

        <div className="section-container relative z-10 text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-extrabold md:text-6xl tracking-tight mb-8">
              ¿Listo para darle <span className="text-cta">velocidad</span> a tu web?
            </h2>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/70 mb-12">
              Únete a las empresas que ya confían en la infraestructura de PLIA para sus proyectos más ambiciosos. Migramos tu web gratis hoy mismo.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="cta" size="xl" className="rounded-full px-10 h-16 text-lg font-bold shadow-[0_0_30px_rgba(191,255,0,0.3)] hover:scale-105 transition-transform" asChild>
                <Link href="#planes-hosting">
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="rounded-full px-10 h-16 text-lg font-bold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/contacto">Hablar con soporte</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-white/50 font-medium">
              * Garantía de devolución de dinero de 30 días en todos los planes.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
