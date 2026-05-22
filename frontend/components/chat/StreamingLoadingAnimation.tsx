import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface StreamingLoadingAnimationProps {
  isVisible: boolean;
  text?: string;
}

export const StreamingLoadingAnimation: React.FC<StreamingLoadingAnimationProps> = ({ 
  isVisible, 
  text = "Orquestando componentes..." 
}) => {
  const [displayTitle, setDisplayTitle] = useState(text);

  useEffect(() => {
    if (!isVisible) return;
    
    // Scramble effect like Dyad
    const chars = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayTitle(prev => 
        text.split("").map((char, index) => {
          if (index < iteration) return text[index];
          if (char === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible, text]);

  // Spring configurations from Dyad
  const springConfig = {
    type: "spring" as const,
    damping: 20,
    stiffness: 100,
    mass: 0.5
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={springConfig}
          className="flex flex-col items-center justify-center py-10 space-y-8"
        >
          {/* Central Living Orb */}
          <div className="relative w-24 h-24">
            {/* Background Glows */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [0, 120, 240, 360]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Main Orb */}
            <motion.div
              className="absolute inset-0 rounded-[38%] bg-gradient-to-br from-indigo-600 via-violet-500 to-purple-400 shadow-2xl shadow-indigo-500/40 border border-white/30 overflow-hidden"
              animate={{
                borderRadius: ["38%", "50%", "42%", "50%", "38%"],
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.08, 0.95, 1.08, 1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
               {/* Internal Moving Waves/Lights */}
               <motion.div 
                 className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"
                 animate={{
                   y: ["100%", "-100%"],
                   opacity: [0.2, 0.5, 0.2]
                 }}
                 transition={{
                   duration: 2.5,
                   repeat: Infinity,
                   ease: "linear"
                 }}
               />
               
               <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="h-9 w-9 text-white drop-shadow-md" />
               </div>
            </motion.div>
          </div>

          {/* Text Feedback with Scramble */}
          <div className="text-center space-y-4">
            <motion.h3 
              className="text-xl font-bold text-slate-800 tracking-tight font-mono min-h-[1.75rem]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {displayTitle}
            </motion.h3>
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-indigo-600 shadow-sm"
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.3, 1, 0.3],
                    y: [0, -4, 0]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
