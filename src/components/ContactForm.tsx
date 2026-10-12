"use client";

import { useEffect, useState } from "react";
import { loteById, m2, soles } from "@/content/lotes";
import { Icon } from "./Icon";

type Estado =
  | { t: "idle" }
  | { t: "enviando" }
  | { t: "ok" }
  | { t: "error"; msg: string }
  | { t: "sin-destino" };

const CIUDADES = ["Chiclayo", "Lima", "Trujillo", "Piura", "José Leonardo Ortiz", "Otra ciudad"];
const PERFILES = [
  { id: "Invertir", label: "Invertir", sub: "Al contado o plusvalía" },
  { id: "Para mi familia", label: "Casa de campo", sub: "48 cuotas 0% interés" },
  { id: "Desde otra ciudad", label: "Compra remota", sub: "Vivo fuera de Chiclayo" },
] as const;

export function ContactForm({ idPrefix = "f", compact = false }: { idPrefix?: string; compact?: boolean }) {
  const [estado, setEstado] = useState<Estado>({ t: "idle" });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [lote, setLote] = useState("");
  const [busca, setBusca] = useState<string>("Para mi familia");
  const [visita, setVisita] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lote");
    if (q && loteById(q)) setLote(q.toUpperCase());
    const on = (e: Event) => setLote((e as CustomEvent<string>).detail);
    window.addEventListener("campina:lote", on);
    return () => window.removeEventListener("campina:lote", on);
  }, []);

  const loteInfo = lote ? loteById(lote) : undefined;

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const datos = {
      nombre: f.get("nombre"),
      celular: f.get("celular"),
      ciudad: f.get("ciudad"),
      busca,
      lote,
      visita,
      dia: f.get("dia") ?? "",
      consentimiento: f.get("consentimiento") === "on",
    };
    setErrores({});
    setEstado({ t: "enviando" });
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(datos),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) return setEstado({ t: "ok" });
      if (r.status === 422) {
        setErrores(j.errores ?? {});
        return setEstado({ t: "idle" });
      }
      if (j.error === "sin-destino") return setEstado({ t: "sin-destino" });
      setEstado({ t: "error", msg: "No pudimos enviar tus datos. Inténtalo otra vez en un minuto." });
    } catch {
      setEstado({ t: "error", msg: "Parece que no hay conexión. Revisa tu internet e inténtalo otra vez." });
    }
  };

  if (estado.t === "ok") {
    return (
      <div className="status status--ok" role="status">
        <div className="status__icon">
          <Icon name="check" size={24} />
        </div>
        <div>
          <h4>¡Solicitud recibida con éxito!</h4>
          <p>
            Un asesor de <b>Rosso Inmobiliaria</b> se comunicará a tu celular
            {lote ? ` con el plano y cotización oficial del Lote ${lote}` : " con el plano actualizado y precios"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className={`form ${compact ? "form--compact" : ""}`} onSubmit={enviar} noValidate>
      {loteInfo ? (
        <div className="form__lot-banner">
          <div>
            <span className="label">Lote preseleccionado en Masterplan</span>
            <strong>
              Lote {loteInfo.id} · Manzana {loteInfo.manzana} ({m2(loteInfo.m2)})
            </strong>
            {loteInfo.precio ? (
              <small>
                Cuota desde {soles(loteInfo.precio.cuota)}/mes · Contado{" "}
                {soles(loteInfo.precio.promoContado ?? loteInfo.precio.contado)}
              </small>
            ) : null}
          </div>
          <button type="button" className="form__lot-clear" onClick={() => setLote("")} aria-label="Quitar lote seleccionado">
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : null}

      <fieldset className="field field--profiles">
        <legend>¿Cuál es tu objetivo principal?</legend>
        <div className="choices">
          {PERFILES.map((p) => (
            <label className={`choice ${busca === p.id ? "is-selected" : ""}`} key={p.id}>
              <input
                type="radio"
                name="busca"
                value={p.id}
                checked={busca === p.id}
                onChange={() => setBusca(p.id)}
              />
              <strong>{p.label}</strong>
              {!compact ? <small>{p.sub}</small> : null}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="row2">
        <div className="field">
          <label htmlFor={`${idPrefix}-nombre`}>Nombre completo</label>
          <input
            id={`${idPrefix}-nombre`}
            name="nombre"
            type="text"
            autoComplete="name"
            placeholder="Ej. Carlos Mendoza"
            required
            aria-invalid={!!errores.nombre}
            aria-describedby={errores.nombre ? `${idPrefix}-e-nombre` : undefined}
          />
          {errores.nombre ? (
            <span className="field__err" id={`${idPrefix}-e-nombre`}>
              {errores.nombre}
            </span>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-celular`}>Celular / WhatsApp</label>
          <div className="phone-input-wrap">
            <span className="phone-prefix" aria-hidden="true">
              🇵🇪 +51
            </span>
            <input
              id={`${idPrefix}-celular`}
              name="celular"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="987 654 321"
              required
              aria-invalid={!!errores.celular}
              aria-describedby={errores.celular ? `${idPrefix}-e-celular` : undefined}
            />
          </div>
          {errores.celular ? (
            <span className="field__err" id={`${idPrefix}-e-celular`}>
              {errores.celular}
            </span>
          ) : null}
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor={`${idPrefix}-ciudad`}>Ciudad de residencia</label>
          <select id={`${idPrefix}-ciudad`} name="ciudad" defaultValue="Chiclayo">
            {CIUDADES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-lote`}>Lote de interés (opcional)</label>
          <input
            id={`${idPrefix}-lote`}
            name="lote"
            type="text"
            placeholder="Ej. G18, C3, F11"
            value={lote}
            onChange={(e) => setLote(e.target.value.toUpperCase().slice(0, 4))}
          />
        </div>
      </div>

      <label className="check">
        <input type="checkbox" checked={visita} onChange={(e) => setVisita(e.target.checked)} />
        <span>Deseo agendar una visita guiada al terreno (o recorrido por videollamada)</span>
      </label>
      {visita ? (
        <div className="field">
          <label htmlFor={`${idPrefix}-dia`}>Día preferido para la visita</label>
          <select id={`${idPrefix}-dia`} name="dia" defaultValue="Sábado">
            <option>Sábado por la mañana</option>
            <option>Domingo por la mañana</option>
            <option>Entre semana</option>
            <option>Videollamada desde mi ciudad</option>
          </select>
        </div>
      ) : null}

      <label className="check">
        <input
          type="checkbox"
          name="consentimiento"
          defaultChecked
          required
          aria-invalid={!!errores.consentimiento}
          aria-describedby={errores.consentimiento ? `${idPrefix}-e-cons` : undefined}
        />
        <span>Autorizo a Rosso Inmobiliaria a enviarme la cotización y contactarme por WhatsApp o llamada.</span>
      </label>
      {errores.consentimiento ? (
        <span className="field__err" id={`${idPrefix}-e-cons`}>
          {errores.consentimiento}
        </span>
      ) : null}

      {estado.t === "error" ? (
        <div className="status status--warn" role="alert">
          <p>{estado.msg}</p>
        </div>
      ) : null}
      {estado.t === "sin-destino" ? (
        <div className="status status--warn" role="alert">
          <p>
            El formulario aún no está conectado a nuestro CRM en este entorno, así que tus datos no se enviaron.
            Explora los lotes en el Masterplan interactivo y comparte tu ficha directamente.
          </p>
        </div>
      ) : null}

      <button className="btn btn--primary form__submit" type="submit" disabled={estado.t === "enviando"}>
        <Icon name="sparkles" size={18} />
        {estado.t === "enviando"
          ? "Enviando solicitud…"
          : visita
            ? "Agendar visita y recibir plano"
            : lote
              ? `Solicitar cotización del Lote ${lote}`
              : "Recibir plano y precios oficiales"}
      </button>
    </form>
  );
}
