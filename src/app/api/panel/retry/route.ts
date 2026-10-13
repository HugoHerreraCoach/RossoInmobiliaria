import { db, rateLimit } from "@/server/store";
import { drain } from "@/server/delivery";
import { failure, json, requireOrigin, requirePanel } from "@/server/security";
export const maxDuration=60;
export async function POST(req: Request) {try { requirePanel(req);requireOrigin(req);await rateLimit(req,"retry",5);const requeued=await db("retry");return json({requeued,...await drain(10)});}catch(e){return failure(e);}}
