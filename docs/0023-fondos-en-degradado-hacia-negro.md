# 0023 · Fondos de sección en degradado, del verde de marca a casi negro

- **Fecha:** 2026-10-24
- **Rama:** `jheferson` (sin commit al cerrar este documento; tampoco lo tienen 0016–0022).
- **Pedido del usuario:** "los colores de fondo también agrégales degradados de acuerdo a la paleta de colores,
  sugiero que sea con negro pero decide de acuerdo a tus skill".
- **Método:** skill `impeccable` (colorize y el mínimo de calidad): el color de fondo da atmósfera y ritmo entre
  secciones sin competir con el botón principal ni con las fotos; se midió el contraste de cada texto sobre el punto
  más claro de cada fondo nuevo.

## Cómo estaba

Fuera de la portada, la página era un solo color plano (`--bg`, #06120e). Solo la banda «Por qué La Campiña» y el pie
tenían un degradado (#0d251b → #0a1c15), tan suave que no se notaba. La ficha del lote y la página de privacidad
también eran planas.

## Qué se decidió

- **Negro, pero con un rastro de verde.** El fondo baja a `--black` (#020705), no a #000. Un negro puro junto a fotos de
  tierra y cielo se ve como un hueco; con un poco del verde de marca sigue siendo de la misma familia (la skill pide
  bajar el croma cerca del negro en vez de usar un neutro sin relación con la paleta).
- **Cada sección es un campo propio sin costuras.** Las secciones empiezan y terminan en `--bg`, el mismo color en
  que termina la portada, y se oscurecen hacia el centro. El brillo verde de marca (#006f55 al 24 %) entra por un
  costado y se apaga antes de tocar los bordes, así no se ve dónde termina una sección y empieza la otra.
- **El brillo alterna de lado**, para dar ritmo al bajar: Proyecto a la derecha, Áreas comunes a la izquierda, Avance de
  obra a la derecha, Preguntas a la izquierda.
- **Las bandas bajan del verde al negro.** «Por qué La Campiña» y el pie van de #0f2b20 a #030a07: el pie termina la
  página en negro.
- **El cierre se ilumina desde arriba.** «Da el primer paso hoy» recibe un brillo verde azulado (#349c80) desde el borde
  superior, sobre el titular y los canales: es la sección donde se pide la acción.
- **Las superficies que seguían planas pasan al degradado de tarjeta:** menú móvil, saludo del asesor flotante, espacio
  del plano antes de cargar, tarjeta «Al contado» de la ficha (nuevo `--grad-surface-2`) y el recuadro de la ficha del lote.
- **La ficha del lote (`/lote/X`) y la de privacidad** tienen el mismo fondo, fijo detrás de la página.
- **El `body` sigue sólido.** Un degradado en el `body` hace que el verificador de contraste calcule un fondo blanco
  (pasó en 0016); los degradados van en las secciones.

No cambian los textos, el diseño de la portada, el plano ni los botones. Vale para las dos landings (`/` y `/promocion`).

## Contraste

Medido sobre el punto más claro de cada fondo nuevo:

| Fondo (punto más claro) | Texto #eef2ea | Texto suave #a9b8ae | Lima de título #8fc03c | Lima chico #a6c138 |
|---|---|---|---|---|
| Brillo de sección, #05281f | 13.93:1 | 7.64:1 | 7.35:1 | 7.75:1 |
| Brillo del cierre, #123429 | 11.96:1 | 6.56:1 | 6.31:1 | 6.65:1 |
| Banda, arriba, #0f2b20 | 13.36:1 | 7.32:1 | 7.05:1 | 7.43:1 |

Todo pasa 4.5:1. El brillo del cierre es el único fondo más claro que #133126 (el inicio de `--grad-surface`, que 0022
tomó como referencia para el texto lima). Ahí «primer paso» queda en 6.31:1 en el peor caso, contra los 6.54:1 que
anotaba 0022. Ese peor caso está en el borde superior y el titular queda más abajo, donde el fondo es más oscuro.

## Archivos

| Archivo | Cambio |
|---|---|
| `src/app/globals.css` | Tokens `--black`, `--glow-forest`, `--glow-teal`, `--grad-canvas`, `--grad-surface-2`; `--grad-band` del verde al negro; fondo de `.section` con brillo lateral (`--glow-x`) y `.section--glow-left`; fondo del cierre (`.section--contact`); fondo fijo de `.lotpage` y `.privacy-page`; superficies planas al degradado |
| `src/components/Landing.tsx` | `section--glow-left` en Áreas comunes y Preguntas |
| `DESIGN.md` | Fondos y tokens nuevos |

## Cómo se verificó

Build de producción y Chrome (Playwright), con capturas de página entera antes y después en 1440 y 390 px:

| Prueba | Resultado |
|---|---|
| Comparación antes/después (1440 px), franjas de Áreas, Avance, Por qué, Preguntas, Cierre y pie | Revisadas a mano: secciones hacia negro, brillo alterno, sin costuras visibles entre secciones |
| Móvil (390 px), cinco franjas de arriba abajo | Revisadas a mano: el brillo lateral y el del cierre se ven; nada tapa contenido |
| Ficha del lote `/lote/G18` y `/privacidad` (1280 px) | El fondo fijo se ve detrás del contenido |
| Desborde horizontal (1440 y 390 px) | Ninguno |
| Errores de JavaScript | Ninguno |
| Lighthouse accesibilidad, escritorio, `/` y `/promocion` | 100 y 100; contraste sin fallas |
| `npm test` | 41 pasan, 1 falla (la de Global Privacy Control, la misma de antes) |

Lighthouse no calcula el contraste de un texto sobre un degradado (lo deja «por revisar»); por eso se midió a mano en
la tabla de arriba.

## Pendientes

- Commit y push de 0016–0023 cuando se pida.
