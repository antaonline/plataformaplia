import React from "react";
import { motion } from "framer-motion";

const BentoGrid = () => {
  const styles = [
    { name: "Hip-Hop", desc: "Danza vibrante que combina estilo y energía." },
    { name: "Breakdance", desc: "Movimientos acrobáticos y estilo libre." },
    // Más estilos...
  ];

  return (
    <section className="py-32">
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {styles.map((style, index) => (
          <motion.div key={index} className="bg-white text-black p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}>
            <h3 className="text-4xl font-display text-purple-900">{style.name}</h3>
            <p className="mt-4 text-lg">{style.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default BentoGrid;