'use client';

import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { StepCard } from "@/components/shared/StepCard";
import { FAQItem } from "@/components/shared/FAQItem";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Palette, Rocket, CheckCircle2 } from "lucide-react";

import Link from "next/link";
import Image from "next/image";

/*import illustrationProcess from "@/assets/illustration-process.png";*/

const detailedSteps = [
  {
    number: 1,
    icon: MessageCircle,
    title: "Conversamos sobre tu negocio",
    description: "Una vez elegido tu plan e ingresado a la plataforma te hacemos preguntas simples sobre tu negocio: qué vendes, a quién le vendes, qué quieres lograr con tu web. No necesitas saber nada técnico.",
    duration: "5 -10 minutos",
  },
  {
    number: 2,
    icon: Palette,
    title: "Diseñamos tu página",
    description: "Nuestro equipo de diseño crea tu página web usando la información que nos diste. Elegimos colores, tipografías y un diseño que represente tu marca. Puedes ver el diseño de tu web desde el panel de tu cuenta antes de que sea publicada.",
    duration: "2-5 días hábiles según Plan",
  },
  {
    number: 3,
    icon: Rocket,
    title: "Publicamos y te enseñamos",
    description: "Una vez que apruebes el diseño (si no hay cambios), configuramos todo lo técnico: dominio, seguridad, optimización. Publicamos tu web y te explicamos cómo funciona, cómo ver tus mensajes de contacto y cómo compartirla.",
    duration: "1-2 días hábiles",
  },
];

const whatYouNeed = [
  "El nombre de tu negocio",
  "Una descripción corta de lo que haces",
  "Información de contacto (teléfono, email, dirección)",
  "Fotos de tu negocio o productos (las que tengas)",
  "Tu logo (si tienes uno, sino podemos ayudarte)",
  "Tu información de contacto, redes y entre otros",
];

const whatWeHandle = [
  "Registro del dominio (.com, .pe, etc.)",
  "Configuración del servidor y hosting",
  "Diseño visual de la página",
  "Programación y desarrollo",
  "Certificado de seguridad HTTPS",
  "Optimización para celulares",
  "Configuración para aparecer en Google",
  "Pruebas de funcionamiento",
];

const faqs = [
  {
    question: "¿Qué pasa si no tengo fotos profesionales?",
    answer: "No te preocupes. Trabajamos con las fotos que tengas. Si son de celular, las optimizamos para que se vean bien. También podemos usar imágenes de stock que combinen con tu negocio sin costo adicional.",
  },
  {
    question: "¿Cuánto tiempo toma tener mi web lista?",
    answer: "El Plan Landing se entrega en 24 horas aproximadamente. El Plan Institucional toma 2 días. Esto puede variar según qué tan rápido nos envíes el contenido.",
  },
  {
    question: "¿Qué pasa si no me gusta el diseño?",
    answer: "Te mostramos el diseño antes de publicar y puedes pedir cambios. El Plan Landing incluye 1 ronda de revisiones y el Plan Institucional incluye 2. Queremos que quedes 100% satisfecho.",
  },
  {
    question: "¿Puedo ver cómo va quedando mi web?",
    answer: "¡Claro! Te compartimos un enlace de vista previa donde puedes ver exactamente cómo se verá tu página antes de publicarla oficialmente.",
  },
  {
    question: "¿Necesito estar disponible durante todo el proceso?",
    answer: "Solo necesitamos tu tiempo al inicio donde llenas el formulario con información sobre tu negocio (5-10 min) y después para revisar el diseño. El resto lo hacemos nosotros.",
  },
];

const ComoFunciona = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-hero-gradient">
        <div className="section-container">
          <SectionHeader
            badge="Cómo funciona"
            title="Simple, rápido y sin complicaciones"
            description="En 3 pasos tendrás tu web profesional lista para compartir con tus clientes. Nosotros nos encargamos de todo lo técnico."
          />

          
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto space-y-12">
            {detailedSteps.map((step, index) => (
              <AnimatedSection key={step.number} delay={index * 0.15}>
                <div className="flex gap-6 p-6 md:p-8 rounded-2xl bg-white border border-border shadow-card">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-cta flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-cta-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                        Paso {step.number}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ⏱️ {step.duration}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* What You Need vs What We Handle */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="section-container">
          <SectionHeader
            badge="División de tareas"
            title="Tú solo necesitas lo básico"
            description="Nosotros nos encargamos del trabajo pesado. Tú solo preparas lo que conoces de tu negocio."
          />

          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            <AnimatedSection delay={0.1}>
              <div className="bg-white rounded-2xl border border-border p-8 h-full">
                <div className="w-12 h-12 rounded-xl bg-warm/10 flex items-center justify-center mb-6">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Lo que tú preparas</h3>
                <ul className="space-y-3">
                  {whatYouNeed.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-warm flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-foreground rounded-2xl p-8 h-full">
                <div className="w-12 h-12 rounded-xl bg-cta flex items-center justify-center mb-6">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-primary-foreground mb-4">Lo que nosotros hacemos</h3>
                <ul className="space-y-3">
                  {whatWeHandle.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cta flex-shrink-0 mt-0.5" />
                      <span className="text-primary-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <SectionHeader
            badge="Tiempos estimados"
            title="¿Cuánto tiempo toma?"
            description="Trabajamos rápido sin sacrificar calidad. Aquí los tiempos típicos."
          />

          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-3xl mx-auto">
            <AnimatedSection delay={0.1}>
              <div className="p-6 rounded-2xl bg-white border border-border text-center">
                <p className="text-4xl font-bold text-foreground mb-2">24 Horas!</p>
                <p className="text-lg font-medium text-foreground mb-1">Plan Landing</p>
                <p className="text-sm text-muted-foreground">Página de una sección</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="p-6 rounded-2xl bg-cta/10 border border-cta/20 text-center">
                <p className="text-4xl font-bold text-foreground mb-2">2 días hábiles!</p>
                <p className="text-lg font-medium text-foreground mb-1">Plan Web Institucional</p>
                <p className="text-sm text-muted-foreground">Web completa de Hasta 5 páginas internas</p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.3} className="text-center mt-8">
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              * Los tiempos pueden variar dependiendo de qué tan rápido nos envíes el contenido 
              (textos, fotos, etc.) y cuántas revisiones solicites.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-secondary/30" id="faq">
        <div className="section-container">
          <SectionHeader
            badge="Preguntas frecuentes"
            title="Respondemos tus dudas"
            description="Lo que más nos preguntan sobre el proceso."
          />

          <div className="max-w-2xl mx-auto mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-foreground text-primary-foreground">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para empezar?
            </h2>
          </AnimatedSection>
          
          <AnimatedSection delay={0.1}>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              El primer paso una vez dentro es un simple formulario. Cuéntanos sobre tu negocio y 
              comenzamos con tu web.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta" size="lg" asChild>
                <Link href="/contacto">
                  Quiero empezar ahora
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="white" size="lg" asChild>
                <Link href="/planes">Ver planes y precios</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default ComoFunciona;
