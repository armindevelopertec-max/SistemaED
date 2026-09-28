export interface User {
  id: number;
  email: string;
  nombre: string;
  role: 'ADMINISTRADOR' | 'VISUALIZADOR';
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Tramite {
  id: number;
  hojaRuta: string;
  codigoRai: string;
  nombreTramite: string;
  nombreSolicitante: string;
  descripcion?: string;
  fechaCreacion: string;
  fechaVencimiento: string;
  estado: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO' | 'PENDIENTE';
  observaciones?: string;
  documentos: Documento[];
  createdAt: string;
  updatedAt: string;
}

export interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  rutaMinio: string;
  tamano: number;
  createdAt: string;
}

export interface CreateTramiteDto {
  hojaRuta: string;
  codigoRai: string;
  nombreTramite: string;
  nombreSolicitante: string;
  descripcion?: string;
  fechaVencimiento: string;
  observaciones?: string;
}

export interface TramiteStats {
  total: number;
  vigentes: number;
  porVencer: number;
  vencidos: number;
  pendientes: number;
}