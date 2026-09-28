'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api';
import { User } from '@/types';

export default function VisualizadorLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = authService.getUser();
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white p-3 sm:p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">SMIA - Trámites</h1>
            <p className="text-xs sm:text-sm text-gray-400 truncate">{user.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white ml-2 text-sm sm:text-base"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="flex-1 bg-gray-100 p-4 sm:p-8">{children}</main>
    </div>
  );
}