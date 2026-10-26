"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/motion";

// El explorador (132 lotes en SVG + ficha + simulador) es lo más pesado de hidratar. Va justo
// después de la portada, pero se monta cuando el visitante se acerca, o de inmediato si llega con
// un enlace a un lote (?lote=, ?vista= o #lotes). Así la carga queda libre para el hero.
const LotStack = dynamic(() => import("./LotStack").then((m) => m.LotStack), { ssr: false, loading: () => <Reserva /> });

function Reserva() {
  return (
    <div className="lots-placeholder" aria-hidden="true">
      <span>Cargando el plano de lotes…</span>
    </div>
  );
}

/** `origen`: "promocion" en la landing de /promocion, para que la ficha completa del lote vuelva allí. */
export function LazyLotStack({ origen }: { origen?: string } = {}) {
  const host = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(t);
  }, [mounted]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.has("lote") || q.has("vista") || window.location.hash === "#lotes") {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setMounted(true);
      },
      { rootMargin: "600px 0px" },
    );
    if (host.current) io.observe(host.current);
    // Un enlace interno a #lotes (menú, botones) también lo monta antes de llegar.
    const onHash = () => { if (window.location.hash === "#lotes") setMounted(true); };
    window.addEventListener("hashchange", onHash);
    return () => {
      io.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  return (
    <div ref={host}>
      {mounted ? <LotStack origen={origen} /> : <Reserva />}
      <noscript>
        <p className="lot-notice">El plano interactivo necesita JavaScript. Revisa la tabla de precios más abajo o pide el plano a un asesor.</p>
      </noscript>
    </div>
  );
}
