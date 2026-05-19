import React from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail } from 'lucide-react';

export const ContactForm = () => {
  return (
    <section id="contacto" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#111] rounded-[40px] border border-white/5 overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-10 lg:p-16 bg-[#d4ff00]">
            <h2 className="text-black text-4xl lg:text-6xl font-black mb-8 leading-none">
              ¿LISTO PARA <br/> TU CAMBIO?
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-black/80 font-medium">
                <div className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <p>Mariano Melgar 1175, Lince - Lima, Perú</p>
              </div>
              <div className="flex items-center gap-4 text-black/80 font-medium">
                <div className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <p>+51 987 654 321</p>
              </div>
              <div className="flex items-center gap-4 text-black/80 font-medium">
                <div className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <p>contacto@odontoperu.pe</p>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 p-10 lg:p-16 bg-[#0A0A0A]">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Nombre Completo</label>
                  <input type="text" placeholder="Ej. Juan Pérez" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#d4ff00] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Teléfono</label>
                  <input type="tel" placeholder="900 000 000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#d4ff00] transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Especialidad de Interés</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#d4ff00] transition-colors">
                  <option>Ortodoncia</option>
                  <option>Implantes</option>
                  <option>Estética Dental</option>
                  <option>Consulta General</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Mensaje (Opcional)</label>
                <textarea rows={4} placeholder="¿En qué podemos ayudarte?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#d4ff00] transition-colors resize-none" />
              </div>
              <button className="w-full bg-[#d4ff00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-[#d4ff00]/10">
                SOLICITAR CITA <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};