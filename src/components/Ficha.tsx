"use client";

import { useEffect, useState } from "react";
import { CUOTAS, LISTA_FECHA, m2, soles, soles0, type Lote } from "@/content/lotes";
import { PROYECTO, whatsappHref } from "@/content/proyecto";
import { Icon } from "./Icon";

export function mensajeLote(l: Lote, inicialCustom?: number, plazoCustom?: number) {
  if (l.precio && inicialCustom && plazoCustom) {
    const cuotaCalc = (l.precio.financiado - inicialCustom) / plazoCustom;
    return `Hola, me interesa el lote ${l.id} de ${PROYECTO.nombre} (${m2(l.m2)}). Vi la simulación con inicial de ${soles0(inicialCustom)} y ${plazoCustom} cuotas de ${soles(cuotaCalc)}. ¿Me brindan información?`;
  }
  return `Hola, me interesa el lote ${l.id} de ${PROYECTO.nombre} (${m2(l.m2)}). ¿Me pueden dar más información?`;
}

const PLAZOS = [12, 24, 36, 48] as const;

/** Ficha técnica ejecutiva + Simulador financiero en tiempo real (0% interés). */
export function Ficha({
  lote,
  onPedir,
  showFullLink = true,
}: {
  lote: Lote;
  onPedir?: (l: Lote) => void;
  showFullLink?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);
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
  const wa = whatsappHref(mensajeLote(lote, inicial, plazo));

  const compartir = async () => {
    const url = `${window.location.origin}/lote/${lote.id}`;
    const data = { title: `Lote ${lote.id} · ${PROYECTO.nombre}`, text: mensajeLote(lote), url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* usuario cerró el diálogo */
      }
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2400);
  };

  return (
    <div className="ficha__body">
      {/* Encabezado de la unidad */}
      <div className="ficha__header">
        <div className="ficha__id-group">
          <span className="ficha__badge-mz">Manzana {lote.manzana}</span>
          <div className="ficha__title-row">
            <b className="ficha__code">Lote {lote.id}</b>
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
            Superficie total de <strong>{m2(lote.m2)}</strong> ·{" "}
            {lote.m2 >= 1000
              ? "Macrolote Esquinero / Cabecera"
              : lote.manzana === "E"
                ? "Ubicación Frente a Gran Parque"
                : "Lote Residencial Campestre"}
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
          <div className="ficha__mode-tabs" role="tablist" aria-label="Modalidad de compra">
            <button
              type="button"
              role="tab"
              aria-selected={modoPago === "financiado"}
              className={`ficha__mode-tab ${modoPago === "financiado" ? "is-active" : ""}`}
              onClick={() => setModoPago("financiado")}
            >
              <span>Financiado 0% Interés</span>
              <small>{soles(cuotaSimulada)} / mes</small>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modoPago === "contado"}
              className={`ficha__mode-tab ${modoPago === "contado" ? "is-active" : ""}`}
              onClick={() => setModoPago("contado")}
            >
              <span>Al Contado {p.promoContado ? "· Promo" : "-15%"}</span>
              <small>{soles0(p.promoContado ?? p.contado)}</small>
            </button>
          </div>

          {modoPago === "financiado" ? (
            <div className="ficha__sim">
              <div className="ficha__kpi-highlight">
                <div>
                  <span className="ficha__kpi-label">Cuota mensual estimada ({plazo} meses)</span>
                  <div className="ficha__kpi-value">{soles(cuotaSimulada)}</div>
                  <span className="ficha__kpi-sub">Crédito directo a sola firma · 0% interés bancario</span>
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
                    <Icon name="calculator" size={16} /> Tu cuota inicial
                  </label>
                  <output htmlFor={`slider-ini-${lote.id}`} className="ficha__calc-out">
                    {soles0(inicial)}
                    {inicial === p.inicial ? <small> (Mínima)</small> : null}
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
                  className="ficha__slider"
                />
                <div className="ficha__slider-limits">
                  <span>Mín: {soles0(minInicial)}</span>
                  <span>Saldo a financiar: {soles0(p.financiado - inicial)}</span>
                </div>

                <div className="ficha__plazos">
                  <span className="ficha__plazos-label">Plazo en meses (0% interés):</span>
                  <div className="ficha__plazos-grid">
                    {PLAZOS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`ficha__plazo-btn ${plazo === m ? "is-active" : ""}`}
                        onClick={() => setPlazo(m)}
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
                  <span className="ficha__kpi-label">
                    {p.promoContado ? "Precio Promocional al Contado" : "Precio al Contado (-15% dto.)"}
                  </span>
                  <div className="ficha__kpi-value">{soles(p.promoContado ?? p.contado)}</div>
                  {p.promoContado ? (
                    <span className="ficha__kpi-sub">
                      Precio contado regular: <s>{soles(p.contado)}</s> · Financiado: <s>{soles(p.financiado)}</s>
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
                <dt className="label">Bono Promo Contado</dt>
                <dd className="ficha__promo-val">{soles(p.promoContado)}</dd>
              </>
            ) : null}
            <dt className="label">Título & Entrega</dt>
            <dd>
              {PROYECTO.titulo} · {PROYECTO.entrega}
            </dd>
          </dl>

          <div className="ficha__actions">
            {wa ? (
              <a className="btn btn--primary ficha__cta-main" href={wa} target="_blank" rel="noopener">
                <Icon name="chat" size={20} />
                Solicitar Lote {lote.id} por WhatsApp
              </a>
            ) : (
              <a
                className="btn btn--primary ficha__cta-main"
                href={onPedir ? "#contacto" : `/?vista=${lote.manzana}&lote=${lote.id}#contacto`}
                onClick={() => onPedir?.(lote)}
              >
                <Icon name="chat" size={20} />
                Separar / Cotizar Lote {lote.id}
              </a>
            )}
            <div className="ficha__secondary-actions">
              <button type="button" className="btn btn--small" onClick={compartir}>
                <Icon name="compartir" size={17} />
                {copiado ? "¡Enlace copiado!" : "Compartir ficha"}
              </button>
              {showFullLink ? (
                <a className="btn btn--small" href={`/lote/${lote.id}`}>
                  <Icon name="plano" size={17} />
                  Abrir expediente
                </a>
              ) : null}
            </div>
          </div>

          <p className="note">
            Valores oficiales según lista vigente al {LISTA_FECHA}. Sujeto a disponibilidad en tiempo real al momento de
            la separación.
          </p>
        </>
      ) : (
        <div className="ficha__unavailable">
          <div className="ficha__unavailable-badge">
            {lote.estado === "vendido" ? "UNIDAD ADQUIRIDA" : "UNIDAD CON RESERVA ACTIVA"}
          </div>
          <p>
            {lote.estado === "vendido"
              ? `El lote ${lote.id} (${m2(lote.m2)}) en la Manzana ${lote.manzana} ya tiene propietario. Selecciona un lote en color verde dentro del Masterplan para cotizar unidades disponibles similares.`
              : `El lote ${lote.id} (${m2(lote.m2)}) se encuentra actualmente reservado. Puedes dejar tus datos con un asesor por si se libera o para elegir un lote colindante en la Manzana ${lote.manzana}.`}
          </p>
          <a
            className="btn btn--primary"
            href="#contacto"
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
