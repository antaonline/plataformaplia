'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

export default function ProfilePage() {
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
        if (!res.ok) throw new Error(data?.message || 'No se pudo cargar el perfil');
        setUser(data);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar perfil');
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
    <div className="section-container py-10">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Tu perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="text-muted-foreground">Nombre:</span> {user?.name || '-'}</div>
          <div><span className="text-muted-foreground">Correo:</span> {user?.email || '-'}</div>
          <div><span className="text-muted-foreground">Rol:</span> {user?.role || '-'}</div>
        </CardContent>
      </Card>
    </div>
  );
}
