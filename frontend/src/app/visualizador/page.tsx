'use client';

import { useState } from 'react';
import { tramitesService } from '@/lib/api';
import { Tramite } from '@/types';

export default function VisualizadorPage() {
  const [searchTipo, setSearchTipo] = useState<'hojaRuta' | 'codigoRai'>('hojaRuta');
  const [searchValue, setSearchValue] = useState('');
  const [tramite, setTramite] = useState<Tramite | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setError('');
    setTramite(null);

    try {
      const params: any = {};
      params[searchTipo] = searchValue;
      const { data } = await tramitesService.search(params);
      setTramite(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Trámite no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      VIGENTE: 'bg-green-100 text-green-800',
      POR_VENCER: 'bg-yellow-100 text-yellow-800',
      VENCIDO: 'bg-red-100 text-red-800',
      PENDIENTE: 'bg-gray-100 text-gray-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Búsqueda de Trámites</h1>

      <form onSubmit={handleSearch} className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <select
            value={searchTipo}
            onChange={(e) => setSearchTipo(e.target.value as any)}
            className="border p-2 sm:p-3 rounded-lg w-full"
          >
            <option value="hojaRuta">Hoja de Ruta</option>
            <option value="codigoRai">Código RAI</option>
          </select>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Ingrese ${searchTipo === 'hojaRuta' ? 'Hoja de Ruta' : 'Código RAI'}...`}
              className="flex-1 border p-2 sm:p-3 rounded-lg w-full"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-700"
            >
              {loading ? '...' : 'Buscar'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {tramite && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">{tramite.nombreTramite}</h2>
            <span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(tramite.estado)}`}>
              {tramite.estado}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Hoja de Ruta</p>
              <p className="font-medium">{tramite.hojaRuta}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Código RAI</p>
              <p className="font-medium">{tramite.codigoRai}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Solicitante</p>
              <p className="font-medium">{tramite.nombreSolicitante}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
              <p className="font-medium">
                {new Date(tramite.fechaVencimiento).toLocaleDateString('es-ES')}
              </p>
            </div>
            {tramite.descripcion && (
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="break-words">{tramite.descripcion}</p>
              </div>
            )}
            {tramite.observaciones && (
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Observaciones</p>
                <p className="break-words">{tramite.observaciones}</p>
              </div>
            )}
          </div>

          {tramite.documentos && tramite.documentos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Documentos Adjuntos</h3>
              <div className="space-y-2">
                {tramite.documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {(doc.tamano / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <a
                      href={`/minio/url/${encodeURIComponent(doc.rutaMinio)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-sm"
                    >
                      Ver
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}