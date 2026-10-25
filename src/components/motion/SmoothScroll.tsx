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
// de Lenis). Además intercepta cualquier enlace a #formulario para hacer scroll suave y poner el
// cursor automáticamente en el campo "Nombres y apellidos*" (#hero-nombre).
export function SmoothScroll() {
  const ok = useMotion();

  useEffect(() => {
    if (!ok) return;
    const lenis = new Lenis({ stopInertiaOnNavigate: true });
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
    let focusTimer: ReturnType<typeof setTimeout> | null = null;
    let pulseTimer: ReturnType<typeof setTimeout> | null = null;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = (event.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;
      const hash = href.slice(hashIndex);
      if (hash.length <= 1) return;

      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();

      if (hash === "#formulario") {
        const input = (document.getElementById("hero-nombre") ??
          target.querySelector<HTMLInputElement>("input[name='nombre']")) as HTMLInputElement | null;

        // Enfoque inicial dentro del gesto del usuario (necesario para abrir teclado en iOS/móvil)
        input?.focus({ preventScroll: true });

        target.classList.add("is-focus-target");
        if (pulseTimer) clearTimeout(pulseTimer);
        pulseTimer = setTimeout(() => target.classList.remove("is-focus-target"), 1400);

        if (window.__lenis) {
          window.__lenis.scrollTo(target, {
            offset: -80,
            duration: 0.85,
            onComplete: () => {
              input?.focus({ preventScroll: true });
            },
          });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        if (focusTimer) clearTimeout(focusTimer);
        focusTimer = setTimeout(() => {
          input?.focus({ preventScroll: true });
        }, 520);
        return;
      }

      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset: -76, duration: 0.85 });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      if (focusTimer) clearTimeout(focusTimer);
      if (pulseTimer) clearTimeout(pulseTimer);
    };
  }, []);

  useEffect(() => {
    // Las fuentes cambian la altura del texto: recalcula los disparadores cuando terminan de cargar.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return null;
}
