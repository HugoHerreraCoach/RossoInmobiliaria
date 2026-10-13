import { HttpError } from "./security";
export function panelRange(req: Request) {
  const q=new URL(req.url).searchParams;const today=new Date(Date.now()-5*3600000).toISOString().slice(0,10);
  const to=q.get("to")||today;const from=q.get("from")||new Date(Date.parse(`${today}T00:00:00Z`)-6*86400000).toISOString().slice(0,10);
  for(const value of [from,to])if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(`${value}T00:00:00Z`))||new Date(`${value}T00:00:00Z`).toISOString().slice(0,10)!==value)throw new HttpError(400,"Fecha inválida.");
  const a=Date.parse(`${from}T00:00:00-05:00`),b=Date.parse(`${to}T00:00:00-05:00`)+86400000;
  if(b<=a||b-a>31*86400000)throw new HttpError(400,"Selecciona un rango de hasta 31 días.");
  return {from:new Date(a).toISOString(),to:new Date(b).toISOString()};
}
export function csvCell(v:unknown){let s=String(v??"");if(/^[\s]*[=+\-@]/.test(s)||/^[\t\r\n]/.test(s))s=`'${s}`;return `"${s.replace(/"/g,'""')}"`;}
