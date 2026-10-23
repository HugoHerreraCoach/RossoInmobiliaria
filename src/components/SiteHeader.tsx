"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, useGSAP, useMotion } from "@/lib/motion";

const MENU = [["proyecto", "El proyecto"], ["lotes", "Lotes"], ["avance", "Obra"], ["por-que", "Por qué"], ["preguntas", "Preguntas"]] as const;

/** Barra flotante (como en la referencia de Grupo DLC): marca, cinco enlaces y la acción que lleva al
 *  formulario de la portada. Con movimiento se esconde al bajar y vuelve al subir, para no tapar
 *  contenido en el móvil. En el móvil el menú ocupa la pantalla; Escape lo cierra y devuelve el foco. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const ok = useMotion();

  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    };
    const resize = () => { if (window.innerWidth >= 900) setOpen(false); };
    document.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    document.documentElement.dataset.menu = "open";
    window.__lenis?.stop();
    return () => {
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      delete document.documentElement.dataset.menu;
      window.__lenis?.start();
    };
  }, [open]);

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

  const close = () => setOpen(false);
  return (
    <header ref={header} className={`site-header ${open ? "is-open" : ""}`}>
      <a className="site-header__brand" href="#inicio" translate="no" onClick={close}>
        La Campiña<span>Valle de Zaña</span>
      </a>
      <nav className="site-header__nav" aria-label="Navegación principal">
        {MENU.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <a className="btn btn--lime btn--small site-header__cta" data-track="header-contact" href="#formulario">Agenda tu visita</a>
      <button
        ref={button}
        type="button"
        className="site-header__menu"
        aria-expanded={open}
        aria-controls="menu-movil"
        onClick={() => setOpen(!open)}
      >
        {open ? "Cerrar" : "Menú"}
      </button>
      <nav id="menu-movil" className="mobile-menu" hidden={!open} aria-label="Navegación móvil">
        {MENU.map(([id, label]) => <a key={id} href={`#${id}`} onClick={close}>{label}</a>)}
        <a className="btn btn--lime" data-track="header-contact" href="#formulario" onClick={close}>Agenda tu visita</a>
      </nav>
    </header>
  );
}
