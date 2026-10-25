"use client";

import { useEffect, useRef, useState } from "react";
import { DESDE_CONTADO, DISPONIBLES, loteById, m2, soles } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Icon } from "./Icon";
import { track, trackingContext, registrationEvent } from "@/lib/tracking/client";

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
export function ContactForm({
  idPrefix = "f",
  openWhatsApp = true,
  submitLabel,
  footerNote,
}: {
  idPrefix?: string;
  openWhatsApp?: boolean;
  submitLabel?: string;
  footerNote?: string;
}) {
  const [estado, setEstado] = useState<Estado>({ t: "idle" });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [lote, setLote] = useState("");
  const [busca, setBusca] = useState(INICIALES[0].id);
  const [nombreVal, setNombreVal] = useState("");
  const [celularVal, setCelularVal] = useState("");
  const [focused, setFocused] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const abort = useRef<AbortController | null>(null);
  const submission = useRef<{ id: string; signature: string } | null>(null);
  const source = idPrefix === "contacto" || idPrefix === "widchat" ? "contacto-form" : "hero-form";

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

  // Calcula el avance (0 a 360 grados) del borde verde alrededor de .form-card mientras completan los campos.
  useEffect(() => {
    const card = form.current?.closest<HTMLElement>(".form-card");
    if (!card) return;
    const cleanName = nombreVal.trim();
    const digits = celularVal.replace(/\D/g, "").length;
    const nameReady = cleanName.length >= 2 && (digits > 0 || cleanName.length >= 5);
    const nameRatio = nameReady ? 1 : Math.min(1, cleanName.length / 5);
    const phoneRatio = Math.min(1, digits / 9);
    const complete = cleanName.length >= 2 && digits >= 9;
    const progress = complete
      ? 1
      : Math.min(0.96, 0.14 + (focused ? 0.06 : 0) + nameRatio * 0.4 + phoneRatio * 0.4);
    const deg = Math.round(progress * 360);
    card.style.setProperty("--form-progress", `${deg}deg`);
    card.dataset.complete = complete ? "true" : "false";
  }, [nombreVal, celularVal, busca, focused]);

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
    const waText = `Hola, soy ${datos.nombre}. Quiero información de los lotes de ${PROYECTO.nombre} (${busca})${lote ? ` · Lote ${lote}` : ""}.`;
    const waUrl = openWhatsApp && PROYECTO.contacto.whatsapp
      ? `https://wa.me/${PROYECTO.contacto.whatsapp}?text=${encodeURIComponent(waText)}`
      : null;
    const tab = waUrl ? window.open("about:blank", "_blank") : null;
    if (tab) tab.opener = null;
    const abrirWa = () => {
      if (!waUrl) return;
      if (tab) tab.location.href = waUrl;
      else window.location.assign(waUrl);
    };
    const cerrarTab = () => {
      try { tab?.close(); } catch {}
    };
    const controller = new AbortController();
    abort.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...datos, website: data.get("website") || "", source, submission_id: submission.current.id, tracking: trackingContext() }), signal: controller.signal });
      const json = await response.json().catch(() => ({}));
      // Registro guardado (fila en la hoja): recién ahora va CompleteRegistration a Meta y TikTok, con el id del envío.
      if (response.ok) {
        const registro = json.id || json.event_id;
        if (registro) registrationEvent(registro, { source, lot: lote, inicial: busca });
        abrirWa();
        setEstado({ t: "ok" });
        return;
      }
      if (response.status === 422 && json.errores && Object.keys(json.errores).length) { cerrarTab(); mostrarErrores(json.errores); return; }
      if (json.error === "sin-destino") {
        track("form_error", { source, error: "unconfigured" });
        if (waUrl) { abrirWa(); setEstado({ t: "ok" }); return; }
        setEstado({ t: "sin-destino" });
        return;
      }
      cerrarTab();
      track("form_error", { source, error: "crm" });
      setEstado({ t: "error", msg: "No pudimos enviar tu solicitud. Tus datos no se han confirmado; vuelve a intentarlo." });
    } catch {
      cerrarTab();
      track("form_error", { source, error: "network" });
      setEstado({ t: "error", msg: "No pudimos confirmar el envío. Revisa tu conexión e inténtalo de nuevo." });
    } finally { clearTimeout(timeout); abort.current = null; }
  };

  if (estado.t === "ok") return <div className="status status--ok" role="status"><div className="status__icon"><Icon name="check" size={24} /></div><div><h4>Solicitud recibida.</h4><p>El equipo de {PROYECTO.empresa} recibió tus datos{lote ? ` y tu interés en el lote ${lote}` : ""} para contactarte por WhatsApp.</p></div></div>;

  return <form
    ref={form}
    data-track-form={source}
    className="form"
    onSubmit={enviar}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
    }}
    noValidate
    aria-busy={estado.t === "enviando"}
  >
    <div className="form-honeypot" aria-hidden="true"><label>Deja este campo vacío<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {loteInfo ? <div className="form__lot-banner"><span>Lote seleccionado: <strong>Lote {loteInfo.id} · Mz. {loteInfo.manzana}</strong></span><button type="button" className="form__lot-clear" onClick={() => setLote("")} aria-label="Quitar lote seleccionado"><Icon name="close" size={13} /></button></div> : null}
    <div className="field"><label className="sr-only" htmlFor={`${idPrefix}-nombre`}>Nombres y apellidos</label><div className="field__input-wrap"><span className="field__icon" aria-hidden="true"><Icon name="user" size={18} /></span><input id={`${idPrefix}-nombre`} name="nombre" autoComplete="name" placeholder="Nombres y apellidos*" maxLength={120} required value={nombreVal} onChange={(e) => setNombreVal(e.target.value)} aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? `${idPrefix}-e-nombre` : undefined} /></div>{errores.nombre ? <span className="field__err" id={`${idPrefix}-e-nombre`}>{errores.nombre}</span> : null}</div>
    <div className="field"><label className="sr-only" htmlFor={`${idPrefix}-celular`}>Número de WhatsApp</label><div className="field__tel"><span aria-hidden="true"><i className="flag-pe" /> +51</span><input id={`${idPrefix}-celular`} name="celular" type="tel" inputMode="tel" autoComplete="tel" placeholder="Tu número de WhatsApp*" maxLength={20} required value={celularVal} onChange={(e) => setCelularVal(e.target.value)} aria-invalid={!!errores.celular} aria-describedby={errores.celular ? `${idPrefix}-e-celular` : undefined} /></div>{errores.celular ? <span className="field__err" id={`${idPrefix}-e-celular`}>{errores.celular}</span> : null}</div>
    <fieldset className="field field--choices"><legend>¿CON CUÁNTO DE INICIAL TE GUSTARÍA EMPEZAR?</legend><div className="choices">{INICIALES.map((o) => <label className={`choice ${busca === o.id ? "is-selected" : ""}`} key={o.id}><input type="radio" name="busca" value={o.id} checked={busca === o.id} onChange={() => setBusca(o.id)} /><strong>{o.label}</strong><span className="choice__check" aria-hidden="true"><Icon name="check" size={11} /></span></label>)}</div></fieldset>
    {estado.t === "error" ? <div className="status status--warn" role="alert"><p>{estado.msg}</p></div> : null}
    {estado.t === "sin-destino" ? <div className="status status--warn" role="alert"><p>El formulario no tiene un destino de contacto configurado en este entorno. Tus datos no se enviaron.</p></div> : null}
    <button className="btn btn--forest form__submit" type="submit" disabled={estado.t === "enviando"}><span className="form__submit-bubble" aria-hidden="true">💬</span><span>{estado.t === "enviando" ? "ENVIANDO SOLICITUD…" : submitLabel ?? "RECLAMAR DESCUENTO EN WHATSAPP"}</span><Icon name="der" size={18} /></button>
    {footerNote ? <p className="form__footnote"><span aria-hidden="true">⚡</span> {footerNote}</p> : null}
  </form>;
}
