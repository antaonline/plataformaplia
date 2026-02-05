import { LucideIcon } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <AnimatedSection delay={delay} direction="up">
      <div className="group p-6 rounded-2xl bg-white border border-border shadow-card hover-lift transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-cta/10 flex items-center justify-center mb-5 group-hover:bg-cta/20 transition-colors">
          <Icon className="w-6 h-6 text-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </AnimatedSection>
  );
};
