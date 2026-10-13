import { Intent, normalizeContext, normalizeProps, Props, UUID } from "@/lib/tracking/schema";
import { db } from "./store";
import { getVisitor, hash, HttpError } from "./security";
export async function createIntent(req: Request, input: unknown, kind: Intent["kind"], id: string, properties: Props): Promise<Intent | null> {
  const visitor = getVisitor(req); const context = normalizeContext(input);
  if (!visitor || !context) return null;
  if (!UUID.test(id)) throw new HttpError(400, "Identificador inválido.");
  const now = new Date().toISOString();
  const intent: Intent = { id, code: `R-${hash(`intent:${id}`).slice(0, 16).toUpperCase()}`, kind, created_at: now,
    event: { id, name: kind === "whatsapp" ? "whatsapp_click" : "form_submit", visitor_id: visitor.visitor_id, session_id: context.session_id, path: context.path, at: now, device: context.device, attribution: context.attribution, properties: normalizeProps(properties), marketing: visitor.marketing && req.headers.get("sec-gpc") !== "1" },
    matching: visitor.marketing ? context.matching : {},
  };
  return db<Intent | null>("intent", { intent });
}
