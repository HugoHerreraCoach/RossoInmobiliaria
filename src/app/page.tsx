import Image from "next/image";
import {
  CUOTAS,
  DESDE,
  DESDE_CONTADO,
  LISTA_FECHA,
  M2_MAX,
  M2_MIN,
  loteById,
  m2,
  resumen,
  soles,
  soles0,
} from "@/content/lotes";
import { PROYECTO, whatsappHref } from "@/content/proyecto";
import { ContactCta } from "@/components/ContactCta";
import { ContactForm } from "@/components/ContactForm";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Icon, type IconName } from "@/components/Icon";
import { LotStack } from "@/components/LotStack";
import { NavCurrent } from "@/components/NavCurrent";
import { PaletaSwitch } from "@/components/PaletaSwitch";
import { Photo } from "@/components/Photo";
import { Schedule } from "@/components/Schedule";
import { WhyProjectTabs } from "@/components/WhyProjectTabs";

const MENU = [
  ["proyecto", "El Proyecto"],
  ["lotes", "Masterplan"],
  ["avance", "Avance Real"],
  ["areas", "Amenidades"],
  ["pagar", "Financiamiento"],
  ["ubicacion", "Ubicación"],
  ["contacto", "Contacto"],
] as const;

const YA_HECHO = [
  {
    nombre: "Pórtico de ingreso",
    detalle: "Muros arquitectónicos blancos y acceso principal sobre la vía a San Nicolás.",
    fecha: "11 abr 2026",
  },
  {
    nombre: "Cerco vivo en el frente",
    detalle: "Cerco de caña, palmeras jóvenes y paisajismo frontal ya consolidados.",
    fecha: "11 abr 2026",
  },
  {
    nombre: "Lotes y calles trazados con cal",
    detalle: "Las 8 manzanas (A–H) y las vías internas ya están delimitadas en el terreno.",
    fecha: "25 jun 2026",
  },
] as const;

const AMENIDADES_DETALLE: { id: string; nombre: string; desc: string; icon: IconName; estado: string }[] = [
  {
    id: "portico",
    nombre: "Pórtico de ingreso",
    desc: "Control de acceso principal e identidad arquitectónica frente a la carretera a San Nicolás.",
    icon: "gate",
    estado: "Construido en obra",
  },
  {
    id: "cerco",
    nombre: "Cerco vivo perimetral",
    desc: "Delimitación natural con vegetación y palmeras que integran el proyecto al paisaje del valle.",
    icon: "trees",
    estado: "Frente instalado",
  },
  {
    id: "agua",
    nombre: "Agua de pozo tubular",
    desc: "Abastecimiento hídrico propio proyectado para las necesidades del condominio campestre.",
    icon: "water",
    estado: "Entrega Jul 2027",
  },
  {
    id: "luz",
    nombre: "Vías con iluminación solar",
    desc: "Alumbrado público sostenible en calles y alameda central sin costos eléctricos elevados.",
    icon: "sun",
    estado: "Entrega Jul 2027",
  },
  {
    id: "cancha",
    nombre: "Cancha de grass natural",
    desc: "Campo deportivo en el Gran Parque Central para partidos familiares y fines de semana.",
    icon: "plano",
    estado: "Entrega Jul 2027",
  },
  {
    id: "parrillas",
    nombre: "Zona de parrillas",
    desc: "Espacios sociales equipados al aire libre para reuniones, almuerzos e integración.",
    icon: "sparkles",
    estado: "Entrega Jul 2027",
  },
  {
    id: "hamacas",
    nombre: "Zona de hamacas",
    desc: "Área de descanso bajo sombra pensada para desconectar del ritmo urbano.",
    icon: "sun",
    estado: "Entrega Jul 2027",
  },
  {
    id: "juegos",
    nombre: "Juegos para niños",
    desc: "Parque infantil seguro dentro del área recreativa central del proyecto.",
    icon: "sparkles",
    estado: "Entrega Jul 2027",
  },
  {
    id: "gimnasio",
    nombre: "Gimnasio al aire libre",
    desc: "Estaciones de entrenamiento funcional rodeadas de áreas verdes y aire puro.",
    icon: "shield",
    estado: "Entrega Jul 2027",
  },
];

// Cinco lotes reales representativos de la lista vigente (21/08/2026)
const EJEMPLOS = ["G18", "C3", "C9", "E4", "F11"].map((id) => loteById(id)!);

export default function Home() {
  const r = resumen();
  const d = DESDE.precio!;
  const maxMin = Math.max(...PROYECTO.ubicacion.tramos.map((t) => t.minutos));
  const tel = PROYECTO.contacto.telefono;
  const wa = whatsappHref("Hola, quiero hablar con un asesor de La Campiña.");

  return (
    <>
      <a className="skip" href="#lotes">
        Saltar al Masterplan de lotes
      </a>

      {/* Barra de navegación flotante estilo Grupo DLC & Grupo GEA */}
      <header className="strip">
        <div className="strip__in">
          <a className="brand" href="#inicio">
            <div className="brand__emblem" aria-hidden="true">
              <span>LC</span>
            </div>
            <div className="brand__txt">
              <b>{PROYECTO.nombre}</b>
              <span className="label">Rosso Inmobiliaria · {PROYECTO.valle}</span>
            </div>
          </a>

          <ul className="nav">
            {MENU.map(([id, label]) => (
              <li key={id}>
                <a className="label" href={`#${id}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="strip__right">
            <PaletaSwitch />
            <div className="strip__cta">
              <ContactCta
                mensaje="Hola, quiero información y el plano de los lotes de La Campiña."
                className="btn btn--primary btn--small"
              >
                Cotizar Lote
              </ContactCta>
            </div>
          </div>
        </div>
      </header>

      {/* HERO DE LUJO ARQUITECTÓNICO (Inspirado en Grupo DLC Finca Algarrobo + Grupo GEA) */}
      <section className="hero-luxury" id="inicio" aria-labelledby="t-inicio">
        <div className="hero-luxury__bg" aria-hidden="true">
          <Image
            src="/media/hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-luxury__bg-img"
          />
          <div className="hero-luxury__bg-overlay" />
        </div>

        <div className="hero-luxury__container">
          {/* Cinta superior de credenciales */}
          <div className="hero-luxury__topbar">
            <span className="hero-pill hero-pill--live">
              <i /> OBRA EN EJECUCIÓN · {PROYECTO.valle.toUpperCase()}
            </span>
            <span className="hero-pill">
              <Icon name="plano" size={14} /> {r.disponibles} DE {r.total} LOTES DISPONIBLES
            </span>
            <span className="hero-pill">
              <Icon name="shield" size={14} /> ESCRITURA PÚBLICA · ENTREGA JULIO 2027
            </span>
          </div>

          <div className="hero-luxury__grid">
            {/* Columna Izquierda: Titular Editorial + KPIs + Carrusel de Drone Real */}
            <div className="hero-luxury__left">
              <h1 id="t-inicio" className="hero-luxury__title">
                Tu lote campestre en el Valle de Zaña{" "}
                <em>ya tiene calles trazadas en obra.</em>
              </h1>

              <p className="hero-luxury__lead">
                Vive o invierte a <strong>35 minutos de Chiclayo</strong> en un proyecto real con pórtico construido,
                cerco vivo y lotes amplios de <strong>{m2(M2_MIN)} a {m2(M2_MAX)}</strong>. Financiamiento directo en{" "}
                <strong>{CUOTAS} cuotas sin intereses</strong>.
              </p>

              {/* Píldoras de valor con checkmarks estilo Grupo DLC */}
              <div className="hero-checks">
                <div className="hero-check-pill">
                  <span className="hero-check-pill__icon">
                    <Icon name="check" size={15} />
                  </span>
                  <span>Crédito directo a sola firma (0% interés)</span>
                </div>
                <div className="hero-check-pill">
                  <span className="hero-check-pill__icon">
                    <Icon name="check" size={15} />
                  </span>
                  <span>15% de descuento al contado + Bonos Promo</span>
                </div>
                <div className="hero-check-pill">
                  <span className="hero-check-pill__icon">
                    <Icon name="check" size={15} />
                  </span>
                  <span>9 áreas comunes y pozo tubular propio</span>
                </div>
              </div>

              {/* Tarjetas de métricas clave */}
              <div className="hero-kpis">
                <div className="hero-kpi">
                  <span className="label">Cuota mensual desde</span>
                  <strong>{soles(d.cuota)}</strong>
                  <small>En {CUOTAS} meses · 0% interés</small>
                </div>
                <div className="hero-kpi">
                  <span className="label">Contado Promo desde</span>
                  <strong>{soles0(DESDE_CONTADO)}</strong>
                  <small>Inicial desde {soles0(d.inicial)}</small>
                </div>
                <div className="hero-kpi">
                  <span className="label">Superficie por lote</span>
                  <strong>Desde {m2(M2_MIN)}</strong>
                  <small>Macrolotes hasta {m2(M2_MAX)}</small>
                </div>
                <div className="hero-kpi">
                  <span className="label">Conectividad</span>
                  <strong>35 min</strong>
                  <small>Desde Chiclayo · Vía San Nicolás</small>
                </div>
              </div>

              {/* Botones de acción rápida hacia el Masterplan */}
              <div className="hero-actions">
                <a className="btn btn--primary" href="#lotes">
                  <Icon name="plano" size={20} />
                  Explorar Masterplan Interactivo ({r.disponibles} libres)
                </a>
                <a className="btn btn--ghost-light" href="#avance">
                  <Icon name="drone" size={20} />
                  Ver Videos de Avance Fechados
                </a>
              </div>

              {/* Visor interactivo de fotos y videos de drone en el Hero */}
              <HeroCarousel />
            </div>

            {/* Columna Derecha: Tarjeta Elevada de Cotización y Contacto (Estilo Grupo DLC) */}
            <aside className="hero-luxury__right" aria-label="Solicitar cotización y plano oficial">
              <div className="hero-form-card">
                <div className="hero-form-card__head">
                  <span className="hero-form-card__badge">Atención Directa · Rosso Inmobiliaria</span>
                  <h2>Recibe el Plano y Lista de Precios Oficial</h2>
                  <p>
                    Selecciona tu perfil y recibe en tu celular la disponibilidad actualizada al{" "}
                    <strong>{LISTA_FECHA}</strong> o agenda tu visita guiada.
                  </p>
                </div>

                <ContactForm idPrefix="hero" compact />

                <div className="hero-form-card__foot">
                  <div className="hero-form-card__trust">
                    <Icon name="shield" size={16} />
                    <span>
                      Promueve <strong>{PROYECTO.empresa}</strong> · Independización con {PROYECTO.titulo.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <main className="main">
        {/* SECCIÓN 1: ¿POR QUÉ LA CAMPIÑA? + CAMINOS SEGÚN PERFIL (Inspirado en Grupo GEA & Grupo DLC) */}
        <section className="section-block" id="proyecto" aria-labelledby="t-proyecto">
          <div className="section-header">
            <span className="eyebrow">Desarrollo Residencial Campestre</span>
            <h2 id="t-proyecto">
              Un patrimonio tangible en el corazón del <em>Valle de Zaña</em>
            </h2>
            <p className="section-lead">
              Diseñado para quienes buscan amplitud real, seguridad jurídica y una inversión respaldada por obras que
              puedes recorrer hoy mismo.
            </p>
          </div>

          {/* Tres rutas rápidas por perfil de comprador */}
          <div className="paths">
            <a className="path" href="?vista=precio#lotes">
              <div className="path__top">
                <span className="path__tag">Perfil Inversionista</span>
                <Icon name="calculator" size={22} />
              </div>
              <strong>Quiero invertir con descuento</strong>
              <span>
                Compara los {r.disponibles} lotes libres por valor de metro cuadrado. Al contado desde{" "}
                <b>{soles0(DESDE_CONTADO)}</b> (ahorro del 15% + bono promocional).
              </span>
              <em className="label">
                Ordenar lotes por menor precio <Icon name="der" size={17} />
              </em>
            </a>

            <a className="path" href="#pagar">
              <div className="path__top">
                <span className="path__tag">Perfil Familiar</span>
                <Icon name="trees" size={22} />
              </div>
              <strong>Casa de campo para mi familia</strong>
              <span>
                Lotes desde 510 m² con parque central, cancha de grass y parrillas desde <b>{soles(d.cuota)} al mes</b>{" "}
                en {CUOTAS} cuotas sin intereses.
              </span>
              <em className="label">
                Simular mis cuotas mensuales <Icon name="der" size={17} />
              </em>
            </a>

            <a className="path" href="#avance">
              <div className="path__top">
                <span className="path__tag">Compradores en Lima o Trujillo</span>
                <Icon name="drone" size={22} />
              </div>
              <strong>Compro desde otra ciudad</strong>
              <span>
                Revisa los vuelos de drone con fecha exacta de grabación, elige tu ubicación en el Masterplan y recibe
                asesoría por videollamada.
              </span>
              <em className="label">
                Ver bitácora de obra fechada <Icon name="der" size={17} />
              </em>
            </a>
          </div>

          {/* Pestañas interactivas de valor estilo PorQueDLC + Grupo GEA */}
          <WhyProjectTabs />
        </section>

        {/* SECCIÓN 2: MASTERPLAN INTERACTIVO DE LOTES EN SVG + SIMULADOR EN VIVO */}
        <section className="section-block section-block--dark" id="lotes" aria-labelledby="t-lotes">
          <div className="section-header section-header--light">
            <div className="section-header__split">
              <div>
                <span className="eyebrow eyebrow--accent">Masterplan Interactivo Oficial · Lista {LISTA_FECHA}</span>
                <h2 id="t-lotes">
                  Explora las 8 manzanas y elige entre los <em>{r.disponibles} lotes disponibles</em>
                </h2>
                <p className="section-lead">
                  Toca cualquier lote en el plano vectorial SVG para abrir su expediente técnico, simular tu cuota
                  inicial y compartir su enlace directo por WhatsApp.
                </p>
              </div>
              <div className="mp-summary-badges">
                <div className="mp-stat-pill">
                  <strong>{r.disponibles}</strong>
                  <span>Libres</span>
                </div>
                <div className="mp-stat-pill mp-stat-pill--amber">
                  <strong>{r.reservados}</strong>
                  <span>Reservado</span>
                </div>
                <div className="mp-stat-pill mp-stat-pill--muted">
                  <strong>{r.vendidos}</strong>
                  <span>Vendidos</span>
                </div>
              </div>
            </div>
          </div>

          <LotStack />
        </section>

        {/* SECCIÓN 3: AVANCE DE OBRA FECHADO Y VERIFICABLE */}
        <section className="section-block" id="avance" aria-labelledby="t-avance">
          <div className="section-header">
            <span className="eyebrow">Transparencia Constructiva</span>
            <h2 id="t-avance">
              Avance físico real: <em>cada foto y vuelo de drone tiene su fecha</em>
            </h2>
            <p className="section-lead">
              Desde la apertura de maquinaria en abril de 2026 hasta la entrega en julio de 2027. Selecciona cualquier
              hito en la línea de tiempo para reproducir el video de drone o inspeccionar las fotografías en alta
              resolución.
            </p>
          </div>

          <Schedule />
        </section>

        {/* SECCIÓN 4: AMENIDADES Y ESTILO DE VIDA (Bento Grid estilo Grupo GEA & Grupo DLC) */}
        <section className="section-block" id="areas" aria-labelledby="t-areas">
          <div className="section-header">
            <span className="eyebrow">Infraestructura &amp; Recreación</span>
            <h2 id="t-areas">
              9 áreas comunes e instalaciones pensadas para <em>vivir tranquilo</em>
            </h2>
            <p className="section-lead">
              Distinguimos con total claridad lo que ya puedes ver construido hoy en el terreno y el equipamiento
              recreativo programado para la entrega en {PROYECTO.entrega}.
            </p>
          </div>

          {/* Bloque destacado: Lo que ya está ejecutado en el terreno */}
          <div className="built-proof-grid">
            <div className="built-proof-card">
              <div className="built-proof-card__head">
                <span className="built-badge">
                  <Icon name="check" size={15} /> YA EN EL TERRENO HOY
                </span>
                <h3>Obras preliminares y acceso principal ya ejecutados</h3>
                <p>
                  Cuando visitas La Campiña no encuentras un terreno baldío sin referencias: el pórtico, el cerco frontal
                  y el trazado completo de lotes y vías ya están materializados en campo.
                </p>
              </div>
              <ul className="built-list">
                {YA_HECHO.map((item) => (
                  <li key={item.nombre}>
                    <span className="built-list__icon">
                      <Icon name="check" size={16} />
                    </span>
                    <div>
                      <strong>{item.nombre}</strong>
                      <p>{item.detalle}</p>
                      <small>Verificado en obra · {item.fecha}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="built-proof-media">
              <Photo
                toma="cerco-jun"
                sello="Frente del proyecto · 25 jun 2026"
                alt="El frente del proyecto La Campiña con cerco de caña, área de grass y lotes marcados con cal."
                aspect="16 / 10"
              />
            </div>
          </div>

          {/* Bento Grid de las 9 Amenidades e Instalaciones */}
          <div className="amenities-grid">
            {AMENIDADES_DETALLE.map((a) => {
              const isDone = a.id === "portico" || a.id === "cerco";
              return (
                <article key={a.id} className={`amenity-card ${isDone ? "amenity-card--done" : ""}`}>
                  <div className="amenity-card__top">
                    <span className="amenity-card__icon">
                      <Icon name={a.icon} size={22} />
                    </span>
                    <span className={`amenity-card__tag ${isDone ? "is-done" : ""}`}>{a.estado}</span>
                  </div>
                  <h3>{a.nombre}</h3>
                  <p>{a.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECCIÓN 5: FINANCIAMIENTO DIRECTO Y TABLA COMPARATIVA REAL */}
        <section className="section-block section-block--alt" id="pagar" aria-labelledby="t-pagar">
          <div className="section-header">
            <span className="eyebrow">Plan de Inversión Flexible</span>
            <h2 id="t-pagar">
              Cómo adquirir tu lote en <em>3 pasos simples y sin bancos</em>
            </h2>
            <p className="section-lead">
              Crédito directo otorgado por {PROYECTO.empresa}. Sin intereses, sin comisiones ocultas y con precios
              oficiales publicados en soles.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-card__num">01</span>
              <h3>Separa con tu Inicial</h3>
              <p>
                Elige tu ubicación en el Masterplan y congela el precio con una cuota inicial desde{" "}
                <strong>{soles0(d.inicial)}</strong> (según el lote seleccionado).
              </p>
            </div>
            <div className="step-card">
              <span className="step-card__num">02</span>
              <h3>{CUOTAS} Cuotas con 0% Interés</h3>
              <p>
                Divide el saldo restante hasta en <strong>{CUOTAS} cuotas mensuales iguales</strong> en soles, sin
                intereses bancarios. Desde <strong>{soles(d.cuota)} al mes</strong>.
              </p>
            </div>
            <div className="step-card">
              <span className="step-card__num">03</span>
              <h3>Escritura Pública &amp; Entrega</h3>
              <p>
                Tu lote se entrega independizado con <strong>{PROYECTO.titulo.toLowerCase()}</strong>. Entrega
                programada del proyecto en <strong>{PROYECTO.entrega}</strong>.
              </p>
            </div>
          </div>

          {/* Tabla ejecutiva de 5 lotes reales de la lista vigente */}
          <div className="pricing-table-card">
            <div className="pricing-table-card__head">
              <div>
                <span className="label">Ejemplos Reales · Lista Oficial al {LISTA_FECHA}</span>
                <h3>Comparativa de unidades disponibles por tipología</h3>
              </div>
              <a className="btn btn--small" href="?vista=precio#lotes">
                Ver los {r.disponibles} lotes disponibles
              </a>
            </div>

            <div className="plan-wrap">
              <table className="plan">
                <caption className="sr-only">Cinco lotes reales de la lista vigente al {LISTA_FECHA}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="label">
                      Unidad / Manzana
                    </th>
                    <th scope="col" className="label">
                      Superficie
                    </th>
                    <th scope="col" className="label hide-xs">
                      Precio Financiado
                    </th>
                    <th scope="col" className="label">
                      Inicial Mínima
                    </th>
                    <th scope="col" className="label">
                      48 Cuotas (0% Int.)
                    </th>
                    <th scope="col" className="label hide-sm">
                      Al Contado / Promo
                    </th>
                    <th scope="col" className="label">
                      Expediente
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {EJEMPLOS.map((l) => (
                    <tr key={l.id}>
                      <th scope="row">
                        <div className="plan__lot-cell">
                          <b>Lote {l.id}</b>
                          <span>
                            Manzana {l.manzana} · {soles(l.precio!.porM2)}/m²
                          </span>
                        </div>
                      </th>
                      <td>
                        <strong>{m2(l.m2)}</strong>
                      </td>
                      <td className="hide-xs">{soles(l.precio!.financiado)}</td>
                      <td>{soles(l.precio!.inicial)}</td>
                      <td className="cuota">{soles(l.precio!.cuota)} / mes</td>
                      <td className="hide-sm">
                        <div className="plan__cash-cell">
                          <strong>{soles(l.precio!.promoContado ?? l.precio!.contado)}</strong>
                          {l.precio!.promoContado ? <span className="plan__promo-pill">Bono Promo</span> : null}
                        </div>
                      </td>
                      <td>
                        <a className="btn btn--small" href={`/lote/${l.id}`}>
                          Ver ficha
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              * El pago al contado aplica un 15% de descuento directo sobre el precio financiado; las unidades con sello{" "}
              <b>Bono Promo</b> cuentan con un descuento adicional especial por tiempo limitado.
            </p>
          </div>
        </section>

        {/* SECCIÓN 6: UBICACIÓN ESTRATÉGICA EN EL VALLE DE ZAÑA */}
        <section className="section-block" id="ubicacion" aria-labelledby="t-ubicacion">
          <div className="section-header">
            <span className="eyebrow">Conectividad &amp; Entorno</span>
            <h2 id="t-ubicacion">
              Frente al <em>Valle de Zaña</em>, a 35 minutos de Chiclayo
            </h2>
            <p className="section-lead">
              {PROYECTO.ubicacion.frase}, en el departamento de Lambayeque. Un entorno natural de sol permanente, aire
              puro y acceso rápido desde la ciudad.
            </p>
          </div>

          <div className="place">
            <div className="place__info">
              <div className="place__card">
                <span className="label">Tiempos reales de recorrido en auto</span>
                <h3>Conectado con todo el corredor del Valle</h3>
                <ul className="bars" aria-label="Minutos en auto desde La Campiña">
                  {PROYECTO.ubicacion.tramos.map((t) => (
                    <li key={t.lugar}>
                      <div className="bars__meta">
                        <span className="bars__place">
                          <Icon name="pin" size={16} /> {t.lugar}
                        </span>
                        <strong className="bars__time">{t.minutos} min</strong>
                      </div>
                      <div className="bars__track" aria-hidden="true">
                        <div
                          className="bars__fill"
                          style={{ width: `${Math.max(18, (t.minutos / maxMin) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="place__actions">
                  {PROYECTO.ubicacion.mapsUrl ? (
                    <a className="btn btn--primary" href={PROYECTO.ubicacion.mapsUrl} target="_blank" rel="noopener">
                      <Icon name="pin" />
                      Abrir ubicación en Google Maps
                    </a>
                  ) : (
                    <a className="btn btn--primary" href="#contacto">
                      <Icon name="pin" />
                      Solicitar ubicación GPS y programar visita
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="place__media">
              <Photo
                toma="portico"
                sello="Pórtico de Ingreso · 11 abr 2026"
                alt="El ingreso de La Campiña sobre la vía a San Nicolás: muros blancos del pórtico, cerco de caña y palmeras jóvenes, con los cerros del Valle de Zaña al fondo."
                aspect="16 / 10"
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN 7: CONTACTO Y ASESORÍA PERSONALIZADA */}
        <section className="section-block section-block--contact" id="contacto" aria-labelledby="t-contacto">
          <div className="contact-luxury">
            <div className="contact-luxury__info">
              <span className="eyebrow eyebrow--accent">Asesoría Patrimonial · Rosso Inmobiliaria</span>
              <h2 id="t-contacto">
                Separa tu lote o agenda tu <em>visita guiada al terreno</em>
              </h2>
              <p>
                Déjanos tus datos y un asesor especializado de <strong>{PROYECTO.empresa}</strong> te enviará la ficha
                técnica detallada del lote que elijas, el plano oficial en PDF y coordinará tu visita presencial o
                recorrido virtual.
              </p>

              <div className="contact-perks">
                <div className="contact-perk">
                  <span className="contact-perk__icon">
                    <Icon name="plano" size={20} />
                  </span>
                  <div>
                    <strong>Cotización personalizada al instante</strong>
                    <p>Recibe el cronograma exacto de 48 cuotas sin intereses o el descuento al contado de tu unidad.</p>
                  </div>
                </div>
                <div className="contact-perk">
                  <span className="contact-perk__icon">
                    <Icon name="calendario" size={20} />
                  </span>
                  <div>
                    <strong>Visitas guiadas a obra en el Valle de Zaña</strong>
                    <p>Recorre el pórtico, la alameda central y verifica las estacas de tu lote en persona.</p>
                  </div>
                </div>
                <div className="contact-perk">
                  <span className="contact-perk__icon">
                    <Icon name="shield" size={20} />
                  </span>
                  <div>
                    <strong>Atención especial para Lima, Trujillo y el extranjero</strong>
                    <p>Videollamadas en vivo desde el proyecto y envío digital de documentación legal.</p>
                  </div>
                </div>
              </div>

              {wa || tel ? (
                <div className="direct">
                  {wa ? (
                    <a className="btn btn--primary" href={wa} target="_blank" rel="noopener">
                      <Icon name="chat" />
                      Hablar por WhatsApp ahora
                    </a>
                  ) : null}
                  {tel ? (
                    <a className="btn btn--ghost-light" href={`tel:${tel}`}>
                      <Icon name="fono" />
                      Llamar a central
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="contact-luxury__form-card">
              <h3>Solicitar atención de un asesor</h3>
              <p className="contact-luxury__form-sub">
                Si hiciste clic en un lote del Masterplan, aparecerá vinculado automáticamente aquí abajo.
              </p>
              <ContactForm idPrefix="contacto" />
            </div>
          </div>
        </section>
      </main>

      {/* Pie de página institucional */}
      <footer className="foot">
        <div className="foot__in">
          <div className="foot__brand">
            <div className="brand__emblem" aria-hidden="true">
              <span>LC</span>
            </div>
            <div>
              <strong>{PROYECTO.nombre} · Proyecto Campestre en el {PROYECTO.valle}</strong>
              <p>
                Desarrollado y comercializado por <b>{PROYECTO.empresa}</b> (Live your way). {PROYECTO.titulo}.
                Entrega programada: {PROYECTO.entrega}.
              </p>
            </div>
          </div>
          <div className="foot__links">
            <a href="#proyecto">El Proyecto</a>
            <a href="#lotes">Masterplan (132 Lotes)</a>
            <a href="#avance">Avance de Obra</a>
            <a href="#areas">Amenidades</a>
            <a href="#pagar">Financiamiento</a>
            <a href="#ubicacion">Ubicación</a>
          </div>
          <div className="foot__legal">
            <p>
              Precios, áreas y disponibilidad oficiales conforme a la lista vigente al <b>{LISTA_FECHA}</b>; sujetos a
              actualización sin previo aviso. Todas las fotografías y videos del portal corresponden a registros reales
              tomados en el terreno de La Campiña en las fechas indicadas.
            </p>
          </div>
        </div>
      </footer>

      {/* Barra móvil inferior de conversión rápida */}
      <nav className="mbar" aria-label="Acciones rápidas en móvil">
        <a className="btn btn--small" href="#lotes">
          <Icon name="plano" size={18} />
          Masterplan ({r.disponibles})
        </a>
        <ContactCta
          mensaje="Hola, vi La Campiña en la web y quiero información de los lotes disponibles."
          className="btn btn--primary btn--small"
        >
          Cotizar Lote
        </ContactCta>
      </nav>

      <NavCurrent ids={MENU.map(([id]) => id)} />
    </>
  );
}
