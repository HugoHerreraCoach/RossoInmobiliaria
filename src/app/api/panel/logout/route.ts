import { cookieHeader, failure, json, PANEL_COOKIE, requireOrigin } from "@/server/security";
export async function POST(req: Request) {try {requireOrigin(req);return json({ok:true},200,{"Set-Cookie":cookieHeader(PANEL_COOKIE,"",0)});}catch(e){return failure(e);}}
