'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api';
import { Usuario } from '@/types';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = authService.obtenerUsuario();
    if (!userData) {
      router.push('/login');
      return;
    }
    if (userData.rol !== 'ADMINISTRADOR') {
      router.push('/visualizador');
      return;
    }
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    authService.cerrarSesion();
    router.push('/login');
  };

  if (!user) return null;

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/expediente', label: 'Expediente', icon: '📁' },
    { href: '/admin/users', label: 'Usuarios', icon: '👥' },
  ];

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col fixed md:static inset-0 z-50 border-r border-gray-200 dark:border-gray-800`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">SMIA Admin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.nombre}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-gray-900 dark:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span>🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="md:hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
        <span className="font-bold">SMIA Admin</span>
        <button onClick={() => setMobileMenuOpen(true)} className="text-2xl">
          ☰
        </button>
      </div>

      <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 md:p-8 min-h-screen">{children}</main>
    </div>
  );
}
