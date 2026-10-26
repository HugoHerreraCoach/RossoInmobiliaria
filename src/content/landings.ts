import { REGISTRATION_EVENT } from "@/lib/tracking/pixels";
import { DESDE_CONTADO, DISPONIBLES, soles0 } from "./lotes";

/* Dos landings con el mismo contenido para pruebas de público (docs/0017):
   - Lambayeque, en "/": la original, sin cambios.
   - Lima, en "/promocion": cambian las preguntas del formulario, el evento que envían los píxeles de Meta y
     TikTok y la hoja de Google Sheets donde caen los leads (otro archivo: GOOGLE_SHEETS_ID_PROMOCION).
   Lo usan el formulario (navegador), /api/lead y la hoja (servidor) y los píxeles; por eso vive en un solo lugar. */

export type LandingId = "lambayeque" | "lima";
export type Opcion = { valor: string; etiqueta: string };
/** Pregunta de opción única. `id` es el nombre del campo; `columna`, su encabezado en la hoja. */
export type Pregunta = { id: string; texto: string; columna: string; opciones: Opcion[]; marcada?: string };
export type Landing = {
  id: LandingId;
  ruta: "/" | "/promocion";
  /** Fuente del formulario en la medición, el CRM y la columna ORIGEN de la hoja. */
  source: "hero-form" | "promocion-form";
  /** Fuente del formulario del chat flotante (docs/0029): las mismas preguntas, con su propio ORIGEN en la hoja. */
  chat: "chat-form" | "promocion-chat";
  preguntas: Pregunta[];
  /** Pregunta cuya respuesta acompaña al evento de los píxeles (parámetro `inicial`). */
  preguntaPixel: string;
  /** Evento de conversión que el navegador envía cuando la hoja confirma el registro: el mismo nombre y el mismo id de
   *  evento en Meta y en TikTok. */
  evento: string;
};

// Montos: la inicial mínima y el contado más bajo salen de la lista de precios.
// El valor que se guarda usa espacios normales; en pantalla, espacio duro para que "S/" no quede solo al final de la línea.
const INICIAL_MIN = Math.min(...DISPONIBLES.map((l) => l.precio!.inicial));
const normal = (s: string) => s.replace(/\u00a0/g, " ");
const pegado = (s: string) => s.replace(/S\/ /g, "S/\u00a0").replace(/ mil\b/g, "\u00a0mil");
const DESDE_INICIAL = `Desde S/ ${Math.round(INICIAL_MIN / 1000)} mil`;
const CONTADO = `Pago al contado S/ ${Math.round(DESDE_CONTADO / 1000)} mil`;
const AL_CONTADO = normal(`Al contado ${soles0(DESDE_CONTADO)}`);
const FINANCIADO = normal(`Financiado desde ${soles0(INICIAL_MIN)}`);

/** La pregunta del formulario de Lambayeque ("/"). Su respuesta viaja en `busca` (texto
 *  libre, 40 caracteres): el contrato original de /api/lead. */
const INICIAL: Pregunta = {
  id: "busca",
  texto: "¿Con cuánto cuentas de inicial?",
  columna: "INICIAL",
  opciones: [
    { valor: DESDE_INICIAL, etiqueta: pegado(DESDE_INICIAL) },
    { valor: CONTADO, etiqueta: pegado(CONTADO) },
  ],
  marcada: DESDE_INICIAL,
};

/** Primera pregunta de Lima ("/promocion"), corta y directa, con la primera opción pre-seleccionada por defecto. */
const ZONA: Pregunta = {
  id: "zona",
  texto: "¿Buscas lote en Valle Zaña (a 30 min de Chiclayo)?",
  columna: "ZONA",
  opciones: [
    { valor: "Sí, me interesa el Valle Zaña.", etiqueta: "Sí, me interesa" },
    { valor: "Me puedo adecuar", etiqueta: "Me puedo adecuar" },
  ],
  marcada: "Sí, me interesa el Valle Zaña.",
};

/** Segunda pregunta de Lima ("/promocion"), corta y directa, con la primera opción pre-seleccionada por defecto. */
const MODALIDAD: Pregunta = {
  id: "modalidad",
  texto: "¿Qué modalidad de preventa prefieres?",
  columna: "MODALIDAD",
  opciones: [
    { valor: AL_CONTADO, etiqueta: pegado(`Contado S/ ${Math.round(DESDE_CONTADO / 1000)} mil`) },
    { valor: FINANCIADO, etiqueta: pegado(`Inicial desde S/ ${Math.round(INICIAL_MIN / 1000)} mil`) },
  ],
  marcada: AL_CONTADO,
};

export const LANDINGS: Record<LandingId, Landing> = {
  lambayeque: {
    id: "lambayeque",
    ruta: "/",
    source: "hero-form",
    chat: "chat-form",
    preguntas: [INICIAL],
    preguntaPixel: INICIAL.id,
    evento: REGISTRATION_EVENT,
  },
  lima: {
    id: "lima",
    ruta: "/promocion",
    source: "promocion-form",
    chat: "promocion-chat",
    // Sus respuestas viajan en `respuestas` (el formato de esta landing), cada una en su columna de la hoja, en este orden.
    preguntas: [ZONA, MODALIDAD],
    preguntaPixel: MODALIDAD.id,
    // Distinto al de Lambayeque y el mismo en los dos píxeles (pedido del cliente, docs/0021), para medir y optimizar
    // cada campaña por separado. Contact es estándar en Meta y en TikTok, y TikTok lo acepta para optimizar (CONSULT);
    // SubmitApplication no (docs/0030). Nunca "Lead" ni "SubmitForm" (TikTok lo cuenta como Lead): Lead lo envía solo
    // el servidor cuando ConexiGO confirma el mensaje.
    evento: "Contact",
  },
};

export function landingPorSource(source: unknown): Landing {
  return source === LANDINGS.lima.source || source === LANDINGS.lima.chat ? LANDINGS.lima : LANDINGS.lambayeque;
}

/** Respuestas válidas de una landing: solo preguntas conocidas y opciones existentes. Devuelve los errores por campo. */
export function validarRespuestas(landing: Landing, valor: unknown): { respuestas: Record<string, string>; errores: Record<string, string> } {
  const entrada = valor && typeof valor === "object" && !Array.isArray(valor) ? (valor as Record<string, unknown>) : {};
  const respuestas: Record<string, string> = {};
  const errores: Record<string, string> = {};
  for (const p of landing.preguntas) {
    const v = entrada[p.id];
    if (typeof v === "string" && p.opciones.some((o) => o.valor === v)) respuestas[p.id] = v;
    else errores[p.id] = "Elige una opción.";
  }
  return { respuestas, errores };
}
