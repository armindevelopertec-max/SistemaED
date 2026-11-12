'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import { Usuario } from '@/types';
import ThemeToggle from '@/components/ThemeToggle';

export default function VisualizadorLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = authService.obtenerUsuario();
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    authService.cerrarSesion();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">SMIA - Trámites</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{user.nombre}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" />
            <button
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ml-2 text-sm sm:text-base"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">{children}</main>
    </div>
  );
}
