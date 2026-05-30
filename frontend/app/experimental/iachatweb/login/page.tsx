"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Lock, 
  Mail, 
  ChevronLeft,
  Rocket,
  Zap,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DeepParticleField } from "@/components/shared/DeepParticleField";
import { useToast } from '@/hooks/use-toast';



export default function AiStudioLoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [apiBase, setApiBase] = useState('/api');

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const envApi = process.env.NEXT_PUBLIC_API_URL;
    const base = envApi || (isLocal ? 'http://localhost:3002' : '');
    const finalBase = base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api';
    setApiBase(finalBase);
    console.log('API Base configurada en el cliente:', finalBase);
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password' | 'google-suggest' | '2fa'>('email');
  // Estado para el flujo 2FA: el backend te exige codigo cuando login
  // viene desde un device nuevo (fingerprint distinto). Aqui guardamos
  // el userId que devuelve el primer call y el codigo de 6 digitos.
  const [twoFactorUserId, setTwoFactorUserId] = useState<number | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Lógica de "Login Inteligente"
    if (email.toLowerCase().endsWith('@gmail.com')) {
      setStep('google-suggest');
    } else {
      setStep('password');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fingerprint: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Credenciales incorrectas');
      }

      // 2FA: si el backend detecta dispositivo nuevo (fingerprint
      // distinto) responde con requires2FA + userId y manda codigo
      // por correo. Pasamos al step de verificacion.
      if (data?.requires2FA && data?.userId) {
        setTwoFactorUserId(Number(data.userId));
        setStep('2fa');
        toast({
          title: "Verifica tu identidad",
          description: "Te enviamos un codigo de 6 digitos a tu correo.",
        });
        return;
      }

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      toast({
        title: "¡Bienvenido!",
        description: "Accediendo al PLIA AI Studio...",
      });

      router.push('/experimental/iachatweb');

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorUserId || !twoFactorCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: twoFactorUserId,
          code: twoFactorCode.trim(),
          fingerprint: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Codigo invalido');
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      toast({
        title: "¡Bienvenido!",
        description: "Accediendo al PLIA AI Studio...",
      });
      router.push('/experimental/iachatweb');
    } catch (err: any) {
      toast({
        title: "Codigo incorrecto",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const finalUrl = `${apiBase}/auth/google`;
    console.log('Redirigiendo a Google:', finalUrl);
    window.location.href = finalUrl;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white overflow-hidden font-sans">
      <section className="w-full lg:min-h-screen lg:flex lg:items-stretch lg:px-5 lg:py-5 xl:px-6 xl:py-6">
        <div className="w-full">
          <div className="grid lg:grid-cols-5 gap-6 w-full h-full">
            
            {/* Columna Izquierda: Formulario (2/5) */}
            <div className="lg:col-span-2 bg-[#161b22] rounded-[2.5rem] border border-white/5 shadow-2xl p-8 md:p-12 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cta/5 blur-3xl rounded-full -translate-y-16 translate-x-16" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <Link href="/" className="flex items-center gap-2">
                    <Image
                      src="/plia-logo-white.svg"
                      alt="PLIA"
                      width={120}
                      height={32}
                      priority
                      className="h-8 w-auto"
                    />
                    <Badge variant="outline" className="bg-cta/10 border-cta/20 text-[9px] font-black text-cta uppercase tracking-widest px-2 py-0.5">AI STUDIO</Badge>
                  </Link>
                  <button className="text-[10px] font-black bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest text-slate-400">
                    ES
                  </button>
                </div>

                <div className="mb-10">
                  <h1 className="text-4xl font-black tracking-tight mb-3">Iniciar sesión</h1>
                </div>

                <div className="space-y-6">
                  
                  {/* Step: Email */}
                  {step === 'email' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Botones Sociales Arriba */}
                      <div className="space-y-3">
                        <a 
                          href={`${apiBase}/auth/google`}
                          className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-3 transition-all relative group no-underline"
                        >
                          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" width={20} height={20} alt="Google" />
                          <span>Continuar con Google</span>
                          <Badge className="absolute -top-2 -right-2 bg-cta text-black text-[8px] font-black py-0 px-1.5 border-2 border-[#161b22]">MÁS USADO</Badge>
                        </a>
                      </div>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-[#161b22] px-4 text-slate-500 font-bold">o con tu correo</span></div>
                      </div>

                      <form onSubmit={handleContinue} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cta transition-colors" />
                            <Input 
                              type="email" 
                              placeholder="Email"
                              className="bg-white/5 border-white/10 h-14 rounded-2xl pl-12 text-sm focus:ring-cta/20 focus:border-cta/30 transition-all text-white"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full h-14 rounded-2xl bg-white text-black hover:bg-slate-200 font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          Continuar
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {/* Step: Google Suggest (Smart Suggestion) */}
                  {step === 'google-suggest' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Email</span>
                          <span className="text-sm font-bold text-white truncate max-w-[200px]">{email}</span>
                        </div>
                        <button onClick={() => setStep('email')} className="p-2 hover:bg-white/10 rounded-xl text-cta transition-all">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>

                      <a 
                        href={`${apiBase}/auth/google`}
                        className="w-full h-14 rounded-2xl bg-[#000] text-white hover:bg-slate-900 border border-white/10 font-black uppercase tracking-widest shadow-[0_0_30px_rgba(191,255,0,0.15)] transition-all flex items-center justify-center gap-3 no-underline"
                      >
                        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" width={20} height={20} alt="Google" />
                        Continuar con Google
                      </a>
                      
                      <button 
                        onClick={() => setStep('password')}
                        className="w-full text-center text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                      >
                        O usar mi contraseña
                      </button>
                    </motion.div>
                  )}

                  {/* Step: 2FA — codigo enviado por email */}
                  {step === '2fa' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                          Verificacion en 2 pasos
                        </p>
                        <p className="text-sm text-white font-medium">
                          Te enviamos un codigo de 6 digitos a{' '}
                          <span className="font-bold">{email}</span>. Revisa tu bandeja (y spam).
                        </p>
                      </div>

                      <form onSubmit={handleVerify2FA} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                            Codigo
                          </label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="\d{6}"
                            maxLength={6}
                            placeholder="123456"
                            className="bg-white/5 border-white/10 h-14 rounded-2xl text-center text-2xl font-mono tracking-[0.6em] focus:ring-cta/20 focus:border-cta/30 text-white"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            autoFocus
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-14 rounded-2xl bg-cta hover:bg-cta-hover text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(191,255,0,0.1)] transition-all active:scale-95"
                          disabled={loading || twoFactorCode.length !== 6}
                        >
                          {loading ? 'Verificando...' : 'Verificar y entrar'}
                        </Button>

                        <button
                          type="button"
                          onClick={() => {
                            setStep('password');
                            setTwoFactorCode('');
                            setTwoFactorUserId(null);
                          }}
                          className="w-full text-center text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                        >
                          Volver
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* Step: Password */}
                  {step === 'password' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Email</span>
                          <span className="text-sm font-bold text-white truncate max-w-[200px]">{email}</span>
                        </div>
                        <button onClick={() => setStep('email')} className="p-2 hover:bg-white/10 rounded-xl text-cta transition-all">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Contraseña</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cta transition-colors" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Tu contraseña"
                              className="bg-white/5 border-white/10 h-14 rounded-2xl pl-12 pr-12 text-sm focus:ring-cta/20 focus:border-cta/30 transition-all text-white"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              autoFocus
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold px-2">
                          <Link href="/set-password" className="text-slate-500 hover:text-cta transition-colors italic">¿Olvidaste tu contraseña?</Link>
                          <Link href="/tu-web-con-ia" className="text-cta hover:underline">Registrate</Link>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-14 rounded-2xl bg-cta hover:bg-cta-hover text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(191,255,0,0.1)] transition-all active:scale-95"
                          disabled={loading}
                        >
                          {loading ? 'Ingresando...' : 'Entrar al Studio'}
                        </Button>
                      </form>
                    </motion.div>
                  )}

                </div>
              </div>

              <div className="relative z-10 pt-10 text-[10px] text-slate-500 flex flex-wrap gap-4 font-black uppercase tracking-widest">
                <Link href="#" className="hover:text-cta transition-colors">Privacidad</Link>
                <span>•</span>
                <Link href="#" className="hover:text-cta transition-colors">Términos</Link>
                <span>•</span>
                <Link href="#" className="hover:text-cta transition-colors">Contacto</Link>
              </div>
            </div>

            {/* Columna Derecha: Marketing Visual (3/5) */}
            <div className="lg:col-span-3 relative rounded-[2.5rem] overflow-hidden border border-white/5 h-full hidden lg:block bg-black">
              <DeepParticleField />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              <div className="relative z-10 h-full p-12 flex flex-col justify-between">
                <div className="max-w-md">
                   <Badge className="bg-cta text-black border-none font-black mb-6 px-4 py-1 uppercase tracking-widest text-[10px]">Nueva IA Chat</Badge>
                   <h2 className="text-5xl font-black tracking-tighter leading-[1.1] mb-6">
                     Diseña con la <br />
                     <span className="text-cta italic">velocidad</span> del pensamiento.
                   </h2>
                   <p className="text-white/60 text-lg leading-relaxed font-medium">
                     Tu cuenta de PLIA ahora incluye acceso al Studio de IA Generativa. Una sola cuenta para hosting, dominios y ahora, desarrollo inteligente.
                   </p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                      <Zap className="h-6 w-6 text-cta mb-4" />
                      <h3 className="font-bold text-sm mb-1">Carga Instantánea</h3>
                      <p className="text-xs text-white/40">Optimizado para la velocidad extrema en servidores PLIA.</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                      <ShieldCheck className="h-6 w-6 text-cta mb-4" />
                      <h3 className="font-bold text-sm mb-1">SSL Ilimitado</h3>
                      <p className="text-xs text-white/40">Toda tu web protegida por defecto desde el minuto uno.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-cta/10 backdrop-blur-md border border-cta/20 rounded-2xl px-6 py-4 w-fit">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0d1117] bg-slate-800" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white/80">+2,000 emprendedores ya están chateando con PLIA</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
