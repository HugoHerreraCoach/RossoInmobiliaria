"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, useMotion } from "@/lib/motion";

type Props = {
  as?: ElementType;
  by?: "lines" | "words";
  delay?: number;
  className?: string;
  id?: string;
  children: ReactNode;
};

// Titular que entra por líneas o palabras desde una máscara al aparecer en pantalla.
// El texto sigue siendo HTML real (SplitText pone aria-label). Sin JS o sin movimiento se ve
// tal cual; el CSS de [data-reveal] lo muestra a los 2.5 s aunque el JS falle.
export function Reveal({ as: Tag = "div", by = "lines", delay = 0, className, id, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (!ok) {
        gsap.set(el, { visibility: "visible" });
        return;
      }
      const split = SplitText.create(el, {
        type: by,
        mask: by,
        linesClass: "rv-line",
        wordsClass: "rv-word",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          return gsap.from(by === "lines" ? self.lines : self.words, {
            yPercent: 112,
            duration: 1.15,
            stagger: 0.08,
            delay,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [ok, by, delay], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-reveal="">
      {children}
    </Tag>
  );
}

/** Entrada escalonada de las partes de una sección (titular, texto, imagen): sube 24 px con opacidad,
 *  una sola vez. Sin movimiento no hace nada y el contenido nunca queda oculto. */
export function Stagger({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: ElementType }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotion();
  useGSAP(
    () => {
      if (!ok || !ref.current) return;
      const parts = gsap.utils.toArray<HTMLElement>("[data-part]", ref.current);
      if (!parts.length) return;
      gsap.from(parts, {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
      });
    },
    { scope: ref, dependencies: [ok], revertOnUpdate: true },
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
