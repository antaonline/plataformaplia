import React from "react";
import { motion } from "framer-motion";

const Services = () => {
  return (
    <section className="py-32 bg-black text-white">
      <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <h2 className="text-5xl font-display text-gold mb-12">Nuestros Servicios</h2>
        <div className="flex gap-16">
          <div className="flex-1">
            <h3 className="text-3xl font-bold">Clases Personalizadas</h3>
            <p className="mt-4">Ofrecemos clases adaptadas a tus necesidades y nivel.</p>
          </div>
          <div className="flex-1">
            <h3 className="text-3xl font-bold">Eventos y Talleres</h3>
            <p className="mt-4">Participa en eventos exclusivos y talleres periódicos.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Services;