import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Introduce un email válido para continuar.');
      return;
    }

    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1200);
  };

  return (
    <section className="relative overflow-hidden bg-accent py-24 md:py-32">
      {/* Texture overlay pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.25) 40px, rgba(0,0,0,0.25) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.25) 40px, rgba(0,0,0,0.25) 41px)',
        }}
      />

      {/* Large decorative letters */}
      <div className="pointer-events-none absolute -bottom-8 -right-4 select-none font-heading text-[200px] leading-none text-black/10 md:text-[280px]">
        URBN
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 md:items-center">

          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 border border-black/30 bg-black/10 px-4 py-2 backdrop-blur-sm">
              <Zap size={14} className="text-bg fill-bg" />
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-bg">
                Acceso anticipado
              </span>
            </div>

            <h2 className="font-heading text-6xl uppercase leading-none tracking-tight text-bg md:text-7xl lg:text-8xl">
              SÉ EL
              <br />
              PRIMERO
              <br />
              <span className="text-secondary/90">EN SABER.</span>
            </h2>

            <p className="mt-6 font-body text-base leading-relaxed text-bg/75 md:text-lg max-w-sm">
              Drops exclusivos, colecciones limitadas y acceso prioritario antes que nadie. La cultura urbana llega primero a tu bandeja de entrada.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Drops antes del lanzamiento oficial',
                'Descuentos exclusivos para miembros',
                'Acceso a colabs y ediciones limitadas',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 font-body text-sm text-bg/80">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bg/60" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="border border-black/20 bg-black/10 p-8 backdrop-blur-sm md:p-10">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center border-2 border-bg bg-bg/10">
                    <Zap size={28} className="text-bg fill-bg" />
                  </div>
                  <h3 className="font-heading text-4xl uppercase tracking-tight text-bg">
                    Estás dentro.
                  </h3>
                  <p className="mt-3 font-body text-sm text-bg/70">
                    Bienvenido a la lista de acceso anticipado. Prepárate para lo que viene.
                  </p>
                </motion.div>
              ) : (
                <>
                  <p className="mb-2 font-body text-xs uppercase tracking-widest text-bg/60">
                    Únete ahora — es gratis
                  </p>
                  <h3 className="mb-8 font-heading text-3xl uppercase leading-tight tracking-tight text-bg md:text-4xl">
                    Entra en la lista exclusiva
                  </h3>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                      <label htmlFor="newsletter-email" className="sr-only">
                        Correo electrónico
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="tu@email.com"
                        disabled={status === 'loading'}
                        aria-describedby={errorMsg ? 'email-error' : undefined}
                        className={cn(
                          'w-full border bg-bg/90 px-5 py-4 font-body text-sm text-text placeholder-text/30 outline-none transition-all duration-200',
                          'focus:border-bg focus:ring-2 focus:ring-bg/30',
                          errorMsg ? 'border-red-400' : 'border-black/30',
                          status === 'loading' && 'opacity-60 cursor-not-allowed'
                        )}
                      />
                      {errorMsg && (
                        <p id="email-error" role="alert" className="mt-2 font-body text-xs text-bg font-semibold">
                          {errorMsg}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className={cn(
                        'group flex w-full items-center justify-between border-2 border-bg bg-bg px-6 py-4 font-heading text-lg uppercase tracking-widest text-accent transition-all duration-200',
                        'hover:bg-transparent hover:text-bg',
                        status === 'loading' && 'opacity-70 cursor-not-allowed'
                      )}
                    >
                      <span>
                        {status === 'loading' ? 'Procesando...' : 'Conseguir acceso'}
                      </span>
                      <ArrowRight
                        size={20}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </button>
                  </form>

                  <div className="mt-6 flex items-center gap-2 font-body text-xs text-bg/50">
                    <Lock size={11} />
                    <span>Sin spam. Cancela cuando quieras. 100% privacidad.</span>
                  </div>
                </>
              )}
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-5 flex items-center gap-4 px-2"
            >
              <div className="flex -space-x-2">
                {['#2a2a2a', '#1a1a1a', '#333', '#111'].map((bg, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-accent"
                    style={{ backgroundColor: bg }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="font-body text-xs text-bg/70">
                <span className="font-semibold text-bg">+12.400 personas</span> ya tienen acceso anticipado
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}