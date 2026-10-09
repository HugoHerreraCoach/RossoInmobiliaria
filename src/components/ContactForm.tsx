"use client";

import { useEffect, useState } from "react";
import { loteById } from "@/content/lotes";

type Estado =
  | { t: "idle" }
  | { t: "enviando" }
  | { t: "ok" }
  | { t: "error"; msg: string }
  | { t: "sin-destino" };

const CIUDADES = ["Chiclayo", "José Leonardo Ortiz", "Lima", "Trujillo", "Piura", "Otra ciudad"];

export function ContactForm() {
  const [estado, setEstado] = useState<Estado>({ t: "idle" });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [lote, setLote] = useState("");
  const [visita, setVisita] = useState(false);

  // El lote elegido en la pila llega aquí.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lote");
    if (q && loteById(q)) setLote(q.toUpperCase());
    const on = (e: Event) => setLote((e as CustomEvent<string>).detail);
    window.addEventListener("campina:lote", on);
    return () => window.removeEventListener("campina:lote", on);
  }, []);

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const datos = {
      nombre: f.get("nombre"),
      celular: f.get("celular"),
      ciudad: f.get("ciudad"),
      busca: f.get("busca") ?? "",
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
        <p>
          <b>¡Listo!</b> Un asesor te escribirá a tu celular{lote ? ` con la información del lote ${lote}` : ""}.
        </p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={enviar} noValidate>
      <div className="row2">
        <div className="field">
          <label htmlFor="f-nombre">Tu nombre</label>
          <input
            id="f-nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
            aria-invalid={!!errores.nombre}
            aria-describedby={errores.nombre ? "e-nombre" : undefined}
          />
          {errores.nombre ? (
            <span className="field__err" id="e-nombre">
              {errores.nombre}
            </span>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="f-celular">Celular</label>
          <input
            id="f-celular"
            name="celular"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="987 654 321"
            required
            aria-invalid={!!errores.celular}
            aria-describedby={errores.celular ? "e-celular" : undefined}
          />
          {errores.celular ? (
            <span className="field__err" id="e-celular">
              {errores.celular}
            </span>
          ) : null}
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="f-ciudad">¿Dónde vives?</label>
          <select id="f-ciudad" name="ciudad" defaultValue="Chiclayo">
            {CIUDADES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-lote">Lote que te interesa</label>
          <input
            id="f-lote"
            name="lote"
            type="text"
            placeholder="Ej. C12 (opcional)"
            value={lote}
            onChange={(e) => setLote(e.target.value.toUpperCase().slice(0, 4))}
          />
        </div>
      </div>

      <fieldset className="field">
        <legend>¿Para qué lo quieres?</legend>
        <div className="choices">
          {["Invertir", "Para mi familia", "Aún no lo sé"].map((b) => (
            <label className="choice" key={b}>
              <input type="radio" name="busca" value={b} />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="check">
        <input type="checkbox" checked={visita} onChange={(e) => setVisita(e.target.checked)} />
        <span>Quiero visitar el proyecto con un asesor</span>
      </label>
      {visita ? (
        <div className="field">
          <label htmlFor="f-dia">¿Qué día te acomoda?</label>
          <select id="f-dia" name="dia" defaultValue="Sábado">
            <option>Sábado</option>
            <option>Domingo</option>
            <option>Entre semana</option>
          </select>
        </div>
      ) : null}

      <label className="check">
        <input
          type="checkbox"
          name="consentimiento"
          required
          aria-invalid={!!errores.consentimiento}
          aria-describedby={errores.consentimiento ? "e-cons" : undefined}
        />
        <span>Autorizo a Rosso Inmobiliaria a contactarme por llamada o WhatsApp sobre La Campiña.</span>
      </label>
      {errores.consentimiento ? (
        <span className="field__err" id="e-cons">
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
            El formulario aún no está conectado a nuestro sistema, así que tus datos no se enviaron. Muy pronto
            podrás dejarlos aquí.
          </p>
        </div>
      ) : null}

      <button className="btn btn--primary" type="submit" disabled={estado.t === "enviando"}>
        {estado.t === "enviando" ? "Enviando…" : visita ? "Pedir mi visita" : "Quiero que me llamen"}
      </button>
    </form>
  );
}
