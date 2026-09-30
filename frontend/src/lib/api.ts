import axios from 'axios';

export const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const usersService = {
  getAll: () => api.get('/api/users'),
  create: (data: any) => api.post('/api/users', data),
  update: (id: number, data: any) => api.patch(`/api/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
};

export const tramitesService = {
  getAll: (params?: { estado?: string; search?: string }) =>
    api.get('/api/tramites', { params }),
  getById: (id: number) => api.get(`/api/tramites/${id}`),
  create: (formData: FormData) =>
    api.post('/api/tramites', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: any) => api.patch(`/api/tramites/${id}`, data),
  delete: (id: number) => api.delete(`/api/tramites/${id}`),
  search: (params: { hojaRuta?: string; codigoRai?: string }) =>
    api.get('/api/tramites/buscar', { params }),
  generatePdf: (id: number) => api.post(`/api/tramites/${id}/pdf`),
  addDocumento: (id: number, formData: FormData) =>
    api.post(`/api/tramites/${id}/documentos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocumento: (id: number, documentoId: number) =>
    api.delete(`/api/tramites/${id}/documentos/${documentoId}`),
  getStats: () => api.get('/api/tramites/stats'),
};

export const minioService = {
  upload: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.post('/api/minio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUrl: (fileName: string) =>
    api.get(`/api/minio/url/${encodeURIComponent(fileName)}`),
  delete: (fileName: string) =>
    api.delete(`/api/minio/${encodeURIComponent(fileName)}`),
};

export const reportesService = {
  getEstados: () => api.get('/api/reportes/estados'),
  getPorVencer: (dias?: number) =>
    api.get('/api/reportes/por-vencer', { params: { dias } }),
};