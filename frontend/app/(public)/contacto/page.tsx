'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, MessageCircle, Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
const apiBase = apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "La forma más rápida de contactarnos",
    value: "+51 958 617185",
    href: "https://wa.me/51958617185?text=Hola%20%F0%9F%91%8B%20quiero%20empezar%20con%20PLIA%20y%20me%20gustar%C3%ADa%20que%20me%20ayuden%20a%20activar%20mi%20p%C3%A1gina%20lo%20antes%20posible.%20%C2%BFC%C3%B3mo%20comenzamos%3F",
    cta: "Escribir por WhatsApp",
  },
  {
    icon: Mail,
    title: "Correo electrónico",
    description: "Para consultas detalladas",
    value: "hola@plia.pe",
    href: "mailto:hola@plia.pe",
    cta: "Enviar correo",
  },
  {
    icon: Phone,
    title: "Teléfono",
    description: "Llámanos en horario de oficina",
    value: "-",
    href: "tel:-",
    cta: "Llamar ahora",
  },
];

const Contacto = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cuando el envío es exitoso, mostramos la pantalla de confirmación
  // animada en lugar del formulario. Si el usuario clickea "Enviar otro
  // mensaje", volvemos al form vacío.
  const [isSent, setIsSent] = useState(false);
  const [sentClientName, setSentClientName] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    business: "",
    message: "",
    // Honeypot anti-spam: campo invisible. Si un bot lo llena, el
    // backend lo detecta y descarta el mensaje. Humanos no lo ven.
    website: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        // Backend ValidationPipe devuelve message como ARRAY de strings.
        // Lo formateamos para que el toast muestre algo legible.
        const raw = data?.message;
        const errMsg = Array.isArray(raw)
          ? raw.join(' · ')
          : typeof raw === 'string'
            ? raw
            : "No se pudo enviar el mensaje.";
        throw new Error(errMsg);
      }

      // Guardamos el nombre antes de limpiar el form para personalizar el
      // mensaje de éxito.
      setSentClientName(formData.name.split(' ')[0] || '');
      setIsSent(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        business: "",
        message: "",
        website: "",
      });
    } catch (err: any) {
      toast({
        title: "No se pudo enviar",
        description: err.message ?? "Intenta nuevamente en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    {/*<Layout>*/}

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-hero-gradient">
        <div className="section-container">
          <SectionHeader
            badge="Contacto"
            title="¿Tienes dudas? Escríbenos"
            description="Estamos aquí para ayudarte. Cuéntanos sobre tu negocio y te responderemos lo antes posible."
          />
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 -mt-8">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <AnimatedSection key={method.title} delay={index * 0.1}>
                <a
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block p-6 rounded-2xl bg-white border border-border shadow-card hover-lift transition-all h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-cta/10 flex items-center justify-center mb-4">
                    <method.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                  <p className="font-medium text-foreground">{method.value}</p>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <AnimatedSection>
              <div className="bg-white rounded-2xl border border-border shadow-card p-8 relative overflow-hidden min-h-[560px]">
                <AnimatePresence mode="wait">
                {isSent ? (
                  // ─── Pantalla de éxito animada ───
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                  >
                    {/* Halo de fondo expansivo */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-72 h-72 rounded-full bg-cta/10 blur-3xl" />
                    </motion.div>

                    {/* Check con bounce */}
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 220,
                        damping: 14,
                        delay: 0.15,
                      }}
                      className="relative w-24 h-24 rounded-full bg-cta flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(191,255,0,0.4)]"
                    >
                      <CheckCircle2 className="w-12 h-12 text-foreground" strokeWidth={2.5} />
                      {/* Ondas expansivas decorativas */}
                      {[0, 1].map((i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{
                            duration: 1.8,
                            delay: 0.4 + i * 0.4,
                            repeat: Infinity,
                            repeatDelay: 0.6,
                            ease: 'easeOut',
                          }}
                          className="absolute inset-0 rounded-full border-2 border-cta"
                        />
                      ))}
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.5 }}
                      className="relative text-2xl md:text-3xl font-bold text-foreground mb-3"
                    >
                      {sentClientName
                        ? `¡Gracias, ${sentClientName}!`
                        : '¡Mensaje recibido!'}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45, duration: 0.5 }}
                      className="relative text-muted-foreground mb-2 max-w-sm"
                    >
                      Tu mensaje llegó correctamente. Nuestro equipo lo
                      revisará y te contactaremos en{' '}
                      <span className="font-semibold text-foreground">menos de 24 horas</span>.
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55, duration: 0.5 }}
                      className="relative text-sm text-muted-foreground/80 mb-8"
                    >
                      💡 Tip: si necesitas respuesta más rápida, escríbenos
                      por <span className="font-semibold">WhatsApp</span>.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65, duration: 0.5 }}
                      className="relative flex flex-col sm:flex-row gap-3 w-full max-w-sm"
                    >
                      <Button
                        variant="cta"
                        asChild
                        className="flex-1"
                      >
                        <a
                          href="https://wa.me/51958617185?text=Hola%20%F0%9F%91%8B%20acabo%20de%20enviar%20un%20mensaje%20por%20la%20web."
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsSent(false)}
                        className="flex-1"
                      >
                        Enviar otro mensaje
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  // ─── Formulario ───
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                <h2 className="text-2xl font-bold text-foreground mb-2">Envíanos un mensaje</h2>
                <p className="text-muted-foreground mb-6">
                  Completa el formulario y te responderemos en menos de 24 horas.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tu nombre *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ej: María García"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={120}
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp / Teléfono *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Ej: 999 999 999"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={40}
                        pattern="[\d\s+()\-]{6,40}"
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Ej: maria@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={254}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business">Nombre de tu negocio</Label>
                    <Input
                      id="business"
                      name="business"
                      placeholder="Ej: Pastelería Dulce María"
                      value={formData.business}
                      onChange={handleChange}
                      maxLength={120}
                      autoComplete="organization"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Cuéntanos sobre tu proyecto *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="¿Qué tipo de web necesitas? ¿Qué quieres lograr con ella?"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      maxLength={2000}
                      required
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message.length}/2000
                    </p>
                  </div>

                  {/* Honeypot anti-spam: invisible para humanos, visible
                      para bots que llenan automáticamente todos los campos.
                      Si llega con contenido, el backend descarta el envío. */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      top: '-9999px',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                    }}
                  >
                    <label htmlFor="website">No llenar este campo</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <Button
                    variant="cta" 
                    size="lg" 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        Enviar mensaje
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </AnimatedSection>

            {/* Info */}
            <div className="space-y-8">
              <AnimatedSection delay={0.1}>
                <div className="bg-cta/5 border border-cta/20 rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Horario de atención
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong className="text-foreground">Lunes a Viernes:</strong> 9:00 AM - 6:00 PM</p>
                    <p><strong className="text-foreground">Sábados:</strong> 9:00 AM - 1:00 PM</p>
                    <p><strong className="text-foreground">Domingos:</strong> Cerrado</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    * Los mensajes de WhatsApp fuera de horario serán respondidos al siguiente día hábil.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Ubicación
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Trabajamos de forma remota, pero coordinamos reuniones presenciales en Lima si lo necesitas.
                  </p>
                  <p className="text-sm text-foreground font-medium">
                    📍 Lima, Perú
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="bg-foreground text-primary-foreground rounded-2xl p-6">
                  <h3 className="font-bold mb-3">¿Prefieres WhatsApp?</h3>
                  <p className="text-primary-foreground/70 mb-4">
                    Es la forma más rápida de contactarnos. Te respondemos en minutos durante horario de oficina.
                  </p>
                  <Button variant="cta" asChild className="w-full">
                    <a href="https://wa.me/51958617185?text=Hola%20%F0%9F%91%8B%20quiero%20empezar%20con%20PLIA%20y%20me%20gustar%C3%ADa%20que%20me%20ayuden%20a%20activar%20mi%20p%C3%A1gina%20lo%20antes%20posible.%20%C2%BFC%C3%B3mo%20comenzamos%3F" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4" />
                      Escribir por WhatsApp
                    </a>
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Preguntas rápidas
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
              <AnimatedSection delay={0.1}>
                <div className="bg-white rounded-xl p-5 border border-border">
                  <p className="font-semibold text-foreground mb-2">¿Cuánto cuesta una web?</p>
                  <p className="text-sm text-muted-foreground">
                    Tenemos planes desde S/ 390. El precio depende del tipo de web que necesites.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="bg-white rounded-xl p-5 border border-border">
                  <p className="font-semibold text-foreground mb-2">¿Cuánto tiempo toma?</p>
                  <p className="text-sm text-muted-foreground">
                    Una página landing está lista en 24 horas!. Una web completa en 2 días!.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-white rounded-xl p-5 border border-border">
                  <p className="font-semibold text-foreground mb-2">¿Necesito saber de tecnología?</p>
                  <p className="text-sm text-muted-foreground">
                    Para nada. Nosotros nos encargamos de todo lo técnico.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.25}>
                <div className="bg-white rounded-xl p-5 border border-border">
                  <p className="font-semibold text-foreground mb-2">¿Qué formas de pago aceptan?</p>
                  <p className="text-sm text-muted-foreground">
                    tarjetas de crédito/débito y próximamente yape y plin.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    {/*</Layout>*/}
    </>
  );
};

export default Contacto;
