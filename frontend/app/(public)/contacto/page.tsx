'use client'

import { useState } from 'react'
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mail, Phone, MapPin, Clock, Send } from "lucide-react";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    business: "",
    message: "",
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
        throw new Error(data?.message || "No se pudo enviar el mensaje.");
      }

      toast({
        title: "??Mensaje enviado!",
        description: "Nos pondremos en contacto contigo muy pronto.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        business: "",
        message: "",
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
              <div className="bg-white rounded-2xl border border-border shadow-card p-8">
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp / Teléfono *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Ej: 999 999 999"
                        value={formData.phone}
                        onChange={handleChange}
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
                      required
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
