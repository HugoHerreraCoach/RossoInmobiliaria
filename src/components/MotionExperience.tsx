"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const KEY = "rosso.motion.v1";

/** Estado global del movimiento. Corre si el sistema no pide reducirlo (prefers-reduced-motion)
 *  y el visitante no lo pausó con el botón del pie. Lo publica en html[data-motion] y en el
 *  evento rosso:motion, que escuchan el scroll suave, los revelados, el hero y los videos. */
export function MotionExperience() {
  const path = usePathname();
  const excluded = path.startsWith("/panel") || path.startsWith("/privacidad");
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    try { setPaused(localStorage.getItem(KEY) === "paused"); } catch { /* sin almacenamiento: corre por defecto */ }
    const toggle = () => setPaused((p) => {
      const next = !p;
      try { localStorage.setItem(KEY, next ? "paused" : "running"); } catch {}
      return next;
    });
    media.addEventListener("change", update);
    window.addEventListener("rosso:motion-toggle", toggle);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("rosso:motion-toggle", toggle);
    };
  }, []);

  useEffect(() => {
    const run = !reduced && !paused && !excluded;
    document.documentElement.dataset.motion = run ? "running" : "paused";
    window.dispatchEvent(new CustomEvent("rosso:motion", { detail: run }));
  }, [reduced, paused, excluded]);

  return null;
}

/** Botón para pausar o reanudar todo el movimiento de la página (WCAG 2.2.2). */
export function MotionToggle() {
  const [running, setRunning] = useState(true);
  useEffect(() => {
    const sync = () => setRunning(document.documentElement.dataset.motion !== "paused");
    sync();
    window.addEventListener("rosso:motion", sync);
    return () => window.removeEventListener("rosso:motion", sync);
  }, []);
  return (
    <button type="button" className="link-button" aria-pressed={!running} onClick={() => window.dispatchEvent(new Event("rosso:motion-toggle"))}>
      {running ? "Pausar animaciones" : "Reanudar animaciones"}
    </button>
  );
}
