"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DISPONIBLES, LISTA_FECHA, LOTES, MANZANAS, loteById, soles0, type Lote } from "@/content/lotes";
import { Ficha } from "./Ficha";
import { Icon } from "./Icon";

const PRECIO = "precio";
type Vista = string; // una manzana ("A"…"H") o "precio"

const porManzana = MANZANAS.map((mz) => ({
  mz,
  lotes: LOTES.filter((l) => l.manzana === mz),
  libres: LOTES.filter((l) => l.manzana === mz && l.estado === "disponible").length,
}));

const porPrecio = [...DISPONIBLES].sort((a, b) => a.precio!.cuota - b.precio!.cuota);

/** Avisa al formulario de contacto qué lote eligió el visitante. */
export function anunciarLote(id: string) {
  window.dispatchEvent(new CustomEvent("campina:lote", { detail: id }));
}

function leerUrl(): { vista: Vista | null; lote: string | null } {
  const q = new URLSearchParams(window.location.search);
  const lote = q.get("lote");
  const vista = q.get("vista");
  return { vista: vista === PRECIO || (vista && MANZANAS.includes(vista)) ? vista : null, lote };
}

export function LotStack() {
  const [vista, setVista] = useState<Vista>("C");
  const [soloLibres, setSoloLibres] = useState(false);
  const [sel, setSel] = useState<Lote | null>(null);
  const [flip, setFlip] = useState(0);

  // Estado inicial y botón "atrás": la URL manda.
  useEffect(() => {
    const sync = () => {
      const { vista: v, lote } = leerUrl();
      const l = lote ? loteById(lote) ?? null : null;
      setSel(l);
      if (v) setVista(v);
      else if (l) setVista(l.manzana);
      setFlip((n) => n + 1);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const escribirUrl = useCallback((v: Vista, l: Lote | null) => {
    const q = new URLSearchParams(window.location.search);
    q.set("vista", v);
    if (l) q.set("lote", l.id);
    else q.delete("lote");
    window.history.pushState(null, "", `?${q.toString()}#lotes`);
  }, []);

  const elegirVista = (v: Vista) => {
    setVista(v);
    escribirUrl(v, sel);
  };

  const elegirLote = (l: Lote) => {
    if (l.estado !== "disponible") return;
    setSel(l);
    setFlip((n) => n + 1);
    escribirUrl(vista, l);
  };

  const lista = useMemo(() => {
    if (vista === PRECIO) return porPrecio;
    const ls = porManzana.find((m) => m.mz === vista)?.lotes ?? [];
    return soloLibres ? ls.filter((l) => l.estado === "disponible") : ls;
  }, [vista, soloLibres]);

  const tabs: { id: Vista; label: string; sub: string }[] = porManzana.map((m) => ({
    id: m.mz,
    label: m.mz,
    sub: `${m.libres} libres`,
  }));

  // La manzana a la que se vuelve al dejar el orden por cuota.
  const [ultimaMz, setUltimaMz] = useState("C");
  useEffect(() => {
    if (vista !== PRECIO) setUltimaMz(vista);
  }, [vista]);

  const onKeyTabs = (e: React.KeyboardEvent) => {
    const i = Math.max(0, tabs.findIndex((t) => t.id === vista));
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      elegirVista(n.id);
      document.getElementById(`tab-${n.id}`)?.focus();
    }
  };

  return (
    <div className="lots">
      <div>
        <div className="tabs" role="tablist" aria-label="Manzanas" onKeyDown={onKeyTabs}>
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              className="tab"
              aria-selected={vista === t.id}
              aria-controls="panel-lotes"
              tabIndex={vista === t.id || (vista === PRECIO && t.id === ultimaMz) ? 0 : -1}
              onClick={() => elegirVista(t.id)}
            >
              {t.label}
              <small>{t.sub}</small>
            </button>
          ))}
        </div>

        <div className="mz" id="panel-lotes" role="tabpanel" aria-labelledby={`tab-${vista}`}>
          <div className="mz__head">
            <h3>
              {vista === PRECIO
                ? `${porPrecio.length} lotes libres, de la cuota más baja a la más alta`
                : `Manzana ${vista}`}
            </h3>
            <div className="sort">
              {vista !== PRECIO ? (
                <label className="toggle">
                  <input type="checkbox" checked={soloLibres} onChange={(e) => setSoloLibres(e.target.checked)} />
                  Solo disponibles
                </label>
              ) : null}
              <button
                type="button"
                className="btn btn--small"
                aria-pressed={vista === PRECIO}
                onClick={() => elegirVista(vista === PRECIO ? ultimaMz : PRECIO)}
              >
                {vista === PRECIO ? "Volver a la manzana " + ultimaMz : "Ordenar por cuota"}
              </button>
            </div>
          </div>

          <div className="grid-lots">
            {lista.map((l) => (
              <button
                key={l.id}
                type="button"
                className="lot"
                data-estado={l.estado}
                aria-pressed={sel?.id === l.id}
                aria-disabled={l.estado !== "disponible"}
                aria-label={
                  l.estado === "disponible"
                    ? `Lote ${l.id}, ${l.m2} metros cuadrados, cuota ${soles0(l.precio!.cuota)} al mes`
                    : `Lote ${l.id}, ${l.estado}`
                }
                onClick={() => elegirLote(l)}
              >
                <b>{l.id}</b>
                <span>{l.m2} m²</span>
                <span>{l.estado === "disponible" ? `${soles0(l.precio!.cuota)}/mes` : l.estado}</span>
              </button>
            ))}
          </div>

          <div className="legend" aria-hidden="true">
            <span>
              <i /> Disponible
            </span>
            <span>
              <i className="r" /> Reservado
            </span>
            <span>
              <i className="v" /> Vendido
            </span>
          </div>
          <p className="note">
            Esquema por manzana para elegir rápido: el orden sigue la numeración de la lista, no es el plano a escala.
            Disponibilidad al {LISTA_FECHA}.
          </p>
        </div>
      </div>

      <aside className="ficha panel" aria-live="polite">
        <div className="band">
          <h3>{sel ? `Ficha técnica · lote ${sel.id}` : "Ficha técnica"}</h3>
        </div>
        <div key={flip}>
          {sel ? (
            <Ficha lote={sel} onPedir={(l) => anunciarLote(l.id)} />
          ) : (
            <div className="ficha__empty">
              <Icon name="plano" size={40} />
              <p>Toca un lote libre para ver su precio, la inicial y la cuota exacta.</p>
              <button
                type="button"
                className="btn btn--small"
                onClick={() => {
                  setVista(PRECIO);
                  escribirUrl(PRECIO, null);
                }}
              >
                Ver los más económicos
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
