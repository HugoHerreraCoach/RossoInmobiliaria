"use client";

// Punto único de registro de GSAP: los plugins se registran una vez y nunca en el servidor.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { useEffect, useState } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);
  gsap.defaults({ ease: "expo.out", duration: 1 });
}

export const DESKTOP = "(min-width: 900px)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/** El movimiento corre solo si el sistema no pide reducirlo y el visitante no lo pausó
 *  (MotionExperience publica el estado en html[data-motion] y en el evento rosso:motion). */
export function motionAllowed() {
  return typeof window !== "undefined"
    && !matchMedia("(prefers-reduced-motion: reduce)").matches
    && document.documentElement.dataset.motion !== "paused";
}

export function useMotion() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOk(motionAllowed());
    update();
    media.addEventListener("change", update);
    window.addEventListener("rosso:motion", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("rosso:motion", update);
    };
  }, []);
  return ok;
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP };
