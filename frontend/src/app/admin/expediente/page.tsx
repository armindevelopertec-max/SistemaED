'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, expedienteService } from '@/lib/api';
import { UnidadIndustrial } from '@/types';

interface FormData {
  codigoRai: string;
  nombre: string;
  razonSocial: string;
  direccion: string;
  distrito: string;
  email: string;
  representanteNombre: string;
  representanteCi: string;
  representanteTelefono: string;
}

export default function ExpedientePage() {
  const [unidades, setUnidades] = useState<UnidadIndustrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadIndustrial | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState<{id: number, nombre: string} | null>(null);

  useEffect(() => {
    const usuario = authService.obtenerUsuario();
    if (usuario) {
      setUserRole(usuario.rol || '');
    }
    fetchUnidades();
  }, []);

  const [formData, setFormData] = useState<FormData>({
    codigoRai: '',
    nombre: '',
    razonSocial: '',
    direccion: '',
    distrito: '',
    email: '',
    representanteNombre: '',
    representanteCi: '',
    representanteTelefono: '',
  });

  const fetchUnidades = async (buscar?: string) => {
    try {
      setLoading(true);
      const { data } = await expedienteService.listarUnidadesIndustriales({ buscar });
      setUnidades(data);
    } catch (err: any) {
      setError('Error al cargar unidades industriales');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUnidades(search);
  };

  const openEditModal = async (unidad: UnidadIndustrial) => {
    setSelectedUnidad(unidad);
    setFormData({
      codigoRai: unidad.codigoRai || '',
      nombre: unidad.nombre || '',
      razonSocial: unidad.razonSocial || '',
      direccion: unidad.direccion || '',
      distrito: unidad.distrito?.toString() || '',
      email: unidad.email || '',
      representanteNombre: unidad.representanteLegal?.nombre || '',
      representanteCi: unidad.representanteLegal?.ci || '',
      representanteTelefono: unidad.representanteLegal?.telefono || '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnidad) return;

    setEditLoading(true);
    setEditError('');

    try {
      await expedienteService.actualizarUnidadIndustrial(selectedUnidad.id, {
        codigoRai: formData.codigoRai,
        nombre: formData.nombre,
        razonSocial: formData.razonSocial,
        direccion: formData.direccion,
        distrito: parseInt(formData.distrito),
        email: formData.email || undefined,
        representanteLegal: {
          nombre: formData.representanteNombre,
          ci: formData.representanteCi,
          telefono: formData.representanteTelefono,
        },
      });

      setShowEditModal(false);
      fetchUnidades(search);
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Error al actualizar unidad industrial');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await expedienteService.eliminarUnidadIndustrial(deleteModal.id);
      setDeleteModal(null);
      fetchUnidades(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar unidad industrial');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, { class: string; label: string }> = {
      VIGENTE: { class: 'bg-emerald-100 text-emerald-800 border border-emerald-200', label: 'VIGENTE' },
      INACTIVO: { class: 'bg-red-100 text-red-800 border border-red-200', label: 'INACTIVO' },
      PENDIENTE: { class: 'bg-amber-100 text-amber-800 border border-amber-200', label: 'PENDIENTE' },
    };
    const style = styles[estado] || { class: 'bg-gray-100 text-gray-800 border border-gray-200', label: estado };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.class}`}>{style.label}</span>;
  };

  const getCategoriaBadge = (categoria: number) => {
    const styles: Record<number, { class: string; label: string }> = {
      1: { class: 'bg-blue-100 text-blue-800 border border-blue-200', label: 'Categoría 1' },
      2: { class: 'bg-purple-100 text-purple-800 border border-purple-200', label: 'Categoría 2' },
      3: { class: 'bg-rose-100 text-rose-800 border border-rose-200', label: 'Categoría 3' },
    };
    const style = styles[categoria] || { class: 'bg-gray-100 text-gray-800', label: `Categoría ${categoria}` };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.class}`}>{style.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expediente Ambiental</h1>
          <p className="text-gray-500 mt-1">Gestión de unidades industriales</p>
        </div>
        <Link
          href="/admin/expediente/nuevo"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          <span className="text-lg">+</span> Nueva Unidad
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código RAI, nombre o razón social..."
            className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-colors shadow-sm"
        >
          Buscar
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código RAI</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Razón Social</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-3 text-gray-500">
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    No se encontraron unidades industriales
                  </td>
                </tr>
              ) : (
                unidades.map((unidad) => (
                  <tr key={unidad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {unidad.codigoRai}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {unidad.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {unidad.razonSocial}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(unidad.estado || 'VIGENTE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoriaBadge(Number(unidad.categoria) || 3)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-4">
                      {userRole === 'ADMINISTRADOR' && (
                        <>
                          <button
                            onClick={() => openEditModal(unidad)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleteModal({ id: unidad.id, nombre: unidad.nombre })}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                      <Link
                        href={`/admin/expediente/${unidad.id}`}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                      >
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

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Editar Unidad Industrial</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {editError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código RAI *
                  </label>
                  <input
                    type="text"
                    name="codigoRai"
                    value={formData.codigoRai}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distrito *
                  </label>
                  <input
                    type="number"
                    name="distrito"
                    value={formData.distrito}
                    onChange={handleEditChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Representante Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="representanteNombre"
                      value={formData.representanteNombre}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CI *
                    </label>
                    <input
                      type="text"
                      name="representanteCi"
                      value={formData.representanteCi}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      name="representanteTelefono"
                      value={formData.representanteTelefono}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                >
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">¿Está seguro de eliminar la unidad <strong>{deleteModal.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
