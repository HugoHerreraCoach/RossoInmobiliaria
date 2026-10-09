import { NextResponse } from "next/server";

// Recibe el formulario y lo reenvía al CRM.
// Configurar en Vercel: LEAD_WEBHOOK_URL (y opcionalmente LEAD_WEBHOOK_TOKEN).
// Sin destino configurado responde 503: el formulario lo dice con claridad en vez de fingir un envío.

type Lead = {
  nombre: string;
  celular: string;
  ciudad: string;
  busca: string;
  lote: string;
  visita: boolean;
  dia: string;
  consentimiento: boolean;
};

const limpiar = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "formato" }, { status: 400 });
  }

  const lead: Lead = {
    nombre: limpiar(body.nombre),
    celular: limpiar(body.celular, 20).replace(/[^\d+]/g, ""),
    ciudad: limpiar(body.ciudad, 40),
    busca: limpiar(body.busca, 40),
    lote: limpiar(body.lote, 8).toUpperCase(),
    visita: body.visita === true,
    dia: limpiar(body.dia, 40),
    consentimiento: body.consentimiento === true,
  };

  const errores: Record<string, string> = {};
  if (lead.nombre.length < 2) errores.nombre = "Escribe tu nombre.";
  if (!/^\+?\d{9,15}$/.test(lead.celular)) errores.celular = "Revisa el número: deben ser al menos 9 dígitos.";
  if (!lead.consentimiento) errores.consentimiento = "Necesitamos tu autorización para llamarte o escribirte.";
  if (Object.keys(errores).length) return NextResponse.json({ error: "validacion", errores }, { status: 422 });

  const destino = process.env.LEAD_WEBHOOK_URL;
  if (!destino) return NextResponse.json({ error: "sin-destino" }, { status: 503 });

  try {
    const r = await fetch(destino, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.LEAD_WEBHOOK_TOKEN ? { authorization: `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        ...lead,
        proyecto: "La Campiña",
        origen: "web",
        fecha: new Date().toISOString(),
        url: req.headers.get("referer") ?? null,
      }),
    });
    if (!r.ok) throw new Error(String(r.status));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "crm" }, { status: 502 });
  }
}
