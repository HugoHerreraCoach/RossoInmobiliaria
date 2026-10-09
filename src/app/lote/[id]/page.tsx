import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CUOTAS, LOTES, loteById, m2, soles } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Ficha } from "@/components/Ficha";
import { Icon } from "@/components/Icon";
import { PaletaSwitch } from "@/components/PaletaSwitch";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOTES.map((l) => ({ id: l.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = loteById((await params).id);
  if (!l) return {};
  const title = `Lote ${l.id} · ${m2(l.m2)}`;
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

  return (
    <>
      <header className="strip">
        <div className="strip__in">
          <a className="brand" href="/">
            <b>{PROYECTO.nombre}</b>
            <span className="label">Un proyecto de Rosso Inmobiliaria</span>
          </a>
          <PaletaSwitch />
        </div>
      </header>
      <main className="lotpage">
        <a className="back" href={`/?vista=${lote.manzana}&lote=${lote.id}#lotes`}>
          <Icon name="izq" size={20} />
          Ver la manzana {lote.manzana} en {PROYECTO.nombre}
        </a>
        <section className="ficha panel" aria-labelledby="t-ficha">
          <div className="band">
            <h1 id="t-ficha" style={{ fontSize: "1.6rem", textTransform: "uppercase" }}>
              Ficha técnica · lote {lote.id}
            </h1>
          </div>
          <Ficha lote={lote} />
        </section>
      </main>
    </>
  );
}
