"use client";

import { useEffect, useState } from "react";

type Paleta = "proyecto" | "rosso";

const OPCIONES: { id: Paleta; nombre: string; muestra: string }[] = [
  { id: "proyecto", nombre: "Proyecto", muestra: "#006f55" },
  { id: "rosso", nombre: "Rosso", muestra: "linear-gradient(115deg,#e8601a,#e0284f)" },
];

/** Apoyo para presentar la propuesta: cambia la paleta en vivo y la deja en la URL. */
export function PaletaSwitch() {
  const [p, setP] = useState<Paleta>("proyecto");

  useEffect(() => {
    const actual = document.documentElement.dataset.paleta as Paleta | undefined;
    if (actual === "rosso" || actual === "proyecto") setP(actual);
  }, []);

  const elegir = (id: Paleta) => {
    setP(id);
    document.documentElement.dataset.paleta = id;
    try {
      localStorage.setItem("paleta", id);
    } catch {
      /* sin almacenamiento: la URL basta */
    }
    const q = new URLSearchParams(window.location.search);
    q.set("paleta", id);
    window.history.replaceState(null, "", `?${q.toString()}${window.location.hash}`);
  };

  return (
    <div className="paleta" role="group" aria-label="Paleta de colores">
      <span className="label paleta__name">Paleta</span>
      <div className="paleta__opts">
        {OPCIONES.map((o) => (
          <button key={o.id} type="button" aria-pressed={p === o.id} onClick={() => elegir(o.id)} className="label">
            <i style={{ background: o.muestra }} />
            <span className="paleta__txt">{o.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
