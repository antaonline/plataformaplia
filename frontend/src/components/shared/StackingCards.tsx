'use client';
import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Globe, Palette, Headphones, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const cards = [
  {
    icon: Zap,
    title: "Velocidad",
    description: "Tu web lista en tiempo récord",
    color: "from-cta/90 to-cta/35",
    borderColor: "border-cta/30",
  },
  {
    icon: Palette,
    title: "Diseño Premium",
    description: "Profesional y moderno",
    color: "from-warm/90 to-warm/35",
    borderColor: "border-warm/30",
  },
  {
    icon: Globe,
    title: "Hosting Propio",
    description: "Hosting, dominio, infraestructura propia",
    color: "from-orange/90 to-orange/35",
    borderColor: "border-orange/30",
  },
  {
    icon: Headphones,
    title: "Soporte Directo",
    description: "Siempre disponibles para ti",
    color: "from-success/90 to-success/35",
    borderColor: "border-success/30",
  },
];

export const StackingCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const totalScroll = rect.height - viewportHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(totalScroll, 1));
      const progress = totalScroll > 0 ? scrolled / totalScroll : 0;
      scrollYProgress.set(progress);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollYProgress]);

  /* ───────────────── TEXT (primero) ───────────────── */

  const textY = useTransform(scrollYProgress, [0, 0.25], [-200, 0]);
  const textScale = useTransform(scrollYProgress, [0.35, 0.5], [1, 0.35]);
  const textOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.15, 0.45, 0.55],
    [0, 1, 1, 0]
  );

  /* ───────────────── CARDS (después) ───────────────── */

  const cardStart = 0.45;
  const cardEnd = 0.95;

  /*const cardOpacity = useTransform(scrollYProgress, [cardStart, cardStart + 0.08], [0, 1]);*/
  const cardOpacity = useTransform(scrollYProgress, [cardStart, cardStart + 0.2], [0, 1]);

  const xOffsets = [
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [-600, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [600, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [-600, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [600, 0, 0, 0]),
  ];

  const yOffsets = [
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [-400, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [-400, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [400, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [400, 0, 0, 0]),
  ];

  const rotations = [
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [-25, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [25, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [20, 0, 0, 0]),
    useTransform(scrollYProgress, [cardStart, 0.65, 0.85, cardEnd], [-20, 0, 0, 0]),
  ];

  /* ───────────────── LOGO (final) ───────────────── */

 
  const logoOpacity = useTransform(scrollYProgress, [0.45, 0.65, 0.85, 0.95], [0, 1, 1, 0] );
  const logoScale = useTransform(scrollYProgress, [0.45, 0.65, 0.85, 0.95], [0.5, 1, 1, 0.5] );

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh] "
    >
      {/* STICKY REAL */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden snap-center">
        
        {/* TEXTO */}
        <motion.h2
          className="text-foreground absolute z-0 text-center font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-tight pointer-events-none whitespace-pre-line"
          style={{ y: textY, scale: textScale, opacity: textOpacity }}
        >
          {"Todo en un\nsolo lugar"}
        </motion.h2>

        {/* CARDS */}
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            className={`absolute w-40 md:w-52 p-6 rounded-2xl border bg-gradient-to-br ${card.color} ${card.borderColor} backdrop-blur-sm`}
            style={{
              x: xOffsets[index],
              y: yOffsets[index],
              rotate: rotations[index],
              opacity: cardOpacity,
              zIndex: index === 1 || index === 2 ? 2 : 1,
            }}
          >
            <card.icon className="w-8 h-8 text-primary-foreground mb-3" />
            <h3 className="text-sm md:text-base font-bold text-primary-foreground mb-1">
              {card.title}
            </h3>
            <p className="text-xs text-primary-foreground/60">
              {card.description}
            </p>
          </motion.div>
        ))}

        {/* LOGO */}
        <motion.div
          className="absolute z-10 flex flex-col items-center pointer-events-none"
          style={{ opacity: logoOpacity, scale: logoScale }}
        >
          <Link href="/" className="flex items-center">
              <Image
                src="/icon-full-black-plia.svg"
                alt="PLIA"
                width={120}
                height={120}
                priority
                className="h-[15rem] w-auto"
              />
          </Link>
        </motion.div>

      </div>
    </section>

  );
};
