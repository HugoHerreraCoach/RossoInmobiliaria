"use client";

import { useEffect, useRef, useState } from "react";
import { LANDINGS, type LandingId } from "@/content/landings";
import { loteById, m2, soles } from "@/content/lotes";
import { PROYECTO, whatsappHref } from "@/content/proyecto";
import { Icon } from "./Icon";
import { WhatsAppCta } from "./WhatsAppCta";
import { track, trackingContext, registrationEvent, whatsappConRef } from "@/lib/tracking/client";

type Estado = { t: "idle" | "enviando" | "ok" } | { t: "error"; msg: string } | { t: "sin-destino" };

/** Mensaje de WhatsApp al terminar el registro: el nombre, el lote si lo eligió y sus respuestas, para que el asesor
 *  retome la conversación sin volver a preguntar. */
function mensajeRegistro(nombre: string, lote: string, respuestas: string[]) {
  const partes = [nombre ? `Hola, soy ${nombre}.` : "Hola.", `Acabo de dejar mis datos en la web de ${PROYECTO.nombre}${lote ? ` por el lote ${lote}` : ""}.`];
  for (const r of respuestas) if (r) partes.push(`${r.replace(/\.$/, "")}.`);
  return [...partes, "¿Me envían el plano y los precios?"].join(" ");
}

/** Abre WhatsApp como el chat de DLC: en el celular, en la misma pestaña (abre la app); en escritorio, en otra pestaña.
 *  Devuelve false si el navegador la bloqueó (queda el botón para abrirlo a mano). */
function abrirWhatsApp(url: string) {
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) { window.location.href = url; return true; }
  const ventana = window.open(url, "_blank");
  if (ventana) ventana.opener = null;
  return !!ventana;
}


/** Formulario de la portada y del chat del asesor: nombre, WhatsApp y las preguntas de la landing
 *  (src/content/landings.ts). Lambayeque ("/") envía su única respuesta en `busca`, como siempre; Lima ("/promocion")
 *  las envía en `respuestas`, con su propia fuente, hoja y eventos de píxel. En el chat (`variante="chat"`, docs/0029),
 *  como en DLC, al confirmarse el registro se abre WhatsApp con el mensaje del registro. */
export function ContactForm({ idPrefix = "f", landing = "lambayeque", variante = "portada" }: { idPrefix?: string; landing?: LandingId; variante?: "portada" | "chat" }) {
  const config = LANDINGS[landing];
  const [estado, setEstado] = useState<Estado>({ t: "idle" });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [lote, setLote] = useState("");
  // Como en el diseño, la pregunta de Lambayeque viene con una opción marcada; la de Lima no (mide la preferencia).
  const [respuestas, setRespuestas] = useState<Record<string, string>>(() => Object.fromEntries(config.preguntas.map((p) => [p.id, p.marcada ?? ""])));
  const busca = landing === "lambayeque" ? respuestas.busca ?? "" : "";
  const form = useRef<HTMLFormElement>(null);
  const abort = useRef<AbortController | null>(null);
  const submission = useRef<{ id: string; signature: string } | null>(null);
  const source = variante === "chat" ? config.chat : idPrefix === "contacto" ? "contacto-form" : config.source;
  // Nombre con que se registró (para el mensaje de WhatsApp) y, en el chat, el enlace ya abierto o por abrir.
  const nombreEnviado = useRef("");
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const mensaje = mensajeRegistro(nombreEnviado.current, lote, config.preguntas.map((p) => respuestas[p.id] ?? ""));

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lote");
    if (q && loteById(q)) setLote(q.toUpperCase());
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (typeof id === "string" && loteById(id)) setLote(id.toUpperCase());
    };
    window.addEventListener("campina:lote", on);
    return () => { window.removeEventListener("campina:lote", on); abort.current?.abort(); };
  }, []);

  // Chat: con el registro ya en la hoja (y el evento ya enviado), el enlace con su código de intención y, un momento
  // después, WhatsApp. El margen deja salir los eventos de los píxeles antes de dejar la página en el celular.
  useEffect(() => {
    if (variante !== "chat" || estado.t !== "ok") return;
    const enlace = whatsappHref(mensaje);
    if (!enlace) return;
    let vivo = true;
    let espera: ReturnType<typeof setTimeout> | undefined;
    void whatsappConRef(enlace, { source, ...(lote ? { lot: lote } : {}) }).then((url) => {
      if (!vivo) return;
      setWhatsapp(url);
      espera = setTimeout(() => abrirWhatsApp(url), 800);
    });
    return () => { vivo = false; clearTimeout(espera); };
    // Solo al confirmarse el registro; el mensaje ya quedó fijo con los datos enviados.
  }, [estado.t]);

  const loteInfo = lote ? loteById(lote) : undefined;
  const mostrarErrores = (errors: Record<string, string>) => {
    setErrores(errors);
    setEstado({ t: "idle" });
    // El foco anuncia el error y no deja al visitante buscando qué falta.
    requestAnimationFrame(() => {
      const firstKey = Object.keys(errors)[0];
      if (!firstKey) return;
      const element = form.current?.elements.namedItem(firstKey);
      // Una pregunta de opción única es un grupo de radios: el foco va a la primera opción.
      const destino = element instanceof RadioNodeList ? element[0] : element;
      if (destino instanceof HTMLElement) destino.focus();
    });
  };

  const enviar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (estado.t === "enviando") return;
    const data = new FormData(event.currentTarget);
    // El aviso junto al botón informa el uso de los datos; enviar es la autorización que pide la API.
    const datos = {
      nombre: String(data.get("nombre") ?? "").trim(),
      celular: String(data.get("celular") ?? "").replace(/[^\d+]/g, ""),
      ciudad: "", busca, lote, visita: false, dia: "", consentimiento: true,
      ...(landing === "lambayeque" ? {} : { respuestas }),
    };
    const errors: Record<string, string> = {};
    if (datos.nombre.length < 2) errors.nombre = "Escribe tus nombres y apellidos.";
    if (!/^\+?\d{9,15}$/.test(datos.celular)) errors.celular = "Ingresa tu número de WhatsApp de 9 dígitos, o con código de país si estás fuera de Perú.";
    for (const p of config.preguntas) if (!respuestas[p.id]) errors[p.id] = "Elige una opción.";
    if (Object.keys(errors).length) { track("form_error", { source, error: "validation" }); return mostrarErrores(errors); }
    nombreEnviado.current = datos.nombre;
    const signature = JSON.stringify(datos);
    if (!submission.current || submission.current.signature !== signature) submission.current = { id: crypto.randomUUID(), signature };
    setErrores({}); setEstado({ t: "enviando" });
    const controller = new AbortController();
    abort.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...datos, website: data.get("website") || "", source, submission_id: submission.current.id, tracking: trackingContext() }), signal: controller.signal });
      const json = await response.json().catch(() => ({}));
      // Registro guardado (fila en la hoja): recién ahora va el evento de la landing a Meta y TikTok, con el id del envío.
      if (response.ok) { const registro = json.id || json.event_id; if (registro) registrationEvent(registro, { source, lot: lote, inicial: respuestas[config.preguntaPixel] ?? "" }); setEstado({ t: "ok" }); return; }
      if (response.status === 422 && json.errores && Object.keys(json.errores).length) { mostrarErrores(json.errores); return; }
      if (json.error === "sin-destino") { track("form_error", { source, error: "unconfigured" }); setEstado({ t: "sin-destino" }); return; }
      track("form_error", { source, error: "crm" });
      setEstado({ t: "error", msg: "No pudimos enviar tu solicitud. Tus datos no se han confirmado; vuelve a intentarlo." });
    } catch {
      track("form_error", { source, error: "network" });
      setEstado({ t: "error", msg: "No pudimos confirmar el envío. Revisa tu conexión e inténtalo de nuevo." });
    } finally { clearTimeout(timeout); abort.current = null; }
  };

  if (estado.t === "ok" && variante === "chat") return <div className="form-done">
    <div className="status status--ok" role="status"><div className="status__icon"><Icon name="check" size={24} /></div><div><h4>¡Listo! Abriendo WhatsApp…</h4><p>El equipo de {PROYECTO.empresa} recibió tus datos{lote ? ` y tu interés en el lote ${lote}` : ""}. Envía el mensaje y un asesor te responde por ahí.</p></div></div>
    {/* Botón y no enlace wa.me: así no se cuenta otra intención de WhatsApp (el enlace ya lleva su código). */}
    {whatsapp ? <p className="form-done__again">¿No se abrió WhatsApp? <button type="button" onClick={() => abrirWhatsApp(whatsapp)}>Ábrelo aquí</button></p> : null}
  </div>;

  if (estado.t === "ok") return <div className="form-done">
    <div className="status status--ok" role="status"><div className="status__icon"><Icon name="check" size={24} /></div><div><h4>Solicitud recibida.</h4><p>El equipo de {PROYECTO.empresa} recibió tus datos{lote ? ` y tu interés en el lote ${lote}` : ""} para contactarte por WhatsApp.</p></div></div>
    <WhatsAppCta mensaje={mensaje} className="btn btn--forest form__submit" track={source}>Escríbenos ahora por WhatsApp</WhatsAppCta>
  </div>;

  return <form ref={form} data-track-form={source} className="form" onSubmit={enviar} noValidate aria-busy={estado.t === "enviando"}>
    <div className="form-honeypot" aria-hidden="true"><label>Deja este campo vacío<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {loteInfo ? <div className="form__lot-banner"><div><span className="label">Tu lote seleccionado</span><strong>{loteInfo.id}, {m2(loteInfo.m2)}</strong>{loteInfo.precio ? <small>Referencia: {soles(loteInfo.precio.cuota)}/mes</small> : <small>Consulta su estado con un asesor.</small>}</div><button type="button" className="form__lot-clear" onClick={() => setLote("")} aria-label="Quitar lote seleccionado"><Icon name="close" size={16} /></button></div> : null}
    <div className="field"><label className="sr-only" htmlFor={`${idPrefix}-nombre`}>Nombres y apellidos</label><div className="field__group"><span className="field__icon" aria-hidden="true"><Icon name="usuario" size={20} /></span><input id={`${idPrefix}-nombre`} name="nombre" autoComplete="name" placeholder="Nombres y apellidos*" maxLength={120} required aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? `${idPrefix}-e-nombre` : undefined} /></div>{errores.nombre ? <span className="field__err" id={`${idPrefix}-e-nombre`}>{errores.nombre}</span> : null}</div>
    <div className="field"><label className="sr-only" htmlFor={`${idPrefix}-celular`}>Número de WhatsApp</label><div className="field__group"><span className="field__icon field__icon--wa" aria-hidden="true"><Icon name="whatsapp" size={20} /></span><span className="field__prefix" aria-hidden="true">+51</span><input id={`${idPrefix}-celular`} name="celular" type="tel" inputMode="tel" autoComplete="tel" placeholder="Tu número de WhatsApp*" maxLength={20} required aria-invalid={!!errores.celular} aria-describedby={errores.celular ? `${idPrefix}-e-celular` : undefined} /></div>{errores.celular ? <span className="field__err" id={`${idPrefix}-e-celular`}>{errores.celular}</span> : null}</div>
    {config.preguntas.map((p) => <fieldset className="field field--choices" key={p.id} aria-describedby={errores[p.id] ? `${idPrefix}-e-${p.id}` : undefined}><legend>{p.texto}</legend><div className="choices">{p.opciones.map((o) => <label className={`choice ${respuestas[p.id] === o.valor ? "is-selected" : ""}`} key={o.valor}><input type="radio" name={p.id} value={o.valor} checked={respuestas[p.id] === o.valor} onChange={() => setRespuestas((r) => ({ ...r, [p.id]: o.valor }))} /><span className="choice__dot" aria-hidden="true" /><strong>{o.etiqueta}</strong></label>)}</div>{errores[p.id] ? <span className="field__err" id={`${idPrefix}-e-${p.id}`}>{errores[p.id]}</span> : null}</fieldset>)}
    {estado.t === "error" ? <div className="status status--warn" role="alert"><p>{estado.msg}</p></div> : null}
    {estado.t === "sin-destino" ? <div className="status status--warn" role="alert"><p>El formulario no tiene un destino de contacto configurado en este entorno. Tus datos no se enviaron.</p></div> : null}
    {variante === "chat"
      ? <button className="btn btn--forest form__submit" type="submit" disabled={estado.t === "enviando"}><Icon name="whatsapp" size={20} />{estado.t === "enviando" ? "Registrando tus datos…" : lote ? `Consultar lote ${lote} por WhatsApp` : "Continuar en WhatsApp"}</button>
      : <button className="btn btn--forest form__submit" type="submit" disabled={estado.t === "enviando"}>{estado.t === "enviando" ? "Enviando solicitud…" : lote ? `Consultar lote ${lote}` : "Recibir plano y precios"}<Icon name="der" size={18} /></button>}
    <p className="form__legal"><Icon name="candado" size={16} /><span>Al enviar, aceptas que {PROYECTO.empresa} te contacte por WhatsApp o llamada sobre este proyecto. <a href="/privacidad">Privacidad</a></span></p>
  </form>;
}
