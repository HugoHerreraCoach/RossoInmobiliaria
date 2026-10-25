# 0022 · Degradado en todo texto grande verde

**Fecha:** 2026-10-24 · **Rama:** `jheferson` (sin commit al cerrar este documento)

## Qué se pidió

> «Agrega colores degradados a todas las letras grandes que contengan verde»

## Cómo estaba

Desde 0016, `--grad-text-lime` (#d2ea6e → #a6c138 → #8fc03c) se usaba solo en dos lugares:

- «La Campiña» del titular de la portada (`.hero__name`);
- la palabra clave de los títulos de sección (`.h2 em`).

El resto del texto verde era lima plano (`var(--lime)`).

## Cómo se buscó

Con Chrome automatizado sobre `next dev`, en `/`, `/promocion` y `/lote/G18`, a 1440 px:

- se recorrió la página entera para cargar todo y se abrió cada pestaña de «Por qué La Campiña»;
- se listaron los elementos con texto propio, color verde (tono 60–180°, saturación ≥ 30 %) y letra de 16 px o más.

| Texto | Tamaño | Antes |
| --- | --- | --- |
| «La Campiña» (titular de la portada) | 62 px | ya tenía degradado |
| Palabras clave de los `.h2` («tu lugar en el campo», etc.) | 52 px | ya tenía degradado |
| «disfrutar» en «Lo que vas a disfrutar» (`.h3 em`) | 40 px | **lima plano** |
| Cifras de «Por qué La Campiña» (510, 35, 48, 70) y su unidad | 52 px y 23 px | **lima plano** |
| «510 m²» y «escritura pública» del subtítulo de la portada (`.hero__sub b`) | 21 px | **lima plano** |
| «Ver detalle» de la ficha y «Compara 5 lotes de la lista» | 17 px | lima plano: son controles del tamaño del texto normal, no titulares; se dejaron |

Por debajo de 16 px hay otros textos verdes (antetítulos, la cuota y la promoción en la ficha, etiquetas, íconos y
enlaces); son texto chico y quedan en lima plano. `/lote/G18` no tiene texto grande verde. `/promocion` es igual a
`/`.

## Qué se hizo (`src/app/globals.css`)

Los tres usan el mismo degradado y el mismo recorte que `.hero__name` y `.h2 em`
(`background-clip: text`, `color: transparent`):

- **`.h2 em, .h3 em`:** el `.h3` se suma a la regla del `.h2`.
  - La nota anterior decía que los `.h3` se parten en palabras al animarse. Ya no es así: el único `.h3` animado
    («Lo que vas a disfrutar», `Reveal`) se parte por líneas.
  - El `<em>` queda entero dentro de su línea y el recorte se mueve con ella. Se cambió el comentario; si un `.h3`
    se partiera por palabras, el recorte se rompería.
- **`.hero__sub b`:** degradado en lugar del lima plano.
- **`.stat-cards dd`:**
  - degradado en lugar del lima plano;
  - `align-self: flex-start`, para que el degradado recorra la cifra y no todo el ancho de la tarjeta;
  - el `<small>` de la unidad (m², min, meses) no tiene color propio, así que queda dentro del mismo degradado.

**`DESIGN.md`** agrega la regla: todo texto grande (20 px o más) en verde lleva `--grad-text-lime`. El lima plano
queda para el texto chico, los botones de contorno y los íconos. El degradado es claro y solo va sobre fondo oscuro.

`globals.css` es de la otra sesión (0016–0018). Se le avisó antes y confirmó que no lo estaba editando. Advirtió
que el lima no sirve sobre fondos claros; ninguno de estos textos está sobre fondo claro.

## Contraste

Los tres textos están sobre fondos oscuros: la portada con su velo, `--bg` y las tarjetas con `--grad-surface`.
Peor caso: el color más oscuro del degradado sobre el más claro de los fondos.

| Color del degradado | sobre #133126 (tarjeta) | sobre #0d251b (banda) | sobre #06120e (fondo) |
| --- | --- | --- | --- |
| #d2ea6e | 10.52 | 12.13 | 14.30 |
| #a6c138 | 6.89 | 7.94 | 9.36 |
| #8fc03c | **6.54** | 7.53 | 8.88 |

El mínimo es 6.54:1, por encima del 4.5:1 exigido.

**Después de 0023** (fondos de sección hacia negro, de la otra sesión), los fondos son más oscuros, salvo en el cierre
(`.section--contact`). Ahí el brillo llega a #123429 en su borde superior y #8fc03c da **6.31:1**. Es el nuevo
mínimo de la página, sobre la palabra clave de un `.h2`. Igual queda sobre 4.5:1, y el titular «Da el primer paso
hoy» está más abajo, sobre fondo más oscuro. En las secciones (#020705) da 9.44:1 y en las bandas (#0f2b20), 7.05:1. axe no calcula el contraste de un texto con
`background-clip: text` (lo deja «por revisar»), así que también se revisó en capturas.

## Cómo se verificó

- **Medición repetida:** los cinco textos grandes verdes salen con degradado y ninguno queda en lima plano.
- **Capturas a 1440 px:**
  - portada, «Lo que vas a disfrutar» y tarjetas de cifras;
  - el titular a mitad de la animación (línea desplazada 8 px): «disfrutar» se ve con su degradado.
- **Capturas a 390 px:** portada (con «escritura pública» partido en dos líneas) y tarjetas de cifras, sin desborde
  horizontal (`scrollWidth` 390).
- No se corrió `npm test`: el cambio es solo CSS y las pruebas no revisan colores.

## Pendientes

- [ ] Publicación (dueño), junto con lo demás de la rama.
