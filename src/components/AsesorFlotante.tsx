"use client";

import { useEffect, useRef, useState } from "react";
import type { LandingId } from "@/content/landings";
import { DESDE_CONTADO, soles0 } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { ContactForm } from "./ContactForm";
import { Icon } from "./Icon";

/** Widchat flotante: cerrado muestra únicamente la burbuja compacta "Asesor en línea";
 *  al hacer clic se despliega la ventana de chat con el formulario integrado. */
export function AsesorFlotante({ landing = "lambayeque" }: { landing?: LandingId } = {}) {
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const t = setTimeout(() => {
      const input = document.getElementById("widchat-nombre");
      if (input instanceof HTMLElement) input.focus({ preventScroll: true });
    }, 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [abierto]);

  return (
    <div className={`asesor ${abierto ? "is-open" : ""}`} ref={wrapRef}>
      {abierto ? (
        <div className="asesor__panel" role="dialog" aria-label={`Chat con asesora de ${PROYECTO.empresa}`}>
          <div className="asesor__panel-head">
            <div className="asesor__panel-avatar" aria-hidden="true">
              <img src="/media/asesora-perfil.jpg" alt="" width={46} height={46} />
              <i className="asesor__panel-status-dot" />
            </div>
            <div className="asesor__panel-title">
              <strong>Asesora {PROYECTO.empresa}</strong>
              <span><i aria-hidden="true" /> En línea · {PROYECTO.nombre}</span>
            </div>
            <button
              type="button"
              className="asesor__panel-close"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <div className="asesor__panel-body">
            <div className="asesor__chat">
              <img
                className="asesor__chat-avatar"
                src="/media/asesora-perfil.jpg"
                alt=""
                width={30}
                height={30}
                aria-hidden="true"
              />
              <div className="asesor__bubble">
                <p>
                  ¡Hola! <span aria-hidden="true">👋</span> Soy tu asesora en <strong>{PROYECTO.empresa}</strong>.
                </p>
                <p>
                  Estamos en preventa de terrenos campestres desde <strong className="asesor__bubble-price">{soles0(DESDE_CONTADO)}</strong> a 35 min de Chiclayo, en el {PROYECTO.valle}.{" "}
                  {landing === "lima"
                    ? "¿Te gustaría conocer el proyecto por videollamada o recibir el plano?"
                    : "¿Cómo te podemos ayudar hoy?"}
                </p>
              </div>
            </div>

            <p className="asesor__prompt">
              {landing === "lima"
                ? "Déjanos tus datos para enviarte el plano o agendar una videollamada por WhatsApp:"
                : "Déjanos tus datos y un asesor te escribirá por WhatsApp:"}
            </p>

            <ContactForm
              idPrefix="widchat"
              landing={landing}
              openWhatsApp
              submitLabel="RECLAMAR DESCUENTO EN WHATSAPP"
              footerNote="Te atenderemos directamente por WhatsApp sin compromiso"
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="asesor__btn"
          data-track="float-contact"
          aria-expanded={false}
          onClick={() => setAbierto(true)}
        >
          <span className="asesor__icon asesor__icon--avatar" aria-hidden="true">
            <img
              src="/media/asesora-perfil.jpg"
              alt=""
              width={46}
              height={46}
              loading="eager"
            />
          </span>
          <span className="asesor__text">
            <small><i aria-hidden="true" /> ASESOR EN LÍNEA</small>
            <strong>¡Hablemos! <span className="asesor__wave" aria-hidden="true">👋</span></strong>
          </span>
          <span className="asesor__wa" aria-hidden="true">
            <Icon name="chat" size={19} />
            <b className="asesor__wa-unread">1</b>
          </span>
        </button>
      )}
    </div>
  );
}
