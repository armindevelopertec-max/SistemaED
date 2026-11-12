'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Aplicar modo oscuro desde localStorage o preferencia del sistema
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedMode !== null ? savedMode === 'true' : systemDark;
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.inicioSesion(email, password);
      if (data.usuario.rol === 'ADMINISTRADOR') {
        router.push('/admin');
      } else {
        router.push('/visualizador');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-md'>
        <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center tracking-tight'>
          SMIA
        </h1>

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Correo electrónico
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:text-gray-200'
              placeholder=''
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Contraseña
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:text-gray-200'
              placeholder='••••••••'
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 font-medium text-lg'
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className='mt-6 flex items-center justify-center'>
          <ThemeToggle className='text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' />
        </div>

        <p className='text-center text-gray-500 dark:text-gray-400 text-sm mt-6'>
          Versión 1.0.0
        </p>
      </div>
    </div>
  );
}