"use client";

import { useEffect, useRef, useState } from "react";
import type { LandingId } from "@/content/landings";
import { CUOTAS, DESDE, DESDE_CONTADO, soles0 } from "@/content/lotes";
import { useLotes } from "./LotesProvider";
import { PROYECTO } from "@/content/proyecto";
import { ContactForm } from "./ContactForm";
import { Icon } from "./Icon";

const MINUTOS_CHICLAYO = PROYECTO.ubicacion.tramos.find((t) => t.lugar === "Chiclayo")!.minutos;

/** Widchat flotante del asesor: cerrado muestra un saludo proactivo + la píldora "Asesora en línea";
 *  al hacer clic despliega la ventana de chat con el formulario integrado (variante="chat"). */
export function AsesorFlotante({ landing = "lambayeque" }: { landing?: LandingId } = {}) {
  const [abierto, setAbierto] = useState(false);
  const [saludoVisible, setSaludoVisible] = useState(true);
  // Montos "desde" de los lotes vigentes (docs/0032).
  const cat = useLotes();
  const [montado, setMontado] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const foto = PROYECTO.contacto.asesorFoto || "/media/asesora-perfil.jpg";

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

  const abrir = () => {
    setMontado(true);
    setAbierto(true);
    setSaludoVisible(false);
  };

  return (
    <div className={`asesor ${abierto ? "is-open" : ""}`} ref={wrapRef}>
      {montado ? (
        <div
          className="asesor__panel"
          id="asesor-chat"
          role="dialog"
          aria-label={`Chat con asesora de ${PROYECTO.empresa}`}
          hidden={!abierto}
        >
          <div className="asesor__panel-head">
            <div className="asesor__panel-avatar" aria-hidden="true">
              <img src={foto} alt="" width={46} height={46} />
              <i className="asesor__panel-status-dot" />
            </div>
            <div className="asesor__panel-title">
              <strong>
                Asesora {PROYECTO.empresa}
                <span className="asesor__verified" aria-label="Canal verificado">✓</span>
              </strong>
              <span><i aria-hidden="true" /> En línea ahora · Respuesta inmediata</span>
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
                src={foto}
                alt=""
                width={32}
                height={32}
                aria-hidden="true"
              />
              <div className="asesor__bubble">
                <p>
                  ¡Hola! <span aria-hidden="true">👋</span> Soy tu asesora en <strong>{PROYECTO.empresa}</strong>.
                </p>
                <p>
                  Separa tu lote de <strong>500 m²</strong> desde <strong className="asesor__bubble-price">{soles0(cat.desdeContado ?? DESDE_CONTADO)}</strong> al contado o con inicial desde <strong>{soles0(cat.inicialMin ?? DESDE.precio!.inicial)}</strong> ({CUOTAS} cuotas sin interés).
                </p>
                <span className="asesor__bubble-meta">Ahora · ✓✓</span>
              </div>
            </div>

            <div className="asesor__promo-pill">
              <Icon name="gift" size={15} />
              <span>
                {landing === "lima"
                  ? "¡Bono Descuento Exclusivo + Videollamada!"
                  : "¡Bono activado: Descuento exclusivo de preventa!"}
              </span>
            </div>

            <p className="asesor__prompt">
              Completa tus datos aquí para recibir tu descuento en WhatsApp:
            </p>

            <ContactForm
              idPrefix="widchat"
              landing={landing}
              variante="chat"
              submitLabel="RECLAMAR DESCUENTO EN WHATSAPP"
              footerNote="Atención inmediata por WhatsApp · Sin compromiso"
            />
          </div>
        </div>
      ) : null}

      {!abierto && saludoVisible ? (
        <div className="asesor__saludo">
          <button type="button" className="asesor__saludo-open" onClick={abrir}>
            🎁 <strong>¿Buscas lote?</strong> Reclama tu descuento aquí
          </button>
          <button
            type="button"
            className="asesor__saludo-close"
            onClick={() => setSaludoVisible(false)}
            aria-label="Cerrar aviso"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}

      {!abierto ? (
        <button
          type="button"
          className="asesor__btn"
          data-track="float-contact"
          aria-expanded={false}
          aria-controls="asesor-chat"
          onClick={abrir}
        >
          <span className="asesor__icon asesor__icon--avatar" aria-hidden="true">
            <img
              src={foto}
              alt=""
              width={46}
              height={46}
              loading="eager"
            />
          </span>
          <span className="asesor__text">
            <small><i aria-hidden="true" /> ASESORA EN LÍNEA</small>
            <strong>Reclamar bono <span className="asesor__wave" aria-hidden="true">🎁</span></strong>
          </span>
          <span className="asesor__wa" aria-hidden="true">
            <Icon name="chat" size={19} />
            <b className="asesor__wa-unread">1</b>
          </span>
        </button>
      ) : null}
    </div>
  );
}
