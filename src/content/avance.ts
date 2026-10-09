import media from "./media.json";

// Avance de obra con la fecha real de cada toma (metadato creation_time del video
// o fecha del archivo). Solo se describe lo que se ve en la imagen.

export type Toma = keyof typeof media;

export type Hito = {
  toma: Toma;
  fecha: string | null; // null = fecha por confirmar
  /** Fecha ISO para ubicar el hito en el cronograma (null = sin fecha confiable). */
  iso: string | null;
  titulo: string;
  detalle: string;
  fuente: "Drone" | "Foto de obra";
};

export const AVANCE: Hito[] = [
  {
    toma: "apertura",
    fecha: null,
    iso: null,
    titulo: "Apertura de vías",
    detalle: "Cargador frontal abriendo y nivelando las calles del proyecto.",
    fuente: "Foto de obra",
  },
  {
    toma: "ingreso-abr",
    fecha: "11 abr 2026",
    iso: "2026-04-11",
    titulo: "Ingreso, cerco de caña y primer grass",
    detalle: "El frente sobre la vía ya tiene cerco de caña, pórtico y área verde en la entrada.",
    fuente: "Drone",
  },
  {
    toma: "trazado-jun",
    fecha: "25 jun 2026",
    iso: "2026-06-25",
    titulo: "Lotes trazados con cal",
    detalle: "Cada lote y cada calle marcados en el terreno, listos para ubicar el tuyo.",
    fuente: "Drone",
  },
  {
    toma: "general-jul",
    fecha: "21 jul 2026",
    iso: "2026-07-21",
    titulo: "Las manzanas, de punta a punta",
    detalle: "Vista general del trazado completo, con el verde del valle al fondo.",
    fuente: "Drone",
  },
  {
    toma: "estructura-set",
    // El reloj de la GoPro está desfasado; la misma escena aparece en el video
    // de celular del 17 set 2026 (20260917_111635.mp4), así que se fecha por mes.
    fecha: "set 2026",
    iso: "2026-09-17",
    titulo: "Obra civil en curso",
    detalle: "Columnas de acero levantándose y cuadrilla trabajando en el terreno.",
    fuente: "Foto de obra",
  },
];

export const MEDIA = media;

/** Fin del cronograma: entrega comprometida del proyecto. */
export const ENTREGA_ISO = "2027-07-31";
