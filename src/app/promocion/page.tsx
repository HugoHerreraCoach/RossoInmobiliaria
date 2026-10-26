import type { Metadata } from "next";
import { Landing } from "@/components/Landing";
import { lotesVigentes } from "@/server/lotes";

// Landing de prueba para el público de Lima (docs/0017): el mismo contenido que "/", con sus propias preguntas,
// su hoja de leads (GOOGLE_SHEETS_ID_PROMOCION) y sus eventos de píxel. Es una página de campaña: no se indexa,
// para que los buscadores no la tomen como un duplicado de la portada.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Lotes vigentes y revalidación como en "/" (docs/0032).
export const revalidate = 300;

export default async function Promocion() {
  return <Landing landing="lima" lotes={await lotesVigentes()} />;
}
