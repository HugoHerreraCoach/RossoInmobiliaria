"use client";

import { useEffect, useRef, useState } from "react";
import { loteById, m2, soles } from "@/content/lotes";
import { Icon } from "./Icon";
import { track, trackingContext, pixelEvent } from "@/lib/tracking/client";

type Estado = { t: "idle" | "enviando" | "ok" } | { t: "error"; msg: string } | { t: "sin-destino" };
const CIUDADES = ["Chiclayo", "Lima", "Trujillo", "Piura", "José Leonardo Ortiz", "Otra ciudad"];
const PERFILES = [{ id: "Invertir", label: "Invertir" }, { id: "Para mi familia", label: "Para mi familia" }, { id: "Desde otra ciudad", label: "A distancia" }];

/** Comparte el contrato original de /api/lead. El modo compacto no elimina campos. */
export function ContactForm({ idPrefix = "f", compact = false }: { idPrefix?: string; compact?: boolean }) {
  const [estado, setEstado] = useState<Estado>({ t: "idle" });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [lote, setLote] = useState("");
  const [busca, setBusca] = useState("Para mi familia");
  const [visita, setVisita] = useState(false);
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
      if (element instanceof HTMLElement) { const details = element.closest("details"); if (details) details.open = true; element.focus(); }
    });
  };

  const enviar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (estado.t === "enviando") return;
    const data = new FormData(event.currentTarget);
    const datos = {
      nombre: String(data.get("nombre") ?? "").trim(),
      celular: String(data.get("celular") ?? "").replace(/[^\d+]/g, ""),
      ciudad: String(data.get("ciudad") ?? ""), busca, lote, visita,
      dia: String(data.get("dia") ?? ""), consentimiento: data.get("consentimiento") === "on",
    };
    const errors: Record<string, string> = {};
    if (datos.nombre.length < 2) errors.nombre = "Escribe tu nombre completo.";
    if (!/^\+?\d{9,15}$/.test(datos.celular)) errors.celular = "Ingresa de 9 a 15 dígitos, con código de país si estás fuera de Perú.";
    if (!datos.consentimiento) errors.consentimiento = "Autoriza el contacto para poder enviar tu solicitud.";
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

  if (estado.t === "ok") return <div className="status status--ok" role="status"><div className="status__icon"><Icon name="check" size={24} /></div><div><h4>Solicitud recibida.</h4><p>El equipo de Rosso Inmobiliaria recibió tus datos{lote ? ` y tu interés en el lote ${lote}` : ""} para contactarte.</p></div></div>;

  const extraFields = <>
    <div className="row2"><div className="field"><label htmlFor={`${idPrefix}-ciudad`}>Tu ciudad</label><select id={`${idPrefix}-ciudad`} name="ciudad" defaultValue="Chiclayo">{CIUDADES.map((c) => <option key={c}>{c}</option>)}</select></div><div className="field"><label htmlFor={`${idPrefix}-lote`}>Lote de interés <span>(opcional)</span></label><input id={`${idPrefix}-lote`} name="lote" type="text" placeholder="Ej. G18" value={lote} onChange={(e) => setLote(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))} /></div></div>
    <label className="check"><input type="checkbox" checked={visita} onChange={(e) => setVisita(e.target.checked)} /><span>También deseo coordinar una visita o videollamada.</span></label>
    {visita ? <div className="field"><label htmlFor={`${idPrefix}-dia`}>¿Cuándo te gustaría?</label><select id={`${idPrefix}-dia`} name="dia" defaultValue="Sábado por la mañana"><option>Sábado por la mañana</option><option>Domingo por la mañana</option><option>Entre semana</option><option>Videollamada desde mi ciudad</option></select><small>El horario se confirma con un asesor.</small></div> : null}
  </>;

  return <form ref={form} data-track-form={source} className={`form ${compact ? "form--compact" : ""}`} onSubmit={enviar} noValidate aria-busy={estado.t === "enviando"}>
    <div className="form-honeypot" aria-hidden="true"><label>Deja este campo vacío<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {loteInfo ? <div className="form__lot-banner"><div><span className="label">Tu lote seleccionado</span><strong>{loteInfo.id} · {m2(loteInfo.m2)}</strong>{loteInfo.precio ? <small>Referencia: {soles(loteInfo.precio.cuota)}/mes</small> : <small>Consulta su estado con un asesor.</small>}</div><button type="button" className="form__lot-clear" onClick={() => setLote("")} aria-label="Quitar lote seleccionado"><Icon name="close" size={16} /></button></div> : null}
    <div className="row2 form__identity">
      <div className="field"><label htmlFor={`${idPrefix}-nombre`}>Nombre completo <span>*</span></label><input id={`${idPrefix}-nombre`} name="nombre" autoComplete="name" placeholder="¿Cómo te llamas?" maxLength={120} required aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? `${idPrefix}-e-nombre` : undefined} />{errores.nombre ? <span className="field__err" id={`${idPrefix}-e-nombre`}>{errores.nombre}</span> : null}</div>
      <div className="field"><label htmlFor={`${idPrefix}-celular`}>Celular / WhatsApp <span>*</span></label><input id={`${idPrefix}-celular`} name="celular" type="tel" inputMode="tel" autoComplete="tel" placeholder="Ej. 987 654 321" maxLength={20} required aria-invalid={!!errores.celular} aria-describedby={errores.celular ? `${idPrefix}-e-celular` : undefined} />{errores.celular ? <span className="field__err" id={`${idPrefix}-e-celular`}>{errores.celular}</span> : null}</div>
    </div>
    <fieldset className="field field--profiles"><legend>Estoy buscando un lote para</legend><div className="choices">{PERFILES.map((p) => <label className={`choice ${busca === p.id ? "is-selected" : ""}`} key={p.id}><input type="radio" name="busca" value={p.id} checked={busca === p.id} onChange={() => setBusca(p.id)} /><strong>{p.label}</strong></label>)}</div></fieldset>
    {compact ? <details className="form__extras"><summary>Personalizar mi solicitud <Icon name="mas" size={15} /></summary><div>{extraFields}</div></details> : extraFields}
    <label className="check form__consent"><input type="checkbox" name="consentimiento" required aria-invalid={!!errores.consentimiento} aria-describedby={errores.consentimiento ? `${idPrefix}-e-cons` : undefined} /><span>Autorizo a Rosso Inmobiliaria a contactarme por WhatsApp o llamada sobre este proyecto.</span></label>
    {errores.consentimiento ? <span className="field__err" id={`${idPrefix}-e-cons`}>{errores.consentimiento}</span> : null}
    {estado.t === "error" ? <div className="status status--warn" role="alert"><p>{estado.msg}</p></div> : null}
    {estado.t === "sin-destino" ? <div className="status status--warn" role="alert"><p>El formulario no tiene un destino de contacto configurado en este entorno. Tus datos no se enviaron.</p></div> : null}
    <button className="btn btn--forest form__submit" type="submit" disabled={estado.t === "enviando"}>{estado.t === "enviando" ? "Enviando solicitud…" : visita ? "Solicitar una visita" : lote ? `Consultar lote ${lote}` : "Recibir plano y precios"}<Icon name="der" size={18} /></button>
  </form>;
}
