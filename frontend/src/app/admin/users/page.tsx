'use client';

import { useEffect, useState } from 'react';
import { usersService } from '@/lib/api';

interface User {
  id: number;
  email: string;
  nombre: string;
  role: 'ADMINISTRADOR' | 'VISUALIZADOR';
  activo: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    role: 'VISUALIZADOR' as const,
  });

  const loadUsers = async () => {
    const { data } = await usersService.getAll();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersService.create(formData);
      setShowForm(false);
      setFormData({ email: '', password: '', nombre: '', role: 'VISUALIZADOR' });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}