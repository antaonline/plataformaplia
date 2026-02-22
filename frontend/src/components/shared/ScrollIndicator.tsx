import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  className?: string;
}

export const ScrollIndicator = ({ className = "" }: ScrollIndicatorProps) => {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      onClick={scrollToContent}
      className={`flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
    >
      <span className="text-xs uppercase tracking-widest font-medium">
        Scroll
      </span>
      
      {/* Mouse icon */}
      <motion.div
        className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="w-1 h-2 bg-white rounded-full"
          animate={{ y: [0, 12, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Bouncing chevron */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </motion.button>
  );
};
