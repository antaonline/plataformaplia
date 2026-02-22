import { Star } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

interface TestimonialCardProps {
  name: string;
  business: string;
  quote: string;
  rating?: number;
  delay?: number;
}

export const TestimonialCard = ({
  name,
  business,
  quote,
  rating = 5,
  delay = 0,
}: TestimonialCardProps) => {
  return (
    <AnimatedSection delay={delay} direction="up">
      <div className="p-6 rounded-2xl bg-white border border-border shadow-card h-full flex flex-col">
        <div className="flex gap-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-cta text-cta" />
          ))}
        </div>
        <p className="text-foreground text-base leading-relaxed mb-6 flex-1">
          "{quote}"
        </p>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{business}</p>
        </div>
      </div>
    </AnimatedSection>
  );
};
