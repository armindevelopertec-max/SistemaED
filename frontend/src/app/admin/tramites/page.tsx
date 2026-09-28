'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { tramitesService, minioService } from '@/lib/api';
import { Tramite, CreateTramiteDto } from '@/types';

export default function TramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [formData, setFormData] = useState<CreateTramiteDto>({
    hojaRuta: '',
    codigoRai: '',
    nombreTramite: '',
    nombreSolicitante: '',
    descripcion: '',
    fechaVencimiento: '',
    observaciones: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const loadTramites = useCallback(async () => {
    const params: any = {};
    if (search) params.search = search;
    if (filterEstado) params.estado = filterEstado;
    const { data } = await tramitesService.getAll(params);
    setTramites(data);
  }, [search, filterEstado]);

  useEffect(() => {
    loadTramites();
  }, [loadTramites]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      files.forEach((file) => data.append('documentos', file));

      await tramitesService.create(data);
      setShowForm(false);
      setFormData({
        hojaRuta: '',
        codigoRai: '',
        nombreTramite: '',
        nombreSolicitante: '',
        descripcion: '',
        fechaVencimiento: '',
        observaciones: '',
      });
      setFiles([]);
      loadTramites();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear trámite');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Trámites</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 w-full sm:w-auto"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Trámite'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo Trámite</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                placeholder="Hoja de Ruta"
                value={formData.hojaRuta}
                onChange={(e) => setFormData({ ...formData, hojaRuta: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full"
                required
              />
              <input
                placeholder="Código RAI"
                value={formData.codigoRai}
                onChange={(e) => setFormData({ ...formData, codigoRai: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full"
                required
              />
              <input
                placeholder="Nombre del Trámite"
                value={formData.nombreTramite}
                onChange={(e) => setFormData({ ...formData, nombreTramite: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full"
                required
              />
              <input
                placeholder="Nombre del Solicitante"
                value={formData.nombreSolicitante}
                onChange={(e) => setFormData({ ...formData, nombreSolicitante: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full"
                required
              />
              <input
                type="date"
                placeholder="Fecha de Vencimiento"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full"
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full sm:col-span-2"
              />
            </div>

            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 p-4 rounded-lg cursor-pointer hover:border-primary-500"
            >
              <input {...getInputProps()} />
              <p className="text-center text-gray-500 text-sm">
                Arrastra archivos aquí o haz clic para seleccionar (PDF, imágenes)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 ml-2">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 w-full"
            >
              {loading ? 'Guardando...' : 'Guardar Trámite'}
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border p-2 sm:p-3 rounded-lg w-full"
        />
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="border p-2 sm:p-3 rounded-lg w-full sm:w-auto"
        >
          <option value="">Todos</option>
          <option value="VIGENTE">Vigente</option>
          <option value="POR_VENCER">Por Vencer</option>
          <option value="VENCIDO">Vencido</option>
          <option value="PENDIENTE">Pendiente</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Hoja de Ruta</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Código RAI</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Trámite</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Solicitante</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Vencimiento</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Estado</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tramites.map((tramite) => (
              <tr key={tramite.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">{tramite.hojaRuta}</td>
                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">{tramite.codigoRai}</td>
                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm truncate max-w-[100px]">{tramite.nombreTramite}</td>
                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm truncate max-w-[100px]">{tramite.nombreSolicitante}</td>
                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                  {new Date(tramite.fechaVencimiento).toLocaleDateString('es-ES')}
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(tramite.estado)}`}>
                    {tramite.estado}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <a
                    href={`/admin/tramites/${tramite.id}`}
                    className="text-primary-600 hover:underline text-xs sm:text-sm"
                  >
                    Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tramites.length === 0 && (
          <p className="p-4 sm:p-8 text-center text-gray-500">No hay trámites registrados</p>
        )}
      </div>
    </div>
  );
}