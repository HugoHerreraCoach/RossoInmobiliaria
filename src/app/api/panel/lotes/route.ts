import { revalidatePath } from "next/cache";
import { LOTES, aplicarCambios, loteById, precioDe, type Estado, type PrecioPanel } from "@/content/lotes";
import { cambiosLotes } from "@/server/lotes";
import { db, rateLimit } from "@/server/store";
import { failure, HttpError, json, readJson, requireOrigin, requirePanel } from "@/server/security";
export const runtime = "nodejs";

// Estados de los lotes desde /panel (docs/0032). Solo con la sesión del administrador. Al guardar se revalidan las
// páginas que muestran lotes: la próxima visita ya los ve con su nuevo estado.
const ESTADOS: Estado[] = ["disponible", "reservado", "vendido"];
const PAGINAS: [string, "page"?][] = [["/"], ["/promocion"], ["/lote/[id]", "page"]];

async function vista() {
  const cambios = await cambiosLotes();
  return {
    lotes: aplicarCambios(LOTES, cambios).map((l, i) => ({ ...l, lista: LOTES[i].estado, precioLista: !!LOTES[i].precio, cambio: cambios[l.id] ?? null })),
  };
}

const monto = (v: unknown, nombre: string, min: number, max: number) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(422, `Revisa ${nombre}.`);
  return Math.round(n * 100) / 100;
};

function leerPrecio(v: unknown, area: number): PrecioPanel {
  if (!v || typeof v !== "object") throw new HttpError(422, "Precio inválido.");
  const p = v as Record<string, unknown>;
  const porM2 = monto(p.porM2, "el precio por m²", 1, 5000);
  const financiado = area * porM2;
  const inicial = monto(p.inicial, "la inicial", 0, financiado - 1);
  const promo = p.promoContado == null || p.promoContado === "" ? null : monto(p.promoContado, "la promoción al contado", 1, precioDe(area, { porM2, inicial, promoContado: null }).contado);
  return { porM2, inicial, promoContado: promo };
}

export async function GET(req: Request) {
  try {
    requirePanel(req);
    return json(await vista());
  } catch (e) {
    return failure(e);
  }
}

export async function POST(req: Request) {
  try {
    requireOrigin(req);
    requirePanel(req);
    await rateLimit(req, "panel-lotes", 60, 60);
    const b = await readJson(req);
    const lote = typeof b.id === "string" ? loteById(b.id) : undefined;
    if (!lote) throw new HttpError(422, "Ese lote no existe.");
    if (b.restaurar === true) {
      await db("lot_set", { id: lote.id, restaurar: true });
    } else {
      if (!ESTADOS.includes(b.estado as Estado)) throw new HttpError(422, "Elige disponible, reservado o vendido.");
      const precio = b.precio == null ? null : leerPrecio(b.precio, lote.m2);
      if (b.estado === "disponible" && !precio && !lote.precio) throw new HttpError(422, `El lote ${lote.id} no tiene precio en la lista: escribe el precio por m² y la inicial.`);
      await db("lot_set", { id: lote.id, estado: b.estado, precio });
    }
    for (const [ruta, tipo] of PAGINAS) {
      try { revalidatePath(ruta, tipo); } catch (e) { console.error("[lotes] no se pudo revalidar", ruta, e instanceof Error ? e.message : e); }
    }
    return json(await vista());
  } catch (e) {
    return failure(e);
  }
}
