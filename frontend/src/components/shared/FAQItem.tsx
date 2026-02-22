import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

interface FAQItemProps {
  question: string;
  answer: string;
  delay?: number;
}

export const FAQItem = ({ question, answer, delay = 0 }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatedSection delay={delay} direction="up">
      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
        >
          <span className="font-semibold text-foreground pr-4">{question}</span>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-5 pb-5 pt-0">
                <p className="text-muted-foreground leading-relaxed">{answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedSection>
  );
};
