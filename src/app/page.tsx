import { Landing } from "@/components/Landing";
import { lotesVigentes } from "@/server/lotes";

// Los estados de los lotes salen de la lista y de los cambios de /panel (docs/0032). El panel revalida la página al
// guardar; cada 5 minutos se regenera igual, por si una revalidación falla.
export const revalidate = 300;

// Landing de Lambayeque, la original (docs/0017): formulario a su hoja de leads y CompleteRegistration en los píxeles.
export default async function Home() {
  return <Landing landing="lambayeque" lotes={await lotesVigentes()} />;
}
