import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { PROYECTO, SITE_URL } from "@/content/proyecto";
import { DESDE, soles } from "@/content/lotes";
import "./globals.css";
import "./redesign.css";
import "./experience.css";
import { MotionExperience } from "@/components/MotionExperience";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const descripcion = `Club de campo privado y ecológico con lotes desde 510 m² en el ${PROYECTO.valle}, a 35 minutos de Chiclayo. Desde ${soles(DESDE.precio!.cuota)} al mes en 48 cuotas sin intereses. Consulta condiciones y documentación. Entrega ${PROYECTO.entrega}.`;

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
};

// Aplica la paleta antes del primer pintado: ?paleta= manda; si no, la última elegida.
const PALETA_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search).get('paleta');var p=q||localStorage.getItem('paleta');if(p==='rosso'||p==='proyecto'){document.documentElement.dataset.paleta=p;if(q)localStorage.setItem('paleta',p)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-PE"
      data-paleta="proyecto"
      className={`${outfit.variable} ${jakarta.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PALETA_SCRIPT }} />
      </head>
      <body>{children}<MotionExperience /><TrackingProvider /></body>
    </html>
  );
}
