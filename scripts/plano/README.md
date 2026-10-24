# Generar `src/content/plano.ts` desde el plano de lotización

El plano interactivo (`src/components/LotStack.tsx`) dibuja la geometría de `src/content/plano.ts`. Ese
archivo no se edita a mano: se genera desde el PDF del «Plano de Lotización y Vías» PTL-01 (Arq. Renzo
Tuesta, febrero 2025; en el Drive: `2. ROSSO INMOBILIARIA › … › 1. LA CAMPIÑA › 1. INFO › 2. PLANOS ›
PROYECTO FINAL_LA CAMPIÑA.2-Layout1.pdf`). Detalle del método y verificaciones: `docs/0019`.

## Requisitos

Python 3 con `pypdfium2`, `numpy` y `Pillow`.

## Pasos

Desde una carpeta de trabajo vacía (los intermedios van a `./plano/`):

```bash
mkdir plano
export PLANO_PDF="/ruta/PROYECTO FINAL_LA CAMPIÑA.2-Layout1.pdf"
export PYTHONPATH=<repo>/scripts/plano
for s in extract1 regions polys blocks verify_ids vertices areas comps road assemble; do
  python <repo>/scripts/plano/$s.py
done
python <repo>/scripts/plano/write_ts.py <repo>/src/content/plano.ts
```

| Script | Qué hace | Qué debe decir |
| --- | --- | --- |
| `extract1.py` | Lee los textos del PDF y dibuja solo sus líneas (sin textos ni imágenes) | `textos 999` |
| `regions.py` | Rellena cada lote desde su rótulo de área `A:…m2` | `regiones 132`, `area fuera de 3%: 0` |
| `polys.py` (+ `geom.py`) | Contorno de cada lote y su número | `numeros por lote {1: 132}` |
| `blocks.py` | Agrupa lotes vecinos en manzanas | `bloques: 8 [21, 10, 20, 34, 9, 9, 21, 8]` |
| `verify_ids.py` | Pone el código (A1…H10) y lo compara con el cuadro de áreas del plano | `sin coincidencia de area: 0` |
| `vertices.py` | Vértices P1–P14 contra sus coordenadas UTM | `error max 0.02 m` |
| `areas.py`, `comps.py`, `road.py` | Parques, reservorio, bermas y Vía a San Nicolás | 4 parques, reservorio, `via m2 7184` |
| `assemble.py`, `write_ts.py` | Gira el plano para el lienzo de 1160 × 760 y escribe el TS | `rotacion 97.0 grados` |

Si cambia la lotización, revisar en `verify_ids.py` qué bloque es cada manzana (`blockmz`) y el cuadro
de áreas: el script falla si un código no coincide con su área. `npm test` vuelve a comprobar los 132
contornos contra `src/content/lotes.ts`.
