/** Shared contract. Do not add form values, URLs with query strings or free-text messages. */
export const PUBLIC_EVENTS = ["page_view", "section_view", "scroll_depth", "engagement", "cta_click", "form_start", "form_error", "lot_view", "lot_filter", "simulator_change", "gallery_view", "video_play", "share_lot"] as const;
export type PublicEventName = typeof PUBLIC_EVENTS[number];
export type EventName = PublicEventName | "whatsapp_click" | "form_submit" | "lead_confirmed";
export const LABELS: Record<EventName, string> = {
  page_view: "Página visitada", section_view: "Sección vista", scroll_depth: "Profundidad de lectura", engagement: "Tiempo activo",
  cta_click: "Clic en botón", form_start: "Formulario iniciado", form_error: "Error de formulario", lot_view: "Lote consultado",
  lot_filter: "Filtro de lotes", simulator_change: "Simulación de cuotas", gallery_view: "Fotografía vista", video_play: "Video reproducido",
  share_lot: "Compartir lote", whatsapp_click: "Abrió WhatsApp", form_submit: "Solicitud recibida por CRM", lead_confirmed: "Mensaje confirmado por ConexiGO",
};
export const SOURCES: Record<string, string> = {
  "header-contact": "Menú · visita", "hero-lots": "Portada · ver lotes", "hero-gallery": "Portada · video",
  "hero-form": "Formulario de portada", "contacto-form": "Formulario de contacto", "contact-whatsapp": "Contacto · WhatsApp",
  "lot-whatsapp": "Ficha de lote · WhatsApp", "lot-contact": "Ficha de lote · consultar", "mobile-contact": "Barra móvil · contacto",
  "mobile-lots": "Barra móvil · lotes", "navigation": "Navegación", "other-whatsapp": "Otro enlace de WhatsApp",
  "float-contact": "Botón flotante · asesor",
  "promocion-form": "Formulario de promoción (Lima)",
  "decision-whatsapp": "Por qué · WhatsApp", "obra-whatsapp": "Obra · videollamada", "footer-whatsapp": "Pie de página · WhatsApp",
  "map-form": "Plano · consultar este lote", "map-detail": "Plano · ver detalle del lote",
  "chat-form": "Chat del asesor", "promocion-chat": "Chat del asesor (Lima)",
};
export type Consent = { analytics: boolean; marketing: boolean; version: "2026-10-13" };
export type Touch = { source: string; medium?: string; campaign?: string; content?: string; term?: string; campaign_id?: string; adset_id?: string; ad_id?: string; referrer?: string; landing?: string };
export type Attribution = { first: Touch; last: Touch };
export type Matching = { fbp?: string; fbc?: string; ttclid?: string; ttp?: string };
export type Props = { source?: string; section?: string; lot?: string; depth?: number; seconds?: number; initial?: number; months?: number; mode?: string; slide?: number; error?: string };
export type TrackingEvent = { id: string; name: EventName; visitor_id: string | null; session_id: string | null; path: string; at: string; device: string; attribution: Attribution; properties: Props; marketing: boolean };
export type ClientContext = { session_id: string; path: string; device: string; attribution: Attribution; matching: Matching };
export type Intent = { id: string; code: string; kind: "whatsapp" | "form"; event: TrackingEvent; matching: Matching; created_at: string; revoked?: boolean };
export type Delivery = { id: string; provider: "meta" | "tiktok"; event: TrackingEvent; matching: Matching; phone_hash?: string; status: "pending" | "processing" | "sent" | "failed" | "disabled"; attempts: number; next_at: string; lease?: string; locked_at?: string; last_error?: string; sent_at?: string };
export type PanelSnapshot = { events: TrackingEvent[]; deliveries: Pick<Delivery, "id" | "provider" | "status" | "attempts" | "last_error" | "sent_at">[]; total: number; truncated: boolean };
export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const safeText = (v: unknown, n = 100) => typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").slice(0, n) : "";
export function safePath(v: unknown) { const p = safeText(v, 100).split(/[?#]/)[0]; return /^\/(?:lote\/[A-H]\d{1,2}|promocion)?\/?$/i.test(p) ? p : "/"; }
export function normalizeTouch(v: unknown): Touch {
  if (!isObject(v)) return { source: "direct" };
  const source=safeText(v.source,60);
  const touch: Touch = { source: source && !source.includes("@") && !/^\+?\d{9,15}$/.test(source) ? source : "direct" };
  for (const k of ["medium", "campaign", "content", "term", "campaign_id", "adset_id", "ad_id"] as const) {
    const x = safeText(v[k]); if (x && !x.includes("@") && !/^\+?\d{9,15}$/.test(x)) touch[k] = x;
  }
  // Campaign/ad IDs may be numeric; unlike user data they are explicit advertising identifiers.
  for (const k of ["campaign_id", "adset_id", "ad_id"] as const) { const x = safeText(v[k], 80); if (/^[\w-]{1,80}$/.test(x)) touch[k] = x; }
  if (typeof v.referrer === "string" && /^[\w.-]{1,150}$/.test(v.referrer)) touch.referrer = v.referrer;
  touch.landing = safePath(v.landing);
  return touch;
}
export function normalizeAttribution(v: unknown): Attribution { return isObject(v) ? { first: normalizeTouch(v.first), last: normalizeTouch(v.last) } : { first: { source: "direct" }, last: { source: "direct" } }; }
export function normalizeMatching(v: unknown): Matching {
  const out: Matching = {}; if (!isObject(v)) return out;
  for (const k of ["fbp", "fbc", "ttclid", "ttp"] as const) { const x = v[k]; if (typeof x === "string" && /^[A-Za-z0-9_.:-]{1,300}$/.test(x)) out[k] = x; }
  return out;
}
export function normalizeProps(v: unknown): Props {
  const out: Props = {}; if (!isObject(v)) return out;
  if (typeof v.source === "string" && Object.hasOwn(SOURCES, v.source)) out.source = v.source;
  if (typeof v.section === "string" && /^(inicio|proyecto|galeria|areas|lotes|avance|pagar|ubicacion|contacto)$/.test(v.section)) out.section = v.section;
  if (typeof v.lot === "string" && /^[A-H]\d{1,2}$/.test(v.lot)) out.lot = v.lot;
  if (typeof v.depth === "number" && [25, 50, 75, 100].includes(v.depth)) out.depth = v.depth;
  for (const [k, max] of [["seconds", 60], ["initial", 1000000], ["months", 60], ["slide", 20]] as const) if (typeof v[k] === "number" && Number.isFinite(v[k])) out[k] = Math.min(max, Math.max(0, Math.round(v[k] as number)));
  if (typeof v.mode === "string" && ["financiado", "contado", "mapa", "cuadricula", "area", "cuota", "estado", "manzana", "precio"].includes(v.mode)) out.mode = v.mode;
  if (typeof v.error === "string" && ["validation", "unconfigured", "network", "crm"].includes(v.error)) out.error = v.error;
  return out;
}
export function normalizeContext(v: unknown): ClientContext | null {
  if (!isObject(v) || typeof v.session_id !== "string" || !UUID.test(v.session_id)) return null;
  return { session_id: v.session_id, path: safePath(v.path), device: ["mobile", "tablet", "desktop"].includes(String(v.device)) ? String(v.device) : "unknown", attribution: normalizeAttribution(v.attribution), matching: normalizeMatching(v.matching) };
}
export function normalizePublicEvent(v: unknown, visitor: string, marketing: boolean, now = Date.now()): TrackingEvent | null {
  if (!isObject(v) || typeof v.id !== "string" || !UUID.test(v.id) || !PUBLIC_EVENTS.includes(v.name as PublicEventName)) return null;
  const c = normalizeContext(v); if (!c) return null;
  const t = typeof v.at === "string" ? Date.parse(v.at) : NaN;
  // The browser cannot insert a conversion or an arbitrary historical timestamp.
  const at = Number.isFinite(t) && t <= now + 60000 && t >= now - 86400000 ? new Date(t).toISOString() : new Date(now).toISOString();
  return { id: v.id, name: v.name as PublicEventName, visitor_id: visitor, session_id: c.session_id, path: c.path, at, device: c.device, attribution: c.attribution, properties: normalizeProps(v.properties), marketing };
}
