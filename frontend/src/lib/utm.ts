// Conversión entre UTM (WGS84) y WGS84 (latitud/longitud).
// Bolivia usa la zona UTM 19S para el departamento de La Paz.

export interface LatLng {
  lat: number;
  lng: number;
}

const A = 6378137.0; // semi-eje mayor del elipsoide WGS84
const F = 1 / 298.257223563; // aplanamiento
const K0 = 0.9996; // factor de escala en el meridiano central
const E2 = F * (2 - F); // excentricidad al cuadrado
const EP2 = E2 / (1 - E2); // excentricidad secundaria al cuadrado
const E1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));
const FALSO_ESTE = 500000;

/** Meridiano central de una zona UTM, en radianes. */
export function meridianoCentral(zona: number): number {
  return (zona * 6 - 183) * (Math.PI / 180);
}

/** Longitud del meridiano central de una zona UTM (19 -> -69). */
export function longitudCentral(zona: number): number {
  return zona * 6 - 183;
}

/** Convierte coordenadas UTM a WGS84 (latitud/longitud). */
export function utmToLatLng(x: number, y: number, zona = 19, hemisferio: 'N' | 'S' = 'S'): LatLng | null {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const falsoNorte = hemisferio === 'S' ? 10000000 : 0;

  const m = (y - falsoNorte) / K0;
  const mu = m / (A * (1 - E2 / 4 - (3 * E2 * E2) / 64 - (5 * E2 * E2 * E2) / 256));
  const phi1 =
    mu +
    ((3 * E1) / 2 - (27 * Math.pow(E1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * E1 * E1) / 16 - (55 * Math.pow(E1, 4)) / 32) * Math.sin(4 * mu) +
    (151 * Math.pow(E1, 3) / 96) * Math.sin(6 * mu) +
    (1097 * Math.pow(E1, 4) / 512) * Math.sin(8 * mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const c1 = EP2 * cosPhi1 * cosPhi1;
  const t1 = tanPhi1 * tanPhi1;
  const n1 = A / Math.sqrt(1 - E2 * sinPhi1 * sinPhi1);
  const r1 = (A * (1 - E2)) / Math.pow(1 - E2 * sinPhi1 * sinPhi1, 1.5);
  const d = (x - FALSO_ESTE) / (n1 * K0);

  const lat =
    phi1 -
    ((n1 * tanPhi1) / r1) *
      (d * d / 2 -
        ((5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * EP2) * Math.pow(d, 4)) / 24 +
        ((61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * EP2 - 3 * c1 * c1) * Math.pow(d, 6)) / 720);

  const lng =
    (meridianoCentral(zona) +
      (d -
        ((1 + 2 * t1 + c1) * Math.pow(d, 3)) / 6 +
        ((5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * EP2 + 24 * t1 * t1) * Math.pow(d, 5)) / 120) /
        cosPhi1) *
    (180 / Math.PI);

  return { lat: lat * (180 / Math.PI), lng };
}

/** Convierte WGS84 (latitud/longitud) a coordenadas UTM. */
export function latLngToUtm(lat: number, lng: number, zona = 19, hemisferio: 'N' | 'S' = 'S'): { x: number; y: number } | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const falsoNorte = hemisferio === 'S' ? 10000000 : 0;

  const phi = lat * (Math.PI / 180);
  const lambda = lng * (Math.PI / 180) - meridianoCentral(zona);

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const tanPhi = Math.tan(phi);

  // Arco meridiano (Snyder 8-9)
  const m1 = 1 - E2 / 4 - (3 * E2 * E2) / 64 - (5 * E2 * E2 * E2) / 256;
  const m2 = (3 * E2) / 8 + (3 * E2 * E2) / 32 + (45 * E2 * E2 * E2) / 1024;
  const m3 = (15 * E2 * E2) / 256 + (45 * E2 * E2 * E2) / 1024;
  const m4 = (35 * E2 * E2 * E2) / 3072;
  const m = A * (m1 * phi - m2 * Math.sin(2 * phi) + m3 * Math.sin(4 * phi) - m4 * Math.sin(6 * phi));

  const c1 = EP2 * cosPhi * cosPhi;
  const t1 = tanPhi * tanPhi;
  const n1 = A / Math.sqrt(1 - E2 * sinPhi * sinPhi);

  const d = lambda * cosPhi;

  const x =
    FALSO_ESTE +
    K0 *
      n1 *
      (d +
        ((1 - t1 + c1) * Math.pow(d, 3)) / 6 +
        ((5 - 18 * t1 + t1 * t1 + 72 * c1 - 58 * EP2) * Math.pow(d, 5)) / 120);

  const y =
    falsoNorte +
    K0 *
      (m +
        n1 *
          tanPhi *
          (d * d / 2 +
            ((5 - t1 + 9 * c1 + 4 * c1 * c1) * Math.pow(d, 4)) / 24 +
            ((61 - 58 * t1 + t1 * t1 + 600 * c1 - 330 * EP2) * Math.pow(d, 6)) / 720));

  return { x: Math.round(x), y: Math.round(y) };
}
