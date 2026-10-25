"use client";

import Image from "next/image";
import { track } from "@/lib/tracking/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { DESDE, DISPONIBLES, LOTES, MANZANAS, loteById, m2, resumen, soles, soles0, type Lote } from "@/content/lotes";
import { gsap, useGSAP, useMotion } from "@/lib/motion";
import { Ficha } from "./Ficha";
import { Icon } from "./Icon";

const TODAS = "TODAS";
type Vista = string; // "TODAS" | "A"…"H"
type ColorMode = "estado" | "cuota" | "area";

export type ParcelGeom = {
  id: string;
  mz: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isMacro?: boolean;
};

const CONTEO = resumen();

/** Conserva el esquema ilustrativo heredado en coordenadas SVG (1160x760); no representa geometría catastral para los 132 lotes (Manzanas A–H). */
export const MASTERPLAN_GEOM: Record<string, ParcelGeom> = (() => {
  const map: Record<string, ParcelGeom> = {};

  // Manzana A (9 lotes: A1..A9) — Frente Sur-Oeste junto a Vía San Nicolás
  for (let i = 0; i < 9; i++) {
    const id = `A${i + 1}`;
    map[id] = { id, mz: "A", x: 76 + i * 42, y: 572, w: 40, h: 58 };
  }

  // Manzana B (9 lotes: B1..B9) — Frente Sur-Este junto a Pórtico de Ingreso
  for (let i = 0; i < 9; i++) {
    const id = `B${i + 1}`;
    map[id] = { id, mz: "B", x: 542 + i * 38, y: 572, w: 36, h: 58 };
  }

  // Manzana C (20 lotes: C1..C20) — Bloque doble Oeste con macrolotes C6 (1487 m²) y C7 (1382 m²) en cabecera
  // C1..C5 fila sur (5 lotes), C6 y C7 macrolotes cabecera este, C8..C20 fila norte (13 lotes)
  for (let i = 0; i < 5; i++) {
    const id = `C${i + 1}`;
    map[id] = { id, mz: "C", x: 76 + i * 64, y: 484, w: 62, h: 48 };
  }
  map["C6"] = { id: "C6", mz: "C", x: 398, y: 484, w: 56, h: 48, isMacro: true };
  map["C7"] = { id: "C7", mz: "C", x: 398, y: 432, w: 56, h: 49, isMacro: true };
  for (let i = 0; i < 13; i++) {
    const id = `C${i + 8}`;
    map[id] = { id, mz: "C", x: 76 + i * 24.6, y: 432, w: 23.2, h: 49 };
  }

  // Manzana D (34 lotes: D1..D34) — Gran bloque central doble con D16 (1647 m²) y D17 (1600 m²) en cabecera
  // D1..D15 fila sur (15 lotes), D16 y D17 macrolotes cabecera este, D18..D34 fila norte (17 lotes)
  for (let i = 0; i < 15; i++) {
    const id = `D${i + 1}`;
    map[id] = { id, mz: "D", x: 76 + i * 44, y: 344, w: 42.5, h: 48 };
  }
  map["D16"] = { id: "D16", mz: "D", x: 738, y: 344, w: 68, h: 48, isMacro: true };
  map["D17"] = { id: "D17", mz: "D", x: 738, y: 292, w: 68, h: 49, isMacro: true };
  for (let i = 0; i < 17; i++) {
    const id = `D${i + 18}`;
    map[id] = { id, mz: "D", x: 76 + i * 38.8, y: 292, w: 37.3, h: 49 };
  }

  // Manzana E (8 lotes: E1..E8) — Bloque curvo / Frente al Gran Parque Central y Cancha de Grass
  for (let i = 0; i < 8; i++) {
    const id = `E${i + 1}`;
    map[id] = { id, mz: "E", x: 842, y: 170 + i * 47, w: 68, h: 44.5 };
  }

  // Manzana F (21 lotes: F1..F21) — Bloque doble Nor-Oeste con macrolotes F11 (1550 m²) y F12 (1658 m²)
  for (let i = 0; i < 10; i++) {
    const id = `F${i + 1}`;
    map[id] = { id, mz: "F", x: 76 + i * 33.5, y: 214, w: 32, h: 45 };
  }
  map["F11"] = { id: "F11", mz: "F", x: 413, y: 214, w: 52, h: 45, isMacro: true };
  map["F12"] = { id: "F12", mz: "F", x: 413, y: 166, w: 52, h: 45, isMacro: true };
  for (let i = 0; i < 9; i++) {
    const id = `F${i + 13}`;
    map[id] = { id, mz: "F", x: 76 + i * 37.2, y: 166, w: 35.6, h: 45 };
  }

  // Manzana G (21 lotes: G1..G21) — Bloque doble Nor-Este con macrolote G21 (1265 m²)
  for (let i = 0; i < 10; i++) {
    const id = `G${i + 1}`;
    map[id] = { id, mz: "G", x: 522 + i * 24, y: 214, w: 22.6, h: 45 };
  }
  for (let i = 0; i < 10; i++) {
    const id = `G${i + 11}`;
    map[id] = { id, mz: "G", x: 522 + i * 24, y: 166, w: 22.6, h: 45 };
  }
  map["G21"] = { id: "G21", mz: "G", x: 764, y: 166, w: 52, h: 93, isMacro: true };

  // Manzana H (10 lotes: H1..H10) — Bloque Mirador Norte con macrolote H10 (1392 m²)
  for (let i = 0; i < 9; i++) {
    const id = `H${i + 1}`;
    map[id] = { id, mz: "H", x: 110 + i * 64, y: 78, w: 62, h: 54 };
  }
  map["H10"] = { id: "H10", mz: "H", x: 688, y: 78, w: 92, h: 54, isMacro: true };

  return map;
})();

/** Coordenadas de enfoque (viewBox) por cada Manzana para zoom automático. */
const MZ_VIEWBOX: Record<string, [number, number, number, number]> = {
  TODAS: [0, 0, 1160, 760],
  A: [40, 500, 480, 220],
  B: [490, 500, 450, 220],
  C: [40, 390, 460, 190],
  D: [40, 250, 810, 195],
  E: [760, 130, 380, 460],
  F: [40, 130, 465, 175],
  G: [485, 130, 380, 175],
  H: [70, 40, 760, 150],
};

/** Avisa al formulario de contacto qué lote eligió el visitante. */
export function anunciarLote(id: string) {
  window.dispatchEvent(new CustomEvent("campina:lote", { detail: id }));
}

function leerUrl(): { vista: Vista | null; lote: string | null } {
  const q = new URLSearchParams(window.location.search);
  const lote = q.get("lote");
  const vista = q.get("vista");
  return {
    vista: vista === TODAS || (vista && MANZANAS.includes(vista)) ? vista : null,
    lote,
  };
}

// Colores del plano (tokens --plan-* en globals.css): lotes trazados en cal sobre tierra.
function getLotFill(l: Lote, colorMode: ColorMode, isSelected: boolean, isHovered: boolean, dimmed: boolean): string {
  if (isSelected) return "var(--lime)";
  if (l.estado === "vendido") return dimmed ? "var(--plan-sold-dim)" : "var(--plan-sold)";
  if (l.estado === "reservado") return "var(--plan-reserved)";
  if (isHovered) return "var(--plan-hover)";

  if (colorMode === "cuota" && l.precio) {
    if (l.precio.cuota <= 420) return "var(--plan-q1)"; // Cuotas más bajas
    if (l.precio.cuota <= 550) return "var(--plan-q2)";
    return "var(--plan-q3)"; // Lotes grandes
  }
  if (colorMode === "area") {
    if (l.m2 >= 1200) return "var(--plan-a3)"; // Más de 1,200 m²
    if (l.m2 >= 580) return "var(--plan-a2)";
    return "var(--plan-a1)"; // 510 m²
  }
  return dimmed ? "var(--plan-free-dim)" : "var(--plan-free)";
}

/**
 * Plano interactivo + ficha con simulador.
 * - En la portada (sin props) lee y escribe ?vista=&lote= en la URL y avisa al formulario.
 * - En /lote/[id] (`lote` + `onLote`) arranca en ese lote y deja que la página cambie de lote.
 */
export function LotStack({ lote, onLote }: { lote?: Lote; onLote?: (l: Lote) => void } = {}) {
  const enPortada = !onLote;
  // En /lote/[id] el plano abre completo (el lote va resaltado) para poder tocar cualquier otro.
  const [vista, setVista] = useState<Vista>(TODAS);
  const [colorMode, setColorMode] = useState<ColorMode>("estado");
  const [droneOverlay, setDroneOverlay] = useState(false);
  const [droneOpacity, setDroneOpacity] = useState(55);

  // Lote activo desde el inicio (el de la página, el de la URL o el de cuota más baja) para que la ficha no quede vacía.
  const [sel, setSel] = useState<Lote | null>(() => lote ?? DESDE ?? DISPONIBLES[0] ?? null);
  const [hovered, setHovered] = useState<Lote | null>(null);
  const [flip, setFlip] = useState(0);

  // Estado de Zoom y Pan sobre el SVG
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

  // Gesto de la página: al entrar en pantalla, las líneas de los 132 lotes se trazan como con cal
  // sobre la tierra, y después se rellenan. Una sola vez y solo en la portada (en /lote/[id] el plano
  // llega ya pintado desde el servidor); sin movimiento el plano aparece completo.
  const shell = useRef<HTMLDivElement>(null);
  const ok = useMotion();
  useGSAP(
    () => {
      if (!ok || !enPortada) return;
      const lines = gsap.utils.toArray<SVGRectElement>(".mp-parcel__line", shell.current);
      if (!lines.length) return;
      gsap.from(lines, {
        drawSVG: 0,
        fillOpacity: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: { amount: 1.6 },
        clearProps: "strokeDasharray,strokeDashoffset,fillOpacity",
        scrollTrigger: { trigger: shell.current, start: "top 70%", once: true },
      });
    },
    { scope: shell, dependencies: [ok, enPortada] },
  );

  useEffect(() => {
    if (!enPortada) return;
    const sync = () => {
      const { vista: v, lote: id } = leerUrl();
      const l = id ? loteById(id) ?? null : null;
      if (l) setSel(l);
      if (v) setVista(v);
      else if (l) setVista(l.manzana);
      setFlip((n) => n + 1);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [enPortada]);

  const escribirUrl = useCallback((v: Vista, l: Lote | null) => {
    if (!enPortada) return;
    const q = new URLSearchParams(window.location.search);
    if (v && v !== TODAS) q.set("vista", v);
    else q.delete("vista");
    if (l) q.set("lote", l.id);
    else q.delete("lote");
    const qs = q.toString();
    window.history.replaceState(null, "", `${qs ? `?${qs}` : window.location.pathname}#lotes`);
  }, [enPortada]);

  const elegirVista = (v: Vista) => {
    track("lot_filter", { mode: "manzana" });
    setVista(v);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    escribirUrl(v, sel);
  };

  const elegirLote = (l: Lote) => {
    track("lot_view", { lot: l.id });
    setSel(l);
    setFlip((n) => n + 1);
    if (onLote) onLote(l);
    else anunciarLote(l.id);
    escribirUrl(vista, l);
  };

  // Cálculo del viewBox activo según Manzana + Zoom + Pan
  const baseVb = MZ_VIEWBOX[vista] ?? MZ_VIEWBOX.TODAS;
  const vbW = baseVb[2] / zoom;
  const vbH = baseVb[3] / zoom;
  const vbX = baseVb[0] + (baseVb[2] - vbW) / 2 - pan.x;
  const vbY = baseVb[1] + (baseVb[3] - vbH) / 2 - pan.y;

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.current.x) * (vbW / 800);
    const dy = (e.clientY - dragStart.current.y) * (vbH / 520);
    setPan({
      x: Math.max(-350, Math.min(350, dragStart.current.panX + dx)),
      y: Math.max(-260, Math.min(260, dragStart.current.panY + dy)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="lots" ref={shell}>
      <div className="mp-stage-col">
        <div className="mp-canvas-card">
          {/* Sub-barra simplificada del plano: estado general + controles de vista */}
          <div className="mp-canvas-bar">
            <div className="mp-colormodes">
              <span className="mp-pill is-active">
                Disponibles ({CONTEO.disponibles})
              </span>
            </div>

            <div className="mp-canvas-actions">
              <button
                type="button"
                className={`mp-pill mp-pill--drone ${droneOverlay ? "is-active" : ""}`}
                onClick={() => setDroneOverlay((x) => !x)}
                title="Fotografía de referencia; no está georreferenciada ni alineada al esquema"
              >
                <Icon name="drone" size={15} />
                {droneOverlay ? "Ocultar foto" : "Ver foto de referencia"}
              </button>

              {droneOverlay ? (
                <input
                  type="range"
                  min={20}
                  max={85}
                  value={droneOpacity}
                  onChange={(e) => setDroneOpacity(Number(e.target.value))}
                  className="mp-drone-slider"
                  aria-label="Opacidad de foto de drone"
                />
              ) : null}

              <div className="mp-zoom-group" role="group" aria-label="Controles de zoom del plano">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.8, +(z + 0.35).toFixed(2)))}
                  aria-label="Acercar plano"
                  title="Acercar"
                >
                  <Icon name="zoomIn" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, +(z - 0.35).toFixed(2)))}
                  aria-label="Alejar plano"
                  title="Alejar"
                >
                  <Icon name="zoomOut" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                    setVista(TODAS);
                  }}
                  aria-label="Restablecer vista completa"
                  title="Vista completa"
                >
                  <Icon name="reset" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Lienzo interactivo SVG + Superposición Drone opcional */}
          <div className="mp-viewport">
            {droneOverlay ? (
              <div className="mp-drone-layer" style={{ opacity: droneOpacity / 100 }}>
                <Image
                  src="/media/editada-aerea-lotes.jpg"
                  alt="Fotografía aérea de drone de los lotes trazados con cal en La Campiña"
                  fill
                  sizes="(max-width: 1024px) 100vw, 820px"
                />
              </div>
            ) : null}

            <svg
              viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
              className={`mp-svg ${isDragging ? "is-dragging" : ""}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                setIsDragging(false);
                setHovered(null);
              }}
              role="group"
              aria-label="Masterplan interactivo de los 132 lotes de La Campiña"
            >
              {/* Tierra del terreno; con la foto de referencia se vuelve translúcida. */}
              <rect x="0" y="0" width="1160" height="760" fill={droneOverlay ? "var(--plan-ground-veil)" : "var(--plan-ground)"} />

              {/* Perímetro del proyecto (cerco) en línea de cal discontinua */}
              <path
                d="M 52 62 L 835 62 L 945 140 C 1095 148 1132 255 1132 375 C 1132 505 1090 595 940 612 L 905 648 L 52 648 Z"
                fill="var(--plan-inner)"
                stroke="var(--plan-cal)"
                strokeOpacity="0.55"
                strokeWidth="2"
                strokeDasharray="10 6"
              />

              {/* Vías internas del esquema (sin nombres: no hay nomenclatura oficial) */}
              <rect x="478" y="138" width="34" height="510" fill="var(--plan-street)" />
              <rect x="68" y="135" width="755" height="27" fill="var(--plan-street)" />
              <rect x="68" y="262" width="755" height="27" fill="var(--plan-street)" />
              <rect x="68" y="396" width="755" height="32" fill="var(--plan-street)" />
              <rect x="68" y="536" width="820" height="32" fill="var(--plan-street)" />

              {/* Áreas comunes proyectadas (ubicación esquemática) */}
              <g className="mp-park">
                <path
                  d="M 926 156 C 1068 162 1114 256 1114 375 C 1114 494 1068 585 926 592 L 926 156 Z"
                  fill="var(--plan-park)"
                  stroke="var(--plan-cal)"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                />
                <rect x="948" y="292" width="96" height="148" fill="var(--plan-grass)" stroke="var(--plan-cal)" strokeOpacity="0.7" strokeWidth="1.2" />
                <line x1="948" y1="366" x2="1044" y2="366" stroke="var(--plan-cal)" strokeOpacity="0.7" strokeWidth="1" />
                <circle cx="996" cy="366" r="18" fill="none" stroke="var(--plan-cal)" strokeOpacity="0.7" strokeWidth="1" />
                <text x="996" y="318" fill="var(--plan-cal)" fontSize="11" textAnchor="middle">Cancha</text>
                <text x="992" y="242" fill="var(--plan-cal)" fontSize="11" textAnchor="middle">Parrillas y hamacas</text>
                <text x="994" y="492" fill="var(--plan-cal)" fontSize="11" textAnchor="middle">Juegos y gimnasio</text>
                <text x="985" y="560" fill="var(--plan-cal)" fontSize="11" textAnchor="middle">Pozo</text>
              </g>

              {/* Vía a San Nicolás y pórtico de ingreso, en el frente */}
              <g className="mp-highway">
                <rect x="20" y="666" width="1120" height="54" fill="var(--plan-road)" />
                <line x1="40" y1="693" x2="1120" y2="693" stroke="var(--plan-cal)" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="16 12" />
                <text x="40" y="712" fill="var(--plan-cal)" fontSize="13">← Vía a San Nicolás: Saltur 6 min, Chiclayo 35 min</text>
                <text x="1120" y="712" fill="var(--plan-cal)" fontSize="13" textAnchor="end">Cayaltí 8 min →</text>
                <rect x="442" y="634" width="94" height="38" fill="var(--lime)" />
                <text x="489" y="657" fill="var(--ink)" fontSize="12" fontWeight="600" textAnchor="middle">Pórtico</text>
              </g>

              {/* Rótulos de Manzanas A–H: acercan el plano a esa manzana */}
              {[
                { mz: "A", x: 56, y: 605 },
                { mz: "B", x: 904, y: 605 },
                { mz: "C", x: 56, y: 482 },
                { mz: "D", x: 56, y: 344 },
                { mz: "E", x: 876, y: 152 },
                { mz: "F", x: 56, y: 215 },
                { mz: "G", x: 506, y: 215 },
                { mz: "H", x: 88, y: 108 },
              ].map((b) => (
                <g
                  key={b.mz}
                  className="mp-mz-marker"
                  onClick={() => elegirVista(vista === b.mz ? TODAS : b.mz)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={b.x}
                    cy={b.y}
                    r="14"
                    fill={vista === b.mz ? "var(--lime)" : "var(--plan-road)"}
                    stroke="var(--plan-cal)"
                    strokeOpacity="0.7"
                    strokeWidth="1.5"
                  />
                  <text
                    x={b.x}
                    y={b.y + 4}
                    fill={vista === b.mz ? "var(--ink)" : "var(--plan-cal)"}
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {b.mz}
                  </text>
                </g>
              ))}

              {/* Renderizado de los 132 Lotes individuales (solo código y disponibilidad) */}
              {LOTES.map((l) => {
                const g = MASTERPLAN_GEOM[l.id];
                if (!g) return null;
                const isSelected = sel?.id === l.id;
                const isHovered = hovered?.id === l.id;
                // Con una manzana elegida, el resto del plano queda atenuado.
                const dimmed = vista !== TODAS && l.manzana !== vista;
                const fill = getLotFill(l, "estado", isSelected, isHovered, dimmed);

                return (
                  <g
                    key={l.id}
                    className={`mp-parcel ${l.estado} ${isSelected ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      elegirLote(l);
                    }}
                    onMouseEnter={() => setHovered(l)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      className="mp-parcel__line"
                      x={g.x}
                      y={g.y}
                      width={g.w}
                      height={g.h}
                      fill={fill}
                      stroke={isSelected || isHovered ? "var(--ink)" : "var(--plan-cal)"}
                      strokeOpacity={isSelected || isHovered ? 1 : 0.8}
                      strokeWidth={isSelected ? 2.6 : isHovered ? 2 : 1}
                    />

                    {/* Código del lote centrado y limpio */}
                    <text
                      x={g.x + g.w / 2}
                      y={g.y + g.h / 2 + 3.5}
                      fill={
                        isSelected
                          ? "var(--ink)"
                          : l.estado === "vendido"
                            ? "var(--plan-cal-dim)"
                            : "var(--plan-cal)"
                      }
                      fontSize={g.w < 26 ? "7.8" : g.w < 36 ? "9" : "10.5"}
                      fontWeight="700"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {l.id}
                    </text>
                  </g>
                );
              })}

              {/* Rosa de los Vientos (Norte) */}
              <g transform="translate(1105, 68)">
                <circle cx="0" cy="0" r="22" fill="var(--plan-road)" stroke="var(--plan-cal)" strokeOpacity="0.6" strokeWidth="1.5" />
                <polygon points="0,-15 5,4 0,0 -5,4" fill="var(--lime)" />
                <text x="0" y="15" fill="var(--plan-cal)" fontSize="9" fontWeight="600" textAnchor="middle">
                  N
                </text>
              </g>
            </svg>

            {/* Tooltip flotante simple al pasar el cursor */}
            {hovered ? (
              <div className="mp-tooltip" role="status">
                <div className="mp-tooltip__head">
                  <strong>Lote {hovered.id}</strong>
                  <span className={`mp-tooltip__badge mp-tooltip__badge--${hovered.estado}`}>
                    {hovered.estado === "disponible"
                      ? "Disponible"
                      : hovered.estado === "reservado"
                        ? "Reservado"
                        : "Vendido"}
                  </span>
                </div>
                <div className="mp-tooltip__meta">
                  Manzana {hovered.manzana}
                </div>
              </div>
            ) : null}
          </div>

          {/* Leyenda inferior simple */}
          <div className="mp-legend">
            <div className="mp-legend__items">
              <span>
                <i className="mp-dot mp-dot--free" /> Disponible ({CONTEO.disponibles})
              </span>
              <span>
                <i className="mp-dot mp-dot--reserved" /> Reservado ({CONTEO.reservados})
              </span>
              <span>
                <i className="mp-dot mp-dot--sold" /> Vendido ({CONTEO.vendidos})
              </span>
              <span>
                <i className="mp-dot mp-dot--selected" /> Tu lote ({sel?.id ?? "ninguno"})
              </span>
            </div>
            <p className="mp-legend__hint">
              Toca cualquier lote disponible para seleccionarlo y recibir toda la información con un asesor.
            </p>
          </div>
        </div>
      </div>

      {/* Panel Lateral simplificado: estado del lote y contacto directo con asesor */}
      <aside className="ficha panel" aria-live="polite">
        {sel ? null : (
          <div className="band ficha__band">
            <h3>Elige un lote en el plano</h3>
          </div>
        )}
        <div key={flip}>
          {sel ? (
            enPortada ? <Ficha lote={sel} onPedir={(l) => anunciarLote(l.id)} /> : <Ficha lote={sel} showFullLink={false} />
          ) : (
            <div className="ficha__empty">
              <Icon name="plano" size={40} />
              <p>Toca cualquier lote disponible en el plano para consultarlo con un asesor.</p>
              <button
                type="button"
                className="btn btn--small"
                onClick={() => {
                  const eco = DESDE ?? DISPONIBLES[0];
                  if (eco) elegirLote(eco);
                }}
              >
                {`Seleccionar lote disponible (${DESDE.id})`}
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
