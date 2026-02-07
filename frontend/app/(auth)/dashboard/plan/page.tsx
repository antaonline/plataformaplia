'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

export default function PlanPage() {
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Necesitas iniciar sesion.');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/projects/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(data?.message || 'No se pudo cargar el plan');
        setProject(data);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar plan');
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
          <CardTitle>Mi plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="text-muted-foreground">Plan:</span> {project?.order?.plan?.name || project?.type || '-'}</div>
          <div><span className="text-muted-foreground">Entrega estimada:</span> {project?.type === 'LANDING' ? '48 horas' : '5-7 dias habiles'}</div>
          <div><span className="text-muted-foreground">Estado:</span> {project?.status || '-'}</div>
        </CardContent>
      </Card>
    </div>
  );
}
