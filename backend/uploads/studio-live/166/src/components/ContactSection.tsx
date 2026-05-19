import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const carOptions = [
  'Ferrari 296 GTB',
  'Lamborghini Huracán EVO',
  'Porsche 911 GT3 RS',
  'McLaren 720S',
  'Aston Martin DBS',
  'Bugatti Chiron',
  'Koenigsegg Jesko',
  'Pagani Huayra',
  'Rimac Nevera',
  'Otro modelo',
];

const contactInfo = [
  {
    icon: Phone,
    label: 'Teléfono',
    value: '+52 55 8800 9900',
    sub: 'Lun–Sáb, 9:00–20:00',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contacto@apexmotors.mx',
    sub: 'Respuesta en menos de 2h',
  },
  {
    icon: MapPin,
    label: 'Showroom',
    value: 'Av. Presidente Masaryk 123',
    sub: 'Polanco, Ciudad de México',
  },
  {
    icon: Clock,
    label: 'Horario',
    value: 'Lun–Sáb: 9:00–20:00',
    sub: 'Dom: 11:00–17:00',
  },
];

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  auto: string;
  mensaje: string;
}

const initialForm: FormState = {
  nombre: '',
  email: '',
  telefono: '',
  auto: '',
  mensaje: '',
};

export default function ContactSection() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Ingresa un email válido';
    if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!form.auto) newErrors.auto = 'Selecciona un auto de interés';
    if (!form.mensaje.trim()) newErrors.mensaje = 'El mensaje es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1800);
  };

  const inputBase =
    'w-full bg-bg border border-white/10 text-text placeholder-text/30 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/40 transition-all duration-300 hover:border-white/20';

  const labelBase = 'block font-body text-xs uppercase tracking-widest text-text/50 mb-1.5';

  return (
    <section id="contacto" className="relative bg-bg overflow-hidden py-28 md:py-36">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(196,30,58,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Decorative line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-4">
            Experiencia Exclusiva
          </p>
          <h2 className="font-heading text-6xl md:text-8xl uppercase text-text tracking-tight leading-none mb-5">
            Agenda Tu{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #C41E3A 0%, #B8960C 100%)' }}>
              Test Drive
            </span>
          </h2>
          <p className="font-body text-text/50 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Nuestros asesores especializados te guiarán hacia el auto que define quién eres.
            Contacto personalizado, sin presiones.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* ── Contact Info Column ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Image block */}
            <div className="relative rounded-2xl overflow-hidden h-52 md:h-64 mb-6">
              <img
                src="https://images.pexels.com/photos/30991907/pexels-photo-30991907.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                alt="APEX Motors Showroom"
                width={800}
                height={500}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 40%, rgba(8,8,8,0.85) 100%)',
                }}
              />
              <div className="absolute bottom-4 left-5">
                <p className="font-heading text-2xl uppercase text-text tracking-wider">
                  Showroom Polanco
                </p>
                <p className="font-body text-xs text-text/50 mt-0.5">Ciudad de México</p>
              </div>
            </div>

            {/* Info cards */}
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex items-start gap-4 bg-surface border border-white/[0.06] rounded-xl px-5 py-4 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <item.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-widest text-text/40 mb-0.5">
                    {item.label}
                  </p>
                  <p className="font-body text-sm font-semibold text-text">{item.value}</p>
                  <p className="font-body text-xs text-text/40 mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Tagline */}
            <div
              className="rounded-xl px-5 py-4 border border-secondary/20 mt-2"
              style={{
                background:
                  'linear-gradient(135deg, rgba(184,150,12,0.07) 0%, rgba(196,30,58,0.07) 100%)',
              }}
            >
              <p className="font-heading text-xl uppercase text-secondary tracking-wide">
                Asesoría sin costo
              </p>
              <p className="font-body text-xs text-text/50 mt-1 leading-relaxed">
                Cada cliente recibe atención personalizada de un especialista APEX con más de 10
                años de experiencia en el segmento premium.
              </p>
            </div>
          </motion.div>

          {/* ── Form Column ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3"
          >
            <div
              className="relative rounded-2xl border border-white/[0.07] overflow-hidden"
              style={{
                background:
                  'linear-gradient(145deg, rgba(17,17,17,0.95) 0%, rgba(12,12,12,0.98) 100%)',
                boxShadow: '0 25px 80px rgba(196,30,58,0.08), 0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {/* Card top accent */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              <div className="p-7 md:p-10">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center text-center py-16 gap-5"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <CheckCircle size={38} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-4xl uppercase text-text tracking-wide mb-2">
                        Solicitud Enviada
                      </h3>
                      <p className="font-body text-text/50 text-sm max-w-xs mx-auto leading-relaxed">
                        Un asesor APEX se pondrá en contacto contigo en menos de 2 horas hábiles
                        para confirmar tu test drive.
                      </p>
                    </div>
                    <button
                      onClick={() => { setSubmitted(false); setForm(initialForm); }}
                      className="mt-2 font-body text-xs uppercase tracking-widest text-primary hover:text-accent border border-primary/30 hover:border-accent/50 rounded-lg px-6 py-2.5 transition-all duration-300"
                    >
                      Nueva solicitud
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="mb-6">
                      <h3 className="font-heading text-3xl md:text-4xl uppercase text-text tracking-wide">
                        Solicita Tu Experiencia
                      </h3>
                      <p className="font-body text-xs text-text/40 mt-1">
                        Todos los campos son requeridos
                      </p>
                    </div>

                    {/* Row 1: Nombre + Email */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="nombre" className={labelBase}>
                          Nombre completo
                        </label>
                        <input
                          id="nombre"
                          name="nombre"
                          type="text"
                          value={form.nombre}
                          onChange={handleChange}
                          placeholder="Carlos Mendoza"
                          className={cn(inputBase, errors.nombre && 'border-accent/60 focus:border-accent/80 focus:ring-accent/30')}
                          aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                        />
                        {errors.nombre && (
                          <p id="nombre-error" className="mt-1 font-body text-xs text-accent">
                            {errors.nombre}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className={labelBase}>
                          Correo electrónico
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="carlos@empresa.com"
                          className={cn(inputBase, errors.email && 'border-accent/60 focus:border-accent/80 focus:ring-accent/30')}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                          <p id="email-error" className="mt-1 font-body text-xs text-accent">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Teléfono + Auto */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="telefono" className={labelBase}>
                          Teléfono
                        </label>
                        <input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          value={form.telefono}
                          onChange={handleChange}
                          placeholder="+52 55 1234 5678"
                          className={cn(inputBase, errors.telefono && 'border-accent/60 focus:border-accent/80 focus:ring-accent/30')}
                          aria-describedby={errors.telefono ? 'telefono-error' : undefined}
                        />
                        {errors.telefono && (
                          <p id="telefono-error" className="mt-1 font-body text-xs text-accent">
                            {errors.telefono}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="auto" className={labelBase}>
                          Auto de interés
                        </label>
                        <div className="relative">
                          <select
                            id="auto"
                            name="auto"
                            value={form.auto}
                            onChange={handleChange}
                            className={cn(
                              inputBase,
                              'appearance-none pr-10 cursor-pointer',
                              !form.auto && 'text-text/30',
                              errors.auto && 'border-accent/60 focus:border-accent/80 focus:ring-accent/30'
                            )}
                            aria-describedby={errors.auto ? 'auto-error' : undefined}
                          >
                            <option value="" disabled>Seleccionar modelo</option>
                            {carOptions.map((car) => (
                              <option key={car} value={car} className="bg-surface text-text">
                                {car}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 pointer-events-none"
                          />
                        </div>
                        {errors.auto && (
                          <p id="auto-error" className="mt-1 font-body text-xs text-accent">
                            {errors.auto}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label htmlFor="mensaje" className={labelBase}>
                        Mensaje
                      </label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        value={form.mensaje}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Cuéntanos qué esperas de tu experiencia APEX, fecha preferida para el test drive o cualquier consulta..."
                        className={cn(
                          inputBase,
                          'resize-none leading-relaxed',
                          errors.mensaje && 'border-accent/60 focus:border-accent/80 focus:ring-accent/30'
                        )}
                        aria-describedby={errors.mensaje ? 'mensaje-error' : undefined}
                      />
                      {errors.mensaje && (
                        <p id="mensaje-error" className="mt-1 font-body text-xs text-accent">
                          {errors.mensaje}
                        </p>
                      )}
                    </div>

                    {/* Privacy */}
                    <p className="font-body text-xs text-text/25 leading-relaxed">
                      Al enviar este formulario aceptas nuestra{' '}
                      <span className="text-primary/60 hover:text-primary cursor-pointer transition-colors">
                        Política de Privacidad
                      </span>
                      . Tus datos son tratados con absoluta confidencialidad.
                    </p>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.015 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className={cn(
                        'w-full flex items-center justify-center gap-3 font-heading text-xl uppercase tracking-widest rounded-xl py-4 transition-all duration-300',
                        loading
                          ? 'bg-primary/40 text-text/40 cursor-not-allowed'
                          : 'bg-primary hover:bg-accent text-text cursor-pointer'
                      )}
                      style={
                        !loading
                          ? { boxShadow: '0 8px 32px rgba(196,30,58,0.35)' }
                          : undefined
                      }
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-text/60"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          Enviando solicitud...
                        </>
                      ) : (
                        <>
                          Agendar Test Drive
                          <Send size={18} />
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>

              {/* Card bottom accent */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
}