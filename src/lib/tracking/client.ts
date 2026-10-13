"use client";
import { Attribution, ClientContext, Consent, EventName, Matching, Props, PublicEventName, normalizeAttribution, normalizeMatching, safePath } from "./schema";
type StoredConsent = Consent & { at: number };
type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[][]; push?: Fbq; loaded?: boolean; version?: string };
type Ttq = unknown[] & Record<string, unknown> & { page: (...args: unknown[]) => void; track: (...args: unknown[]) => void; revokeConsent: () => void; grantConsent: () => void };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq; ttq?: Ttq; TiktokAnalyticsObject?: string; } }
const CONSENT = "rosso.consent.v1", ATTR = "rosso.attribution.v1", SESSION = "rosso.session.v1", MATCH = "rosso.matching.v1";
let consent: StoredConsent | null = null, active = false, visitor = "", queue: Record<string, unknown>[] = [], inFlight = false;
let memorySession: { id: string; at: number } | null = null;
const localMemory = new Map<string,string>(), sessionMemory = new Map<string,string>();
function storage(kind: "localStorage" | "sessionStorage"): Storage {
  try { return window[kind]; } catch {
    const mem=kind==="localStorage"?localMemory:sessionMemory;
    return {get length(){return mem.size;},clear:()=>mem.clear(),getItem:k=>mem.get(k)??null,key:i=>[...mem.keys()][i]??null,removeItem:k=>{mem.delete(k);},setItem:(k,v)=>{mem.set(k,v);}};
  }
}
const read = <T,>(storage: Storage, key: string): T | null => { try { return JSON.parse(storage.getItem(key) || "null") as T | null; } catch { return null; } };
const write = (storage: Storage, key: string, v: unknown) => { try { storage.setItem(key, JSON.stringify(v)); } catch { /* private browsing still works in memory */ } };
export function getConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try { const c = read<StoredConsent>(storage("localStorage"), CONSENT); return c?.version === "2026-10-13" && typeof c.at === "number" && Date.now() - c.at < 90*86400000 ? c : null; } catch { return null; }
}
export function globalPrivacyControl() { return typeof navigator !== "undefined" && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true; }
export async function setConsent(analytics: boolean, marketing: boolean, restore = false) {
  const previous = consent || getConsent(); consent = { analytics, marketing: analytics && marketing, version: "2026-10-13", at: restore && previous ? previous.at : Date.now() };
  active = false; queue = []; window.fbq?.("consent", "revoke"); window.ttq?.revokeConsent?.();
  write(storage("localStorage"), CONSENT, consent);
  if (!analytics || !consent.marketing) { try { storage("localStorage").removeItem(MATCH); } catch {} }
  if (!analytics) { try { storage("localStorage").removeItem(ATTR); storage("sessionStorage").removeItem(SESSION); } catch {} memorySession = null; }
  const response = await fetch("/api/tracking/consent", { method:"POST", credentials:"same-origin", headers:{"content-type":"application/json"}, body:JSON.stringify(consent), signal:AbortSignal.timeout(8000) });
  const result = await response.json(); if (!response.ok) throw new Error(result.error || "No se pudo guardar la preferencia.");
  if (analytics) { visitor = result.visitor_id; consent.marketing = result.marketing === true; active = true; initAttribution(); if (consent.marketing) loadPixels(); }
  // An already-loaded third-party script cannot be unloaded safely. A hard reload removes it on withdrawal.
  if (previous?.marketing && !consent.marketing) window.location.reload();
  return consent;
}
export async function initAutoTracking() {
  if (typeof window === "undefined") return null;
  consent = { analytics: true, marketing: true, version: "2026-10-13", at: Date.now() };
  write(storage("localStorage"), CONSENT, consent);
  active = true;
  initAttribution();
  loadPixels();
  try {
    const response = await fetch("/api/tracking/consent", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(consent),
      signal: AbortSignal.timeout(8000),
    });
    const result = await response.json();
    if (response.ok && result.visitor_id) {
      visitor = result.visitor_id;
      consent.marketing = result.marketing === true;
      if (consent.marketing) loadPixels();
    }
  } catch (err) {
    console.warn("Tracking server sync notice:", err);
  }
  return consent;
}
export function stopTracking() { active = false; queue = []; }
function getSession() {
  let s = memorySession; try { s = read<typeof memorySession>(storage("sessionStorage"), SESSION) || s; } catch {}
  if (!s || Date.now()-s.at > 30*60000) s = { id:crypto.randomUUID(), at:Date.now() };
  s.at = Date.now(); memorySession = s; write(storage("sessionStorage"),SESSION,s); return s.id;
}
function initAttribution() {
  const q = new URLSearchParams(window.location.search); let referrer = ""; try { referrer = new URL(document.referrer).hostname; } catch {}
  const isExternal = referrer && referrer !== location.hostname;
  const source = q.get("utm_source") || (q.has("fbclid") ? "meta" : q.has("ttclid") ? "tiktok" : q.has("gclid") ? "google" : isExternal ? referrer : "direct");
  const touch = { source, medium:q.get("utm_medium"), campaign:q.get("utm_campaign"), content:q.get("utm_content"), term:q.get("utm_term"), campaign_id:q.get("campaign_id"), adset_id:q.get("adset_id"), ad_id:q.get("ad_id"), referrer:isExternal?referrer:undefined, landing:safePath(location.pathname) };
  const old = read<{ first: unknown; last: unknown; at: number }>(storage("localStorage"),ATTR);
  const valid = old && Date.now()-old.at < 90*86400000;
  const newTouch = q.has("utm_source") || q.has("fbclid") || q.has("ttclid") || q.has("gclid") || isExternal;
  const a = normalizeAttribution({ first:valid?old.first:touch, last:newTouch||!valid?touch:old.last });
  write(storage("localStorage"),ATTR,{...a,at:valid?old.at:Date.now()});
  if (consent?.marketing) {
    const saved = read<{ values: Matching; at: number }>(storage("localStorage"),MATCH); const values = saved && Date.now()-saved.at<90*86400000 ? saved.values : {};
    if (q.get("ttclid")) values.ttclid = q.get("ttclid")!;
    if (q.get("fbclid") && !values.fbc?.endsWith(`.${q.get("fbclid")}`)) values.fbc = `fb.1.${Date.now()}.${q.get("fbclid")}`;
    write(storage("localStorage"),MATCH,{values:normalizeMatching(values),at:Date.now()});
  }
}
const browserCookie = (name: string) => document.cookie.split(";").map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1);
export function trackingContext(): ClientContext | null {
  if (!active || !consent?.analytics) return null;
  const stored = read<Attribution>(storage("localStorage"),ATTR); const saved=read<{values:Matching}>(storage("localStorage"),MATCH);
  return { session_id:getSession(), path:safePath(location.pathname), device:innerWidth<768?"mobile":innerWidth<1100?"tablet":"desktop", attribution:normalizeAttribution(stored),
    matching:consent.marketing ? normalizeMatching({...saved?.values,fbp:browserCookie("_fbp"),fbc:browserCookie("_fbc")||saved?.values.fbc,ttp:browserCookie("_ttp")}) : {} };
}
export function track(name: PublicEventName, properties: Props = {}) {
  const c = trackingContext(); if (!c) return null; const id=crypto.randomUUID();
  queue.push({ ...c, matching:undefined, id,name,at:new Date().toISOString(),properties }); if(queue.length>100) queue.shift();
  pixelEvent(name,id,properties); if(queue.length>=10) void flush(); return id;
}
export async function flush(final=false) {
  if (!active || !queue.length || inFlight) return; const batch=queue.splice(0,20);
  if(final && navigator.sendBeacon) { const queued=navigator.sendBeacon("/api/tracking/events",new Blob([JSON.stringify({events:batch})],{type:"application/json"})); if(queued) return; }
  inFlight=true;
  try { const r=await fetch("/api/tracking/events",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({events:batch}),keepalive:true,signal:AbortSignal.timeout(7000)}); if(!r.ok && r.status!==400 && r.status!==403 && active) queue.unshift(...batch); }
  catch { if(active) queue.unshift(...batch); }
  finally { queue=queue.slice(-100);inFlight=false; }
}
export function pixelEvent(name: EventName, id: string, p: Props={}) {
  if (!active || !consent?.marketing || name==="lead_confirmed") return; // Lead is server-only.
  if(name==="page_view") { window.fbq?.("track","PageView",{}, {eventID:id}); window.ttq?.page?.(); }
  if(name==="lot_view") { const props={content_ids:[p.lot],content_type:"product",content_name:`Lote ${p.lot}`};window.fbq?.("track","ViewContent",props,{eventID:id});window.ttq?.track?.("ViewContent",{contents:[{content_id:p.lot,content_type:"product"}]},{event_id:id}); }
  // Intentions are CUSTOM events, never Lead / SubmitForm / Schedule.
  if(name==="whatsapp_click" || name==="form_submit") { const label=name==="whatsapp_click"?"WhatsAppClick":"FormSubmitted";window.fbq?.("trackCustom",label,{source:p.source||"",lot:p.lot||""},{eventID:id}); window.ttq?.track?.(label,{source:p.source||""},{event_id:id}); }
}
function loadPixels() {
  const meta=process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if(meta && /^\d+$/.test(meta) && !document.getElementById("rosso-meta-pixel")) {
    const f=((...args:unknown[])=>{ if(f.callMethod)f.callMethod(...args);else f.queue.push(args);}) as Fbq; f.queue=[];f.push=f;f.loaded=true;f.version="2.0";window.fbq=f;window._fbq=f;
    f("consent","grant");f("set","autoConfig",false,meta);f("init",meta);
    const script=document.createElement("script");script.id="rosso-meta-pixel";script.async=true;script.src="https://connect.facebook.net/en_US/fbevents.js";document.head.append(script);
  } else if(meta) window.fbq?.("consent","grant");
  const tiktok=process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();
  if(tiktok && /^[A-Za-z0-9]{5,40}$/.test(tiktok) && !document.getElementById("rosso-tiktok-pixel")) {
    const t=[] as unknown as Ttq; window.TiktokAnalyticsObject="ttq";window.ttq=t;
    const methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
    const defer=(obj:unknown[],name:string)=>{(obj as unknown as Record<string,unknown>)[name]=(...args:unknown[])=>obj.push([name,...args]);};
    methods.forEach(name=>defer(t,name));t.methods=methods;t.setAndDefer=defer;t.instance=(id:string)=>{const instances=t._i as Record<string,unknown[]>;const obj=instances[id]||[];methods.forEach(name=>defer(obj,name));return obj;};t._i={[tiktok]:[]};t._t={[tiktok]:Date.now()};t._o={[tiktok]:{}};
    (t._i as Record<string,unknown[]>)[tiktok] = [];
    ((t._i as Record<string,unknown[]>)[tiktok] as unknown as Record<string,unknown>)._u="https://analytics.tiktok.com/i18n/pixel/events.js";
    const script=document.createElement("script");script.id="rosso-tiktok-pixel";script.async=true;t.grantConsent();script.src=`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(tiktok)}&lib=ttq`;document.head.append(script);
  } else if(tiktok) window.ttq?.grantConsent?.();
}
export async function trackedWhatsApp(link: HTMLAnchorElement, properties: Props) {
  const context=trackingContext(); if(!context) return false;
  // Keep browser user activation: opening happens synchronously, before the network request.
  const tab=window.open("about:blank","_blank"); if(tab) tab.opener=null;
  let target=link.href;
  try { const id=crypto.randomUUID(); const r=await fetch("/api/tracking/intent",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,context,properties}),signal:AbortSignal.timeout(3500)});const data=await r.json();if(r.ok && /^R-[A-F0-9]{16}$/.test(data.code)){const url=new URL(target);url.searchParams.set("text",`${url.searchParams.get("text")||"Hola, quiero conocer La Campiña."}\nRef: ${data.code}`);target=url.toString();pixelEvent("whatsapp_click",data.id,properties);} }
  catch { /* Contact remains available even if analytics fails. */ }
  if(tab) tab.location.href=target;else window.location.assign(target); void flush(true); return true;
}
