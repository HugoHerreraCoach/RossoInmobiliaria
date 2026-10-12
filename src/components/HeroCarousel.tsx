"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MEDIA, type Toma } from "@/content/avance";
import { Icon } from "./Icon";

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
    fecha: "25 jun 2026",
    tag: "Drone HD · Obra Real",
    titulo: "Lotes y calles ya trazados con cal en el terreno",
    subtitulo: "Vista aérea verificable de las 8 manzanas y la alameda principal frente a los cerros del Valle de Zaña.",
  },
  {
    toma: "portico",
    fecha: "11 abr 2026",
    tag: "Ingreso Principal",
    titulo: "Pórtico arquitectónico y cerco vivo de ingreso",
    subtitulo: "Acceso principal construido sobre la vía a San Nicolás con palmeras y áreas verdes en crecimiento.",
  },
  {
    toma: "general-jul",
    fecha: "18 jul 2026",
    tag: "Vuelo Panorámico",
    titulo: "Microclima cálido todo el año a 35 min de Chiclayo",
    subtitulo: "Ubicación privilegiada a 6 minutos de Saltur y 8 minutos de Cayaltí.",
  },
  {
    toma: "cerco-jun",
    fecha: "25 jun 2026",
    tag: "Frente de Proyecto",
    titulo: "Frente consolidado con cerco de caña y grass natural",
    subtitulo: "Avance físico documentado fecha por fecha para que compres con total seguridad desde cualquier ciudad.",
  },
  {
    toma: "trazado-jun",
    fecha: "25 jun 2026",
    tag: "Vías Internas",
    titulo: "Manzanas delimitadas listas para visita guiada",
    subtitulo: "Recorre y elige tu lote en persona o mediante videollamada en vivo desde el proyecto.",
  },
];

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <div className="hero-showcase">
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
          src={media.color}
          alt={`${slide.titulo} — ${slide.subtitulo}`}
          fill
          priority={idx === 0}
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
            className="hero-showcase__video"
            aria-label={`Video de drone: ${slide.titulo}`}
          />
        ) : null}

        <div className="hero-showcase__overlay">
          <div className="hero-showcase__caption">
            <strong>{slide.titulo}</strong>
            <p>{slide.subtitulo}</p>
          </div>
          {media.video ? (
            <button
              type="button"
              className="hero-showcase__play-btn"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
            >
              <Icon name={playing ? "pausa" : "play"} size={16} />
              <span>{playing ? "Pausar video" : "Ver video drone"}</span>
            </button>
          ) : null}
        </div>

        <div className="hero-showcase__arrows">
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Toma anterior"
          >
            <Icon name="izq" size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % SLIDES.length)}
            aria-label="Toma siguiente"
          >
            <Icon name="der" size={18} />
          </button>
        </div>
      </div>

      {/* Tira de miniaturas interactivas estilo Grupo DLC */}
      <div className="hero-showcase__thumbs" role="tablist" aria-label="Galería de tomas aéreas en el Hero">
        {SLIDES.map((s, i) => {
          const m = MEDIA[s.toma];
          const active = i === idx;
          return (
            <button
              key={s.toma}
              type="button"
              role="tab"
              aria-selected={active}
              className={`hero-showcase__thumb ${active ? "is-active" : ""}`}
              onClick={() => setIdx(i)}
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

