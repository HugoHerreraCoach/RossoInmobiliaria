"use client";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { CUOTAS, MANZANAS, m2, precioDe, soles, type CambioLote, type Estado, type Lote } from "@/content/lotes";

// Estados de los lotes (docs/0032): el administrador marca un lote como disponible, reservado o vendido y la web lo
// muestra así en la próxima visita. Un lote sin precio en la lista pide su precio para publicarse como disponible.
type Fila = Lote & { lista: Estado; precioLista: boolean; cambio: CambioLote | null };
type Form = { estado: Estado; porM2: string; inicial: string; promo: string; conPrecio: boolean };
const ESTADOS: Record<Estado, string> = { disponible: "Disponible", reservado: "Reservado", vendido: "Vendido" };
const numero = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(",", ".")));

export function LotesPanel() {
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [error, setError] = useState(""), [aviso, setAviso] = useState(""), [busy, setBusy] = useState(false);
  const [mz, setMz] = useState("TODAS"), [filtro, setFiltro] = useState<"todos" | Estado | "cambiados">("todos"), [buscar, setBuscar] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null), [form, setForm] = useState<Form | null>(null);

  const cargar = useCallback(async () => {
    try {
      const r = await fetch("/api/panel/lotes", { cache: "no-store" });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error || "No se pudieron cargar los lotes.");
      setFilas(b.lotes);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo conectar."); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  const visibles = useMemo(() => (filas ?? []).filter((f) =>
    (mz === "TODAS" || f.manzana === mz) &&
    (filtro === "todos" || (filtro === "cambiados" ? !!f.cambio : f.estado === filtro)) &&
    (!buscar.trim() || f.id.toLowerCase().includes(buscar.trim().toLowerCase()))), [filas, mz, filtro, buscar]);
  const cuenta = (e: Estado) => (filas ?? []).filter((f) => f.estado === e).length;

  const abrir = (f: Fila) => {
    const p = f.cambio?.precio ?? (f.precio ? { porM2: f.precio.porM2, inicial: f.precio.inicial, promoContado: f.precio.promoContado } : null);
    setAbierto(f.id); setError(""); setAviso("");
    setForm({ estado: f.estado, porM2: p ? String(p.porM2) : "", inicial: p ? String(p.inicial) : "", promo: p?.promoContado ? String(p.promoContado) : "", conPrecio: !!f.cambio?.precio });
  };
  const fila = filas?.find((f) => f.id === abierto) ?? null;
  // Pide precio si se publica disponible un lote que la lista no trae con precio, o si el admin decide cambiarlo.
  const pidePrecio = !!(fila && form && form.estado === "disponible" && (!fila.precioLista || form.conPrecio));
  const previa = fila && form && pidePrecio && numero(form.porM2) > 0 && numero(form.inicial) >= 0
    ? precioDe(fila.m2, { porM2: numero(form.porM2), inicial: numero(form.inicial), promoContado: numero(form.promo) > 0 ? numero(form.promo) : null })
    : null;

  const enviar = async (cuerpo: Record<string, unknown>, mensaje: string) => {
    setBusy(true); setError(""); setAviso("");
    try {
      const r = await fetch("/api/panel/lotes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error || "No se pudo guardar.");
      setFilas(b.lotes); setAbierto(null); setForm(null); setAviso(mensaje);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar."); } finally { setBusy(false); }
  };
  const guardar = () => {
    if (!fila || !form) return;
    const precio = pidePrecio ? { porM2: numero(form.porM2), inicial: numero(form.inicial), promoContado: numero(form.promo) > 0 ? numero(form.promo) : null } : null;
    void enviar({ id: fila.id, estado: form.estado, precio }, `Lote ${fila.id}: ${ESTADOS[form.estado].toLowerCase()}. Las landings lo muestran así desde la próxima visita.`);
  };

  return <section className="panel-card" id="lotes">
    <div className="panel-card__heading"><div><span className="panel-eyebrow">Disponibilidad en la web</span><h2>Lotes</h2></div>
      <span className="panel-badge">{cuenta("disponible")} disponibles · {cuenta("reservado")} reservados · {cuenta("vendido")} vendidos</span></div>
    <p className="panel-note">Cambia el estado de un lote y las dos landings y su página lo muestran así en la próxima visita. Si un lote vendido vuelve a estar disponible y no tenía precio en la lista del 21/08, escribe su precio: la cuota ({CUOTAS} meses) y el contado (15 % menos) se calculan como en la lista.</p>
    <div className="panel-filters lots-filters">
      <label>Manzana<select value={mz} onChange={(e) => setMz(e.target.value)}><option value="TODAS">Todas</option>{MANZANAS.map((m) => <option key={m} value={m}>Manzana {m}</option>)}</select></label>
      <label>Estado<select value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}><option value="todos">Todos</option><option value="disponible">Disponibles</option><option value="reservado">Reservados</option><option value="vendido">Vendidos</option><option value="cambiados">Cambiados desde la lista</option></select></label>
      <label>Lote<input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Ej. G18" aria-label="Buscar lote"/></label>
    </div>
    {error ? <p role="alert" className="panel-error">{error}</p> : null}
    {aviso ? <p role="status" className="lots-ok">{aviso}</p> : null}
    {!filas ? <p className="panel-note">Cargando lotes…</p> : <div className="panel-table-wrap"><table className="lots-table">
      <thead><tr><th scope="col">Lote</th><th scope="col">Área</th><th scope="col">Estado</th><th scope="col">En la lista</th><th scope="col">Cuota ({CUOTAS})</th><th scope="col"><span className="sr-only">Acción</span></th></tr></thead>
      <tbody>{visibles.map((f) => <Fragment key={f.id}>
        <tr className={f.cambio ? "is-changed" : ""}>
          <td><b>{f.id}</b><small>Manzana {f.manzana}</small></td>
          <td>{m2(f.m2)}</td>
          <td><span className={`lots-state lots-state--${f.estado}`}>{ESTADOS[f.estado]}</span>{f.cambio ? <small>Cambiado en el panel</small> : null}</td>
          <td>{ESTADOS[f.lista]}</td>
          <td>{f.precio ? soles(f.precio.cuota) : "—"}</td>
          <td><button className="panel-outline" onClick={() => (abierto === f.id ? (setAbierto(null), setForm(null)) : abrir(f))} aria-expanded={abierto === f.id}>{abierto === f.id ? "Cerrar" : "Cambiar"}</button></td>
        </tr>
        {abierto === f.id && form ? <tr className="lots-edit-row"><td colSpan={6}><div className="lots-edit">
          <fieldset><legend>Estado del lote {f.id}</legend>{(Object.keys(ESTADOS) as Estado[]).map((e) => <label key={e} className="lots-choice"><input type="radio" name={`estado-${f.id}`} checked={form.estado === e} onChange={() => setForm({ ...form, estado: e })}/>{ESTADOS[e]}</label>)}</fieldset>
          {form.estado === "disponible" && f.precioLista ? <label className="lots-check"><input type="checkbox" checked={form.conPrecio} onChange={(e) => setForm({ ...form, conPrecio: e.target.checked })}/> Cambiar el precio de la lista</label> : null}
          {pidePrecio ? <div className="lots-price">
            {!f.precioLista ? <p className="panel-note">Este lote no tiene precio en la lista: escríbelo para publicarlo como disponible.</p> : null}
            <label>Precio por m² (S/)<input inputMode="decimal" value={form.porM2} onChange={(e) => setForm({ ...form, porM2: e.target.value })} placeholder="42"/></label>
            <label>Inicial (S/)<input inputMode="decimal" value={form.inicial} onChange={(e) => setForm({ ...form, inicial: e.target.value })} placeholder="3000"/></label>
            <label>Promoción al contado (S/, opcional)<input inputMode="decimal" value={form.promo} onChange={(e) => setForm({ ...form, promo: e.target.value })} placeholder="—"/></label>
            {previa ? <p className="lots-preview">Financiado {soles(previa.financiado)} · {CUOTAS} cuotas de {soles(previa.cuota)} · contado {soles(previa.contado)}{previa.promoContado ? ` · promoción ${soles(previa.promoContado)}` : ""}</p> : null}
          </div> : null}
          <div className="lots-actions">
            <button className="panel-primary" disabled={busy} onClick={guardar}>{busy ? "Guardando…" : "Guardar"}</button>
            {f.cambio ? <button className="panel-outline" disabled={busy} onClick={() => void enviar({ id: f.id, restaurar: true }, `Lote ${f.id}: vuelve a la lista (${ESTADOS[f.lista].toLowerCase()}).`)}>Volver al estado de la lista</button> : null}
          </div>
        </div></td></tr> : null}
      </Fragment>)}</tbody>
    </table></div>}
  </section>;
}
