'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { expedienteService } from '@/lib/api';

const ESTADOS_RAI = ['EN_TRAMITE', 'OBSERVADO', 'APROBADO', 'DESISTIDO', 'RECHAZADO', 'VENCIDO', 'SUSPENDIDO'];

export default function VisualizadorExpedienteDetallePage() {
  const params = useParams();
  const id = Number(params.id);
  const [unidad, setUnidad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchUnidad();
  }, [id]);

  const fetchUnidad = async () => {
    try {
      setLoading(true);
      const { data } = await expedienteService.obtenerUnidadIndustrial(id);
      setUnidad(data);
    } catch (err) {
      setError('Error al cargar el expediente');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error || !unidad) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'No se encontró la unidad industrial'}
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Info General' },
    { id: 'rubros', label: 'Rubros CAEB' },
    { id: 'rai', label: 'RAI' },
    { id: 'irap-cat3', label: 'IRAP Cat. 3' },
    { id: 'irap-cat12', label: 'IRAP Cat. 1-2' },
    { id: 'iaa', label: 'IAA' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{unidad.nombre}</h1>
        <p className="text-gray-500">Código RAI: <span className="font-mono">{unidad.codigoRai}</span></p>
        <div className="flex gap-2 mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            unidad.estadoRegistro === 'VIGENTE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {unidad.estadoRegistro}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            unidad.categoriaFinal === 3 ? 'bg-rose-100 text-rose-800' :
            unidad.categoriaFinal === 2 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            Categoría {unidad.categoriaFinal}
          </span>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Datos de la Unidad</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Razón Social:</span> {unidad.razonSocial}</p>
                <p><span className="text-gray-500">Dirección:</span> {unidad.direccion}</p>
                <p><span className="text-gray-500">Distrito:</span> {unidad.distrito}</p>
                <p><span className="text-gray-500">Email:</span> {unidad.email || '-'}</p>
                <p><span className="text-gray-500">Fase:</span> {unidad.faseActividad}</p>
              </div>
            </div>
            {unidad.representanteLegal && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Representante Legal</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Nombre:</span> {unidad.representanteLegal.nombre}</p>
                  <p><span className="text-gray-500">CI:</span> {unidad.representanteLegal.ci}</p>
                  <p><span className="text-gray-500">Teléfono:</span> {unidad.representanteLegal.telefono || '-'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rubros' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Rubros de Actividad (CAEB)</h3>
            {!unidad.rubrosActividad?.length ? (
              <p className="text-gray-500 text-sm">No hay rubros registrados</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unidad.rubrosActividad.map((r: any) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2 text-sm font-mono">{r.codigoCaeb}</td>
                      <td className="px-4 py-2 text-sm">{r.descripcion}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          r.categoria === 3 ? 'bg-rose-100 text-rose-800' :
                          r.categoria === 2 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Categoría {r.categoria}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'rai' && unidad.rai && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Registro Inicial RAI</h3>
              {unidad.rai.registroInicial ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-gray-500">Fecha:</span> {new Date(unidad.rai.registroInicial.fechaRegistro).toLocaleDateString()}</div>
                  <div><span className="text-gray-500">Técnico:</span> {unidad.rai.registroInicial.tecnicoDesignado}</div>
                  <div><span className="text-gray-500">Existe Archivo:</span> {unidad.rai.registroInicial.existeEnArchivo ? 'Sí' : 'No'}</div>
                  <div><span className="text-gray-500">Documento:</span> {unidad.rai.registroInicial.documentoKey ? '✓ Subido' : 'No'}</div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay registro inicial</p>
              )}
            </div>

            {unidad.rai.historial?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Historial RAI</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Causa/Razón</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {unidad.rai.historial.map((h: any) => (
                      <tr key={h.id}>
                        <td className="px-4 py-2 text-sm">{new Date(h.fechaRegistro).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            h.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                            h.estado === 'OBSERVADO' ? 'bg-yellow-100 text-yellow-800' :
                            h.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {h.estado.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{h.causaRazon}</td>
                        <td className="px-4 py-2 text-sm">{h.tecnicoDesignado}</td>
                        <td className="px-4 py-2 text-sm">{h.documentoKey ? '✓' : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rai' && !unidad.rai && (
          <p className="text-gray-500">No hay RAI registrado</p>
        )}

        {activeTab === 'irap-cat3' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">IRAP Categoría 3</h3>
            {!unidad.irapCategoria3?.length ? (
              <p className="text-gray-500 text-sm">No hay IRAP Categoría 3 registrado</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Documento Ambiental</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha Informe</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certificado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unidad.irapCategoria3.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm">{item.documentoAmbiental}</td>
                      <td className="px-4 py-2 text-sm">{new Date(item.fechaInforme).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                          item.estado === 'OBSERVADO' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{item.certificadoAprobacion || '-'}</td>
                      <td className="px-4 py-2 text-sm">{item.tecnicoDesignado}</td>
                      <td className="px-4 py-2 text-sm">{item.documentoKey ? '✓' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'irap-cat12' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">IRAP Categoría 1-2</h3>
            {!unidad.irapCategoria12?.length ? (
              <p className="text-gray-500 text-sm">No hay IRAP Categoría 1-2 registrado</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doc. Ambiental</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">DAA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha DAA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unidad.irapCategoria12.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm">{item.documentoAmbiental}</td>
                      <td className="px-4 py-2 text-sm">{new Date(item.fechaInforme).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                          item.estado === 'OBSERVADO' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{item.daa || '-'}</td>
                      <td className="px-4 py-2 text-sm">{item.fechaDaa ? new Date(item.fechaDaa).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2 text-sm">{item.tecnicoDesignado}</td>
                      <td className="px-4 py-2 text-sm">{item.documentoKey ? '✓' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'iaa' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Informes Anuales</h3>
            {!unidad.informesAmbientales?.length ? (
              <p className="text-gray-500 text-sm">No hay informes anuales registrados</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gestión</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha Informe</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monitoreos</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unidad.informesAmbientales.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm">{item.gestion}</td>
                      <td className="px-4 py-2 text-sm">{new Date(item.fechaInforme).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{item.monitoreos?.join(', ') || '-'}</td>
                      <td className="px-4 py-2 text-sm">{item.tecnicoDesignado}</td>
                      <td className="px-4 py-2 text-sm">{item.documentoKey ? '✓' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
