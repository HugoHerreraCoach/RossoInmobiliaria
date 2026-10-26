# DESIGN.md — La Campiña · Rosso Inmobiliaria

Vigente desde el 2026-10-23 (`docs/0012-rediseno-guiado-por-dlc.md`, ajustado en
`docs/0014-formulario-dlc-y-plano-en-proyecto.md` y, la portada, según el diseño del cliente en
`docs/0016-portada-segun-diseno-y-botones-whatsapp.md`).

## 1. Referencia y criterio

La referencia es la landing de **Grupo DLC** (grupodlc.conexigo.com): una landing de conversión
oscura con formulario en la portada. Se toma su estructura y su experiencia, no su marca: colores,
fotos, textos y cifras son de La Campiña. Lo que la referencia tiene y La Campiña no (testimonios,
renders, foto del asesor, bonos) no se inventa.

Otras páginas que el usuario comparta muestran el nivel de experiencia deseado; no se copian.

## 2. Tokens (`src/app/globals.css`)

| Rol | Valor | Uso |
|---|---|---|
| Fondo | `#06120e` → `#020705` (`--bg` → `--black`) | cada sección baja de `--bg` a casi negro y vuelve a `--bg` en sus bordes (0023) |
| Superficies | `#0b1d16`, `#10271e` | tarjetas, bandas, ficha |
| Líneas | `rgba(238, 242, 234, 0.10 / 0.18)` | bordes de tarjetas y píldoras |
| Texto | `#eef2ea` | texto principal |
| Texto suave | `#a9b8ae` | párrafos secundarios (8.6:1 sobre el fondo) |
| Lima de marca (acento) | `#a6c138` | palabras clave de titulares, cifras, botón principal |
| Verde de marca | `#006f55` | botón de envío del formulario, cuota de la ficha, botón flotante |
| Tarjeta de formulario | `#ffffff` con tinta `#0b1d16` | formularios (esquema de color claro) |
| Plano | `--plan-*` | lotes trazados en cal sobre tierra |
| Degradados | `--grad-*` | lima (botones principales), verde (envío, cuota), superficies y bandas, papel (formulario, flotante), franja de promoción, opción elegida, texto lima (todo texto grande en verde: nombre y palabras destacadas de la portada, palabra clave de los títulos, cifras de las tarjetas), WhatsApp |

Los colores van en degradado (pedido del cliente, 0016), cada uno con el contraste de su color plano. El
`body` es sólido para que el contraste se pueda medir; el degradado de fondo va en cada sección (0023): de `--bg` a
`--black` con un brillo verde de marca (`--glow-forest`) que entra por un costado sin tocar los bordes y alterna de
lado (`.section--glow-left`); las bandas y el pie bajan del verde al negro, y el cierre se ilumina desde arriba
(`--glow-teal`). Ningún fondo detrás de un texto es más claro que #123429. Todo texto grande (20 px o más) en verde
lleva `--grad-text-lime` (0022); el lima plano queda para el texto chico, los botones de contorno y los íconos. Ese
degradado es claro: solo va sobre fondo oscuro.

**Tipografía:** Outfit (titulares, cifras, botones) y Plus Jakarta Sans (texto), con `next/font` y
`display: optional` para que el cambio de fuente no mueva la página.

**Forma:** tarjetas de 24 px de radio, píldoras y botones redondeados, antetítulo en mayúsculas con
línea, palabra clave del titular en lima.

## 3. Secciones

| Sección | id | Contenido |
|---|---|---|
| Portada | `inicio` (`#formulario`) | según el diseño del cliente: antetítulo, "TU CASA EN / CLUB PRIVADO / LA CAMPIÑA", subtítulo, tres beneficios con ícono; video de drone con miniaturas; formulario |
| El proyecto | `proyecto` (con `section#lotes`) | plano interactivo de los 132 lotes a todo el ancho, con los botones del lote elegido, y la ficha con simulador debajo en dos columnas (se monta al acercarse; docs/0025) |
| Lo que vas a disfrutar | `areas` | fotos reales de lo construido + chips de lo proyectado |
| Obra | `avance` | banda de vuelos de drone + bitácora fechada |
| Por qué | `por-que` | pestañas Ubicación / Financiamiento directo / Papeles claros + cifras |
| Preguntas | `preguntas` | seis respuestas con datos de `PRODUCT.md` |
| Contacto | `contacto` | canales que abren WhatsApp |
| Pie | — | marca, columnas, aviso legal, pausar animaciones |
| Flotante | — | escritorio: tarjeta "Asesor en línea · ¡Hablemos!" con círculo de WhatsApp; móvil: solo el círculo. Abre su propio chat, como el de DLC: cabecera del asesor, saludo y el formulario de la landing; al registrar abre WhatsApp (docs/0029) |

En escritorio (desde 1200 px), titular y formulario a la izquierda y video a la derecha; la columna del video ocupa
todo el alto de la izquierda (empieza con el antetítulo y sus miniaturas terminan con el formulario, sin hueco: 0018); en el móvil, titular → video →
formulario. Es el único formulario: nombres y apellidos, WhatsApp (+51) y las preguntas de la landing (hoy, en las dos, "¿Con cuánto cuentas de inicial?": "S/ 3,000 a
S/ 10,000", marcada, / "Pago al contado S/ 17 mil"), sin casilla; el aviso de contacto va bajo el botón y se envía al CRM.

**Todo botón de contacto abre WhatsApp** con un mensaje listo (`WhatsAppCta`), con su fuente de medición.

**Dos landings, un diseño** (`docs/0017`): `/` (Lambayeque) y `/promocion` (Lima) son la misma página
(`src/components/Landing.tsx`). Solo cambian las preguntas del formulario, la hoja de leads y los eventos de los
píxeles, todo en `src/content/landings.ts`. Cualquier cambio de diseño vale para las dos.

**El plano** (`docs/0025`) va a todo el ancho y, en escritorio, no pasa del alto de la pantalla. Se dibuja girado
(`src/content/planoGirado.ts`, sin tocar `plano.ts`): la vía horizontal y abajo desde 700 px, vertical y a la
derecha en el celular, con los rótulos derechos. En la esquina inferior derecha, junto a la leyenda y fuera del
dibujo (para no tapar lotes), van «Consultar este lote por WhatsApp» (sube al formulario con el lote cargado) y
«Ver detalle de este lote» (baja a la ficha); se activan cuando el visitante elige un lote. La ficha va debajo, a
lo ancho del contenido, en dos columnas desde 900 px.

`/lote/[id]` muestra el mismo plano con la ficha: abre completo con el lote resaltado y, al tocar otro,
cambia la ficha, el título y la dirección sin recargar.

**Portada en el celular:** el pie de cada toma del carrusel va debajo de la imagen, con alto fijo (no la tapa ni
mueve la página al rotar).

## 4. Movimiento

Lenis (solo rueda), entradas escalonadas de los encabezados, carrusel cuyos videos de drone se
reproducen solos uno tras otro (con botón de pausa), banda de obra con sus cuatro videos en reproducción
automática, plano que se traza al entrar. Los videos esperan a que la página cargue, se detienen fuera de
pantalla o con la pestaña oculta y no se descargan con ahorro de datos. Todo se apaga con
`prefers-reduced-motion` o con "Pausar animaciones".

## 5. Reglas

- Medición: no renombrar `id` de secciones, `data-track`, `data-lot` ni `data-track-form` sin
  actualizar el panel.
- Las cifras salen de `src/content/lotes.ts` y `src/content/proyecto.ts`. Montos y áreas llevan espacio
  duro entre la cifra y su símbolo o unidad.
- El plano sale del plano de lotización oficial (PTL-01, `src/content/plano.ts`, docs/0019): no se dibuja a mano. Si cambia la lotización, se regenera con `scripts/plano/`. Sigue siendo referencial: el aviso pide confirmar con un asesor.
- Imágenes: solo fotos y videos reales de la obra. Las imágenes de referencia del cliente (cielo azul,
  vegetación, persona en el botón flotante) marcan la composición, no el contenido.
