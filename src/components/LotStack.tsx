"use client";

import Image from "next/image";
import { track } from "@/lib/tracking/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MANZANAS, m2, soles, soles0, type Lote } from "@/content/lotes";
import { gsap, useGSAP, useMotion } from "@/lib/motion";
import { PLANO } from "@/content/plano";
import { useLotes } from "./LotesProvider";
import { Ficha } from "./Ficha";
import { Icon } from "./Icon";

const TODAS = "TODAS";
type Vista = string; // "TODAS" | "A"…"H"
type ColorMode = "estado" | "cuota" | "area";

/** Encuadre (viewBox) de cada manzana para el zoom; la vista completa es el lienzo entero.
 *  La geometría es la del plano de lotización oficial (src/content/plano.ts, docs/0019, 0031). */
const MZ_VIEWBOX: Record<string, [number, number, number, number]> = {
  TODAS: [0, 0, PLANO.ancho, PLANO.alto],
  ...Object.fromEntries(Object.entries(PLANO.manzanas).map(([mz, m]) => [mz, m.vista])),
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
export function LotStack({ lote, onLote, origen }: { lote?: Lote; onLote?: (l: Lote) => void; origen?: string } = {}) {
  const enPortada = !onLote;
  // Lotes vigentes: la lista con los cambios de /panel (docs/0032).
  const { lotes: LOTES, disponibles: DISPONIBLES, desde: DESDE, resumen: CONTEO, loteById } = useLotes();
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
      const lines = gsap.utils.toArray<SVGGeometryElement>(".mp-parcel__line", shell.current);
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
                title="Fotografía de referencia; no está alineada al plano"
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
              {/* Tierra alrededor del terreno; con la foto de referencia se vuelve translúcida. */}
              <rect
                x={-PLANO.ancho / 2}
                y={-PLANO.alto / 2}
                width={PLANO.ancho * 2}
                height={PLANO.alto * 2}
                fill={droneOverlay ? "var(--plan-ground-veil)" : "var(--plan-ground)"}
              />

              {/* Vía a San Nicolás, por el frente del terreno */}
              <g className="mp-highway" pointerEvents="none">
                <path d={PLANO.via} fill="var(--plan-road)" />
                {PLANO.viaRotulos.map((r, i) => (
                  <text
                    key={r.texto}
                    x={r.x}
                    y={r.y}
                    transform={`rotate(${r.angulo} ${r.x} ${r.y})`}
                    fill="var(--plan-cal)"
                    fillOpacity={i ? 0.7 : 1}
                    fontSize={i ? 7 : 9}
                    fontWeight={i ? 400 : 600}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {r.texto}
                  </text>
                ))}
              </g>

              {/* Terreno (10.98 ha) con su perímetro en cal discontinua: lo que no es lote ni área común son calles y alamedas. */}
              <path
                d={PLANO.terreno}
                fill="var(--plan-street)"
                stroke="var(--plan-cal)"
                strokeOpacity="0.55"
                strokeWidth="1.2"
                strokeDasharray="6 4"
              />

              {/* Áreas comunes del plano: bermas con palmeras, 4 parques y reservorio */}
              <g className="mp-park" pointerEvents="none">
                {PLANO.bermas.map((d, i) => (
                  <path key={i} d={d} fill="var(--plan-park)" />
                ))}
                {PLANO.parques.map((d, i) => (
                  <path key={i} d={d} fill="var(--plan-park)" stroke="var(--plan-cal)" strokeOpacity="0.5" strokeWidth="0.8" />
                ))}
                <path d={PLANO.reservorio.d} fill="var(--plan-road)" stroke="var(--plan-cal)" strokeOpacity="0.5" strokeWidth="0.8" />
                <text x={PLANO.reservorio.x} y={PLANO.reservorio.y} fill="var(--plan-cal)" fillOpacity="0.8" fontSize="6.5" textAnchor="middle">
                  Reservorio
                </text>
                {PLANO.amenidades.map((a) => (
                  <text key={`${a.texto}-${a.x}`} x={a.x} y={a.y} fill="var(--plan-cal)" fillOpacity="0.85" fontSize="4.2" textAnchor="middle">
                    {a.texto}
                  </text>
                ))}
                {PLANO.calles.map((c) => (
                  <text
                    key={c.texto}
                    x={c.x}
                    y={c.y}
                    transform={`rotate(${c.angulo} ${c.x} ${c.y})`}
                    fill="var(--plan-cal)"
                    fillOpacity="0.7"
                    fontSize="5.5"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {c.texto}
                  </text>
                ))}
              </g>

              {/* Pórtico de ingreso, sobre la vía */}
              <g className="mp-portico" pointerEvents="none">
                <circle cx={PLANO.portico.x} cy={PLANO.portico.y} r="4" fill="var(--lime)" />
                <text x={PLANO.portico.x} y={PLANO.portico.y - 7} fill="var(--plan-cal)" fontSize="7.5" fontWeight="600" textAnchor="middle">
                  Pórtico de ingreso
                </text>
              </g>

              {/* Renderizado de los 132 lotes con su forma real (solo código y disponibilidad) */}
              {LOTES.map((l) => {
                const g = PLANO.lotes[l.id];
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
                    <path
                      className="mp-parcel__line"
                      d={g.d}
                      fill={fill}
                      stroke={isSelected || isHovered ? "var(--ink)" : "var(--plan-cal)"}
                      strokeOpacity={isSelected || isHovered ? 1 : 0.8}
                      strokeWidth={isSelected ? 2 : isHovered ? 1.4 : 0.6}
                      strokeLinejoin="round"
                    />

                    {/* Código del lote, donde el plano rotula su número */}
                    <text
                      x={g.x}
                      y={g.y + g.fs * 0.35}
                      fill={
                        isSelected
                          ? "var(--ink)"
                          : l.estado === "vendido"
                            ? "var(--plan-cal-dim)"
                            : "var(--plan-cal)"
                      }
                      fontSize={g.fs}
                      fontWeight="700"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {l.id}
                    </text>
                  </g>
                );
              })}

              {/* Rótulos de manzanas A–H: acercan el plano a esa manzana */}
              {Object.entries(PLANO.manzanas).map(([mz, b]) => (
                <g
                  key={mz}
                  className="mp-mz-marker"
                  onClick={() => elegirVista(vista === mz ? TODAS : mz)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={b.x}
                    cy={b.y}
                    r="10"
                    fill={vista === mz ? "var(--lime)" : "var(--plan-road)"}
                    stroke="var(--plan-cal)"
                    strokeOpacity="0.7"
                    strokeWidth="1.2"
                  />
                  <text x={b.x} y={b.y + 3.5} fill={vista === mz ? "var(--ink)" : "var(--plan-cal)"} fontSize="10" fontWeight="600" textAnchor="middle">
                    {mz}
                  </text>
                </g>
              ))}

              {/* Norte: el plano está girado para llenar el lienzo; la flecha marca el norte real */}
              <g transform="translate(1118, 46)" pointerEvents="none">
                <circle r="18" fill="var(--plan-road)" stroke="var(--plan-cal)" strokeOpacity="0.6" strokeWidth="1.2" />
                <polygon points="0,-13 4.5,3.5 0,0 -4.5,3.5" fill="var(--lime)" transform={`rotate(${PLANO.norte})`} />
                <text
                  x={27 * Math.sin((PLANO.norte * Math.PI) / 180)}
                  y={-27 * Math.cos((PLANO.norte * Math.PI) / 180) + 3}
                  fill="var(--plan-cal)"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
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
            enPortada ? <Ficha lote={sel} onPedir={(l) => anunciarLote(l.id)} origen={origen} /> : <Ficha lote={sel} showFullLink={false} origen={origen} />
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
                {`Seleccionar lote disponible (${(DESDE ?? DISPONIBLES[0])?.id ?? ""})`}
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
