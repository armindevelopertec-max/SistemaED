'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, expedienteService } from '@/lib/api';
import { UnidadIndustrial } from '@/types';

export default function VisualizadorExpedientePage() {
  const [unidades, setUnidades] = useState<UnidadIndustrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUnidades();
  }, []);

  const fetchUnidades = async () => {
    try {
      setLoading(true);
      const { data } = await expedienteService.listarUnidadesIndustriales();
      setUnidades(data);
    } catch (err: any) {
      setError('Error al cargar unidades industriales');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Expedientes</h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Código RAI</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Razón Social</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {unidades.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay unidades industriales registradas
                </td>
              </tr>
            ) : (
              unidades.map((unidad) => (
                <tr key={unidad.id} className="hover:bg-gray-50 dark:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">{unidad.codigoRai}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{unidad.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{unidad.razonSocial}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      unidad.estado === 'VIGENTE' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                    }`}>
                      {unidad.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/visualizador/expediente/${unidad.id}`} className="text-indigo-600 hover:text-indigo-800">
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
