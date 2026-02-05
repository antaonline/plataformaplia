import { AnimatedSection } from "./AnimatedSection";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  delay?: number;
}

export const StepCard = ({ number, title, description, delay = 0 }: StepCardProps) => {
  return (
    <AnimatedSection delay={delay} direction="up">
      <div className="flex gap-5">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-cta text-cta-foreground flex items-center justify-center font-bold text-xl">
            {number}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </AnimatedSection>
  );
};
