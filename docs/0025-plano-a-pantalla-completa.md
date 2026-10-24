# 0025 · Plano a pantalla completa, en horizontal, con dos botones del lote y la ficha debajo

- **Fecha:** 2026-10-24
- **Rama:** `jheferson` (sin commit al cerrar este documento; tampoco lo tienen 0016–0024).
- **Vale para las dos landings** (`/` y `/promocion`) y para la página de cada lote (`/lote/X`).

## Pedido del usuario

Con un boceto hecho en Paint (el plano arriba, una línea roja y la ficha del lote debajo, en dos columnas):

> «había pensado que el mapa se muestre en todo el largo de la pantalla y que el mapa no esté en diagonal sino
> en horizontal para que se puedan visualizar mejor los lotes […] que también tenga dos botones que se habiliten
> cuando seleccionan un lote […] el primer botón que diga Consultar este lote por Whatsapp (Ahí lo llevas al
> formulario de arriba que en ese formulario ya debe tener registrado el lote por el cual el cliente hizo click)
> y el segundo que diga Ver detalle de este lote y ahí lo llevas a la siguiente parte […] la distribución la puse
> como referencia nada más […] hay información que no aparece pero no significa que omitas esa información.»

Respuestas a las dos dudas que se le plantearon:
- Dónde van los botones: «En un lugar donde no tapen los lotes».
- En el celular: «Me parece bien como me lo recomiendas» (plano vertical, botones debajo).
- «no te olvides que los cambios son para ambas landing».

Además, con su «Ya», se corrigió el pie del carrusel de la portada en el celular, que tapaba media imagen
(pendiente anotado en 0024).

## Qué se hizo

### 1. El plano, girado y a todo el ancho

- El plano oficial (`src/content/plano.ts`, generado desde el PDF en 0019) **no se tocó**. Un módulo nuevo,
  `src/content/planoGirado.ts`, gira sus puntos al cargar la página:
  - **Escritorio y tableta (700 px o más):** la Vía a San Nicolás queda horizontal, abajo. El ángulo sale de
    `PLANO.viaRotulos[0].angulo` (27.8°), así que si se regenera el plano el giro se ajusta solo.
  - **Celular (menos de 700 px):** vertical, con la vía a la derecha. De los dos sentidos posibles se eligió el que
    deja el norte casi arriba (−20.8°).
- Se giran los puntos, no un grupo SVG, para que los códigos de lote, los nombres de calle y los de la vía queden
  derechos (los inclinados se dejan entre −90° y 90°). No se escala: el tamaño de letra de cada lote (`fs`), su
  ancho (`ancho`, umbral para mostrar los m²), los grosores de línea y los metros por unidad siguen valiendo.
- El lienzo es la caja del terreno girado, con los rótulos de manzana, el pórtico y los nombres de la vía, más un
  margen. Las vistas de cada manzana (zoom) se recalculan con la proporción del lienzo nuevo. La rosa de los vientos
  va en la esquina superior izquierda, que queda libre en las dos orientaciones, y apunta al norte real.
- El plano ocupa todo el ancho de la pantalla (con el margen de la página) y, en escritorio, nunca pasa del alto de
  la pantalla: con su barra y su leyenda cabe entero (1440 × 900: plano de 1374 × 489 px; los lotes se ven 1.45 veces
  más grandes que antes). En el celular mide hasta 1000 px de alto (390 px de ancho: 356 × 1000 px) y se recorre
  bajando.
- El arrastre usa ahora la escala real del dibujo en pantalla y su límite es un tercio del lienzo.
- Se mantiene todo lo que no aparecía en el boceto: «Colorear por» (disponibilidad, cuota, área), zoom, vista
  completa, «Ver foto de referencia», la ficha emergente al pasar el cursor, la leyenda con los conteos y los
  rótulos de manzana que acercan el plano.

### 2. Los dos botones del lote elegido

- Van en la **esquina inferior derecha del plano**, en la franja de la leyenda: a la izquierda la leyenda y a la
  derecha «Lote G18 · 510 m²» con los dos botones. Primero se probaron encima del dibujo, en la esquina superior
  derecha, que el plano horizontal deja libre; pero se midió con una rejilla de puntos y por debajo de 1600 px de
  ancho tapaban lotes (en 1440 px, G5 y G6; en 1280 px, G2–G8). En la franja no tapan ninguno en ningún ancho. En
  el celular y la tableta van debajo del plano, antes de la leyenda.
- **Se activan cuando el visitante elige un lote.** Antes de eso están apagados y el texto dice «Toca un lote del
  plano para consultarlo». La ficha sigue mostrando desde el inicio el lote de cuota más baja, para no quedar vacía,
  pero el plano ya no lo pinta como «tu lote» y la ficha lo presenta como «El lote con la cuota más baja · Toca
  cualquier lote del plano para ver el tuyo». Un enlace con `?lote=` o la página `/lote/X` llegan con el lote ya
  elegido.
- **«Consultar este lote por WhatsApp»** sube al formulario de la portada, le pasa el lote (el formulario muestra
  «Tu lote seleccionado G18, 510 m²» y el botón de envío dice «Consultar lote G18») y pone el cursor en
  «Nombres y apellidos». Desde `/lote/X` vuelve a la landing de origen con el lote: `/?lote=G18#formulario`, o
  `/promocion?lote=G18#formulario` si el visitante vino de `/promocion`. El lote llega a la hoja y al píxel con el
  registro, como hasta ahora.
- **«Ver detalle de este lote»** baja a la ficha del lote, debajo del plano, y le pasa el foco.
- Medición: los dos botones cuentan como clic con su propia fuente (`map-form`, «Plano · consultar este lote», y
  `map-detail`, «Plano · ver detalle del lote») y el lote.

### 3. La ficha debajo, a lo ancho y en dos columnas

- Desde 900 px: a la izquierda el lote (manzana, código, estado, área), la modalidad (financiado o al contado), la
  cuota y la cuota inicial con su control; a la derecha el plazo, el resumen de valores, «Consultar el lote G18»
  (abre WhatsApp con la simulación, como antes) y la nota de vigencia. Debajo de 900 px, una sola columna. No se
  quitó ningún dato de la ficha; el botón «Ver detalle» se quitó después, a pedido del usuario (ver abajo).
- La ficha tiene el ancho del contenido de la página (1180 px como máximo) y queda centrada bajo el plano.

### 4. El pie del carrusel en el celular

- La imagen, el video y sus controles pasaron a un recuadro propio (`.hero-showcase__media`). En escritorio no
  cambia nada; en el celular el pie (título, subtítulo con «Imagen referencial» y «Ver video drone») va debajo de la
  imagen en vez de encima: ya no tapa nada (antes cubría la mitad de abajo).
- El pie tiene un alto fijo de 140 px en el celular, el de la toma más alta, para que al rotar las tomas no se mueva
  lo que está debajo (medido en 320, 360, 390, 430 y 599 px: 140 px en las cinco tomas).

### 5. Después: sin «Ver detalle» en la ficha

El usuario pidió quitar el botón «Ver detalle» de la ficha (señalado por su XPath,
`//*[@id="ficha-lote"]/div/div/div[2]/div[2]/a[2]`: «quita ese botón también»). Llevaba a la página propia del lote
(`/lote/X`). Se quitó el enlace, la opción `showFullLink` de `Ficha` (ya no tenía uso) y sus estilos
(`.ficha__detail`). La acción de la ficha queda en «Consultar el lote G18». Las páginas `/lote/X` siguen existiendo
(enlaces compartidos, `?lote=`), pero la landing ya no enlaza a ellas desde la ficha. Verificado en `/`,
`/promocion` y `/lote/G18`: la ficha tiene una sola acción y el XPath ya no encuentra nada; `npm test` 42 pasan y
1 falla (la de siempre).

## Archivos

| Archivo | Cambio |
|---|---|
| `src/content/planoGirado.ts` | Nuevo: el plano oficial girado en horizontal y en vertical, con su lienzo, vistas de manzana, norte y rosa |
| `src/components/LotStack.tsx` | Usa el plano girado según el ancho; botones del lote elegido; estado «elegido»; ficha debajo con `id="ficha-lote"`; arrastre con la escala real |
| `src/components/Ficha.tsx` | El contenido en dos columnas (`.ficha__col`); el plazo pasa a la columna derecha; sin «Ver detalle» ni `showFullLink` |
| `src/components/Landing.tsx` | El bloque `#lotes` sale del contenedor angosto para ir a todo el ancho; el aviso queda arriba |
| `src/components/HeroCarousel.tsx` | Recuadro `.hero-showcase__media` para la imagen, el video, la pausa y el progreso |
| `src/lib/tracking/schema.ts` | Fuentes `map-form` y `map-detail` |
| `src/app/globals.css` | Plano a todo el ancho con la proporción del lienzo girado; pie del plano con leyenda y botones; ficha en dos columnas; reserva de alto del plano; pie del carrusel debajo de la imagen en el celular |
| `scripts/check-source.mjs` | La prueba del plano exige que LotStack dibuje `geo.lotes[l.id]` de `PLANO_GIRADO` y que este salga de `PLANO` |
| `DESIGN.md` | El plano y la portada en el celular |

`src/content/plano.ts` y `scripts/plano/` no cambian (son de la otra sesión, 0019).

## Cómo se verificó

Build de producción en Chrome (Playwright), en `/`, `/promocion` y `/lote/G18`:

| Prueba | Resultado |
|---|---|
| Plano en 1440 × 900, 1280 × 720 y 390 × 844 | 1374 × 489, 1214 × 432 y 356 × 1000 px; en escritorio el plano con su barra y su leyenda cabe en la pantalla (1280 × 720: termina en 716 px) |
| Botones antes de elegir lote | Apagados en los tres anchos |
| Elegir G18 en el plano | Botones activos, «Lote G18 · 510 m²», URL `?lote=G18` |
| «Ver detalle de este lote» | La ficha queda bajo la cabecera (84 px) y recibe el foco |
| «Consultar este lote por WhatsApp» en `/` y `/promocion` | El formulario queda bajo la cabecera, con «Tu lote seleccionado G18, 510 m²» y el cursor en el nombre |
| «Consultar» desde `/lote/G18` y `/lote/G18?origen=promocion` | Lleva a `/?lote=G18#formulario` y a `/promocion?lote=G18#formulario`, con el lote en el formulario |
| `/lote/G18` en 390 px | Plano vertical, sin errores de hidratación |
| Botones sobre el dibujo (primera versión), rejilla de puntos de 700 a 1920 px | Tapaban lotes por debajo de 1600 px; por eso pasaron a la franja inferior |
| Reserva de alto del plano antes de montarlo | 1380 / 1800 / 2900 / 3050 px contra 1372–1380 / 1777 / 2544–2907 / 3048 medidos |
| Pie del carrusel en el celular | Ya no tapa la imagen; 140 px en las cinco tomas |
| Desborde horizontal, errores de consola | Ninguno |
| Lighthouse móvil (`/`, tres corridas) | Rendimiento 53, 69 y 56; accesibilidad 100; LCP 7.8 s, igual que en 0016 (7.5–7.8 s, misma imagen), CLS 0. La nota varía por el bloqueo del procesador de este equipo (220–950 ms) |
| Lighthouse escritorio (`/`) | Rendimiento 93, accesibilidad 100, CLS 0 |
| `npm test` | 42 pasan, 1 falla (Global Privacy Control, la misma de antes) |
| `tsc --noEmit` | Sin errores |
| Cotejo con el PDF (otra sesión, build de las 18:27) | Correcto. Norte calculado con los vértices P1–P14 contra sus coordenadas UTM: 69.20° en horizontal y −20.80° en vertical, igual que la rosa, con 0.05 m de error y la misma escala (0.6577 m por unidad). Giro rígido: áreas de lote ±0.35 % por el redondeo a 0.1, sin reflejo ni escala. Vía a 1.7° bajo el terreno (horizontal) y a −88.3° a la derecha (vertical). Las 8 vistas de manzana contienen sus lotes y ningún lote cae fuera del lienzo. El PDF girado 69.2° coincide con la web |

## Pendientes

- El LCP móvil (7.8 s simulado) viene de antes: la imagen del carrusel tarda en pintarse por el JavaScript de la
  portada. Mejorarlo es un trabajo aparte.
- Commit y push de 0016–0025 cuando se pida.
