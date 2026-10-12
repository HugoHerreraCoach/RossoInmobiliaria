import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CUOTAS, LOTES, loteById, m2, soles } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Ficha } from "@/components/Ficha";
import { Icon } from "@/components/Icon";
import { MiniMasterplan } from "@/components/LotStack";
import { PaletaSwitch } from "@/components/PaletaSwitch";

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

  return (
    <>
      <header className="strip">
        <div className="strip__in">
          <a className="brand" href="/">
            <div className="brand__emblem" aria-hidden="true">
              <span>LC</span>
            </div>
            <div className="brand__txt">
              <b>{PROYECTO.nombre}</b>
              <span className="label">Rosso Inmobiliaria · {PROYECTO.valle}</span>
            </div>
          </a>
          <div className="strip__right">
            <PaletaSwitch />
            <a className="btn btn--small" href={`/?vista=${lote.manzana}&lote=${lote.id}#lotes`}>
              <Icon name="plano" size={16} /> Ver en Masterplan
            </a>
          </div>
        </div>
      </header>

      <main className="lotpage">
        <div className="lotpage__nav">
          <a className="back" href={`/?vista=${lote.manzana}&lote=${lote.id}#lotes`}>
            <Icon name="izq" size={18} />
            Volver al Masterplan Interactivo (Manzana {lote.manzana})
          </a>
        </div>

        <div className="lotpage__grid">
          <section className="ficha panel" aria-labelledby="t-ficha">
            <div className="band ficha__band">
              <div>
                <span className="ficha__band-eyebrow">Expediente Oficial de Unidad</span>
                <h1 id="t-ficha">Ficha Técnica · Lote {lote.id}</h1>
              </div>
              <span className="ficha__band-code">{lote.id}</span>
            </div>
            <Ficha lote={lote} showFullLink={false} />
          </section>

          <aside className="lotpage__aside">
            <MiniMasterplan loteActivo={lote} />
            <div className="lotpage__project-summary">
              <span className="eyebrow">Sobre el desarrollo</span>
              <h2>{PROYECTO.nombre} · {PROYECTO.valle}</h2>
              <p>
                Proyecto de lotes campestres de {PROYECTO.empresa} con pórtico construido, cerco vivo, calles trazadas y
                9 áreas comunes proyectadas para entrega en <strong>{PROYECTO.entrega}</strong> con{" "}
                <strong>{PROYECTO.titulo.toLowerCase()}</strong>.
              </p>
              <a className="btn btn--primary" href={`/?vista=${lote.manzana}&lote=${lote.id}#contacto`}>
                <Icon name="chat" size={18} />
                Solicitar asesoría por el Lote {lote.id}
              </a>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
