"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MEDIA, type Toma } from "@/content/avance";
import { Icon } from "./Icon";

/** Foto real de obra con su sello de fecha. Si la toma es de video, se reproduce al pedirla. */
export function Photo({
  toma,
  sello,
  alt,
  caption,
  priority = false,
  sizes = "(max-width: 900px) 100vw, 560px",
  aspect,
}: {
  toma: Toma;
  sello: string;
  alt: string;
  caption?: React.ReactNode;
  priority?: boolean;
  sizes?: string;
  aspect?: string;
}) {
  const m = MEDIA[toma];
  const [play, setPlay] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (play) v.play().catch(() => setPlay(false));
    else v.pause();
  }, [play]);

  // Al cambiar de toma, vuelve a la foto.
  useEffect(() => setPlay(false), [toma]);

  return (
    <figure className="photo">
      <div className="photo__media" style={{ ["--ar" as string]: aspect ?? `${m.colorSize[0]} / ${m.colorSize[1]}` }}>
        <span className="stamp label">{sello}</span>
        <Image src={m.color} alt={alt} fill sizes={sizes} priority={priority} />
        {m.video && play ? (
          <video ref={video} src={m.video} poster={m.color} muted loop playsInline autoPlay aria-label={`Video: ${alt}`} />
        ) : null}
        {m.video ? (
          <button
            type="button"
            className="btn btn--small photo__play"
            aria-pressed={play}
            onClick={() => setPlay((x) => !x)}
          >
            <Icon name={play ? "pausa" : "play"} size={16} />
            {play ? "Pausar" : "Ver el video"}
          </button>
        ) : null}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
