import Image from "next/image";
import { MEDIA } from "@/content/avance";
import type { LandingId } from "@/content/landings";
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

const VUELOS: Toma4[] = [
  { toma: "hero", titulo: "Las 8 manzanas, de punta a punta", fecha: "21 jul 2026", grow: 5, alt: "Vista aérea de drone del trazado completo de lotes de La Campiña" },
  { toma: "trazado-jun", titulo: "Los lotes trazados con cal", fecha: "25 jun 2026", grow: 3, alt: "Lotes y vías marcados con cal sobre la tierra con áreas verdes" },
  { toma: "portico", titulo: "El pórtico y jardines de ingreso", fecha: "11 abr 2026", grow: 2, alt: "Vista cenital del pórtico de ingreso y jardines de La Campiña" },
  { toma: "cerco-jun", titulo: "El frente sobre la vía", fecha: "jun 2026", grow: 2, alt: "Frente del proyecto con su cerco de caña y cielo despejado" },
];

const DISFRUTAR = [
  { src: "/media/render-portico.jpg", titulo: "Pórtico de ingreso y seguridad", estado: "Proyección 3D · Entrega jul. 2027", alt: "Render 3D del pórtico de ingreso y caseta de vigilancia de La Campiña" },
  { src: "/media/render-alameda.jpg", titulo: "Alameda central y casas de campo", estado: "Proyección 3D · Entrega jul. 2027", alt: "Render 3D panorámico del ingreso, pérgolas y casas de campo en La Campiña" },
  { src: "/media/render-juegos.jpg", titulo: "Juegos para niños y zona de hamacas", estado: "Proyección 3D · Entrega jul. 2027", alt: "Render 3D de la zona de juegos infantiles de madera y área de hamacas" },
  { src: "/media/render-parques.jpg", titulo: "Parques y zona de picnic familiar", estado: "Proyección 3D · Entrega jul. 2027", alt: "Render 3D de las áreas verdes con mesas de picnic y sombrillas" },
  { src: "/media/render-gimnasio.jpg", titulo: "Gimnasio al aire libre y senderos", estado: "Proyección 3D · Entrega jul. 2027", alt: "Render 3D del circuito de calistenia y gimnasio al aire libre" },
  { src: "/media/render-cancha.jpg", titulo: "Cancha deportiva de grass natural", estado: "Proyección 3D · Entrega jul. 2027", alt: "Render 3D de la cancha multiusos de grass natural en La Campiña" },
];

const EJEMPLOS = ["G18", "C3", "C9", "E4", "F11"].map((id) => loteById(id)!).filter((l) => l.precio);

export function Landing({ landing = "lambayeque" }: { landing?: LandingId } = {}) {
  const r = resumen();
  const desde = DESDE.precio!;
  const inicialMin = Math.min(...DISPONIBLES.map((l) => l.precio!.inicial));
  const conPromo = DISPONIBLES.filter((l) => l.precio!.promoContado).length;
  const tramos = PROYECTO.ubicacion.tramos;
  const chiclayo = tramos.find((t) => t.lugar === "Chiclayo")!;
  const { telefono } = PROYECTO.contacto;
  const origen = landing === "lima" ? "promocion" : undefined;

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
          <a className="btn btn--ghost" href="#formulario"><Icon name="pin" size={18} /> Pide la ubicación exacta</a>
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
                      <th scope="row"><a href="#formulario" aria-label={`Consultar lote ${l.id} en el formulario`}>{l.id}</a></th>
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
            <p className="eyebrow eyebrow--center">
              <a href="#ubicacion" className="eyebrow__loc" aria-label={`Ver ubicación: A ${chiclayo.minutos} min de Chiclayo, ${PROYECTO.valle}`}>
                <span className="eyebrow__pin" aria-hidden="true"><Icon name="pin" size={13} /></span>
                <span>A {chiclayo.minutos} min de Chiclayo · {PROYECTO.valle}</span>
              </a>
            </p>
            <h1 id="t-inicio" className="hero__title">
              <span className="hero__big">
                <span className="hero__big-sans">LOTES</span>{" "}
                <em className="hero__big-serif">Amplios</em>
              </span>
              <span className="hero__mid">
                <span className="hero__mid-light">para tu</span>{" "}
                <strong className="hero__mid-bold">CASA DE CAMPO</strong>
              </span>
              <span className="hero__post">
                desde <b>500 m²</b> en <b>club privado</b>
              </span>
            </h1>
            <ul className="chips" aria-label="Beneficios">
              <li><span className="chip__check" aria-hidden="true"><Icon name="check" size={11} /></span> {CUOTAS} cuotas sin interés</li>
              <li><span className="chip__check" aria-hidden="true"><Icon name="check" size={11} /></span> Desde S/ 17 mil</li>
              <li><span className="chip__check" aria-hidden="true"><Icon name="check" size={11} /></span> Entrega jul. 2027</li>
            </ul>

            <div className="hero__grid">
              <div className="hero__media">
                <HeroCarousel />
              </div>
              <div className="hero__form-wrap">
                <a href="#formulario" className="hero__form-cue">
                  <span>REGISTRA TUS DATOS AQUÍ</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </a>
                <div className="form-card" id="formulario">
                  <p className="form-card__title">Déjanos tus datos para<br /><strong>reclamar tu regalo.</strong></p>
                  <p className="form-card__promo"><Icon name="gift" size={18} /> ¡Bono de regalo: Descuento exclusivo!</p>
                  <ContactForm idPrefix="hero" landing={landing} />
                  <p className="form-card__foot"><Icon name="shield" size={15} /> Canal oficial de comunicación</p>
                </div>
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

            <section id="lotes" className="plan-block" aria-label="Plano de lotes disponibles">
              <p className="notice"><Icon name="info" size={17} /> Toca cualquier lote disponible en el plano para seleccionarlo y solicitar su información completa con un asesor. {r.disponibles} lotes disponibles.</p>
              <LazyLotStack origen={origen} />
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
                  <Image src={d.src} alt={d.alt} fill sizes="(max-width: 899px) 90vw, 33vw" />
                  <figcaption><strong>{d.titulo}</strong><span>{d.estado}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Galería y video de la obra */}
        <section id="avance" className="section section--tight" aria-labelledby="t-avance">
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
              <a className="channel" href="#formulario"><span className="channel__icon"><Icon name="pin" size={20} /></span><span className="channel__text"><strong>Ubicación</strong><small>Vía a San Nicolás, {PROYECTO.valle}, Lambayeque</small></span></a>
              {telefono ? <a className="channel" href="#formulario"><span className="channel__icon"><Icon name="fono" size={20} /></span><span className="channel__text"><strong>Llámanos</strong><small>{telefono}</small></span></a> : null}
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

      <AsesorFlotante landing={landing} />
    </>
  );
}
