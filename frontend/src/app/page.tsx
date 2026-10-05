'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { authService } from '@/lib/api';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuario = authService.obtenerUsuario();
    setUser(usuario);
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!user) {
    redirect('/login');
  }

  if (user.rol === 'ADMINISTRADOR') {
    redirect('/admin/expediente');
  }

  redirect('/visualizador');
}
