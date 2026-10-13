import { PanelSnapshot } from "@/lib/tracking/schema";
import { db } from "@/server/store";
import { csvCell, panelRange } from "@/server/panel";
import { failure, HttpError, requirePanel } from "@/server/security";
export const runtime="nodejs";
export async function GET(req:Request){try{
  requirePanel(req);const data=await db<PanelSnapshot>("snapshot",panelRange(req));if(data.truncated)throw new HttpError(422,"El rango supera 20 000 eventos. Acota las fechas para exportar todos los datos.");
  const headers=["fecha_utc","evento","evento_id","visitante_id","sesion","pagina","dispositivo","primera_fuente","ultima_fuente","campana","campana_id","conjunto_id","anuncio_id","boton","lote","profundidad","segundos_activos"];
  const lines=data.events.map(e=>[e.at,e.name,e.id,e.visitor_id,e.session_id,e.path,e.device,e.attribution.first.source,e.attribution.last.source,e.attribution.last.campaign,e.attribution.last.campaign_id,e.attribution.last.adset_id,e.attribution.last.ad_id,e.properties.source,e.properties.lot,e.properties.depth,e.properties.seconds].map(csvCell).join(","));
  return new Response("\uFEFF"+[headers.map(csvCell).join(","),...lines].join("\r\n"),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=rosso-rastros.csv","Cache-Control":"no-store, private","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex"}});
}catch(e){return failure(e);}}
