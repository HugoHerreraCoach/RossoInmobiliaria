import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CUOTAS, LOTES, m2, soles } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { LoteDetalle } from "@/components/LoteDetalle";
import { LotesProvider } from "@/components/LotesProvider";
import { lotesVigentes } from "@/server/lotes";

export const dynamicParams = false;
// Estado y precio vigentes (lista + cambios de /panel, docs/0032); el panel revalida estas páginas al guardar.
export const revalidate = 300;

export function generateStaticParams() {
  return LOTES.map((l) => ({ id: l.id }));
}

type Props = { params: Promise<{ id: string }> };

async function buscar(id: string) {
  const lotes = await lotesVigentes();
  return { lotes, lote: lotes.find((l) => l.id.toUpperCase() === id.toUpperCase()) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lote: l } = await buscar((await params).id);
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
  const { lotes, lote } = await buscar((await params).id);
  if (!lote) notFound();
  return (
    <LotesProvider lotes={lotes}>
      <LoteDetalle inicial={lote} />
    </LotesProvider>
  );
}
