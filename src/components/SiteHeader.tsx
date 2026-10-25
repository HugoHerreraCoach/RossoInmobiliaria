"use client";

import { useRef } from "react";
import { ScrollTrigger, useGSAP, useMotion } from "@/lib/motion";
import { Icon } from "./Icon";

const MENU = [["proyecto", "El proyecto"], ["lotes", "Lotes"], ["avance", "Obra"], ["por-que", "Por qué"], ["preguntas", "Preguntas"]] as const;

/** Barra flotante (como en la referencia de Grupo DLC): marca, cinco enlaces y la acción que lleva
 *  al formulario (#formulario). Con movimiento se esconde al bajar y vuelve al subir. */
export function SiteHeader() {
  const header = useRef<HTMLElement>(null);
  const ok = useMotion();

  useGSAP(
    () => {
      const el = header.current!;
      const hero = document.getElementById("inicio");
      const solid = ScrollTrigger.create({
        trigger: hero ?? undefined,
        start: hero ? "bottom 64px" : 80,
        end: "max",
        toggleClass: { targets: el, className: "is-solid" },
      });
      if (!ok) return () => solid.kill();
      const hide = ScrollTrigger.create({
        start: 160,
        end: "max",
        onUpdate: (self) => {
          const keep = el.contains(document.activeElement);
          el.classList.toggle("is-hidden", !keep && self.direction === 1);
        },
        onLeaveBack: () => el.classList.remove("is-hidden"),
      });
      return () => {
        solid.kill();
        hide.kill();
        el.classList.remove("is-hidden");
      };
    },
    { dependencies: [ok], revertOnUpdate: true },
  );

  return (
    <header ref={header} className="site-header">
      <a className="site-header__brand" href="#inicio" translate="no">
        La Campiña<span>Valle de Zaña</span>
      </a>
      <nav className="site-header__nav" aria-label="Navegación principal">
        {MENU.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <a
        className="btn btn--small site-header__cta"
        data-track="header-contact"
        href="#formulario"
      >
        <Icon name="chat" size={18} />
        <span>Ir a WhatsApp</span>
      </a>
    </header>
  );
}
