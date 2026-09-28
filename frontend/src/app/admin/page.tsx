'use client';

import { useEffect, useState } from 'react';
import { tramitesService } from '@/lib/api';
import { TramiteStats } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<TramiteStats | null>(null);

  useEffect(() => {
    tramitesService.getStats().then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div>Cargando...</div>;

  const cards = [
    { label: 'Total', value: stats.total, color: 'bg-blue-500' },
    { label: 'Vigentes', value: stats.vigentes, color: 'bg-green-500' },
    { label: 'Por Vencer', value: stats.porVencer, color: 'bg-yellow-500' },
    { label: 'Vencidos', value: stats.vencidos, color: 'bg-red-500' },
    { label: 'Pendientes', value: stats.pendientes, color: 'bg-gray-500' },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} text-white p-3 sm:p-6 rounded-lg shadow`}
          >
            <p className="text-xs sm:text-sm opacity-80">{card.label}</p>
            <p className="text-xl sm:text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <a
              href="/admin/tramites"
              className="block p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
            >
              + Nuevo Trámite
            </a>
            <a
              href="/admin/users"
              className="block p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
            >
              + Nuevo Usuario
            </a>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Estado General</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Vigencia</span>
              <span className="font-semibold text-green-600">
                {stats.total > 0 ? ((stats.vigentes / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${stats.total > 0 ? (stats.vigentes / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}