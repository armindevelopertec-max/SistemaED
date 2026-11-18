// Estados de registro de una unidad industrial.
export const ESTADOS_REGISTRO = ['VIGENTE', 'CADUCO', 'ANULADO', 'CIERRE'] as const;

export type EstadoRegistro = (typeof ESTADOS_REGISTRO)[number];

// Fases de actividad de una unidad industrial.
export const FASES_ACTIVIDAD = ['OPERACION', 'PRODUCCION'] as const;

export type FaseActividad = (typeof FASES_ACTIVIDAD)[number];
