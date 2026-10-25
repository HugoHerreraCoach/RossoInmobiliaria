# 0018 · Portada: el video llena la columna y desaparece el hueco bajo las miniaturas

- **Fecha:** 2026-10-24
- **Rama:** `jheferson` (sin commit al cerrar este documento; 0016 y 0017 tampoco lo tienen).
- **Pedido del usuario:** con tres capturas, una del diseño de referencia con dos líneas rojas (el video empieza a
  la altura del antetítulo y las miniaturas terminan a la altura del borde del formulario) y dos de la página con un
  recuadro tachado bajo las miniaturas: "queda un espacio vacío que te lo marco con un cuadrado y una x, para que lo
  quites, usa tus skills".
- **Método:** skill `impeccable` (`polish`): refinamiento sin cambiar la dirección visual ni los textos; se midió la
  composición antes y después en siete anchos de escritorio.

## Causa

En escritorio la columna izquierda (antetítulo, titular, beneficios y formulario) era más alta que la derecha,
cuyo video tenía una proporción fija de 3:2. Desde que el formulario creció (preguntas apiladas, aviso legal en dos
líneas), sobraban entre 150 px (1600 px de ancho) y 438 px (1100 px) bajo las miniaturas.

| Ancho | Hueco antes | Hueco después | Video después (ancho × alto) |
|---|---|---|---|
| 1100 | 438 px | — (una columna, ver abajo) | 1036 × 691 |
| 1238 (la captura con zoom) | 364 px | 0 | 677 × 739 |
| 1280 | 330 px | 0 | 701 × 741 |
| 1366 | 273 px | 0 | 751 × 717 |
| 1440 | 248 px | 0 | 793 × 661 |
| 1600 | 150 px | 0 | 829 × 650 |
| 1920 | 152 px | 0 | 826 × 651 |

En todos los anchos de dos columnas, el video empieza a la altura del antetítulo y las miniaturas terminan a la
altura del borde inferior del formulario, como en el diseño.

## Qué se hizo (`src/app/globals.css`, solo escritorio)

1. **La columna del video ocupa el alto de la izquierda.** El bloque del video se estira hasta abarcar las dos filas
   (titular y formulario); dentro, el video toma todo el alto que dejan libre el contador, las flechas y las
   miniaturas. Ya no tiene una proporción fija en escritorio (sí en móvil y tableta), con un mínimo de 360 px de alto.
2. **El formulario se compactó, como en el diseño**, para que el video conserve una proporción apaisada: tarjeta con
   26 × 28 px de relleno, 12 px entre campos, campos y opciones de 50 px de alto (siguen por encima de los 44 px
   táctiles), botón de 54 px y beneficios un poco más juntos (en 1600 px y más entran en una sola línea, como en el
   diseño). En 1440 px el borde inferior del formulario pasó de 1058 a 942 px desde el tope de la página.
3. **Las opciones van lado a lado solo cuando caben enteras** (desde unos 1440 px) y una debajo de otra si no; su
   texto nunca se corta. Se probó dejarlas siempre lado a lado: en 1238–1366 px partían "Pago al / contado S/ 17 mil".
4. **Las dos columnas empiezan en 1200 px** (antes en 1100). Entre 1100 y 1199 px la columna izquierda quedaba tan
   angosta que el video habría sido vertical (597 × 751) y las opciones se partían; ahí la portada va en una columna,
   como en tableta.

Nada cambia en el móvil ni en el contenido. Vale para las dos landings (`/` y `/promocion`), que comparten diseño.

## Archivos

| Archivo | Cambio |
|---|---|
| `src/app/globals.css` | Bloque de escritorio de la portada: columna del video a todo el alto, formulario compacto, opciones, corte a 1200 px |
| `DESIGN.md` | La portada en escritorio |

## Cómo se verificó

Build de producción en Chrome (Playwright), midiendo la posición del antetítulo, el borde del formulario, el
escenario del video y las miniaturas:

| Prueba | Resultado |
|---|---|
| Hueco bajo las miniaturas (1238, 1280, 1366, 1440, 1600, 1920 px) | 0 px en todos |
| Alineación superior | el video empieza a 116 px, igual que el antetítulo, en todos los anchos de dos columnas |
| Capturas revisadas a mano | 1100, 1238, 1280, 1440, 1600 y 1920 px |
| Desborde horizontal (1600, 1440, 1280, 1024, 390, 360 px) | ninguno |
| Video del carrusel | en reproducción en los seis anchos |
| Botones a WhatsApp | 10 en la portada, sin cambios |
| Errores de consola | ninguno |

No se corrieron `npm test` ni Lighthouse en este cambio (es solo CSS de composición). Al mismo tiempo otra sesión
redibuja el plano de lotes (`LotStack.tsx`, doc 0019); no hay archivos en común.

## Pendientes

- Commit y push de 0016, 0017 y 0018 cuando se pida.
