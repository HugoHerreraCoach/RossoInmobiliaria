"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type Pestana = { id: string; etiqueta: string; icon: IconName; contenido: ReactNode };

/** Pestañas accesibles (flechas, Inicio y Fin) para resolver las dudas de quien decide: ubicación,
 *  financiamiento y papeles. El contenido llega ya armado desde el servidor. */
export function DecisionTabs({ pestanas }: { pestanas: Pestana[] }) {
  const [sel, setSel] = useState(0);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const syncHash = () => {
      if (window.location.hash === "#ubicacion") {
        const idx = pestanas.findIndex((p) => p.id === "ubicacion");
        if (idx >= 0) setSel(idx);
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pestanas]);

  const teclado = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = pestanas.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    setSel(next);
    botones.current[next]?.focus();
  };
  const actual = pestanas[sel];
  return (
    <div id="ubicacion" className="tabs">
      <div className="tabs__nav" role="tablist" aria-label="Lo que necesitas para decidir">
        {pestanas.map((p, i) => (
          <button
            key={p.id}
            id={`tab-${p.id}`}
            ref={(el) => { botones.current[i] = el; }}
            type="button"
            role="tab"
            aria-selected={sel === i}
            aria-controls="tab-panel"
            tabIndex={sel === i ? 0 : -1}
            className={`tabs__btn ${sel === i ? "is-active" : ""}`}
            onClick={() => setSel(i)}
            onKeyDown={(e) => teclado(e, i)}
          >
            <Icon name={p.icon} size={18} />
            {p.etiqueta}
          </button>
        ))}
      </div>
      <div id="tab-panel" className="tabs__panel" role="tabpanel" aria-labelledby={`tab-${actual.id}`} tabIndex={0}>
        {actual.contenido}
      </div>
    </div>
  );
}
