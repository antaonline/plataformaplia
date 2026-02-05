'use client';

import { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState(1);
  const [orderId, setOrderId] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  const plans = [
    { id: 1, name: 'LANDING', price: 390 },
    { id: 2, name: 'WEB INSTITUCIONAL', price: 690 },
  ];

  const pay = async () => {
    setLoading(true);
    setResult(null);

    try {
      const orderRes = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          email,
        }),
      });

      if (!orderRes.ok) {
        throw new Error('No se pudo crear la orden');
      }

      const order = await orderRes.json();
      setOrderId(order.id);

      const res = await fetch(`${apiUrl}/api/payments/mock-pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ status: 'ERROR' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 560 }}>
      <h1>Checkout</h1>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, border: '1px solid #ddd' }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Plan</label>
        <select
          value={planId}
          onChange={(e) => setPlanId(Number(e.target.value))}
          style={{ width: '100%', padding: 10, border: '1px solid #ddd' }}
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - S/ {plan.price}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={pay}
        disabled={loading || !email}
        style={{ marginTop: 16 }}
      >
        {loading ? 'Procesando...' : 'Pagar'}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          {result.status === 'APPROVED' && (
            <p style={{ color: 'green' }}>
              OK: Pago aprobado - {result.transactionId}
            </p>
          )}

          {result.status === 'DECLINED' && (
            <p style={{ color: 'red' }}>
              Error: Pago rechazado
            </p>
          )}

          {result.status === 'ERROR' && (
            <p style={{ color: 'orange' }}>
              Error de conexion
            </p>
          )}
        </div>
      )}

      {orderId && (
        <p style={{ marginTop: 10, color: '#555' }}>
          Orden creada: #{orderId}
        </p>
      )}
    </div>
  );
}
