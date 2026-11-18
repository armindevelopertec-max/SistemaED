// Distritos válidos del Departamento de La Paz (14 municipios/provincias).
// Se usan como opciones en los formularios de Unidad Industrial.
export interface Distrito {
  id: number;
  nombre: string;
}

export const DISTRITOS: Distrito[] = [
  { id: 1, nombre: 'Murillo' },
  { id: 2, nombre: 'Machaca' },
  { id: 3, nombre: 'San Pedro' },
  { id: 4, nombre: 'San Antonio' },
  { id: 5, nombre: 'Irupana' },
  { id: 6, nombre: 'Achacachi' },
  { id: 7, nombre: 'Palca' },
  { id: 8, nombre: 'San Francisco de Alta' },
  { id: 9, nombre: 'Viacha' },
  { id: 10, nombre: 'Chua Cocani' },
  { id: 11, nombre: 'El Alto' },
  { id: 12, nombre: 'Jesús de Machaca' },
  { id: 13, nombre: 'Patio de la Mina' },
  { id: 14, nombre: 'Chijini' },
];
