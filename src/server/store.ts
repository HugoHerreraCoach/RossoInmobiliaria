/** Production: an atomic Postgres RPC over Supabase REST. File mode is local development ONLY. */
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Delivery, Intent, PanelSnapshot, TrackingEvent } from "@/lib/tracking/schema";
import { hash, HttpError } from "./security";

type Row = { kind: string; id: string; data: Record<string, unknown>; created: string };
type State = { rows: Row[] };
let fileQueue: Promise<unknown> = Promise.resolve();
export function storageMode() { return process.env.TRACKING_STORAGE === "file" && process.env.NODE_ENV !== "production" ? "file" : "supabase"; }
export function siteId() { const id = process.env.TRACKING_SITE_ID || "rosso-la-campina"; if (!/^[a-z0-9-]{3,80}$/.test(id)) throw new HttpError(503, "TRACKING_SITE_ID inválido."); return id; }
export async function db<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
  if (storageMode() === "file") {
    const run = fileQueue.then(() => localOperation(action, data)); fileQueue = run.catch(() => undefined); return run as Promise<T>;
  }
  const root = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!root || !key || !/^https:\/\//.test(root)) throw new HttpError(503, "Configura SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y ejecuta db/schema.sql.");
  const response = await fetch(`${root.replace(/\/$/, "")}/rest/v1/rpc/rosso_tracking`, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
    headers: { "content-type": "application/json", apikey: key, ...(key.startsWith("sb_secret_") ? {} : { authorization: `Bearer ${key}` }) },
    body: JSON.stringify({ p_site: siteId(), p_action: action, p_data: data }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (error?.code === "P0001" && ["Intent owner mismatch", "References mismatch"].includes(error.message)) throw new HttpError(409, "Las referencias no coinciden o pertenecen a otra sesión.");
    throw new HttpError(503, `Base de rastros no disponible (HTTP ${response.status}). Revisa db/schema.sql y las variables privadas.`);
  }
  return response.json() as Promise<T>;
}
export async function rateLimit(req: Request, scope: string, max = 120, seconds = 60) {
  // Trust the IP header set by the hosting proxy. Never retain the raw IP.
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local").slice(0, 100);
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const ok = await db<boolean>("rate", { key: hash(`${scope}|${ip}|${bucket}`), max, expires: new Date((bucket + 2) * seconds * 1000).toISOString() });
  if (!ok) throw new HttpError(429, "Demasiadas solicitudes. Inténtalo de nuevo más tarde.");
}
export function newDelivery(event: TrackingEvent, provider: Delivery["provider"], matching = {}, phoneHash?: string): Delivery {
  return { id: `${event.id}:${provider}`, provider, event, matching, ...(phoneHash ? { phone_hash: phoneHash } : {}), status: "pending", attempts: 0, next_at: new Date().toISOString() };
}
export function deliveriesFor(event: TrackingEvent, matching = {}, phoneHash?: string): Delivery[] {
  // CAPI is the sole sender of confirmed Lead. Browser sends PageView/ViewContent only.
  if (!event.marketing || event.name !== "lead_confirmed") return [];
  return (process.env.CONVERSION_SENDER || "landing") === "landing" ? [newDelivery(event, "meta", matching, phoneHash), newDelivery(event, "tiktok", matching, phoneHash)] : [];
}
export type ConfirmResult = { ok: true; idempotent: boolean; event_id: string; attributed: boolean };

async function localOperation(action: string, d: Record<string, unknown>) {
  const filename = path.join(process.env.TRACKING_LOCAL_DIR || path.join(process.cwd(), ".data"), `${siteId()}.json`);
  let state: State; try { state = JSON.parse(await readFile(filename, "utf8")) as State; } catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; state = { rows: [] }; }
  const now = new Date().toISOString(); const rows = state.rows;
  const get = (kind: string, id: string) => rows.find(r => r.kind === kind && r.id === id);
  const put = (kind: string, id: string, data: unknown) => { if (get(kind, id)) return false; rows.push({ kind, id, data: data as Record<string, unknown>, created: now }); return true; };
  let result: unknown; let dirty = true;
  switch (action) {
    case "form_claim": { const r=get("form_operation",String(d.id));
      if (r && r.data.fingerprint !== d.fingerprint) { result={ state:"conflict" }; break; }
      if (r?.data.status === "ok") { result={ state:"done", result:r.data.result }; break; }
      if (r?.data.status === "processing" && Date.parse(String(r.data.locked_at)) > Date.now()-60000) { result={ state:"busy" }; break; }
      const value={fingerprint:d.fingerprint,status:"processing",lease:randomUUID(),locked_at:now};
      if(r)r.data=value;else put("form_operation",String(d.id),value);result={state:"acquired",lease:value.lease};break;
    }
    case "form_finish": { const r=get("form_operation",String(d.id));if(r && r.data.lease===d.lease){r.data={...r.data,status:d.ok?"ok":"failed",result:d.result};if(d.ok&&d.event){const e=d.event as TrackingEvent;put("event",e.id,e);}}result=true;break; }
    case "rate": { const id = String(d.key), r = get("rate", id); if (r) r.data.hits = Number(r.data.hits) + 1; else put("rate", id, { hits: 1, expires: d.expires }); result = Number(get("rate", id)!.data.hits) <= Number(d.max); break; }
    case "events": { const accepted: string[] = []; for (const event of d.events as TrackingEvent[]) { if (get("revoked", String(event.visitor_id))) continue; if (put("event", event.id, event)) accepted.push(event.id); } result = { accepted }; break; }
    case "intent": { const intent = d.intent as Intent; if (get("revoked", String(intent.event.visitor_id))) { result = null; break; } const prior = get("intent", intent.id); if (prior && prior.data.event && (prior.data.event as TrackingEvent).visitor_id !== intent.event.visitor_id) throw new HttpError(409, "Identificador en uso."); put("intent", intent.id, intent); result = get("intent", intent.id)!.data; break; }
    case "lookup": { const byId = d.id ? get("intent", String(d.id)) : undefined; const byCode = d.code ? rows.find(r => r.kind === "intent" && r.data.code === d.code) : undefined; if (d.id && d.code && (!byId || !byCode || byId.id !== byCode.id)) throw new HttpError(409, "Las referencias no coinciden."); result = (byId || byCode)?.data || null; dirty = false; break; }
    case "confirm": {
      const prior = get("conversion", String(d.id)) || rows.find(r => r.kind === "conversion" && r.data.contact_key === d.contact_key);
      if (prior) { result = { ok: true, idempotent: true, event_id: prior.data.event_id, attributed: prior.data.attributed }; break; }
      const event = d.event as TrackingEvent; const revoked = get("revoked", String(event.visitor_id)); if (revoked) event.marketing = false;
      put("conversion", String(d.id), { contact_key: d.contact_key, event_id: event.id, attributed: !!event.session_id });
      put("event", event.id, event);
      if (!revoked) for (const delivery of d.deliveries as Delivery[]) put("delivery", delivery.id, delivery);
      result = { ok: true, idempotent: false, event_id: event.id, attributed: !!event.session_id }; break;
    }
    case "snapshot": {
      const from = String(d.from), to = String(d.to); const all = rows.filter(r => r.kind === "event" && String(r.data.at) >= from && String(r.data.at) < to).sort((a, b) => String(b.data.at).localeCompare(String(a.data.at)));
      const events = all.slice(0, 20000).map(r => r.data as unknown as TrackingEvent);
      const deliveries = rows.filter(r => r.kind === "delivery" && r.created >= from && r.created < to).sort((a, b) => b.created.localeCompare(a.created)).slice(0, 200).map(({ data: x }) => ({ id: x.id, provider: x.provider, status: x.status, attempts: x.attempts, last_error: x.last_error, sent_at: x.sent_at }));
      result = { events, deliveries, total: all.length, truncated: all.length > 20000 } satisfies Omit<PanelSnapshot, "deliveries"> & { deliveries: unknown }; dirty = false; break;
    }
    case "claim": { const limit = Math.min(Number(d.limit) || 5, 20); const selected = rows.filter(r => r.kind === "delivery" && ((r.data.status === "pending" && String(r.data.next_at) <= now) || (r.data.status === "processing" && Date.parse(String(r.data.locked_at)) < Date.now() - 120000))).sort((a,b) => a.created.localeCompare(b.created)).slice(0, limit); for (const r of selected) { r.data.status = "processing"; r.data.lease = randomUUID(); r.data.locked_at = now; r.data.attempts = Number(r.data.attempts) + 1; } result = selected.map(r => r.data); break; }
    case "delivery_check": { const r=get("delivery",String(d.id)); result=!!r && r.data.status==="processing" && r.data.lease===d.lease && !get("revoked",String((r.data.event as TrackingEvent).visitor_id)); dirty=false; break; }
    case "finish": { const r = get("delivery", String(d.id)); if (r?.data.lease === d.lease && r?.data.status === "processing") r.data = { ...r.data, ...(d.patch as object) }; result = true; break; }
    case "retry": { let n = 0; for (const r of rows) if (r.kind === "delivery" && ["failed", "disabled"].includes(String(r.data.status)) && r.data.last_error !== "consent-revoked") { r.data.status = "pending"; r.data.next_at = now; r.data.attempts = 0; n++; } result = n; break; }
    case "revoke": { const visitor = String(d.visitor_id); put("revoked", visitor, {}); for (const r of rows) { if (r.kind === "intent" && (r.data.event as TrackingEvent).visitor_id === visitor) { r.data.revoked = true; r.data.matching = {}; (r.data.event as TrackingEvent).marketing = false; } if (r.kind === "delivery" && (r.data.event as TrackingEvent).visitor_id === visitor && r.data.status !== "sent") { r.data.status = "disabled"; r.data.last_error = "consent-revoked"; r.data.matching = {}; } } result = true; break; }
    case "prune": { const cutoff = new Date(Date.now() - 90 * 86400000).toISOString(); state.rows = rows.filter(r => !(r.kind === "rate" && String(r.data.expires) < now) && !(["event", "intent", "delivery", "form_operation"].includes(r.kind) && r.created < cutoff)); result = rows.length - state.rows.length; break; }
    default: throw new Error("Unknown storage operation");
  }
  if (dirty) { await mkdir(path.dirname(filename), { recursive: true }); const temp = `${filename}.${randomUUID()}.tmp`; await writeFile(temp, JSON.stringify(state), { mode: 0o600 }); await rename(temp, filename); }
  return result;
}
