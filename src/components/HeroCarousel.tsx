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
    titulo: "Tu próximo lugar, desde arriba.",
    subtitulo: "Toma de drone del trazado de lotes y vías frente a los cerros del Valle de Zaña.",
  },
  {
    toma: "portico",
    fecha: "11 abr 2026",
    tag: "El ingreso",
    titulo: "La bienvenida a La Campiña.",
    subtitulo: "Acceso principal construido sobre la vía a San Nicolás con palmeras y áreas verdes en crecimiento.",
  },
  {
    toma: "general-jul",
    fecha: "21 jul 2026",
    tag: "El entorno",
    titulo: "El valle, visto desde otra perspectiva.",
    subtitulo: "Ubicación privilegiada a 6 minutos de Saltur y 8 minutos de Cayaltí.",
  },
  {
    toma: "cerco-jun",
    fecha: "junio 2026",
    tag: "El frente",
    titulo: "Así se ve el frente del proyecto.",
    subtitulo: "Un registro real para conocer el proyecto antes de tu visita.",
  },
  {
    toma: "trazado-jun",
    fecha: "junio 2026",
    tag: "Los lotes",
    titulo: "Acércate a conocer tu próximo lote.",
    subtitulo: "Recorre y elige tu lote en persona o mediante videollamada en vivo desde el proyecto.",
  },
];

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [auto, setAuto] = useState(true);
  const [motion, setMotion] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const update = () => setMotion(document.documentElement.dataset.motion === "running" && !matchMedia("(prefers-reduced-motion: reduce)").matches);
    const visibility = () => setHidden(document.hidden);
    update(); visibility(); window.addEventListener("rosso:motion", update); document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(entries => setInView(entries[0]?.isIntersecting ?? false), { threshold: .25 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { observer.disconnect(); window.removeEventListener("rosso:motion", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const rotating = auto && motion && inView && !playing && !interacting && !hidden;
  useEffect(() => { if (!rotating) return; const timer = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 6000); return () => clearInterval(timer); }, [rotating, idx]);
  const select = (next: number) => { setAuto(false); setIdx(next); };

  useEffect(()=>{if(inView)track("gallery_view",{slide:idx+1});},[idx,inView]);
  useEffect(()=>{if(hidden || !inView || !motion)setPlaying(false);},[hidden,inView,motion]);

  const slide = SLIDES[idx];
  const media = MEDIA[slide.toma];

  useEffect(() => {
    setPlaying(false);
  }, [idx]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.play().catch(() => setPlaying(false));
    } else {
      v.pause();
    }
  }, [playing]);

  return (
    <div className="hero-showcase" ref={containerRef}
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false); }}>
      <div className="hero-showcase__stage">
        <div className="hero-showcase__badges">
          <span className="hero-showcase__live-pill">
            <i /> {slide.tag}
          </span>
          <span className="hero-showcase__date-pill">
            <Icon name="calendario" size={14} /> {slide.fecha}
          </span>
        </div>

        <Image
          key={slide.toma}
          src={media.color}
          alt={`${slide.titulo} — ${slide.subtitulo}`}
          fill
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, 720px"
          className="hero-showcase__img"
        />

        {media.video && playing ? (
          <video
            ref={videoRef}
            src={media.video}
            poster={media.color}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            className="hero-showcase__video"
            aria-label={`Video de drone: ${slide.titulo}`}
          />
        ) : null}

        <div className="hero-showcase__overlay">
          <div className="hero-showcase__caption" aria-live={auto ? "off" : "polite"}>
            <strong>{slide.titulo}</strong>
            <p>{slide.subtitulo}</p>
          </div>
          {media.video ? (
            <button
              type="button"
              className="hero-showcase__play-btn"
              onClick={() => { if (!playing) track("video_play", { slide: idx + 1 }); setPlaying(p => !p); setAuto(false); }}
              aria-pressed={playing}
            >
              <Icon name={playing ? "pausa" : "play"} size={16} />
              <span>{playing ? "Pausar video" : "Ver video drone"}</span>
            </button>
          ) : null}
        </div>

        {rotating ? <span key={idx} className="hero-showcase__progress" aria-hidden="true" /> : null}
        <div className="hero-showcase__arrows">
          <button
            type="button"
            onClick={() => select((idx - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Toma anterior"
          >
            <Icon name="izq" size={18} />
          </button>
          <button
            type="button"
            onClick={() => select((idx + 1) % SLIDES.length)}
            aria-label="Toma siguiente"
          >
            <Icon name="der" size={18} />
          </button>
        </div>
      </div>

      <div className="hero-showcase__auto"><span>Recorre La Campiña · {idx + 1} / {SLIDES.length}</span><button type="button" onClick={() => setAuto(a => !a)} aria-pressed={!auto} disabled={!motion}>{!motion ? "Recorrido manual" : auto ? "Pausar recorrido" : "Activar recorrido automático"}</button></div>
      {/* Tira de miniaturas interactivas estilo Grupo DLC */}
      <div className="hero-showcase__thumbs" role="group" aria-label="Elegir una fotografía del proyecto">
        {SLIDES.map((s, i) => {
          const m = MEDIA[s.toma];
          const active = i === idx;
          return (
            <button
              key={s.toma}
              type="button"
              aria-pressed={active}
              aria-label={`Ver toma ${i + 1} de ${SLIDES.length}: ${s.tag}`}
              className={`hero-showcase__thumb ${active ? "is-active" : ""}`}
              onClick={() => select(i)}
            >
              <div className="hero-showcase__thumb-img">
                <Image src={m.color} alt={s.titulo} fill sizes="140px" />
              </div>
              <div className="hero-showcase__thumb-txt">
                <small>{s.fecha}</small>
                <span>{s.tag}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

