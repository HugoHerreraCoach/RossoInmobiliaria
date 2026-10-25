"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MEDIA, type Toma } from "@/content/avance";
import { track } from "@/lib/tracking/client";
import { FINE_POINTER } from "@/lib/motion";

export type Toma4 = { toma: Toma; titulo: string; fecha: string; alt: string; grow: number };

/** Banda de cuatro vuelos de drone, de anchos desiguales. Con mouse, el panel señalado se ensancha
 *  y reproduce su video sin sonido; en el táctil, el botón lo reproduce o lo pausa.
 *  Los videos se descargan solo cuando se piden, no con movimiento pausado ni con ahorro de datos,
 *  y se detienen fuera de pantalla o con la pestaña oculta (rosso:motion). */
export function ObraBand({ tomas }: { tomas: Toma4[] }) {
  const [playing, setPlaying] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const band = useRef<HTMLDivElement>(null);
  const reported = useRef<Set<number>>(new Set());
  const userChose = useRef(false);

  const canAutoplay = () => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    return document.documentElement.dataset.motion !== "paused"
      && !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || "");
  };

  // user = el visitante lo pidió con el botón: solo eso se mide como video_play.
  const play = (i: number, user = false) => {
    setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
    setPlaying(i);
    if (!user) return;
    userChose.current = true;
    if (!reported.current.has(i)) {
      reported.current.add(i);
      track("video_play", { slide: i + 1 });
    }
  };

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === playing) void v.play().catch(() => setPlaying(null));
      else v.pause();
    });
  }, [playing, loaded]);

  useEffect(() => {
    const stop = () => setPlaying(null);
    // La toma principal se reproduce sola al entrar en pantalla (sin sonido), salvo que el visitante
    // ya haya elegido o pausado otra, o que el movimiento o los datos lo impidan.
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return stop();
      if (!userChose.current && canAutoplay()) play(0);
    }, { threshold: 0.4 });
    if (band.current) io.observe(band.current);
    const onMotion = () => { if (document.documentElement.dataset.motion === "paused") stop(); };
    const onHidden = () => { if (document.hidden) stop(); };
    window.addEventListener("rosso:motion", onMotion);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      io.disconnect();
      window.removeEventListener("rosso:motion", onMotion);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, []);

  return (
    <div className="obra-band" ref={band}>
      {tomas.map((t, i) => {
        const m = MEDIA[t.toma];
        const isOn = playing === i;
        return (
          <figure
            key={t.toma}
            className={`obra-band__panel ${isOn ? "is-playing" : ""}`}
            style={{ "--grow": t.grow } as CSSProperties}
            onPointerEnter={(e) => { if (e.pointerType === "mouse" && matchMedia(FINE_POINTER).matches && m.video && canAutoplay()) play(i); }}
            onPointerLeave={(e) => { if (e.pointerType === "mouse" && isOn) setPlaying(null); }}
          >
            <Image src={m.color} alt={t.alt} fill sizes="(max-width: 899px) 50vw, 40vw" />
            {m.video && loaded.has(i) ? (
              <video
                ref={(el) => { videos.current[i] = el; }}
                src={m.video}
                poster={m.color}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
              />
            ) : null}
            {m.video ? (
              <button
                type="button"
                className="obra-band__play"
                aria-pressed={isOn}
                aria-label={`${isOn ? "Pausar" : "Ver video"}: ${t.titulo}, ${t.fecha}`}
                onClick={() => { if (isOn) { userChose.current = true; setPlaying(null); } else play(i, true); }}
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
