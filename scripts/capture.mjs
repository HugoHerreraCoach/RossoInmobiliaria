// Capturas de revisión con Chrome headless vía DevTools Protocol (sin dependencias).
// Uso: node scripts/capture.mjs <url> <salida.png> <ancho> [alto|full] [dpr]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, out, width = "1440", height = "full", dpr = "1"] = process.argv.slice(2);
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "cap-"));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  "--hide-scrollbars", "--no-first-run", "--disable-gpu", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    target = list.find((t) => t.type === "page");
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  else if (m.method) events.push(m);
});
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

const w = +width;
const vh = height === "full" ? (w < 600 ? 844 : 900) : +height;
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: w, height: vh, deviceScaleFactor: +dpr, mobile: w < 600 });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await send("Page.navigate", { url });
for (let i = 0; i < 100 && !events.some((e) => e.method === "Page.loadEventFired"); i++) await sleep(100);
await send("Runtime.evaluate", { expression: "document.fonts.ready.then(()=>1)", awaitPromise: true });
// Recorre la página para que carguen las imágenes diferidas.
await send("Runtime.evaluate", { expression: "(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0);await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})));return 1})()", awaitPromise: true });
await sleep(800);
if (process.env.EVAL) {
  const r = await send("Runtime.evaluate", { expression: process.env.EVAL, awaitPromise: true, returnByValue: true });
  console.log(JSON.stringify(r.result.result.value, null, 1));
}
let clip;
if (height === "full") {
  const m = await send("Page.getLayoutMetrics");
  const h = Math.ceil(m.result.cssContentSize.height);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: +dpr, mobile: w < 600 });
  await sleep(600);
  clip = { x: 0, y: 0, width: w, height: h, scale: 1 };
}
const shot = await send("Page.captureScreenshot", { format: "png", ...(clip ? { clip, captureBeyondViewport: true } : {}) });
writeFileSync(out, Buffer.from(shot.result.data, "base64"));
console.log(`ok ${out}`);
ws.close();
chrome.kill();
process.exit(0);
