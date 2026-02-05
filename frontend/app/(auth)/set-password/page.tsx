'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  const submit = async () => {
    setResult(null);

    if (!token) {
      setResult('Token invalido.');
      return;
    }

    if (!password || password !== confirm) {
      setResult('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        setResult('No se pudo actualizar la contrasena.');
      } else {
        setResult('Contrasena actualizada. Ya puedes iniciar sesion.');
      }
    } catch (err) {
      setResult('Error de conexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 520 }}>
      <h1>Configurar contrasena</h1>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>
          Nueva contrasena
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, border: '1px solid #ddd' }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>
          Confirmar contrasena
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{ width: '100%', padding: 10, border: '1px solid #ddd' }}
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        style={{ marginTop: 16 }}
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>

      {result && (
        <p style={{ marginTop: 16 }}>
          {result}
        </p>
      )}
    </div>
  );
}
