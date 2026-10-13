import { UUID, normalizeProps } from "@/lib/tracking/schema";
import { createIntent } from "@/server/intents";
import { db, rateLimit } from "@/server/store";
import { failure, HttpError, json, readJson, requireOrigin } from "@/server/security";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    requireOrigin(req); await rateLimit(req, "intent", 30); const b = await readJson(req, 8192);
    if (typeof b.id !== "string" || !UUID.test(b.id)) throw new HttpError(400, "Identificador inválido.");
    const intent = await createIntent(req, b.context, "whatsapp", b.id, normalizeProps(b.properties));
    if (!intent) throw new HttpError(403, "Medición no autorizada.");
    await db("events", { events: [intent.event] });
    return json({ ok: true, code: intent.code, id: intent.id });
  } catch(e) { return failure(e); }
}
