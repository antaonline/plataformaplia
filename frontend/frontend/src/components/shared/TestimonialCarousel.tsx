import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface Testimonial {
  name: string;
  business: string;
  quote: string;
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const GlassTestimonialCard = ({ name, business, quote, rating = 5 }: Testimonial) => (
  <div className="flex-shrink-0 w-[340px] md:w-[400px] p-6 rounded-2xl backdrop-blur-[40px] bg-white/10 border border-white/20 shadow-xl">
    <div className="flex gap-1 mb-4">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-cta text-cta" />
      ))}
    </div>
    <p className="text-white text-base leading-relaxed mb-6">
      "{quote}"
    </p>
    <div>
      <p className="font-semibold text-white">{name}</p>
      <p className="text-sm text-white/70">{business}</p>
    </div>
  </div>
);

export const TestimonialCarousel = ({ testimonials }: TestimonialCarouselProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div 
        className="flex gap-6"
        animate={{
          x: isPaused ? undefined : [0, -((340 + 24) * testimonials.length)],
        }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <GlassTestimonialCard
            key={`${testimonial.name}-${index}`}
            {...testimonial}
          />
        ))}
      </motion.div>
      
      {/* Gradient fades on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-foreground/80 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-foreground/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};
