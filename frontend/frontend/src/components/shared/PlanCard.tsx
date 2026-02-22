import { Check, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedSection } from "./AnimatedSection";

interface PlanCardProps {
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  description: string;
  detalle: string;
  features: string[];
  freeHosting?: string;
  isPopular?: boolean;
  isDisabled?: boolean;
  comingSoon?: boolean;
  delay?: number;
}

export const PlanCard = ({
  name,
  price,
  originalPrice,
  discount,
  description,
  detalle,
  features,
  freeHosting,
  isPopular = false,
  isDisabled = false,
  comingSoon = false,
  delay = 0,
}: PlanCardProps) => {
  return (
    <AnimatedSection delay={delay} direction="up">
      <div
        className={`relative rounded-2xl p-8 h-full flex flex-col transition-all duration-300 ${
          isDisabled 
            ? "bg-muted/50 border border-border/50 opacity-70"
            : isPopular
              ? "bg-foreground text-primary-foreground shadow-xl hover-lift"
              : "bg-white border border-border shadow-card hover-lift"
        }`}
      >
        {/* Discount badge */}
        {!isDisabled && discount > 0 && (
          <div className="absolute -top-3 right-6">
            <span className="bg-cta text-cta-foreground text-sm font-bold px-3 py-1 rounded-full">
              -{discount}%
            </span>
          </div>
        )}
        
        {/* Popular badge */}
        {isPopular && !isDisabled && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-cta text-cta-foreground text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
              Más popular
            </span>
          </div>
        )}

        {/* Coming Soon badge */}
        {comingSoon && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-muted-foreground text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              PRÓXIMAMENTE
            </span>
          </div>
        )}

        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-2 ${isPopular && !isDisabled ? "" : isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
            {name}
          </h3>
          <p className={`text-sm ${isPopular && !isDisabled ? "text-primary-foreground/70" : isDisabled ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
            {description}
          </p>
        </div>

        <div className="mb-4">
          {/* Original price crossed out */}
          {originalPrice > price && !isDisabled && (
            <div className={`text-sm line-through ${isPopular ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
              S/. {originalPrice}
            </div>
          )}
          
          <div className="flex items-baseline gap-1">
            <span className={`text-sm ${isPopular && !isDisabled ? "text-primary-foreground/70" : isDisabled ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
              S/.
            </span>
            <span className={`text-5xl font-bold ${isPopular && !isDisabled ? "" : isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
              {price}
            </span>
          </div>
          <p className={`text-sm mt-1 ${isPopular && !isDisabled ? "text-primary-foreground/70" : isDisabled ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
            {isDisabled ? (
              "Pago Mensual"
            ) : (
              "Pago único"
            )}
          </p>

        </div>

        <Button
          variant={isDisabled ? "outline" : isPopular ? "cta" : "dark"}
          size="lg"
          className={`w-full ${isDisabled ? "cursor-not-allowed opacity-50 botoncomprar-home" : ""}`}
          disabled={isDisabled}
          asChild={!isDisabled}
        >
          {isDisabled ? (
            <span>Próximamente</span>
          ) : (
            <Link
              className="botoncomprar-home"
              href={name.toLowerCase().includes("landing") ? "/checkout?plan=landing" : "/checkout?plan=web"}
            >
              Elegir este plan
            </Link>
          )}
        </Button>

        <p className={`text-xs mb-4 ${isPopular && !isDisabled ? "text-primary-foreground/70" : isDisabled ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
            {detalle}
        </p>

        {/* Free hosting badge */}
        {freeHosting && !isDisabled && (
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${isPopular ? "bg-cta/20" : "bg-cta/10"}`}>
            <Gift className={`w-5 h-5 ${isPopular ? "text-cta" : "text-cta"}`} />
            <span className={`text-sm font-medium ${isPopular ? "text-cta" : "text-foreground"}`}>
              {freeHosting}
            </span>
          </div>
        )}

        <ul className="space-y-2 mb-8 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isDisabled 
                    ? "bg-muted-foreground/20" 
                    : isPopular 
                      ? "bg-cta" 
                      : "bg-cta/20"
                }`}
              >
                <Check className={`w-3 h-3 ${isDisabled ? "text-muted-foreground" : isPopular ? "text-cta-foreground" : "text-foreground"}`} />
              </div>
              <span className={`text-sm ${isPopular && !isDisabled ? "text-primary-foreground/90" : isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
};
