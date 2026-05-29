"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Check, 
  ArrowRight, 
  Plus, 
  ArrowUpRight, 
  Figma, 
  Github 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DeepParticleField } from "@/components/shared/DeepParticleField";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

const PLACEHOLDER_EXAMPLES = [
  "una landing page para mi gimnasio",
  "una página para mi panadería artesanal",
  "un portafolio para un fotógrafo de bodas",
  "una web para mi clínica veterinaria moderna",
  "una tienda online de café orgánico"
];

export default function AiWebLandingPage() {
  const [prompt, setPrompt] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Placeholder Animation State
  const [placeholder, setPlaceholder] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // Placeholder Typewriter Logic
  useEffect(() => {
    const handleTyping = () => {
      const currentFullText = PLACEHOLDER_EXAMPLES[exampleIndex];
      
      if (!isDeleting) {
        setPlaceholder(currentFullText.substring(0, placeholder.length + 1));
        setTypingSpeed(100);
        
        if (placeholder === currentFullText) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setPlaceholder(currentFullText.substring(0, placeholder.length - 1));
        setTypingSpeed(50);
        
        if (placeholder === "") {
          setIsDeleting(false);
          setExampleIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, exampleIndex, typingSpeed]);

  const handleStartTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsSimulating(true);
    setTimeout(() => {
      window.location.href = `/experimental/iachatweb?prompt=${encodeURIComponent(prompt)}`;
    }, 1500);
  };

  const aiPlans = [
    {
      slug: "explorador",
      name: "Explorador",
      price: "0",
      description: "Prueba la magia de la IA sin costo alguno.",
      credits: "5 créditos diarios (máx 30/mes)",
      isPopular: false,
      features: [
        "2 Sitios publicados (.plia.pe)",
        "IA Estándar (Gemini Flash)",
        "Previsualización en tiempo real",
        "Sello 'Hecho con PLIA'",
      ],
      button: "Empezar Gratis"
    },
    {
      slug: "presencia",
      name: "Presencia",
      price: "45",
      description: "Tu primera web profesional al mejor precio de Latam.",
      credits: "40 créditos diarios (máx 250/mes)",
      isPopular: true,
      features: [
        "1 Web Profesional (Landing)",
        "Dominio Personalizado (.com)",
        "IA Optimizada para código",
        "Sin sello de marca PLIA",
        "SSL de Alta Seguridad",
      ],
      button: "Elegir Presencia"
    },
    {
      slug: "emprendedor",
      name: "Emprendedor",
      price: "99",
      description: "Potencia para negocios en crecimiento y expansión.",
      credits: "100 créditos diarios (máx 600/mes)",
      isPopular: false,
      features: [
        "3 Webs Profesionales",
        "3 Correos Corporativos",
        "IA Avanzada (Claude Sonnet)",
        "Edición manual de archivos",
        "Soporte por WhatsApp",
      ],
      button: "Ser Emprendedor"
    },
    {
      slug: "agencia",
      name: "Agencia",
      price: "169",
      description: "La oficina virtual para creadores y agencias.",
      credits: "250 créditos diarios (máx 1500/mes)",
      isPopular: false,
      features: [
        "15 Webs Profesionales",
        "Correos Ilimitados",
        "IA de Máxima Calidad",
        "Créditos acumulables (Rollover)",
        "Soporte Prioritario 24/7",
      ],
      button: "Plan Agencia"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32 min-h-[85vh] flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(191,255,0,0.12),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.8),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <DeepParticleField />

        <div className="section-container relative z-10 px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <AnimatedSection direction="up">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-cta animate-pulse" />
                <span className="text-sm font-medium text-white/90">
                  <span className="font-bold text-white">IA Generativa</span> de próxima generación
                </span>
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.05] text-white md:text-6xl lg:text-[76px] tracking-tight mb-8">
                ¿Qué vas a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cta via-[#d4ff55] to-cta animate-shimmer italic font-bold">
                  construir
                </span> hoy?
              </h1>
              
              <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed text-white/70">
                Tu web profesional lista en minutos, no en semanas. Deja de imaginar, empieza a chatear con nuestra IA y lánzala con un solo clic.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="mt-12 max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-cta/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <form 
                onSubmit={handleStartTrial}
                className="relative bg-[#161b22] border border-white/10 p-4 md:p-6 rounded-[2rem] shadow-2xl"
              >
                <textarea 
                  placeholder={`Ej: Hazme ${placeholder}_`}
                  className="w-full bg-transparent border-none focus:ring-0 text-lg py-2 px-4 min-h-[100px] text-white placeholder:text-slate-600 resize-none scrollbar-none focus:outline-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleStartTrial(e);
                    }
                  }}
                  disabled={isSimulating}
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex gap-3">
                    <button type="button" className="p-2 rounded-xl text-slate-500 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                      <Plus className="h-5 w-5" />
                    </button>
                    <div className="hidden sm:flex gap-2 ml-2">
                      <button type="button" className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/5 transition-all">
                        <Figma className="h-3 w-3" /> Figma
                      </button>
                      <button type="button" className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/5 transition-all">
                        <Github className="h-3 w-3" /> GitHub
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    className="bg-cta hover:bg-cta-hover text-black rounded-full h-12 px-10 font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(191,255,0,0.3)] transition-all"
                    disabled={isSimulating || !prompt.trim()}
                  >
                    {isSimulating ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Zap className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <>
                        Construir ahora
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section className="py-24 bg-white text-slate-900 rounded-t-[40px] relative z-20 -mt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="section-container px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-cta/10 text-cta border-cta/20 mb-4 px-4 py-1 font-bold uppercase tracking-widest text-[10px]">Demostración en vivo</Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Tu diálogo convertido en código</h2>
            <p className="text-slate-500 text-lg">Este es un ejemplo de cómo interactúas con PLIA para ajustar tu web en tiempo real. Tú pides, la IA ejecuta.</p>
          </div>
          
          <AnimatedSection direction="up" className="max-w-6xl mx-auto rounded-[3rem] border border-slate-200 bg-[#f8fafc] shadow-2xl overflow-hidden aspect-video relative group">
            <div className="flex h-full">
              <div className="w-64 border-r border-slate-200 p-8 space-y-8 hidden md:block bg-white/50">
                <div className="flex items-center gap-2 mb-10">
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                </div>
                <div className="h-5 w-full bg-slate-100 rounded-full" />
                <div className="h-5 w-3/4 bg-slate-100 rounded-full" />
                <div className="h-40 w-full border border-dashed border-slate-300 rounded-3xl flex items-center justify-center text-slate-300">
                  <Plus className="h-8 w-8" />
                </div>
              </div>

              <div className="flex-1 bg-white p-16 relative">
                <div className="space-y-10 max-w-lg">
                  <div className="h-10 w-56 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-48 w-full bg-slate-50 rounded-[2.5rem] animate-pulse" />
                  <div className="grid grid-cols-3 gap-8">
                    <div className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
                    <div className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
                    <div className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
                  </div>
                </div>

                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-16 right-16 w-80 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-slate-100 rounded-[2.5rem] p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-cta flex items-center justify-center text-black">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-cta uppercase tracking-widest mb-0.5">PLIA Assistant</p>
                      <p className="text-sm font-black text-slate-800">Cerebro de Diseño</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                    "He ajustado el menú y añadido las fotos de alta resolución que pediste. ¿Te gustaría cambiar el color de los botones al verde lima corporativo?"
                  </p>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* PRICING SECTION - EXACT COPY FROM WEB-HOSTING STYLE */}
      <section className="py-24 bg-[#f8fafc] border-y border-border/50">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Elige el plan perfecto para ti
            </h2>
            <p className="text-xl text-muted-foreground">
              Precios transparentes en soles. Comienza hoy mismo.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-[1400px] mx-auto items-center">
            {aiPlans.map((plan, index) => {
              const isPremium = plan.isPopular;

              return (
                <AnimatedSection 
                   key={plan.name} 
                   delay={index * 0.1}
                   className={cn(
                     "relative rounded-[32px] p-8 transition-all duration-300 hover:-translate-y-2 flex flex-col",
                     isPremium 
                       ? "bg-[#0d1117] text-white shadow-2xl scale-105 border border-cta/30 z-10" 
                       : "bg-white border border-slate-200 shadow-lg"
                   )}
                >
                  {isPremium && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cta text-black px-4 py-1.5 rounded-full text-sm font-extrabold uppercase tracking-wide shadow-[0_0_15px_rgba(191,255,0,0.5)]">
                      El Más Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={cn("text-2xl font-bold mb-2", isPremium ? "text-white" : "text-slate-900")}>
                      {plan.name}
                    </h3>
                    <p className={cn("text-sm", isPremium ? "text-white/70" : "text-muted-foreground")}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                       {plan.price === "0" ? (
                         <span className={cn("text-5xl font-extrabold tracking-tight", isPremium ? "text-white" : "text-slate-900")}>
                           GRATIS
                         </span>
                       ) : (
                         <>
                           <span className={cn("text-5xl font-extrabold tracking-tight", isPremium ? "text-white" : "text-slate-900")}>
                             S/ {plan.price}
                           </span>
                           <span className={cn("text-sm font-medium", isPremium ? "text-white/70" : "text-muted-foreground")}>/mes</span>
                         </>
                       )}
                    </div>

                    <div className={cn("mt-6 py-4 border-y", isPremium ? "border-white/10" : "border-slate-100")}>
                       <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isPremium ? "text-cta" : "text-indigo-600")}>IA Créditos</p>
                       <p className={cn("text-sm font-bold", isPremium ? "text-white" : "text-slate-800")}>{plan.credits}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                    <p className={cn("text-sm font-bold", isPremium ? "text-white" : "text-slate-900")}>
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

                  <Button
                    variant={isPremium ? "cta" : "ctaOutline"}
                    className="w-full h-12 rounded-xl text-base"
                    asChild
                  >
                    <Link href="/experimental/iachatweb">
                      Añadir al carrito
                    </Link>
                  </Button>
                </AnimatedSection>
              );
            })}
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
              ¿Listo para darle <span className="text-cta italic">velocidad</span> a tu web?
            </h2>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/70 mb-12">
              Únete a las empresas que ya confían en la infraestructura de PLIA para sus proyectos más ambiciosos.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="cta" size="xl" className="rounded-full px-10 h-16 text-xl font-bold shadow-[0_0_30px_rgba(191,255,0,0.25)] hover:scale-105 transition-all" asChild>
                <Link href="/experimental/iachatweb">
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="rounded-full px-10 h-16 text-lg font-bold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/contacto">Hablar con soporte</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
