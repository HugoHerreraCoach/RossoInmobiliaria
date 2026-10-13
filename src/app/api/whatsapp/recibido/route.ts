// Canonical confirmation only. A click code without a stored CRM message cannot create a Lead.
import { POST } from "@/app/api/conexigo/conversiones/route";
export const runtime = "nodejs";
export const maxDuration = 60;
export { POST };
