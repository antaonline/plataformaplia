import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Activity, Smile } from 'lucide-react';

const services = [
  {
    title: 'Implantes Dentales',
    desc: 'Recupera la funcionalidad y estética de tu boca con materiales biocompatibles de alta gama.',
    icon: ShieldCheck
  },
  {
    title: 'Ortodoncia Invisible',
    desc: 'Alinea tu sonrisa sin brackets metálicos, usando tecnología 3D personalizada.',
    icon: Zap
  },
  {
    title: 'Blanqueamiento Láser',
    desc: 'Resultados inmediatos en una sola sesión con tecnología de luz fría protectora.',
    icon: Smile
  },
  {
    title: 'Odontología Integral',
    desc: 'Desde limpiezas profundas hasta restauraciones complejas para toda la familia.',
    icon: Activity
  }
];

export const Services = () => {
  return (
    <section id="servicios" className="py-20 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-[#d4ff00] font-mono text-sm uppercase tracking-[0.3em] mb-4">Nuestra Experiencia</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white">Servicios de Especialidad</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 bg-[#0A0A0A] border border-white/5 rounded-3xl hover:border-[#d4ff00]/50 transition-all group"
            >
              <div className="w-12 h-12 bg-[#d4ff00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#d4ff00] transition-colors">
                <s.icon className="text-[#d4ff00] group-hover:text-black w-6 h-6" />
              </div>
              <h4 className="text-white text-xl font-bold mb-4">{s.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};