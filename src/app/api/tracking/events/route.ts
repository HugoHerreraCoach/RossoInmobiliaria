import { normalizePublicEvent } from "@/lib/tracking/schema";
import { db, rateLimit } from "@/server/store";
import { failure, getVisitor, HttpError, json, readJson, requireOrigin } from "@/server/security";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    requireOrigin(req); const visitor = getVisitor(req); if (!visitor) throw new HttpError(403, "Medición no autorizada.");
    await rateLimit(req, "events", 120); const b = await readJson(req, 32768);
    if (!Array.isArray(b.events) || !b.events.length || b.events.length > 20) throw new HttpError(400, "Lote de eventos inválido.");
    const events = b.events.map(v => normalizePublicEvent(v, visitor.visitor_id, visitor.marketing));
    if (events.some(e => !e)) throw new HttpError(400, "Evento no admitido. Las conversiones solo las confirma el CRM.");
    return json(await db("events", { events }));
  } catch(e) { return failure(e); }
}
