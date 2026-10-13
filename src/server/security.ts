import { createHmac, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { Consent, isObject } from "@/lib/tracking/schema";
export const PANEL_COOKIE = "rosso_panel";
export const TRACK_COOKIE = "rosso_measurement";
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function secret() { const s = process.env.APP_SECRET; if (!s || s.length < 32) throw new HttpError(503, "Configura APP_SECRET (al menos 32 caracteres aleatorios)."); return s; }
export function hash(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
export function constantEqual(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
export function sign(value: object) { const raw = Buffer.from(JSON.stringify(value)).toString("base64url"); return `${raw}.${hash(raw)}`; }
export function verify(token?: string): Record<string, unknown> | null {
  try { if (!token || token.length > 2048) return null; const [raw, sig, extra] = token.split("."); if (extra || !sig || !constantEqual(hash(raw), sig)) return null; const d: unknown = JSON.parse(Buffer.from(raw, "base64url").toString()); return isObject(d) && typeof d.exp === "number" && d.exp > Date.now() ? d : null; } catch { return null; }
}
export function cookie(req: Request, name: string) { const item = req.headers.get("cookie")?.split(";").map(s => s.trim()).find(s => s.startsWith(`${name}=`)); return item?.slice(name.length + 1); }
export function cookieHeader(name: string, value: string, age: number) { return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`; }
export type Visitor = { visitor_id: string; analytics: true; marketing: boolean; version: Consent["version"]; exp: number };
export function getVisitor(req: Request): Visitor | null { const d = verify(cookie(req, TRACK_COOKIE)); return d?.kind === "measurement" && d.analytics === true && typeof d.visitor_id === "string" ? d as Visitor : null; }
export function newVisitor(marketing: boolean, prior?: Visitor | null) { return { kind: "measurement", visitor_id: prior?.visitor_id ?? randomUUID(), analytics: true as const, marketing, version: "2026-10-13" as const, exp: prior?.exp ?? Date.now() + 90 * 86400000 }; }
export function authorized(req: Request) { const d = verify(cookie(req, PANEL_COOKIE)); return d?.kind === "panel" && d.version === hash(process.env.PANEL_PASSWORD_HASH ?? "unconfigured"); }
export function requirePanel(req: Request) { if (!authorized(req)) throw new HttpError(401, "Inicia sesión para acceder al panel."); }
export function passwordValid(password: unknown) {
  const value = process.env.PANEL_PASSWORD_HASH || ""; const [kind, salt, expected] = value.split(":");
  if (kind !== "scrypt" || !/^[a-f0-9]{32}$/.test(salt || "") || !/^[a-f0-9]{128}$/.test(expected || "")) throw new HttpError(503, "Configura PANEL_PASSWORD_HASH con npm run panel:password.");
  if (typeof password !== "string" || password.length < 12 || password.length > 256) return false;
  return constantEqual(scryptSync(password, salt, 64).toString("hex"), expected);
}
export function requireOrigin(req: Request) {
  const origin = req.headers.get("origin"); const configured = process.env.NEXT_PUBLIC_SITE_URL;
  let expected: string; try { expected = new URL(configured || req.url).origin; } catch { throw new HttpError(503, "Dominio sin configurar."); }
  if (process.env.NODE_ENV === "production" && (!configured || !expected.startsWith("https://"))) throw new HttpError(503, "Configura el dominio HTTPS de producción.");
  if (origin !== expected || req.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "Origen no permitido.");
}
export async function readText(req: Request, max = 16384) {
  if (Number(req.headers.get("content-length") || 0) > max) throw new HttpError(413, "Solicitud demasiado grande.");
  const reader = req.body?.getReader(); if (!reader) return ""; const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > max) { await reader.cancel(); throw new HttpError(413, "Solicitud demasiado grande."); } chunks.push(value); } } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString("utf8");
}
export async function readJson(req: Request, max = 16384): Promise<Record<string, unknown>> {
  const text = await readText(req, max); let data: unknown; try { data = JSON.parse(text); } catch { throw new HttpError(400, "JSON inválido."); }
  if (!isObject(data)) throw new HttpError(400, "Cuerpo inválido."); return data;
}
export function json(data: unknown, status = 200, extra?: Record<string, string>) { return Response.json(data, { status, headers: { "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff", ...extra } }); }
export function failure(e: unknown) { return e instanceof HttpError ? json({ ok: false, error: e.message }, e.status) : json({ ok: false, error: "No se pudo completar la operación. Revisa la configuración del servidor." }, 503); }
export function signatureValid(raw: string, signature: string | null) {
  return [process.env.CONEXIGO_WEBHOOK_SECRET, process.env.CONEXIGO_WEBHOOK_SECRET_ANTERIOR].filter((s): s is string => !!s && s.length >= 32).some(s => constantEqual(signature ?? "", `sha256=${createHmac("sha256", s).update(raw).digest("hex")}`));
}
