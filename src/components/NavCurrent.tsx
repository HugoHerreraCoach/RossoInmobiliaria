"use client";

import { useEffect } from "react";

/** Marca en el menú la sección que se está leyendo (la última cuyo borde pasó el 40% de la pantalla). */
export function NavCurrent({ ids }: { ids: string[] }) {
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let actual = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) actual = id;
      }
      document.querySelectorAll<HTMLAnchorElement>(".nav a").forEach((a) => {
        if (a.hash === `#${actual}`) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [ids]);
  return null;
}
