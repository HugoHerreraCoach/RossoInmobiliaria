"use client";

import { useEffect, useState } from "react";
import { LISTA_FECHA, m2, type Lote } from "@/content/lotes";
import { PROYECTO } from "@/content/proyecto";
import { Icon } from "./Icon";
import { LotStack } from "./LotStack";
import { WhatsAppCta } from "./WhatsAppCta";

/** Página de un lote (/lote/[id]): el plano sigue siendo interactivo y, al tocar otro lote, la
 *  página muestra su ficha sin recargar. La dirección y el título siguen al lote elegido.
 *  Con ?origen=promocion (llegó desde /promocion, docs/0017), los enlaces de vuelta van a esa landing. */
export function LoteDetalle({ inicial }: { inicial: Lote }) {
  const [lote, setLote] = useState(inicial);
  const [origen, setOrigen] = useState<string | undefined>();
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("origen") === "promocion") setOrigen("promocion");
  }, []);
  const inicio = origen === "promocion" ? "/promocion" : "/";
  const volver = `${inicio}?vista=${lote.manzana}&lote=${lote.id}#lotes`;

  const cambiar = (l: Lote) => {
    setLote(l);
    window.history.replaceState(null, "", `/lote/${l.id}${origen === "promocion" ? "?origen=promocion" : ""}`);
    document.title = `Lote ${l.id} · ${m2(l.m2)} en Manzana ${l.manzana} · ${PROYECTO.nombre}`;
  };

  return (
    <>
      <header className="site-header is-solid">
        <a className="site-header__brand" href="/">La Campiña</a>
        <a className="btn btn--small" href={volver}>Volver al plano</a>
      </header>

      <main className="lotpage">
        <a className="text-link" href={volver}>← Todos los lotes de la manzana {lote.manzana}</a>
        <h1 className="lotpage__title">Ficha del lote {lote.id}</h1>
        <p className="lotpage__lead">
          {m2(lote.m2)} en la manzana {lote.manzana} de {PROYECTO.nombre}, {PROYECTO.valle}. Datos de la lista del {LISTA_FECHA}.
        </p>
        <p className="notice"><Icon name="info" size={17} /> Toca cualquier lote del plano para ver su ficha. El plano reproduce el plano de lotización del proyecto y es referencial: confirma la ubicación, las medidas y la disponibilidad con un asesor.</p>

        <LotStack lote={inicial} onLote={cambiar} origen={origen} />

        <div className="lotpage__about">
          <h2>Sobre {PROYECTO.nombre}</h2>
          <p>
            Club de campo privado y ecológico de {PROYECTO.empresa}, con {PROYECTO.titulo.toLowerCase()} y entrega programada para{" "}
            {PROYECTO.entrega}. En la página principal puedes ver los vuelos de drone y las fotos fechadas de la obra.
          </p>
          <WhatsAppCta
            mensaje={`Hola, quiero asesoría sobre el lote ${lote.id} de ${PROYECTO.nombre} (${m2(lote.m2)}).`}
            track="lot-whatsapp" lot={lote.id}
            fallback={`${inicio}?lote=${lote.id}#formulario`}
          >
            Pedir asesoría por el lote {lote.id}
          </WhatsAppCta>
        </div>
      </main>
    </>
  );
}
