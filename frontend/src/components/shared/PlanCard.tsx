import { Check, Gift, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { AnimatedSection } from "./AnimatedSection";

interface PlanCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isFree?: boolean;
  description: string;
  detalle: string;
  features: readonly string[];
  freeHosting?: string;
  isPopular?: boolean;
  isDisabled?: boolean;
  comingSoon?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  pricePrefix?: string;
  priceSuffix?: string;
  paymentLabel?: string;
  delay?: number;
}

export const PlanCard = ({
  name,
  price,
  originalPrice = 0,
  discount = 0,
  isFree = false,
  description,
  detalle,
  features,
  freeHosting,
  isPopular = false,
  isDisabled = false,
  comingSoon = false,
  ctaHref,
  ctaLabel,
  pricePrefix = "S/.",
  priceSuffix = "",
  paymentLabel,
  delay = 0,
}: PlanCardProps) => {
  const resolvedHref =
    ctaHref ??
    (isFree
      ? "/registro"
      : name.toLowerCase().includes("landing")
        ? "/checkout?plan=landing"
        : "/checkout?plan=web");
  const resolvedCtaLabel = ctaLabel ?? (isFree ? "Empieza gratis" : "Elegir este plan");

  return (
    <AnimatedSection delay={delay} direction="up">
      <div
        className={`relative flex h-full flex-col rounded-2xl p-8 transition-all duration-300 ${
          isDisabled
            ? "border border-border/50 bg-muted/50 opacity-70"
            : isPopular
              ? "bg-foreground text-primary-foreground shadow-xl hover-lift"
              : "border border-border bg-white shadow-card hover-lift"
        }`}
      >
        {!isDisabled && discount > 0 && (
          <div className="absolute -top-3 right-6">
            <span className="rounded-full bg-cta px-3 py-1 text-sm font-bold text-cta-foreground">
              -{discount}%
            </span>
          </div>
        )}

        {isPopular && !isDisabled && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="whitespace-nowrap rounded-full bg-cta px-4 py-1.5 text-sm font-bold text-cta-foreground">
              Más popular
            </span>
          </div>
        )}

        {comingSoon && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-2 rounded-full bg-muted-foreground px-4 py-1.5 text-sm font-bold text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              PRÓXIMAMENTE
            </span>
          </div>
        )}

        <div className="mb-6">
          <h3
            className={`mb-2 text-xl font-bold ${
              isPopular && !isDisabled
                ? ""
                : isDisabled
                  ? "text-muted-foreground"
                  : "text-foreground"
            }`}
          >
            {name}
          </h3>
          <p
            className={`text-sm ${
              isPopular && !isDisabled
                ? "text-primary-foreground/70"
                : isDisabled
                  ? "text-muted-foreground/70"
                  : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        </div>

        <div className="mb-4">
          {originalPrice > price && !isDisabled && (
            <div
              className={`text-sm line-through ${
                isPopular ? "text-primary-foreground/50" : "text-muted-foreground"
              }`}
            >
              {pricePrefix} {originalPrice}
            </div>
          )}

          <div className="flex items-end gap-1">
            {!isFree && (
              <span
                className={`text-sm ${
                  isPopular && !isDisabled
                    ? "text-primary-foreground/70"
                    : isDisabled
                      ? "text-muted-foreground/70"
                      : "text-muted-foreground"
                }`}
              >
                {pricePrefix}
              </span>
            )}
            <span
              className={`text-5xl font-bold ${
                isPopular && !isDisabled
                  ? ""
                  : isDisabled
                    ? "text-muted-foreground"
                    : "text-foreground"
              }`}
            >
              {isFree ? "Gratis" : price}
            </span>
            {priceSuffix && (
              <span
                className={`pb-1 text-sm font-medium ${
                  isPopular && !isDisabled
                    ? "text-primary-foreground/70"
                    : isDisabled
                      ? "text-muted-foreground/70"
                      : "text-muted-foreground"
                }`}
              >
                {priceSuffix}
              </span>
            )}
          </div>
          <p
            className={`mt-1 text-sm ${
              isPopular && !isDisabled
                ? "text-primary-foreground/70"
                : isDisabled
                  ? "text-muted-foreground/70"
                  : "text-muted-foreground"
            }`}
          >
            {paymentLabel ?? (isFree ? "Sin tarjeta · 30 días de prueba" : isDisabled ? "Pago único mensual" : "Pago único")}
          </p>
        </div>

        <Button
          variant={isDisabled ? "outline" : isPopular ? "cta" : "dark"}
          size="lg"
          className={`w-full ${isDisabled ? "botoncomprar-home cursor-not-allowed opacity-50" : ""}`}
          disabled={isDisabled}
          asChild={!isDisabled}
        >
          {isDisabled ? (
            <span>Próximamente</span>
          ) : (
            <Link className="botoncomprar-home" href={resolvedHref}>
              {resolvedCtaLabel}
            </Link>
          )}
        </Button>

        <p
          className={`mb-4 text-xs ${
            isPopular && !isDisabled
              ? "text-primary-foreground/70"
              : isDisabled
                ? "text-muted-foreground/70"
                : "text-muted-foreground"
          }`}
        >
          {detalle}
        </p>

        {freeHosting && !isDisabled && (
          <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 ${isPopular ? "bg-cta/20" : "bg-cta/10"}`}>
            <Gift className="h-5 w-5 text-cta" />
            <span className={`text-sm font-medium ${isPopular ? "text-cta" : "text-foreground"}`}>
              {freeHosting}
            </span>
          </div>
        )}

        <ul className="mb-8 flex-1 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                  isDisabled
                    ? "bg-muted-foreground/20"
                    : isPopular
                      ? "bg-cta"
                      : "bg-cta/20"
                }`}
              >
                <Check
                  className={`h-3 w-3 ${
                    isDisabled
                      ? "text-muted-foreground"
                      : isPopular
                        ? "text-cta-foreground"
                        : "text-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-sm ${
                  isPopular && !isDisabled
                    ? "text-primary-foreground/90"
                    : isDisabled
                      ? "text-muted-foreground"
                      : "text-foreground"
                }`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
};
