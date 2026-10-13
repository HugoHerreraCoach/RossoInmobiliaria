"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

const MENU = [["proyecto", "El proyecto"], ["areas", "Áreas comunes"], ["lotes", "Lotes"], ["avance", "Avances"], ["ubicacion", "Ubicación"]] as const;

/** Navegación móvil accesible: Escape cierra y devuelve el foco al botón. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    };
    const resize = () => { if (window.innerWidth > 1000) setOpen(false); };
    document.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("keydown", key); window.removeEventListener("resize", resize); };
  }, [open]);

  return <header className="site-header">
    <div className="site-container site-header__in">
      <a className="estate-brand" href="#inicio" aria-label="La Campiña, ir al inicio" onClick={() => setOpen(false)}>
        <span className="estate-brand__name">La Campiña<span>·</span></span>
        <span className="estate-brand__sub">Valle de Zaña <i /> Rosso Inmobiliaria</span>
      </a>
      <nav className="site-header__desktop" aria-label="Navegación principal"><ul className="nav">{MENU.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul></nav>
      <a className="btn btn--forest site-header__cta" data-track="header-contact" href="#contacto">Agenda tu visita <Icon name="der" size={17} /></a>
      <button ref={button} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)}><Icon name={open ? "close" : "menu"} size={24} /></button>
    </div>
    <nav id="mobile-menu" className="mobile-menu" hidden={!open} aria-label="Navegación móvil"><ul className="nav">{MENU.map(([id, label]) => <li key={id}><a href={`#${id}`} onClick={() => setOpen(false)}>{label}<Icon name="der" size={17} /></a></li>)}</ul><a className="btn btn--forest" data-track="header-contact" href="#contacto" onClick={() => setOpen(false)}>Agenda tu visita</a></nav>
  </header>;
}
