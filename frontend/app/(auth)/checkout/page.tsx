'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

type Plan = {
  id: number;
  name: string;
  description?: string;
  price: number;
  hostingYear?: boolean;
};

type DomainResult = {
  domain: string;
  available: boolean;
  price: number;
  currency: string;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planParam = (searchParams.get('plan') ?? '').toLowerCase();

  const [step, setStep] = useState<1 | 2>(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [planParamInvalid, setPlanParamInvalid] = useState(false);

  const [domainQuery, setDomainQuery] = useState('');
  const [domainResults, setDomainResults] = useState<DomainResult[]>([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<DomainResult | null>(null);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Lima');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payResult, setPayResult] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function loadPlans() {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const res = await fetch(`${apiBase}/public/plans`);
        if (!res.ok) throw new Error('No se pudieron cargar los planes');
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : data;
        if (mounted) setPlans(list);
      } catch (err: any) {
        if (mounted) setPlansError(err.message ?? 'Error al cargar planes');
      } finally {
        if (mounted) setPlansLoading(false);
      }
    }
    loadPlans();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (email) {
      localStorage.setItem('checkout_email', email);
    }
  }, [email]);

  useEffect(() => {
    if (!plans.length) return;

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

    const param = normalize(planParam);
    let match: Plan | undefined;

    if (param === 'landing') {
      match = plans.find((p) => normalize(p.name).includes('landing'));
    } else if (param === 'web') {
      match = plans.find((p) => {
        const n = normalize(p.name);
        return n.includes('web') || n.includes('institucional');
      });
    }

    if (match) {
      setSelectedPlanId(match.id);
      setPlanParamInvalid(false);
    } else if (planParam) {
      setPlanParamInvalid(true);
      setSelectedPlanId(null);
    }
  }, [planParam, plans]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const total = Number(selectedPlan?.price ?? 0) + Number(selectedDomain?.price ?? 0);
  const basePrice = total > 0 ? Math.round((total / 1.18) * 100) / 100 : 0;
  const taxes = total > 0 ? Math.round((total - basePrice) * 100) / 100 : 0;

  const searchDomain = async () => {
    const query = domainQuery.trim();
    if (!query) return;
    setDomainLoading(true);
    setDomainError(null);
    setDomainResults([]);
    setSelectedDomain(null);

    try {
      const res = await fetch(`${apiBase}/domains/check?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('No se pudo consultar dominios');
      const data = await res.json();
      setDomainResults(data.results ?? []);
    } catch (err: any) {
      setDomainError(err.message ?? 'Error consultando dominios');
    } finally {
      setDomainLoading(false);
    }
  };

  const goToStep2 = () => {
    if (!selectedPlanId) return;
    setStep(2);
  };

  const handlePay = async () => {
    if (!selectedPlanId || !email) return;
    if (!validateCheckout()) return;
    setPayLoading(true);
    setPayError(null);
    setPayResult(null);

    try {
      const prepareRes = await fetch(`${apiBase}/checkout/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          email,
          domain: selectedDomain?.domain,
        }),
      });

      if (!prepareRes.ok) {
        throw new Error('No se pudo preparar el checkout');
      }

      const prepared = await prepareRes.json();
      const orderId = prepared.orderId;

      const payRes = await fetch(`${apiBase}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: String(orderId) }),
      });

      if (!payRes.ok) {
        throw new Error('No se pudo iniciar el pago');
      }

      const payData = await payRes.json();
      setPayResult(payData);
    } catch (err: any) {
      setPayError(err.message ?? 'Error en el pago');
    } finally {
      setPayLoading(false);
    }
  };

  const onlyDigits = (value: string) => value.replace(/\D/g, '');

  const formatCardNumber = (value: string) => {
    const digits = onlyDigits(value).slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = onlyDigits(value).slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const getCardType = (value: string) => {
    const digits = onlyDigits(value);
    if (/^4/.test(digits)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    return 'unknown';
  };

  const isValidLuhn = (value: string) => {
    const digits = onlyDigits(value);
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
      let digit = Number(digits[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return digits.length >= 13 && sum % 10 === 0;
  };

  const isValidExpiry = (value: string) => {
    const digits = onlyDigits(value);
    if (digits.length !== 4) return false;
    const month = Number(digits.slice(0, 2));
    const year = Number(digits.slice(2));
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const currentYear = Number(String(now.getFullYear()).slice(2));
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  };

  const isValidCvv = (value: string) => {
    const digits = onlyDigits(value);
    return digits.length === 3 || digits.length === 4;
  };

  const validateCheckout = () => {
    const errors: Record<string, string> = {};
    if (!isValidLuhn(cardNumber)) errors.cardNumber = 'Numero de tarjeta invalido.';
    if (!isValidExpiry(cardExpiry)) errors.cardExpiry = 'Fecha de vencimiento invalida.';
    if (!isValidCvv(cardCvv)) errors.cardCvv = 'CVV invalido.';
    if (!fullName.trim()) errors.fullName = 'Nombre completo requerido.';
    if (!address.trim()) errors.address = 'Direccion requerida.';
    if (!email.trim()) errors.email = 'Correo requerido.';

    setFieldErrors(errors);
    setCardError(Object.keys(errors).length ? 'Revisa los campos marcados.' : null);
    return Object.keys(errors).length === 0;
  };

  return (
    <section className="bg-muted/30 py-10 md:py-16">
      <div className="section-container w-full max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cta rounded-xl flex items-center justify-center">
            <span className="font-black text-cta-foreground text-xl">P</span>
          </div>
          <span className="font-bold text-2xl text-foreground">PLIA</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {step === 1 ? 'Tu carrito' : 'Checkout'}
          </h1>
          <div className="text-sm font-medium text-muted-foreground">
            Paso {step} de 2
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          {step === 1
            ? 'Configura tu plan y asegura tu dominio antes de pagar.'
            : 'Un ultimo paso: ingresa tus datos y activa tu servicio ahora!'}
        </p>

        {plansError && (
          <div className="mt-4 text-sm text-destructive">{plansError}</div>
        )}

        {planParamInvalid && (
          <div className="mt-4 text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded-lg p-3">
            El parametro de plan es invalido. Selecciona un plan para continuar.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <>
                <Card className="rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Plan seleccionado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="text-lg font-semibold">
                          {selectedPlan ? selectedPlan.name : 'Selecciona un plan'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Periodicidad</p>
                        <p className="text-lg font-semibold">
                          {selectedPlan?.hostingYear ? 'Anual' : 'Mensual'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedPlan?.hostingYear
                            ? 'Pago único por desarrollo + hosting gratis 1 año. Renueva solo el Hosting pasado el año'
                            : 'Pago mensual, puedes cancelar cuando desees.'}
                        </p>
                      </div>
                    </div>

                    {(planParamInvalid || !planParam) && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Selecciona un plan</p>
                        <select
                          className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                          value={selectedPlanId ?? ''}
                          onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                        >
                          <option value="" disabled>
                            Selecciona un plan
                          </option>
                          {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Asegura tu dominio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Busca un dominio disponible y agregalo a tu pedido.
                    </p>

                    <div className="flex flex-col md:flex-row gap-3">
                      <Input
                        placeholder="tudominio.com"
                        value={domainQuery}
                        onChange={(e) => setDomainQuery(e.target.value)}
                      />
                      <Button variant="cta" onClick={searchDomain} disabled={domainLoading}>
                        {domainLoading ? 'Buscando...' : 'Buscar'}
                      </Button>
                    </div>

                    {domainError && (
                      <p className="text-sm text-destructive">{domainError}</p>
                    )}

                    <div className="space-y-3">
                      {domainResults.map((result) => (
                        <div
                          key={result.domain}
                          className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                        >
                          <div>
                            <p className="font-medium">{result.domain}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.available ? 'Disponible' : 'No disponible'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">
                              {result.currency} {result.price}
                            </span>
                            <Button
                              variant="cta"
                              size="sm"
                              disabled={!result.available}
                              onClick={() => setSelectedDomain(result)}
                            >
                              Agregar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 2 && (
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Forma de pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Numero de tarjeta</label>
                    <div className="relative">
                      <Input
                        placeholder="1234 1234 1234 1234"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-muted-foreground">
                        {(() => {
                          const type = getCardType(cardNumber);
                          return (
                            <>
                              <span className={`px-2 py-1 rounded-md border ${type === 'visa' ? 'border-cta text-cta' : 'border-border'} bg-muted`}>VISA</span>
                              <span className={`px-2 py-1 rounded-md border ${type === 'mastercard' ? 'border-cta text-cta' : 'border-border'} bg-muted`}>MC</span>
                              <span className={`px-2 py-1 rounded-md border ${type === 'amex' ? 'border-cta text-cta' : 'border-border'} bg-muted`}>AMEX</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    {fieldErrors.cardNumber && (
                      <p className="text-xs text-destructive">{fieldErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Fecha de vencimiento</label>
                      <Input
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      />
                      {fieldErrors.cardExpiry && (
                        <p className="text-xs text-destructive">{fieldErrors.cardExpiry}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Codigo de seguridad (CVV)</label>
                      <Input
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(onlyDigits(e.target.value).slice(0, 4))}
                      />
                      {fieldErrors.cardCvv && (
                        <p className="text-xs text-destructive">{fieldErrors.cardCvv}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Direccion de facturacion</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
                        <Input
                          placeholder="Tu nombre completo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                        {fieldErrors.fullName && (
                          <p className="text-xs text-destructive">{fieldErrors.fullName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Seleccionar departamento</label>
                        <select
                          className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        >
                          {[
                            'Amazonas','Ancash','Apurimac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco',
                            'Huancavelica','Huanuco','Ica','Junin','La Libertad','Lambayeque','Lima','Loreto',
                            'Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martin','Tacna','Tumbes','Ucayali'
                          ].map((dep) => (
                            <option key={dep} value={dep}>{dep}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Direccion</label>
                        <Input
                          placeholder="Primera linea de la direccion"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        {fieldErrors.address && (
                          <p className="text-xs text-destructive">{fieldErrors.address}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Correo electronico</label>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {fieldErrors.email && (
                          <p className="text-xs text-destructive">{fieldErrors.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {cardError && <p className="text-sm text-destructive">{cardError}</p>}
                  {payError && <p className="text-sm text-destructive">{payError}</p>}

                  <Button
                    variant="cta"
                    size="lg"
                    className="w-full"
                    disabled={
                      payLoading ||
                      !selectedPlanId ||
                      !email ||
                      !fullName.trim() ||
                      !address.trim() ||
                      !cardNumber ||
                      !cardExpiry ||
                      !cardCvv ||
                      !!Object.keys(fieldErrors).length
                    }
                    onClick={handlePay}
                  >
                    {payLoading ? 'Procesando...' : 'Suscribirte'}
                  </Button>

                  {payResult && (
                    <div className="text-sm text-muted-foreground">
                      Sesion de pago creada correctamente.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-semibold">
                    {selectedPlan ? selectedPlan.name : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Precio</span>
                  <span className="text-sm font-semibold">
                    S/ {basePrice.toFixed(2)}
                  </span>
                </div>

                {selectedDomain && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dominio</span>
                    <span className="text-sm font-semibold">
                      {selectedDomain.currency} {selectedDomain.price}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Impuestos (18%)</span>
                  <span className="text-sm font-semibold">S/ {taxes.toFixed(2)}</span>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-base font-semibold">S/ {total.toFixed(2)}</span>
                </div>

                {step === 1 && (
                  <Button
                    variant="cta"
                    size="lg"
                    className="w-full"
                    disabled={!selectedPlanId || plansLoading}
                    onClick={goToStep2}
                  >
                    Continuar
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Volver
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Garantia de reembolso de 30 dias.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
