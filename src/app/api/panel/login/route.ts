import { rateLimit } from "@/server/store";
import { cookieHeader, failure, hash, HttpError, json, PANEL_COOKIE, passwordValid, readJson, requireOrigin, sign } from "@/server/security";
export const runtime = "nodejs";
export async function POST(req: Request) { try {
  requireOrigin(req); await rateLimit(req, "panel-login", 5, 900); const b=await readJson(req,1024);
  if (!passwordValid(b.password)) throw new HttpError(401,"Contraseña incorrecta.");
  return json({ok:true},200,{"Set-Cookie":cookieHeader(PANEL_COOKIE,sign({kind:"panel",version:hash(process.env.PANEL_PASSWORD_HASH!),exp:Date.now()+8*3600000}),8*3600)});
} catch(e){ return failure(e); } }
