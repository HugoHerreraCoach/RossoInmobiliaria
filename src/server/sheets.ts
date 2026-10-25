import { createSign } from "node:crypto";
import type { Landing, LandingId } from "@/content/landings";

/* Hoja de cálculo de leads (Google Sheets), igual que en DLC (docs/0013). /api/lead agrega una fila por registro y
   responde ok SOLO cuando Google confirma la fila; recién entonces el navegador envía CompleteRegistration a los
   píxeles, con el id del envío como id del evento (columna «TikTok Lead ID»).

   Acceso con una cuenta de servicio de Google Cloud (API de Google Sheets activada y la hoja compartida con su
   correo como Editor):
     GOOGLE_SHEETS_ID            id de la hoja (lo que va entre /d/ y /edit en el enlace)
     GOOGLE_SHEETS_CLIENT_EMAIL  `client_email` del JSON de la cuenta de servicio
     GOOGLE_SHEETS_PRIVATE_KEY   `private_key` del mismo JSON (vale con los \n escritos)
     GOOGLE_SHEETS_HOJA          pestaña fija; si falta, «LEADS META» para tráfico de Meta y «LEADS TIKTOK» para el resto
   Sin librerías: el token sale de un JWT firmado (RS256) contra oauth2.googleapis.com. */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TIMEOUT_MS = 8000;
export const SHEET_META = "LEADS META";
export const SHEET_TIKTOK = "LEADS TIKTOK";

export type SheetConfig = { id: string; sheet: string; email: string; key: string };

/** null si falta alguna variable: sin otro destino, el formulario responde 503 y no inventa un éxito.
 *  La landing de /promocion (Lima, docs/0017) escribe en OTRO archivo: GOOGLE_SHEETS_ID_PROMOCION (y su pestaña
 *  fija opcional GOOGLE_SHEETS_HOJA_PROMOCION), con la misma cuenta de servicio. Nunca cae en la hoja de Lambayeque. */
export function sheetConfig(source?: string, landing: LandingId = "lambayeque"): SheetConfig | null {
  const promo = landing !== "lambayeque";
  const id = (promo ? process.env.GOOGLE_SHEETS_ID_PROMOCION : process.env.GOOGLE_SHEETS_ID)?.trim(), email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
  // Vercel y los .env suelen guardar la clave con "\n" literales y a veces entre comillas.
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");
  if (!id || !email || !key) return null;
  const hoja = (promo ? process.env.GOOGLE_SHEETS_HOJA_PROMOCION : process.env.GOOGLE_SHEETS_HOJA)?.trim();
  return { id, email, key, sheet: hoja || (source === "meta" ? SHEET_META : SHEET_TIKTOK) };
}

/** Fuente de la visita para la hoja, con los mismos valores que DLC. */
export function sheetSource(touch?: string): "meta" | "tiktok" | "google" | "otro" | "directo" {
  const s = (touch || "").toLowerCase();
  if (!s || s === "direct") return "directo";
  if (/facebook|instagram|meta|^fb$|^ig$/.test(s)) return "meta";
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("google")) return "google";
  return "otro";
}

/** Encabezados de la fila 1. A–L son los de la hoja de DLC (formato de los formularios instantáneos de TikTok);
 *  M es de Rosso. «TikTok Lead ID» lleva el id del envío de la landing. */
export const COLUMNS = ["NOMBRE DE CAMPAÑA", "FECHA", "NOMBRE", "NUMERO", "INICIAL", "TIEMPO DE COMPRA", "TikTok Lead ID", "TikTok Lead Status", "Lead creation time", "Lead update time", "ORIGEN", "FUENTE", "LOTE"] as const;

export type SheetLead = { id: string; date: Date; nombre: string; celular: string; inicial: string; campaign: string | null; origin: string; source: string; lote: string };

/** «987654321» o «+51987654321» → «+51 987 654 321», como los escribe TikTok. Otros países quedan como «+<dígitos>». */
export function sheetPhone(celular: string) {
  const d = celular.replace(/\D/g, ""), pe = /^9\d{8}$/.test(d) ? d : /^519\d{8}$/.test(d) ? d.slice(2) : null;
  return pe ? `+51 ${pe.slice(0, 3)} ${pe.slice(3, 6)} ${pe.slice(6)}` : `+${d}`;
}

/** Encabezados de la hoja de una landing distinta de Lambayeque: A–D de DLC, una columna por pregunta del
 *  formulario (src/content/landings.ts) y luego las de DLC desde «TikTok Lead ID». Lambayeque sigue con COLUMNS. */
export function landingColumns(landing: Landing): string[] {
  return ["NOMBRE DE CAMPAÑA", "FECHA", "NOMBRE", "NUMERO", ...landing.preguntas.map((p) => p.columna), "TikTok Lead ID", "TikTok Lead Status", "Lead creation time", "Lead update time", "ORIGEN", "FUENTE", "LOTE"];
}

export function landingRow(landing: Landing, l: Omit<SheetLead, "inicial">, respuestas: Record<string, string>): (string | number)[] {
  const unix = Math.floor(l.date.getTime() / 1000);
  return [l.campaign ?? "", unix, l.nombre, sheetPhone(l.celular), ...landing.preguntas.map((p) => respuestas[p.id] ?? ""), l.id, "", unix, "", l.origin, l.source, l.lote];
}

export function leadRow(l: SheetLead): (string | number)[] {
  const unix = Math.floor(l.date.getTime() / 1000);
  const values: Record<(typeof COLUMNS)[number], string | number> = {
    "NOMBRE DE CAMPAÑA": l.campaign ?? "", FECHA: unix, NOMBRE: l.nombre, NUMERO: sheetPhone(l.celular), INICIAL: l.inicial,
    "TIEMPO DE COMPRA": "", "TikTok Lead ID": l.id, "TikTok Lead Status": "", "Lead creation time": unix, "Lead update time": "",
    ORIGEN: l.origin, FUENTE: l.source, LOTE: l.lote,
  };
  return COLUMNS.map((c) => values[c]);
}

let token: { email: string; value: string; expires: number } | null = null;
const b64url = (text: string) => Buffer.from(text).toString("base64url");

async function accessToken(c: SheetConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (token && token.email === c.email && token.expires - 60 > now) return token.value;
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: c.email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const signature = createSign("RSA-SHA256").update(`${head}.${claims}`).sign(c.key, "base64url");
  const res = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS),
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claims}.${signature}` }) });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!res.ok || !body.access_token) throw new Error(`token de Google: ${body.error_description ?? body.error ?? `HTTP ${res.status}`}`);
  token = { email: c.email, value: body.access_token, expires: now + (body.expires_in ?? 3600) };
  return token.value;
}

/** Agrega la fila al final de la pestaña y devuelve el rango escrito. Lanza si Google no confirma UNA fila.
 *  RAW: lo que escribe el visitante nunca se interpreta como fórmula. */
export async function appendRow(c: SheetConfig, row: (string | number)[]): Promise<string> {
  const range = encodeURIComponent(`'${c.sheet.replace(/'/g, "''")}'!A1`);
  const res = await fetch(`${SHEETS_API}/${encodeURIComponent(c.id)}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST", headers: { Authorization: `Bearer ${await accessToken(c)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }), cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  const body = (await res.json().catch(() => ({}))) as { updates?: { updatedRange?: string; updatedRows?: number }; error?: { message?: string } };
  if (res.status === 401) token = null; // token revocado o vencido: el próximo envío pide otro
  if (!res.ok) throw new Error(`Google Sheets: ${body.error?.message ?? `HTTP ${res.status}`}`);
  if (body.updates?.updatedRows !== 1 || !body.updates.updatedRange) throw new Error("Google Sheets no confirmó la fila");
  return body.updates.updatedRange;
}
