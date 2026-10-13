// Datos del proyecto. Fuente: Drive Rosso (Copys del Área comercial, manual de marca,
// lista de precios). Lo marcado PENDIENTE no se inventa: mientras sea null, la web
// lleva todo contacto al formulario y no muestra números.

export const PROYECTO = {
  nombre: "La Campiña",
  empresa: "Rosso Inmobiliaria",
  valle: "Valle de Zaña",
  entrega: "julio 2027",
  titulo: "Escritura pública",
  ubicacion: {
    frase: "Frente al Valle de Zaña, al borde de la vía a San Nicolás",
    tramos: [
      { lugar: "Saltur", minutos: 6 },
      { lugar: "Cayaltí", minutos: 8 },
      { lugar: "Chiclayo", minutos: 35 },
    ],
    /** PENDIENTE: enlace exacto de Google Maps (el documento comercial lo trae cortado). */
    mapsUrl: null as string | null,
  },
  contacto: {
    /** PENDIENTE: número de WhatsApp de asesores, formato internacional sin "+" (ej. 51987654321). */
    whatsapp: null as string | null,
    /** PENDIENTE: teléfono para llamadas, formato internacional (ej. +51987654321). */
    telefono: null as string | null,
  },
  /** Lo que incluye el proyecto (entrega julio 2027). */
  areas: [
    { id: "portico", nombre: "Pórtico de ingreso" },
    { id: "cerco", nombre: "Cerco vivo" },
    { id: "agua", nombre: "Agua de pozo tubular" },
    { id: "solar", nombre: "Vías con iluminación solar" },
    { id: "hamaca", nombre: "Zona de hamacas" },
    { id: "parrilla", nombre: "Zona de parrillas" },
    { id: "cancha", nombre: "Cancha de grass natural" },
    { id: "juegos", nombre: "Juegos para niños" },
    { id: "gym", nombre: "Gimnasio al aire libre" },
  ],
} as const;

/** Enlace de WhatsApp con mensaje listo, o null si aún no hay número. */
export function whatsappHref(mensaje: string): string | null {
  const n = PROYECTO.contacto.whatsapp;
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}` : null;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== ""
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://rosso-inmobiliaria-eight.vercel.app";
