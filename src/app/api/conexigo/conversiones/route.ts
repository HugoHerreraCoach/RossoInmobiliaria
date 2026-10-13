import { after } from "next/server";
import { randomUUID } from "node:crypto";
import { Intent, TrackingEvent, UUID, isObject } from "@/lib/tracking/schema";
import { ConfirmResult, db, deliveriesFor } from "@/server/store";
import { drain } from "@/server/delivery";
import { failure, hash, HttpError, json, readText, signatureValid } from "@/server/security";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    if (!process.env.CONEXIGO_EMPRESA_ID || !process.env.CONEXIGO_WEBHOOK_SECRET || process.env.CONEXIGO_WEBHOOK_SECRET.length < 32) throw new HttpError(503, "Configura empresa y secreto de ConexiGO.");
    const raw = await readText(req, 8192); if (!signatureValid(raw, req.headers.get("x-conexigo-firma"))) throw new HttpError(401, "Firma inválida.");
    let b: unknown; try { b = JSON.parse(raw); } catch { throw new HttpError(400, "JSON inválido."); }
    if (!isObject(b)) throw new HttpError(400, "Cuerpo inválido.");
    if (typeof b.ts !== "number" || !Number.isFinite(b.ts) || Math.abs(Date.now()/1000-b.ts)>300) throw new HttpError(401, "Timestamp vencido.");
    if (b.empresa_id !== process.env.CONEXIGO_EMPRESA_ID) throw new HttpError(403, "Empresa no autorizada.");
    if (typeof b.conversion_id !== "string" || !UUID.test(b.conversion_id)) throw new HttpError(400, "conversion_id inválido.");
    const contact = typeof b.contacto_id === "string" && /^[\w-]{1,120}$/.test(b.contacto_id) ? b.contacto_id : null;
    const phone = typeof b.telefono_huella === "string" && /^[a-f0-9]{64}$/i.test(b.telefono_huella) ? b.telefono_huella.toLowerCase() : null;
    if (!contact && !phone) throw new HttpError(422, "Envía siempre una identidad estable: contacto_id o telefono_huella.");
    if (b.intencion_id != null && (typeof b.intencion_id !== "string" || !UUID.test(b.intencion_id))) throw new HttpError(400, "intencion_id inválido.");
    const code = typeof b.codigo === "string" ? b.codigo.trim().toUpperCase() : null;
    if (code && !/^R-[A-F0-9]{16}$/.test(code)) throw new HttpError(400, "Código de otra landing o inválido.");
    const time = typeof b.recibido_en === "string" ? Date.parse(b.recibido_en) : NaN;
    if (!Number.isFinite(time) || time>Date.now()+60000 || time<Date.now()-90*86400000) throw new HttpError(400, "recibido_en inválido.");
    const adPhone = typeof b.telefono_sha256 === "string" && /^[a-f0-9]{64}$/i.test(b.telefono_sha256) ? b.telefono_sha256.toLowerCase() : undefined;
    const intent = await db<Intent|null>("lookup", { id: b.intencion_id || null, code });
    // Unknown refs stay unattributed; never infer identity from a name, time window or nearby click.
    const event: TrackingEvent = intent ? { ...intent.event, id: randomUUID(), name: "lead_confirmed", at: new Date(time).toISOString(), marketing: intent.event.marketing && !intent.revoked } : {
      id: randomUUID(), name: "lead_confirmed", visitor_id: null, session_id: null, path: "/", at: new Date(time).toISOString(), device: "unknown", attribution: { first: { source: "crm-unattributed" }, last: { source: "crm-unattributed" } }, properties: {}, marketing: false,
    };
    const result = await db<ConfirmResult>("confirm", { id: b.conversion_id, contact_key: hash(`contact:${b.empresa_id}:${contact ? `id:${contact}` : `phone:${phone}`}`), event, deliveries: deliveriesFor(event, intent?.matching || {}, adPhone) });
    after(async () => { try { await drain(4); } catch { /* durable jobs remain for the scheduler */ } });
    return json({ ok: true, proyectada: true, idempotente: result.idempotent, evento_id: result.event_id, atribuida: result.attributed });
  } catch(e) { return failure(e); }
}
