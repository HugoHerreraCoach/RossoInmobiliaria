/* El plano oficial (src/content/plano.ts, docs/0019) girado para la pantalla (docs/0025).
   En escritorio la Vía a San Nicolás queda horizontal, abajo, y el plano llena el ancho; en el celular queda
   vertical, a la derecha, con el norte casi arriba. Se giran los puntos y no un grupo SVG, para que los rótulos
   sigan derechos; sin escalar, así `fs`, `ancho`, los grosores y los metros por unidad siguen valiendo. El ángulo
   sale de la vía del plano: si se regenera plano.ts, el giro se ajusta solo. */
import { PLANO, type LoteGeom, type Rotulo } from "./plano";

export type Orientacion = "horizontal" | "vertical";
export type Caja = [number, number, number, number];
type Punto = { x: number; y: number };

const VIA = PLANO.viaRotulos[0]?.angulo ?? 0;
/** Grados (horario) que se gira el plano oficial en cada orientación. */
export const GIRO: Record<Orientacion, number> = { horizontal: -VIA, vertical: -VIA - 90 };

const r1 = (n: number) => Math.round(n * 10) / 10;

function girador(grados: number) {
  const a = (grados * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const xy = (x: number, y: number): [number, number] => [r1(x * c - y * s), r1(x * s + y * c)];
  const punto = <T extends Punto>(p: T): T => {
    const [x, y] = xy(p.x, p.y);
    return { ...p, x, y };
  };
  // Las rutas del plano son "M x y L x y … Z", sin curvas: basta con girar cada par.
  const ruta = (d: string) => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, x: string, y: string) => xy(+x, +y).join(" "));
  // Los rótulos inclinados se dejan entre −90° y 90° para que se lean derechos.
  const angulo = (g = 0) => {
    const v = (((g + grados) % 180) + 180) % 180;
    return r1(v > 90 ? v - 180 : v);
  };
  return { xy, punto, ruta, angulo };
}

function puntosDe(d: string): [number, number][] {
  return [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
}

function caja(ps: [number, number][], margen: number): Caja {
  const xs = ps.map((p) => p[0]);
  const ys = ps.map((p) => p[1]);
  const x0 = Math.min(...xs) - margen;
  const y0 = Math.min(...ys) - margen;
  return [r1(x0), r1(y0), r1(Math.max(...xs) + margen - x0), r1(Math.max(...ys) + margen - y0)];
}

/** Lleva una caja a la proporción del lienzo, centrada (como assemble.py con las vistas de manzana). */
function aProporcion([x, y, w, h]: Caja, razon: number): Caja {
  if (w / h < razon) {
    const nw = h * razon;
    return [r1(x - (nw - w) / 2), y, r1(nw), h];
  }
  const nh = w / razon;
  return [x, r1(y - (nh - h) / 2), w, r1(nh)];
}

function girar(o: Orientacion) {
  const g = girador(GIRO[o]);
  const lotes = Object.fromEntries(
    Object.entries(PLANO.lotes).map(([id, l]) => [id, { ...g.punto(l), d: g.ruta(l.d) }]),
  ) as Record<string, LoteGeom>;
  const terreno = g.ruta(PLANO.terreno);
  const manzanasPuntos = Object.fromEntries(Object.entries(PLANO.manzanas).map(([mz, m]) => [mz, g.punto({ x: m.x, y: m.y })]));
  const viaRotulos: Rotulo[] = PLANO.viaRotulos.map((r) => ({ ...g.punto(r), angulo: g.angulo(r.angulo) }));

  // Lienzo: el terreno con sus rótulos de manzana, el pórtico y los nombres de la vía, más un margen. La vía y la
  // tierra siguen más allá y el viewBox las recorta, como en el plano original.
  const marcas = Object.values(manzanasPuntos).flatMap((p) => [[p.x - 12, p.y - 12], [p.x + 12, p.y + 12]] as [number, number][]);
  const lienzo = caja(
    [...puntosDe(terreno), ...marcas, ...viaRotulos.map((r) => [r.x, r.y] as [number, number]), [g.punto(PLANO.portico).x, g.punto(PLANO.portico).y]],
    28,
  );
  const razon = lienzo[2] / lienzo[3];

  const manzanas = Object.fromEntries(
    Object.entries(manzanasPuntos).map(([mz, p]) => {
      const ps = Object.entries(lotes).filter(([id]) => id.startsWith(mz)).flatMap(([, l]) => puntosDe(l.d));
      return [mz, { ...p, vista: aProporcion(caja([...ps, [p.x, p.y]], 26), razon) }];
    }),
  ) as Record<string, Punto & { vista: Caja }>;

  return {
    caja: lienzo,
    /** Grados (horario) desde arriba hacia donde apunta el norte. */
    norte: r1(PLANO.norte + GIRO[o]),
    /** Rosa de los vientos: esquina superior izquierda, que queda libre en las dos orientaciones. */
    rosa: { x: r1(lienzo[0] + 30), y: r1(lienzo[1] + 30) },
    terreno,
    via: g.ruta(PLANO.via),
    viaRotulos,
    portico: g.punto(PLANO.portico),
    parques: PLANO.parques.map(g.ruta),
    reservorio: { ...g.punto(PLANO.reservorio), d: g.ruta(PLANO.reservorio.d) },
    bermas: PLANO.bermas.map(g.ruta),
    calles: PLANO.calles.map((c) => ({ ...g.punto(c), angulo: g.angulo(c.angulo) })),
    amenidades: PLANO.amenidades.map(g.punto),
    manzanas,
    lotes,
  };
}

export type PlanoGirado = ReturnType<typeof girar>;

/** El plano en las dos orientaciones; se calcula una vez al cargar el módulo (igual en el servidor y en el navegador). */
export const PLANO_GIRADO: Record<Orientacion, PlanoGirado> = { horizontal: girar("horizontal"), vertical: girar("vertical") };
