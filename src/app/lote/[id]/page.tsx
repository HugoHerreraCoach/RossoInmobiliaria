import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CUOTAS, LISTA_FECHA, LOTES, loteById, m2, soles } from "@/content/lotes";
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
      <header className="site-header">
        <div className="site-container site-header__in">
          <a className="estate-brand" href="/">
            <span className="estate-brand__name">La Campiña<span>·</span></span>
            <span className="estate-brand__sub">Valle de Zaña · Rosso Inmobiliaria</span>
          </a>
          <a className="btn btn--forest btn--small" href={`/?vista=${lote.manzana}&lote=${lote.id}#lotes`}>
            <Icon name="izq" size={16} /> Ver lotes
          </a>
        </div>
      </header>

      <main className="lotpage">
        <div className="lotpage__nav">
          <a className="back" href={`/?vista=${lote.manzana}&lote=${lote.id}#lotes`}>
            <Icon name="izq" size={18} />
            Volver al explorador · Manzana {lote.manzana}
          </a>
        </div>

        <div className="lotpage__grid">
          <section className="ficha panel" aria-labelledby="t-ficha">
            <div className="band ficha__band">
              <div>
                <span className="ficha__band-eyebrow">Información de referencia</span>
                <h1 id="t-ficha">Ficha del lote {lote.id}</h1>
              </div>
              <span className="ficha__band-code">{lote.id}</span>
            </div>
            <Ficha lote={lote} showFullLink={false} />
          </section>

          <aside className="lotpage__aside">
            <MiniMasterplan loteActivo={lote} />
            <p className="section-disclaimer">Esquema ilustrativo, no plano técnico. Datos de la lista del {LISTA_FECHA}. Confirma ubicación, perímetro y disponibilidad con un asesor.</p>
            <div className="lotpage__project-summary">
              <span className="eyebrow">Sobre el desarrollo</span>
              <h2>{PROYECTO.nombre} · {PROYECTO.valle}</h2>
              <p>
                Club de campo privado y ecológico de {PROYECTO.empresa}. Consulta los registros de obra,
                las áreas comunes proyectadas y la entrega programada para <strong>{PROYECTO.entrega}</strong>.
              </p>
              <a className="btn btn--primary" href={`/?vista=${lote.manzana}&lote=${lote.id}#contacto`}>
                <Icon name="chat" size={18} />
                Solicitar asesoría por el Lote {lote.id}
              </a>
            </div>
          </aside>
        </div>
        <div style={{ marginTop: 30 }}><PaletaSwitch /></div>
      </main>
    </>
  );
}
