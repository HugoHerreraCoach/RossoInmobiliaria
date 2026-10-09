import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { PROYECTO, SITE_URL } from "@/content/proyecto";
import { DESDE, soles } from "@/content/lotes";
import "./globals.css";

// Una sola familia con eje de ancho: rótulos condensados, texto normal, titulares expandidos.
const archivo = Archivo({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const descripcion = `Lotes campestres desde 510 m² en el ${PROYECTO.valle}, a 35 minutos de Chiclayo. ${soles(DESDE.precio!.cuota)} al mes en 48 cuotas sin intereses. Escritura pública. Entrega ${PROYECTO.entrega}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PROYECTO.nombre} · Lotes en el ${PROYECTO.valle}`,
    template: `%s · ${PROYECTO.nombre}`,
  },
  description: descripcion,
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: PROYECTO.nombre,
    title: `${PROYECTO.nombre} · Tu lote en el ${PROYECTO.valle} ya tiene calles`,
    description: descripcion,
    images: [{ url: "/media/hero.webp", alt: "Vista de drone de los lotes trazados con cal en La Campiña, 25 de junio de 2026" }],
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
    <html lang="es-PE" data-paleta="proyecto" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PALETA_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
