import { CUOTAS, DESDE, DESDE_CONTADO, LISTA_FECHA, M2_MAX, M2_MIN, loteById, m2, resumen, soles, soles0 } from "@/content/lotes";
import { PROYECTO, whatsappHref } from "@/content/proyecto";
import { ContactCta } from "@/components/ContactCta";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { LotStack } from "@/components/LotStack";
import { NavCurrent } from "@/components/NavCurrent";
import { PaletaSwitch } from "@/components/PaletaSwitch";
import { Photo } from "@/components/Photo";
import { Schedule } from "@/components/Schedule";

const MENU = [
  ["avance", "Avance"],
  ["lotes", "Lotes"],
  ["pagar", "Cómo pagar"],
  ["ubicacion", "Ubicación"],
  ["contacto", "Contacto"],
] as const;

// Lo que ya se ve en las tomas fechadas del avance de obra.
const YA_HECHO = [
  { nombre: "Pórtico de ingreso", fecha: "11 abr 2026" },
  { nombre: "Cerco de caña en el frente", fecha: "11 abr 2026" },
  { nombre: "Lotes y calles trazados con cal", fecha: "25 jun 2026" },
] as const;

// Ejemplos reales de la lista para el panel de pagos.
const EJEMPLOS = ["G18", "C9", "F11"].map((id) => loteById(id)!);

function Band({ id, title, children }: { id: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="band">
      <h2 id={id}>{title}</h2>
      {children}
    </div>
  );
}

export default function Home() {
  const r = resumen();
  const d = DESDE.precio!;
  const maxMin = Math.max(...PROYECTO.ubicacion.tramos.map((t) => t.minutos));
  const tel = PROYECTO.contacto.telefono;
  const wa = whatsappHref("Hola, quiero hablar con un asesor de La Campiña.");

  return (
    <>
      <a className="skip" href="#lotes">
        Saltar a los lotes
      </a>

      <header className="strip">
        <div className="strip__in">
          <a className="brand" href="#inicio">
            <b>{PROYECTO.nombre}</b>
            <span className="label">Un proyecto de Rosso Inmobiliaria</span>
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
          <PaletaSwitch />
          <div className="strip__cta">
            <ContactCta mensaje="Hola, quiero información de los lotes de La Campiña." className="btn btn--primary btn--small">
              Escribir a un asesor
            </ContactCta>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Cartel de obra */}
        <section className="cartel" id="inicio" aria-labelledby="t-inicio">
          <div className="panel">
            <div className="band">
              <h1 id="t-inicio">Tu lote en el Valle de Zaña ya tiene calles.</h1>
            </div>
            <div className="cartel__body">
              <div className="cartel__data">
                <dl className="fields">
                  <dt className="label">Proyecto</dt>
                  <dd>
                    {PROYECTO.nombre}
                    <small>Lotes campestres de {m2(M2_MIN)} a {m2(M2_MAX)}</small>
                  </dd>
                  <dt className="label">Ubicación</dt>
                  <dd>
                    {PROYECTO.valle}
                    <small>Vía a San Nicolás · 35 min de Chiclayo</small>
                  </dd>
                  <dt className="label">Cuota desde</dt>
                  <dd>
                    <span className="big">{soles(d.cuota)}</span> al mes
                  </dd>
                  <dt className="label">Financiamiento</dt>
                  <dd>
                    {CUOTAS} cuotas sin intereses
                    <small>Inicial desde {soles0(d.inicial)}</small>
                  </dd>
                  <dt className="label">Entrega</dt>
                  <dd>Julio 2027</dd>
                  <dt className="label">Título</dt>
                  <dd>{PROYECTO.titulo}</dd>
                </dl>
                <div className="actions">
                  <ContactCta mensaje="Hola, quiero información de los lotes de La Campiña.">Escribir a un asesor</ContactCta>
                  <a className="btn" href="#lotes">
                    <Icon name="plano" />
                    Ver lotes libres
                  </a>
                </div>
                <p className="note" style={{ marginTop: 0 }}>
                  Cuota del lote {DESDE.id} ({m2(DESDE.m2)}): {soles0(d.financiado)} financiado. Lista al {LISTA_FECHA}.
                </p>
              </div>
              <div className="cartel__media">
                <Photo
                  toma="hero"
                  sello="Toma de drone · 25 jun 2026"
                  priority
                  sizes="(max-width: 900px) 100vw, 620px"
                  aspect="4 / 3.4"
                  alt="Vista de drone de La Campiña: el terreno con los lotes y las calles trazados con cal blanca, y los cerros al fondo."
                  caption={
                    <>
                      <b>Así se ve hoy el terreno:</b> cada lote y cada calle marcados con cal.
                    </>
                  }
                />
              </div>
            </div>
            <div className="promotor">
              <span className="label">Promotor</span>
              <span className="promotor__mark" aria-label="Rosso, live your way">
                <b>ROSSO</b>
                <span className="label">Live your way</span>
              </span>
            </div>
          </div>
        </section>

        {/* ¿Qué buscas? */}
        <section aria-labelledby="t-buscas">
          <h2 id="t-buscas" className="sr-only">
            ¿Qué buscas?
          </h2>
          <div className="paths">
            <a className="path" href="?vista=precio#lotes">
              <strong>Quiero invertir</strong>
              <span>
                Compara los {r.disponibles} lotes libres por precio. Al contado desde {soles0(DESDE_CONTADO)}.
              </span>
              <em className="label">
                Ver por precio <Icon name="der" size={18} />
              </em>
            </a>
            <a className="path" href="#pagar">
              <strong>Es para mi familia</strong>
              <span>
                Tu casa de campo desde {soles(d.cuota)} al mes, en {CUOTAS} cuotas sin intereses.
              </span>
              <em className="label">
                Ver cómo pagar <Icon name="der" size={18} />
              </em>
            </a>
            <a className="path" href="#avance">
              <strong>Vivo en Lima o Trujillo</strong>
              <span>Mira el avance de la obra con fecha y elige tu lote sin viajar.</span>
              <em className="label">
                Ver el avance <Icon name="der" size={18} />
              </em>
            </a>
          </div>
        </section>

        {/* Avance de obra */}
        <section className="panel" id="avance" aria-labelledby="t-avance">
          <Band id="t-avance" title="Avance de obra" />
          <div className="panel__body">
            <p className="lead">
              Cada toma está ubicada en la fecha en que se grabó, entre el inicio y la entrega. Toca un punto para ver
              la foto o el video.
            </p>
            <Schedule />
          </div>
        </section>

        {/* Lotes */}
        <section className="panel" id="lotes" aria-labelledby="t-lotes">
          <Band id="t-lotes" title={`${r.disponibles} de ${r.total} lotes libres`} />
          <div className="panel__body">
            <p className="lead">
              Elige una manzana, toca un lote libre y mira su cuota exacta. Cada ficha tiene su propio enlace para
              mandarla por WhatsApp.
            </p>
            <LotStack />
          </div>
        </section>

        {/* Cómo pagar */}
        <section className="panel" id="pagar" aria-labelledby="t-pagar">
          <Band id="t-pagar" title="Cómo pagar tu lote" />
          <div className="panel__body">
            <dl className="fields fields--pasos">
              <dt>1 · Inicial</dt>
              <dd>Separas tu lote con una inicial desde {soles0(d.inicial)}.</dd>
              <dt>2 · {CUOTAS} cuotas</dt>
              <dd>Sin intereses: el precio menos la inicial, dividido entre {CUOTAS} meses.</dd>
              <dt>3 · Escritura</dt>
              <dd>Tu lote con escritura pública. Entrega del proyecto: {PROYECTO.entrega}.</dd>
            </dl>
            <div className="plan-wrap">
              <table className="plan">
                <caption className="label">Tres lotes reales de la lista al {LISTA_FECHA}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="label">
                      Lote
                    </th>
                    <th scope="col" className="label hide-xs">
                      Precio financiado
                    </th>
                    <th scope="col" className="label">
                      Inicial
                    </th>
                    <th scope="col" className="label">
                      Cuota mensual
                    </th>
                    <th scope="col" className="label hide-sm">
                      Al contado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {EJEMPLOS.map((l) => (
                    <tr key={l.id}>
                      <th scope="row">
                        <b>{l.id}</b>
                        {m2(l.m2)} · {soles(l.precio!.porM2)}/m²
                      </th>
                      <td className="hide-xs">{soles(l.precio!.financiado)}</td>
                      <td>{soles(l.precio!.inicial)}</td>
                      <td className="cuota">{soles(l.precio!.cuota)}</td>
                      <td className="hide-sm">{soles(l.precio!.promoContado ?? l.precio!.contado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              Si pagas al contado, el precio baja 15% respecto al financiado, y algunos lotes tienen además una
              promoción. Cada lote muestra su precio exacto en su ficha.
            </p>
          </div>
        </section>

        {/* Ubicación */}
        <section className="panel" id="ubicacion" aria-labelledby="t-ubicacion">
          <Band id="t-ubicacion" title="Ubicación" />
          <div className="panel__body place">
            <div>
              <h3>Frente al Valle de Zaña</h3>
              <p>{PROYECTO.ubicacion.frase}, en Lambayeque.</p>
              <ul className="bars" aria-label="Minutos en auto desde La Campiña">
                {PROYECTO.ubicacion.tramos.map((t) => (
                  <li key={t.lugar}>
                    <span className="label">{t.lugar}</span>
                    <span className="bar label" style={{ ["--w" as string]: `${Math.max(24, (t.minutos / maxMin) * 100)}%` }}>
                      {t.minutos} min
                    </span>
                  </li>
                ))}
              </ul>
              {PROYECTO.ubicacion.mapsUrl ? (
                <a className="btn" href={PROYECTO.ubicacion.mapsUrl} target="_blank" rel="noopener">
                  <Icon name="pin" />
                  Abrir en Google Maps
                </a>
              ) : (
                <a className="btn" href="#contacto">
                  <Icon name="pin" />
                  Pedir la ubicación exacta
                </a>
              )}
            </div>
            <Photo
              toma="portico"
              sello="Ingreso · 11 abr 2026"
              alt="El ingreso de La Campiña: muros blancos del pórtico, cerco de caña y palmeras jóvenes, con los cerros al fondo."
            />
          </div>
        </section>

        {/* Áreas comunes */}
        <section className="panel" id="areas" aria-labelledby="t-areas">
          <Band id="t-areas" title="Áreas comunes" />
          <div className="panel__body areas">
            <div className="checklist">
              <div>
                <h3>Ya en el terreno</h3>
                <ul>
                  {YA_HECHO.map((x) => (
                    <li key={x.nombre}>
                      <span className="box box--on" aria-hidden="true">
                        <Icon name="check" size={18} />
                      </span>
                      <a href="#avance">{x.nombre}</a>
                      <small>Visto en obra el {x.fecha}</small>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Por entregar · {PROYECTO.entrega}</h3>
                <ul>
                  {PROYECTO.areas
                    .filter((a) => a.id !== "portico")
                    .map((a) => (
                      <li key={a.id}>
                        <span className="box" aria-hidden="true" />
                        <span>{a.nombre}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <Photo
              toma="cerco-jun"
              sello="Frente · 25 jun 2026"
              alt="El frente del proyecto con cerco de caña, área de grass y lotes marcados con cal."
            />
          </div>
        </section>

        {/* Contacto */}
        <section className="panel" id="contacto" aria-labelledby="t-contacto">
          <Band id="t-contacto" title="Habla con un asesor" />
          <div className="panel__body contact">
            <div>
              <h3>Te escribimos nosotros</h3>
              <p>
                Déjanos tu número y un asesor te contacta con la ficha de tu lote. Si quieres, coordinamos una visita al
                terreno.
              </p>
              {wa || tel ? (
                <div className="direct">
                  {wa ? (
                    <a className="btn btn--primary" href={wa} target="_blank" rel="noopener">
                      <Icon name="chat" />
                      Escribir por WhatsApp
                    </a>
                  ) : null}
                  {tel ? (
                    <a className="btn" href={`tel:${tel}`}>
                      <Icon name="fono" />
                      Llamar
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot__in">
          <p>
            <b>{PROYECTO.nombre}</b> es un proyecto de {PROYECTO.empresa}. {PROYECTO.titulo}.
          </p>
          <p>
            Precios y disponibilidad según la lista vigente al {LISTA_FECHA}; pueden cambiar sin aviso. Las imágenes son
            tomas reales de la obra, con la fecha en que se grabaron.
          </p>
        </div>
      </footer>

      <nav className="mbar" aria-label="Acciones rápidas">
        <a className="btn btn--small" href="#lotes">
          <Icon name="plano" size={18} />
          Lotes
        </a>
        <ContactCta mensaje="Hola, vi La Campiña en la web y quiero información de los lotes." className="btn btn--primary btn--small">
          Asesor
        </ContactCta>
      </nav>

      <NavCurrent ids={MENU.map(([id]) => id)} />
    </>
  );
}
