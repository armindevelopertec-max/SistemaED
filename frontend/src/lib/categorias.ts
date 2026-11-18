// Categorías de actividad industrial.
// La primera agrupa las categorías 1 y 2 en una sola opción; las demás
// son literales. `valores` indica qué valores de la BD representa cada una.
export interface Categoria {
  id: number;
  nombre: string;
  valores: number[];
}

export const CATEGORIAS: Categoria[] = [
  { id: 1, nombre: '1 Y 2', valores: [1, 2] },
  { id: 2, nombre: '3', valores: [3] },
  { id: 3, nombre: '4', valores: [4] },
];

export const CATEGORIA_MIN = 1;
export const CATEGORIA_MAX = 4;

/** Nombre de la categoría a partir del valor guardado ("1 Y 2", "3" o "4"). */
export function nombreCategoria(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '';
  const categoria = CATEGORIAS.find((c) => c.valores.includes(valor));
  return categoria ? categoria.nombre : String(valor);
}
