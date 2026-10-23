"use client";

import { useEffect, useState } from "react";
import { whatsappHref } from "@/content/proyecto";
import { Icon } from "./Icon";

const KEY = "rosso.saludo.v1";

/** Botón flotante de asesor: WhatsApp si hay número; si no, el formulario de la portada.
 *  A los pocos segundos muestra un saludo que se puede cerrar y no vuelve en la misma sesión. */
export function AsesorFlotante() {
  const [saludo, setSaludo] = useState(false);
  const wa = whatsappHref("Hola, quiero información de los lotes de La Campiña.");

  useEffect(() => {
    let visto = false;
    try { visto = sessionStorage.getItem(KEY) === "1"; } catch {}
    if (visto) return;
    const t = setTimeout(() => setSaludo(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const cerrar = () => {
    setSaludo(false);
    try { sessionStorage.setItem(KEY, "1"); } catch {}
  };

  return (
    <div className="asesor">
      {saludo ? (
        <div className="asesor__saludo" role="status">
          <span>¿Quieres el plano y los precios de los lotes?</span>
          <button type="button" onClick={cerrar} aria-label="Cerrar el saludo">
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}
      <a
        className="asesor__btn"
        data-track="float-contact"
        href={wa ?? "#formulario"}
        {...(wa ? { target: "_blank", rel: "noopener" } : {})}
        onClick={cerrar}
      >
        <span className="asesor__icon" aria-hidden="true"><Icon name="chat" size={22} /></span>
        <span className="asesor__text">
          <small><i aria-hidden="true" /> Asesor en línea</small>
          <strong>¡Hablemos!</strong>
        </span>
      </a>
    </div>
  );
}
