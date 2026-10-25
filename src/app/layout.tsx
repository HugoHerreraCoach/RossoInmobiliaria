import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { PROYECTO, SITE_URL } from "@/content/proyecto";
import { DESDE, soles } from "@/content/lotes";
import "./globals.css";
import { MotionExperience } from "@/components/MotionExperience";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";

// Pareja tipográfica de la referencia (landing de Grupo DLC): una geométrica para titulares y cifras,
// una humanista para el texto. next/font las aloja en el propio sitio al compilar.
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-display", display: "optional" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text", display: "optional" });

const descripcion = `Club de campo privado y ecológico con lotes desde 510 m² en el ${PROYECTO.valle}, a ${PROYECTO.ubicacion.tramos.find((t) => t.lugar === "Chiclayo")!.minutos} minutos de Chiclayo. Desde ${soles(DESDE.precio!.cuota)} al mes en 48 cuotas sin intereses. Consulta condiciones y documentación. Entrega ${PROYECTO.entrega}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PROYECTO.nombre} · Club Privado en el ${PROYECTO.valle} | Rosso Inmobiliaria`,
    template: `%s · ${PROYECTO.nombre}`,
  },
  description: descripcion,
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: PROYECTO.nombre,
    title: `${PROYECTO.nombre} · Club de Campo en el ${PROYECTO.valle}`,
    description: descripcion,
    images: [
      {
        url: "/media/hero.webp",
        alt: "Vista aérea de drone de los lotes trazados en La Campiña, Valle de Zaña",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06120e",
};

// Marca que hay JS antes del primer pintado (los revelados y el hero dependen de html.js) y aplica
// la pausa de movimiento guardada, para que nada arranque y se detenga de golpe.
const BOOT = `(function(){var d=document.documentElement;d.classList.add('js');try{if(localStorage.getItem('rosso.motion.v1')==='paused')d.dataset.motion='paused'}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={`${outfit.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        {children}
        <SmoothScroll />
        <MotionExperience />
        <TrackingProvider />
      </body>
    </html>
  );
}
