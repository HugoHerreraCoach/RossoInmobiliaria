import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { PROYECTO, SITE_URL } from "@/content/proyecto";
import { DESDE, soles } from "@/content/lotes";
import "./globals.css";
import { MotionExperience } from "@/components/MotionExperience";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";
import { UiProposalSwitcher } from "@/components/UiProposalSwitcher";

// Pareja tipográfica de la referencia (landing de Grupo DLC): una geométrica para titulares y cifras,
// una humanista para el texto y una serif editorial para acentos de casa de campo.
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-display", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

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
  themeColor: "#06120e",
};

// Marca que hay JS antes del primer pintado (los revelados y el hero dependen de html.js) y aplica
// la pausa de movimiento guardada y la propuesta visual elegida.
const BOOT = `(function(){var d=document.documentElement;d.classList.add('js');try{if(localStorage.getItem('rosso.motion.v1')==='paused')d.dataset.motion='paused';var u=new URLSearchParams(location.search).get('ui')||localStorage.getItem('rosso.ui.proposal.v2')||'verde';if(u==='verde'||u==='rosso'||u==='oscuro')d.dataset.ui=u;}catch(e){d.dataset.ui='verde';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" data-ui="verde" className={`${outfit.variable} ${jakarta.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        {children}
        <UiProposalSwitcher />
        <SmoothScroll />
        <MotionExperience />
        <TrackingProvider />
      </body>
    </html>
  );
}
