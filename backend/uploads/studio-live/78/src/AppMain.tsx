import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './components/Icon';
import { cn } from './lib/utils';
import { products } from './data/products';

// Components
const Navbar = ({ setView }: { setView: (v: string) => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => setView('home')}
      >
        <span className="text-2xl font-black tracking-tighter text-white">
          MOTO<span className="text-[#d4ff00]">X</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {['Home', 'Catálogo', 'Contacto'].map((item) => (
          <button 
            key={item} 
            onClick={() => setView(item.toLowerCase().replace('á', 'a'))}
            className="text-sm font-medium text-gray-400 hover:text-[#d4ff00] transition-colors uppercase tracking-widest"
          >
            {item}
          </button>
        ))}
      </div>
      <button 
        onClick={() => setView('catalogo')}
        className="bg-[#d4ff00] text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform"
      >
        RESERVAR
      </button>
    </div>
  </nav>
);

const Hero = ({ setView }: { setView: (v: string) => void }) => (
  <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
    <div className="absolute inset-0 z-0 opacity-40">
      <img 
        src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=2000" 
        className="w-full h-full object-cover"
        alt="Hero Background"
      />
    </div>
    <div className="relative z-10 text-center px-6">
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-9xl font-black text-white italic tracking-tighter leading-none"
      >
        MOTO<span className="text-[#d4ff00]">X</span> PERÚ
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto font-light"
      >
        Domina las calles de Lima con la ingeniería más avanzada del mundo. 
        Ducati, Kawasaki, Yamaha y Honda en un solo lugar.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 flex flex-col md:flex-row gap-4 justify-center"
      >
        <button 
          onClick={() => setView('catalogo')}
          className="bg-[#d4ff00] text-black px-10 py-4 rounded-full font-black text-lg hover:shadow-[0_0_30px_rgba(212,255,0,0.4)] transition-all"
        >
          EXPLORAR CATÁLOGO
        </button>
        <button 
          onClick={() => setView('contacto')}
          className="border-2 border-white/20 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-white hover:text-black transition-all"
        >
          TIENDA FÍSICA
        </button>
      </motion.div>
    </div>
  </section>
);

const Catalog = ({ onSelect }: { onSelect: (p: any) => void }) => (
  <section className="py-32 px-6 bg-[#0A0A0A]">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h2 className="text-[#d4ff00] font-bold tracking-widest mb-2">SHOWROOM 2024</h2>
          <h3 className="text-5xl font-black text-white italic">MÁQUINAS DE ÉLITE</h3>
        </div>
        <div className="flex gap-4">
          {['Todas', 'Ducati', 'Kawasaki', 'Yamaha'].map(filter => (
            <button key={filter} className="text-xs font-bold border border-white/10 px-4 py-2 rounded-full text-white hover:border-[#d4ff00] transition-colors">
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="group cursor-pointer relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5"
            onClick={() => onSelect(product)}
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="p-8 flex justify-between items-end">
              <div>
                <p className="text-[#d4ff00] font-bold text-sm tracking-widest mb-1">{product.brand.toUpperCase()}</p>
                <h4 className="text-3xl font-black text-white italic">{product.name}</h4>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Desde</p>
                <p className="text-2xl font-black text-white">{product.price}</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="bg-black/50 backdrop-blur-md p-3 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="ArrowUpRight" className="text-[#d4ff00]" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const ProductDetail = ({ product, onBack }: { product: any, onBack: () => void }) => (
  <section className="min-h-screen pt-32 pb-20 px-6 bg-[#0A0A0A]">
    <div className="max-w-7xl mx-auto">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-gray-400 hover:text-[#d4ff00] transition-colors mb-12 uppercase font-bold text-sm tracking-widest"
      >
        <Icon name="ArrowLeft" size={16} /> Volver al catálogo
      </button>

      <div className="grid lg:grid-cols-2 gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <img src={product.image} alt={product.name} className="w-full rounded-3xl shadow-2xl border border-white/10" />
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Potencia</p>
              <p className="text-white font-black">{product.specs.power.split(' ')[0]} CV</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Motor</p>
              <p className="text-white font-black">{product.specs.displacement}</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Peso</p>
              <p className="text-white font-black">{product.specs.weight}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <p className="text-[#d4ff00] font-black text-xl tracking-widest mb-2">{product.brand.toUpperCase()}</p>
          <h1 className="text-6xl md:text-7xl font-black text-white italic leading-none mb-6">{product.name}</h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            {product.description}
          </p>

          <div className="border-t border-white/10 pt-8">
            <h4 className="text-white font-black mb-6 tracking-widest">ESPECIFICACIONES TÉCNICAS</h4>
            <div className="space-y-4">
              {Object.entries(product.specs).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-500 uppercase text-xs font-bold">{key}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button className="flex-1 bg-[#d4ff00] text-black py-4 rounded-xl font-black text-lg hover:scale-[1.02] transition-transform">
              RESERVAR AHORA
            </button>
            <button className="bg-zinc-900 text-white p-4 rounded-xl border border-white/10">
              <Icon name="Share2" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const Contact = () => (
  <section className="py-32 px-6 bg-[#0A0A0A]">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
      <div>
        <h2 className="text-[#d4ff00] font-bold tracking-widest mb-2 uppercase">Visítanos</h2>
        <h3 className="text-5xl font-black text-white italic mb-8">CENTRO DE EXPERIENCIA LIMA</h3>
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="bg-[#d4ff00] p-3 rounded-lg">
              <Icon name="MapPin" className="text-black" />
            </div>
            <div>
              <p className="text-white font-black text-xl">Ubicación</p>
              <p className="text-gray-400 mt-1">Mariano Melgar 1185, Lince<br />Lima, Perú</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-[#d4ff00] p-3 rounded-lg">
              <Icon name="Clock" className="text-black" />
            </div>
            <div>
              <p className="text-white font-black text-xl">Horario de Atención</p>
              <p className="text-gray-400 mt-1">Lunes a Viernes: 9:00 AM - 7:00 PM<br />Sábados: 10:00 AM - 4:00 PM</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-[#d4ff00] p-3 rounded-lg">
              <Icon name="Phone" className="text-black" />
            </div>
            <div>
              <p className="text-white font-black text-xl">Teléfono / WhatsApp</p>
              <p className="text-gray-400 mt-1">+51 987 654 321<br />ventas@motox.pe</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 p-10 rounded-3xl border border-white/5">
        <h4 className="text-white font-black text-2xl mb-6">ENVÍANOS UN MENSAJE</h4>
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre" className="bg-black border border-white/10 rounded-xl p-4 text-white focus:border-[#d4ff00] outline-none transition-colors" />
            <input type="email" placeholder="Email" className="bg-black border border-white/10 rounded-xl p-4 text-white focus:border-[#d4ff00] outline-none transition-colors" />
          </div>
          <input type="text" placeholder="Asunto" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-[#d4ff00] outline-none transition-colors" />
          <textarea rows={4} placeholder="¿En qué moto estás interesado?" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-[#d4ff00] outline-none transition-colors"></textarea>
          <button className="w-full bg-[#d4ff00] text-black py-4 rounded-xl font-black text-lg hover:shadow-[0_0_20px_rgba(212,255,0,0.3)] transition-all">
            ENVIAR SOLICITUD
          </button>
        </form>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-black py-20 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-12">
        <div>
          <span className="text-4xl font-black tracking-tighter text-white">
            MOTO<span className="text-[#d4ff00]">X</span>
          </span>
          <p className="text-gray-500 mt-4 max-w-xs uppercase font-bold text-xs tracking-widest">
            Tu pasaporte a la velocidad pura y la exclusividad mecánica.
          </p>
        </div>
        <div className="flex gap-10">
          {['Instagram', 'Facebook', 'YouTube', 'TikTok'].map(social => (
            <a key={social} href="#" className="text-white hover:text-[#d4ff00] font-bold text-sm uppercase tracking-widest transition-colors">{social}</a>
          ))}
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between text-gray-500 text-xs font-bold uppercase tracking-widest">
        <p>© 2024 MOTOX PERÚ. TODOS LOS DERECHOS RESERVADOS.</p>
        <p>DISEÑADO POR PLIA STUDIO</p>
      </div>
    </div>
  </footer>
);

export const AppMain = () => {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#d4ff00] selection:text-black font-sans">
      <Navbar setView={setView} />
      
      <main>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero setView={setView} />
              <Catalog onSelect={handleProductSelect} />
            </motion.div>
          )}

          {view === 'catalogo' && (
            <motion.div
              key="catalogo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Catalog onSelect={handleProductSelect} />
            </motion.div>
          )}

          {view === 'product-detail' && selectedProduct && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProductDetail product={selectedProduct} onBack={() => setView('catalogo')} />
            </motion.div>
          )}

          {view === 'contacto' && (
            <motion.div
              key="contacto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Contact />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};