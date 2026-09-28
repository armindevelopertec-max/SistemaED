'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api';
import { User } from '@/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = authService.getUser();
    if (!userData) {
      router.push('/login');
      return;
    }
    if (userData.role !== 'ADMINISTRADOR') {
      router.push('/visualizador');
      return;
    }
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (!user) return null;

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/tramites', label: 'Trámites', icon: '📋' },
    { href: '/admin/users', label: 'Usuarios', icon: '👥' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-gray-900 text-white flex flex-col fixed md:static inset-0 z-50`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">SMIA Admin</h1>
            <p className="text-sm text-gray-400 truncate">{user.nombre}</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span>🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
        <span className="font-bold">SMIA Admin</span>
        <button onClick={() => setMobileMenuOpen(true)} className="text-2xl">
          ☰
        </button>
      </div>

      <main className="flex-1 bg-gray-100 p-4 md:p-8 min-h-screen">{children}</main>
    </div>
  );
}