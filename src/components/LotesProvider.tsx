"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { LOTES, catalogo, type Catalogo, type Lote } from "@/content/lotes";

// Los lotes vigentes (la lista con los cambios de /panel, docs/0032) llegan del servidor y se reparten a los
// componentes de cliente: plano, ficha, formulario y chat. Sin proveedor, la lista sola.
const Contexto = createContext<Catalogo>(catalogo(LOTES));

export function LotesProvider({ lotes, children }: { lotes: Lote[]; children: ReactNode }) {
  const valor = useMemo(() => catalogo(lotes), [lotes]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export const useLotes = () => useContext(Contexto);
