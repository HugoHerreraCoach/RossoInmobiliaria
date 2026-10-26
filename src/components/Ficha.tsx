"use client";

import { CUOTAS, type Lote } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Icon } from "./Icon";

/** Ficha simplificada: muestra el lote seleccionado, su estado (disponible/reservado/vendido)
 *  y lleva directo al formulario (#formulario) para que un asesor brinde precios y metraje. */
export function Ficha({
  lote,
  onPedir,
  origen,
}: {
  lote: Lote;
  onPedir?: (l: Lote) => void;
  showFullLink?: boolean;
  origen?: string;
}) {
  const esLima = origen === "promocion";
  const base = esLima ? "/promocion" : "/";
  const alFormulario = onPedir ? "#formulario" : `${base}?lote=${lote.id}#formulario`;
  const disponible = lote.estado === "disponible";

  return (
    <div className="ficha__body">
      <div className="ficha__header">
        <div className="ficha__id-group">
          <span className="ficha__badge-mz">Manzana {lote.manzana}</span>
          <div className="ficha__title-row">
            <h3 className="ficha__code">Lote {lote.id}</h3>
            <span className={`ficha__status ficha__status--${lote.estado}`}>
              <i />
              {disponible ? "Disponible" : lote.estado === "reservado" ? "Reservado" : "Vendido"}
            </span>
          </div>
          <p className="ficha__subtitle">
            {disponible
              ? "Ubicación disponible dentro del Club Privado La Campiña."
              : lote.estado === "reservado"
                ? "Este lote se encuentra reservado temporalmente."
                : "Este lote ya fue adquirido."}
          </p>
        </div>
      </div>

      {disponible ? (
        <>
          <ul className="checks">
            <li>
              <Icon name="check" size={18} />
              <span>Financiamiento directo hasta en {CUOTAS} cuotas sin intereses.</span>
            </li>
            <li>
              <Icon name="check" size={18} />
              <span>Descuento especial por pago al contado.</span>
            </li>
            <li>
              <Icon name="check" size={18} />
              <span>
                {esLima
                  ? `Agenda una videollamada con un asesor de ${PROYECTO.empresa} para conocer el proyecto y cotizar este lote.`
                  : `Un asesor de ${PROYECTO.empresa} te enviará el metraje exacto y la cotización por WhatsApp.`}
              </span>
            </li>
          </ul>

          <div className="ficha__actions">
            <a
              className="btn btn--primary ficha__cta-main"
              data-track="lot-contact"
              data-lot={lote.id}
              href={alFormulario}
              onClick={() => onPedir?.(lote)}
            >
              <Icon name="chat" size={20} />
              {esLima ? `Agendar videollamada por el lote ${lote.id}` : `Consultar el lote ${lote.id} con un asesor`}
            </a>
          </div>
        </>
      ) : (
        <div className="ficha__unavailable">
          <p>
            {lote.estado === "vendido"
              ? `El lote ${lote.id} en la Manzana ${lote.manzana} ya no está disponible. Elige otro lote en verde en el plano o consulta con un asesor las mejores ubicaciones libres.`
              : `El lote ${lote.id} figura como reservado. Puedes consultar con un asesor por si se libera o para ver lotes disponibles en la Manzana ${lote.manzana}.`}
          </p>
          <a
            className="btn btn--primary ficha__cta-main"
            data-track="lot-contact"
            data-lot={lote.id}
            href={alFormulario}
            onClick={() => onPedir?.(lote)}
          >
            <Icon name="chat" size={18} />
            {esLima ? "Agendar videollamada y ver lotes disponibles" : "Consultar lotes disponibles"}
          </a>
        </div>
      )}
    </div>
  );
}

