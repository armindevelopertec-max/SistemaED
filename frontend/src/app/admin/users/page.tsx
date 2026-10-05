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

export default function UsersPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
    nombre: '',
    rol: 'VISUALIZADOR' as const,
  });
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [editFormData, setEditFormData] = useState<{nombre: string, rol: 'ADMINISTRADOR' | 'VISUALIZADOR', contrasena: string}>({ nombre: '', rol: 'VISUALIZADOR', contrasena: '' });
  const [deleteModal, setDeleteModal] = useState<{id: number, nombre: string} | null>(null);

  const loadUsers = async () => {
    const { data } = await usuariosService.listar();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usuariosService.crear(formData);
      setShowForm(false);
      setFormData({ email: '', contrasena: '', nombre: '', rol: 'VISUALIZADOR' });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const openEditUser = (user: Usuario) => {
    setEditUser(user);
    setEditFormData({ nombre: user.nombre, rol: user.role as 'ADMINISTRADOR' | 'VISUALIZADOR', contrasena: '' });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setLoading(true);
    try {
      const payload: any = { nombre: editFormData.nombre, rol: editFormData.rol };
      if (editFormData.contrasena) payload.contrasena = editFormData.contrasena;
      await usuariosService.actualizar(editUser.id, payload);
      setEditUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
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

  return (
    <div>
      {editUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                placeholder="Nombre completo"
                value={editFormData.nombre}
                onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                className="w-full border p-2 rounded-lg"
                required
              />
              <select
                value={editFormData.rol}
                onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value as any })}
                className="w-full border p-2 rounded-lg"
              >
                <option value="VISUALIZADOR">Visualizador</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
              <input
                type="password"
                placeholder="Nueva contraseña (vacío para no cambiar)"
                value={editFormData.contrasena}
                onChange={(e) => setEditFormData({ ...editFormData, contrasena: e.target.value })}
                className="w-full border p-2 rounded-lg"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">¿Está seguro de eliminar al usuario <strong>{deleteModal.nombre}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Usuarios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 w-full sm:w-auto"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo Usuario</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full"
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={formData.contrasena}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full"
                required
                minLength={6}
              />
              <input
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full"
                required
              />
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                className="border p-2 sm:p-3 rounded-lg w-full"
              >
                <option value="VISUALIZADOR">Visualizador</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 w-full"
            >
              {loading ? 'Guardando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Nombre</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Email</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Rol</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Estado</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">{user.nombre}</td>
                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm truncate max-w-[120px]">{user.email}</td>
                <td className="px-3 sm:px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'ADMINISTRADOR'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 flex gap-2">
                  <button onClick={() => openEditUser(user)} className="text-indigo-600 hover:text-indigo-800 text-sm">Editar</button>
                  <button onClick={() => handleToggleActive(user)} className={`text-sm ${user.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}>
                    {user.activo ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
