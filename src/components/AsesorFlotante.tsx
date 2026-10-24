"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PROYECTO } from "@/content/proyecto";
import { irAlFormulario } from "@/lib/formulario";
import { Icon } from "./Icon";

const KEY = "rosso.saludo.v1";

/** Botón flotante de asesor: lleva al formulario de la portada, como «Consultar este lote» del plano (pedido del
 *  cliente, docs/0026); el formulario pide el WhatsApp y el asesor responde por ahí. En escritorio es una
 *  tarjeta "Asesor en línea · ¡Hablemos!" con el círculo de WhatsApp; en el móvil, solo el círculo.
 *  La foto del asesor aparece cuando el cliente entregue una real (PROYECTO.contacto.asesorFoto).
 *  A los pocos segundos muestra un saludo que se puede cerrar y no vuelve en la misma sesión. */
export function AsesorFlotante() {
  const [saludo, setSaludo] = useState(false);
  const foto = PROYECTO.contacto.asesorFoto;

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
        href="#formulario"
        onClick={(e) => {
          cerrar();
          if (irAlFormulario()) e.preventDefault();
        }}
      >
        <span className="asesor__avatar" aria-hidden="true">
          {foto ? <Image src={foto} alt="" width={48} height={48} /> : <Icon name="asesor" size={24} />}
          <i />
        </span>
        <span className="asesor__text">
          <small>Asesor en línea</small>
          <strong>¡Hablemos!</strong>
        </span>
        <span className="asesor__wa" aria-hidden="true"><Icon name="whatsapp" size={26} /></span>
      </a>
    </div>
  );
}
