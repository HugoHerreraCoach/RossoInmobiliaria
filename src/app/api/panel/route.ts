import { db, storageMode } from "@/server/store";
import { providerConfig } from "@/server/delivery";
import { panelRange } from "@/server/panel";
import { failure, json, requirePanel } from "@/server/security";
import { PanelSnapshot } from "@/lib/tracking/schema";
export const runtime="nodejs";
export async function GET(req:Request){try{requirePanel(req);const data=await db<PanelSnapshot>("snapshot",panelRange(req));return json({...data,configuration:{...providerConfig(),storage:storageMode()},updated_at:new Date().toISOString()});}catch(e){return failure(e);}}
