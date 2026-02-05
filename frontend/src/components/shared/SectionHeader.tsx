import { AnimatedSection } from "./AnimatedSection";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
}

export const SectionHeader = ({
  badge,
  title,
  description,
  centered = true,
  light = false,
}: SectionHeaderProps) => {
  return (
    <AnimatedSection className={centered ? "text-center max-w-3xl mx-auto" : "max-w-2xl"}>
      {badge && (
        <span
          className={`inline-block text-sm font-medium px-4 py-1.5 rounded-full mb-4 ${
            light
              ? "bg-primary-foreground/10 text-primary-foreground"
              : "bg-cta/10 text-foreground"
          }`}
        >
          {badge}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight ${
          light ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-lg leading-relaxed ${
            light ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      )}
    </AnimatedSection>
  );
};
