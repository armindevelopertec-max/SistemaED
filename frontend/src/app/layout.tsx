import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SMIA - Sistema de Gestión de Trámites',
  description: 'Sistema de Gestión de Trámites y Certificados',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}