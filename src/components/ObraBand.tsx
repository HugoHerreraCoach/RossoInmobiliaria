"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MEDIA, type Toma } from "@/content/avance";
import { track } from "@/lib/tracking/client";

export type Toma4 = { toma: Toma; titulo: string; fecha: string; alt: string; grow: number };

/** Banda de cuatro vuelos de drone, de anchos desiguales. Los cuatro videos se reproducen solos y sin
 *  sonido mientras la banda está en pantalla; con mouse, el panel señalado se ensancha. Cada panel tiene
 *  su botón para pausar o reanudar. Sin movimiento (pausado o reducido) o con ahorro de datos no se
 *  descarga ningún video hasta que el visitante lo pide; fuera de pantalla o con la pestaña oculta se
 *  detienen (rosso:motion, visibilitychange). */
export function ObraBand({ tomas }: { tomas: Toma4[] }) {
  const [enPantalla, setEnPantalla] = useState(false);
  const [permitido, setPermitido] = useState(false);
  const [pausados, setPausados] = useState<Set<number>>(() => new Set());
  const [pedidos, setPedidos] = useState<Set<number>>(() => new Set());
  const [cargados, setCargados] = useState<Set<number>>(() => new Set());
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const band = useRef<HTMLDivElement>(null);
  const reported = useRef<Set<number>>(new Set());

  const suena = (i: number) => !!MEDIA[tomas[i].toma].video && enPantalla && !pausados.has(i) && (permitido || pedidos.has(i));

  useEffect(() => {
    const revisar = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      setPermitido(document.documentElement.dataset.motion !== "paused"
        && !matchMedia("(prefers-reduced-motion: reduce)").matches
        && !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || ""));
    };
    revisar();
    let visible = false;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; setEnPantalla(visible && !document.hidden); }, { threshold: 0.25 });
    if (band.current) io.observe(band.current);
    const onHidden = () => setEnPantalla(visible && !document.hidden);
    window.addEventListener("rosso:motion", revisar);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      io.disconnect();
      window.removeEventListener("rosso:motion", revisar);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, []);

  // Un video se monta (y se descarga) la primera vez que debe sonar; después solo se pausa o reanuda.
  useEffect(() => {
    const nuevos = tomas.map((_, i) => i).filter((i) => suena(i) && !cargados.has(i));
    if (nuevos.length) setCargados((prev) => new Set([...prev, ...nuevos]));
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (suena(i)) void v.play().catch(() => undefined);
      else v.pause();
    });
  });

  const alternar = (i: number) => {
    if (suena(i)) {
      setPausados((prev) => new Set(prev).add(i));
      return;
    }
    setPausados((prev) => { const next = new Set(prev); next.delete(i); return next; });
    setPedidos((prev) => new Set(prev).add(i));
    // Solo se mide como video_play cuando el visitante lo pide con el botón.
    if (!reported.current.has(i)) {
      reported.current.add(i);
      track("video_play", { slide: i + 1 });
    }
  };

  return (
    <div className="obra-band" ref={band}>
      {tomas.map((t, i) => {
        const m = MEDIA[t.toma];
        const isOn = suena(i);
        return (
          <figure
            key={t.toma}
            className={`obra-band__panel ${isOn ? "is-playing" : ""}`}
            style={{ "--grow": t.grow } as CSSProperties}
          >
            <Image src={m.color} alt={t.alt} fill sizes="(max-width: 899px) 50vw, 40vw" />
            {m.video && cargados.has(i) ? (
              <video
                ref={(el) => { videos.current[i] = el; }}
                src={m.video}
                poster={m.color}
                muted
                loop
                autoPlay
                playsInline
                preload="auto"
                aria-hidden="true"
              />
            ) : null}
            {i === 0 ? <h3 className="obra-band__title">{t.titulo}</h3> : null}
            <figcaption className="obra-band__label">
              {i === 0 ? null : <span>{t.titulo}</span>}
              <span>{t.fecha}</span>
            </figcaption>
            {m.video ? (
              <button
                type="button"
                className="obra-band__play"
                aria-pressed={isOn}
                aria-label={`${isOn ? "Pausar" : "Ver video"}: ${t.titulo}, ${t.fecha}`}
                onClick={() => alternar(i)}
              >
                {isOn ? "Pausar" : "Ver video"}
              </button>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
