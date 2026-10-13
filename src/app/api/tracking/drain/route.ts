import { db } from "@/server/store";
import { drain } from "@/server/delivery";
import { constantEqual, failure, HttpError, json } from "@/server/security";
export const runtime="nodejs";
export const maxDuration=60;
async function run(req: Request) { try { const secret=process.env.CRON_SECRET;if(!secret || secret.length<32 || !constantEqual(req.headers.get("authorization") || "",`Bearer ${secret}`)) throw new HttpError(401,"No autorizado.");const result=await drain(20);const pruned=await db("prune");return json({...result,pruned});}catch(e){return failure(e);} }
export const GET=run;
export const POST=run;
