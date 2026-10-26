import { cache } from "react";
import { LOTES, aplicarCambios, type CambioLote, type Lote } from "@/content/lotes";
import { db } from "./store";

/** Cambios guardados desde /panel (docs/0032), por código de lote. */
export async function cambiosLotes(): Promise<Record<string, CambioLote>> {
  return (await db<Record<string, CambioLote> | null>("lots")) ?? {};
}

/** Los lotes que muestra la web: la lista con los cambios del panel. Si la base no responde (por ejemplo, al compilar
 *  sin DATABASE_URL), la lista sola: la landing nunca se cae por esto. Una lectura por solicitud. */
let avisado = false;
export const lotesVigentes = cache(async (): Promise<Lote[]> => {
  try {
    return aplicarCambios(LOTES, await cambiosLotes());
  } catch (e) {
    // Una vez por proceso: al compilar sin base, cada una de las ~137 páginas pasaría por aquí.
    if (!avisado) console.error("[lotes] sin cambios del panel; se usa la lista:", e instanceof Error ? e.message : e);
    avisado = true;
    return LOTES;
  }
});
