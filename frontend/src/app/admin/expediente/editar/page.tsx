'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { expedienteService } from '@/lib/api';
import MapaCoordenadas from '@/components/MapaCoordenadas';
import SelectorCategoria from '@/components/SelectorCategoria';
import { DISTRITOS } from '@/lib/distritos';
import { ESTADOS_REGISTRO, FASES_ACTIVIDAD } from '@/lib/estados';
import { RubroCAEB } from '@/types';

interface FormData {
  codigoRai: string;
  nombre: string;
  razonSocial: string;
  direccion: string;
  distrito: string;
  email: string;
  categoriaFinal: string;
  estadoRegistro: string;
  x: string;
  y: string;
  msnm: string;
  faseActividad: string;
  representanteNombre: string;
  representanteCi: string;
  representanteTelefono: string;
}

const FORM_VACIO: FormData = {
  codigoRai: '',
  nombre: '',
  razonSocial: '',
  direccion: '',
  distrito: '',
  email: '',
  categoriaFinal: '',
  estadoRegistro: 'VIGENTE',
  x: '',
  y: '',
  msnm: '',
  faseActividad: 'OPERACION',
  representanteNombre: '',
  representanteCi: '',
  representanteTelefono: '',
};

function EditarUnidadIndustrial() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>(FORM_VACIO);
  const [rubros, setRubros] = useState<RubroCAEB[]>([]);
  const [nuevoRubro, setNuevoRubro] = useState<RubroCAEB>({
    codigoCaeb: '',
    descripcion: '',
    categoria: '',
  });

  useEffect(() => {
    if (!idParam) {
      setError('No se indicó la unidad industrial a editar');
      setLoading(false);
      return;
    }

    const cargar = async () => {
      try {
        const { data } = await expedienteService.obtenerUnidadIndustrial(Number(idParam));
        setFormData({
          codigoRai: data.codigoRai || '',
          nombre: data.nombre || '',
          razonSocial: data.razonSocial || '',
          direccion: data.direccion || '',
          distrito: data.distrito != null ? String(data.distrito) : '',
          email: data.email || '',
          categoriaFinal: data.categoriaFinal != null ? String(data.categoriaFinal) : '',
          estadoRegistro: data.estadoRegistro || 'VIGENTE',
          x: data.x != null ? String(data.x) : '',
          y: data.y != null ? String(data.y) : '',
          msnm: data.msnm != null ? String(data.msnm) : '',
          faseActividad: data.faseActividad || 'OPERACION',
          representanteNombre: data.representanteLegal?.nombre || '',
          representanteCi: data.representanteLegal?.ci || '',
          representanteTelefono: data.representanteLegal?.telefono || '',
        });
        setRubros(
          (data.rubrosActividad || []).map((r: any) => ({
            codigoCaeb: r.codigoCaeb || '',
            descripcion: r.descripcion || '',
            categoria: r.categoria != null ? String(r.categoria) : '',
          }))
        );
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar la unidad industrial');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [idParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    setSaving(true);

    if (!formData.distrito) {
      setError('Seleccione un distrito');
      setSaving(false);
      return;
    }

    if (!formData.categoriaFinal) {
      setError('Seleccione la categoría de la unidad industrial');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        codigoRai: formData.codigoRai,
        nombre: formData.nombre,
        razonSocial: formData.razonSocial,
        direccion: formData.direccion,
        distrito: parseInt(formData.distrito),
        email: formData.email || undefined,
        categoriaFinal: parseInt(formData.categoriaFinal),
        estadoRegistro: formData.estadoRegistro,
        x: formData.x ? parseInt(formData.x) : undefined,
        y: formData.y ? parseInt(formData.y) : undefined,
        msnm: formData.msnm ? parseInt(formData.msnm) : undefined,
        faseActividad: formData.faseActividad || undefined,
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

      await expedienteService.actualizarUnidadIndustrial(Number(idParam), payload);
      router.push(`/admin/expediente/${idParam}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar unidad industrial');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center gap-3 py-16 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Cargando unidad industrial...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/expediente"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Editar Unidad Industrial</h1>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código RAI *
            </label>
            <input
              type="text"
              name="codigoRai"
              value={formData.codigoRai}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Razón Social *
            </label>
            <input
              type="text"
              name="razonSocial"
              value={formData.razonSocial}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Distrito *
            </label>
            <select
              name="distrito"
              value={formData.distrito}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccione un distrito</option>
              {DISTRITOS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email (opcional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría *
            </label>
            <SelectorCategoria
              value={formData.categoriaFinal}
              onChange={(valor) => setFormData({ ...formData, categoriaFinal: valor })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado de Registro *
            </label>
            <select
              name="estadoRegistro"
              value={formData.estadoRegistro}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {ESTADOS_REGISTRO.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coordenada X
            </label>
            <input
              type="number"
              name="x"
              value={formData.x}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coordenada Y
            </label>
            <input
              type="number"
              name="y"
              value={formData.y}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              MSNM
            </label>
            <input
              type="number"
              name="msnm"
              value={formData.msnm}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Metros sobre el nivel del mar (altitud del terreno)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fase de Actividad
            </label>
            <select
              name="faseActividad"
              value={formData.faseActividad}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {FASES_ACTIVIDAD.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Ubicación</h3>
          <MapaCoordenadas
            x={formData.x ? parseInt(formData.x) : null}
            y={formData.y ? parseInt(formData.y) : null}
            interactivo
            onSeleccion={(coordenadas) =>
              setFormData({
                ...formData,
                x: String(coordenadas.x),
                y: String(coordenadas.y),
              })
            }
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Representante Legal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="representanteNombre"
                value={formData.representanteNombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CI *
              </label>
              <input
                type="text"
                name="representanteCi"
                value={formData.representanteCi}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono *
              </label>
              <input
                type="text"
                name="representanteTelefono"
                value={formData.representanteTelefono}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Rubros CAEB</h3>

          {rubros.length > 0 && (
            <div className="mb-4 space-y-2">
              {rubros.map((rubro, index) => (
                <div key={index} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <span className="font-medium">{rubro.codigoCaeb}</span>
                  <span className="flex-1">{rubro.descripcion}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{rubro.categoria}</span>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código CAEB
              </label>
              <input
                type="text"
                value={nuevoRubro.codigoCaeb}
                onChange={(e) => setNuevoRubro({ ...nuevoRubro, codigoCaeb: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={nuevoRubro.descripcion}
                onChange={(e) => setNuevoRubro({ ...nuevoRubro, descripcion: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <SelectorCategoria
                value={nuevoRubro.categoria}
                onChange={(valor) => setNuevoRubro({ ...nuevoRubro, categoria: valor })}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddRubro}
            className="mt-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            + Agregar Rubro
          </button>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Link
            href="/admin/expediente"
            className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditarUnidadIndustrialPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center gap-3 py-16 text-gray-500 dark:text-gray-400">
          Cargando unidad industrial...
        </div>
      }
    >
      <EditarUnidadIndustrial />
    </Suspense>
  );
}
