import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CUOTAS, LOTES, loteById, m2, soles } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { LoteDetalle } from "@/components/LoteDetalle";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOTES.map((l) => ({ id: l.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = loteById((await params).id);
  if (!l) return {};
  const title = `Lote ${l.id} · ${m2(l.m2)} en Manzana ${l.manzana}`;
  const description = l.precio
    ? `${m2(l.m2)} en el ${PROYECTO.valle}. ${CUOTAS} cuotas sin intereses de ${soles(l.precio.cuota)}, inicial ${soles(l.precio.inicial)}. ${PROYECTO.titulo}.`
    : `Lote ${l.id} de ${PROYECTO.nombre} (${l.estado}).`;
  return {
    title,
    description,
    openGraph: { title: `${title} · ${PROYECTO.nombre}`, description, images: ["/media/hero.webp"] },
  };
}

export default async function LotePage({ params }: Props) {
  const lote = loteById((await params).id);
  if (!lote) notFound();
  return <LoteDetalle inicial={lote} />;
}
