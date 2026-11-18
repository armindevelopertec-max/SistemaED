'use client';

import { useEffect, useState } from 'react';
import { CATEGORIAS } from '@/lib/categorias';

interface SelectorCategoriaProps {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
}

/** Categoría (por id) a la que pertenece un valor guardado en la BD. */
const idDeValor = (valor: string): string => {
  if (!valor) return '';
  const categoria = CATEGORIAS.find((c) => c.valores.some((v) => String(v) === valor));
  return categoria ? String(categoria.id) : '';
};

/** Valor que se guarda en la BD para la categoría elegida. */
const valorDeId = (id: string): string => {
  if (!id) return '';
  const categoria = CATEGORIAS.find((c) => String(c.id) === id);
  return categoria ? String(categoria.valores[0]) : '';
};

/**
 * Selector de categoría de actividad industrial.
 * Muestra únicamente los nombres: "1 Y 2", "3" y "4".
 * La opción "1 Y 2" agrupa las categorías 1 y 2 en un solo valor, por eso un
 * rubro guardado con 1 o 2 se muestra como "1 Y 2" sin sub-opciones.
 */
export default function SelectorCategoria({
  value,
  onChange,
  placeholder = 'Seleccione una categoría',
  className = 'w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
}: SelectorCategoriaProps) {
  const [seleccion, setSeleccion] = useState<string>(() => idDeValor(value));

  useEffect(() => {
    setSeleccion(idDeValor(value));
  }, [value]);

  const cambiar = (id: string) => {
    setSeleccion(id);
    onChange(valorDeId(id));
  };

  return (
    <select
      value={seleccion}
      onChange={(e) => cambiar(e.target.value)}
      className={className}
    >
      <option value="">{placeholder}</option>
      {CATEGORIAS.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre}
        </option>
      ))}
    </select>
  );
}
