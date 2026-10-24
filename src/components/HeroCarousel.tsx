"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MEDIA, type Toma } from "@/content/avance";
import { Icon } from "./Icon";
import { track } from "@/lib/tracking/client";

type Slide = {
  toma: Toma;
  fecha: string;
  tag: string;
  titulo: string;
  subtitulo: string;
};

const SLIDES: Slide[] = [
  {
    toma: "hero",
    fecha: "junio 2026",
    tag: "Vista aérea",
    titulo: "Conoce el terreno real",
    subtitulo: "Toma de drone del trazado de lotes y vías frente a los cerros del Valle de Zaña.",
  },
  // Desde la 2, imágenes referenciales sin video (docs/0024): tomas de dron retocadas con IA y un render del
  // proyecto terminado. No llevan fecha y su subtítulo dice que son referenciales.
  {
    toma: "ingreso-vista",
    fecha: "imagen referencial",
    tag: "El ingreso",
    titulo: "La bienvenida a La Campiña",
    subtitulo: "Acceso principal sobre la vía a San Nicolás, frente a los cerros del valle. Imagen referencial.",
  },
  {
    toma: "parcelas-aerea",
    fecha: "imagen referencial",
    tag: "El entorno",
    titulo: "El valle, desde otra perspectiva",
    subtitulo: "A 6 minutos de Saltur y 8 minutos de Cayaltí. Imagen referencial.",
  },
  {
    toma: "render-ingreso",
    fecha: "imagen referencial",
    tag: "Proyección",
    titulo: "Así se verá el ingreso",
    subtitulo: "Pórtico, áreas verdes y alamedas del proyecto terminado. Imagen referencial; las casas son ilustrativas.",
  },
  {
    toma: "lotes-cerros",
    fecha: "imagen referencial",
    tag: "Los lotes",
    titulo: "Acércate a conocer tu próximo lote",
    subtitulo: "Recorre y elige tu lote en persona o por videollamada desde el proyecto. Imagen referencial.",
  },
];

const ROTACION_MS = 6000;

/** Carrusel de la portada. La toma con video de drone lo reproduce sola (sin sonido) y al terminar pasa a
 *  la siguiente; las imágenes sin video, y todas cuando no se puede reproducir (movimiento pausado o reducido,
 *  ahorro de datos), quedan fijas y, con movimiento, pasan cada 6 s. El video empieza después de cargar la página para no competir con
 *  la foto principal, y se detiene fuera de pantalla o con la pestaña oculta. "Ver video drone" lo abre
 *  en grande con controles. */
export function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [motion, setMotion] = useState(false);
  const [datos, setDatos] = useState(true);
  const [listo, setListo] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const grandeRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const update = () => setMotion(document.documentElement.dataset.motion === "running" && !matchMedia("(prefers-reduced-motion: reduce)").matches);
    const visibility = () => setHidden(document.hidden);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    setDatos(!connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || ""));
    update(); visibility();
    window.addEventListener("rosso:motion", update);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver((entries) => setInView(entries[0]?.isIntersecting ?? false), { threshold: 0.25 });
    if (containerRef.current) observer.observe(containerRef.current);
    // El video se pide cuando la página ya cargó: la foto de la portada sigue siendo lo primero en pintarse.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ready = () => { timer = setTimeout(() => setListo(true), 600); };
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready, { once: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      window.removeEventListener("load", ready);
      window.removeEventListener("rosso:motion", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  const slide = SLIDES[idx];
  const media = MEDIA[slide.toma];
  const activo = motion && !pausado && inView && !hidden;
  const conVideo = activo && datos && listo && !!media.video;
  // Sin video, las fotos pasan solas cada 6 s (si el visitante no tomó el control ni está encima).
  const rotando = activo && auto && !conVideo && !interacting;

  useEffect(() => {
    if (!rotando) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), ROTACION_MS);
    return () => clearInterval(timer);
  }, [rotando, idx]);

  useEffect(() => { if (inView) track("gallery_view", { slide: idx + 1 }); }, [idx, inView]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (conVideo) void v.play().catch(() => undefined);
    else v.pause();
  }, [conVideo, idx]);

  const select = (next: number) => { setAuto(false); setIdx((next + SLIDES.length) % SLIDES.length); };
  // Al terminar un clip pasa al siguiente; si el visitante eligió una toma o está encima, el clip se repite.
  const repetir = !auto || interacting;
  const siguiente = () => { if (!repetir) setIdx((i) => (i + 1) % SLIDES.length); };

  const abrirVideo = () => {
    track("video_play", { slide: idx + 1 });
    setAuto(false);
    dialogRef.current?.showModal();
    window.__lenis?.stop();
    void grandeRef.current?.play().catch(() => undefined);
  };
  const cerrarVideo = () => { grandeRef.current?.pause(); window.__lenis?.start(); };

  return (
    <div className="hero-showcase" ref={containerRef}
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false); }}>
      <div className="hero-showcase__stage">
        {/* Imagen, video y controles en su propio recuadro: en el celular el pie va debajo y no tapa la imagen. */}
        <div className="hero-showcase__media">
          <Image
            key={slide.toma}
            src={media.color}
            alt={`${slide.titulo}: ${slide.subtitulo}`}
            fill
            priority={idx === 0}
            sizes="(max-width: 1099px) 100vw, 800px"
            className="hero-showcase__img"
          />

          {conVideo ? (
            <video
              key={`v-${slide.toma}`}
              ref={videoRef}
              src={media.video!}
              poster={media.color}
              muted
              autoPlay
              playsInline
              loop={repetir}
              preload="auto"
              onEnded={siguiente}
              className="hero-showcase__video"
              aria-hidden="true"
            />
          ) : null}

          {motion ? (
            <button
              type="button"
              className="hero-showcase__pause"
              onClick={() => setPausado((p) => !p)}
              aria-pressed={pausado}
              aria-label={pausado ? "Reanudar el recorrido" : "Pausar el recorrido"}
            >
              <Icon name={pausado ? "play" : "pausa"} size={16} />
            </button>
          ) : null}

          {rotando ? <span key={idx} className="hero-showcase__progress" aria-hidden="true" /> : null}
        </div>

        <div className="hero-showcase__overlay">
          <div className="hero-showcase__caption" aria-live={auto ? "off" : "polite"}>
            <span className="hero-showcase__badge" aria-hidden="true"><Icon name={media.video ? "drone" : "sparkles"} size={22} /></span>
            <div>
              <strong>{slide.titulo}</strong>
              <p>{slide.subtitulo}</p>
            </div>
          </div>
          {media.video ? (
            <button type="button" className="hero-showcase__play-btn" onClick={abrirVideo}>
              <span>Ver video drone</span>
              <Icon name="externo" size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="hero-showcase__nav">
        <p className="hero-showcase__count"><span className="hero-showcase__count-label">Recorre La Campiña · </span>{idx + 1}/{SLIDES.length}</p>
        <div className="hero-showcase__arrows">
          <button type="button" onClick={() => select(idx - 1)} aria-label="Toma anterior">
            <Icon name="izq" size={18} />
          </button>
          <button type="button" onClick={() => select(idx + 1)} aria-label="Toma siguiente">
            <Icon name="der" size={18} />
          </button>
        </div>
      </div>

      <div className="hero-showcase__thumbs" role="group" aria-label="Elegir una toma del proyecto">
        {SLIDES.map((s, i) => {
          const active = i === idx;
          return (
            <button
              key={s.toma}
              type="button"
              aria-pressed={active}
              className={`hero-showcase__thumb ${active ? "is-active" : ""}`}
              onClick={() => select(i)}
            >
              <Image src={MEDIA[s.toma].color} alt="" fill sizes="160px" />
              <span className="sr-only">{`Toma ${i + 1}: ${s.tag}, ${s.fecha}`}</span>
            </button>
          );
        })}
      </div>

      {media.video ? (
        <dialog ref={dialogRef} className="video-modal" aria-label={`Video de drone: ${slide.titulo}`} onClose={cerrarVideo}
          onClick={(e) => { if (e.target === e.currentTarget) dialogRef.current?.close(); }}>
          <div className="video-modal__box">
            <video ref={grandeRef} key={`g-${slide.toma}`} src={media.video} poster={media.color} controls muted loop playsInline preload="none" />
            <div className="video-modal__bar">
              <p><strong>{slide.titulo}</strong> · {slide.fecha}</p>
              <button type="button" className="video-modal__close" onClick={() => dialogRef.current?.close()} aria-label="Cerrar el video">
                <Icon name="close" size={18} />
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
