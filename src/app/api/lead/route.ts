import { randomUUID } from "node:crypto";
import { loteById } from "@/content/lotes";
import { UUID } from "@/lib/tracking/schema";
import { createIntent } from "@/server/intents";
import { db, rateLimit } from "@/server/store";
import { failure, hash, HttpError, json, readJson, requireOrigin } from "@/server/security";
export const runtime="nodejs";
export const maxDuration=60;
const clean=(v:unknown,n=120)=>typeof v==="string"?v.trim().replace(/[\u0000-\u001f<>]/g,"").slice(0,n):"";
export async function POST(req:Request){
  let claim:{state:string;lease?:string;result?:unknown}|null=null;let submission="";
  try{
    requireOrigin(req);const b=await readJson(req);if(b.website)throw new HttpError(400,"Solicitud inválida.");
    const lead={nombre:clean(b.nombre),celular:clean(b.celular,20).replace(/[^\d+]/g,""),ciudad:clean(b.ciudad,40),busca:clean(b.busca,40),lote:clean(b.lote,8).toUpperCase(),visita:b.visita===true,dia:clean(b.dia,40),consentimiento:b.consentimiento===true};
    const errors:Record<string,string>={};if(lead.nombre.length<2)errors.nombre="Escribe tu nombre.";if(!/^\+?\d{9,15}$/.test(lead.celular))errors.celular="Revisa tu número de celular.";if(!lead.consentimiento)errors.consentimiento="Autoriza el contacto para poder enviar tu solicitud.";if(lead.lote&&!loteById(lead.lote))errors.lote="Revisa el código del lote.";
    if(Object.keys(errors).length)return json({error:"validacion",errores:errors},422);
    const destination=process.env.LEAD_WEBHOOK_URL;if(!destination)return json({error:"sin-destino"},503);
    const url=new URL(destination);if(url.protocol!=="https:"&&!(process.env.NODE_ENV!=="production"&&url.protocol==="http:"&&["localhost","127.0.0.1"].includes(url.hostname)))throw new HttpError(503,"El destino del CRM debe ser HTTPS.");
    await rateLimit(req,"form",8,900);
    submission=typeof b.submission_id==="string"&&UUID.test(b.submission_id)?b.submission_id:randomUUID();
    claim=await db("form_claim",{id:submission,fingerprint:hash(JSON.stringify(lead))});
    if(claim!.state==="done")return json(claim!.result);
    if(claim!.state==="conflict")throw new HttpError(409,"Identificador usado por otra solicitud.");
    if(claim!.state==="busy")throw new HttpError(409,"Tu solicitud se está procesando. Espera antes de volver a enviar.");
    const source=b.source==="contacto-form"?"contacto-form":"hero-form";
    const intent=await createIntent(req,b.tracking,"form",submission,{source,lot:lead.lote});
    let response:Response;
    try{response=await fetch(destination,{method:"POST",redirect:"error",signal:AbortSignal.timeout(10000),headers:{"content-type":"application/json","Idempotency-Key":submission,...(process.env.LEAD_WEBHOOK_TOKEN?{authorization:`Bearer ${process.env.LEAD_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({...lead,proyecto:"La Campiña",origen:"web",fecha:new Date().toISOString(),submission_id:submission,...(intent?{intencion_id:intent.id,codigo:intent.code,atribucion:intent.event.attribution,tracking_consent:{analytics:true,marketing:intent.event.marketing}}:{tracking_consent:{analytics:false,marketing:false}})})});}catch{throw new HttpError(502,"crm");}
    if(!response.ok)throw new HttpError(502,"crm");
    const result={ok:true,...(intent?{event_id:intent.event.id,intencion_id:intent.id}:{})};
    await db("form_finish",{id:submission,lease:claim!.lease,ok:true,result,event:intent?.event||null});return json(result);
  }catch(e){if(claim?.state==="acquired")await db("form_finish",{id:submission,lease:claim.lease,ok:false,result:null}).catch(()=>undefined);return failure(e);}
}
