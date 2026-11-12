'use client';

import { useState, useEffect } from 'react';

const SunIcon = () => (
  <svg
    className='h-5 w-5 text-yellow-400'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='12' cy='12' r='4.5' />
    <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' />
  </svg>
);

const MoonIcon = () => (
  <svg
    className='h-5 w-5 text-white'
    viewBox='0 0 24 24'
    fill='currentColor'
    stroke='#64748b'
    strokeWidth={1.5}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
  </svg>
);

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  // Aplicar modo guardado o preferencia del sistema al montar
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedMode !== null ? savedMode === 'true' : systemDark;

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${className}`}
      aria-label='Alternar modo claro y oscuro'
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
