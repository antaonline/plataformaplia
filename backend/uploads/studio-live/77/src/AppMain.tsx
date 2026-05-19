import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { ContactForm } from './components/ContactForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Facebook, MapPin } from 'lucide-react';

export const AppMain = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#d4ff00] selection:text-black">
      <Navbar />
      
      <main>
        <Hero />
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-20 border-y border-white/5"
        >
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-[#d4ff00]">+10k</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">Pacientes Felices</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#d4ff00]">15+</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">Años de Experiencia</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#d4ff00]">24/7</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">Emergencias</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#d4ff00]">ISO</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">Certificados</p>
            </div>
          </div>
        </motion.div>

        <Services />
        
        <section id="ubicacion" className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h3 className="text-4xl font-bold mb-6 italic">Encuéntranos en <span className="text-[#d4ff00]">Lince</span></h3>
                <p className="text-gray-400 mb-8">Nuestra sede principal cuenta con estacionamiento privado y tecnología dental de punta para brindarte la comodidad que mereces.</p>
                <div className="p-6 border border-white/10 rounded-2xl bg-white/5 inline-flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                     <MapPin className="text-[#d4ff00]" />
                     <span className="font-bold">Mariano Melgar 1175, Lince, Lima</span>
                   </div>
                   <p className="text-sm text-gray-500">Lunes a Sábado: 9:00 AM - 8:00 PM</p>
                </div>
              </div>
              <div className="flex-1 w-full h-[400px] bg-[#111] rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                 <div className="text-center opacity-40">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-[#d4ff00]" />
                    <p className="text-sm uppercase tracking-[0.2em]">Mapa Interactivo Cargando...</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>

      <footer className="py-12 border-t border-white/5 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white font-bold text-xl tracking-tighter">ODONTO <span className="text-[#d4ff00]">PERÚ</span></span>
            </div>
            <p className="text-gray-500 text-sm">© 2024 Odonto Perú. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d4ff00] hover:text-black transition-all"><Instagram size={20} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d4ff00] hover:text-black transition-all"><Facebook size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};