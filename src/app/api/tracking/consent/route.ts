import { db } from "@/server/store";
import { cookieHeader, failure, getVisitor, json, newVisitor, readJson, requireOrigin, secret, sign, TRACK_COOKIE } from "@/server/security";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    requireOrigin(req); secret(); const b = await readJson(req, 1024); const previous = getVisitor(req);
    const analytics = b.analytics === true; const marketing = analytics && b.marketing === true;
    if (previous && (!analytics || (!marketing && previous.marketing))) await db("revoke", { visitor_id: previous.visitor_id });
    if (!analytics) return json({ ok: true, analytics: false, marketing: false }, 200, { "Set-Cookie": cookieHeader(TRACK_COOKIE, "", 0) });
    // Re-consent after withdrawal starts a new identity; it never revives old advertising jobs.
    const visitor = newVisitor(marketing, previous && previous.marketing === marketing ? previous : null);
    return json({ ok: true, visitor_id: visitor.visitor_id, analytics: true, marketing }, 200, { "Set-Cookie": cookieHeader(TRACK_COOKIE, sign(visitor), Math.max(0, Math.floor((visitor.exp-Date.now())/1000))) });
  } catch(e) { return failure(e); }
}
