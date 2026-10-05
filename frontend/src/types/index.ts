export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMINISTRADOR' | 'VISUALIZADOR';
}

export interface LoginResponse {
  token_acceso: string;
  usuario: Usuario;
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

export interface RepresentanteLegal {
  nombre: string;
  ci: string;
  telefono: string;
}

export interface RubroCAEB {
  codigoCaeb: string;
  descripcion: string;
  categoria: string;
}

export interface UnidadIndustrial {
  id: number;
  codigoRai: string;
  nombre: string;
  razonSocial: string;
  direccion: string;
  distrito: number;
  email?: string;
  estado: string;
  categoria: number;
  representanteLegal: RepresentanteLegal;
  rubros: RubroCAEB[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnidadIndustrialDto {
  codigoRai: string;
  nombre: string;
  razonSocial: string;
  direccion: string;
  distrito: number;
  email?: string;
  representanteLegal: RepresentanteLegal;
  rubros: RubroCAEB[];
}
