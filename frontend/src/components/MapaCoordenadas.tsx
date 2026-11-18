'use client';

import { useEffect, useRef, useState } from 'react';
import { latLngToUtm, utmToLatLng } from '@/lib/utm';
import 'leaflet/dist/leaflet.css';

interface MapaCoordenadasProps {
  x?: number | null;
  y?: number | null;
  altura?: number;
  zona?: number;
  /** Permite fijar las coordenadas haciendo clic en el mapa. */
  interactivo?: boolean;
  onSeleccion?: (coordenadas: { x: number; y: number }) => void;
}

const CENTRO_POR_DEFECTO = { lat: -16.5543, lng: -68.1857 };

/**
 * Mapa con la ubicación de la unidad industrial.
 * Las coordenadas UTM (zona 19S) se convierten a WGS84 para dibujarlas.
 * Si es interactivo, al hacer clic devuelve las coordenadas UTM del punto.
 */
export default function MapaCoordenadas({
  x,
  y,
  altura = 320,
  zona = 19,
  interactivo = false,
  onSeleccion,
}: MapaCoordenadasProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<any>(null);
  const marcadorRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const onSeleccionRef = useRef(onSeleccion);
  const [listo, setListo] = useState(false);

  onSeleccionRef.current = onSeleccion;

  const tieneCoordenadas =
    typeof x === 'number' && typeof y === 'number' && Number.isFinite(x) && Number.isFinite(y);

  const posicion = tieneCoordenadas ? utmToLatLng(x as number, y as number, zona) : null;

  // Crear el mapa una sola vez
  useEffect(() => {
    let cancelado = false;

    const crear = async () => {
      if (!contenedorRef.current || mapaRef.current) return;
      const L = await import('leaflet');
      if (cancelado || !contenedorRef.current) return;
      leafletRef.current = L;

      const mapa = L.map(contenedorRef.current, {
        center: [CENTRO_POR_DEFECTO.lat, CENTRO_POR_DEFECTO.lng],
        zoom: 13,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapa);

      // Icono con CSS para no depender de los archivos de imagen de Leaflet
      const icono = L.divIcon({
        className: 'smia-marcador',
        html: '<div class="smia-marcador-punto"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      if (interactivo && onSeleccionRef.current) {
        mapa.on('click', (e: any) => {
          const utm = latLngToUtm(e.latlng.lat, e.latlng.lng, zona);
          if (utm && onSeleccionRef.current) {
            onSeleccionRef.current(utm);
          }
        });
      }

      mapaRef.current = mapa;
      setListo(true);
    };

    crear();

    return () => {
      cancelado = true;
      if (mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current = null;
        marcadorRef.current = null;
      }
    };
  }, [interactivo, zona]);

  // Sincronizar el marcador con las coordenadas
  useEffect(() => {
    const mapa = mapaRef.current;
    const L = leafletRef.current;
    if (!mapa || !L || !listo) return;

    if (!posicion) {
      if (marcadorRef.current) {
        mapa.removeLayer(marcadorRef.current);
        marcadorRef.current = null;
      }
      return;
    }

    const latLng: [number, number] = [posicion.lat, posicion.lng];

    if (!marcadorRef.current) {
      marcadorRef.current = L.marker(latLng, {
        icon: L.divIcon({
          className: 'smia-marcador',
          html: '<div class="smia-marcador-punto"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
        title: `X ${x} / Y ${y}`,
      }).addTo(mapa);
    } else {
      marcadorRef.current.setLatLng(latLng);
      marcadorRef.current.setPopupContent(`X ${x} / Y ${y}`);
    }

    mapa.setView(latLng, mapa.getZoom() ?? 13);
  }, [posicion?.lat, posicion?.lng, x, y, listo]);

  return (
    <div className="space-y-2">
      <div
        ref={contenedorRef}
        style={{ height: `${altura}px` }}
        className="w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
      />
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {posicion
            ? `X ${x} / Y ${y}  ·  ${posicion.lat.toFixed(6)}, ${posicion.lng.toFixed(6)}`
            : 'Sin coordenadas: ingrese X e Y para ubicar la unidad en el mapa'}
        </span>
        {interactivo && <span>Clic en el mapa para fijar las coordenadas</span>}
      </div>
      <style jsx global>{`
        .smia-marcador-punto {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #dc2626;
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
        }
        .leaflet-container {
          z-index: 0;
        }
      `}</style>
    </div>
  );
}
