"use client";

import { useEffect, useMemo, useState } from "react";
import { AVANCE, ENTREGA_ISO, MEDIA } from "@/content/avance";
import { Icon } from "./Icon";
import { Photo } from "./Photo";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
const INICIO = new Date("2026-04-01T00:00:00");
const FIN = new Date(`${ENTREGA_ISO}T00:00:00`);
const pct = (d: Date) => Math.min(100, Math.max(0, ((+d - +INICIO) / (+FIN - +INICIO)) * 100));

const MARCAS = (() => {
  const out: { x: number; txt: string; major: boolean }[] = [];
  const d = new Date(INICIO);
  while (d <= FIN) {
    const m = d.getMonth();
    out.push({ x: pct(d), txt: `${MESES[m]} '${String(d.getFullYear()).slice(2)}`, major: m % 3 === 0 });
    d.setMonth(m + 1);
  }
  return out;
})();

const FECHADOS = AVANCE.filter((h) => h.iso);

/** Cronograma interactivo y galería de avance físico con fotos y videos de drone fechados. */
export function Schedule() {
  const [sel, setSel] = useState(AVANCE.length - 1);
  const [hoy, setHoy] = useState<number | null>(null);
  useEffect(() => setHoy(pct(new Date())), []);

  const h = AVANCE[sel];
  const m = MEDIA[h.toma];
  const numero = useMemo(() => new Map(FECHADOS.map((x, i) => [x.toma, i + 1])), []);

  return (
    <div className="sched">
      {/* Barra temporal arquitectónica */}
      <div className="ruler-card">
        <div className="ruler-card__head">
          <div>
            <span className="eyebrow">Trazabilidad Verificable en Obra</span>
            <h4>Línea de tiempo de ejecución · Abril 2026 a Entrega Julio 2027</h4>
          </div>
          <div className="ruler-card__meta">
            <span className="ruler-pill">
              <Icon name="drone" size={15} /> {AVANCE.length} registros reales ({FECHADOS.length} fechados)
            </span>
            <span className="ruler-pill ruler-pill--accent">
              <Icon name="calendario" size={15} /> Entrega: Julio 2027
            </span>
          </div>
        </div>

        <div className="ruler" role="group" aria-label="Cronograma de obra, de abril de 2026 a la entrega en julio de 2027">
          <div className="ruler__bar">
            {hoy !== null ? <div className="ruler__done" style={{ width: `${hoy}%` }} /> : null}
          </div>
          {MARCAS.map((mk) => (
            <span key={mk.txt} className={`ruler__tick label${mk.major ? "" : " minor"}`} style={{ left: `${mk.x}%` }}>
              {mk.txt}
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
            <span className="label">Jul 2027</span>
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
      </div>

      <p className="section-disclaimer">La línea de tiempo indica fechas, no un porcentaje de avance físico de obra.</p>

      {/* Visor de Hito Activo + Selector de Bitácora */}
      <div className="sched__detail" aria-live="polite">
        <div className="sched__viewer">
          <Photo
            toma={h.toma}
            sello={`${h.fuente === "Drone" ? "Vuelo de Drone" : "Registro en Tierra"} · ${h.fecha ?? "Inicio de obra"}`}
            alt={`${h.titulo}. ${h.detalle}`}
            sizes="(max-width: 960px) 100vw, 720px"
            aspect="16 / 10"
          />
          <div className="sched__viewer-footer">
            <div className="sched__viewer-badges">
              <span className="sched__source-badge">
                <Icon name={h.fuente === "Drone" ? "drone" : "pin"} size={15} />
                {h.fuente === "Drone" ? "Toma Aérea de Drone" : "Fotografía en Terreno"}
              </span>
              {m.video ? <span className="sched__video-badge">Incluye Video HD</span> : null}
            </div>
            <div className="sched__nav">
              <button
                type="button"
                className="btn btn--small"
                onClick={() => setSel((s) => Math.max(0, s - 1))}
                disabled={sel === 0}
                aria-label="Toma anterior"
              >
                <Icon name="izq" size={17} /> Anterior
              </button>
              <button
                type="button"
                className="btn btn--small"
                onClick={() => setSel((s) => Math.min(AVANCE.length - 1, s + 1))}
                disabled={sel === AVANCE.length - 1}
                aria-label="Toma siguiente"
              >
                Siguiente <Icon name="der" size={17} />
              </button>
            </div>
          </div>
        </div>

        <div className="sched__sidebar">
          <div className="sched__current-card">
            <span className="sched__current-date">
              <Icon name="calendario" size={15} /> {h.fecha ?? "Apertura de obra"}
            </span>
            <h3>{h.titulo}</h3>
            <p>{h.detalle}</p>
          </div>

          <div className="sched__list-wrap">
            <span className="label sched__list-title">Bitácora completa de obra ({AVANCE.length} hitos)</span>
            <ul className="sched__list">
              {AVANCE.map((x, i) => {
                const hasVid = !!MEDIA[x.toma].video;
                return (
                  <li key={x.toma}>
                    <button type="button" aria-pressed={sel === i} onClick={() => setSel(i)}>
                      <span className="sched__item-date">{x.fecha ?? "Inicio"}</span>
                      <span className="sched__item-title">{x.titulo}</span>
                      <span className="sched__item-tag">{hasVid ? "Video" : "Foto"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
