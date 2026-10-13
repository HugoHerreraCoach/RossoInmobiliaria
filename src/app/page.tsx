import Image from "next/image";
import { HeroAtmosphere } from "@/components/HeroAtmosphere";
import { CUOTAS, DESDE, DESDE_CONTADO, LISTA_FECHA, M2_MAX, M2_MIN, loteById, m2, resumen, soles, soles0 } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { ContactCta } from "@/components/ContactCta";
import { ContactForm } from "@/components/ContactForm";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Icon, type IconName } from "@/components/Icon";
import { LotStack } from "@/components/LotStack";
import { NavCurrent } from "@/components/NavCurrent";
import { PaletaSwitch } from "@/components/PaletaSwitch";
import { Photo } from "@/components/Photo";
import { Schedule } from "@/components/Schedule";
import { SiteHeader } from "@/components/SiteHeader";
import { WhyProjectTabs } from "@/components/WhyProjectTabs";

const AREAS: { nombre: string; detalle: string; icon: IconName; estado: string }[] = [
  { nombre: "Pórtico de ingreso", detalle: "La bienvenida a tu nuevo lugar en el valle.", icon: "gate", estado: "Registro de obra disponible" },
  { nombre: "Cerco vivo", detalle: "Un límite natural que se integra al paisaje.", icon: "trees", estado: "Frente registrado en obra" },
  { nombre: "Cancha de grass natural", detalle: "Más partidos, más amigos, más tiempo juntos.", icon: "plano", estado: "Proyectado" },
  { nombre: "Parrillas y hamacas", detalle: "Espacios para compartir y bajar el ritmo.", icon: "sun", estado: "Proyectado" },
  { nombre: "Juegos y gimnasio", detalle: "Movimiento y recreación al aire libre.", icon: "sparkles", estado: "Proyectado" },
  { nombre: "Servicios campestres", detalle: "Pozo tubular e iluminación solar en las vías.", icon: "water", estado: "Proyectado" },
];
const EJEMPLOS = ["G18", "C3", "C9", "E4", "F11"].map((id) => loteById(id)!);
const SECCIONES = ["inicio", "proyecto", "areas", "lotes", "avance", "pagar", "ubicacion", "contacto"];

export default function Home() {
  const r = resumen();
  const precio = DESDE.precio!;

  return (
    <div className="rosso-site">
      <a className="skip" href="#contenido">Saltar al contenido</a>
      <SiteHeader />

      <main id="contenido">
        <section className="estate-hero" id="inicio" aria-labelledby="t-inicio">
          <HeroAtmosphere />
          <div className="estate-hero__shade" aria-hidden="true" />
          <div className="site-container estate-hero__grid">
            <div className="estate-hero__copy">
              <span className="overline overline--light"><span className="live-dot" /> Club de campo privado y ecológico</span>
              <h1 id="t-inicio">Más espacio.<br />Más naturaleza.<br /><em>Más vida.</em></h1>
              <p className="estate-hero__lead">Tu propio lugar en <strong>La Campiña, Valle de Zaña.</strong> Lotes amplios, un entorno natural y un nuevo motivo para escaparte de la ciudad.</p>
              <div className="estate-hero__benefits">
                <span><Icon name="check" size={16} /> Lotes desde {m2(M2_MIN)}</span>
                <span><Icon name="check" size={16} /> Hasta {CUOTAS} cuotas sin intereses</span>
              </div>
              <div className="estate-hero__actions">
                <a className="btn btn--primary" data-track="hero-lots" href="#lotes">Encuentra tu lote <Icon name="der" size={18} /></a>
                <a className="hero-film-link" data-track="hero-gallery" href="#galeria"><span><Icon name="play" size={13} /></span> Conoce el proyecto</a>
              </div>
              <div className="estate-hero__location"><Icon name="pin" size={17} /><span>Valle de Zaña · Vía a San Nicolás · Lambayeque</span></div>
            </div>

            <aside className="enquiry-card" aria-labelledby="hero-form-title">
              <div className="enquiry-card__top"><span className="overline">Empieza aquí</span><span className="enquiry-card__mark"><Icon name="trees" size={22} /></span></div>
              <h2 id="hero-form-title">Tu próximo lugar<br /><em>está más cerca.</em></h2>
              <p>Solicita el plano, los precios y una visita al proyecto. Sin compromiso.</p>
              <ContactForm idPrefix="hero" compact />
              <div className="enquiry-card__foot"><Icon name="shield" size={15} /> Atención directa de Rosso Inmobiliaria</div>
            </aside>
          </div>
          <div className="site-container estate-hero__bottom"><span><Icon name="drone" size={15} /> Fotografía real del proyecto · abril 2026</span><a href="#proyecto">Descubre La Campiña <span aria-hidden="true">↓</span></a></div>
        </section>

        <div className="facts-band" aria-label="Datos del proyecto">
          <div className="site-container facts-band__grid">
            <div><span>Tu espacio, desde</span><strong>{M2_MIN} <small>m²</small></strong><p>Lotes hasta {m2(M2_MAX)}</p></div>
            <div><span>Precio promocional de contado</span><strong>{soles0(DESDE_CONTADO)}</strong><p>Según lote y lista de precios*</p></div>
            <div><span>Financiamiento directo</span><strong>{CUOTAS} <small>cuotas</small></strong><p>Sin intereses sobre precio de lista</p></div>
            <div><span>Entrega programada</span><strong>Julio <small>2027</small></strong><p>Conoce los avances de obra</p></div>
          </div>
          <p className="facts-band__note">*Referencia de la lista del {LISTA_FECHA}. Confirma precios, promociones y disponibilidad con un asesor.</p>
        </div>

        <section className="editorial-section" id="proyecto" aria-labelledby="t-proyecto">
          <div className="site-container">
            <div className="intro-grid">
              <div className="intro-grid__visual">
                <Image src="/media/banderas.webp" alt="Banderas de La Campiña frente a las montañas del Valle de Zaña, en el terreno del proyecto" fill sizes="(max-width: 760px) 100vw, 560px" />
                <span className="image-label"><span /> La Campiña · Valle de Zaña</span>
                <div className="intro-grid__seal"><Icon name="trees" size={25} /><span>Un lugar<br /><b>para ti.</b></span></div>
              </div>
              <div className="intro-grid__copy">
                <span className="overline">La vida, a otro ritmo</span>
                <h2 id="t-proyecto">Cerca de lo que amas.<br /><em>Lejos del ruido.</em></h2>
                <p>Un club de campo privado y ecológico para disfrutar con tu familia, compartir con amigos o explorar una inversión en el entorno turístico de Lambayeque.</p>
                <p>Conoce el terreno, revisa las opciones de lotes y elige el espacio que va contigo. Aquí puedes ver fotografías reales y registros de obra antes de programar tu visita.</p>
                <div className="intro-features"><span><Icon name="trees" size={18} /> Entorno natural</span><span><Icon name="drone" size={18} /> Avance documentado</span></div>
                <a className="text-link" href="#ubicacion">Descubre su ubicación <Icon name="der" size={18} /></a>
              </div>
            </div>
            <WhyProjectTabs />
          </div>
        </section>

        <section className="gallery-section" id="galeria" aria-labelledby="t-galeria">
          <div className="site-container">
            <div className="editorial-heading editorial-heading--split">
              <div><span className="overline">Sin filtros, sin imaginarlo</span><h2 id="t-galeria">Conócelo desde <em>otro ángulo.</em></h2></div>
              <p>Fotografías y videos del terreno. Explora las tomas y mira cómo avanza La Campiña.</p>
            </div>
            <HeroCarousel />
          </div>
        </section>

        <section className="editorial-section amenities-section" id="areas" aria-labelledby="t-areas">
          <div className="site-container">
            <div className="editorial-heading editorial-heading--center"><span className="overline">Espacio para disfrutar</span><h2 id="t-areas">Tus fines de semana,<br /><em>con más posibilidades.</em></h2><p>Áreas comunes y servicios pensados para la vida de campo.<br />Diferenciamos lo registrado en obra de lo proyectado para la entrega.</p></div>
            <div className="amenity-list">
              {AREAS.map((a, i) => <article className="amenity-item" key={a.nombre}><span className="amenity-item__icon"><Icon name={a.icon} size={26} /></span><span className="amenity-item__number">0{i + 1}</span><h3>{a.nombre}</h3><p>{a.detalle}</p><span className={`amenity-item__status ${i < 2 ? "amenity-item__status--built" : ""}`}><i />{a.estado}</span></article>)}
            </div>
            <p className="section-disclaimer">Equipamiento proyectado para {PROYECTO.entrega}. Consulta los alcances y condiciones del proyecto con el equipo comercial.</p>
          </div>
        </section>

        <section className="lot-section" id="lotes" aria-labelledby="t-lotes">
          <div className="site-container">
            <div className="editorial-heading editorial-heading--split editorial-heading--light">
              <div><span className="overline overline--light">Elige tu espacio</span><h2 id="t-lotes">Un lote que encaje<br /><em>con tus planes.</em></h2></div>
              <div><p>Explora las manzanas, compara precios y simula tus cuotas. Selecciona un lote para conocer sus detalles.</p><span className="data-note"><Icon name="calendario" size={15} /> Lista de referencia: {LISTA_FECHA}</span></div>
            </div>
            <div className="lot-notice"><Icon name="info" size={17} /><p>El plano es un <strong>esquema de consulta, no un plano técnico ni catastral</strong>. La ubicación exacta, el perímetro y la disponibilidad deben confirmarse con el plano oficial y un asesor.</p></div>
            <LotStack />
          </div>
        </section>

        <section className="editorial-section" id="avance" aria-labelledby="t-avance">
          <div className="site-container">
            <div className="editorial-heading editorial-heading--split"><div><span className="overline">Un proyecto que puedes ver</span><h2 id="t-avance">Así vamos <em>avanzando.</em></h2></div><p>Una bitácora de fotografías y vuelos de drone. Revisa cada registro y su fecha, desde el inicio de obra.</p></div>
            <Schedule />
          </div>
        </section>

        <section className="finance-section" id="pagar" aria-labelledby="t-pagar">
          <div className="site-container">
            <div className="finance-intro">
              <div><span className="overline">Haz espacio para tus planes</span><h2 id="t-pagar">Tu lote, a tu ritmo.<br /><em>Sin intereses.</em></h2><p>Compara el pago al contado con el financiamiento directo. En cada ficha puedes ajustar la inicial y simular tu cuota mensual.</p><a href="#lotes" className="text-link">Ir al simulador de lotes <Icon name="der" size={18} /></a></div>
              <div className="finance-highlight"><span>Financiamiento de referencia · Lote {DESDE.id}</span><strong>{soles(precio.cuota)} <small>/ mes</small></strong><div><span>Inicial desde<b>{soles0(precio.inicial)}</b></span><span>Plazo de referencia<b>{CUOTAS} meses</b></span><span>Interés<b>0%</b></span></div><p>Precio financiado: {soles0(precio.financiado)}. Según lista del {LISTA_FECHA}; sujeto a confirmación.</p></div>
            </div>
            <div className="purchase-steps">
              <div><span>01</span><h3>Encuentra tu lote</h3><p>Compara áreas, manzanas y precios en el explorador.</p></div>
              <div><span>02</span><h3>Elige cómo pagarlo</h3><p>Simula tu inicial y plazo, o consulta las opciones al contado.</p></div>
              <div><span>03</span><h3>Coordina con un asesor</h3><p>Confirma la disponibilidad, los documentos y tu visita.</p></div>
            </div>
            <details className="price-comparison"><summary><span><Icon name="calculator" size={20} /> Compara cinco opciones de la lista de precios</span><Icon name="mas" size={20} /></summary><div className="plan-wrap"><table className="plan"><caption>Lista de referencia del {LISTA_FECHA}. No es inventario en tiempo real.</caption><thead><tr><th scope="col">Lote</th><th scope="col">Área</th><th scope="col">Financiado</th><th scope="col">Inicial</th><th scope="col">{CUOTAS} cuotas</th><th scope="col">Contado / promo</th><th scope="col">Detalle</th></tr></thead><tbody>{EJEMPLOS.map((l) => <tr key={l.id}><th scope="row">{l.id}</th><td>{m2(l.m2)}</td><td>{soles0(l.precio!.financiado)}</td><td>{soles0(l.precio!.inicial)}</td><td>{soles(l.precio!.cuota)}</td><td>{soles0(l.precio!.promoContado ?? l.precio!.contado)}</td><td><a className="text-link" href={`/lote/${l.id}`} aria-label={`Ver ficha del lote ${l.id}`}>Ver ficha <Icon name="der" size={15} /></a></td></tr>)}</tbody></table></div></details>
          </div>
        </section>

        <section className="editorial-section" id="ubicacion" aria-labelledby="t-ubicacion">
          <div className="site-container location-grid">
            <div className="location-grid__copy"><span className="overline">Naturaleza e historia</span><h2 id="t-ubicacion">Tu punto de encuentro<br /><em>en el Valle de Zaña.</em></h2><p>{PROYECTO.ubicacion.frase}. Un lugar para descubrir el entorno y disfrutar de la vida de campo en Lambayeque.</p><div className="travel-times">{PROYECTO.ubicacion.tramos.map((t) => <div key={t.lugar}><strong>{t.minutos}<small> min</small></strong><span>{t.lugar}</span></div>)}</div><p className="section-disclaimer">Tiempos aproximados indicados en el proyecto original; varían según ruta, origen y tránsito.</p>{PROYECTO.ubicacion.mapsUrl ? <a className="btn btn--forest" href={PROYECTO.ubicacion.mapsUrl} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={18} /> Ver ubicación en Google Maps</a> : <a className="btn btn--forest" href="#contacto"><Icon name="pin" size={18} /> Solicita la ubicación y una visita</a>}</div>
            <div className="location-grid__visual"><Photo toma="portico" sello="Ingreso del proyecto · abril 2026" alt="Acceso real de La Campiña junto a la vía a San Nicolás, con las montañas del Valle de Zaña al fondo" aspect="4 / 3" /><span className="location-grid__caption"><Icon name="pin" size={17} /> La Campiña · Lambayeque, Perú</span></div>
          </div>
        </section>

        <section className="contact-section" id="contacto" aria-labelledby="t-contacto">
          <div className="site-container contact-section__grid">
            <div className="contact-section__copy"><span className="overline overline--light">El siguiente paso es conocernos</span><h2 id="t-contacto">Tus planes merecen<br /><em>un lugar propio.</em></h2><p>Déjanos tus datos para solicitar la ficha del proyecto, resolver tus dudas o coordinar una visita al terreno.</p><div className="contact-promises"><span><Icon name="plano" size={20} /> Plano y opciones de lotes</span><span><Icon name="calculator" size={20} /> Orientación sobre formas de pago</span><span><Icon name="calendario" size={20} /> Coordinación de visita o videollamada</span></div>{PROYECTO.contacto.whatsapp ? <ContactCta mensaje="Hola, quiero conocer el Club Privado La Campiña y coordinar una visita." className="btn btn--primary">Hablar por WhatsApp</ContactCta> : null}{PROYECTO.contacto.telefono ? <a className="contact-phone" href={`tel:${PROYECTO.contacto.telefono}`}><Icon name="fono" size={18} /> {PROYECTO.contacto.telefono}</a> : null}<span className="contact-signature">La Campiña <span>/</span> Rosso Inmobiliaria</span></div>
            <div className="contact-section__form"><span className="overline">Hablemos de tu próximo lote</span><h3>Cuéntanos qué estás buscando.</h3><ContactForm idPrefix="contacto" /></div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="site-container"><div className="site-footer__top"><a className="estate-brand estate-brand--footer" href="#inicio"><span className="estate-brand__name">La Campiña<span>·</span></span><span className="estate-brand__sub">Valle de Zaña · Rosso Inmobiliaria</span></a><nav aria-label="Enlaces del pie"><a href="#proyecto">El proyecto</a><a href="#lotes">Lotes</a><a href="#avance">Avances</a><a href="#contacto">Contacto</a><a href="/privacidad">Privacidad</a></nav></div><div className="site-footer__bottom"><p>© 2026 Rosso Inmobiliaria · Club Privado La Campiña.</p><PaletaSwitch /></div><p className="site-footer__legal">Fotografías y videos reales del material incluido en el proyecto. Precios, áreas y estados de los {r.total} lotes según lista del {LISTA_FECHA}, sujetos a confirmación comercial. El esquema interactivo no sustituye al plano oficial. Consulta los alcances de las áreas comunes, documentación y entrega antes de contratar.</p></div></footer>
      <nav className="mobile-actions" aria-label="Acciones rápidas"><a href="#lotes" data-track="mobile-lots"><Icon name="plano" size={19} /> Ver lotes</a><a className="btn btn--primary" data-track="mobile-contact" href="#contacto">Solicitar información <Icon name="der" size={17} /></a></nav>
      <NavCurrent ids={SECCIONES} />
    </div>
  );
}
