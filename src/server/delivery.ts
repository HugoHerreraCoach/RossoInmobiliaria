import { createHash } from "node:crypto";
import { Delivery } from "@/lib/tracking/schema";
import { db } from "./store";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
export function providerConfig() {
  return {
    meta: { pixel: !!process.env.NEXT_PUBLIC_META_PIXEL_ID, server: !!(process.env.NEXT_PUBLIC_META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN && /^v\d+\.\d+$/.test(process.env.META_GRAPH_VERSION || "")) },
    tiktok: { pixel: !!process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID, server: !!(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID && process.env.TIKTOK_EVENTS_ACCESS_TOKEN) },
    sender: process.env.CONVERSION_SENDER || "landing", crm: !!(process.env.CONEXIGO_EMPRESA_ID && process.env.CONEXIGO_WEBHOOK_SECRET), form: !!process.env.LEAD_WEBHOOK_URL,
  };
}
export function payloadFor(job: Delivery) {
  const { event: e, matching: m } = job; const source = new URL(e.path, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString();
  const external = e.visitor_id ? sha(e.visitor_id) : undefined;
  if (job.provider === "meta") {
    const id = process.env.NEXT_PUBLIC_META_PIXEL_ID || ""; const version = process.env.META_GRAPH_VERSION || "";
    if (!/^\d+$/.test(id) || !/^v\d+\.\d+$/.test(version) || !process.env.META_CAPI_ACCESS_TOKEN) return null;
    return { url: `https://graph.facebook.com/${version}/${id}/events`, headers: { authorization: `Bearer ${process.env.META_CAPI_ACCESS_TOKEN}` }, body: {
      data: [{ event_name: "Lead", event_id: e.id, event_time: Math.floor(Date.parse(e.at) / 1000), action_source: "chat", event_source_url: source,
        user_data: { ...(external ? { external_id: [external] } : {}), ...(job.phone_hash ? { ph: [job.phone_hash] } : {}), ...(m.fbp ? { fbp: m.fbp } : {}), ...(m.fbc ? { fbc: m.fbc } : {}) },
        custom_data: { content_name: "La Campiña · mensaje recibido", ...(e.properties.lot ? { content_ids: [e.properties.lot] } : {}) } }],
      ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
    } };
  }
  const id = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || ""; if (!/^[A-Za-z0-9]{5,40}$/.test(id) || !process.env.TIKTOK_EVENTS_ACCESS_TOKEN) return null;
  return { url: "https://business-api.tiktok.com/open_api/v1.3/event/track/", headers: { "Access-Token": process.env.TIKTOK_EVENTS_ACCESS_TOKEN }, body: {
    event_source: "web", event_source_id: id, data: [{ event: "Lead", event_id: e.id, event_time: Math.floor(Date.parse(e.at) / 1000),
      user: { ...(external ? { external_id: external } : {}), ...(job.phone_hash ? { phone: job.phone_hash } : {}), ...(m.ttclid ? { ttclid: m.ttclid } : {}), ...(m.ttp ? { ttp: m.ttp } : {}) },
      page: { url: source }, properties: { content_name: "La Campiña · mensaje recibido" } }],
    ...(process.env.TIKTOK_TEST_EVENT_CODE ? { test_event_code: process.env.TIKTOK_TEST_EVENT_CODE } : {}),
  } };
}
export async function drain(limit = 5) {
  const jobs = await db<Delivery[]>("claim", { limit }); let sent = 0;
  await Promise.all(jobs.map(async job => {
    // Re-check a claimed job immediately before sending; consent withdrawal may have cancelled it.
    if (!await db<boolean>("delivery_check", { id: job.id, lease: job.lease })) return;
    let patch: Record<string, unknown>;
    const payload = payloadFor(job);
    if (!payload) patch = { status: "disabled", last_error: "missing-provider-config" };
    else if (Date.now() - Date.parse(job.event.at) > 7 * 86400000) patch = { status: "failed", last_error: "event-older-than-seven-days" };
    else {
      try {
        const headers = new Headers({"content-type":"application/json"});
        for (const [key,value] of Object.entries(payload.headers)) if(value) headers.set(key,value);
        const response = await fetch(payload.url, { method: "POST", redirect: "error", signal: AbortSignal.timeout(7000), headers, body: JSON.stringify(payload.body) });
        const data = await response.json().catch(() => ({}));
        const accepted = response.ok && (job.provider === "meta" ? data.events_received === 1 : data.code === 0);
        if (!accepted) throw new Error(`upstream-${response.status}-${typeof data.code === "number" ? data.code : "unconfirmed"}`);
        sent++; patch = { status: "sent", sent_at: new Date().toISOString(), last_error: null };
      } catch (e) { patch = { status: job.attempts >= 6 ? "failed" : "pending", next_at: new Date(Date.now() + Math.min(3600, 30 * 2 ** job.attempts) * 1000).toISOString(), last_error: e instanceof Error && /^upstream-/.test(e.message) ? e.message.slice(0,80) : "network-or-timeout" }; }
    }
    await db("finish", { id: job.id, lease: job.lease, patch });
  }));
  return { processed: jobs.length, sent };
}
