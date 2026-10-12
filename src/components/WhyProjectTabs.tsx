"use client";

import Image from "next/image";
import { useState } from "react";
import { CUOTAS, DESDE, DESDE_CONTADO, M2_MAX, M2_MIN, m2, resumen, soles, soles0 } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Icon, type IconName } from "./Icon";

type TabInfo = {
  id: string;
  tag: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  puntos: string[];
  imagen: string;
  imagenAlt: string;
  sello: string;
  ctaLabel: string;
  ctaHref: string;
  icon: IconName;
};

export function WhyProjectTabs() {
  const r = resumen();
  const d = DESDE.precio!;

  const TABS: TabInfo[] = [
    {
      id: "tipologias",
      tag: "Tipologías de Lotes",
      titulo: "Desde 510 m² hasta macrolotes de 1,658 m²",
      subtitulo: "Amplitud real para tu casa de campo, piscina, huerta y terraza",
      descripcion:
        "A diferencia de las lotizaciones urbanas de 90 o 120 m², en La Campiña cada lote empieza en 510 m² para garantizarte privacidad, jardines amplios y aire puro frente a los cerros del Valle de Zaña.",
      puntos: [
        `Lotes Campestres Estándar desde ${m2(M2_MIN)} (Cuota desde ${soles(d.cuota)}/mes).`,
        "Lotes Frente al Gran Parque Central (Manzana E, de 539 m² a 765 m²).",
        `Macrolotes de Cabecera y Esquina de 1,265 m² hasta ${m2(M2_MAX)} (C6, C7, D16, D17, F11, F12, G21, H10).`,
        `${r.disponibles} unidades disponibles hoy de las ${r.total} totales en 8 manzanas (A–H).`,
      ],
      imagen: "/media/trazado-jun.webp",
      imagenAlt: "Vista aérea de las manzanas y lotes trazados con cal en La Campiña",
      sello: "Drone · 25 jun 2026",
      ctaLabel: "Explorar lotes en el Masterplan",
      ctaHref: "#lotes",
      icon: "plano",
    },
    {
      id: "financiamiento",
      tag: "Crédito Directo 0%",
      titulo: `Hasta ${CUOTAS} cuotas mensuales sin intereses`,
      subtitulo: "Sin evaluación bancaria compleja · A sola firma con Rosso Inmobiliaria",
      descripcion:
        "Congela el valor de tu tierra hoy mismo. Puedes separar tu lote con una inicial accesible y dividir el saldo hasta en 4 años sin intereses, o aprovechar el descuento del 15% y bonos especiales al contado.",
      puntos: [
        `Inicial mínima desde ${soles0(d.inicial)} según la ubicación del lote.`,
        `Hasta ${CUOTAS} cuotas fijas mensuales en soles, con 0% de interés.`,
        `Descuento directo del 15% al contado + bonos promocionales desde ${soles0(DESDE_CONTADO)}.`,
        "Simulador financiero interactivo disponible en cada lote del Masterplan.",
      ],
      imagen: "/media/banderas.webp",
      imagenAlt: "Banderas de La Campiña instaladas sobre el terreno demarcado",
      sello: "Obra · 27 jun 2026",
      ctaLabel: "Ver tabla y simulador de pagos",
      ctaHref: "#pagar",
      icon: "calculator",
    },
    {
      id: "respaldo",
      tag: "Escritura & Obra Real",
      titulo: "Título con Escritura Pública y avance fechado",
      subtitulo: `Entrega programada del proyecto: ${PROYECTO.entrega}`,
      descripcion:
        "Tu inversión está respaldada por un terreno con obra física en marcha. Cada fotografía y vuelo de drone en esta web muestra la fecha exacta en que se registró, sin renders engañosos.",
      puntos: [
        `Título de propiedad: ${PROYECTO.titulo}.`,
        "Pórtico de ingreso y cerco vivo frontal ya construidos desde abril de 2026.",
        "Calles internas y las 8 manzanas ya trazadas con cal sobre el terreno.",
        "Visitas guiadas todos los fines de semana o recorrido en vivo para compradores de Lima y Trujillo.",
      ],
      imagen: "/media/estructura-set.webp",
      imagenAlt: "Avance de estructura en el ingreso de La Campiña en setiembre de 2026",
      sello: "Obra · 4 set 2026",
      ctaLabel: "Ver cronograma de avance real",
      ctaHref: "#avance",
      icon: "shield",
    },
    {
      id: "ubicacion",
      tag: "Valle de Zaña",
      titulo: "A 35 minutos de Chiclayo con sol todo el año",
      subtitulo: "Conectividad inmediata sobre la vía a San Nicolás",
      descripcion:
        "Ubicado en el corredor campestre de mayor proyección de Lambayeque, rodeado de naturaleza e historia, a pocos minutos de centros urbanos y con acceso directo asfaltado hasta el circuito del valle.",
      puntos: [
        "A solo 6 minutos de Saltur y 8 minutos de Cayaltí.",
        "A 16 minutos de Zaña y 20 minutos de Pomalca.",
        "A 35 minutos en auto desde la ciudad de Chiclayo.",
        "Clima cálido y seco ideal para casa de descanso familiar o inversión patrimonial.",
      ],
      imagen: "/media/general-jul.webp",
      imagenAlt: "Vista panorámica de drone de La Campiña y el Valle de Zaña",
      sello: "Drone · 18 jul 2026",
      ctaLabel: "Ver mapa de tiempos y rutas",
      ctaHref: "#ubicacion",
      icon: "pin",
    },
  ];

  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const current = TABS.find((t) => t.id === activeId) ?? TABS[0];

  return (
    <div className="why-tabs">
      <div className="why-tabs__nav" role="tablist" aria-label="Pilares del proyecto La Campiña">
        {TABS.map((t) => {
          const isSelected = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`why-tabs__btn ${isSelected ? "is-active" : ""}`}
              onClick={() => setActiveId(t.id)}
            >
              <span className="why-tabs__btn-icon">
                <Icon name={t.icon} size={20} />
              </span>
              <span className="why-tabs__btn-text">
                <strong>{t.tag}</strong>
                <small>{t.titulo}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="why-tabs__panel" role="tabpanel">
        <div className="why-tabs__content">
          <span className="eyebrow">{current.tag}</span>
          <h3>{current.titulo}</h3>
          <p className="why-tabs__sub">{current.subtitulo}</p>
          <p className="why-tabs__desc">{current.descripcion}</p>
          <ul className="why-tabs__list">
            {current.puntos.map((pt) => (
              <li key={pt}>
                <span className="why-tabs__check" aria-hidden="true">
                  <Icon name="check" size={16} />
                </span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
          <div className="why-tabs__actions">
            <a className="btn btn--primary" href={current.ctaHref}>
              {current.ctaLabel}
              <Icon name="der" size={18} />
            </a>
          </div>
        </div>

        <div className="why-tabs__media">
          <div className="why-tabs__img-frame">
            <span className="stamp label">{current.sello}</span>
            <Image
              src={current.imagen}
              alt={current.imagenAlt}
              fill
              sizes="(max-width: 960px) 100vw, 560px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

