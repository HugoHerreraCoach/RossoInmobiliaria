"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { CUOTAS, DESDE, DESDE_CONTADO, LISTA_FECHA, M2_MAX, M2_MIN, m2, soles, soles0 } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Icon, type IconName } from "./Icon";

type TabInfo = { id: string; tag: string; titulo: string; subtitulo: string; descripcion: string; puntos: string[]; imagen: string; imagenAlt: string; sello: string; ctaLabel: string; ctaHref: string; icon: IconName };
const d = DESDE.precio!;
const TABS: TabInfo[] = [
  { id: "espacio", tag: "Más espacio", titulo: "El espacio que tus planes necesitan.", subtitulo: `Lotes de ${m2(M2_MIN)} a ${m2(M2_MAX)}`, descripcion: "Compara las áreas y manzanas para encontrar un lote acorde con tus planes de descanso, familia o inversión.", puntos: [`Áreas y precios de referencia según lista del ${LISTA_FECHA}.`, "Consulta las condiciones de construcción y uso con el equipo comercial.", "Explora cada lote y su simulador antes de solicitar una visita."], imagen: "/media/trazado-jun.webp", imagenAlt: "Lotes del proyecto demarcados con cal en una fotografía aérea real", sello: "Registro de obra · junio 2026", ctaLabel: "Explorar los lotes", ctaHref: "#lotes", icon: "plano" },
  { id: "financiamiento", tag: "A tu ritmo", titulo: `Hasta ${CUOTAS} cuotas, sin intereses.`, subtitulo: "Financiamiento directo con Rosso Inmobiliaria", descripcion: "Compara tu plan financiado con la alternativa al contado. Las cifras se calculan a partir de la lista incluida en el proyecto.", puntos: [`Inicial desde ${soles0(d.inicial)} y cuota de referencia desde ${soles(d.cuota)}.`, `Promoción al contado desde ${soles0(DESDE_CONTADO)}, según lote.`, "Confirma la vigencia de la promoción y las condiciones con un asesor."], imagen: "/media/banderas.webp", imagenAlt: "Banderas de La Campiña instaladas en el terreno del proyecto", sello: "Fotografía real del proyecto", ctaLabel: "Conocer las formas de pago", ctaHref: "#pagar", icon: "calculator" },
  { id: "avances", tag: "Obra a la vista", titulo: "Mira cómo toma forma La Campiña.", subtitulo: `Entrega programada: ${PROYECTO.entrega}`, descripcion: "Revisa el acceso, las vías trazadas y los registros de obra. El material de esta web pertenece al propio proyecto, no a un desarrollo de referencia.", puntos: ["Fotografías de obra y videos de drone disponibles para consulta.", "Bitácora con las fechas documentadas en el archivo original.", "Solicita el plano oficial y la documentación antes de decidir."], imagen: "/media/estructura-set.webp", imagenAlt: "Cuadrilla y estructura de acero en un registro de avance de obra", sello: "Registro de obra · setiembre 2026", ctaLabel: "Revisar los avances", ctaHref: "#avance", icon: "drone" },
  { id: "ubicacion", tag: "Un entorno único", titulo: "La vida de campo, en el Valle de Zaña.", subtitulo: "Naturaleza e historia en Lambayeque", descripcion: "Un lugar para compartir con tu familia y conocer el entorno turístico del valle. Explora sus accesos y coordina un recorrido con el equipo.", puntos: [PROYECTO.ubicacion.frase + ".", "Consulta la ruta exacta desde tu ciudad antes de salir.", "Los usos turísticos o de alquiler requieren verificar condiciones y permisos."], imagen: "/media/ingreso-abr.webp", imagenAlt: "Vista aérea del ingreso de La Campiña y las montañas del Valle de Zaña", sello: "Registro de obra · abril 2026", ctaLabel: "Descubrir la ubicación", ctaHref: "#ubicacion", icon: "pin" },
];

export function WhyProjectTabs() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = TABS[selected];
  const selectWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowRight" ? (index + 1) % TABS.length : event.key === "ArrowLeft" ? (index - 1 + TABS.length) % TABS.length : event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); setSelected(next); buttons.current[next]?.focus();
  };
  return <div className="why-tabs">
    <div className="why-tabs__nav" role="tablist" aria-label="Conoce La Campiña">{TABS.map((tab, index) => <button key={tab.id} id={`why-${tab.id}`} ref={(element) => { buttons.current[index] = element; }} type="button" role="tab" aria-selected={selected === index} aria-controls="why-panel" tabIndex={selected === index ? 0 : -1} className={`why-tabs__btn ${selected === index ? "is-active" : ""}`} onClick={() => setSelected(index)} onKeyDown={(e) => selectWithKeyboard(e, index)}><span className="why-tabs__btn-icon"><Icon name={tab.icon} size={19} /></span><span className="why-tabs__btn-text"><strong>{tab.tag}</strong></span></button>)}</div>
    <div id="why-panel" className="why-tabs__panel" role="tabpanel" aria-labelledby={`why-${current.id}`} tabIndex={0}>
      <div className="why-tabs__content"><span className="eyebrow">{current.tag}</span><h3>{current.titulo}</h3><p className="why-tabs__sub">{current.subtitulo}</p><p className="why-tabs__desc">{current.descripcion}</p><ul className="why-tabs__list">{current.puntos.map((point) => <li key={point}><span className="why-tabs__check"><Icon name="check" size={13} /></span><span>{point}</span></li>)}</ul><div className="why-tabs__actions"><a className="btn btn--primary" href={current.ctaHref}>{current.ctaLabel}<Icon name="der" size={17} /></a></div></div>
      <div className="why-tabs__media"><div className="why-tabs__img-frame"><span className="stamp label">{current.sello}</span><Image src={current.imagen} alt={current.imagenAlt} fill sizes="(max-width: 760px) 100vw, 560px" /></div></div>
    </div>
  </div>;
}
