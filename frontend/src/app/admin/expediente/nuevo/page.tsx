'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { expedienteService } from '@/lib/api';
import { RubroCAEB } from '@/types';

export default function NuevoExpedientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rubros, setRubros] = useState<RubroCAEB[]>([]);

  const [formData, setFormData] = useState({
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

  const [nuevoRubro, setNuevoRubro] = useState<RubroCAEB>({
    codigoCaeb: '',
    descripcion: '',
    categoria: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRubro = () => {
    if (nuevoRubro.codigoCaeb && nuevoRubro.descripcion && nuevoRubro.categoria) {
      setRubros([...rubros, nuevoRubro]);
      setNuevoRubro({ codigoCaeb: '', descripcion: '', categoria: '' });
    }
  };

  const handleRemoveRubro = (index: number) => {
    setRubros(rubros.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
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
        rubrosActividad: rubros.map((r) => ({
          codigoCaeb: r.codigoCaeb,
          descripcion: r.descripcion,
          categoria: parseInt(r.categoria as string) || 0,
        })),
      };

      const { data } = await expedienteService.crearUnidadIndustrial(payload);
      router.push(`/admin/expediente/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear unidad industrial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/expediente"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Nueva Unidad Industrial</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código RAI *
            </label>
            <input
              type="text"
              name="codigoRai"
              value={formData.codigoRai}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Rubros CAEB</h3>

          {rubros.length > 0 && (
            <div className="mb-4 space-y-2">
              {rubros.map((rubro, index) => (
                <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">{rubro.codigoCaeb}</span>
                  <span className="flex-1">{rubro.descripcion}</span>
                  <span className="text-sm text-gray-500">{rubro.categoria}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRubro(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código CAEB
              </label>
              <input
                type="text"
                value={nuevoRubro.codigoCaeb}
                onChange={(e) => setNuevoRubro({ ...nuevoRubro, codigoCaeb: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={nuevoRubro.descripcion}
                onChange={(e) => setNuevoRubro({ ...nuevoRubro, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                type="text"
                value={nuevoRubro.categoria}
                onChange={(e) => setNuevoRubro({ ...nuevoRubro, categoria: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddRubro}
            className="mt-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            + Agregar Rubro
          </button>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Link
            href="/admin/expediente"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
