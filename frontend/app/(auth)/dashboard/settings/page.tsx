'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Necesitas iniciar sesion.');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(data?.message || 'No se pudo cargar la configuracion');
        setUser(data);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar configuracion');
      }
    };

    load();
  }, []);

  if (error) {
    return (
      <div className="section-container py-16">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="section-container py-10 space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Configuracion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="text-muted-foreground">Cuenta:</span> {user?.email || '-'}</div>
          <div><span className="text-muted-foreground">Seguridad:</span> 2FA habilitado segun riesgo</div>
          <div><span className="text-muted-foreground">Soporte:</span> help@plia.pe</div>
        </CardContent>
      </Card>
    </div>
  );
}
