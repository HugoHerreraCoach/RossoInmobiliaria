"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { LandingId } from "@/content/landings";
import { CUOTAS, DESDE_CONTADO, DISPONIBLES, soles0 } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { ContactForm } from "./ContactForm";
import { Icon } from "./Icon";

const KEY = "rosso.saludo.v1";
const INICIAL_MIN = Math.min(...DISPONIBLES.map((l) => l.precio!.inicial));

/** Botón flotante del asesor, como el chat flotante de DLC (pedido del cliente, docs/0029): abre su propio
 *  formulario, con las mismas preguntas del formulario principal de la landing (Lambayeque o Lima). Registra el lead
 *  con su propio ORIGEN en la hoja, envía el evento de la landing y abre WhatsApp con el mensaje del registro.
 *  En escritorio el botón es una tarjeta "Asesor en línea · ¡Hablemos!" con el círculo de WhatsApp; en el móvil,
 *  solo el círculo. La foto del asesor aparece cuando el cliente entregue una real (PROYECTO.contacto.asesorFoto).
 *  A los pocos segundos muestra un saludo que se puede cerrar y no vuelve en la misma sesión. */
export function AsesorFlotante({ landing = "lambayeque" }: { landing?: LandingId }) {
  const [saludo, setSaludo] = useState(false);
  const [abierto, setAbierto] = useState(false);
  // El chat se monta al abrirlo por primera vez y luego solo se oculta: cerrarlo no borra lo que se escribió.
  const [montado, setMontado] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const foto = PROYECTO.contacto.asesorFoto;

  useEffect(() => {
    let visto = false;
    try { visto = sessionStorage.getItem(KEY) === "1"; } catch {}
    if (visto) return;
    const t = setTimeout(() => setSaludo(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Escape cierra el chat y devuelve el foco al botón.
  useEffect(() => {
    if (!abierto) return;
    panel.current?.focus({ preventScroll: true });
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") cerrarChat(); };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const cerrarSaludo = () => {
    setSaludo(false);
    try { sessionStorage.setItem(KEY, "1"); } catch {}
  };
  const cerrarChat = () => {
    setAbierto(false);
    boton.current?.focus({ preventScroll: true });
  };
  const alternar = () => {
    cerrarSaludo();
    setMontado(true);
    setAbierto((a) => !a);
  };

  const avatar = (
    <span className="asesor__avatar" aria-hidden="true">
      {foto ? <Image src={foto} alt="" width={48} height={48} /> : <Icon name="asesor" size={24} />}
      <i />
    </span>
  );

  return (
    <div className="asesor">
      {montado ? (
        <div className="asesor-chat" id="asesor-chat" role="dialog" aria-labelledby="asesor-chat-titulo" ref={panel} tabIndex={-1} hidden={!abierto}>
          <div className="asesor-chat__head">
            {avatar}
            <div className="asesor-chat__who">
              <strong id="asesor-chat-titulo">Asesor de {PROYECTO.empresa}</strong>
              <small><i aria-hidden="true" /> En línea · {PROYECTO.nombre}</small>
            </div>
            <button type="button" className="asesor-chat__cerrar" onClick={cerrarChat} aria-label="Cerrar el chat">
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="asesor-chat__body">
            <div className="asesor-chat__msg">
              <p>¡Hola! 👋 Soy tu asesor de <strong>{PROYECTO.empresa}</strong>.</p>
              <p>
                Estamos en preventa de lotes campestres en el {PROYECTO.valle}: al contado desde{" "}
                <strong>{soles0(DESDE_CONTADO)}</strong> o con inicial desde <strong>{soles0(INICIAL_MIN)}</strong> y {CUOTAS} cuotas
                sin intereses. ¿Cómo te podemos ayudar hoy?
              </p>
            </div>
            <p className="asesor-chat__intro">Déjanos tus datos y un asesor te escribirá por WhatsApp:</p>
            <ContactForm idPrefix="chat" landing={landing} variante="chat" />
          </div>
        </div>
      ) : null}

      {saludo && !abierto ? (
        <div className="asesor__saludo" role="status">
          <span>¿Quieres el plano y los precios de los lotes?</span>
          <button type="button" onClick={cerrarSaludo} aria-label="Cerrar el saludo">
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className="asesor__btn"
        data-track="float-contact"
        ref={boton}
        onClick={alternar}
        aria-expanded={abierto}
        aria-controls="asesor-chat"
        aria-label={abierto ? "Cerrar el chat con el asesor" : "Abrir el chat con un asesor en línea"}
      >
        {avatar}
        <span className="asesor__text" aria-hidden="true">
          <small>Asesor en línea</small>
          <strong>¡Hablemos!</strong>
        </span>
        <span className="asesor__wa" aria-hidden="true"><Icon name="whatsapp" size={26} /></span>
      </button>
    </div>
  );
}
