"use client";

import { useEffect, useRef, useState } from "react";
import { DESDE_CONTADO, DISPONIBLES, loteById, m2, soles } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Icon } from "./Icon";
import { track, trackingContext, pixelEvent } from "@/lib/tracking/client";

type Estado = { t: "idle" | "enviando" | "ok" } | { t: "error"; msg: string } | { t: "sin-destino" };

// Montos de la lista de precios, redondeados a miles como en la referencia DLC ("Desde S/ 3 mil").
// En pantalla, con espacio duro para que "S/" no quede solo al final de la l\u00ednea.
const mil = (n: number) => `S/ ${Math.round(n / 1000)} mil`;
const pegado = (s: string) => s.replace(/S\/ (\d+) mil/, "S/\u00a0$1\u00a0mil");
const INICIAL_MIN = Math.min(...DISPONIBLES.map((l) => l.precio!.inicial));
// La respuesta viaja en `busca` (texto libre, 40 caracteres) para no cambiar el contrato de /api/lead.
const INICIALES = [
  { id: `Inicial desde ${mil(INICIAL_MIN)}`, label: pegado(`Desde ${mil(INICIAL_MIN)}`) },
  { id: `Pago al contado ${mil(DESDE_CONTADO)}`, label: pegado(`Pago al contado ${mil(DESDE_CONTADO)}`) },
];

/** Formulario de la portada: nombre, WhatsApp y la inicial con la que quiere empezar. */
export function ContactForm({ idPrefix = "f" }: { idPrefix?: string }) {
  const [estado, setEstado] = useState<Estado>({ t: "idle" });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [lote, setLote] = useState("");
  const [busca, setBusca] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const abort = useRef<AbortController | null>(null);
  const submission = useRef<{ id: string; signature: string } | null>(null);
  const source = idPrefix === "contacto" ? "contacto-form" : "hero-form";

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

  const loteInfo = lote ? loteById(lote) : undefined;
  const mostrarErrores = (errors: Record<string, string>) => {
    setErrores(errors);
    setEstado({ t: "idle" });
    // El foco anuncia el error y no deja al visitante buscando qué falta.
    requestAnimationFrame(() => {
      const firstKey = Object.keys(errors)[0];
      if (!firstKey) return;
      const element = form.current?.elements.namedItem(firstKey);
      if (element instanceof HTMLElement) element.focus();
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
    };
    const errors: Record<string, string> = {};
    if (datos.nombre.length < 2) errors.nombre = "Escribe tus nombres y apellidos.";
    if (!/^\+?\d{9,15}$/.test(datos.celular)) errors.celular = "Ingresa tu número de WhatsApp de 9 dígitos, o con código de país si estás fuera de Perú.";
    if (Object.keys(errors).length) { track("form_error", { source, error: "validation" }); return mostrarErrores(errors); }
    const signature = JSON.stringify(datos);
    if (!submission.current || submission.current.signature !== signature) submission.current = { id: crypto.randomUUID(), signature };
    setErrores({}); setEstado({ t: "enviando" });
    const controller = new AbortController();
    abort.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...datos, website: data.get("website") || "", source, submission_id: submission.current.id, tracking: trackingContext() }), signal: controller.signal });
      const json = await response.json().catch(() => ({}));
      // Registro guardado (fila en la hoja): recién ahora va CompleteRegistration a Meta y TikTok, con el id del envío.
      if (response.ok) { if (json.event_id) pixelEvent("form_submit", json.event_id, { source, lot: lote }); setEstado({ t: "ok" }); return; }
      if (response.status === 422 && json.errores && Object.keys(json.errores).length) { mostrarErrores(json.errores); return; }
      if (json.error === "sin-destino") { track("form_error", { source, error: "unconfigured" }); setEstado({ t: "sin-destino" }); return; }
      track("form_error", { source, error: "crm" });
      setEstado({ t: "error", msg: "No pudimos enviar tu solicitud. Tus datos no se han confirmado; vuelve a intentarlo." });
    } catch {
      track("form_error", { source, error: "network" });
      setEstado({ t: "error", msg: "No pudimos confirmar el envío. Revisa tu conexión e inténtalo de nuevo." });
    } finally { clearTimeout(timeout); abort.current = null; }
  };

  if (estado.t === "ok") return <div className="status status--ok" role="status"><div className="status__icon"><Icon name="check" size={24} /></div><div><h4>Solicitud recibida.</h4><p>El equipo de {PROYECTO.empresa} recibió tus datos{lote ? ` y tu interés en el lote ${lote}` : ""} para contactarte por WhatsApp.</p></div></div>;

  return <form ref={form} data-track-form={source} className="form" onSubmit={enviar} noValidate aria-busy={estado.t === "enviando"}>
    <div className="form-honeypot" aria-hidden="true"><label>Deja este campo vacío<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {loteInfo ? <div className="form__lot-banner"><div><span className="label">Tu lote seleccionado</span><strong>{loteInfo.id}, {m2(loteInfo.m2)}</strong>{loteInfo.precio ? <small>Referencia: {soles(loteInfo.precio.cuota)}/mes</small> : <small>Consulta su estado con un asesor.</small>}</div><button type="button" className="form__lot-clear" onClick={() => setLote("")} aria-label="Quitar lote seleccionado"><Icon name="close" size={16} /></button></div> : null}
    <div className="field"><label className="sr-only" htmlFor={`${idPrefix}-nombre`}>Nombres y apellidos</label><input id={`${idPrefix}-nombre`} name="nombre" autoComplete="name" placeholder="Nombres y apellidos*" maxLength={120} required aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? `${idPrefix}-e-nombre` : undefined} />{errores.nombre ? <span className="field__err" id={`${idPrefix}-e-nombre`}>{errores.nombre}</span> : null}</div>
    <div className="field"><label className="sr-only" htmlFor={`${idPrefix}-celular`}>Número de WhatsApp</label><div className="field__tel"><span aria-hidden="true">+51</span><input id={`${idPrefix}-celular`} name="celular" type="tel" inputMode="tel" autoComplete="tel" placeholder="Tu número de WhatsApp*" maxLength={20} required aria-invalid={!!errores.celular} aria-describedby={errores.celular ? `${idPrefix}-e-celular` : undefined} /></div>{errores.celular ? <span className="field__err" id={`${idPrefix}-e-celular`}>{errores.celular}</span> : null}</div>
    <fieldset className="field field--choices"><legend>¿Con cuánto de inicial te gustaría empezar?</legend><div className="choices">{INICIALES.map((o) => <label className={`choice ${busca === o.id ? "is-selected" : ""}`} key={o.id}><input type="radio" name="busca" value={o.id} checked={busca === o.id} onChange={() => setBusca(o.id)} /><strong>{o.label}</strong></label>)}</div></fieldset>
    {estado.t === "error" ? <div className="status status--warn" role="alert"><p>{estado.msg}</p></div> : null}
    {estado.t === "sin-destino" ? <div className="status status--warn" role="alert"><p>El formulario no tiene un destino de contacto configurado en este entorno. Tus datos no se enviaron.</p></div> : null}
    <button className="btn btn--forest form__submit" type="submit" disabled={estado.t === "enviando"}>{estado.t === "enviando" ? "Enviando solicitud…" : lote ? `Consultar lote ${lote}` : "Recibir plano y precios"}<Icon name="der" size={18} /></button>
    <p className="form__legal">Al enviar, aceptas que {PROYECTO.empresa} te contacte por WhatsApp o llamada sobre este proyecto. <a href="/privacidad">Privacidad</a></p>
  </form>;
}
