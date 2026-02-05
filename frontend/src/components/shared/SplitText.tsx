import { motion, Variants } from "framer-motion";
import { useMemo } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  type?: "chars" | "words";
  staggerDelay?: number;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { delay: number; staggerDelay: number }) => ({
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delay,
    },
  }),
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

export const SplitText = ({
  text,
  className = "",
  delay = 0,
  type = "words",
  staggerDelay = 0.05,
}: SplitTextProps) => {
  const items = useMemo(() => {
    if (type === "chars") {
      return text.split("");
    }
    return text.split(" ");
  }, [text, type]);

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      style={{ perspective: 1000 }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={{ delay, staggerDelay }}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          className="inline-block origin-bottom"
          style={{ transformStyle: "preserve-3d" }}
          variants={itemVariants}
        >
          {item}
          {type === "words" && index < items.length - 1 && (
            <span>&nbsp;</span>
          )}
        </motion.span>
      ))}
    </motion.span>
  );
};
