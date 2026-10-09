"use client";

import { useEffect, useMemo, useState } from "react";
import { AVANCE, ENTREGA_ISO } from "@/content/avance";
import { Icon } from "./Icon";
import { Photo } from "./Photo";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];
const INICIO = new Date("2026-04-01T00:00:00");
const FIN = new Date(`${ENTREGA_ISO}T00:00:00`);
const pct = (d: Date) => Math.min(100, Math.max(0, ((+d - +INICIO) / (+FIN - +INICIO)) * 100));

/** Meses del cronograma; los de inicio de trimestre llevan rótulo también en celular. */
const MARCAS = (() => {
  const out: { x: number; txt: string; major: boolean }[] = [];
  const d = new Date(INICIO);
  while (d <= FIN) {
    const m = d.getMonth();
    out.push({ x: pct(d), txt: `${MESES[m]} ${String(d.getFullYear()).slice(2)}`, major: m % 3 === 0 });
    d.setMonth(m + 1);
  }
  return out;
})();

const FECHADOS = AVANCE.filter((h) => h.iso);

/** Cronograma de obra: cada toma fechada en su lugar real, de la primera toma a la entrega. */
export function Schedule() {
  const [sel, setSel] = useState(AVANCE.length - 1);
  // "Hoy" se calcula en el navegador para no congelar la fecha de compilación.
  const [hoy, setHoy] = useState<number | null>(null);
  useEffect(() => setHoy(pct(new Date())), []);

  const h = AVANCE[sel];
  const numero = useMemo(() => new Map(FECHADOS.map((x, i) => [x.toma, i + 1])), []);

  return (
    <div className="sched">
      <div className="ruler" role="group" aria-label="Cronograma de obra, de abril de 2026 a la entrega en julio de 2027">
        <div className="ruler__bar">
          {hoy !== null ? <div className="ruler__done" style={{ width: `${hoy}%` }} /> : null}
        </div>
        {MARCAS.map((m) => (
          <span key={m.txt} className={`ruler__tick label${m.major ? "" : " minor"}`} style={{ left: `${m.x}%` }}>
            {m.txt}
          </span>
        ))}
        {hoy !== null && hoy < 100 ? (
          <span className="ruler__hoy" style={{ left: `${hoy}%` }}>
            <span className="label">Hoy</span>
          </span>
        ) : null}
        <span className="ruler__end">
          <span className="label">Entrega</span>
          <br />
          <span className="label">jul 2027</span>
        </span>
        {FECHADOS.map((x) => {
          const i = AVANCE.indexOf(x);
          return (
            <button
              key={x.toma}
              type="button"
              className={`hito${(numero.get(x.toma) ?? 0) % 2 === 0 ? " alt" : ""}`}
              style={{ left: `${pct(new Date(`${x.iso}T00:00:00`))}%` }}
              aria-pressed={sel === i}
              aria-label={`${x.fecha}: ${x.titulo}`}
              onClick={() => setSel(i)}
            >
              {numero.get(x.toma)}
            </button>
          );
        })}
      </div>

      <div className="sched__detail" aria-live="polite">
        <Photo
          toma={h.toma}
          sello={`${h.fuente === "Drone" ? "Toma de drone" : "Foto de obra"} · ${h.fecha ?? "fecha por confirmar"}`}
          alt={`${h.titulo}. ${h.detalle}`}
          sizes="(max-width: 860px) 100vw, 640px"
          aspect="16 / 10"
        />
        <div>
          <h3>{h.titulo}</h3>
          <p>{h.detalle}</p>
          <div className="sched__nav">
            <button
              type="button"
              className="btn btn--small"
              onClick={() => setSel((s) => Math.max(0, s - 1))}
              disabled={sel === 0}
              aria-label="Toma anterior"
            >
              <Icon name="izq" size={18} />
            </button>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => setSel((s) => Math.min(AVANCE.length - 1, s + 1))}
              disabled={sel === AVANCE.length - 1}
              aria-label="Toma siguiente"
            >
              <Icon name="der" size={18} />
            </button>
          </div>
          <ul className="sched__list">
            {AVANCE.map((x, i) => (
              <li key={x.toma}>
                <button type="button" aria-pressed={sel === i} onClick={() => setSel(i)}>
                  <span className="label">{x.fecha ?? "Inicio"}</span>
                  <span>{x.titulo}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
