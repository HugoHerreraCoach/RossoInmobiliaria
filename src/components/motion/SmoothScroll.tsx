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
    // Los enlaces #… respetan el scroll-padding-top del html (alto de la cabecera): Lenis ya lo descuenta, así que no
    // lleva desfase propio (con offset -72 los destinos quedaban 72 px más abajo; docs/0026).
    const lenis = new Lenis({ anchors: true, stopInertiaOnNavigate: true });
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
