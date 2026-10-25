// Datos del proyecto. Fuente: Drive Rosso (Copys del Área comercial, manual de marca,
// lista de precios). Lo marcado PENDIENTE no se inventa: mientras sea null, la web
// lleva todo contacto al formulario y no muestra números.

/** Número de WhatsApp de Rosso para La Campiña (Perú, +51). */
export const WHATSAPP_ROSSO = "51941377136";

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
      { lugar: "Chiclayo", minutos: 30 },
    ],
    /** PENDIENTE: enlace exacto de Google Maps (el documento comercial lo trae cortado). */
    mapsUrl: (process.env.NEXT_PUBLIC_MAPS_URL?.trim() || null) as string | null,
  },
  contacto: {
    /** WhatsApp de asesores que recibe los mensajes (941 377 136, docs/0015), formato internacional sin "+".
     *  Un NEXT_PUBLIC_WHATSAPP_NUMBER con valor lo reemplaza al compilar. */
    whatsapp: ((process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || WHATSAPP_ROSSO).replace(/\D/g, "") || null) as string | null,
    /** PENDIENTE: foto real del asesor para el botón flotante (ruta en /public, con su autorización).
     *  Mientras sea null, el botón muestra un ícono en lugar de una persona. */
    asesorFoto: null as string | null,
    /** PENDIENTE: teléfono para llamadas, formato internacional (ej. +51987654321). */
    telefono: (process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || null) as string | null,
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

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
