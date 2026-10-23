"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/tracking/client";
import { CUOTAS, LISTA_FECHA, m2, soles, soles0, type Lote } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Icon } from "./Icon";

const PLAZOS = [12, 24, 36, 48] as const;

/** Ficha técnica ejecutiva + Simulador financiero en tiempo real (0% interés).
 *  Toda consulta lleva al formulario de la portada (#formulario) con el lote ya elegido. */
export function Ficha({
  lote,
  onPedir,
  showFullLink = true,
}: {
  lote: Lote;
  onPedir?: (l: Lote) => void;
  showFullLink?: boolean;
}) {
  const [modoPago, setModoPago] = useState<"financiado" | "contado">("financiado");
  const p = lote.precio;

  const minInicial = p ? p.inicial : 3000;
  const maxInicial = p ? Math.max(minInicial + 1000, Math.round((p.financiado * 0.7) / 500) * 500) : 15000;

  const [inicial, setInicial] = useState<number>(minInicial);
  const [plazo, setPlazo] = useState<number>(CUOTAS);

  useEffect(() => {
    if (lote.precio) {
      setInicial(lote.precio.inicial);
      setPlazo(CUOTAS);
    }
  }, [lote.id, lote.precio]);

  const cuotaSimulada = p ? Math.max(0, (p.financiado - inicial) / plazo) : 0;
  const ahorroContado = p ? p.financiado - (p.promoContado ?? p.contado) : 0;
  // En la portada el formulario está en la misma página; desde /lote/[id] se vuelve a ella con el lote.
  const alFormulario = onPedir ? "#formulario" : `/?lote=${lote.id}#formulario`;

  return (
    <div className="ficha__body">
      {/* Encabezado de la unidad */}
      <div className="ficha__header">
        <div className="ficha__id-group">
          <span className="ficha__badge-mz">Manzana {lote.manzana}</span>
          <div className="ficha__title-row">
            <h3 className="ficha__code">Lote {lote.id}</h3>
            <span className={`ficha__status ficha__status--${lote.estado}`}>
              <i />
              {lote.estado === "disponible"
                ? "Disponible"
                : lote.estado === "reservado"
                  ? "Reservado"
                  : "Vendido"}
            </span>
          </div>
          <p className="ficha__subtitle">
            Superficie total de <strong>{m2(lote.m2)}</strong>.{" "}
            {lote.m2 >= 1000
              ? "Lote de mayor superficie"
              : lote.manzana === "E"
                ? "Consulta su ubicación en el plano oficial"
                : "Club Privado La Campiña"}
          </p>
        </div>
        <div className="ficha__area-pill">
          <small>Área</small>
          <strong>{m2(lote.m2)}</strong>
        </div>
      </div>

      {p ? (
        <>
          {/* Selector de modalidad: Financiado 0% vs Contado con Descuento */}
          <div className="ficha__mode-tabs" role="group" aria-label="Modalidad de compra">
            <button
              type="button"
              aria-pressed={modoPago === "financiado"}
              className={`ficha__mode-tab ${modoPago === "financiado" ? "is-active" : ""}`}
              onClick={() => setModoPago("financiado")}
            >
              <span>Financiado sin intereses</span>
              <small>{soles(cuotaSimulada)} / mes</small>
            </button>
            <button
              type="button"
              aria-pressed={modoPago === "contado"}
              className={`ficha__mode-tab ${modoPago === "contado" ? "is-active" : ""}`}
              onClick={() => setModoPago("contado")}
            >
              <span>Al contado{p.promoContado ? " con promoción" : ""}</span>
              <small>{soles0(p.promoContado ?? p.contado)}</small>
            </button>
          </div>

          {modoPago === "financiado" ? (
            <div className="ficha__sim">
              <div className="ficha__kpi-highlight">
                <div>
                  <div className="ficha__kpi-value">{soles(cuotaSimulada)}</div>
                  <span className="ficha__kpi-sub">al mes durante {plazo} meses. Simulación referencial con financiamiento directo sin intereses.</span>
                </div>
                <div className="ficha__kpi-tag">
                  <span>Precio lista</span>
                  <strong>{soles0(p.financiado)}</strong>
                  <small>{soles(p.porM2)} / m²</small>
                </div>
              </div>

              {/* Simulador interactivo de Inicial y Plazo */}
              <div className="ficha__calc">
                <div className="ficha__calc-head">
                  <label htmlFor={`slider-ini-${lote.id}`}>
                    Tu cuota inicial
                  </label>
                  <output htmlFor={`slider-ini-${lote.id}`} className="ficha__calc-out">
                    {soles0(inicial)}
                    {inicial === p.inicial ? <small> (mínima)</small> : null}
                  </output>
                </div>
                <input
                  id={`slider-ini-${lote.id}`}
                  type="range"
                  min={minInicial}
                  max={maxInicial}
                  step={500}
                  value={inicial}
                  onChange={(e) => setInicial(Number(e.target.value))}
                  onPointerUp={() => track("simulator_change", { lot: lote.id, initial: inicial, months: plazo, mode: modoPago })}
                  onKeyUp={() => track("simulator_change", { lot: lote.id, initial: inicial, months: plazo, mode: modoPago })}
                  className="ficha__slider"
                />
                <div className="ficha__slider-limits">
                  <span>Mínimo {soles0(minInicial)}</span>
                  <span>Saldo a financiar: {soles0(p.financiado - inicial)}</span>
                </div>

                <div className="ficha__plazos">
                  <span className="ficha__plazos-label">Plazo, sin intereses</span>
                  <div className="ficha__plazos-grid">
                    {PLAZOS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`ficha__plazo-btn ${plazo === m ? "is-active" : ""}`}
                        aria-pressed={plazo === m}
                        onClick={() => { setPlazo(m); track("simulator_change", { lot: lote.id, initial: inicial, months: m, mode: modoPago }); }}
                      >
                        {m} cuotas
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="ficha__contado-box">
              <div className="ficha__kpi-highlight ficha__kpi-highlight--gold">
                <div>
                  <div className="ficha__kpi-value">{soles(p.promoContado ?? p.contado)}</div>
                  <span className="ficha__kpi-sub">{p.promoContado ? "Precio de promoción al contado." : "Precio al contado."}</span>
                  {p.promoContado ? (
                    <span className="ficha__kpi-sub">
                      Precio contado regular: <s>{soles(p.contado)}</s>; financiado: <s>{soles(p.financiado)}</s>
                    </span>
                  ) : (
                    <span className="ficha__kpi-sub">
                      Precio financiado regular: <s>{soles(p.financiado)}</s>
                    </span>
                  )}
                </div>
                <div className="ficha__savings-badge">
                  <span>Ahorras</span>
                  <strong>{soles0(ahorroContado)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Resumen tabular completo */}
          <dl className="fields fields--ficha">
            <dt className="label">Valor por m²</dt>
            <dd>{soles(p.porM2)} / m²</dd>
            <dt className="label">Precio financiado</dt>
            <dd>{soles(p.financiado)}</dd>
            <dt className="label">Inicial mínima</dt>
            <dd>{soles(p.inicial)}</dd>
            <dt className="label">Cuota en {CUOTAS} meses</dt>
            <dd className="big">{soles(p.cuota)}</dd>
            <dt className="label">Precio al contado</dt>
            <dd>{soles(p.contado)}</dd>
            {p.promoContado ? (
              <>
                <dt className="label">Promoción al contado</dt>
                <dd className="ficha__promo-val">{soles(p.promoContado)}</dd>
              </>
            ) : null}
            <dt className="label">Título y entrega</dt>
            <dd>
              {PROYECTO.titulo}, entrega en {PROYECTO.entrega}
            </dd>
          </dl>

          <div className="ficha__actions">
            <a
              className="btn btn--primary ficha__cta-main"
              data-track="lot-contact" data-lot={lote.id}
              href={alFormulario}
              onClick={() => onPedir?.(lote)}
            >
              <Icon name="chat" size={20} />
              Consultar el lote {lote.id}
            </a>
            {showFullLink ? (
              <a className="btn ficha__detail" href={`/lote/${lote.id}`}>
                <Icon name="plano" size={20} />
                Ver detalle
                <Icon name="der" size={18} />
              </a>
            ) : null}
          </div>

          <p className="note">
            Valores de referencia de la lista del {LISTA_FECHA}. Confirma la vigencia de precios, estado del lote,
            documentación y condiciones antes de separar.
          </p>
        </>
      ) : (
        <div className="ficha__unavailable">
          <div className="ficha__unavailable-badge">
            {lote.estado === "vendido" ? "Vendido" : "Reservado"}
          </div>
          <p>
            {lote.estado === "vendido"
              ? `El lote ${lote.id} (${m2(lote.m2)}) en la Manzana ${lote.manzana} figura como vendido en la lista de referencia. Elige en el plano un lote disponible para ver su precio.`
              : `El lote ${lote.id} (${m2(lote.m2)}) figura como reservado en la lista de referencia. Puedes dejar tus datos con un asesor por si se libera o para elegir un lote colindante en la Manzana ${lote.manzana}.`}
          </p>
          <a
            className="btn btn--primary"
            data-track="lot-contact" data-lot={lote.id}
            href={alFormulario}
            onClick={() => onPedir?.(lote)}
          >
            <Icon name="chat" size={18} />
            Consultar lotes similares a {lote.id}
          </a>
        </div>
      )}
    </div>
  );
}
