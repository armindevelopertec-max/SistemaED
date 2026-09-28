import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    Cookies.set('token', data.access_token, { expires: 1 });
    Cookies.set('user', JSON.stringify(data.user), { expires: 1 });
    return data;
  },
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
  },
  getUser: () => {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const usersService = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const tramitesService = {
  getAll: (params?: { estado?: string; search?: string }) =>
    api.get('/tramites', { params }),
  getById: (id: number) => api.get(`/tramites/${id}`),
  create: (formData: FormData) =>
    api.post('/tramites', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: any) => api.patch(`/tramites/${id}`, data),
  delete: (id: number) => api.delete(`/tramites/${id}`),
  search: (params: { hojaRuta?: string; codigoRai?: string }) =>
    api.get('/tramites/buscar', { params }),
  generatePdf: (id: number) => api.post(`/tramites/${id}/pdf`),
  addDocumento: (id: number, formData: FormData) =>
    api.post(`/tramites/${id}/documentos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocumento: (id: number, documentoId: number) =>
    api.delete(`/tramites/${id}/documentos/${documentoId}`),
  getStats: () => api.get('/tramites/stats'),
};

export const minioService = {
  upload: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.post('/minio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUrl: (fileName: string) =>
    api.get(`/minio/url/${encodeURIComponent(fileName)}`),
  delete: (fileName: string) =>
    api.delete(`/minio/${encodeURIComponent(fileName)}`),
};

export const reportesService = {
  getEstados: () => api.get('/reportes/estados'),
  getPorVencer: (dias?: number) =>
    api.get('/reportes/por-vencer', { params: { dias } }),
};