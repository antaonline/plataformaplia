import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, CheckCircle, Send, User, Mail, Phone, ChevronDown } from 'lucide-react';
import { fadeUp, staggerContainer } from '../lib/utils';

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  tipoColeccionista: string;
  intereses: string[];
}

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  tipoColeccionista?: string;
}

const tiposColeccionista = [
  { value: '', label: 'Selecciona tu perfil de coleccionista' },
  { value: 'iniciante', label: 'Coleccionista Iniciante — Descubriendo el mundo sofubi' },
  { value: 'entusiasta', label: 'Entusiasta — Colección activa en crecimiento' },
  { value: 'avanzado', label: 'Coleccionista Avanzado — Piezas de edición limitada' },
  { value: 'experto', label: 'Experto Curador — Colección museística de alto valor' },
  { value: 'inversor', label: 'Inversor de Arte — Foco en revalorización' },
];

const categoriasSofubi = [
  { id: 'kaiju', label: 'Kaiju Clásicos', descripcion: 'Godzilla, Ultraman y monstruos icónicos' },
  { id: 'designer_toys', label: 'Designer Toys', descripcion: 'Artistas independientes contemporáneos' },
  { id: 'vintage', label: 'Sofubi Vintage', descripcion: 'Piezas originales de los años 60–80' },
  { id: 'medicom', label: 'Medicom & Bearbrick', descripcion: 'Colecciones premium Medicom Toy' },
  { id: 'one_off', label: 'One-Off & Artist Proofs', descripcion: 'Piezas únicas pintadas a mano' },
  { id: 'secret_base', label: 'Secret Base & Skull Toys', descripcion: 'Estética underground japonesa' },
  { id: 'collaborations', label: 'Colaboraciones Exclusivas', descripcion: 'Drops con artistas internacionales' },
  { id: 'micro', label: 'Micro Sofubi', descripcion: 'Figuras miniatura de colección' },
];

export default function MembershipForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    tipoColeccionista: '',
    intereses: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'Ingresa tu nombre completo';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    if (!formData.telefono.trim() || formData.telefono.replace(/\D/g, '').length < 9) {
      newErrors.telefono = 'Ingresa un teléfono válido (mín. 9 dígitos)';
    }
    if (!formData.tipoColeccionista) {
      newErrors.tipoColeccionista = 'Selecciona tu perfil de coleccionista';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const toggleInteres = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      intereses: prev.intereses.includes(id)
        ? prev.intereses.filter((i) => i !== id)
        : [...prev.intereses, id],
    }));
  };

  const handleSelectOption = (value: string) => {
    setFormData((prev) => ({ ...prev, tipoColeccionista: value }));
    setSelectOpen(false);
    if (errors.tipoColeccionista) setErrors((prev) => ({ ...prev, tipoColeccionista: undefined }));
  };

  const selectedLabel = tiposColeccionista.find((t) => t.value === formData.tipoColeccionista)?.label;

  return (
    <section id="membresia" className="bg-bg py-32 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/4 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/6 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 80px)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-primary" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8">
              <Crown size={14} className="text-primary" />
              <span className="text-primary font-body text-xs tracking-[0.2em] uppercase font-medium">
                Membresía VIP
              </span>
            </div>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-primary" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-text leading-[0.9] tracking-tight mb-6"
          >
            Acceso{' '}
            <em className="text-primary not-italic">Exclusivo</em>
            <br />
            para Coleccionistas
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-body text-text/60 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Únete a nuestra lista privada y sé el primero en conocer nuevas adquisiciones, drops
            limitados y piezas únicas antes de que lleguen al mercado. Solo para coleccionistas serios.
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32, scale: 0.96 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                {/* Card glow */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/30 via-transparent to-secondary/20 pointer-events-none" />
                <div className="relative bg-surface rounded-2xl p-8 md:p-12">
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Personal Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Nombre */}
                      <div className="space-y-2">
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-primary/80 font-medium block">
                          Nombre Completo
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30" />
                          <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => {
                              setFormData((p) => ({ ...p, nombre: e.target.value }));
                              if (errors.nombre) setErrors((p) => ({ ...p, nombre: undefined }));
                            }}
                            placeholder="Tu nombre completo"
                            className={`w-full bg-bg/60 border ${errors.nombre ? 'border-secondary/60' : 'border-primary/20'} rounded-xl pl-11 pr-4 py-3.5 font-body text-text text-sm placeholder:text-text/25 focus:outline-none focus:border-primary/60 focus:bg-bg/80 transition-all duration-200`}
                          />
                        </div>
                        {errors.nombre && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-body text-xs text-secondary/90"
                          >
                            {errors.nombre}
                          </motion.p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-primary/80 font-medium block">
                          Correo Electrónico
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData((p) => ({ ...p, email: e.target.value }));
                              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                            }}
                            placeholder="tu@email.com"
                            className={`w-full bg-bg/60 border ${errors.email ? 'border-secondary/60' : 'border-primary/20'} rounded-xl pl-11 pr-4 py-3.5 font-body text-text text-sm placeholder:text-text/25 focus:outline-none focus:border-primary/60 focus:bg-bg/80 transition-all duration-200`}
                          />
                        </div>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-body text-xs text-secondary/90"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </div>

                      {/* Teléfono */}
                      <div className="space-y-2">
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-primary/80 font-medium block">
                          Teléfono / WhatsApp
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30" />
                          <input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => {
                              setFormData((p) => ({ ...p, telefono: e.target.value }));
                              if (errors.telefono) setErrors((p) => ({ ...p, telefono: undefined }));
                            }}
                            placeholder="+51 999 999 999"
                            className={`w-full bg-bg/60 border ${errors.telefono ? 'border-secondary/60' : 'border-primary/20'} rounded-xl pl-11 pr-4 py-3.5 font-body text-text text-sm placeholder:text-text/25 focus:outline-none focus:border-primary/60 focus:bg-bg/80 transition-all duration-200`}
                          />
                        </div>
                        {errors.telefono && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-body text-xs text-secondary/90"
                          >
                            {errors.telefono}
                          </motion.p>
                        )}
                      </div>

                      {/* Tipo de Coleccionista — Custom Select */}
                      <div className="space-y-2">
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-primary/80 font-medium block">
                          Perfil de Coleccionista
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectOpen((p) => !p)}
                            className={`w-full bg-bg/60 border ${errors.tipoColeccionista ? 'border-secondary/60' : selectOpen ? 'border-primary/60' : 'border-primary/20'} rounded-xl px-4 py-3.5 font-body text-sm text-left flex items-center justify-between transition-all duration-200 focus:outline-none`}
                          >
                            <span className={formData.tipoColeccionista ? 'text-text' : 'text-text/25'}>
                              {formData.tipoColeccionista
                                ? tiposColeccionista.find((t) => t.value === formData.tipoColeccionista)?.label
                                : 'Selecciona tu perfil de coleccionista'}
                            </span>
                            <motion.div
                              animate={{ rotate: selectOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={16} className="text-primary/60" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {selectOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
                                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                style={{ transformOrigin: 'top' }}
                                className="absolute top-full left-0 right-0 mt-2 bg-surface border border-primary/30 rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/60"
                              >
                                {tiposColeccionista.slice(1).map((tipo) => (
                                  <button
                                    key={tipo.value}
                                    type="button"
                                    onClick={() => handleSelectOption(tipo.value)}
                                    className={`w-full px-4 py-3 text-left font-body text-sm transition-all duration-150 hover:bg-primary/10 ${formData.tipoColeccionista === tipo.value ? 'text-primary bg-primary/8' : 'text-text/70 hover:text-text'}`}
                                  >
                                    {tipo.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {errors.tipoColeccionista && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-body text-xs text-secondary/90"
                          >
                            {errors.tipoColeccionista}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Intereses */}
                    <div className="mb-10">
                      <div className="flex items-center gap-3 mb-5">
                        <label className="font-body text-xs tracking-[0.15em] uppercase text-primary/80 font-medium">
                          Categorías de Interés
                        </label>
                        <span className="font-body text-xs text-text/30">(Opcional — selecciona todas las que apliquen)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoriasSofubi.map((cat) => {
                          const isSelected = formData.intereses.includes(cat.id);
                          return (
                            <motion.button
                              key={cat.id}
                              type="button"
                              onClick={() => toggleInteres(cat.id)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                                isSelected
                                  ? 'border-primary/60 bg-primary/8'
                                  : 'border-primary/15 bg-bg/40 hover:border-primary/35 hover:bg-primary/5'
                              }`}
                            >
                              <div
                                className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all duration-200 ${
                                  isSelected ? 'bg-primary border-primary' : 'border-primary/30 bg-transparent'
                                }`}
                              >
                                {isSelected && (
                                  <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    width="10"
                                    height="8"
                                    viewBox="0 0 10 8"
                                    fill="none"
                                  >
                                    <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </motion.svg>
                                )}
                              </div>
                              <div>
                                <p className={`font-body text-sm font-medium transition-colors duration-200 ${isSelected ? 'text-primary' : 'text-text/80'}`}>
                                  {cat.label}
                                </p>
                                <p className="font-body text-xs text-text/35 mt-0.5">{cat.descripcion}</p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-8" />

                    {/* Privacy note + Submit */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <p className="font-body text-xs text-text/30 leading-relaxed flex-1">
                        Tu información es confidencial y nunca será compartida con terceros. Solo recibirás
                        comunicaciones exclusivas de Zofubi Luxury sobre nuevas piezas y drops privados.
                      </p>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        className="relative flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-primary text-bg font-body font-semibold text-sm tracking-[0.1em] uppercase rounded-xl overflow-hidden transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-accent"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full"
                            />
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <>
                            <Crown size={16} />
                            <span>Unirme al Club VIP</span>
                            <Send size={14} />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/40 via-transparent to-primary/20 pointer-events-none" />
              <div className="relative bg-surface rounded-2xl p-12 md:p-20 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center mx-auto mb-8"
                >
                  <CheckCircle size={36} className="text-primary" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="font-heading text-4xl md:text-5xl font-bold text-text mb-4"
                >
                  Bienvenido al{' '}
                  <em className="text-primary not-italic">Club Exclusivo</em>
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="font-body text-text/60 text-lg max-w-lg mx-auto leading-relaxed mb-10"
                >
                  <strong className="text-text/80">{formData.nombre}</strong>, tu membresía VIP ha sido
                  registrada. Recibirás acceso anticipado a nuevas piezas, drops exclusivos y
                  oportunidades de adquisición privada directamente en tu correo.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/8">
                    <Crown size={14} className="text-primary" />
                    <span className="font-body text-xs tracking-[0.15em] uppercase text-primary font-medium">
                      Miembro VIP Confirmado
                    </span>
                  </div>
                  <div className="h-4 w-[1px] bg-primary/20 hidden sm:block" />
                  <span className="font-body text-xs text-text/35 tracking-wide">
                    Zofubi Luxury — Miraflores, Lima
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}