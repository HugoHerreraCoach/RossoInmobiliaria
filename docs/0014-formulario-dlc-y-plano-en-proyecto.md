# 0014 · Formulario como DLC, plano en "El proyecto" y ficha del lote interactiva

- **Fecha:** 2026-10-23
- **Rama:** `jheferson`, subido el 2026-10-23 a `origin/jheferson` en el commit `c316261`; el trabajo de píxeles
  de la otra sesión va en `23e2395`. Después el dueño lo unió a `main` el mismo día (commit `1be4da0`).
- **Sigue a:** `0012-rediseno-guiado-por-dlc.md`. El número 0013 lo usa otra sesión que trabaja en paralelo
  (píxeles y hoja de leads); este cambio no toca sus archivos.
- **Pedido del usuario (resumen):**
  1. Quitar el formulario de la sección de contacto (`#formulario-contacto`). Todos los botones, salvo el
     botón flotante de WhatsApp, llevan al formulario de la portada (`#formulario`).
  2. Quitar la tarjeta del proyecto (`#proyecto/div/div[2]`) y poner en su lugar el plano con la ficha
     (`#lotes/…/div[2]`, el bloque `.lots`).
  3. En la ficha, quitar "Compartir ficha" y resaltar el enlace a la ficha completa con el texto "Ver detalle".
  4. En la página que abre ese enlace, que el esquema siga siendo interactivo: al tocar otro lote se ve su
     información. Sin botón de compartir.
  5. Formulario como el de DLC: "Nombres y apellidos*" y solo "WhatsApp" (sin "Celular"); la pregunta
     "¿Con cuánto de inicial te gustaría empezar?" con "Desde S/ 3 mil" y "Pago al contado S/ 17 mil"
     reemplaza a "Estoy buscando un lote para…"; quitar "Personalizar mi solicitud" y la casilla de
     autorización.

## Qué se hizo

### Formulario (`src/components/ContactForm.tsx`)

Se tomó la forma exacta del formulario de grupodlc.conexigo.com (revisado con `curl`: placeholders
"Nombre y apellidos*" y "Tu número de whatsapp*" con prefijo +51, la pregunta de inicial con dos opciones y
sin casilla de autorización).

| Antes | Ahora |
|---|---|
| "Nombre completo" + placeholder "¿Cómo te llamas?" | placeholder **"Nombres y apellidos\*"** (etiqueta solo para lectores de pantalla) |
| "Celular / WhatsApp" | prefijo **+51** y placeholder **"Tu número de WhatsApp\*"** |
| "Estoy buscando un lote para: Invertir / Para mi familia / A distancia" | **"¿Con cuánto de inicial te gustaría empezar?"**: "Desde S/ 3 mil" / "Pago al contado S/ 17 mil" |
| "Personalizar mi solicitud" (ciudad, lote, visita, día) | eliminado |
| Casilla "Autorizo a Rosso Inmobiliaria a contactarme…" | eliminada; aviso bajo el botón: "Al enviar, aceptas que Rosso Inmobiliaria te contacte por WhatsApp o llamada sobre este proyecto. Privacidad" |

- Los montos de las opciones salen de la lista de precios: la inicial mínima de los lotes disponibles
  (S/ 3,000) y la promoción al contado más baja (`DESDE_CONTADO`, S/ 17,000), redondeadas a miles.
- **Contrato de `/api/lead` sin cambios.** La respuesta de la inicial viaja en el campo `busca` (texto
  libre de hasta 40 caracteres): `"Inicial desde S/ 3 mil"` o `"Pago al contado S/ 17 mil"`; si el
  visitante no elige, va vacío (la pregunta es opcional para no perder contactos). `ciudad` y `dia` van
  vacíos y `visita` en `false`. `consentimiento` va en `true`: la API lo sigue exigiendo y el envío del
  formulario, con el aviso visible junto al botón, es la autorización.
- El lote elegido en el plano sigue llegando al formulario (evento `campina:lote` o `?lote=`), con su
  banda "Tu lote seleccionado" y el botón "Consultar lote X".
- Queda un solo formulario en la página (`hero-form`). La fuente `contacto-form` sigue aceptada por la API.

### Página principal (`src/app/page.tsx`)

- **El proyecto:** la tarjeta (mini plano, cifras, 0 % de interés, lista de áreas y botones) se reemplazó
  por el plano interactivo con la ficha y el simulador. Va dentro de una sección anidada
  `<section id="lotes">`, para que los enlaces a `#lotes` y la medición de la sección "lotes"
  (`section_view`) sigan funcionando. Se conservó el aviso de que el plano es un esquema de consulta.
- **La sección "Lotes" separada se eliminó** (su barra de filtros ya no tiene lugar: se pidió solo el
  bloque del plano y la ficha).
- **Contacto:** sin formulario; los canales "Agenda tu visita" y "¿Estás lejos?" llevan a `#formulario`.
  Se quitó la variante de WhatsApp de los canales: el único WhatsApp es el botón flotante.
- Menú y pie: "Lotes" pasa a ir después de "El proyecto" (es donde ahora está el plano).

### Plano (`src/components/LotStack.tsx`, `LazyLotStack.tsx`)

- Se quitó la barra superior (mapa/lista, buscador, "solo disponibles", promoción, cuota máxima y pestañas
  de manzana) y la vista en cuadrícula. Queda el plano con su barra propia (colorear por, foto de
  referencia, zoom), los rótulos de manzana para acercarse, la leyenda y la ficha.
- `?vista=precio` ya no abre la cuadrícula: se ignora y el plano abre completo.
- Nuevo modo para la página del lote: `<LotStack lote={…} onLote={…} />` arranca con ese lote, avisa a la
  página cuando se elige otro y no escribe `?vista=&lote=` en la URL. En ese modo no corre la animación de
  trazado (el plano llega pintado desde el servidor).
- El plano se monta a 600 px de distancia (antes 1200 px), porque ahora está justo después de la portada.
- Se borró `MiniMasterplan` (ya no lo usa nadie).

### Ficha (`src/components/Ficha.tsx`)

- Sin "Compartir ficha": se quitaron el botón, la función `compartir`, el mensaje de enlace copiado y el
  evento `share_lot` (el evento sigue en el esquema para no romper el historial del panel).
- "Abrir su ficha" ahora es **"Ver detalle"**: botón de ancho completo con borde lima, debajo de la acción
  principal.
- La acción principal ("Consultar el lote X") lleva siempre al formulario (`#formulario` en la portada,
  `/?lote=X#formulario` desde la página del lote), con `data-track="lot-contact"`. Ya no hay variante
  de WhatsApp en la ficha.

### Página del lote (`src/app/lote/[id]/page.tsx`, nuevo `src/components/LoteDetalle.tsx`)

- La página muestra el mismo plano interactivo con la ficha. Abre el plano completo con el lote resaltado
  y, al tocar otro lote, cambian sin recargar el título, el texto, la ficha, la dirección (`/lote/F11`)
  y el título de la pestaña. Se mide `lot_view` como en la portada.
- "Volver al plano", "Pedir asesoría por el lote X" y la acción de la ficha siguen al lote elegido.
- Sin botón de compartir.
- Siguen generándose las 132 páginas estáticas con su metadata.

### Otros

- `src/content/lotes.ts`: `soles`, `soles0` y `m2` usan espacio duro entre el símbolo o la unidad y la
  cifra ("S/ 17,000", "510 m²"), para que "S/" no quede solo al final de una línea (se veía en la
  promoción y en las opciones del formulario en el móvil). El valor que se envía al CRM en `busca` usa
  espacios normales.
- `src/components/ContactCta.tsx`: eliminado (sin uso).
- `src/app/globals.css`: estilos nuevos del prefijo +51, de las dos opciones, del aviso legal, de
  "Ver detalle" y de la página del lote; se borraron los estilos de la tarjeta del proyecto, del mini plano,
  de la barra de filtros, de la cuadrícula, del formulario de contacto y de la casilla. El alto de reserva
  del plano se ajustó al alto medido (1208 px en escritorio, 1286 px a 1100 px, ~1800 px en tableta,
  1909 px a 390 px).

## Archivos

| Archivo | Cambio |
|---|---|
| `src/components/ContactForm.tsx` | Formulario de dos datos + inicial, sin extras ni casilla |
| `src/app/page.tsx` | Plano en `#proyecto` (con `section#lotes`), sin sección Lotes, contacto sin formulario |
| `src/components/LotStack.tsx` | Solo plano + ficha; modo página del lote; sin `MiniMasterplan` |
| `src/components/LazyLotStack.tsx` | Montaje a 600 px |
| `src/components/Ficha.tsx` | Sin compartir; "Ver detalle"; acción al formulario |
| `src/components/LoteDetalle.tsx` | Nuevo: página del lote con plano interactivo |
| `src/app/lote/[id]/page.tsx` | Usa `LoteDetalle` |
| `src/components/SiteHeader.tsx` | Orden del menú |
| `src/content/lotes.ts` | Espacio duro en montos y áreas |
| `src/app/globals.css` | Estilos nuevos y limpieza |
| `src/components/ContactCta.tsx` | Eliminado |

## Cómo se verificó

Contra el build de producción (`next build` + `next start`, un solo servidor) con Chrome real
(Playwright), a 1440 px y 390 px:

| Prueba | Resultado |
|---|---|
| `tsc --noEmit` | sin errores |
| `npm test` (TypeScript 5.9) | 39 pasan, 1 falla: "Global Privacy Control forces marketing off", la misma que ya fallaba en `main`. Corrido con el árbol completo, incluidos los cambios de la otra sesión (píxeles y hoja) |
| `next build` | compila con los cambios de ambas sesiones; 150 páginas (132 lotes) |
| Rutas | `/`, `/lote/G18`, `/lote/F11`, `/privacidad`, `/panel` responden 200 |
| Formularios en la página | 1 (`hero-form`); `#formulario-contacto` no existe |
| Campos | "Nombres y apellidos\*", "Tu número de WhatsApp\*", pregunta de inicial con "Desde S/ 3 mil" y "Pago al contado S/ 17 mil"; 0 casillas, 0 desplegables |
| Enlaces a `#contacto` o `#formulario-contacto` | 0; canales y botón de la barra → `#formulario`; botón flotante → `#formulario` (WhatsApp cuando haya número) |
| Plano en `#proyecto` | `.lots` dentro de `#proyecto #lotes`; sin barra de filtros |
| Ficha | sin "Compartir ficha"; "Ver detalle" → `/lote/G18` |
| Tocar C3 y "Consultar el lote C3" | la URL pasa a `/?lote=C3#formulario` y el formulario muestra "C3, 516 m²" y el botón "Consultar lote C3" |
| Enviar vacío | errores "Escribe tus nombres y apellidos." y del número de WhatsApp, con foco en el primero |
| `/lote/G18` → tocar F11 | título "Ficha del lote F11", URL `/lote/F11`, pestaña "Lote F11 · 1,550 m² en Manzana F · La Campiña", acciones a `/?lote=F11#formulario`; sin "Ver detalle" ni "Compartir" |
| Errores de consola | ninguno, salvo los 503 conocidos de `/api/tracking/*` en local (sin `DATABASE_URL`) |
| Lighthouse escritorio | rendimiento 96, accesibilidad 100, CLS 0, TBT 10 ms |
| Lighthouse móvil (2 corridas, equipo libre) | rendimiento 65 y 67 (0012: mediana 60), accesibilidad 100, CLS 0, TBT 430 y 370 ms, LCP 6.6 y 6.4 s. Una primera corrida mientras la otra sesión trabajaba dio TBT 3.7 s con el equipo a media velocidad (índice 1138); se descartó. El código del plano no se descarga al cargar en el móvil: 9 archivos JS, 651 KB (antes 682 KB) |
| Alto de reserva del plano | reserva contra alto real: 1210/1208 (1440 px), 1290/1286 (1100 px), 1790/1771–1805 (700–1000 px), 1900/1909 (390 px) |

Las capturas se revisaron a mano: formulario de portada en escritorio y móvil, formulario con errores, plano
con la ficha, botones de la ficha, contacto y página del lote.

## Pendientes

- **Trabajo en paralelo:** otra sesión agregó en el mismo árbol los píxeles y la hoja de leads (doc 0013).
  Desde el formulario manda `inicial: busca` al evento de registro, así que la respuesta a la pregunta de
  inicial también llega a los píxeles. Los dos trabajos se subieron juntos a `jheferson` en commits separados.
- **Revisión del dueño, unión a `main` y despliegue:** no se hacen desde este entorno. GitHub ofrece abrir la
  solicitud de unión en `https://github.com/HugoHerreraCoach/RossoInmobiliaria/pull/new/jheferson`.
- **Consentimiento:** sin casilla, la autorización es el envío con el aviso visible junto al botón (como en
  DLC). Conviene que el dueño confirme con su asesoría legal que eso cumple la Ley 29733 para su caso; si
  no, se vuelve a poner la casilla.
- **CRM:** el campo `busca` ahora trae la inicial elegida ("Inicial desde S/ 3 mil" / "Pago al contado
  S/ 17 mil") en lugar del perfil. Si ConexiGO lo muestra como "Busca lote para", conviene renombrar la
  etiqueta allá.
- **Sin filtros en el plano:** se pierden el buscador por código, "solo disponibles", la cuota máxima y la
  lista ordenada por cuota. Si se extrañan, se pueden devolver en la página del lote o en un desplegable.
- **Teléfono y Google Maps:** el canal "Llámanos" y el enlace a Maps solo aparecen cuando el cliente entregue
  esos datos; no son botones de contacto al formulario. Si también deben ir al formulario, se cambian.
