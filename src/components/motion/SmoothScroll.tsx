"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, useMotion } from "@/lib/motion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// Scroll suave con Lenis, sincronizado con ScrollTrigger mediante el ticker de GSAP (receta oficial
// de Lenis). Solo existe con movimiento permitido; en el táctil Lenis deja el scroll nativo.
export function SmoothScroll() {
  const ok = useMotion();

  useEffect(() => {
    if (!ok) return;
    const lenis = new Lenis({ anchors: { offset: -72 }, stopInertiaOnNavigate: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [ok]);

  useEffect(() => {
    // Las fuentes cambian la altura del texto: recalcula los disparadores cuando terminan de cargar.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return null;
}
