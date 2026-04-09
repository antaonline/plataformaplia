'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

type HostingPlan = {
  slug: string;
  name: string;
  description: string;
  regularMonthlyPrice: number;
  monthlyPricing: Record<string, number>;
  maxSites: number;
  storageMb: number;
  bandwidthMb: number;
  mailboxesPerSite: number;
  features: string[];
  termOptions: number[];
};

declare global {
  interface Window {
    KR?: any;
  }
}

function Content() {
  const searchParams = useSearchParams();
  const requestedPlan = (searchParams.get('plan') ?? 'premium').toLowerCase();
  const requestedTerm = Number(searchParams.get('term') ?? '12');

  const [step, setStep] = useState<1 | 2>(1);
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>(requestedPlan);
  const [billingCycleMonths, setBillingCycleMonths] = useState<number>(requestedTerm);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Lima');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'yape' | null>('card');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [formToken, setFormToken] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPlans() {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const res = await fetch(`${apiBase}/hosting/public/plans`);
        if (!res.ok) {
          throw new Error('No se pudieron cargar los planes de hosting.');
        }
        const data = await res.json();
        if (mounted) {
          const list = Array.isArray(data) ? data : [];
          setPlans(list);
          if (!list.some((plan) => plan.slug === requestedPlan) && list[0]) {
            setSelectedPlanSlug(list[0].slug);
          }
          if (list[0] && !list[0].termOptions.includes(requestedTerm)) {
            setBillingCycleMonths(12);
          }
        }
      } catch (error: any) {
        if (mounted) {
          setPlansError(error?.message ?? 'No se pudieron cargar los planes de hosting.');
        }
      } finally {
        if (mounted) {
          setPlansLoading(false);
        }
      }
    }

    loadPlans();
    return () => {
      mounted = false;
    };
  }, [requestedPlan, requestedTerm]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.slug === selectedPlanSlug) ?? null,
    [plans, selectedPlanSlug],
  );

  const monthlyPrice = selectedPlan ? Number(selectedPlan.monthlyPricing[String(billingCycleMonths)] ?? 0) : 0;
  const total = monthlyPrice * billingCycleMonths;
  const regularMonthlyPrice = Number(selectedPlan?.regularMonthlyPrice ?? 0);
  const regularTotal = regularMonthlyPrice * billingCycleMonths;

  const validateCheckout = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = 'Nombre completo requerido.';
    if (!address.trim()) errors.address = 'Direccion requerida.';
    if (!email.trim()) errors.email = 'Correo requerido.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const readErrorMessage = async (response: Response, fallback: string) => {
    try {
      const data = await response.json();
      if (typeof data === 'string' && data.trim()) {
        return data;
      }
      if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message;
      }
      if (Array.isArray(data?.message) && data.message.length) {
        return data.message.join(', ');
      }
    } catch {
      const text = await response.text().catch(() => '');
      if (text.trim()) {
        return text;
      }
    }

    return fallback;
  };

  const getUsableAccessToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return null;
    }

    try {
      const [, payloadBase64] = token.split('.');
      if (!payloadBase64) {
        localStorage.removeItem('access_token');
        return null;
      }

      const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded));
      const exp = Number(payload?.exp ?? 0);

      if (exp && exp * 1000 <= Date.now()) {
        localStorage.removeItem('access_token');
        return null;
      }

      return token;
    } catch {
      localStorage.removeItem('access_token');
      return null;
    }
  };

  const goToPaymentStep = () => {
    if (!selectedPlan || !validateCheckout()) {
      return;
    }

    setPayError(null);
    setStep(2);
    void initializePaymentForm();
  };

  const initializePaymentForm = async () => {
    if (!selectedPlan) {
      return;
    }
    if (paymentMethod === 'yape') {
      setPayError('Yape estará disponible próximamente.');
      return;
    }
    setPayLoading(true);
    setPayError(null);
    setFormToken(null);

    try {
      const accessToken = getUsableAccessToken();
      const payload = JSON.stringify({
        planSlug: selectedPlan.slug,
        billingCycleMonths,
        email,
      });

      let prepareRes: Response;

      if (accessToken) {
        prepareRes = await fetch(`${apiBase}/hosting/checkout/prepare-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: payload,
        });

        if (prepareRes.status === 401) {
          localStorage.removeItem('access_token');
          prepareRes = await fetch(`${apiBase}/hosting/checkout/prepare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          });
        }
      } else {
        prepareRes = await fetch(`${apiBase}/hosting/checkout/prepare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      }

      if (!prepareRes.ok) {
        throw new Error(
          await readErrorMessage(
            prepareRes,
            'No se pudo preparar el checkout de hosting.',
          ),
        );
      }

      const prepared = await prepareRes.json();

      const payRes = await fetch(`${apiBase}/payments/izipay/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: String(prepared.orderId),
          email,
          fullName,
          address,
          department,
          country: 'PE',
        }),
      });

      if (!payRes.ok) {
        throw new Error(await readErrorMessage(payRes, 'No se pudo iniciar el pago.'));
      }

      const payData = await payRes.json();
      const session = payData.session ?? payData;
      const tokenValue = session.formToken ?? session.answer?.formToken ?? null;
      const keyValue = session.publicKey ?? process.env.NEXT_PUBLIC_MCW_PUBLIC_KEY ?? null;

      if (!tokenValue || !keyValue) {
        throw new Error('No se pudo inicializar el formulario de pago.');
      }

      setFormToken(tokenValue);
      setPublicKey(keyValue);
    } catch (error: any) {
      setPayError(error?.message ?? 'Error al iniciar el pago.');
    } finally {
      setPayLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selectedPlan || step !== 2) {
      return;
    }

    if (formToken) {
      window.KR?.submit?.();
      return;
    }

    await initializePaymentForm();
  };

  useEffect(() => {
    if (!formToken || !publicKey) {
      return;
    }

    let cancelled = false;

    const attachForm = () => {
      if (cancelled) return;
      if (!window.KR) {
        setTimeout(attachForm, 200);
        return;
      }

      try {
        window.KR.setFormConfig({
          formToken,
          publicKey,
          'kr-language': 'es-ES',
          'kr-theme': 'classic',
          'kr-hide-debug-toolbar': 'true',
        });

        window.KR.attachForm('#plia-hosting-payment').catch((error: any) => {
          const message =
            error?.message ??
            error?.errorMessage ??
            'No se pudo cargar el formulario de pago.';
          setPayError(message);
        });

        window.KR.onError?.((error: any) => {
          const message =
            error?.detailedMessage ??
            error?.errorMessage ??
            error?.message ??
            'Error en el formulario de pago.';
          setPayError(message);
        });

        window.KR.onSubmit(async (paymentData: any) => {
          try {
            const confirmRes = await fetch(`${apiBase}/payments/izipay/confirm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                'kr-answer':
                  paymentData?.rawClientAnswer ??
                  paymentData?.clientAnswer ??
                  paymentData?.answer ??
                  paymentData,
                'kr-hash':
                  paymentData?.hash ??
                  paymentData?.signature ??
                  paymentData?.['kr-hash'] ??
                  '',
              }),
            });

            if (!confirmRes.ok) {
              const message = await confirmRes.text();
              throw new Error(message || 'No se pudo confirmar el pago.');
            }

            const confirmData = await confirmRes.json().catch(() => ({}));
            const redirectTo = confirmData?.redirectTo ?? '/dashboard/hosting';
            const setupToken = confirmData?.passwordSetupToken ?? '';
            const access = localStorage.getItem('access_token');

            if (setupToken) {
              localStorage.setItem('password_setup_token', setupToken);
            }

            if (access) {
              window.location.href = redirectTo;
            } else {
              const tokenParam = setupToken ? `token=${encodeURIComponent(setupToken)}` : '';
              const emailParam = email ? `email=${encodeURIComponent(email)}` : '';
              const query = [tokenParam, emailParam, 'status=success'].filter(Boolean).join('&');
              window.location.href = `/set-password${query ? `?${query}` : ''}`;
            }
          } catch (error: any) {
            setPayError(error?.message ?? 'No se pudo confirmar el pago.');
          }

          return false;
        });
      } catch {
        setPayError('No se pudo inicializar el formulario de pago.');
      }
    };

    attachForm();
    return () => {
      cancelled = true;
    };
  }, [email, formToken, publicKey]);

  const detailText =
    billingCycleMonths === 1
      ? `Pagas S/ ${total} hoy por 1 mes. Luego se mantiene en S/ ${regularMonthlyPrice}/mes.`
      : `Pagas S/ ${total} hoy por ${billingCycleMonths} meses. Precio regular: S/ ${regularTotal}. Renueva a S/ ${regularMonthlyPrice}/mes.`;

  return (
    <section className="bg-muted/30 py-10 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/plia-logo-black.svg"
            alt="PLIA"
            width={120}
            height={32}
            priority
            className="h-8 w-auto"
          />
          <span className="rounded-full bg-cta/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            Hosting Checkout
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <Card className="rounded-3xl border-border/70 shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Activa tu hosting PLIA</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compra tu plan, entra al dashboard y desde ahi podras crear sitios, subir tu web y administrar tu capacidad.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {plansError && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    {plansError}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  {plans.map((plan) => {
                    const active = plan.slug === selectedPlanSlug;
                    return (
                      <button
                        key={plan.slug}
                        type="button"
                        onClick={() => setSelectedPlanSlug(plan.slug)}
                        className={`rounded-[28px] border p-5 text-left transition-all ${
                          active
                            ? 'border-foreground bg-foreground text-primary-foreground shadow-lg'
                            : 'border-border bg-white shadow-sm hover:border-foreground/30'
                        }`}
                      >
                        <p className="text-lg font-bold">{plan.name}</p>
                        <p className={`mt-2 text-sm ${active ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {plan.description}
                        </p>
                        <p className={`mt-4 text-sm font-semibold ${active ? 'text-cta' : 'text-foreground'}`}>
                          Hasta {plan.maxSites} sitios
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedPlan && (
                  <>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Tiempo de contratacion
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-4">
                        {selectedPlan.termOptions.map((term) => {
                          const active = term === billingCycleMonths;
                          return (
                            <button
                              key={term}
                              type="button"
                              onClick={() => setBillingCycleMonths(term)}
                              className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                                active
                                  ? 'border-cta bg-cta/10'
                                  : 'border-border bg-white hover:bg-secondary/40'
                              }`}
                            >
                              <p className="text-sm font-semibold text-foreground">{term} {term === 1 ? 'mes' : 'meses'}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                S/ {selectedPlan.monthlyPricing[String(term)]}/mes
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre completo" />
                        {fieldErrors.fullName && <p className="text-xs text-destructive">{fieldErrors.fullName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Correo electronico</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
                        {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                        <select
                          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        >
                          {[
                            'Amazonas','Ancash','Apurimac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco',
                            'Huancavelica','Huanuco','Ica','Junin','La Libertad','Lambayeque','Lima','Loreto',
                            'Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martin','Tacna','Tumbes','Ucayali',
                          ].map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Direccion</label>
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Tu direccion de facturacion" />
                        {fieldErrors.address && <p className="text-xs text-destructive">{fieldErrors.address}</p>}
                      </div>
                    </div>

                    {step === 2 && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <button
                          type="button"
                          className={`h-28 rounded-2xl border px-4 py-4 text-left transition ${
                            paymentMethod === 'card'
                              ? 'border-cta bg-cta text-cta-foreground'
                              : 'border-border bg-white'
                          }`}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <p className="text-sm text-muted-foreground">Pago con</p>
                          <p className="text-lg font-semibold">Tarjeta</p>
                        </button>
                        <button
                          type="button"
                          disabled
                          className="h-28 rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 text-left text-muted-foreground"
                          onClick={() => setPaymentMethod('yape')}
                        >
                          <p className="text-sm text-muted-foreground">Pago con</p>
                          <p className="text-lg font-semibold">Yape (Próximamente)</p>
                        </button>
                      </div>
                    )}

                    {step === 2 && paymentMethod === 'card' && formToken && publicKey && (
                      <div className="rounded-3xl border border-border bg-white p-5">
                        <div id="plia-hosting-payment" className="plia-izipay">
                          <div
                            className="kr-embedded"
                            kr-form-token={formToken ?? undefined}
                            kr-public-key={publicKey ?? undefined}
                          >
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Numero de tarjeta</label>
                                <div className="kr-pan rounded-md border border-input px-3 py-2" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Fecha de vencimiento</label>
                                <div className="kr-expiry rounded-md border border-input px-3 py-2" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Codigo de seguridad</label>
                                <div className="kr-security-code rounded-md border border-input px-3 py-2" />
                              </div>
                            </div>
                            <div className="kr-form-error mt-3 text-sm text-destructive" />
                          </div>
                        </div>
                      </div>
                    )}

                    {payError && (
                      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                        {payError}
                      </div>
                    )}

                    <Button
                      variant="cta"
                      size="lg"
                      className="w-full"
                      disabled={plansLoading || payLoading || !selectedPlan}
                      onClick={step === 1 ? goToPaymentStep : handlePay}
                    >
                      {payLoading ? 'Procesando...' : step === 1 ? 'Continuar al pago' : 'Pagar y activar hosting'}
                    </Button>

                    {step === 2 && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => setStep(1)}
                      >
                        Volver a facturación
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border-border/70 shadow-card">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold">{selectedPlan?.name ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plazo</span>
                  <span className="font-semibold">{billingCycleMonths} {billingCycleMonths === 1 ? 'mes' : 'meses'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Costo mensual</span>
                  <span className="font-semibold">S/ {monthlyPrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total hoy</span>
                  <span className="font-semibold">S/ {total}</span>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                  {detailText}
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Incluye:</p>
                  <ul className="space-y-2">
                    {selectedPlan?.features.map((feature) => (
                      <li key={feature} className="rounded-xl bg-white px-3 py-2 text-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 shadow-card">
              <CardHeader>
                <CardTitle>Despues del pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>1. Se activa tu cuenta de hosting.</p>
                <p>2. Entras a tu dashboard de hosting PLIA.</p>
                <p>3. Creas tus sitios y subes tu web completa desde el panel.</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/web-hosting">Volver a hosting</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HostingCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Cargando checkout de hosting...</div>}>
      <Content />
    </Suspense>
  );
}
