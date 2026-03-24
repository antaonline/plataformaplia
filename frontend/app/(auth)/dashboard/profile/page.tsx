'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setDeleteError('Tu sesion ya no es valida.');
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${apiBase}/users/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(data?.message || 'No se pudo eliminar la cuenta');
      }

      localStorage.removeItem('access_token');
      setDeleteOpen(false);
      router.replace('/login');
    } catch (err: any) {
      setDeleteError(err.message ?? 'No se pudo eliminar la cuenta');
    } finally {
      setDeleting(false);
    }
  };

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
          <CardTitle>Tu perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="text-muted-foreground">Nombre:</span> {user?.name || '-'}</div>
          <div><span className="text-muted-foreground">Correo:</span> {user?.email || '-'}</div>
          <div><span className="text-muted-foreground">Rol:</span> {user?.role || '-'}</div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zona peligrosa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Si eliminas tu cuenta, se borraran tus proyectos, ordenes, pagos, renovaciones y
            sitios asociados a esta cuenta.
          </p>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Eliminar mi cuenta
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cuenta definitivamente</DialogTitle>
            <DialogDescription>
              Esta accion borrara tu cuenta, proyectos, ordenes, pagos, renovaciones y sitios
              asociados. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p className="text-sm text-destructive">{deleteError}</p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Si, eliminar todo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
