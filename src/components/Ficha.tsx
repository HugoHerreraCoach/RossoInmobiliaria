"use client";

import { useState } from "react";
import { CUOTAS, LISTA_FECHA, m2, soles, type Lote } from "@/content/lotes";
import { PROYECTO, whatsappHref } from "@/content/proyecto";
import { Icon } from "./Icon";

export function mensajeLote(l: Lote) {
  return `Hola, me interesa el lote ${l.id} de ${PROYECTO.nombre} (${m2(l.m2)}). ¿Me pueden dar más información?`;
}

/** Ficha técnica de un lote: lo que iría en la planilla del asesor. */
export function Ficha({ lote, onPedir }: { lote: Lote; onPedir?: (l: Lote) => void }) {
  const [copiado, setCopiado] = useState(false);
  const p = lote.precio;
  const wa = whatsappHref(mensajeLote(lote));

  const compartir = async () => {
    const url = `${window.location.origin}/lote/${lote.id}`;
    const data = { title: `Lote ${lote.id} · ${PROYECTO.nombre}`, text: mensajeLote(lote), url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* el visitante cerró el menú de compartir */
      }
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2400);
  };

  return (
    <div className="ficha__body">
      <div className="ficha__id">
        <b>{lote.id}</b>
        <span>
          Manzana {lote.manzana} · {m2(lote.m2)}
        </span>
      </div>

      {p ? (
        <>
          <dl className="fields fields--ficha">
            <dt className="label">Precio por m²</dt>
            <dd>{soles(p.porM2)}</dd>
            <dt className="label">Precio financiado</dt>
            <dd>{soles(p.financiado)}</dd>
            <dt className="label">Inicial</dt>
            <dd>{soles(p.inicial)}</dd>
            <dt className="label">{CUOTAS} cuotas sin intereses</dt>
            <dd className="big">{soles(p.cuota)}</dd>
            <dt className="label">Al contado</dt>
            <dd>{soles(p.contado)}</dd>
            {p.promoContado ? (
              <>
                <dt className="label">Promoción al contado</dt>
                <dd>{soles(p.promoContado)}</dd>
              </>
            ) : null}
          </dl>
          <div className="ficha__actions">
            {wa ? (
              <a className="btn btn--primary" href={wa} target="_blank" rel="noopener">
                <Icon name="chat" />
                Pedir este lote por WhatsApp
              </a>
            ) : (
              <a
                className="btn btn--primary"
                href={onPedir ? "#contacto" : `/?vista=${lote.manzana}&lote=${lote.id}#contacto`}
                onClick={() => onPedir?.(lote)}
              >
                <Icon name="chat" />
                Pedir este lote a un asesor
              </a>
            )}
            <button type="button" className="btn" onClick={compartir}>
              <Icon name="compartir" />
              {copiado ? "Enlace copiado" : "Compartir esta ficha"}
            </button>
          </div>
          <p className="note">
            Precios de la lista vigente al {LISTA_FECHA}. Confirma la disponibilidad con tu asesor antes de separar.
          </p>
        </>
      ) : (
        <p>
          {lote.estado === "vendido"
            ? "Este lote ya fue vendido."
            : "Este lote está reservado. Consulta con un asesor si se libera."}
        </p>
      )}
    </div>
  );
}
