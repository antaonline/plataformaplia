"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PlanCard } from "@/components/shared/PlanCard";
import { StepCard } from "@/components/shared/StepCard";
import { VideoBackground } from "@/components/shared/VideoBackground";
import { SplitText } from "@/components/shared/SplitText";
import { ScrollIndicator } from "@/components/shared/ScrollIndicator";
import { FeatureCard } from "@/components/shared/FeatureCard";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { ParallaxSection } from "@/components/shared/ParallaxSection";
import { TestimonialCarousel } from "@/components/shared/TestimonialCarousel";
import { LogosGrid } from '@/components/shared/LogosGrid';
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  Zap, 
  Shield, 
  Headphones, 
  Globe, 
  Palette, 
  Clock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const heroVideo = "/videos/hero-video.mp4";
const heroImage = "/imagenes/hero-main.jpg";
const stepsVideo = "/videos/steps-video.mp4";
const illustrationWebBuild = "/imagenes/illustration-web-build.png";
const testimonialsBg = "/imagenes/testimonials-bg.jpg";

const features = [
  {
    icon: Zap,
    title: "Tu web lista en días",
    description: "Sin esperar semanas o meses. Diseñamos y publicamos tu página rápidamente para que empieces a vender.",
  },
  {
    icon: Shield,
    title: "Todo incluido",
    description: "Dominio, diseño y soporte. No te preocupes por términos técnicos, nosotros nos encargamos de todo.",
  },
  {
    icon: Headphones,
    title: "Soporte en español",
    description: "Equipo local que entiende tus necesidades. Te acompañamos paso a paso, sin complicaciones.",
  },
  {
    icon: Globe,
    title: "Tu negocio en internet",
    description: "Presencia profesional online para que tus clientes te encuentren fácilmente desde cualquier dispositivo.",
  },
  {
    icon: Palette,
    title: "Diseño profesional",
    description: "Páginas modernas y atractivas que generan confianza en tus clientes y reflejan la calidad de tu negocio.",
  },
  {
    icon: Clock,
    title: "Atención personalizada",
    description: "No eres un número más. Te escuchamos y creamos la web perfecta para tu tipo de negocio.",
  },
];

const plans = [
  {
    name: "Plan Landing",
    price: 390,
    originalPrice: 560,
    discount: 30,
    description: "Perfecto para empezar con una página sencilla y efectiva.",
    detalle: "Pago único por desarrollo. Se renueva por S/. 135/anual",
    freeHosting: "Hosting gratis por 1 año",
    features: [
      "Una sola página enfocada a ventas",
      "Diseño profesional y moderno",
      "Optimizada para celulares",
      "Formulario de contacto",
      "Certificado de seguridad (HTTPS)",
      "Entrega en 48 Horas!",
    ],
  },
  {
    name: "Plan Web Institucional",
    price: 690,
    originalPrice: 990,
    discount: 30,
    description: "Todo lo que necesitas para una presencia web completa.",
    detalle: "Pago único por desarrollo. Se renueva por S/. 165/anual",
    freeHosting: "Hosting gratis por 1 año",
    features: [
      "Web con hasta 5 páginas internas",
      "Diseño premium exclusivo",
      "Galería de fotos y videos",
      "Integración con WhatsApp",
      "Mapa de ubicación",
      "Certificado de seguridad (HTTPS)",
      "Optimizado para Google",
      "Soporte prioritario por 3 meses",
      "Entrega de 5 a 7 días hábiles!",
    ],
    isPopular: true,
  },
  {
    name: "Plan IA",
    price: 25,
    originalPrice: 33,
    discount: 24,
    description: "Desarrolla tu web con inteligencia artificial y publícala en minutos.",
    detalle: "Pago mensual, incluye hosting",
    freeHosting: "",
    features: [
      "Generación automática con IA",
      "Publicación instantánea",
      "Personalización inteligente",
      "Actualizaciones automáticas",
      "Integración con herramientas IA",
    ],
    isDisabled: true,
    comingSoon: true,
  },
];

const testimonials = [
  {
    name: "María García",
    business: "Pastelería Dulce María - Lima",
    quote: "No sabía nada de páginas web y tenía miedo de que fuera muy difícil. PLIA me hizo todo fácil, ahora mis clientes me encuentran en Google y mis pedidos aumentaron.",
  },
  {
    name: "Carlos Mendoza",
    business: "Taller Mecánico El Rayo - Arequipa",
    quote: "Pensé que tener una web era solo para empresas grandes. Con PLIA tuve mi página en menos de una semana y el precio fue muy accesible.",
  },
  {
    name: "Ana Lucía Torres",
    business: "Consultorio Dental Sonrisa - Trujillo",
    quote: "El equipo de PLIA entendió exactamente lo que necesitaba. Mi web se ve muy profesional y mis pacientes pueden agendar citas fácilmente.",
  },
  {
    name: "Roberto Sánchez",
    business: "Restaurante El Sabor Criollo - Cusco",
    quote: "Increíble servicio. En una semana tenía mi página lista con menú, fotos y reservas online. Mis ventas crecieron un 40%.",
  },
  {
    name: "Patricia Flores",
    business: "Boutique Moda Perú - Piura",
    quote: "Dudaba en invertir en una web, pero PLIA me convenció con su precio justo. Ahora vendo a todo el Perú gracias a mi tienda online.",
  },
  {
    name: "Luis Vargas",
    business: "Ferretería Don Luis - Chiclayo",
    quote: "El soporte es excelente. Siempre responden rápido y me ayudan con cualquier duda. Mi negocio ahora es más visible.",
  },
  {
    name: "Carmen Quispe",
    business: "Spa Relax & Belleza - Ica",
    quote: "La mejor inversión que hice para mi spa. Las citas online me ahorraron mucho tiempo y mis clientas están encantadas.",
  },
  {
    name: "Jorge Ramírez",
    business: "Inmobiliaria Horizonte - Huancayo",
    quote: "Necesitaba mostrar mis propiedades de forma profesional. PLIA creó una web perfecta para mi negocio inmobiliario.",
  },
];

const steps = [
  {
    number: 1,
    title: "Cuéntanos sobre tu negocio",
    description: "Ingresas a PLIA, nos cuentas sobre tu negocio y qué necesitas llenando un sencillo formulario.",
  },
  {
    number: 2,
    title: "Diseñamos tu web",
    description: "Nuestro equipo crea tu página con toda la información que nos diste. Te mostramos el avance para tu aprobación.",
  },
  {
    number: 3,
    title: "¡Tu web está lista!",
    description: "Publicamos tu página y la dejamos lista para que la vea el mundo. Ya puedes compartirla con tus clientes.",
  },
];


export default function Home() {
  useSmoothScroll();
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.6]);
  /*const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);*/
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  return (
    <>
    
      {/* Hero Section with Video Background - Left Aligned */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <VideoBackground
            src={heroVideo}
            poster={heroImage}
            overlayOpacity={0.6}
          />
        </motion.div>
        
        <motion.div
          className="section-container w-full grid grid-cols-3 max-w-7xl z-10 pt-24 pb-20"
          style={{ y: heroY }}
        >
          <div className="col-span-2 items-center items-center">
            {/* Left Content */}
            <div className="text-left">
              {/* Badge */}
              <motion.span
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block text-sm font-medium px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 mb-8"
              >
                🇵🇪 Hecho para emprendedores peruanos
              </motion.span>
              
              {/* Main Title with Split Text Animation */}
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                <SplitText
                  text="Tu web lista,"
                  delay={0.4}
                  staggerDelay={0.04}
                />
                <br />
                <span className="text-cta">
                  <SplitText
                    text="sin complicaciones"
                    delay={0.8}
                    staggerDelay={0.04}
                  />
                </span>
              </h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-xl"
              >
                Nosotros nos encargamos de todo: dominio, diseño y publicación. 
                Tú solo preocúpate de atender a tus clientes.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-10"
              >
                <MagneticButton>
                  <Button variant="cta" size="xl" asChild className="group">
                    <Link href="/planes">
                      Ver Planes desde S/ 390
                      <motion.span
                        className="inline-block ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </Link>
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button variant="outline" size="xl" asChild className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                    <Link href="/como-funciona">¿Cómo funciona?</Link>
                  </Button>
                </MagneticButton>
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="flex flex-wrap gap-6 text-sm text-white/70"
              >
                {[
                  "Sin conocimientos técnicos",
                  "Lista en días",
                  "Soporte incluido",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8 + index * 0.1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-cta" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Side - Empty for visual balance with video background */}
            <div className="hidden lg:block" />
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-8 z-10">
          <ScrollIndicator />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-secondary/50 border-y border-border relative overflow-hidden">
        <ParallaxSection speed={0.3}>
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-muted-foreground"
            >
              {[
                { value: "500+", label: "Webs creadas" },
                { value: "98%", label: "Clientes satisfechos" },
                { value: "5 días", label: "Tiempo promedio" },
                { value: "24/7", label: "Soporte disponible" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <motion.p
                    className="text-3xl md:text-4xl font-bold text-foreground"
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </ParallaxSection>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60, rotateY: -15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{ perspective: 1000 }}
            >
              <img
                src={illustrationWebBuild}
                alt="Ilustración de creación de páginas web"
                className="w-full max-w-lg mx-auto"
              />
            </motion.div>
            
            <div>
              <SectionHeader
                badge="El problema"
                title="¿Crear una web te parece complicado?"
                description="Sabemos que pensar en dominios, hosting, diseño y todo eso puede ser abrumador. No tienes tiempo para aprender cosas técnicas cuando lo que quieres es hacer crecer tu negocio."
                centered={false}
              />
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-8"
              >
                <motion.div
                  className="p-6 rounded-2xl bg-cta/5 border border-cta/20"
                  whileHover={{ scale: 1.02, borderColor: "rgba(191, 255, 0, 0.4)" }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Con PLIA es diferente ✨
                  </p>
                  <p className="text-muted-foreground">
                    Tú nos cuentas qué hace tu negocio, nosotros creamos tu web profesional. 
                    Sin términos raros, sin complicaciones. Así de simple.
                  </p>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-6"
              >
                <MagneticButton>
                  <Button variant="cta" size="lg" asChild>
                    <Link href="/como-funciona">
                      Descubre cómo funciona
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </MagneticButton>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Without Videos */}
      <section className="py-20 md:py-28 bg-secondary/30 relative overflow-hidden">
        <div className="section-container">
          <SectionHeader
            badge="¿Por qué PLIA?"
            title="Todo lo que necesitas, sin dolores de cabeza"
            description="Nos encargamos de cada detalle para que tu única preocupación sea atender a tus clientes."
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 md:py-28">
        <div className="section-container">
          <SectionHeader
            badge="Simple y rápido"
            title="Tu web en 3 pasos"
            description="No necesitas saber nada de tecnología. Nosotros hacemos todo el trabajo pesado."
          />
          
          <div className="mt-16 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-start">

            <div className="hidden lg:block space-y-0">
              {steps.map((step, index) => (
                <div key={step.number} className="min-h-[70vh] lg:min-h-screen flex items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.6, once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="w-full"
                  >
                    <StepCard
                      number={step.number}
                      title={step.title}
                      description={step.description}
                      delay={0}
                    />
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="block md:hidden space-y-0">
              {steps.map((step, index) => (
                <div key={step.number} className="!mb-6 flex items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.6, once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="w-full"
                  >
                    <StepCard
                      number={step.number}
                      title={step.title}
                      description={step.description}
                      delay={0}
                    />
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-foreground/5 aspect-[4/5]">
                <VideoBackground
                  src={stepsVideo}
                  poster={heroImage}
                  overlayOpacity={0.25}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-sm uppercase tracking-wide text-white/70">Tu web en marcha</p>
                  <p className="text-xl font-semibold">Acompañamos cada paso</p>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mt-12"
          >
            <MagneticButton>
              <Button variant="cta" size="lg" asChild>
                <Link href="/como-funciona">
                  Ver más detalles
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="section-container">
          <SectionHeader
            badge="Planes claros"
            title="Elige el plan perfecto para tu negocio"
            description="Precios justos y transparentes. Pago único, sin sorpresas ni cargos ocultos."
          />
          
          <div className="grid md:grid-cols-3 gap-8 mx-auto mt-16">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                originalPrice={plan.originalPrice}
                discount={plan.discount}
                description={plan.description}
                detalle={plan.detalle}
                features={plan.features}
                freeHosting={plan.freeHosting}
                isPopular={plan.isPopular}
                isDisabled={plan.isDisabled}
                comingSoon={plan.comingSoon}
                delay={index * 0.15}
              />
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              ¿Tienes dudas sobre qué plan elegir?{" "}
              <Link href="/contacto" className="text-foreground font-medium hover:underline">
                Escríbenos y te ayudamos
              </Link>
            </p>
          </motion.div>
        </div>
      </section>


      {/* Logos Section */}
      <section className="py-20 md:py-28">
        <div className="full">
          <SectionHeader
            badge="Stack Profesional"
            title="Trabajamos con la mejor tecnología"
            description="Usamos herramientas modernas desde el desarrollo hasta el hosting, para que tu web funcione rápido, segura y sin complicaciones."
          />
          <LogosGrid />
        </div>
      </section>


      {/* Testimonials Section with Glassmorphism Carousel */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${testimonialsBg})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-foreground/80" />
        
        <div className="relative z-10">
          <div className="section-container mb-12">
            <SectionHeader
              badge="Clientes felices"
              title="Emprendedores como tú ya confían en nosotros"
              description="Más de 500 negocios peruanos ya tienen su web con PLIA."
              light
            />
          </div>
          
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-foreground text-primary-foreground relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-cta/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 bg-warm/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="section-container text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            Empieza hoy, sin conocimientos técnicos
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto"
          >
            Tu negocio merece una presencia profesional en internet. 
            Nosotros lo hacemos posible.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticButton>
              <Button variant="cta" size="xl" asChild>
                <Link href="/planes">
                  Ver Planes
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button variant="white" size="xl" asChild>
                <Link href="/contacto">Hablar con un asesor</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>
      </section>
    
    </>
  );
}





