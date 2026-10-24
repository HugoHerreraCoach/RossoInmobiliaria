// Imágenes de marketing de la landing (docs/0024): renders 3D del proyecto y tomas de dron editadas con IA.
// Ninguna es una foto sin retoque, así que la web las rotula «Imagen referencial»; las fotos y videos fechados
// de obra siguen saliendo de scripts/build-assets.mjs (media.json). Cada archivo lleva su procedencia.
//
// Uso: IMAGENES_DRIVE=<carpeta con IMG_xx.png> IMAGENES_FOTOS=<carpeta FOTOS ROSSO> node scripts/build-imagenes.mjs
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = join(ROOT, "public", "media");
const DIRS = { drive: process.env.IMAGENES_DRIVE, fotos: process.env.IMAGENES_FOTOS };
const ORIGEN = {
  drive: "Render 3D del proyecto, no es una foto (Drive de Conexipema, carpeta 1SF9YeUqJFyh51XeWMWk0KuG2tlH6Wp-w)",
  fotos: "Toma de dron editada con IA: el archivo trae la credencial C2PA de OpenAI/ChatGPT (carpeta «Marketing - MCP/FOTOS ROSSO»)",
};

/** `tipo`: "render" (proyección del proyecto terminado) o "editada" (dron real retocado con IA). */
const SHOTS = [
  { id: "ingreso-vista", dir: "fotos", src: "Vista aérea de propiedad serrana.png", tipo: "editada" },
  { id: "parcelas-aerea", dir: "fotos", src: "Parcelas aéreas en luz natural.png", tipo: "editada" },
  { id: "lotes-cerros", dir: "fotos", src: "Lotes marcados bajo montañas soleadas.png", tipo: "editada" },
  { id: "render-ingreso", dir: "drive", src: "IMG_02.png", tipo: "render" },
  { id: "render-hamacas", dir: "drive", src: "IMG_06.png", tipo: "render" },
  { id: "render-juegos", dir: "drive", src: "IMG_07.png", tipo: "render" },
  { id: "render-gimnasio", dir: "drive", src: "IMG_09.png", tipo: "render" },
];

const manifest = {};
for (const s of SHOTS) {
  if (!DIRS[s.dir]) throw new Error(`Falta la variable de la carpeta "${s.dir}" (IMAGENES_DRIVE / IMAGENES_FOTOS)`);
  const src = join(DIRS[s.dir], s.src);
  if (!existsSync(src)) throw new Error(`falta: ${src}`);
  // Todas son 16:9 (renders 3840 × 2160, editadas 1672 × 941): mismo tamaño que las tomas de obra.
  const meta = await sharp(src).resize({ width: 1600, height: 900, fit: "cover" }).removeAlpha().webp({ quality: 80 }).toFile(join(OUT, `${s.id}.webp`));
  const source = `${ORIGEN[s.dir]}: ${s.src}`;
  writeFileSync(join(OUT, `${s.id}.webp.json`), JSON.stringify({ prompt: source, createdAt: new Date().toISOString() }, null, 2) + "\n");
  manifest[s.id] = { color: `/media/${s.id}.webp`, colorSize: [meta.width, meta.height], video: null, source, tipo: s.tipo };
  console.log(`${s.id}.webp ${meta.width}×${meta.height} ${Math.round(meta.size / 1024)} KB`);
}
writeFileSync(join(ROOT, "src", "content", "imagenes.json"), JSON.stringify(manifest, null, 2) + "\n");
