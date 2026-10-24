"use client";

import Image from "next/image";
import { track } from "@/lib/tracking/client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { DESDE, DISPONIBLES, LOTES, MANZANAS, loteById, m2, resumen, soles, soles0, type Lote } from "@/content/lotes";
import { PLANO_GIRADO, type Caja, type Orientacion } from "@/content/planoGirado";
import { desplazarA, irAlFormulario } from "@/lib/formulario";
import { gsap, useGSAP, useMotion } from "@/lib/motion";
import { Ficha } from "./Ficha";
import { Icon } from "./Icon";

const TODAS = "TODAS";
type Vista = string; // "TODAS" | "A"…"H"
type ColorMode = "estado" | "cuota" | "area";

const CONTEO = resumen();

/** Proporción de cada orientación, para que el recuadro del plano tenga su alto antes de dibujarlo. */
const PROPORCION = {
  "--mp-ar-h": `${PLANO_GIRADO.horizontal.caja[2]} / ${PLANO_GIRADO.horizontal.caja[3]}`,
  "--mp-ar-v": `${PLANO_GIRADO.vertical.caja[2]} / ${PLANO_GIRADO.vertical.caja[3]}`,
} as CSSProperties;

/** En pantallas angostas (celular) el plano va vertical; en el resto, horizontal (docs/0025). El servidor
 *  dibuja el horizontal; el recuadro ya tiene el alto de la orientación correcta por CSS, así que no se mueve. */
const VERTICAL = "(max-width: 699px)";
function useOrientacion(): Orientacion {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(VERTICAL);
      mq.addEventListener("change", avisar);
      return () => mq.removeEventListener("change", avisar);
    },
    () => (window.matchMedia(VERTICAL).matches ? "vertical" : "horizontal"),
    () => "horizontal",
  );
}

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
 * Plano interactivo a todo el ancho + ficha con simulador debajo (docs/0025).
 * - En la portada (sin props) lee y escribe ?vista=&lote= en la URL y avisa al formulario.
 * - En /lote/[id] (`lote` + `onLote`) arranca en ese lote y deja que la página cambie de lote.
 */
export function LotStack({ lote, onLote, origen }: { lote?: Lote; onLote?: (l: Lote) => void; origen?: string } = {}) {
  const enPortada = !onLote;
  const orientacion = useOrientacion();
  const geo = PLANO_GIRADO[orientacion];
  // En /lote/[id] el plano abre completo (el lote va resaltado) para poder tocar cualquier otro.
  const [vista, setVista] = useState<Vista>(TODAS);
  const [colorMode, setColorMode] = useState<ColorMode>("estado");
  const [droneOverlay, setDroneOverlay] = useState(false);
  const [droneOpacity, setDroneOpacity] = useState(55);

  // La ficha muestra desde el inicio un lote (el de la página, el de la URL o el de cuota más baja) para no quedar
  // vacía; el plano lo resalta y sus dos botones se activan solo cuando el visitante elige uno.
  const [sel, setSel] = useState<Lote | null>(() => lote ?? DESDE ?? DISPONIBLES[0] ?? null);
  const [elegido, setElegido] = useState(!!lote);
  const [hovered, setHovered] = useState<Lote | null>(null);
  const [flip, setFlip] = useState(0);
  const ficha = useRef<HTMLElement>(null);

  // Estado de Zoom y Pan sobre el SVG
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0, escala: 1 });

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
      if (l) {
        setSel(l);
        setElegido(true);
      }
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
    setElegido(true);
    setFlip((n) => n + 1);
    if (onLote) onLote(l);
    else anunciarLote(l.id);
    escribirUrl(vista, l);
  };

  // Botones del plano. "Consultar" lleva al formulario de la portada con el lote ya cargado (desde /lote/X, vuelve
  // a la landing de origen con ?lote=); "Ver detalle" baja a la ficha de este lote, debajo del plano.
  const consultar = () => {
    if (!sel) return;
    if (!enPortada) {
      window.location.assign(`${origen === "promocion" ? "/promocion" : "/"}?lote=${sel.id}#formulario`);
      return;
    }
    anunciarLote(sel.id);
    irAlFormulario();
  };
  const verDetalle = () => {
    if (!ficha.current) return;
    desplazarA(ficha.current);
    ficha.current.focus({ preventScroll: true });
  };

  // Cálculo del viewBox activo según Manzana + Zoom + Pan
  const baseVb: Caja = vista === TODAS ? geo.caja : geo.manzanas[vista]?.vista ?? geo.caja;
  const vbW = baseVb[2] / zoom;
  const vbH = baseVb[3] / zoom;
  const vbX = baseVb[0] + (baseVb[2] - vbW) / 2 - pan.x;
  const vbY = baseVb[1] + (baseVb[3] - vbH) / 2 - pan.y;
  // Arrastre: hasta un tercio del lienzo hacia cada lado.
  const panMax = { x: geo.caja[2] / 3, y: geo.caja[3] / 3 };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    // Unidades del plano por píxel en pantalla (el SVG encaja el viewBox entero, sin recortar).
    const r = e.currentTarget.getBoundingClientRect();
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y, escala: Math.max(vbW / r.width, vbH / r.height) };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const { escala } = dragStart.current;
    setPan({
      x: Math.max(-panMax.x, Math.min(panMax.x, dragStart.current.panX + (e.clientX - dragStart.current.x) * escala)),
      y: Math.max(-panMax.y, Math.min(panMax.y, dragStart.current.panY + (e.clientY - dragStart.current.y) * escala)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="lots" ref={shell}>
      <div className="mp-canvas-card">
        {/* Sub-barra de herramientas del plano vectorial */}
        <div className="mp-canvas-bar">
          <div className="mp-colormodes" role="group" aria-label="Colorear lotes por">
            <span className="mp-colormodes__label">Colorear por</span>
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
        <div className="mp-viewport" style={PROPORCION}>
          {droneOverlay ? (
            <div className="mp-drone-layer" style={{ opacity: droneOpacity / 100 }}>
              <Image
                src="/media/hero.webp"
                alt="Fotografía aérea de drone de los lotes trazados con cal en La Campiña"
                fill
                sizes="100vw"
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
              x={geo.caja[0] - geo.caja[2]}
              y={geo.caja[1] - geo.caja[3]}
              width={geo.caja[2] * 3}
              height={geo.caja[3] * 3}
              fill={droneOverlay ? "var(--plan-ground-veil)" : "var(--plan-ground)"}
            />

            {/* Vía a San Nicolás, por el frente del terreno */}
            <g className="mp-highway" pointerEvents="none">
              <path d={geo.via} fill="var(--plan-road)" />
              {geo.viaRotulos.map((r, i) => (
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
              d={geo.terreno}
              fill="var(--plan-street)"
              stroke="var(--plan-cal)"
              strokeOpacity="0.55"
              strokeWidth="1.2"
              strokeDasharray="6 4"
            />

            {/* Áreas comunes del plano: bermas con palmeras, 4 parques y reservorio */}
            <g className="mp-park" pointerEvents="none">
              {geo.bermas.map((d, i) => (
                <path key={i} d={d} fill="var(--plan-park)" />
              ))}
              {geo.parques.map((d, i) => (
                <path key={i} d={d} fill="var(--plan-park)" stroke="var(--plan-cal)" strokeOpacity="0.5" strokeWidth="0.8" />
              ))}
              <path d={geo.reservorio.d} fill="var(--plan-road)" stroke="var(--plan-cal)" strokeOpacity="0.5" strokeWidth="0.8" />
              <text x={geo.reservorio.x} y={geo.reservorio.y} fill="var(--plan-cal)" fillOpacity="0.8" fontSize="6.5" textAnchor="middle">
                Reservorio
              </text>
              {geo.amenidades.map((a) => (
                <text key={`${a.texto}-${a.x}`} x={a.x} y={a.y} fill="var(--plan-cal)" fillOpacity="0.85" fontSize="4.2" textAnchor="middle">
                  {a.texto}
                </text>
              ))}
              {geo.calles.map((c) => (
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
              <circle cx={geo.portico.x} cy={geo.portico.y} r="4" fill="var(--lime)" />
              <text x={geo.portico.x} y={geo.portico.y - 7} fill="var(--plan-cal)" fontSize="7.5" fontWeight="600" textAnchor="middle">
                Pórtico de ingreso
              </text>
            </g>

            {/* Renderizado de los 132 lotes con su forma real (PLANO.lotes, girado en planoGirado.ts) */}
            {LOTES.map((l) => {
              const g = geo.lotes[l.id];
              if (!g) return null;
              const isSelected = elegido && sel?.id === l.id;
              const isHovered = hovered?.id === l.id;
              // Con una manzana elegida, el resto del plano queda atenuado.
              const dimmed = vista !== TODAS && l.manzana !== vista;
              const fill = getLotFill(l, colorMode, isSelected, isHovered, dimmed);
              const conM2 = g.ancho >= 30;
              const tinta = isSelected ? "var(--ink)" : l.estado === "vendido" ? "var(--plan-cal-dim)" : "var(--plan-cal)";

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
                  {/* Promoción al contado */}
                  {l.precio?.promoContado && !dimmed ? (
                    <circle cx={g.x + g.fs * 1.5} cy={g.y - g.fs * 0.9} r={2.6} fill="var(--plan-promo)" />
                  ) : null}

                  {/* Código del lote, donde el plano rotula su número */}
                  <text
                    x={g.x}
                    y={g.y + (conM2 ? -g.fs * 0.15 : g.fs * 0.35)}
                    fill={tinta}
                    fontSize={g.fs}
                    fontWeight="600"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {l.id}
                  </text>

                  {/* Superficie en los lotes con espacio para rotularla */}
                  {conM2 ? (
                    <text x={g.x} y={g.y + g.fs * 0.95} fill={tinta} fontSize="6.2" fontWeight="600" textAnchor="middle" pointerEvents="none">
                      {l.m2}m²
                    </text>
                  ) : null}
                </g>
              );
            })}

            {/* Rótulos de manzanas A–H: acercan el plano a esa manzana */}
            {Object.entries(geo.manzanas).map(([mz, b]) => (
              <g key={mz} className="mp-mz-marker" onClick={() => elegirVista(vista === mz ? TODAS : mz)} style={{ cursor: "pointer" }}>
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

            {/* Norte: el plano está girado para la pantalla; la flecha marca el norte real */}
            <g transform={`translate(${geo.rosa.x}, ${geo.rosa.y})`} pointerEvents="none">
              <circle r="18" fill="var(--plan-road)" stroke="var(--plan-cal)" strokeOpacity="0.6" strokeWidth="1.2" />
              <polygon points="0,-13 4.5,3.5 0,0 -4.5,3.5" fill="var(--lime)" transform={`rotate(${geo.norte})`} />
              <text
                x={27 * Math.sin((geo.norte * Math.PI) / 180)}
                y={-27 * Math.cos((geo.norte * Math.PI) / 180) + 3}
                fill="var(--plan-cal)"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
              >
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
                Manzana {hovered.manzana}, <b>{m2(hovered.m2)}</b>
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

        {/* Pie del plano: a la izquierda la leyenda; a la derecha, en la esquina inferior, los dos botones del lote elegido.
            Van fuera del dibujo para no tapar ningún lote en ningún ancho (docs/0025); en el celular, los botones primero. */}
        <div className="mp-foot">
          {/* Se activan cuando el visitante elige un lote. */}
          <div className="mp-acciones" role="group" aria-label="Acciones del lote elegido">
            <p className="mp-acciones__lote" aria-live="polite">
              {elegido && sel ? (
                <>
                  Lote <strong>{sel.id}</strong> · {m2(sel.m2)}
                </>
              ) : (
                "Toca un lote del plano para consultarlo"
              )}
            </p>
            <button
              type="button"
              className="btn btn--lime mp-acciones__btn"
              disabled={!elegido}
              data-track="map-form"
              data-lot={elegido ? sel?.id : undefined}
              onClick={consultar}
            >
              <Icon name="whatsapp" size={18} />
              Consultar este lote por WhatsApp
            </button>
            <button
              type="button"
              className="btn btn--outline mp-acciones__btn"
              disabled={!elegido}
              data-track="map-detail"
              data-lot={elegido ? sel?.id : undefined}
              onClick={verDetalle}
            >
              <Icon name="plano" size={18} />
              Ver detalle de este lote
            </button>
          </div>

          {/* Leyenda interactiva inferior */}
          <div className="mp-legend">
            <div className="mp-legend__items">
              <span>
                <i className="mp-dot mp-dot--free" /> Disponible ({CONTEO.disponibles})
              </span>
              <span>
                <i className="mp-dot mp-dot--promo" /> Promoción al contado
              </span>
              <span>
                <i className="mp-dot mp-dot--reserved" /> Reservado ({CONTEO.reservados})
              </span>
              <span>
                <i className="mp-dot mp-dot--sold" /> Vendido ({CONTEO.vendidos})
              </span>
              <span>
                <i className="mp-dot mp-dot--selected" /> Tu lote ({elegido && sel ? sel.id : "elige uno"})
              </span>
            </div>
            <p className="mp-legend__hint">
              Toca cualquier lote para ver su precio y simular la cuota, o elige una manzana para acercarte.
            </p>
          </div>
        </div>
      </div>

      {/* Ficha técnica y simulador del lote, debajo del plano: "Ver detalle de este lote" baja hasta aquí */}
      <aside id="ficha-lote" ref={ficha} tabIndex={-1} className="ficha panel" aria-live="polite" aria-label="Ficha del lote">
        {/* Hasta que el visitante elige, la ficha muestra el lote de cuota más baja y lo dice. */}
        {sel && !elegido ? (
          <div className="band ficha__band">
            <h3>El lote con la cuota más baja</h3>
            <p>Toca cualquier lote del plano para ver el tuyo.</p>
          </div>
        ) : null}
        {sel ? null : (
          <div className="band ficha__band">
            <h3>Elige un lote en el plano</h3>
          </div>
        )}
        <div key={flip}>
          {sel ? (
            enPortada ? <Ficha lote={sel} onPedir={(l) => anunciarLote(l.id)} origen={origen} /> : <Ficha lote={sel} origen={origen} />
          ) : (
            <div className="ficha__empty">
              <Icon name="plano" size={40} />
              <p>Toca cualquier lote del plano para ver su precio y simular su cuota.</p>
              <button
                type="button"
                className="btn btn--small"
                onClick={() => {
                  const eco = DESDE ?? DISPONIBLES[0];
                  if (eco) elegirLote(eco);
                }}
              >
                {`Ver el lote con la cuota más baja (${DESDE.id})`}
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
