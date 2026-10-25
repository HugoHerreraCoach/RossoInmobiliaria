"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MEDIA, type Toma } from "@/content/avance";
import { Icon } from "./Icon";
import { track } from "@/lib/tracking/client";

type Slide = {
  toma: Toma;
  label: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    toma: "general-jul",
    label: "Entorno natural y casas de campo",
    alt: "Entorno natural y áreas verdes frente a los cerros del Valle de Zaña",
  },
  {
    toma: "trazado-jun",
    label: "Trazado de lotes y áreas verdes",
    alt: "Vista aérea del trazado de lotes y áreas verdes de ingreso en La Campiña",
  },
  {
    toma: "hero",
    label: "Vista aérea de lotes e ingreso",
    alt: "Vista aérea panorámica del trazado de lotes e ingreso de La Campiña",
  },
  {
    toma: "cerco-jun",
    label: "Frente y cerco del proyecto",
    alt: "Vista frontal del cerco perimétrico de caña de La Campiña",
  },
];

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [auto, setAuto] = useState(true);
  const [motion, setMotion] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const update = () =>
      setMotion(
        document.documentElement.dataset.motion === "running" &&
          !matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    const visibility = () => setHidden(document.hidden);
    update();
    visibility();
    window.addEventListener("rosso:motion", update);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.25 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      window.removeEventListener("rosso:motion", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  const rotating = auto && motion && inView && !interacting && !hidden;

  useEffect(() => {
    if (!rotating) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, [rotating, idx]);

  const select = (next: number) => {
    setAuto(false);
    setIdx(next);
  };

  useEffect(() => {
    if (inView) track("gallery_view", { slide: idx + 1 });
  }, [idx, inView]);

  const slide = SLIDES[idx];
  const media = MEDIA[slide.toma];

  return (
    <div
      className="hero-showcase"
      ref={containerRef}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setInteracting(false);
      }}
    >
      <div className="hero-showcase__stage">
        <div className="hero-showcase__badges">
          <span className="hero-showcase__counter-pill">
            {idx + 1} / {SLIDES.length}
          </span>
        </div>

        <Image
          key={slide.toma}
          src={media.color}
          alt={slide.alt}
          fill
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, 720px"
          className="hero-showcase__img"
        />

        <div className="hero-showcase__overlay">
          <div className="hero-showcase__loc-pill" aria-live={auto ? "off" : "polite"}>
            <Icon name="pin" size={16} />
            <span>{slide.label}</span>
          </div>
        </div>

        <div className="hero-showcase__arrows">
          <button
            type="button"
            onClick={() => select((idx - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Foto anterior"
          >
            <Icon name="izq" size={18} />
          </button>
          <button
            type="button"
            onClick={() => select((idx + 1) % SLIDES.length)}
            aria-label="Foto siguiente"
          >
            <Icon name="der" size={18} />
          </button>
        </div>
      </div>

      <div
        className="hero-showcase__thumbs"
        role="group"
        aria-label="Elegir una fotografía del proyecto"
      >
        {SLIDES.map((s, i) => {
          const m = MEDIA[s.toma];
          const active = i === idx;
          return (
            <button
              key={s.toma}
              type="button"
              aria-pressed={active}
              aria-label={s.label}
              className={`hero-showcase__thumb ${active ? "is-active" : ""}`}
              onClick={() => select(i)}
            >
              <div className="hero-showcase__thumb-img">
                <Image src={m.color} alt="" fill sizes="160px" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

