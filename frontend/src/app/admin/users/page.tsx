'use client';

import { useEffect, useState } from 'react';
import { usuariosService } from '@/lib/api';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  role: 'ADMINISTRADOR' | 'VISUALIZADOR';
  activo: boolean;
}

interface FormData {
  email: string;
  contrasena: string;
  nombre: string;
  rol: 'ADMINISTRADOR' | 'VISUALIZADOR';
}

export default function UsersPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading_, setLoading_] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    contrasena: '',
    nombre: '',
    rol: 'VISUALIZADOR',
  });
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [editFormData, setEditFormData] = useState<{ nombre: string; rol: 'ADMINISTRADOR' | 'VISUALIZADOR'; contrasena: string }>({ nombre: '', rol: 'VISUALIZADOR', contrasena: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ id: number; nombre: string } | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await usuariosService.listar();
      setUsers(data);
    } catch (err: any) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading_(true);
    setError('');
    try {
      await usuariosService.crear(formData);
      setShowForm(false);
      setFormData({ email: '', contrasena: '', nombre: '', rol: 'VISUALIZADOR' });
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading_(false);
    }
  };

  const openEditUser = (user: Usuario) => {
    setEditUser(user);
    setEditFormData({ nombre: user.nombre, rol: user.role, contrasena: '' });
    setEditError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    setEditError('');
    try {
      const payload: any = { nombre: editFormData.nombre, rol: editFormData.rol };
      if (editFormData.contrasena) payload.contrasena = editFormData.contrasena;
      await usuariosService.actualizar(editUser.id, payload);
      setEditUser(null);
      loadUsers();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await usuariosService.eliminar(deleteModal.id);
      setDeleteModal(null);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleActive = async (user: Usuario) => {
    try {
      await usuariosService.actualizar(user.id, { activo: !user.activo });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const getRolBadge = (rol: string) => {
    const styles: Record<string, { class: string; label: string }> = {
      ADMINISTRADOR: { class: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800', label: 'Administrador' },
      VISUALIZADOR: { class: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800', label: 'Visualizador' },
    };
    const style = styles[rol] || { class: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700', label: rol };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.class}`}>{style.label}</span>;
  };

  const getEstadoBadge = (activo: boolean) => {
    const style = activo
      ? { class: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800', label: 'ACTIVO' }
      : { class: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800', label: 'INACTIVO' };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.class}`}>{style.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Usuarios</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          <span className="text-lg">{showForm ? '×' : '+'}</span>
          {showForm ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); }} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o rol..."
            className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
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
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Nuevo Usuario</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                  required
                  minLength={6}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as FormData['rol'] })}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="VISUALIZADOR">Visualizador</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading_}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
              >
                {loading_ ? 'Guardando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRolBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(user.activo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-4">
                      <button
                        onClick={() => openEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`font-medium ${user.activo ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {user.activo ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                      <button
                        onClick={() => setDeleteModal({ id: user.id, nombre: user.nombre })}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Editar Usuario</h2>
              <button
                onClick={() => setEditUser(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {editError && (
                <div className="bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                    required
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol *
                  </label>
                  <select
                    name="rol"
                    value={editFormData.rol}
                    onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value as 'ADMINISTRADOR' | 'VISUALIZADOR' })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="VISUALIZADOR">Visualizador</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Cambiar Contraseña</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nueva contraseña (vacío para no cambiar)
                  </label>
                  <input
                    type="password"
                    name="contrasena"
                    value={editFormData.contrasena}
                    onChange={(e) => setEditFormData({ ...editFormData, contrasena: e.target.value })}
                    minLength={6}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Confirmar eliminación</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">¿Está seguro de eliminar al usuario <strong>{deleteModal.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
