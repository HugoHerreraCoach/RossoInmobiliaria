---
name: La Campiña
description: Lotes campestres en el Valle de Zaña, presentados como el cartel de obra del proyecto; un solo mundo con dos paletas intercambiables (Proyecto y Rosso).
colors:
  proyecto-band: "#006f55"
  proyecto-band-ink: "#ffffff"
  proyecto-accent: "#a6c138"
  proyecto-accent-ink: "#00402f"
  proyecto-accent-hover: "#b7d24a"
  proyecto-ink: "#10261f"
  proyecto-ink-soft: "#3c5249"
  proyecto-ground: "#edf2ef"
  proyecto-paper: "#ffffff"
  proyecto-sold: "#10261f"
  proyecto-selection: "#a6c138"
  rosso-band: "#e4433a"
  rosso-band-fill-from: "#e8601a"
  rosso-band-fill-to: "#e0284f"
  rosso-band-ink: "#ffffff"
  rosso-accent: "#d7263d"
  rosso-accent-ink: "#ffffff"
  rosso-accent-hover: "#c01f35"
  rosso-ink: "#222326"
  rosso-ink-soft: "#52565c"
  rosso-ground: "#f1f2f3"
  rosso-paper: "#ffffff"
  rosso-sold: "#3a3d42"
  rosso-selection: "#ffcfb8"
typography:
  display:
    fontFamily: "Archivo, \"Arial Narrow\", sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 4.6rem)"
    fontWeight: 900
    lineHeight: 0.96
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 125"
  headline:
    fontFamily: "Archivo, \"Arial Narrow\", sans-serif"
    fontSize: "clamp(1.7rem, 3.4vw, 2.6rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 112"
  title:
    fontFamily: "Archivo, \"Arial Narrow\", sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 110"
  figure:
    fontFamily: "Archivo, \"Arial Narrow\", sans-serif"
    fontSize: "clamp(1.6rem, 3vw, 2.3rem)"
    fontWeight: 900
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
    fontVariation: "\"wdth\" 100"
  wordmark:
    fontFamily: "Archivo, \"Arial Narrow\", sans-serif"
    fontSize: "1.3rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.01em"
    fontVariation: "\"wdth\" 125"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "\"tnum\" 1"
    fontVariation: "\"wdth\" 100"
  button:
    fontFamily: "Archivo, \"Arial Narrow\", sans-serif"
    fontSize: "1.05rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.03em"
    fontVariation: "\"wdth\" 88"
  label:
    fontFamily: "Archivo, \"Arial Narrow\", sans-serif"
    fontSize: "0.86rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
    fontVariation: "\"wdth\" 72"
rounded:
  none: "0"
  hito: "50%"
spacing:
  line: "2px"
  line-heavy: "3px"
  gutter: "clamp(16px, 4vw, 40px)"
  max: "1200px"
  strip-h: "64px"
components:
  button:
    backgroundColor: "{colors.proyecto-paper}"
    textColor: "{colors.proyecto-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "54px"
  button-hover:
    backgroundColor: "{colors.proyecto-ink}"
    textColor: "{colors.proyecto-paper}"
  button-primary:
    backgroundColor: "{colors.proyecto-accent}"
    textColor: "{colors.proyecto-accent-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.proyecto-accent-hover}"
    textColor: "{colors.proyecto-accent-ink}"
  button-primary-rosso:
    backgroundColor: "{colors.rosso-accent}"
    textColor: "{colors.rosso-accent-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "54px"
  button-primary-rosso-hover:
    backgroundColor: "{colors.rosso-accent-hover}"
    textColor: "{colors.rosso-accent-ink}"
  button-small:
    padding: "0 14px"
    height: "44px"
  band:
    backgroundColor: "{colors.proyecto-band}"
    textColor: "{colors.proyecto-band-ink}"
    typography: "{typography.headline}"
    padding: "18px 28px"
  stamp:
    backgroundColor: "{colors.proyecto-band}"
    textColor: "{colors.proyecto-band-ink}"
    typography: "{typography.label}"
    padding: "7px 12px"
  input-field:
    backgroundColor: "{colors.proyecto-paper}"
    textColor: "{colors.proyecto-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "52px"
  choice-chip:
    backgroundColor: "{colors.proyecto-paper}"
    textColor: "{colors.proyecto-ink}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "46px"
  choice-chip-checked:
    backgroundColor: "{colors.proyecto-ink}"
    textColor: "{colors.proyecto-paper}"
  tab-manzana:
    backgroundColor: "{colors.proyecto-paper}"
    textColor: "{colors.proyecto-ink}"
    padding: "4px 10px"
    width: "58px"
    height: "52px"
  tab-manzana-selected:
    backgroundColor: "{colors.proyecto-ink}"
    textColor: "{colors.proyecto-paper}"
  lot-cell:
    backgroundColor: "{colors.proyecto-paper}"
    textColor: "{colors.proyecto-ink}"
    padding: "8px"
    height: "72px"
  lot-cell-sold:
    backgroundColor: "{colors.proyecto-sold}"
    textColor: "{colors.proyecto-paper}"
  lot-cell-selected:
    backgroundColor: "{colors.proyecto-accent}"
    textColor: "{colors.proyecto-accent-ink}"
---

# Design System: La Campiña

## Overview

**Creative North Star: "El cartel de obra"**

La Campiña se presenta como su propio cartel de obra: el letrero que toda obra seria en el Perú debe colocar. Cada sección es una lámina de chapa con una banda de color en la cabecera, filas de campos blancas regladas con líneas de tinta, rótulos condensados en mayúsculas y valores en Archivo pesado. El cartel principal se planta sobre dos postes y una línea de suelo; las láminas llevan pernos en las esquinas. Las fotos son reales, a todo color, y cada una lleva su sello de fecha. La prueba manda sobre la decoración.

El sistema es plano, cuadrado y de tinta: sin sombras, sin radios (salvo los hitos redondos del cronograma), con bordes de 2px y 3px que construyen toda la jerarquía. La densidad es la de una ficha técnica: tablas, campos y celdas, con aire suficiente para leerse en un celular. Una sola familia tipográfica, Archivo, recorre su eje de ancho: condensada para rotular, normal para leer, expandida para titular.

El mundo es idéntico en las dos paletas; solo cambian las pinturas. "Proyecto" usa el manual de marca de La Campiña (verde y lima); "Rosso" usa la marca del promotor (degradado naranja a coral y el gris del edificio). Ambas son juegos de tokens de primera clase del mismo sistema, seleccionados por `html[data-paleta]`, por `?paleta=` y por el control de paleta.

**Key Characteristics:**
- Láminas con banda de color, borde de tinta de 3px y cuatro pernos en las esquinas.
- Filas de campos regladas con 2px: rótulo condensado a la izquierda, valor pesado a la derecha.
- Archivo variable con eje `wdth`: rótulos 72, texto 100, titulares 125.
- Esquinas rectas en todo; profundidad cero; jerarquía por bordes e inversión de tinta.
- Fotos reales a color con sello de fecha en la esquina superior izquierda.
- Dos paletas intercambiables sobre una sola estructura.

## Colors

Dos juegos de pinturas sobre la misma estructura: cada token (`--band`, `--band-fill`, `--band-ink`, `--accent`, `--accent-ink`, `--accent-hover`, `--ink`, `--ink-soft`, `--ground`, `--paper`, `--sold`, `--selection`) existe en ambas paletas con el mismo papel. La paleta "proyecto" es la predeterminada (`:root` y `:root[data-paleta="proyecto"]`); "rosso" se activa con `:root[data-paleta="rosso"]`.

### Primary
- **Verde Campiña** (`proyecto-band`): la banda de cabecera de cada lámina, el sello de fecha, el avance rayado del cronograma, las barras de distancia y las casillas marcadas. En "proyecto", `--band-fill` es este mismo color plano.
- **Degradado Rosso** (`rosso-band-fill-from` → `rosso-band-fill-to`, `linear-gradient(115deg, #e8601a 0%, #e0284f 100%)`): el `--band-fill` de la paleta "rosso", en los mismos lugares que el verde. Desviación deliberada: va un paso más profundo que el logo (~#FF8A1F → #FF3D5E) para que el texto blanco de los titulares cumpla ≥3:1. `rosso-band` es su equivalente plano para usos donde no cabe un degradado (rayado del cronograma, subrayado del menú activo).
- **Tinta de banda** (`proyecto-band-ink`, `rosso-band-ink`): blanco sobre la banda en ambas paletas.

### Secondary
- **Lima de acción** (`proyecto-accent`, con texto `proyecto-accent-ink` y hover `proyecto-accent-hover`): solo la acción principal (escribir a un asesor, pedir este lote) y el lote seleccionado en el tablero.
- **Rojo Rosso** (`rosso-accent`, con texto `rosso-accent-ink` y hover `rosso-accent-hover`): el mismo papel en la paleta "rosso".

### Neutral
- **Tinta** (`proyecto-ink` / `rosso-ink`): texto, todos los bordes y reglas, anillo de foco, estado invertido de botones, pestañas y opciones.
- **Tinta suave** (`proyecto-ink-soft` / `rosso-ink-soft`): notas, subtextos de campo, pernos, postes del cartel, rayado de lotes reservados.
- **Suelo** (`proyecto-ground` / `rosso-ground`): fondo de página entre láminas; hover de filas, celdas y pestañas.
- **Papel** (`proyecto-paper` / `rosso-paper`): el cuerpo blanco de cada lámina, la franja superior y el pie.
- **Vendido** (`proyecto-sold` / `rosso-sold`): relleno sólido de lote vendido.
- **Selección** (`proyecto-selection` / `rosso-selection`): fondo de `::selection`.

### Named Rules
**The Same Cartel Rule.** Las dos paletas comparten estructura, medidas y tipografía; una paleta nueva solo puede redefinir pinturas, nunca bordes, anchos ni composición.

**The One Action Rule.** `--accent` se reserva para la acción principal y el lote elegido. Todo lo demás es tinta, papel o banda.

**The White On Band Rule.** El texto sobre `--band-fill` es siempre `--band-ink` blanco, y la banda debe sostener ≥3:1 con él en titulares; si una marca no lo cumple, se profundiza la pintura, no se cambia la tinta.

## Typography

**Display Font:** Archivo variable, eje `wdth` (con "Arial Narrow", sans-serif)
**Body Font:** Archivo variable (con system-ui, sans-serif)
**Label Font:** Archivo variable condensado (`wdth` 72)

**Character:** Una sola familia que cambia de ancho según su oficio, como la rotulación de un cartel: condensada y en mayúsculas para los rótulos, normal para leer, expandida y negra para el titular que se ve de lejos. Las cifras son tabulares en todo el cuerpo.

### Hierarchy
- **Display** (900, `clamp(2.2rem, 5vw, 4.6rem)`, 0.96, `wdth` 125, mayúsculas, máx. 16ch): solo el titular de la banda del cartel principal.
- **Headline** (800, `clamp(1.7rem, 3.4vw, 2.6rem)`, 1, `wdth` 112, mayúsculas): títulos de banda de cada lámina.
- **Title** (800, 1.3rem a 2rem según bloque, 1, `wdth` 110, mayúsculas): subtítulos dentro de láminas (detalle del cronograma, manzana, ficha, ubicación, contacto, pasos de pago).
- **Figure** (900, `clamp(1.6rem, 3vw, 2.3rem)`, 1): la cifra que importa en un campo, como la cuota mensual. El código de lote en la ficha sube a 3.4rem con `wdth` 125.
- **Wordmark** (900, 1.3rem, `wdth` 125, mayúsculas, 0.01em): "LA CAMPIÑA" en la franja. La marca del promotor "ROSSO" en la placa del cartel va en 800, `clamp(1.9rem, 3.4vw, 2.6rem)`, `wdth` 125, 0.08em, compuesta en tipo mientras llega el archivo del logo.
- **Body** (400, 1.125rem, 1.55, `wdth` 100, cifras tabulares): texto corrido; entradillas a 1.2rem y 60ch, notas a 0.95rem y 64ch en tinta suave.
- **Button** (800, 1.05rem, `wdth` 88, 0.03em, mayúsculas): todos los botones.
- **Label** (700, 0.86rem, 0.06em, `wdth` 72, mayúsculas, 1.2): rótulos de campos, menú, sello de fecha, marcas del cronograma, encabezados de tabla.

### Named Rules
**The Width Axis Rule.** La jerarquía se construye con el eje de ancho además del peso: rótulo 72, botón 88, texto 100, títulos 110/112, titular 125. No se introduce una segunda familia.

**The Label Is A Field Rule.** El rótulo condensado nombra un campo o una medida (PROYECTO, CUOTA DESDE, HOY, ENTREGA). No se usa como antetítulo decorativo sobre un titular.

## Layout

Columna centrada de `--max` (1200px) más `--gutter` a cada lado (`clamp(16px, 4vw, 40px)`). El cuerpo principal apila láminas con 56px de separación sobre el `--ground`, con 96px abajo para despejar la barra fija del celular. La franja superior es fija (`--strip-h`, 64px) y el desplazamiento a anclas compensa su altura más 16px.

El cartel principal parte su cuerpo en dos columnas (campos `1fr`, foto `1.08fr`) separadas por una regla de 3px; bajo 900px se apila con la foto primero. El tablero de manzanas usa celdas de `minmax(96px, 1fr)` con 6px de separación junto a la ficha técnica fija (`minmax(320px, 1fr)`), que se apila bajo 960px. Los bloques de dos columnas (ubicación, áreas comunes, contacto, detalle del cronograma) se apilan entre 860px y 900px.

Bajo 1060px el menú y la acción de la franja desaparecen y aparece la barra fija inferior con dos botones. Bajo 560px el control de paleta muestra solo las muestras en botones de 44px. Bajo 520px las bandas reducen su relleno a 14px 18px y el formulario pasa a una columna.

El relleno interior de lámina es `clamp(20px, 3.4vw, 40px)`; las filas de campo usan 11px vertical.

## Elevation & Depth

Sistema plano. No hay `box-shadow` de elevación: la profundidad se expresa con bordes de tinta (`--line` 2px para reglas y controles, `--line-heavy` 3px para láminas, franjas y divisiones mayores), con la inversión tinta/papel en estados activos y con el contraste entre el `--ground` de la página y el `--paper` de las láminas. La única sombra del código es interior (`inset 0 0 0 2px var(--ink)`) y marca el lote seleccionado como un segundo filete.

### Named Rules
**The Ink Not Shadow Rule.** Un elemento se distingue con un borde o una inversión de tinta, nunca con sombra proyectada.

## Shapes

Esquinas rectas en todo: botones, campos, láminas, celdas y fotos llevan radio 0 (los campos de formulario lo fijan explícitamente). La única forma redonda es el hito del cronograma (`border-radius: 50%`, 36px). Los íconos son de señalética: trazo de 2px, terminaciones cuadradas, uniones en inglete, rejilla de 24; solo "play" y "pausa" van rellenos.

Las texturas son de obra y se dibujan con CSS: pernos de 3px en las esquinas (`radial-gradient` en tinta suave sobre papel, blanco al 80% sobre la banda), rayado a 135° para el avance del cronograma y para los lotes reservados, y dos postes de 22px bajo el cartel principal sobre una línea de suelo de 3px.

## Components

### Buttons
Rótulos de chapa: rectos, pesados y en mayúsculas.
- **Shape:** esquinas rectas (0), borde de tinta de 3px, alto mínimo 54px.
- **Default:** papel con texto en tinta, relleno 0 22px, ícono de 22px a 10px del texto.
- **Primary:** `--accent` con `--accent-ink` y borde de tinta; hover a `--accent-hover`.
- **Hover / Focus:** el botón por defecto se invierte a tinta con texto papel en 120ms `--ease-out`; el foco es un contorno de 3px en tinta a 3px de distancia.
- **Small:** alto 44px, relleno 0 14px, 0.92rem. **Disabled:** suelo con tinta suave.

### Chips (opciones del formulario)
- **Style:** papel, borde de 2px en tinta, alto 46px, texto en 700.
- **State:** la opción marcada se invierte a tinta con texto papel; el foco pasa al chip visible.

### Cards / Containers (lámina)
- **Corner Style:** recta (0).
- **Background:** `--paper` con pernos en las cuatro esquinas.
- **Shadow Strategy:** ninguna; ver Elevation & Depth.
- **Border:** 3px en tinta; la banda de cabecera cierra con otra regla de 3px.
- **Internal Padding:** `clamp(20px, 3.4vw, 40px)`; la banda 18px 28px.

### Inputs / Fields
- **Style:** papel, borde de 2px en tinta, radio 0, alto 52px, 1.1rem; marcador en tinta suave. Casillas de 24px cuadradas que se rellenan de tinta con una marca blanca.
- **Focus:** contorno de 3px en tinta a 2px.
- **Error:** el borde sube a 3px y el fondo pasa a `--ground`; el mensaje va en 700 debajo.

### Navigation
Franja superior fija en papel con regla inferior de 3px: marca a la izquierda, menú de rótulos al centro, control de paleta y acción principal a la derecha. El enlace en hover lleva un subrayado de 3px en tinta; la sección en lectura lo lleva en `--band`. Bajo 1060px el menú se oculta y una barra fija inferior ofrece "Lotes" y la acción principal.

### Tabla de campos (signature)
Lista de definición en dos columnas: rótulo condensado y valor en 700, cada fila reglada con 2px en tinta, subtexto en tinta suave y la cifra clave en el estilo Figure. Es la gramática del cartel y se reutiliza en el cartel, la ficha técnica (valores alineados a la derecha) y los pasos de pago.

### Foto con sello (signature)
Foto real a color dentro de un marco de 3px, con un sello de fecha en `--band-fill` y rótulo blanco anclado arriba a la izquierda, reglado con 2px a la derecha y abajo. Si la toma es de video, un botón pequeño "Ver el video" abajo a la derecha la reproduce en el mismo marco. El pie va en papel tras una regla de 3px.

### Cronograma de obra (signature)
Regla horizontal de 14px con borde de 2px, avance rayado en `--band` hasta "HOY" (línea discontinua con plaqueta invertida), marcas de mes debajo y "ENTREGA" al final. Los hitos son círculos de 36px con borde de 3px; el activo se rellena con `--band-fill`. En celular los hitos vecinos se alternan arriba y abajo de la barra.

### Tablero de manzanas (signature)
Pestañas de manzana de 58×52px (la elegida en tinta invertida) sobre una rejilla de celdas de lote con estados honestos: disponible en papel, reservado rayado en tinta suave (con el texto sobre una placa de papel), vendido en `--sold` sólido, elegido en `--accent` con filete interior. La ficha técnica a su lado es una lámina con banda y el código del lote en 3.4rem.

### Control de paleta
Apoyo de presentación: grupo de dos botones de 36px con borde de 2px, cada uno con una muestra cuadrada de 14px; el activo se invierte a tinta.

## Do's and Don'ts

### Do:
- **Do** construir cada sección nueva como lámina: banda de color con título en mayúsculas, cuerpo en papel, borde de 3px en tinta y pernos en las esquinas.
- **Do** presentar los datos como filas de campo regladas con 2px, con el rótulo en `wdth` 72 y el valor en peso 700 o más.
- **Do** dar a cada foto de obra su sello de fecha real.
- **Do** definir cualquier color nuevo como token en ambas paletas, con el mismo papel en cada una.
- **Do** mostrar los estados de lote con relleno honesto: papel, rayado, sólido.

### Don't:
- **Don't** redondear esquinas ni añadir sombras proyectadas; la única forma redonda es el hito del cronograma.
- **Don't** usar `--accent` fuera de la acción principal y el lote elegido.
- **Don't** aclarar el degradado Rosso hasta los valores del logo si el texto blanco baja de 3:1.
- **Don't** introducir una segunda familia tipográfica; usar el eje de ancho de Archivo.
- **Don't** poner rótulos condensados como antetítulos decorativos sobre titulares.
- **Don't** abrir con una foto de drone a sangre completa sobre una rejilla de íconos de amenidades.
