// Prepara los medios de la web a partir del material real de obra (Recursos/drive).
// Por cada toma: fotograma a color (webp, 1600 px) y, si viene de video, un clip
// corto sin audio (mp4). Cada archivo lleva incrustada su procedencia.
//
// Uso: npm run assets
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, rmSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = join(ROOT, "Recursos", "drive");
const OUT = join(ROOT, "public", "media");
const TMP = join(ROOT, ".cache", "assets");

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

/** Tomas usadas en la web. `t` en segundos para videos; `crop` = [x, y, ancho, alto] en fracciones. */
const SHOTS = [
  { id: "hero", src: "Tomas de Drone/VIDEOS/DJI_0718.MP4", t: 3, clip: [0, 9] },
  { id: "apertura", src: "Fotos de avances de obra/Avance de Obra /Día 01/Fotos/DSC00597.JPG" },
  { id: "ingreso-abr", src: "Tomas de Drone/drone campiña 27.05/DJI_20260411105716_0015_D.MP4", t: 2, clip: [0, 8] },
  { id: "portico", src: "Tomas de Drone/drone campiña 27.05/DJI_20260411105904_0021_D.MP4", t: 3, clip: [0, 6.5] },
  { id: "trazado-jun", src: "Tomas de Drone/VIDEOS/DJI_0773.MP4", t: 7, clip: [0, 9] },
  { id: "cerco-jun", src: "Tomas de Drone/VIDEOS/DJI_0811.MP4", t: 7, clip: [0, 9] },
  { id: "general-jul", src: "Tomas de Drone/DJI_0992.MP4", t: 2, clip: [0, 11] },
  { id: "estructura-set", src: "Fotos de avances de obra/Fotos/100GOPRO/G0062336.JPG" },
  { id: "banderas", src: "Fotos del proyecto/CAMPIÑA/campiña 3.jpg" },
];

const ff = (args) => execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", ...args], { stdio: "inherit" });

// Limpia salidas de versiones anteriores (tramados, fuentes en grises).
for (const f of readdirSync(OUT)) if (/\.(dither\.png|gray\.webp)$/.test(f)) unlinkSync(join(OUT, f));

const manifest = {};
for (const s of SHOTS) {
  const src = join(SRC, s.src);
  if (!existsSync(src)) {
    console.warn(`falta: ${s.src}`);
    continue;
  }
  const isVideo = /\.(mp4|mov)$/i.test(s.src);
  const frame = join(TMP, `${s.id}.png`);
  const cropF = s.crop
    ? `crop=trunc(iw*${s.crop[2]}/2)*2:trunc(ih*${s.crop[3]}/2)*2:iw*${s.crop[0]}:ih*${s.crop[1]}`
    : null;
  if (isVideo) ff(["-ss", String(s.t), "-i", src, "-frames:v", "1", ...(cropF ? ["-vf", cropF] : []), frame]);
  else await sharp(src).rotate().png().toFile(frame);

  const meta = await sharp(frame)
    .resize({ width: 1600, withoutEnlargement: true })
    .modulate({ saturation: 1.08 })
    .webp({ quality: 80 })
    .toFile(join(OUT, `${s.id}.webp`));

  let clip = null;
  if (isVideo && s.clip) {
    clip = `${s.id}.mp4`;
    ff([
      "-ss", String(s.clip[0]), "-t", String(s.clip[1]), "-i", src,
      "-an", "-vf", `${cropF ? cropF + "," : ""}scale=1280:-2,fps=30`, "-c:v", "libx264", "-preset", "slow", "-crf", "29",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(OUT, clip),
    ]);
  }
  manifest[s.id] = {
    color: `/media/${s.id}.webp`,
    colorSize: [meta.width, meta.height],
    video: clip ? `/media/${clip}` : null,
    source: `Recursos/drive/${s.src}${isVideo ? ` @${s.t}s` : ""}`,
  };
  console.log(`ok ${s.id}`);
}

writeFileSync(join(ROOT, "src", "content", "media.json"), JSON.stringify(manifest, null, 2));
rmSync(TMP, { recursive: true, force: true });

// Procedencia: cada raster lleva dentro su origen real (archivo y segundo de la toma).
const LAUNCHER = join(ROOT, ".claude", "skills", "impeccable", "scripts", "impeccable");
if (existsSync(LAUNCHER)) {
  for (const [id, m] of Object.entries(manifest)) {
    try {
      execFileSync(
        "sh",
        [LAUNCHER, "embed-prompt", join(ROOT, "public", m.color), "--prompt",
          `Fuente real, no generada: ${m.source}. Fotograma a color producido por scripts/build-assets.mjs (${id}).`],
        { stdio: "ignore" },
      );
    } catch {
      console.warn(`sin procedencia: ${m.color}`);
    }
  }
}
console.log("listo");
