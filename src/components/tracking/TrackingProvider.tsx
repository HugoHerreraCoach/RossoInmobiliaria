"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Props, SOURCES } from "@/lib/tracking/schema";
import { flush, initAutoTracking, stopTracking, track, trackedWhatsApp, trackingContext } from "@/lib/tracking/client";

export function TrackingProvider() {
  const measuredPage = useRef("");
  const path = usePathname();
  const excluded = path.startsWith("/panel") || path.startsWith("/privacidad");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (excluded) { stopTracking(); return; }
    let alive = true;
    void initAutoTracking().then(() => {
      if (alive) setReady(true);
    });
    return () => { alive = false; };
  }, [excluded]);

  useEffect(() => {
    if (!ready || excluded) return;
    const pageKey = `${path}|${trackingContext()?.session_id}`;
    if (measuredPage.current !== pageKey) {
      measuredPage.current = pageKey;
      track("page_view");
      if (/^\/lote\/[A-H]\d{1,2}$/.test(path)) {
        track("lot_view", { lot: path.split("/").pop() });
      }
    }
    let lastActivity = Date.now(), lastTick = Date.now();
    const depth = new Set<number>();
    const seen = new Set<string>();
    const forms = new WeakSet<Element>();

    const activity = () => { lastActivity = Date.now(); };
    const click = (event: MouseEvent) => {
      activity();
      const el = (event.target as Element)?.closest?.("a,button");
      if (!el) return;
      const raw = el.getAttribute("data-track") || "navigation";
      const source = Object.hasOwn(SOURCES, raw) ? raw : "navigation";
      const properties: Props = { source };
      const lot = el.getAttribute("data-lot");
      if (lot) properties.lot = lot;
      if (el instanceof HTMLAnchorElement && /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(el.href)) {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (trackingContext()) {
          event.preventDefault();
          void trackedWhatsApp(el, { ...properties, source: source === "navigation" ? "other-whatsapp" : source });
        }
        return;
      }
      if (el.matches("a[href^='#'],[data-track]")) track("cta_click", properties);
    };

    const focus = (event: FocusEvent) => {
      const f = (event.target as Element)?.closest?.("form[data-track-form]");
      if (f && !forms.has(f)) {
        forms.add(f);
        track("form_start", { source: f.getAttribute("data-track-form") || "hero-form" });
      }
    };

    const scroll = () => {
      activity();
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max <= 0) return;
      const p = Math.min(100, Math.round((scrollY / max) * 100));
      [25, 50, 75, 100].forEach(n => {
        if (p >= n && !depth.has(n)) {
          depth.add(n);
          track("scroll_depth", { depth: n });
        }
      });
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !seen.has(e.target.id)) {
          seen.add(e.target.id);
          track("section_view", { section: e.target.id });
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll("main section[id]").forEach(el => observer.observe(el));

    const timer = setInterval(() => {
      const now = Date.now();
      const seconds = Math.min(15, Math.floor((now - lastTick) / 1000));
      lastTick = now;
      if (document.visibilityState === "visible" && now - lastActivity < 60000 && seconds > 0) {
        track("engagement", { seconds });
      }
      void flush();
    }, 15000);

    const flushTimer = setInterval(() => void flush(), 4000);
    const leaving = () => void flush(true);
    const visibility = () => {
      lastTick = Date.now();
      if (document.hidden) leaving();
    };

    document.addEventListener("click", click, true);
    document.addEventListener("focusin", focus);
    document.addEventListener("keydown", activity);
    window.addEventListener("pointerdown", activity, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pagehide", leaving);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      void flush(true);
      observer.disconnect();
      clearInterval(timer);
      clearInterval(flushTimer);
      document.removeEventListener("click", click, true);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("keydown", activity);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pagehide", leaving);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [ready, excluded, path]);

  return null;
}

