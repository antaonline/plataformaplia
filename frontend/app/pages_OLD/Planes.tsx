import { Layout } from "@/components/layout/Layout";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PlanCard } from "@/components/shared/PlanCard";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FAQItem } from "@/components/shared/FAQItem";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Plan Landing",
    price: 390,
    originalPrice: 560,
    discount: 30,
    description: "Perfecto para empezar con una página sencilla y efectiva que presente tu negocio.",
    freeHosting: "Hosting gratis por 1 año",
    features: [
      "Página de una sola sección",
      "Diseño profesional y moderno",
      "Optimizada para celulares y tablets",
      "Formulario de contacto funcional",
      "Certificado de seguridad (HTTPS)",
      "Entrega en 5 días hábiles",
      "1 revisión de diseño incluida",
    ],
  },
  {
    name: "Plan Web Institucional",
    price: 690,
    originalPrice: 990,
    discount: 30,
    description: "Todo lo que necesitas para una presencia web profesional y completa.",
    freeHosting: "Hosting gratis por 1 año",
    features: [
      "Hasta 5 páginas personalizadas",
      "Diseño premium exclusivo para ti",
      "Galería de fotos y videos",
      "Integración con WhatsApp directo",
      "Mapa de Google con tu ubicación",
      "Certificado de seguridad (HTTPS)",
      "Optimizado para aparecer en Google",
      "Soporte prioritario por 3 meses",
      "3 revisiones de diseño incluidas",
    ],
    isPopular: true,
  },
];

const comparison = [
  { feature: "Páginas incluidas", landing: "1", institucional: "Hasta 5" },
  { feature: "Diseño personalizado", landing: "✓", institucional: "✓ Premium" },
  { feature: "Dominio .com (1 año)", landing: "✓", institucional: "✓" },
  { feature: "Certificado HTTPS", landing: "✓", institucional: "✓" },
  { feature: "Optimizado para móviles", landing: "✓", institucional: "✓" },
  { feature: "Formulario de contacto", landing: "✓", institucional: "✓" },
  { feature: "Integración WhatsApp", landing: "—", institucional: "✓" },
  { feature: "Mapa de ubicación", landing: "—", institucional: "✓" },
  { feature: "Galería de fotos/videos", landing: "—", institucional: "✓" },
  { feature: "Optimización para Google", landing: "Básica", institucional: "Avanzada" },
  { feature: "Revisiones de diseño", landing: "1", institucional: "3" },
  { feature: "Soporte post-entrega", landing: "1 mes", institucional: "3 meses" },
  { feature: "Tiempo de entrega", landing: "5 días", institucional: "7-10 días" },
];

const faqs = [
  {
    question: "¿Qué pasa después del año con el dominio?",
    answer: "El primer año está incluido en tu plan. Después, el costo de renovación es de S/ 80 anuales aproximadamente. Te avisamos con anticipación para que decidas si quieres renovar.",
  },
  {
    question: "¿Puedo cambiar de plan después?",
    answer: "¡Claro que sí! Si empiezas con el Plan Landing y luego necesitas más páginas, puedes actualizar al Plan Institucional pagando solo la diferencia.",
  },
  {
    question: "¿El precio incluye todo o hay costos adicionales?",
    answer: "El precio que ves es el precio final. Incluye diseño, dominio por 1 año, certificado de seguridad y soporte. No hay cargos ocultos ni sorpresas.",
  },
  {
    question: "¿Necesito saber algo técnico para tener mi web?",
    answer: "Para nada. Nosotros nos encargamos de todo lo técnico. Tú solo necesitas decirnos qué hace tu negocio y darnos el contenido (textos, fotos, etc.).",
  },
  {
    question: "¿Qué formas de pago aceptan?",
    answer: "Aceptamos transferencias bancarias, Yape, Plin y tarjetas de crédito/débito. Puedes pagar el 50% al inicio y 50% al entregar tu web.",
  },
  {
    question: "¿Puedo hacer cambios a mi web después de publicada?",
    answer: "Sí. Durante el período de soporte incluido puedes solicitar cambios menores sin costo. Para cambios mayores o después del período de soporte, te cotizamos según lo que necesites.",
  },
];

const Planes = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-hero-gradient">
        <div className="section-container">
          <SectionHeader
            badge="Planes y precios"
            title="Precios claros, sin sorpresas"
            description="Elige el plan que mejor se adapte a las necesidades de tu negocio. Todos incluyen dominio, diseño profesional y soporte."
          />
        </div>
      </section>

      {/* Plans Cards */}
      <section className="py-16 md:py-20 -mt-8">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                originalPrice={plan.originalPrice}
                discount={plan.discount}
                description={plan.description}
                features={plan.features}
                freeHosting={plan.freeHosting}
                isPopular={plan.isPopular}
                delay={index * 0.15}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="section-container">
          <SectionHeader
            badge="Comparativa"
            title="¿Qué incluye cada plan?"
            description="Compara los planes lado a lado para elegir el que mejor se adapte a ti."
          />

          <AnimatedSection delay={0.2} className="mt-12">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold text-foreground">Característica</th>
                      <th className="text-center p-4 font-semibold text-foreground">Landing<br /><span className="font-normal text-muted-foreground text-sm">S/ 390</span></th>
                      <th className="text-center p-4 font-semibold text-foreground bg-cta/5">Institucional<br /><span className="font-normal text-muted-foreground text-sm">S/ 690</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="p-4 text-foreground">{row.feature}</td>
                        <td className="p-4 text-center text-muted-foreground">
                          {row.landing === "✓" ? (
                            <Check className="w-5 h-5 text-success mx-auto" />
                          ) : row.landing === "—" ? (
                            <span className="text-muted-foreground/50">—</span>
                          ) : (
                            row.landing
                          )}
                        </td>
                        <td className="p-4 text-center bg-cta/5">
                          {row.institucional === "✓" || row.institucional === "✓ Premium" ? (
                            <div className="flex items-center justify-center gap-1">
                              <Check className="w-5 h-5 text-success" />
                              {row.institucional === "✓ Premium" && (
                                <span className="text-xs text-foreground font-medium">Premium</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-foreground font-medium">{row.institucional}</span>
                          )}
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

      {/* What's Included */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <SectionHeader
            badge="Todo incluido"
            title="Sin letras pequeñas, sin sorpresas"
            description="Lo que ves es lo que pagas. Así de simple."
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            <AnimatedSection delay={0.1}>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-cta/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌐</span>
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">Dominio incluido</h3>
                <p className="text-muted-foreground text-sm">
                  Tu dirección web personalizada (tunegocio.com) incluida por 1 año completo.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-cta/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">Seguridad HTTPS</h3>
                <p className="text-muted-foreground text-sm">
                  Certificado de seguridad incluido para que tu web muestre el candadito verde.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-cta/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">Soporte real</h3>
                <p className="text-muted-foreground text-sm">
                  Un equipo local que te ayuda en español, sin chatbots ni respuestas automáticas.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-secondary/30" id="faq">
        <div className="section-container">
          <SectionHeader
            badge="Preguntas frecuentes"
            title="¿Tienes dudas? Te respondemos"
            description="Las preguntas más comunes sobre nuestros planes y servicios."
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
              ¿Listo para tener tu web profesional?
            </h2>
          </AnimatedSection>
          
          <AnimatedSection delay={0.1}>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Escríbenos y te ayudamos a elegir el plan perfecto para tu negocio.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta" size="lg" asChild>
                <Link to="/contacto">
                  Hablar con un asesor
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="white" size="lg" asChild>
                <a href="https://wa.me/51999999999" target="_blank" rel="noopener noreferrer">
                  WhatsApp directo
                </a>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Planes;
