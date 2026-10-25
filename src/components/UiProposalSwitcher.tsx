"use client";

import { useEffect, useState } from "react";

export type UiTheme = "verde" | "rosso" | "oscuro";

const STORAGE_KEY = "rosso.ui.proposal.v2";

export function UiProposalSwitcher() {
  const [theme, setTheme] = useState<UiTheme>("verde");
  const [minimized, setMinimized] = useState(false);
  const [isPanel, setIsPanel] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/panel")) {
      setIsPanel(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("ui") as UiTheme | null;
    let initial: UiTheme = "verde";
    if (fromUrl === "verde" || fromUrl === "rosso" || fromUrl === "oscuro") {
      initial = fromUrl;
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as UiTheme | null;
        if (saved === "verde" || saved === "rosso" || saved === "oscuro") {
          initial = saved;
        }
      } catch {}
    }
    setTheme(initial);
    document.documentElement.dataset.ui = initial;
  }, []);

  const selectTheme = (next: UiTheme) => {
    setTheme(next);
    document.documentElement.dataset.ui = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set("ui", next);
    window.history.replaceState(null, "", url.toString());
  };

  if (isPanel) return null;

  return (
    <aside className="ui-switcher" aria-label="Selector de propuestas de diseño">
      {minimized ? (
        <button
          type="button"
          className="ui-switcher__fab"
          onClick={() => setMinimized(false)}
          title="Ver propuestas de diseño"
        >
          <span className="ui-switcher__dot" data-dot={theme} />
          <span>Propuestas UI</span>
        </button>
      ) : (
        <div className="ui-switcher__card">
          <div className="ui-switcher__head">
            <span>Fondo Blanco · Elige propuesta</span>
            <button
              type="button"
              className="ui-switcher__min"
              onClick={() => setMinimized(true)}
              aria-label="Minimizar selector de diseño"
              title="Minimizar"
            >
              —
            </button>
          </div>
          <div className="ui-switcher__btns" role="group" aria-label="Propuestas visuales">
            <button
              type="button"
              className={`ui-switcher__btn ${theme === "verde" ? "is-active" : ""}`}
              aria-pressed={theme === "verde"}
              onClick={() => selectTheme("verde")}
            >
              <span className="ui-switcher__swatch ui-switcher__swatch--verde" />
              <span>
                <strong>1. Blanco + Verde Campo</strong>
                <small>Natural, relajante con degradado</small>
              </span>
            </button>
            <button
              type="button"
              className={`ui-switcher__btn ${theme === "rosso" ? "is-active" : ""}`}
              aria-pressed={theme === "rosso"}
              onClick={() => selectTheme("rosso")}
            >
              <span className="ui-switcher__swatch ui-switcher__swatch--rosso" />
              <span>
                <strong>2. Blanco + Marca ROSSO</strong>
                <small>Carmesí · Naranja · Ámbar</small>
              </span>
            </button>
            <button
              type="button"
              className={`ui-switcher__btn ui-switcher__btn--compact ${theme === "oscuro" ? "is-active" : ""}`}
              aria-pressed={theme === "oscuro"}
              onClick={() => selectTheme("oscuro")}
              title="Ver versión con fondo oscuro"
            >
              <span>Fondo Oscuro</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
