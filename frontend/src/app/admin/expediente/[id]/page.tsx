'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { expedienteService, authService } from '@/lib/api';

type TabType = 'identificacion' | 'rubros' | 'rai' | 'irap-cat3' | 'irap-cat12' | 'informes';

const ESTADOS_RAI = ['REGISTRO_INICIAL', 'ACTUALIZACION', 'MODIFICACION', 'RENOVACION'];
const TIPOS_IRAP_CAT3 = ['LASP', 'PMA', 'PGA', 'MIA'];
const TIPOS_IRAP_CAT12 = ['DAA', 'MAE', 'PASMA'];
const MONITOREOS = ['Combustión', 'Ruido', 'Part. Suspendida', 'Efluentes', 'Residuos Sólidos'];
const ESTADOS_DOC = ['APROBADO', 'RECHAZADO', 'EN_TRAMITE', 'VENCIDO'];

export default function ExpedienteDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [unidad, setUnidad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('identificacion');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{type: 'success'|'error', message: string} | null>(null);

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  useEffect(() => {
    const userData = authService.obtenerUsuario();
    setUser(userData);
  }, []);

  const [rubrosList, setRubrosList] = useState<any[]>([]);
  const [nuevoRubro, setNuevoRubro] = useState({ codigoCaeb: '', descripcion: '', categoria: '' });

  const [rai, setRai] = useState<any>(null);
  const [registroInicial, setRegistroInicial] = useState({ fechaRegistro: '', tecnicoDesignado: '' });
  const [nuevoHistorial, setNuevoHistorial] = useState({ estado: '', causaRazon: '', fechaRegistro: '', tecnicoDesignado: '' });

  const [irapCat3Data, setIrapCat3Data] = useState<any[]>([]);
  const [nuevoIrapCat3, setNuevoIrapCat3] = useState({ documentoAmbiental: 'LASP', fechaInforme: '', estado: 'EN_TRAMITE', certificadoAprobacion: '', tecnicoDesignado: '' });

  const [irapCat12Data, setIrapCat12Data] = useState<any[]>([]);
  const [nuevoIrapCat12, setNuevoIrapCat12] = useState({ documentoAmbiental: 'DAA', fechaInforme: '', estado: 'EN_TRAMITE', tecnicoDesignado: '', remisionDocumento: '', daa: '', fechaDaa: '' });

  const [informesData, setInformesData] = useState<any[]>([]);
  const [nuevoInforme, setNuevoInforme] = useState({ gestion: '', fechaInforme: '', monitoreos: [] as string[], tecnicoDesignado: '' });

  const [editModal, setEditModal] = useState<{type: string, data: any} | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editUnidadForm, setEditUnidadForm] = useState<any>({});
  const [editRepresentanteForm, setEditRepresentanteForm] = useState<any>({});
  const [deleteModal, setDeleteModal] = useState<{type: string, id: number, nombre: string} | null>(null);

  const openEditUnidad = () => {
    setEditUnidadForm({
      nombre: unidad.nombre,
      razonSocial: unidad.razonSocial,
      direccion: unidad.direccion,
      distrito: unidad.distrito,
      email: unidad.email || '',
      x: unidad.x || '',
      y: unidad.y || '',
      msnm: unidad.msnm || '',
      faseActividad: unidad.faseActividad,
      estadoRegistro: unidad.estadoRegistro,
    });
    if (unidad.representanteLegal) {
      setEditRepresentanteForm({
        nombre: unidad.representanteLegal.nombre,
        ci: unidad.representanteLegal.ci,
        telefono: unidad.representanteLegal.telefono || '',
      });
    }
    setEditModal({ type: 'unidad', data: unidad });
  };

  const saveEditUnidad = async () => {
    try {
      setSaving(true);
      await expedienteService.actualizarUnidadIndustrial(unidad.id, editUnidadForm);
      if (unidad.representanteLegal) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/api/expediente/unidades-industriales/${unidad.id}/representante`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editRepresentanteForm),
        });
      }
      setEditModal(null);
      fetchUnidad();
      showToast('success', 'Unidad industrial actualizada');
    } catch (err) {
      showToast('error', 'Error al actualizar unidad industrial');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchUnidad();
  }, [id]);

  const fetchUnidad = async () => {
    try {
      setLoading(true);
      const { data } = await expedienteService.obtenerUnidadIndustrial(parseInt(id));
      setUnidad(data);
      setRubrosList(data.rubrosActividad || []);

      if (data.rai) {
        setRai(data.rai);
        if (data.rai.registroInicial) {
          setRegistroInicial({
            fechaRegistro: data.rai.registroInicial.fechaRegistro?.split('T')[0] || '',
            tecnicoDesignado: data.rai.registroInicial.tecnicoDesignado || ''
          });
        }
      }

      setIrapCat3Data(data.irapCategoria3 || []);
      setIrapCat12Data(data.irapCategoria12 || []);
      setInformesData(data.informesAmbientales || []);
    } catch (err: any) {
      setError('Error al cargar unidad industrial');
    } finally {
      setLoading(false);
    }
  };

  const crearRAI = async () => {
    if (!unidad) return;
    try {
      setSaving(true);
      const raiData = await expedienteService.crearRAI(unidad.id);
      setRai(raiData.data);
      showToast('success', 'RAI creado exitosamente');
    } catch (err) {
      showToast('error', 'Error al crear RAI');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRegistroInicial = async () => {
    if (!rai || !registroInicial.fechaRegistro || !registroInicial.tecnicoDesignado) {
      showToast('error', 'Complete todos los campos');
      return;
    }
    try {
      setSaving(true);
      await expedienteService.crearRegistroInicial(rai.id, registroInicial);
      fetchUnidad();
      showToast('success', 'Registro inicial agregado');
    } catch (err) {
      showToast('error', 'Error al crear registro inicial');
    } finally {
      setSaving(false);
    }
  };

  const handleAddHistorial = async () => {
    if (!rai || !nuevoHistorial.estado || !nuevoHistorial.causaRazon) {
      showToast('error', 'Complete todos los campos');
      return;
    }
    try {
      setSaving(true);
      await expedienteService.agregarHistorialRAI(rai.id, nuevoHistorial);
      fetchUnidad();
      setNuevoHistorial({ estado: '', causaRazon: '', fechaRegistro: '', tecnicoDesignado: '' });
      showToast('success', 'Historial agregado');
    } catch (err) {
      showToast('error', 'Error al agregar historial');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRubro = async () => {
    if (!unidad || !nuevoRubro.codigoCaeb || !nuevoRubro.descripcion) {
      showToast('error', 'Complete todos los campos');
      return;
    }
    try {
      setSaving(true);
      await expedienteService.agregarRubro(unidad.id, { ...nuevoRubro, categoria: parseInt(nuevoRubro.categoria) || 3 });
      fetchUnidad();
      setNuevoRubro({ codigoCaeb: '', descripcion: '', categoria: '' });
      showToast('success', 'Rubro agregado');
    } catch (err) {
      showToast('error', 'Error al agregar rubro');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRubro = (id: number, nombre: string) => {
    setDeleteModal({ type: 'rubro', id, nombre });
  };

  const handleDeleteHistorial = (id: number, estado: string, causa: string) => {
    setDeleteModal({ type: 'historial', id, nombre: `${estado} - ${causa}` });
  };

  const handleDeleteIrapCat3 = (id: number, nombre: string) => {
    setDeleteModal({ type: 'irap3', id, nombre });
  };

  const handleDeleteIrapCat12 = (id: number, nombre: string) => {
    setDeleteModal({ type: 'irap12', id, nombre });
  };

  const handleDeleteInforme = (id: number, nombre: string) => {
    setDeleteModal({ type: 'informe', id, nombre });
  };

  const openEditRubro = (rubro: any) => {
    setEditModal({ type: 'rubro', data: rubro });
    setEditForm({ id: rubro.id, codigoCaeb: rubro.codigoCaeb, descripcion: rubro.descripcion, categoria: rubro.categoria.toString() });
  };

  const saveEditRubro = async () => {
    try {
      setSaving(true);
      await expedienteService.actualizarRubro(editForm.id, { codigoCaeb: editForm.codigoCaeb, descripcion: editForm.descripcion, categoria: parseInt(editForm.categoria) });
      setEditModal(null);
      fetchUnidad();
      showToast('success', 'Rubro actualizado');
    } catch (err) {
      showToast('error', 'Error al actualizar rubro');
    } finally {
      setSaving(false);
    }
  };

  const openEditIrapCat3 = (item: any) => {
    setEditModal({ type: 'irap3', data: item });
    setEditForm({ ...item, fechaInforme: item.fechaInforme?.split('T')[0] });
  };

  const saveEditIrapCat3 = async () => {
    try {
      setSaving(true);
      await expedienteService.actualizarIrapCat3(editForm.id, editForm);
      setEditModal(null);
      fetchUnidad();
      showToast('success', 'IRAP actualizado');
    } catch (err) {
      showToast('error', 'Error al actualizar IRAP');
    } finally {
      setSaving(false);
    }
  };

  const openEditIrapCat12 = (item: any) => {
    setEditModal({ type: 'irap12', data: item });
    setEditForm({ ...item, fechaInforme: item.fechaInforme?.split('T')[0], fechaDaa: item.fechaDaa?.split('T')[0] });
  };

  const saveEditIrapCat12 = async () => {
    try {
      setSaving(true);
      await expedienteService.actualizarIrapCat12(editForm.id, editForm);
      setEditModal(null);
      fetchUnidad();
      showToast('success', 'IRAP actualizado');
    } catch (err) {
      showToast('error', 'Error al actualizar IRAP');
    } finally {
      setSaving(false);
    }
  };

  const openEditInforme = (item: any) => {
    setEditModal({ type: 'informe', data: item });
    setEditForm({ ...item, fechaInforme: item.fechaInforme?.split('T')[0] });
  };

  const saveEditInforme = async () => {
    try {
      setSaving(true);
      await expedienteService.actualizarInformeAnual(editForm.id, editForm);
      setEditModal(null);
      fetchUnidad();
      showToast('success', 'Informe actualizado');
    } catch (err) {
      showToast('error', 'Error al actualizar informe');
    } finally {
      setSaving(false);
    }
  };

  const openEditHistorial = (item: any) => {
    setEditModal({ type: 'historial', data: item });
    setEditForm({ ...item, fechaRegistro: item.fechaRegistro?.split('T')[0] });
  };

  const saveEditHistorial = async () => {
    try {
      setSaving(true);
      await expedienteService.actualizarHistorialRAI(editForm.id, editForm);
      setEditModal(null);
      fetchUnidad();
      showToast('success', 'Historial actualizado');
    } catch (err) {
      showToast('error', 'Error al actualizar historial');
    } finally {
      setSaving(false);
    }
  };

  const openEditRegistroInicial = () => {
    if (!rai?.registroInicial) return;
    setEditModal({ type: 'registroInicial', data: rai.registroInicial });
    setEditForm({
      ...rai.registroInicial,
      fechaRegistro: rai.registroInicial.fechaRegistro?.split('T')[0] || '',
    });
  };

  const saveEditRegistroInicial = async () => {
    try {
      setSaving(true);
      await expedienteService.actualizarRegistroInicial(editForm.id, editForm);
      setEditModal(null);
      fetchUnidad();
      showToast('success', 'Registro inicial actualizado');
    } catch (err) {
      showToast('error', 'Error al actualizar registro inicial');
    } finally {
      setSaving(false);
    }
  };

  const handleAddIrapCat3 = async () => {
    if (!unidad || !nuevoIrapCat3.documentoAmbiental || !nuevoIrapCat3.fechaInforme) {
      showToast('error', 'Complete todos los campos');
      return;
    }
    try {
      setSaving(true);
      await expedienteService.agregarIrapCat3(unidad.id, nuevoIrapCat3);
      fetchUnidad();
      setNuevoIrapCat3({ documentoAmbiental: 'LASP', fechaInforme: '', estado: 'EN_TRAMITE', certificadoAprobacion: '', tecnicoDesignado: '' });
      showToast('success', 'IRAP Categoría 3 agregado');
    } catch (err) {
      showToast('error', 'Error al agregar IRAP');
    } finally {
      setSaving(false);
    }
  };

  const handleAddIrapCat12 = async () => {
    if (!unidad || !nuevoIrapCat12.documentoAmbiental || !nuevoIrapCat12.fechaInforme) {
      showToast('error', 'Complete todos los campos');
      return;
    }
    try {
      setSaving(true);
      await expedienteService.agregarIrapCat12(unidad.id, nuevoIrapCat12);
      fetchUnidad();
      setNuevoIrapCat12({ documentoAmbiental: 'DAA', fechaInforme: '', estado: 'EN_TRAMITE', tecnicoDesignado: '', remisionDocumento: '', daa: '', fechaDaa: '' });
      showToast('success', 'IRAP Categoría 1-2 agregado');
    } catch (err) {
      showToast('error', 'Error al agregar IRAP');
    } finally {
      setSaving(false);
    }
  };

  const handleAddInforme = async () => {
    if (!unidad || !nuevoInforme.gestion || !nuevoInforme.fechaInforme) {
      showToast('error', 'Complete todos los campos');
      return;
    }
    try {
      setSaving(true);
      await expedienteService.agregarInformeAnual(unidad.id, nuevoInforme);
      fetchUnidad();
      setNuevoInforme({ gestion: '', fechaInforme: '', monitoreos: [], tecnicoDesignado: '' });
      showToast('success', 'Informe Anual agregado');
    } catch (err) {
      showToast('error', 'Error al agregar informe');
    } finally {
      setSaving(false);
    }
  };

  const toggleMonitoreo = (monitoreo: string) => {
    setNuevoInforme(prev => ({
      ...prev,
      monitoreos: prev.monitoreos.includes(monitoreo)
        ? prev.monitoreos.filter(m => m !== monitoreo)
        : [...prev.monitoreos, monitoreo]
    }));
  };

  const handleFileUpload = async (tipo: string, id: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('documento', file);
      await expedienteService.subirDocumento(tipo, id, formData);
      fetchUnidad();
      showToast('success', 'Documento subido');
    } catch (err) {
      showToast('error', 'Error al subir documento');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-BO');
  };

  const tabs = [
    { id: 'identificacion', label: 'Identificación', icon: '🏭' },
    { id: 'rubros', label: 'Rubros CAEB', icon: '📋' },
    { id: 'rai', label: 'RAI', icon: '📄' },
    { id: 'irap-cat3', label: 'IRAP Cat. 3', icon: '📑' },
    { id: 'irap-cat12', label: 'IRAP Cat. 1-2', icon: '📋' },
    { id: 'informes', label: 'IAA', icon: '📊' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (error || !unidad) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error || 'Unidad no encontrada'}
        </div>
        <Link href="/admin/expediente" className="text-indigo-600 hover:text-indigo-900 font-medium">
          ← Volver a expedientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editModal.type === 'rubro' && 'Editar Rubro'}
              {editModal.type === 'irap3' && 'Editar IRAP Categoría 3'}
              {editModal.type === 'irap12' && 'Editar IRAP Categoría 1-2'}
              {editModal.type === 'informe' && 'Editar Informe Anual'}
              {editModal.type === 'historial' && 'Editar Historial RAI'}
              {editModal.type === 'registroInicial' && 'Editar Registro Inicial RAI'}
              {editModal.type === 'unidad' && 'Editar Unidad Industrial'}
            </h3>

            {editModal.type === 'rubro' && (
              <div className="space-y-4">
                <input type="text" value={editForm.codigoCaeb} onChange={(e) => setEditForm({...editForm, codigoCaeb: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Código CAEB" />
                <input type="text" value={editForm.descripcion} onChange={(e) => setEditForm({...editForm, descripcion: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Descripción" />
                <select value={editForm.categoria} onChange={(e) => setEditForm({...editForm, categoria: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="1">Categoría 1</option>
                  <option value="2">Categoría 2</option>
                  <option value="3">Categoría 3</option>
                </select>
              </div>
            )}

            {editModal.type === 'irap3' && (
              <div className="space-y-4">
                <select value={editForm.documentoAmbiental} onChange={(e) => setEditForm({...editForm, documentoAmbiental: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {TIPOS_IRAP_CAT3.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" value={editForm.fechaInforme || ''} onChange={(e) => setEditForm({...editForm, fechaInforme: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <select value={editForm.estado} onChange={(e) => setEditForm({...editForm, estado: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {ESTADOS_DOC.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                </select>
                <input type="text" value={editForm.certificadoAprobacion || ''} onChange={(e) => setEditForm({...editForm, certificadoAprobacion: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Certificado de Aprobación" />
                <input type="text" value={editForm.tecnicoDesignado || ''} onChange={(e) => setEditForm({...editForm, tecnicoDesignado: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Técnico Designado" />
              </div>
            )}

            {editModal.type === 'irap12' && (
              <div className="space-y-4">
                <select value={editForm.documentoAmbiental} onChange={(e) => setEditForm({...editForm, documentoAmbiental: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {TIPOS_IRAP_CAT12.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" value={editForm.fechaInforme || ''} onChange={(e) => setEditForm({...editForm, fechaInforme: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <select value={editForm.estado} onChange={(e) => setEditForm({...editForm, estado: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {ESTADOS_DOC.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                </select>
                <input type="text" value={editForm.remisionDocumento || ''} onChange={(e) => setEditForm({...editForm, remisionDocumento: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Remisión Documento" />
                <input type="text" value={editForm.daa || ''} onChange={(e) => setEditForm({...editForm, daa: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="DAA" />
                <input type="date" value={editForm.fechaDaa || ''} onChange={(e) => setEditForm({...editForm, fechaDaa: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" value={editForm.tecnicoDesignado || ''} onChange={(e) => setEditForm({...editForm, tecnicoDesignado: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Técnico Designado" />
              </div>
            )}

            {editModal.type === 'informe' && (
              <div className="space-y-4">
                <input type="number" value={editForm.gestion || ''} onChange={(e) => setEditForm({...editForm, gestion: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" placeholder="Gestión" />
                <input type="date" value={editForm.fechaInforme || ''} onChange={(e) => setEditForm({...editForm, fechaInforme: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" value={editForm.tecnicoDesignado || ''} onChange={(e) => setEditForm({...editForm, tecnicoDesignado: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Técnico Designado" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monitoreos</label>
                  <div className="flex flex-wrap gap-2">
                    {MONITOREOS.map(m => (
                      <button key={m} type="button" onClick={() => {
                        const monitoreos = editForm.monitoreos.includes(m)
                          ? editForm.monitoreos.filter((x: string) => x !== m)
                          : [...editForm.monitoreos, m];
                        setEditForm({...editForm, monitoreos});
                      }} className={`px-3 py-1 rounded-full text-sm ${editForm.monitoreos?.includes(m) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {editModal.type === 'historial' && (
              <div className="space-y-4">
                <select value={editForm.estado} onChange={(e) => setEditForm({...editForm, estado: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {ESTADOS_RAI.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                </select>
                <input type="text" value={editForm.causaRazon || ''} onChange={(e) => setEditForm({...editForm, causaRazon: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Causa/Razón" />
                <input type="date" value={editForm.fechaRegistro || ''} onChange={(e) => setEditForm({...editForm, fechaRegistro: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" value={editForm.tecnicoDesignado || ''} onChange={(e) => setEditForm({...editForm, tecnicoDesignado: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Técnico Designado" />
              </div>
            )}

            {editModal.type === 'registroInicial' && (
              <div className="space-y-4">
                <input type="date" value={editForm.fechaRegistro || ''} onChange={(e) => setEditForm({...editForm, fechaRegistro: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" value={editForm.tecnicoDesignado || ''} onChange={(e) => setEditForm({...editForm, tecnicoDesignado: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Técnico Designado" />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="existeEnArchivo" checked={editForm.existeEnArchivo} onChange={(e) => setEditForm({...editForm, existeEnArchivo: e.target.checked})} className="w-4 h-4" />
                  <label htmlFor="existeEnArchivo" className="text-sm text-gray-700">Existe Archivo</label>
                </div>
              </div>
            )}

            {editModal.type === 'unidad' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" value={editUnidadForm.nombre || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, nombre: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                    <input type="text" value={editUnidadForm.razonSocial || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, razonSocial: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input type="text" value={editUnidadForm.direccion || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, direccion: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
                    <input type="number" value={editUnidadForm.distrito || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, distrito: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={editUnidadForm.email || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coordenada X</label>
                    <input type="number" value={editUnidadForm.x || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, x: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coordenada Y</label>
                    <input type="number" value={editUnidadForm.y || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, y: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MSNM</label>
                    <input type="number" value={editUnidadForm.msnm || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, msnm: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fase Actividad</label>
                    <input type="text" value={editUnidadForm.faseActividad || ''} onChange={(e) => setEditUnidadForm({...editUnidadForm, faseActividad: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                {unidad.representanteLegal && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Representante Legal</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input type="text" value={editRepresentanteForm.nombre || ''} onChange={(e) => setEditRepresentanteForm({...editRepresentanteForm, nombre: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CI</label>
                        <input type="text" value={editRepresentanteForm.ci || ''} onChange={(e) => setEditRepresentanteForm({...editRepresentanteForm, ci: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input type="text" value={editRepresentanteForm.telefono || ''} onChange={(e) => setEditRepresentanteForm({...editRepresentanteForm, telefono: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={() => {
                if (editModal.type === 'rubro') saveEditRubro();
                else if (editModal.type === 'irap3') saveEditIrapCat3();
                else if (editModal.type === 'irap12') saveEditIrapCat12();
                else if (editModal.type === 'informe') saveEditInforme();
                else if (editModal.type === 'historial') saveEditHistorial();
                else if (editModal.type === 'registroInicial') saveEditRegistroInicial();
                else if (editModal.type === 'unidad') saveEditUnidad();
              }} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">¿Está seguro de eliminar <strong>{deleteModal.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={async () => {
                try {
                  if (deleteModal.type === 'historial') {
                    await expedienteService.eliminarHistorialRAI(deleteModal.id);
                    fetchUnidad();
                    showToast('success', 'Historial eliminado');
                  } else if (deleteModal.type === 'rubro') {
                    await expedienteService.eliminarRubro(deleteModal.id);
                    fetchUnidad();
                    showToast('success', 'Rubro eliminado');
                  } else if (deleteModal.type === 'irap3') {
                    await expedienteService.eliminarIrapCat3(deleteModal.id);
                    fetchUnidad();
                    showToast('success', 'IRAP Categoría 3 eliminado');
                  } else if (deleteModal.type === 'irap12') {
                    await expedienteService.eliminarIrapCat12(deleteModal.id);
                    fetchUnidad();
                    showToast('success', 'IRAP Categoría 1-2 eliminado');
                  } else if (deleteModal.type === 'informe') {
                    await expedienteService.eliminarInformeAnual(deleteModal.id);
                    fetchUnidad();
                    showToast('success', 'Informe Anual eliminado');
                  }
                } catch (err) {
                  showToast('error', 'Error al eliminar');
                }
                setDeleteModal(null);
              }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/admin/expediente" className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{unidad.nombre}</h1>
          <p className="text-gray-500">Código RAI: <span className="font-mono">{unidad.codigoRai}</span></p>
        </div>
        <div className="ml-auto flex gap-2">
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
          <button onClick={openEditUnidad} className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700">
            Editar
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'identificacion' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Datos de la Unidad Industrial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Código RAI</label>
                <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg">{unidad.codigoRai}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                <p className="text-gray-900">{unidad.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Razón Social</label>
                <p className="text-gray-900">{unidad.razonSocial}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                <p className="text-gray-900">{unidad.direccion}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Distrito</label>
                <p className="text-gray-900">{unidad.distrito}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{unidad.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Fase de Actividad</label>
                <p className="text-gray-900">{unidad.faseActividad}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Coordenadas (X, Y)</label>
                <p className="text-gray-900">{unidad.x && unidad.y ? `${unidad.x}, ${unidad.y}` : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">MSNM</label>
                <p className="text-gray-900">{unidad.msnm || '-'}</p>
              </div>
            </div>

            {unidad.representanteLegal && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-8">Representante Legal</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                    <p className="text-gray-900">{unidad.representanteLegal.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">CI</label>
                    <p className="text-gray-900 font-mono">{unidad.representanteLegal.ci}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                    <p className="text-gray-900">{unidad.representanteLegal.telefono || '-'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'rubros' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Agregar Rubro de Actividad</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Código CAEB"
                  value={nuevoRubro.codigoCaeb}
                  onChange={(e) => setNuevoRubro({ ...nuevoRubro, codigoCaeb: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={nuevoRubro.descripcion}
                  onChange={(e) => setNuevoRubro({ ...nuevoRubro, descripcion: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={nuevoRubro.categoria}
                  onChange={(e) => setNuevoRubro({ ...nuevoRubro, categoria: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Categoría</option>
                  <option value="1">Categoría 1</option>
                  <option value="2">Categoría 2</option>
                  <option value="3">Categoría 3</option>
                </select>
                <button
                  onClick={handleAddRubro}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rubrosList.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Sin rubros registrados</td></tr>
                ) : rubrosList.map((rubro: any) => (
                  <tr key={rubro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-indigo-600">{rubro.codigoCaeb}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{rubro.descripcion}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        rubro.categoria === 3 ? 'bg-rose-100 text-rose-800' :
                        rubro.categoria === 2 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>Categoría {rubro.categoria}</span>
                    </td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button onClick={() => openEditRubro(rubro)} className="text-indigo-600 hover:text-indigo-800">Editar</button>
                      <button onClick={() => handleDeleteRubro(rubro.id, rubro.descripcion)} className="text-red-600 hover:text-red-800">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'rai' && (
          <div className="space-y-6">
            {!rai ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No existe RAI para esta unidad industrial</p>
                <button
                  onClick={crearRAI}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                >
                  Crear RAI
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Registro Inicial RAI</h3>
                  {rai.registroInicial ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Fecha</label>
                        <p className="text-gray-900">{formatDate(rai.registroInicial.fechaRegistro)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Técnico</label>
                        <p className="text-gray-900">{rai.registroInicial.tecnicoDesignado}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Existe Archivo</label>
                        <p className="text-gray-900">{rai.registroInicial.existeEnArchivo ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Documento</label>
                        {rai.registroInicial.documentoKey ? (
                          <span className="text-emerald-600">✓ Documento subido</span>
                        ) : (
                          <div className="mt-1">
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => e.target.files?.[0] && handleFileUpload('rai-inicial', rai.registroInicial.id, e.target.files[0])} className="text-sm" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-end">
                        <button onClick={openEditRegistroInicial} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Editar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="date" value={registroInicial.fechaRegistro} onChange={(e) => setRegistroInicial({...registroInicial, fechaRegistro: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                      <input type="text" placeholder="Técnico designado" value={registroInicial.tecnicoDesignado} onChange={(e) => setRegistroInicial({...registroInicial, tecnicoDesignado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                      <button onClick={handleAddRegistroInicial} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">Guardar</button>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Agregar Historial RAI</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <select value={nuevoHistorial.estado} onChange={(e) => setNuevoHistorial({...nuevoHistorial, estado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Estado</option>
                      {ESTADOS_RAI.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                    </select>
                    <input type="text" placeholder="Causa/Razón" value={nuevoHistorial.causaRazon} onChange={(e) => setNuevoHistorial({...nuevoHistorial, causaRazon: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="date" value={nuevoHistorial.fechaRegistro} onChange={(e) => setNuevoHistorial({...nuevoHistorial, fechaRegistro: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="text" placeholder="Técnico" value={nuevoHistorial.tecnicoDesignado} onChange={(e) => setNuevoHistorial({...nuevoHistorial, tecnicoDesignado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <button onClick={handleAddHistorial} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">Agregar</button>
                  </div>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Causa/Razón</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Técnico</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Documento</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(!rai.historial || rai.historial.length === 0) ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin historial</td></tr>
                    ) : rai.historial.map((h: any) => (
                      <tr key={h.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            h.estado === 'RENOVACION' ? 'bg-emerald-100 text-emerald-800' :
                            h.estado === 'MODIFICACION' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>{h.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{h.causaRazon}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(h.fechaRegistro)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{h.tecnicoDesignado}</td>
                        <td className="px-4 py-3 text-sm">
                          {h.documentoKey ? (
                            <span className="text-emerald-600">✓</span>
                          ) : (
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => e.target.files?.[0] && handleFileUpload('rai-historial', h.id, e.target.files[0])} className="text-sm" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm flex gap-2">
                          <button onClick={() => openEditHistorial(h)} className="text-indigo-600 hover:text-indigo-800">Editar</button>
                          <button onClick={() => handleDeleteHistorial(h.id, h.estado, h.causaRazon)} className="text-red-600 hover:text-red-800">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {activeTab === 'irap-cat3' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Nuevo IRAP Categoría 3</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <select value={nuevoIrapCat3.documentoAmbiental} onChange={(e) => setNuevoIrapCat3({...nuevoIrapCat3, documentoAmbiental: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                  {TIPOS_IRAP_CAT3.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" value={nuevoIrapCat3.fechaInforme} onChange={(e) => setNuevoIrapCat3({...nuevoIrapCat3, fechaInforme: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <select value={nuevoIrapCat3.estado} onChange={(e) => setNuevoIrapCat3({...nuevoIrapCat3, estado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                  {ESTADOS_DOC.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                </select>
                <input type="text" placeholder="Técnico" value={nuevoIrapCat3.tecnicoDesignado} onChange={(e) => setNuevoIrapCat3({...nuevoIrapCat3, tecnicoDesignado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <button onClick={handleAddIrapCat3} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">Agregar</button>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Certificado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Técnico</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {irapCat3Data.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin registros</td></tr>
                ) : irapCat3Data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{item.documentoAmbiental}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.fechaInforme)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                        item.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>{item.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.certificadoAprobacion || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.tecnicoDesignado}</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button onClick={() => openEditIrapCat3(item)} className="text-indigo-600 hover:text-indigo-800">Editar</button>
                      <button onClick={() => handleDeleteIrapCat3(item.id, item.fechaInforme)} className="text-red-600 hover:text-red-800">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'irap-cat12' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Nuevo IRAP Categoría 1-2</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <select value={nuevoIrapCat12.documentoAmbiental} onChange={(e) => setNuevoIrapCat12({...nuevoIrapCat12, documentoAmbiental: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                  {TIPOS_IRAP_CAT12.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" value={nuevoIrapCat12.fechaInforme} onChange={(e) => setNuevoIrapCat12({...nuevoIrapCat12, fechaInforme: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <select value={nuevoIrapCat12.estado} onChange={(e) => setNuevoIrapCat12({...nuevoIrapCat12, estado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                  {ESTADOS_DOC.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                </select>
                <input type="text" placeholder="DAA" value={nuevoIrapCat12.daa} onChange={(e) => setNuevoIrapCat12({...nuevoIrapCat12, daa: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Técnico" value={nuevoIrapCat12.tecnicoDesignado} onChange={(e) => setNuevoIrapCat12({...nuevoIrapCat12, tecnicoDesignado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <button onClick={handleAddIrapCat12} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">Agregar</button>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">DAA</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Técnico</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {irapCat12Data.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin registros</td></tr>
                ) : irapCat12Data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{item.documentoAmbiental}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.fechaInforme)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                        item.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>{item.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.daa || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.tecnicoDesignado}</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button onClick={() => openEditIrapCat12(item)} className="text-indigo-600 hover:text-indigo-800">Editar</button>
                      <button onClick={() => handleDeleteIrapCat12(item.id, item.fechaInforme)} className="text-red-600 hover:text-red-800">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'informes' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Nuevo Informe Ambiental Anual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Gestión (año)" value={nuevoInforme.gestion} onChange={(e) => setNuevoInforme({...nuevoInforme, gestion: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" min="2000" max="2100" />
                  <input type="date" value={nuevoInforme.fechaInforme} onChange={(e) => setNuevoInforme({...nuevoInforme, fechaInforme: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <input type="text" placeholder="Técnico designado" value={nuevoInforme.tecnicoDesignado} onChange={(e) => setNuevoInforme({...nuevoInforme, tecnicoDesignado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Monitoreos Realizados</label>
                <div className="flex flex-wrap gap-2">
                  {MONITOREOS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonitoreo(m)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        nuevoInforme.monitoreos.includes(m)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddInforme} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                Agregar Informe
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Gestión</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monitoreos</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {informesData.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Sin informes</td></tr>
                ) : informesData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-indigo-600">{item.gestion}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.fechaInforme)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {(item.monitoreos || []).map((m: string, i: number) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{m}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.tecnicoDesignado}</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button onClick={() => openEditInforme(item)} className="text-indigo-600 hover:text-indigo-800">Editar</button>
                      <button onClick={() => handleDeleteInforme(item.id, `${item.gestion} - ${item.fechaInforme}`)} className="text-red-600 hover:text-red-800">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
