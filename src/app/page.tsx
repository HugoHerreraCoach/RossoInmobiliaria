import Image from "next/image";
import { AVANCE, MEDIA } from "@/content/avance";
import { CUOTAS, DESDE, DESDE_CONTADO, DISPONIBLES, LISTA_FECHA, M2_MAX, M2_MIN, loteById, m2, resumen, soles, soles0 } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { AsesorFlotante } from "@/components/AsesorFlotante";
import { ContactForm } from "@/components/ContactForm";
import { DecisionTabs, type Pestana } from "@/components/DecisionTabs";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Icon } from "@/components/Icon";
import { LazyLotStack } from "@/components/LazyLotStack";
import { MotionToggle } from "@/components/MotionExperience";
import { ObraBand, type Toma4 } from "@/components/ObraBand";
import { SiteHeader } from "@/components/SiteHeader";
import { Reveal, Stagger } from "@/components/motion/Reveal";

// Estructura guiada por la landing de Grupo DLC (grupodlc.conexigo.com): portada con formulario,
// plano de lotes con simulador, galería y video, pestañas para decidir y contacto. Todo botón de
// contacto lleva al formulario de la portada (#formulario); el único WhatsApp es el botón flotante. Con la marca, las fotos y
// los datos de La Campiña. Toda cifra sale de src/content (lista de precios y proyecto).

const VUELOS: Toma4[] = [
  { toma: "general-jul", titulo: "Las 8 manzanas, de punta a punta", fecha: "21 jul 2026", grow: 5, alt: "Vista de drone del trazado completo de La Campiña con el verde del valle al fondo" },
  { toma: "portico", titulo: "El pórtico de ingreso", fecha: "11 abr 2026", grow: 2, alt: "Pórtico de ingreso de La Campiña sobre la vía a San Nicolás" },
  { toma: "cerco-jun", titulo: "El frente sobre la vía", fecha: "jun 2026", grow: 3, alt: "Frente del proyecto con su cerco, visto desde el drone" },
  { toma: "trazado-jun", titulo: "Los lotes trazados con cal", fecha: "25 jun 2026", grow: 2, alt: "Lotes y vías marcados con cal sobre la tierra" },
];

const DISFRUTAR = [
  { toma: "portico" as const, titulo: "Pórtico de ingreso", estado: "Foto real · 11 abr 2026", alt: "Pórtico de ingreso de La Campiña junto a la vía a San Nicolás" },
  { toma: "cerco-jun" as const, titulo: "Frente con cerco", estado: "Foto real · jun 2026", alt: "Frente del proyecto con su cerco de caña" },
  { toma: "trazado-jun" as const, titulo: "Lotes y calles trazados", estado: "Foto real · 25 jun 2026", alt: "Lotes y calles marcados con cal sobre la tierra del Valle de Zaña" },
];
const PROYECTADAS = ["Cancha de grass natural", "Zona de parrillas", "Zona de hamacas", "Juegos para niños", "Gimnasio al aire libre", "Agua de pozo tubular", "Vías con iluminación solar"];

const EJEMPLOS = ["G18", "C3", "C9", "E4", "F11"].map((id) => loteById(id)!).filter((l) => l.precio);

export default function Home() {
  const r = resumen();
  const desde = DESDE.precio!;
  const inicialMin = Math.min(...DISPONIBLES.map((l) => l.precio!.inicial));
  const conPromo = DISPONIBLES.filter((l) => l.precio!.promoContado).length;
  const tramos = PROYECTO.ubicacion.tramos;
  const chiclayo = tramos.find((t) => t.lugar === "Chiclayo")!;
  const { telefono } = PROYECTO.contacto;
  const maps = PROYECTO.ubicacion.mapsUrl;

  const PESTANAS: Pestana[] = [
    {
      id: "ubicacion",
      etiqueta: "Ubicación",
      icon: "pin",
      contenido: (
        <div className="tabs__body">
          <p>{PROYECTO.ubicacion.frase}. Lo bastante cerca para ir cualquier fin de semana; lo bastante lejos para desconectar.</p>
          <ul className="checks">
            {tramos.map((t) => <li key={t.lugar}><Icon name="check" size={16} /> {t.minutos} minutos de {t.lugar}</li>)}
            <li><Icon name="check" size={16} /> Tiempos aproximados; varían según la ruta y el tránsito</li>
          </ul>
          {maps ? (
            <a className="btn btn--ghost" href={maps} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={18} /> Ver en Google Maps</a>
          ) : (
            <a className="btn btn--ghost" href="#formulario"><Icon name="pin" size={18} /> Pide la ubicación exacta</a>
          )}
        </div>
      ),
    },
    {
      id: "financiamiento",
      etiqueta: "Financiamiento directo",
      icon: "calculator",
      contenido: (
        <div className="tabs__body">
          <p>Financiamiento directo con {PROYECTO.empresa}, sin intereses: la cuota es el precio de lista menos la inicial, dividido entre {CUOTAS} meses.</p>
          <ul className="checks">
            <li><Icon name="check" size={16} /> Inicial desde {soles0(inicialMin)}, según el lote</li>
            <li><Icon name="check" size={16} /> Cuota desde {soles(desde.cuota)} al mes</li>
            <li><Icon name="check" size={16} /> Al contado, alrededor de 15 % menos; {conPromo} lotes con promoción desde {soles0(DESDE_CONTADO)}</li>
          </ul>
          <details className="compare">
            <summary>Compara {EJEMPLOS.length} lotes de la lista</summary>
            <div className="table-wrap">
              <table className="plan">
                <caption>Lista de referencia del {LISTA_FECHA}. No es inventario en tiempo real.</caption>
                <thead>
                  <tr><th scope="col">Lote</th><th scope="col">Área</th><th scope="col">Financiado</th><th scope="col">Inicial</th><th scope="col">{CUOTAS} cuotas</th><th scope="col">Contado</th></tr>
                </thead>
                <tbody>
                  {EJEMPLOS.map((l) => (
                    <tr key={l.id}>
                      <th scope="row"><a href={`/lote/${l.id}`} aria-label={`Ver ficha del lote ${l.id}`}>{l.id}</a></th>
                      <td>{m2(l.m2)}</td>
                      <td>{soles0(l.precio!.financiado)}</td>
                      <td>{soles0(l.precio!.inicial)}</td>
                      <td>{soles(l.precio!.cuota)}</td>
                      <td>{soles0(l.precio!.promoContado ?? l.precio!.contado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      ),
    },
    {
      id: "papeles",
      etiqueta: "Papeles claros",
      icon: "shield",
      contenido: (
        <div className="tabs__body">
          <p>La compra se formaliza con {PROYECTO.titulo.toLowerCase()}. Antes de separar, pide al asesor los documentos del lote que te interesa y revísalos con calma.</p>
          <ul className="checks">
            <li><Icon name="check" size={16} /> {PROYECTO.titulo}</li>
            <li><Icon name="check" size={16} /> Precios de la lista vigente del {LISTA_FECHA}</li>
            <li><Icon name="check" size={16} /> Entrega programada para {PROYECTO.entrega}</li>
          </ul>
          <a className="btn btn--ghost" href="#formulario"><Icon name="plano" size={18} /> Pide la documentación</a>
        </div>
      ),
    },
  ];

  const PREGUNTAS = [
    ["¿Cuánto pago al mes?", `Depende del lote. La cuota más baja de la lista es de ${soles(desde.cuota)} al mes, con ${soles0(desde.inicial)} de inicial y ${CUOTAS} cuotas, en el lote ${DESDE.id} de ${m2(DESDE.m2)}. En el plano puedes simular la cuota de cada lote disponible.`],
    ["¿El financiamiento tiene intereses?", "No. Es financiamiento directo con Rosso Inmobiliaria: la cuota es el precio de lista menos la inicial, dividido entre el número de cuotas."],
    ["¿Y si pago al contado?", `Pagas alrededor de 15 % menos que el precio financiado, y ${conPromo} lotes tienen además una promoción de contado, desde ${soles0(DESDE_CONTADO)}. Confirma su vigencia con un asesor.`],
    ["¿Los lotes tienen escritura pública?", "Sí, la compra se formaliza con escritura pública. Pide al asesor los documentos del lote que te interesa antes de separarlo."],
    ["¿Cuándo se entrega?", `La entrega está programada para ${PROYECTO.entrega}. Mientras tanto, puedes ver cómo avanza la obra en los vuelos de drone y las fotos fechadas de esta página.`],
    ["¿Puedo comprar si vivo en Lima o Trujillo?", "Sí. Revisa el plano y la ficha de cada lote, pide una videollamada con un asesor desde tu ciudad y coordina la visita al terreno cuando puedas viajar."],
  ];

  return (
    <>
      <a className="skip" href="#contenido">Saltar al contenido</a>
      <SiteHeader />

      <main id="contenido">
        {/* Portada: titular, beneficios, formulario y fotos reales de la obra */}
        <section id="inicio" className="hero" aria-labelledby="t-inicio">
          <div className="hero__bg" aria-hidden="true">
            <Image src={MEDIA["ingreso-abr"].color} alt="" fill priority sizes="100vw" />
          </div>
          <div className="wrap hero__inner">
            <p className="eyebrow eyebrow--center">A {chiclayo.minutos} min de Chiclayo · {PROYECTO.valle}</p>
            <h1 id="t-inicio" className="hero__title">
              <span className="hero__pre">Lotes campestres para</span>
              <span className="hero__big">tu casa de campo</span>
              <span className="hero__post">desde <b>{m2(M2_MIN)}</b> con <b>{PROYECTO.titulo.toLowerCase()}</b></span>
            </h1>
            <ul className="chips" aria-label="Beneficios">
              <li><Icon name="check" size={16} /> {CUOTAS} cuotas sin intereses</li>
              <li><Icon name="check" size={16} /> Desde {soles(desde.cuota)} al mes</li>
              <li><Icon name="check" size={16} /> Obra en marcha · entrega {PROYECTO.entrega}</li>
            </ul>

            <div className="hero__grid">
              <div className="form-card" id="formulario">
                <p className="form-card__title">Déjanos tus datos y recibe <strong>el plano y los precios.</strong></p>
                <p className="form-card__promo"><Icon name="sparkles" size={18} /> Promoción al contado desde {soles0(DESDE_CONTADO)} en {conPromo} lotes</p>
                <ContactForm idPrefix="hero" />
                <p className="form-card__foot"><Icon name="shield" size={15} /> Atención directa de {PROYECTO.empresa}</p>
              </div>
              <div className="hero__media">
                <HeroCarousel />
              </div>
            </div>
          </div>
        </section>

        {/* El proyecto: el plano interactivo con la ficha y el simulador de cada lote */}
        <section id="proyecto" className="section" aria-labelledby="t-proyecto">
          <div className="wrap">
            <Stagger className="section__head">
              <p className="eyebrow" data-part>Club de campo privado y ecológico</p>
              <h2 id="t-proyecto" className="h2" data-part>La Campiña: <em>tu lugar en el campo</em></h2>
              <p className="lead" data-part>
                {r.total} lotes de {m2(M2_MIN)} a {m2(M2_MAX)} frente al {PROYECTO.valle}, al borde de la vía a San Nicolás y a {chiclayo.minutos} minutos de Chiclayo. Para que tu familia disfrute el fin de semana, compartir con amigos o invertir en tierra que puedes visitar.
              </p>
            </Stagger>

            <section id="lotes" className="plan-block" aria-label="Plano de lotes y simulador de cuotas">
              <p className="notice"><Icon name="info" size={17} /> Toca un lote del plano para ver su precio y simular tu cuota. {r.disponibles} lotes disponibles según la lista del {LISTA_FECHA}. El plano es un esquema de consulta, no un plano técnico ni catastral: confirma la ubicación, el perímetro y la disponibilidad con un asesor.</p>
              <LazyLotStack />
            </section>
          </div>
        </section>

        {/* Lo que vas a disfrutar: fotos reales de lo construido y lo proyectado */}
        <section id="areas" className="section section--tight" aria-labelledby="t-areas">
          <div className="wrap">
            <Reveal as="h2" id="t-areas" className="h3">Lo que vas a <em>disfrutar</em></Reveal>
            <div className="photo-cards">
              {DISFRUTAR.map((d) => (
                <figure key={d.titulo} className="photo-card">
                  <Image src={MEDIA[d.toma].color} alt={d.alt} fill sizes="(max-width: 899px) 90vw, 33vw" />
                  <figcaption><strong>{d.titulo}</strong><span>{d.estado}</span></figcaption>
                </figure>
              ))}
            </div>
            <div className="planned">
              <p>Proyectado para {PROYECTO.entrega}:</p>
              <ul className="chips chips--left">
                {PROYECTADAS.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* Galería y video de la obra */}
        <section id="avance" className="section" aria-labelledby="t-avance">
          <div className="wrap">
            <Stagger className="section__head">
              <p className="eyebrow" data-part>Obra a la vista</p>
              <h2 id="t-avance" className="h2" data-part>Así avanza <em>La Campiña</em></h2>
              <p className="lead" data-part>Vuelos de drone y fotos fechadas del propio terreno, para que lo conozcas antes de tu visita.</p>
            </Stagger>
          </div>
          <div className="wrap wrap--wide">
            <ObraBand tomas={VUELOS} />
          </div>
          <div className="wrap">
            <ol className="timeline" aria-label="Bitácora de obra">
              {AVANCE.map((h) => <li key={h.toma}><span>{h.fecha ?? "Inicio de obra"}</span><strong>{h.titulo}</strong></li>)}
              <li className="is-next"><span>{PROYECTO.entrega}</span><strong>Entrega programada</strong></li>
            </ol>
            <div className="actions actions--center">
              <a className="btn btn--ghost" href="#formulario"><Icon name="drone" size={18} /> ¿Estás lejos? Pide una videollamada</a>
            </div>
          </div>
        </section>

        {/* Por qué: lo necesario para decidir */}
        <section id="por-que" className="section section--band" aria-labelledby="t-por-que">
          <div className="wrap why">
            <div>
              <Stagger className="section__head section__head--left">
                <p className="eyebrow" data-part>Por qué La Campiña</p>
                <h2 id="t-por-que" className="h2" data-part>Todo lo que necesitas para <em>decidir tranquilo</em></h2>
              </Stagger>
              <DecisionTabs pestanas={PESTANAS} />
            </div>
            <dl className="stat-cards">
              <div><dt>lotes desde</dt><dd>{M2_MIN}<small> m²</small></dd></div>
              <div><dt>de Chiclayo</dt><dd>{chiclayo.minutos}<small> min</small></dd></div>
              <div><dt>para pagar sin intereses</dt><dd>{CUOTAS}<small> meses</small></dd></div>
              <div><dt>lotes disponibles en la lista</dt><dd>{r.disponibles}</dd></div>
            </dl>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section id="preguntas" className="section" aria-labelledby="t-preguntas">
          <div className="wrap faq">
            <Stagger className="section__head section__head--left">
              <p className="eyebrow" data-part>Preguntas frecuentes</p>
              <h2 id="t-preguntas" className="h2" data-part>Lo que más <em>nos preguntan</em></h2>
            </Stagger>
            <div className="faq__list">
              {PREGUNTAS.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contacto: canales; todos llevan al formulario de la portada */}
        <section id="contacto" className="section section--contact" aria-labelledby="t-contacto">
          <div className="wrap">
            <Stagger className="section__head section__head--center">
              <h2 id="t-contacto" className="h2" data-part>Da el <em>primer paso</em> hoy</h2>
              <p className="lead" data-part>Un asesor de {PROYECTO.empresa} te envía el plano, tu plan de cuotas y los horarios de visita. Sin compromiso.</p>
            </Stagger>
            <div className="channels">
              <a className="channel" href="#formulario"><span className="channel__icon"><Icon name="calendario" size={20} /></span><span className="channel__text"><strong>Agenda tu visita</strong><small>Visitas guiadas los fines de semana</small></span></a>
              <a className="channel" href="#formulario"><span className="channel__icon"><Icon name="drone" size={20} /></span><span className="channel__text"><strong>¿Estás lejos?</strong><small>Pide una videollamada desde tu ciudad</small></span></a>
              {maps ? (
                <a className="channel" href={maps} target="_blank" rel="noopener noreferrer"><span className="channel__icon"><Icon name="pin" size={20} /></span><span className="channel__text"><strong>Ubicación</strong><small>Vía a San Nicolás, {PROYECTO.valle}</small></span></a>
              ) : (
                <div className="channel"><span className="channel__icon"><Icon name="pin" size={20} /></span><span className="channel__text"><strong>Ubicación</strong><small>Vía a San Nicolás, {PROYECTO.valle}, Lambayeque</small></span></div>
              )}
              {telefono ? <a className="channel" href={`tel:${telefono}`}><span className="channel__icon"><Icon name="fono" size={20} /></span><span className="channel__text"><strong>Llámanos</strong><small>{telefono}</small></span></a> : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap site-footer__grid">
          <div className="site-footer__brand">
            <p className="brand" translate="no">La Campiña<span>Valle de Zaña · {PROYECTO.empresa}</span></p>
            <p>Lotes campestres con {PROYECTO.titulo.toLowerCase()} y financiamiento directo, a {chiclayo.minutos} minutos de Chiclayo.</p>
            <span className="badge badge--lime">Desde {soles(desde.cuota)} al mes</span>
          </div>
          <nav aria-label="Explora">
            <p className="site-footer__label">Explora</p>
            <ul><li><a href="#proyecto">El proyecto</a></li><li><a href="#lotes">Lotes y precios</a></li><li><a href="#avance">Avance de obra</a></li><li><a href="#preguntas">Preguntas</a></li></ul>
          </nav>
          <nav aria-label="La Campiña">
            <p className="site-footer__label">La Campiña</p>
            <ul><li><a href="#por-que">Financiamiento</a></li><li><a href="#formulario">Pide el plano</a></li><li><a href="#formulario">Videollamada</a></li><li><a href="#por-que">Documentación</a></li></ul>
          </nav>
          <div>
            <p className="site-footer__label">Contacto</p>
            <ul>
              <li><a href="#formulario"><Icon name="calendario" size={16} /> Agenda tu visita</a></li>
              <li><span><Icon name="pin" size={16} /> Vía a San Nicolás, {PROYECTO.valle}, Lambayeque</span></li>
              {telefono ? <li><a href={`tel:${telefono}`}><Icon name="fono" size={16} /> {telefono}</a></li> : null}
            </ul>
          </div>
        </div>
        <div className="wrap site-footer__legal">
          <p>© 2026 {PROYECTO.empresa}. Fotografías y videos del propio proyecto. Precios, áreas y estados de los {r.total} lotes según la lista del {LISTA_FECHA}, sujetos a confirmación comercial. El plano interactivo es un esquema y no sustituye al plano oficial.</p>
          <div className="site-footer__links"><a href="/privacidad">Privacidad</a><MotionToggle /><a href="#inicio">Volver arriba</a></div>
        </div>
      </footer>

      <AsesorFlotante />
    </>
  );
}
