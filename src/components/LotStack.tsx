"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DISPONIBLES, LISTA_FECHA, LOTES, MANZANAS, loteById, m2, soles, soles0, type Lote } from "@/content/lotes";
import { Ficha } from "./Ficha";
import { Icon } from "./Icon";

const PRECIO = "precio";
const TODAS = "TODAS";
type Vista = string; // "TODAS" | "A"…"H" | "precio"
type ColorMode = "estado" | "cuota" | "area";
type DisplayMode = "mapa" | "cuadricula";

export type ParcelGeom = {
  id: string;
  mz: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isMacro?: boolean;
};

const porManzana = MANZANAS.map((mz) => ({
  mz,
  lotes: LOTES.filter((l) => l.manzana === mz),
  libres: LOTES.filter((l) => l.manzana === mz && l.estado === "disponible").length,
  total: LOTES.filter((l) => l.manzana === mz).length,
}));

const porPrecio = [...DISPONIBLES].sort((a, b) => a.precio!.cuota - b.precio!.cuota);

/** Construye la geometría exacta en coordenadas SVG (1160x760) para los 132 lotes (Manzanas A–H). */
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
    vista: vista === PRECIO || vista === TODAS || (vista && MANZANAS.includes(vista)) ? vista : null,
    lote,
  };
}

function getLotFill(l: Lote, colorMode: ColorMode, isSelected: boolean, isHovered: boolean, dimmed: boolean): string {
  if (isSelected) return "var(--accent)";
  if (l.estado === "vendido") return dimmed ? "rgba(30, 53, 45, 0.35)" : "var(--lot-sold)";
  if (l.estado === "reservado") return "var(--lot-reserved)";
  if (isHovered) return "var(--lot-free-hover)";

  if (colorMode === "cuota" && l.precio) {
    if (l.precio.cuota <= 420) return "#10b981"; // Muy económico
    if (l.precio.cuota <= 550) return "#059669"; // Estándar
    return "#0d9488"; // Macrolotes / Especiales
  }
  if (colorMode === "area") {
    if (l.m2 >= 1200) return "#eab308"; // Macrolote
    if (l.m2 >= 580) return "#14b8a6"; // Amplio
    return "#10b981"; // Estándar 510 m²
  }
  return dimmed ? "rgba(16, 185, 129, 0.32)" : "var(--lot-free)";
}

/** Mini-plano de ubicación para la página individual /lote/[id]. */
export function MiniMasterplan({ loteActivo }: { loteActivo: Lote }) {
  return (
    <div className="mini-masterplan">
      <div className="mini-masterplan__head">
        <span className="label">Ubicación en el Masterplan · Manzana {loteActivo.manzana}</span>
        <span className="mini-masterplan__tag">Lote {loteActivo.id} resaltado</span>
      </div>
      <svg viewBox="0 0 1160 720" className="mini-masterplan__svg" role="img" aria-label={`Ubicación del lote ${loteActivo.id} en la manzana ${loteActivo.manzana}`}>
        <rect width="1160" height="720" rx="18" fill="#071913" />
        {/* Gran Parque Central */}
        <path
          d="M930,150 C1070,150 1120,250 1120,375 C1120,500 1070,590 930,590 Z"
          fill="rgba(16, 185, 129, 0.14)"
          stroke="rgba(166, 193, 56, 0.35)"
          strokeWidth="2"
        />
        <text x="1015" y="375" fill="#a6c138" fontSize="14" fontWeight="700" textAnchor="middle">
          PARQUE CENTRAL
        </text>
        {LOTES.map((l) => {
          const g = MASTERPLAN_GEOM[l.id];
          if (!g) return null;
          const active = l.id === loteActivo.id;
          const sameMz = l.manzana === loteActivo.manzana;
          return (
            <g key={l.id}>
              <rect
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                rx={3}
                fill={
                  active
                    ? "#a6c138"
                    : l.estado === "disponible"
                      ? sameMz
                        ? "#10b981"
                        : "rgba(16,185,129,0.25)"
                      : "rgba(255,255,255,0.08)"
                }
                stroke={active ? "#ffffff" : "rgba(255,255,255,0.18)"}
                strokeWidth={active ? 3 : 0.8}
              />
              {active ? (
                <circle cx={g.x + g.w / 2} cy={g.y + g.h / 2} r={26} fill="none" stroke="#a6c138" strokeWidth="2.5" strokeDasharray="4 3" />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function LotStack() {
  const [vista, setVista] = useState<Vista>(TODAS);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("mapa");
  const [colorMode, setColorMode] = useState<ColorMode>("estado");
  const [soloLibres, setSoloLibres] = useState(false);
  const [soloPromo, setSoloPromo] = useState(false);
  const [maxCuota, setMaxCuota] = useState<number>(1600);
  const [busqueda, setBusqueda] = useState("");
  const [droneOverlay, setDroneOverlay] = useState(false);
  const [droneOpacity, setDroneOpacity] = useState(55);

  // Lote seleccionado por defecto ("G18" o el de la URL) para que la Ficha Técnica esté activa desde el inicio
  const [sel, setSel] = useState<Lote | null>(() => loteById("G18") ?? DISPONIBLES[0] ?? null);
  const [hovered, setHovered] = useState<Lote | null>(null);
  const [flip, setFlip] = useState(0);

  // Estado de Zoom y Pan sobre el SVG
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

  useEffect(() => {
    const sync = () => {
      const { vista: v, lote } = leerUrl();
      const l = lote ? loteById(lote) ?? null : null;
      if (l) setSel(l);
      if (v) {
        setVista(v);
        if (v === PRECIO) setDisplayMode("cuadricula");
      } else if (l) {
        setVista(l.manzana);
      }
      setFlip((n) => n + 1);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const escribirUrl = useCallback((v: Vista, l: Lote | null) => {
    const q = new URLSearchParams(window.location.search);
    if (v && v !== TODAS) q.set("vista", v);
    else q.delete("vista");
    if (l) q.set("lote", l.id);
    else q.delete("lote");
    const qs = q.toString();
    window.history.replaceState(null, "", `${qs ? `?${qs}` : window.location.pathname}#lotes`);
  }, []);

  const elegirVista = (v: Vista) => {
    setVista(v);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (v === PRECIO) {
      setDisplayMode("cuadricula");
    }
    escribirUrl(v, sel);
  };

  const elegirLote = (l: Lote) => {
    setSel(l);
    setFlip((n) => n + 1);
    anunciarLote(l.id);
    escribirUrl(vista, l);
  };

  // Filtrado de lotes para resaltar en el mapa y listar en la cuadrícula
  const lotesFiltrados = useMemo(() => {
    return LOTES.filter((l) => {
      if (vista !== TODAS && vista !== PRECIO && l.manzana !== vista) return false;
      if (soloLibres && l.estado !== "disponible") return false;
      if (soloPromo && (!l.precio || !l.precio.promoContado)) return false;
      if (maxCuota < 1600 && l.estado === "disponible" && l.precio && l.precio.cuota > maxCuota) return false;
      if (busqueda.trim()) {
        const q = busqueda.trim().toUpperCase();
        if (!l.id.includes(q) && !`MZ ${l.manzana}`.includes(q)) return false;
      }
      return true;
    });
  }, [vista, soloLibres, soloPromo, maxCuota, busqueda]);

  const idsFiltrados = useMemo(() => new Set(lotesFiltrados.map((l) => l.id)), [lotesFiltrados]);

  const listaCuadricula = useMemo(() => {
    if (vista === PRECIO) {
      return [...lotesFiltrados]
        .filter((l) => l.estado === "disponible")
        .sort((a, b) => a.precio!.cuota - b.precio!.cuota);
    }
    return lotesFiltrados;
  }, [vista, lotesFiltrados]);

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
    <div className="masterplan-shell">
      {/* Barra superior de control del Masterplan */}
      <div className="mp-toolbar">
        <div className="mp-toolbar__top">
          {/* Conmutador Mapa Interactivo SVG vs Cuadrícula Comparativa */}
          <div className="mp-view-switch" role="group" aria-label="Modo de visualización">
            <button
              type="button"
              className={`mp-view-btn ${displayMode === "mapa" ? "is-active" : ""}`}
              onClick={() => {
                setDisplayMode("mapa");
                if (vista === PRECIO) setVista(TODAS);
              }}
            >
              <Icon name="plano" size={18} />
              Plano Masterplan SVG
            </button>
            <button
              type="button"
              className={`mp-view-btn ${displayMode === "cuadricula" ? "is-active" : ""}`}
              onClick={() => setDisplayMode("cuadricula")}
            >
              <Icon name="layers" size={18} />
              Cuadrícula y Precios ({lotesFiltrados.length})
            </button>
          </div>

          {/* Buscador rápido de lote y filtros rápidos */}
          <div className="mp-filters">
            <div className="mp-search">
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder="Buscar lote (ej. G18, C3, F11)…"
                value={busqueda}
                onChange={(e) => {
                  const val = e.target.value;
                  setBusqueda(val);
                  const exact = loteById(val.trim());
                  if (exact) setSel(exact);
                }}
                aria-label="Buscar lote por código"
              />
            </div>

            <label className="mp-chip-toggle">
              <input type="checkbox" checked={soloLibres} onChange={(e) => setSoloLibres(e.target.checked)} />
              <span>Solo disponibles (70)</span>
            </label>

            <label className="mp-chip-toggle mp-chip-toggle--gold">
              <input type="checkbox" checked={soloPromo} onChange={(e) => setSoloPromo(e.target.checked)} />
              <span>Promo Contado</span>
            </label>

            <div className="mp-cuota-filter">
              <label htmlFor="mp-cuota-select">Cuota máx:</label>
              <select
                id="mp-cuota-select"
                value={maxCuota}
                onChange={(e) => setMaxCuota(Number(e.target.value))}
              >
                <option value={1600}>Todas las cuotas</option>
                <option value={420}>Hasta S/ 420 / mes</option>
                <option value={520}>Hasta S/ 520 / mes</option>
                <option value={750}>Hasta S/ 750 / mes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selector de Manzanas A–H */}
        <div className="mp-manzanas" role="tablist" aria-label="Filtrar por Manzana">
          <button
            type="button"
            role="tab"
            aria-selected={vista === TODAS}
            className={`mp-mz-tab ${vista === TODAS ? "is-active" : ""}`}
            onClick={() => elegirVista(TODAS)}
          >
            <strong>Plano Completo</strong>
            <small>132 lotes · 8 Mz</small>
          </button>
          {porManzana.map((m) => (
            <button
              key={m.mz}
              id={`tab-${m.mz}`}
              type="button"
              role="tab"
              aria-selected={vista === m.mz}
              className={`mp-mz-tab ${vista === m.mz ? "is-active" : ""}`}
              onClick={() => elegirVista(m.mz)}
            >
              <strong>Mz {m.mz}</strong>
              <small>{m.libres} libres</small>
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={vista === PRECIO}
            className={`mp-mz-tab mp-mz-tab--price ${vista === PRECIO ? "is-active" : ""}`}
            onClick={() => elegirVista(PRECIO)}
          >
            <strong>Menor Cuota</strong>
            <small>Desde S/ 383.75</small>
          </button>
        </div>
      </div>

      {/* Cuerpo principal: Mapa/Cuadrícula a la izquierda + Ficha Técnica & Cotizador a la derecha */}
      <div className="lots">
        <div className="mp-stage-col">
          {displayMode === "mapa" ? (
            <div className="mp-canvas-card">
              {/* Sub-barra de herramientas del plano vectorial */}
              <div className="mp-canvas-bar">
                <div className="mp-colormodes" role="group" aria-label="Colorear lotes por">
                  <span className="mp-colormodes__label">Pintar por:</span>
                  <button
                    type="button"
                    className={`mp-pill ${colorMode === "estado" ? "is-active" : ""}`}
                    onClick={() => setColorMode("estado")}
                  >
                    Disponibilidad
                  </button>
                  <button
                    type="button"
                    className={`mp-pill ${colorMode === "cuota" ? "is-active" : ""}`}
                    onClick={() => setColorMode("cuota")}
                  >
                    Cuota mensual
                  </button>
                  <button
                    type="button"
                    className={`mp-pill ${colorMode === "area" ? "is-active" : ""}`}
                    onClick={() => setColorMode("area")}
                  >
                    Área (m²)
                  </button>
                </div>

                <div className="mp-canvas-actions">
                  <button
                    type="button"
                    className={`mp-pill mp-pill--drone ${droneOverlay ? "is-active" : ""}`}
                    onClick={() => setDroneOverlay((x) => !x)}
                    title="Superponer fotografía aérea real de drone sobre el plano"
                  >
                    <Icon name="drone" size={15} />
                    {droneOverlay ? "Ocultar Foto Drone" : "Ver Toma Drone Real"}
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
                      src="/media/hero.webp"
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
                  <defs>
                    <pattern id="mp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(166, 193, 56, 0.06)"
                        strokeWidth="1"
                      />
                    </pattern>
                    <linearGradient id="park-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(16, 185, 129, 0.24)" />
                      <stop offset="100%" stopColor="rgba(166, 193, 56, 0.12)" />
                    </linearGradient>
                    <linearGradient id="road-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0d261e" />
                      <stop offset="50%" stopColor="#14352a" />
                      <stop offset="100%" stopColor="#0d261e" />
                    </linearGradient>
                  </defs>

                  {/* Fondo arquitectónico con curvas topográficas del Valle de Zaña */}
                  <rect
                    x="0"
                    y="0"
                    width="1160"
                    height="760"
                    fill={droneOverlay ? "rgba(6, 21, 16, 0.45)" : "#071812"}
                  />
                  <rect x="0" y="0" width="1160" height="760" fill="url(#mp-grid)" />

                  {/* Curvas de nivel topográficas decorativas (Cerros del Valle de Zaña al norte y este) */}
                  <path
                    d="M 40 38 Q 290 12 560 34 T 1110 28"
                    fill="none"
                    stroke="rgba(166, 193, 56, 0.16)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />
                  <path
                    d="M 60 55 Q 340 28 640 48 T 1120 48"
                    fill="none"
                    stroke="rgba(166, 193, 56, 0.1)"
                    strokeWidth="1"
                  />
                  <text x="430" y="32" fill="rgba(166, 193, 56, 0.65)" fontSize="11" fontWeight="700" letterSpacing="2.5">
                    VISTA PANORÁMICA · CERROS Y VALLE DE ZAÑA
                  </text>

                  {/* Perímetro del Proyecto (Cerco Vivo) */}
                  <path
                    d="M 52 62 L 835 62 L 945 140 C 1095 148 1132 255 1132 375 C 1132 505 1090 595 940 612 L 905 648 L 52 648 Z"
                    fill="rgba(13, 39, 30, 0.55)"
                    stroke="rgba(166, 193, 56, 0.45)"
                    strokeWidth="2.5"
                    strokeDasharray="10 5"
                  />

                  {/* Calles Internas y Alameda Central con Iluminación Solar */}
                  {/* Alameda Central vertical */}
                  <rect x="478" y="138" width="34" height="510" fill="#0c231b" opacity="0.85" />
                  <line
                    x1="495"
                    y1="145"
                    x2="495"
                    y2="640"
                    stroke="rgba(166, 193, 56, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="8 8"
                  />
                  <text
                    x="495"
                    y="418"
                    fill="rgba(255,255,255,0.45)"
                    fontSize="9.5"
                    fontWeight="700"
                    letterSpacing="2"
                    textAnchor="middle"
                    transform="rotate(-90 495 418)"
                  >
                    ALAMEDA CENTRAL · ILUMINACIÓN SOLAR
                  </text>

                  {/* Calles horizontales */}
                  <rect x="68" y="135" width="755" height="27" fill="#0c231b" opacity="0.8" />
                  <text x="260" y="152" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="600" letterSpacing="1.8">
                    CALLE MIRADOR DEL VALLE
                  </text>

                  <rect x="68" y="262" width="755" height="27" fill="#0c231b" opacity="0.8" />
                  <text x="260" y="279" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="600" letterSpacing="1.8">
                    CALLE LAS PALMERAS
                  </text>

                  <rect x="68" y="396" width="755" height="32" fill="#0c231b" opacity="0.8" />
                  <text x="260" y="415" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="600" letterSpacing="1.8">
                    AV. LOS ALGARROBOS
                  </text>

                  <rect x="68" y="536" width="820" height="32" fill="#0c231b" opacity="0.8" />
                  <text x="260" y="555" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="600" letterSpacing="1.8">
                    PASEO LA CAMPIÑA
                  </text>

                  {/* Gran Parque Central & Club Campestre (Lado Este, curvo tal como en la foto de drone) */}
                  <g className="mp-park">
                    <path
                      d="M 926 156 C 1068 162 1114 256 1114 375 C 1114 494 1068 585 926 592 L 926 156 Z"
                      fill="url(#park-grad)"
                      stroke="#a6c138"
                      strokeWidth="2"
                    />
                    {/* Cancha de Grass Natural */}
                    <rect
                      x="948"
                      y="292"
                      width="96"
                      height="148"
                      rx="6"
                      fill="rgba(16, 185, 129, 0.25)"
                      stroke="#a6c138"
                      strokeWidth="1.5"
                    />
                    <line x1="948" y1="366" x2="1044" y2="366" stroke="rgba(166,193,56,0.6)" strokeWidth="1.2" />
                    <circle cx="996" cy="366" r="18" fill="none" stroke="rgba(166,193,56,0.6)" strokeWidth="1.2" />
                    <text x="996" y="363" fill="#ffffff" fontSize="9.5" fontWeight="700" textAnchor="middle">
                      CANCHA DE
                    </text>
                    <text x="996" y="375" fill="#a6c138" fontSize="9.5" fontWeight="800" textAnchor="middle">
                      GRASS NATURAL
                    </text>

                    {/* Zona de Parrillas & Hamacas */}
                    <rect
                      x="946"
                      y="206"
                      width="92"
                      height="66"
                      rx="8"
                      fill="rgba(6, 21, 16, 0.55)"
                      stroke="rgba(166,193,56,0.45)"
                      strokeWidth="1.2"
                    />
                    <text x="992" y="235" fill="#a6c138" fontSize="9.5" fontWeight="800" textAnchor="middle">
                      ZONA PARRILLAS
                    </text>
                    <text x="992" y="250" fill="#d1fae5" fontSize="8.5" textAnchor="middle">
                      &amp; HAMACAS
                    </text>

                    {/* Juegos para Niños & Gimnasio al Aire Libre */}
                    <rect
                      x="946"
                      y="456"
                      width="96"
                      height="68"
                      rx="8"
                      fill="rgba(6, 21, 16, 0.55)"
                      stroke="rgba(166,193,56,0.45)"
                      strokeWidth="1.2"
                    />
                    <text x="994" y="485" fill="#a6c138" fontSize="9.5" fontWeight="800" textAnchor="middle">
                      JUEGOS NIÑOS
                    </text>
                    <text x="994" y="500" fill="#d1fae5" fontSize="8.5" textAnchor="middle">
                      &amp; GIMNASIO
                    </text>

                    {/* Pozo Tubular */}
                    <circle cx="985" cy="555" r="14" fill="#0ea5e9" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="985" y="558" fill="#bae6fd" fontSize="7.5" fontWeight="700" textAnchor="middle">
                      POZO
                    </text>
                  </g>

                  {/* Carretera Vía a San Nicolás y Pórtico de Ingreso en el Frente Sur */}
                  <g className="mp-highway">
                    <rect x="20" y="666" width="1120" height="54" rx="8" fill="url(#road-grad)" stroke="rgba(255,255,255,0.14)" />
                    <line
                      x1="40"
                      y1="693"
                      x2="1120"
                      y2="693"
                      stroke="rgba(250, 204, 21, 0.55)"
                      strokeWidth="2"
                      strokeDasharray="16 12"
                    />
                    <text x="210" y="688" fill="#f8fafc" fontSize="11" fontWeight="700" letterSpacing="1.5">
                      ← VÍA A SAN NICOLÁS · 6 MIN SALTUR · 35 MIN CHICLAYO
                    </text>
                    <text x="760" y="688" fill="#f8fafc" fontSize="11" fontWeight="700" letterSpacing="1.5">
                      8 MIN CAYALTÍ · 16 MIN ZAÑA →
                    </text>

                    {/* Pórtico de Ingreso Construido (Hito Real) */}
                    <rect
                      x="442"
                      y="634"
                      width="94"
                      height="38"
                      rx="6"
                      fill="#a6c138"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text x="489" y="651" fill="#052319" fontSize="9.5" fontWeight="900" textAnchor="middle">
                      PÓRTICO DE INGRESO
                    </text>
                    <text x="489" y="663" fill="#052319" fontSize="8" fontWeight="700" textAnchor="middle">
                      CONSTRUIDO + CERCO VIVO
                    </text>
                  </g>

                  {/* Rótulos de Manzanas A–H */}
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
                        fill={vista === b.mz ? "var(--accent)" : "#0f3528"}
                        stroke="rgba(166, 193, 56, 0.7)"
                        strokeWidth="1.5"
                      />
                      <text
                        x={b.x}
                        y={b.y + 4}
                        fill={vista === b.mz ? "#062319" : "#ffffff"}
                        fontSize="11"
                        fontWeight="800"
                        textAnchor="middle"
                      >
                        {b.mz}
                      </text>
                    </g>
                  ))}

                  {/* Renderizado de los 132 Lotes individuales */}
                  {LOTES.map((l) => {
                    const g = MASTERPLAN_GEOM[l.id];
                    if (!g) return null;
                    const isSelected = sel?.id === l.id;
                    const isHovered = hovered?.id === l.id;
                    const matchesFilter = idsFiltrados.has(l.id);
                    const dimmed = !matchesFilter;
                    const fill = getLotFill(l, colorMode, isSelected, isHovered, dimmed);

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
                          x={g.x}
                          y={g.y}
                          width={g.w}
                          height={g.h}
                          rx={3.5}
                          fill={fill}
                          stroke={
                            isSelected
                              ? "#ffffff"
                              : isHovered
                                ? "#ffffff"
                                : l.precio?.promoContado
                                  ? "#fde047"
                                  : "rgba(255, 255, 255, 0.22)"
                          }
                          strokeWidth={isSelected ? 2.6 : isHovered ? 2 : 0.9}
                        />
                        {/* Indicador de promoción al contado o macrolote */}
                        {l.precio?.promoContado && !dimmed ? (
                          <circle cx={g.x + g.w - 5} cy={g.y + 5} r={2.8} fill="#fde047" />
                        ) : null}

                        {/* Código del lote */}
                        <text
                          x={g.x + g.w / 2}
                          y={g.y + g.h / 2 - (g.w >= 34 ? 2 : -3)}
                          fill={
                            isSelected
                              ? "#052319"
                              : l.estado === "vendido"
                                ? "rgba(255,255,255,0.45)"
                                : "#ffffff"
                          }
                          fontSize={g.w < 26 ? "7.2" : g.w < 36 ? "8.5" : "9.5"}
                          fontWeight="800"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {l.id}
                        </text>

                        {/* Superficie m² visible en lotes medianos/grandes */}
                        {g.w >= 34 ? (
                          <text
                            x={g.x + g.w / 2}
                            y={g.y + g.h / 2 + 10}
                            fill={
                              isSelected
                                ? "#052319"
                                : l.estado === "vendido"
                                  ? "rgba(255,255,255,0.28)"
                                  : "rgba(255,255,255,0.88)"
                            }
                            fontSize="7.2"
                            fontWeight="600"
                            textAnchor="middle"
                            pointerEvents="none"
                          >
                            {l.m2}m²
                          </text>
                        ) : null}
                      </g>
                    );
                  })}

                  {/* Rosa de los Vientos (Norte) */}
                  <g transform="translate(1105, 68)">
                    <circle cx="0" cy="0" r="22" fill="rgba(6, 21, 16, 0.8)" stroke="rgba(166,193,56,0.5)" strokeWidth="1.5" />
                    <polygon points="0,-15 5,4 0,0 -5,4" fill="#a6c138" />
                    <text x="0" y="15" fill="#ffffff" fontSize="8.5" fontWeight="800" textAnchor="middle">
                      N
                    </text>
                  </g>
                </svg>

                {/* Tooltip flotante en tiempo real al pasar el cursor sobre cualquier lote */}
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
                      Manzana {hovered.manzana} · <b>{m2(hovered.m2)}</b>
                    </div>
                    {hovered.precio ? (
                      <div className="mp-tooltip__price">
                        <span>
                          Cuota: <b>{soles(hovered.precio.cuota)}/mes</b>
                        </span>
                        <span>
                          Contado: <b>{soles0(hovered.precio.promoContado ?? hovered.precio.contado)}</b>
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Leyenda interactiva inferior */}
              <div className="mp-legend">
                <div className="mp-legend__items">
                  <span>
                    <i className="mp-dot mp-dot--free" /> Disponible (70)
                  </span>
                  <span>
                    <i className="mp-dot mp-dot--promo" /> Bono Promo Contado
                  </span>
                  <span>
                    <i className="mp-dot mp-dot--reserved" /> Reservado (1)
                  </span>
                  <span>
                    <i className="mp-dot mp-dot--sold" /> Vendido (61)
                  </span>
                  <span>
                    <i className="mp-dot mp-dot--selected" /> Lote activo ({sel?.id ?? "—"})
                  </span>
                </div>
                <p className="mp-legend__hint">
                  Haz clic en cualquier lote para simular sus cuotas o usa los botones <b>Mz A–H</b> para acercar cada
                  sector.
                </p>
              </div>
            </div>
          ) : (
            /* Vista Cuadrícula / Lista Comparativa */
            <div className="mz" id="panel-lotes" role="tabpanel">
              <div className="mz__head">
                <div>
                  <h3>
                    {vista === PRECIO
                      ? `${listaCuadricula.length} lotes disponibles ordenados de menor a mayor cuota`
                      : vista === TODAS
                        ? `Todos los lotes (${listaCuadricula.length} mostrados)`
                        : `Manzana ${vista} (${listaCuadricula.length} lotes)`}
                  </h3>
                  <p className="mz__sub">
                    Selecciona cualquier unidad para abrir su simulador financiero y ficha técnica a la derecha.
                  </p>
                </div>
                <div className="sort">
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => elegirVista(vista === PRECIO ? TODAS : PRECIO)}
                  >
                    {vista === PRECIO ? "Ver por manzanas" : "Ordenar por menor cuota"}
                  </button>
                </div>
              </div>

              <div className="grid-lots">
                {listaCuadricula.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={`lot ${sel?.id === l.id ? "is-selected" : ""}`}
                    data-estado={l.estado}
                    aria-pressed={sel?.id === l.id}
                    onClick={() => elegirLote(l)}
                  >
                    <div className="lot__top">
                      <b>{l.id}</b>
                      {l.precio?.promoContado ? <em className="lot__promo-dot" title="Promoción al contado" /> : null}
                    </div>
                    <span className="lot__area">{l.m2} m²</span>
                    <span className="lot__price">
                      {l.estado === "disponible" ? `${soles0(l.precio!.cuota)}/mes` : l.estado}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral: Ficha Técnica Ejecutiva & Simulador en Vivo */}
        <aside className="ficha panel" aria-live="polite">
          <div className="band ficha__band">
            <div>
              <span className="ficha__band-eyebrow">Simulador &amp; Expediente</span>
              <h3>{sel ? `Ficha Técnica · Lote ${sel.id}` : "Selecciona un lote en el mapa"}</h3>
            </div>
            {sel ? <span className="ficha__band-code">{sel.id}</span> : null}
          </div>
          <div key={flip}>
            {sel ? (
              <Ficha lote={sel} onPedir={(l) => anunciarLote(l.id)} />
            ) : (
              <div className="ficha__empty">
                <Icon name="plano" size={40} />
                <p>Haz clic en cualquier lote del Masterplan para simular su cuota inicial y mensualidad exacta.</p>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => {
                    const eco = loteById("G18") ?? DISPONIBLES[0];
                    if (eco) elegirLote(eco);
                  }}
                >
                  Ver lote más económico (G18)
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
