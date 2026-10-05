import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  inicioSesion: async (email: string, contrasena: string) => {
    const { data } = await api.post('/auth/inicio-sesion', { email, contrasena });
    localStorage.setItem('token', data.token_acceso);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data;
  },
  cerrarSesion: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },
  obtenerUsuario: () => {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  },
};

export const usuariosService = {
  listar: () => api.get('/users'),
  crear: (data: any) => api.post('/users', data),
  actualizar: (id: number, data: any) => api.patch(`/users/${id}`, data),
  eliminar: (id: number) => api.delete(`/users/${id}`),
};

export const expedienteService = {
  listarUnidadesIndustriales: (params?: { buscar?: string }) =>
    api.get('/expediente/unidades-industriales', { params }),
  obtenerUnidadIndustrial: (id: number) =>
    api.get(`/expediente/unidades-industriales/${id}`),
  crearUnidadIndustrial: (data: any) =>
    api.post('/expediente/unidades-industriales', data),
  actualizarUnidadIndustrial: (id: number, data: any) =>
    api.patch(`/expediente/unidades-industriales/${id}`, data),
  eliminarUnidadIndustrial: (id: number) =>
    api.delete(`/expediente/unidades-industriales/${id}`),

  agregarRubro: (unidadId: number, rubro: any) =>
    api.post(`/expediente/unidades-industriales/${unidadId}/rubros`, rubro),
  actualizarRubro: (rubroId: number, data: any) =>
    api.patch(`/expediente/rubros/${rubroId}`, data),
  eliminarRubro: (rubroId: number) =>
    api.delete(`/expediente/rubros/${rubroId}`),

  crearRAI: (unidadId: number) =>
    api.post(`/expediente/unidades-industriales/${unidadId}/rai`, {}),

  crearRegistroInicial: (unidadId: number, data: { fechaRegistro: string; tecnicoDesignado: string }) =>
    api.post(`/expediente/unidades-industriales/${unidadId}/rai/registro-inicial`, data),
  actualizarRegistroInicial: (id: number, data: any) =>
    api.patch(`/expediente/rai/registro-inicial/${id}`, data),

  agregarHistorialRAI: (raiId: number, data: { estado: string; causaRazon: string; fechaRegistro: string; tecnicoDesignado: string }) =>
    api.post(`/expediente/rai/${raiId}/historial`, data),
  actualizarHistorialRAI: (historialId: number, data: any) =>
    api.patch(`/expediente/rai/historial/${historialId}`, data),
  eliminarHistorialRAI: (historialId: number) =>
    api.delete(`/expediente/rai/historial/${historialId}`),

  listarRAI: (unidadId: number) =>
    api.get(`/expediente/unidades-industriales/${unidadId}/rai`),

  agregarIrapCat3: (unidadId: number, data: any) =>
    api.post(`/expediente/unidades-industriales/${unidadId}/irap-categoria3`, data),
  actualizarIrapCat3: (id: number, data: any) =>
    api.patch(`/expediente/irap-categoria3/${id}`, data),
  eliminarIrapCat3: (id: number) =>
    api.delete(`/expediente/irap-categoria3/${id}`),
  listarIrapCat3: (unidadId: number) =>
    api.get(`/expediente/unidades-industriales/${unidadId}/irap-categoria3`),

  agregarIrapCat12: (unidadId: number, data: any) =>
    api.post(`/expediente/unidades-industriales/${unidadId}/irap-categoria12`, data),
  actualizarIrapCat12: (id: number, data: any) =>
    api.patch(`/expediente/irap-categoria12/${id}`, data),
  eliminarIrapCat12: (id: number) =>
    api.delete(`/expediente/irap-categoria12/${id}`),
  listarIrapCat12: (unidadId: number) =>
    api.get(`/expediente/unidades-industriales/${unidadId}/irap-categoria12`),

  agregarInformeAnual: (unidadId: number, data: any) =>
    api.post(`/expediente/unidades-industriales/${unidadId}/informes-ambientales`, data),
  actualizarInformeAnual: (id: number, data: any) =>
    api.patch(`/expediente/informes-ambientales/${id}`, data),
  eliminarInformeAnual: (id: number) =>
    api.delete(`/expediente/informes-ambientales/${id}`),
  listarInformesAnuales: (unidadId: number) =>
    api.get(`/expediente/unidades-industriales/${unidadId}/informes-ambientales`),

  subirDocumento: (tipo: string, id: number, formData: FormData) => {
    let endpoint = '';
    switch (tipo) {
      case 'rai-inicial':
        endpoint = `/expediente/rai/documento/inicial/${id}`;
        break;
      case 'rai-historial':
        endpoint = `/expediente/rai/documento/historial/${id}`;
        break;
      case 'irap-cat3':
        endpoint = `/expediente/irap-categoria3/${id}/documento`;
        break;
      case 'irap-cat12':
        endpoint = `/expediente/irap-categoria12/${id}/documento`;
        break;
      case 'iaa':
        endpoint = `/expediente/informes-ambientales/${id}/documento`;
        break;
      default:
        throw new Error('Tipo de documento no válido');
    }
    return api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const minioService = {
  subir: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.post('/minio/subir', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  obtenerUrl: (fileName: string) =>
    api.get(`/minio/url/${encodeURIComponent(fileName)}`),
  eliminar: (fileName: string) =>
    api.delete(`/minio/${encodeURIComponent(fileName)}`),
};

export const reportesService = {
  obtenerUnidadesIndustriales: () => api.get('/reportes/unidades-industriales'),
  obtenerRAI: () => api.get('/reportes/rai'),
  obtenerIRAP: () => api.get('/reportes/irap'),
  obtenerIAA: () => api.get('/reportes/iaa'),
  obtenerExpediente: (id: number) => api.get(`/reportes/expediente/${id}`),
};
