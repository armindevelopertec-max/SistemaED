'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { expedienteService, reportesService } from '@/lib/api';
import { UnidadIndustrial } from '@/types';

interface ReporteUnidades {
  total: number;
  porCategoria: { categoria: number; cantidad: number }[];
  porEstado: { estado: string; cantidad: number }[];
  porFase: { fase: string; cantidad: number }[];
}

interface ReporteRAI {
  totalUnidades: number;
  conRAI: number;
  sinRAI: number;
  totalRegistrosIniciales: number;
  totalHistoriales: number;
}

interface ReporteIRAP {
  categoria3: { estado: string; cantidad: number }[];
  categoria12: { estado: string; cantidad: number }[];
}

interface ReporteIAA {
  total: number;
  porGestion: { gestion: number; cantidad: number }[];
}

export default function AdminDashboard() {
  const [reporteUnidades, setReporteUnidades] = useState<ReporteUnidades | null>(null);
  const [reporteRAI, setReporteRAI] = useState<ReporteRAI | null>(null);
  const [reporteIRAP, setReporteIRAP] = useState<ReporteIRAP | null>(null);
  const [reporteIAA, setReporteIAA] = useState<ReporteIAA | null>(null);
  const [unidades, setUnidades] = useState<UnidadIndustrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ru, rai, irap, iaa, uni] = await Promise.all([
          reportesService.obtenerUnidadesIndustriales(),
          reportesService.obtenerRAI(),
          reportesService.obtenerIRAP(),
          reportesService.obtenerIAA(),
          expedienteService.listarUnidadesIndustriales(),
        ]);
        setReporteUnidades(ru.data);
        setReporteRAI(rai.data);
        setReporteIRAP(irap.data);
        setReporteIAA(iaa.data);
        setUnidades(uni.data);
      } catch (err: any) {
        setError('Error al cargar la información del dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalIRAP3 = reporteIRAP?.categoria3.reduce((a, c) => a + c.cantidad, 0) ?? 0;
  const totalIRAP12 = reporteIRAP?.categoria12.reduce((a, c) => a + c.cantidad, 0) ?? 0;

  const kpis = [
    {
      label: 'Unidades Industriales',
      value: reporteUnidades?.total ?? 0,
      sub: `${reporteRAI?.conRAI ?? 0} con RAI registrado`,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1" />
        </svg>
      ),
      color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'IRAP Categoría 3',
      value: totalIRAP3,
      sub: `${reporteIRAP?.categoria3.find((c) => c.estado === 'APROBADO')?.cantidad ?? 0} aprobados`,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'IRAP Categoría 1-2',
      value: totalIRAP12,
      sub: `${reporteIRAP?.categoria12.find((c) => c.estado === 'APROBADO')?.cantidad ?? 0} aprobados`,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Informes Ambientales',
      value: reporteIAA?.total ?? 0,
      sub: `${reporteIAA?.porGestion.length ?? 0} gestionas registradas`,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
    },
  ];

  const maxCategoria = Math.max(...(reporteUnidades?.porCategoria.map((c) => c.cantidad) ?? [1]), 1);
  const maxGestion = Math.max(...(reporteIAA?.porGestion.map((g) => g.cantidad) ?? [1]), 1);

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, { class: string; label: string }> = {
      VIGENTE: { class: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800', label: 'VIGENTE' },
      INACTIVO: { class: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800', label: 'INACTIVO' },
      PENDIENTE: { class: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800', label: 'PENDIENTE' },
    };
    const style = styles[estado] || { class: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700', label: estado };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.class}`}>{style.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Resumen general del sistema de gestión ambiental</p>
        </div>
        <Link
          href="/admin/expediente"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          <span className="text-lg">+</span> Nueva Unidad
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                {loading ? (
                  <div className="h-9 w-16 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{kpi.value}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.sub}</p>
              </div>
              <div className={`p-3 rounded-xl shrink-0 ${kpi.color}`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Unidades por Categoría</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (reporteUnidades?.porCategoria.length ?? 0) === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">Sin datos disponibles</p>
          ) : (
            <div className="space-y-4">
              {reporteUnidades?.porCategoria.map((c) => (
                <div key={c.categoria}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Categoría {c.categoria}</span>
                    <span className="text-gray-500 dark:text-gray-400">{c.cantidad}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${(c.cantidad / maxCategoria) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Por estado de registro</h3>
            <div className="flex flex-wrap gap-2">
              {(reporteUnidades?.porEstado ?? []).map((e) => (
                <div key={e.estado} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{e.estado}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{e.cantidad}</span>
                </div>
              ))}
              {(reporteUnidades?.porEstado ?? []).length === 0 && !loading && (
                <span className="text-sm text-gray-500 dark:text-gray-400">Sin datos</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Informes Ambientales por Gestión</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (reporteIAA?.porGestion.length ?? 0) === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">Sin datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {reporteIAA?.porGestion.map((g) => (
                <div key={g.gestion} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 shrink-0">{g.gestion}</span>
                  <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-purple-600 dark:bg-purple-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((g.cantidad / maxGestion) * 100, 12)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{g.cantidad}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registros RAI</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{reporteRAI?.totalRegistrosIniciales ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Historiales</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{reporteRAI?.totalHistoriales ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sin RAI</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{reporteRAI?.sinRAI ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de unidades recientes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Unidades Industriales</h2>
          <Link href="/admin/expediente" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 font-medium">
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código RAI</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Razón Social</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-3 text-gray-500 dark:text-gray-400">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Cargando...
                    </div>
                  </td>
                </tr>
              ) : unidades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    No hay unidades industriales registradas
                  </td>
                </tr>
              ) : (
                unidades.slice(0, 10).map((unidad) => (
                  <tr key={unidad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {unidad.codigoRai}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {unidad.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {unidad.razonSocial}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(unidad.estado || 'VIGENTE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-4">
                      <Link href={`/admin/expediente/${unidad.id}`} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
