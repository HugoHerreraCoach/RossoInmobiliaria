// Fuente: Drive Rosso › Lista de precios ›
// "PRECIOS LA CAMPIÑA ACTUALIZADO 21.08.26 ASESORES.xlsx" (hoja "Precios setiembre").
// Al actualizar la lista, editar solo este archivo y LISTA_FECHA.

export const LISTA_FECHA = "21/08/2026";
export const CUOTAS = 48;

export type Estado = "disponible" | "vendido" | "reservado";

export type Lote = {
  id: string; // "C12"
  manzana: string; // "C"
  numero: number;
  m2: number;
  estado: Estado;
  /** Solo para lotes disponibles. */
  precio?: {
    porM2: number;
    financiado: number;
    inicial: number;
    cuota: number;
    contado: number;
    promoContado: number | null;
  };
};

type Disp = [m2: number, porM2: number, inicial: number, cuota: number, contado: number, promo: number | null];
type Fila = Disp | number | ["R", number];

// Filas por manzana en orden de lote. Número suelto = vendido (m²). ["R", m²] = reservado.
const S56: Disp = [510, 56, 4000, 511.67, 24276.0, null];
const S49: Disp = [510, 49, 4000, 437.29, 21241.5, null];
const S49P: Disp = [510, 49, 4000, 437.29, 21241.5, 20000];

const TABLA: Record<string, Fila[]> = {
  A: [548, 510, 532, 534, 536,
    [539, 42, 3000, 409.13, 19242.3, 18000],
    [541, 42, 3000, 410.88, 19313.7, 18000],
    543, 545],
  B: [
    [588, 49, 4000, 516.92, 24490.2, null],
    [592, 42, 4000, 434.67, 21134.4, 20000],
    [578, 42, 3000, 443.25, 20634.6, 20000],
    [564, 42, 3000, 431.0, 20134.8, 20000],
    [550, 42, 3000, 418.75, 19635.0, 18500],
    [537, 42, 3000, 407.38, 19170.9, 18000],
    523, 517, 510],
  C: [514,
    [533, 42, 3000, 403.88, 19028.1, 18000],
    [516, 42, 3000, 389.0, 18421.2, 17000],
    [602, 63, 5000, 685.96, 32237.1, null],
    [516, 56, 4000, 518.67, 24561.6, null],
    [1487, 49, 15000, 1205.48, 61933.55, null],
    [1382, 49, 10000, 1202.46, 57560.3, null],
    597, S56, S56, S56, S56, S49P, S49P,
    510, 510, 510, 510, 510,
    [534, 42, 3000, 404.75, 19063.8, 18000]],
  D: [517,
    [735, 63, 6000, 839.69, 39359.25, null],
    S56, 510,
    [510, 49, 3500, 447.71, 21241.5, 20000],
    510, 510, 510, 510, 510, 510, 510, 510, 510,
    ["R", 510],
    [1647, 63, 30000, 1536.69, 88196.85, null],
    [1600, 49, 15000, 1320.83, 66640.0, null],
    510, 510, 510,
    S56, S56, S56, S56, S56, S56,
    510, 510, 510, 510, 510, 510, 510, 510],
  E: [765,
    [765, 56, 6000, 767.5, 36414.0, null],
    [758, 63, 7000, 849.04, 40590.9, null],
    [675, 49, 4000, 605.73, 28113.75, null],
    [539, 63, 4000, 624.1, 28863.45, null],
    [601, 56, 4000, 617.83, 28607.6, null],
    [698, 59, 5000, 753.79, 35004.7, null],
    [683, 49, 4000, 613.9, 28446.95, null]],
  F: [510, 510, S56, S56,
    [510, 63, 4000, 586.04, 27310.5, null],
    510, 510, 510, 510, 510,
    [1550, 42, 15000, 1043.75, 55335.0, null],
    [1658, 49, 15000, 1380.04, 69055.7, null],
    510, 510,
    S56, S56, S56, S56, S49, S49, S49],
  G: [511, 510, 510, 510,
    S49P, S49, S56, S56, S56, S56, S56, S56, S56, S49P,
    510, 510, 510,
    [510, 42, 3000, 383.75, 18207.0, 17000],
    510,
    [510, 42, 3000, 383.75, 18207.0, 17000],
    [1265, 42, 10000, 898.54, 45160.5, null]],
  H: [562, 545, 549, 652,
    [646, 56, 5000, 649.5, 30749.6, null],
    S56, S56, S49P, S49P,
    [1392, 42, 10000, 1009.67, 49694.4, null]],
};

export const MANZANAS = Object.keys(TABLA);

export const LOTES: Lote[] = MANZANAS.flatMap((mz) =>
  TABLA[mz].map((f, i): Lote => {
    const base = { id: `${mz}${i + 1}`, manzana: mz, numero: i + 1 };
    if (typeof f === "number") return { ...base, m2: f, estado: "vendido" };
    if (f[0] === "R") return { ...base, m2: f[1], estado: "reservado" };
    const [m2, porM2, inicial, cuota, contado, promo] = f as Disp;
    return {
      ...base,
      m2,
      estado: "disponible",
      precio: { porM2, financiado: m2 * porM2, inicial, cuota, contado, promoContado: promo },
    };
  }),
);

export const loteById = (id: string) => LOTES.find((l) => l.id.toUpperCase() === id.toUpperCase());

export const DISPONIBLES = LOTES.filter((l) => l.estado === "disponible");

/** El lote disponible con la cuota más baja: base de todo "desde". */
export const DESDE = DISPONIBLES.reduce((a, b) => (b.precio!.cuota < a.precio!.cuota ? b : a));
export const DESDE_CONTADO = Math.min(
  ...DISPONIBLES.map((l) => l.precio!.promoContado ?? l.precio!.contado),
);
export const M2_MIN = Math.min(...LOTES.map((l) => l.m2));
export const M2_MAX = Math.max(...LOTES.map((l) => l.m2));

export const resumen = () => ({
  total: LOTES.length,
  disponibles: DISPONIBLES.length,
  vendidos: LOTES.filter((l) => l.estado === "vendido").length,
  reservados: LOTES.filter((l) => l.estado === "reservado").length,
});

const pen = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pen0 = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 });
// Espacio duro: el símbolo y la unidad no se separan de la cifra al partir la línea.
export const soles = (n: number) => `S/\u00a0${pen.format(n)}`;
export const soles0 = (n: number) => `S/\u00a0${pen0.format(n)}`;
export const m2 = (n: number) => `${pen0.format(n)}\u00a0m²`;
