# 0016 · Portada según el diseño del cliente, degradados, videos automáticos y botones a WhatsApp

- **Fecha:** 2026-10-24
- **Rama:** `jheferson` (sin commit al cerrar este documento). `main` sin tocar desde aquí.
- **Pedido del usuario:**
  1. "Respecto a los diseños te voy a pasar de cómo quiero que queden" — dos imágenes: portada en escritorio y en
     móvil (`Downloads/08e61037-….jpg` y `Downloads/WhatsApp Image 2026-10-23 at 20.31.59.jpeg`).
  2. "En los colores hazlos degradados."
  3. "Los videos que se muestran, que se reproduzcan solos."
  4. "Por ahora ve implementando esos campos."
  5. A mitad del trabajo: "Además que todos los botones hagan referencia a WhatsApp".

## Qué se hizo

### Portada (`src/app/page.tsx`, `src/app/globals.css`)

Se rehízo según los dos diseños:

| Elemento | Antes | Ahora (como el diseño) |
|---|---|---|
| Disposición | titular centrado arriba; formulario + carrusel debajo | escritorio: titular y formulario a la izquierda, video a la derecha; móvil: titular → video → formulario |
| Antetítulo | "A 35 min de Chiclayo · Valle de Zaña" centrado | "Valle de Zaña · A 35 min de Chiclayo", a la izquierda |
| Titular | "Lotes campestres para TU CASA DE CAMPO desde 510 m² con escritura pública" | **"TU CASA EN / CLUB PRIVADO / LA CAMPIÑA"** (la última línea en lima con degradado) + "Lotes campestres desde **510 m²** con **escritura pública**." |
| Beneficios | tres píldoras ("48 cuotas…", "Desde S/ 383.75 al mes", "Obra en marcha · entrega…") | tres datos con ícono y separadores: 48 cuotas sin intereses · Obra en marcha · Entrega julio 2027 |
| Fondo | foto del ingreso con velo | foto real del valle (cerros al fondo) apagada, con brillos verdes en degradado |

El diseño muestra un cielo azul y vegetación que no son de La Campiña (parecen imágenes generadas). Se usan
las tomas reales de la obra, como en el resto del sitio.

**Orden en el móvil:** el diseño pone el video antes del formulario; antes el formulario iba primero (pedido
anterior "el formulario pásalo al principio"). Se siguió el diseño nuevo.

### Formulario (`src/components/ContactForm.tsx`)

- Tarjeta clara con degradado, título "Recibe el plano y los precios." a la izquierda y franja
  "Contado desde S/ 17,000 · 19 lotes" con ícono de etiqueta (los montos salen de la lista de precios).
- Campos con ícono: persona en "Nombres y apellidos\*"; WhatsApp + "+51" en "Tu número de WhatsApp\*".
- Opciones con círculo de selección: "Desde S/ 3 mil" y **"Pago al contado"** (sin monto: ya está en la franja).
  En escritorio van lado a lado; en el móvil, una debajo de otra.
- **"Desde S/ 3 mil" viene marcada**, como en el diseño. Antes no había opción marcada.
- Valor que llega al CRM y a la hoja en `busca`: `"Inicial desde S/ 3 mil"` o, ahora,
  `"Pago al contado (desde S/ 17 mil)"` (antes `"Pago al contado S/ 17 mil"`).
- Aviso legal con candado. Se quitó "Atención directa de Rosso Inmobiliaria" (no está en el diseño).
- Después de enviar: además del aviso "Solicitud recibida", un botón "Escríbenos ahora por WhatsApp".
- El envío al CRM, la hoja de leads y el evento de los píxeles (`registrationEvent`, doc 0013) no cambian.

### Carrusel con video automático (`src/components/HeroCarousel.tsx`)

- Cada toma **reproduce sola su video de drone** (sin sonido) y al terminar pasa a la siguiente (los clips duran
  6.5–11 s y no tienen audio). Si el visitante elige una toma o pasa el mouse encima, el clip se repite.
- El video empieza 0.6 s después de que la página termina de cargar, para que la foto se pinte primero.
- Se detiene fuera de pantalla y con la pestaña oculta. Con movimiento reducido, "Pausar animaciones" o ahorro
  de datos no se descarga ningún video: quedan las fotos (con movimiento, pasan solas cada 6 s).
- Tarjeta sobre el video como en el diseño: ícono de drone, "Conoce el terreno real", la descripción y
  **"Ver video drone ↗"**, que abre el video en grande con controles (ventana que se cierra con Escape, con la X
  o tocando fuera). Ese clic se mide como `video_play`.
- Debajo: "Recorre La Campiña · 1/5", flechas y cinco miniaturas (en el móvil: tres miniaturas visibles,
  contador y flechas en una fila).
- **Agregado que no está en el diseño:** un botón redondo de pausa en la esquina del video. Es obligatorio para
  accesibilidad (contenido que se mueve solo más de 5 s debe poder pausarse; WCAG 2.2.2).

### Banda de obra (`src/components/ObraBand.tsx`)

Los cuatro vuelos de drone se reproducen solos y sin sonido mientras la banda está en pantalla (antes solo el
primero). Cada panel conserva su botón "Pausar / Ver video". Las mismas reglas de movimiento, datos y pestaña
oculta que el carrusel.

### Todos los botones a WhatsApp (nuevo `src/components/WhatsAppCta.tsx`)

Invierte la regla de `0014` ("todo botón al formulario; WhatsApp solo en el flotante"). Cada botón de contacto
abre WhatsApp (941 377 136) con un mensaje listo; la medición agrega el código `R-` al final:

| Botón | Mensaje | Fuente (`data-track`) |
|---|---|---|
| "Agenda tu visita" / "Agendar" (barra y menú) | "Hola, quiero agendar una visita a La Campiña." | `header-contact` |
| "Consultar el lote X" (ficha, portada y `/lote/X`) | el lote, su área y la simulación elegida (inicial, plazo y cuota) o el precio al contado | `lot-whatsapp` |
| "Consultar lotes similares a X" (lote vendido o reservado) | el lote y su estado | `lot-whatsapp` |
| "Pedir asesoría por el lote X" (`/lote/X`) | asesoría sobre ese lote | `lot-whatsapp` |
| "Pide la ubicación exacta", "Pide la documentación" (pestañas) | ubicación / documentación | `decision-whatsapp` (nueva) |
| "¿Estás lejos? Pide una videollamada" (obra) | videollamada | `obra-whatsapp` (nueva) |
| Canales "Agenda tu visita" y "¿Estás lejos?" (contacto) | visita / videollamada | `contact-whatsapp` |
| "Pide el plano", "Videollamada", "Agenda tu visita" (pie) | plano / videollamada / visita | `footer-whatsapp` (nueva) |
| Botón flotante | "Hola, quiero información de los lotes de La Campiña." | `float-contact` |

El **formulario sigue siendo formulario** (se envía al CRM y a la hoja), no abre WhatsApp. Sin número de WhatsApp
configurado, los botones caen al formulario, como antes. Las tres fuentes nuevas se agregaron a `SOURCES`
(`src/lib/tracking/schema.ts`) para que el panel las nombre.

### Botón flotante (`src/components/AsesorFlotante.tsx`)

Escritorio: tarjeta blanca "ASESOR EN LÍNEA · ¡Hablemos!" con el punto verde de en línea y el círculo de
WhatsApp. Móvil: solo el círculo verde de WhatsApp con borde blanco. **La foto del asesor del diseño no se
puso:** no hay una foto real y una persona de banco de imágenes haría creer que esa persona responde. Queda un
ícono de auricular y el lugar listo (`PROYECTO.contacto.asesorFoto`) para la foto real.

### Cabecera (`src/components/SiteHeader.tsx`)

"Agenda tu visita" con ícono de calendario y borde lima (en el móvil, "Agendar"); el botón del menú móvil pasa
a ser el ícono de tres líneas, con nombre accesible "Abrir el menú" / "Cerrar el menú".

### Degradados (`src/app/globals.css`)

Tokens nuevos `--grad-*`: lima (botones principales, opción activa del simulador, insignias), verde (botón de
envío, cuota de la ficha, aviso de enviado), superficies (tarjetas de cifras, canales, bitácora, preguntas,
ficha), bandas (sección "Por qué", pie), papel (tarjeta del formulario y botón flotante), franja de promoción,
opción elegida, texto lima (nombre del titular y palabra clave de los títulos de sección) y WhatsApp. Cada
degradado mantiene el contraste de su color plano (blanco sobre el verde más claro del degradado: 5.1:1).

El fondo general de la página se dejó sólido: con un degradado en `body`, las herramientas de accesibilidad no
pueden medir el contraste y lo marcan como falla.

### Íconos (`src/components/Icon.tsx`)

Nuevos: usuario, candado, etiqueta, casco, tarjeta, flecha "abrir", auricular y el glifo de WhatsApp.

## Archivos

| Archivo | Cambio |
|---|---|
| `src/app/page.tsx` | Portada nueva; botones de pestañas, obra, contacto y pie a WhatsApp |
| `src/app/globals.css` | Tokens de degradado; estilos de cabecera, portada, formulario, carrusel, ventana de video y botón flotante; superficies con degradado |
| `src/components/HeroCarousel.tsx` | Video automático por toma, tarjeta del video, ventana "Ver video drone", contador, flechas, miniaturas, pausa |
| `src/components/ObraBand.tsx` | Los cuatro videos se reproducen solos |
| `src/components/ContactForm.tsx` | Campos con ícono, opciones con círculo, "Pago al contado", primera opción marcada, botón a WhatsApp tras enviar |
| `src/components/WhatsAppCta.tsx` | Nuevo: botón que abre WhatsApp con mensaje |
| `src/components/Ficha.tsx` | "Consultar el lote" a WhatsApp con la simulación (`mensajeLote`) |
| `src/components/LoteDetalle.tsx` | "Pedir asesoría por el lote" a WhatsApp |
| `src/components/SiteHeader.tsx` | "Agenda tu visita/Agendar" a WhatsApp; ícono de menú |
| `src/components/AsesorFlotante.tsx` | Diseño nuevo; lugar para la foto real |
| `src/components/Icon.tsx` | Íconos nuevos |
| `src/content/proyecto.ts` | `contacto.asesorFoto` (pendiente) |
| `src/lib/tracking/schema.ts` | Fuentes `decision-whatsapp`, `obra-whatsapp`, `footer-whatsapp` |

## Cómo se verificó

Build de producción (`next build` + `next start`) en Chrome real con Playwright; `wa.me` interceptado para no
salir a internet.

| Prueba | Resultado |
|---|---|
| `tsc --noEmit` | sin errores |
| `npm test` (TypeScript 5.9) | 39 pasan, 1 falla: "Global Privacy Control forces marketing off", la misma de `main` |
| `next build` | completo, 150 páginas |
| Capturas a 1600, 1440, 1280, 1024, 390 y 360 px | sin desborde horizontal; el titular entra en tres líneas en todos los anchos; revisadas a mano contra el diseño |
| Video del carrusel | se reproduce solo en los seis anchos (`/media/hero.mp4`) |
| "Ver video drone" | abre la ventana con el video en reproducción y controles; Escape la cierra |
| Banda de obra | los cuatro videos en reproducción al entrar en pantalla |
| Movimiento reducido (390 px) | sin video en el carrusel, 0 videos en la banda, sin botón de pausa |
| Enlaces de contacto en `/` | 10, todos a `wa.me/51941377136` con su fuente; 0 a `#formulario` |
| Ficha: 24 cuotas + "Consultar el lote G18" | abre WhatsApp con "…lote G18 de La Campiña (510 m²). Simulé una inicial de S/ 3,000 y 24 cuotas de S/ 767.50. ¿Me brindan más información?" |
| `/lote/G18` | "Consultar el lote G18" y "Pedir asesoría por el lote G18" a WhatsApp |
| Errores de consola | ninguno, salvo los 503 conocidos de `/api/tracking/*` en local |
| Lighthouse escritorio | rendimiento 94, accesibilidad 100, CLS 0, TBT 0 ms |
| Lighthouse móvil (1 corrida) | rendimiento 72 (antes 65–67), accesibilidad 100, CLS 0, TBT 130 ms, LCP 7.8 s |

## Pendientes

- **Foto del asesor:** el diseño muestra una persona; falta una foto real (con su autorización) para el botón
  flotante. Se agrega en `PROYECTO.contacto.asesorFoto`.
- **Datos móviles:** ahora se descargan solos hasta cinco videos (0.6–1.1 MB cada uno) cuando están en pantalla.
  Con ahorro de datos o 2G no se descargan. Conviene revisar en un teléfono real con datos.
- **Formulario frente a WhatsApp:** el formulario sigue enviando al CRM y a la hoja. Si se quiere que su botón
  también abra WhatsApp (como en DLC: "Reclamar descuento en WhatsApp"), es un cambio aparte que toca la
  medición de la doc 0013.
- **Opción marcada por defecto:** quien no toque la pregunta queda registrado como "Inicial desde S/ 3 mil".
- **Commit, push y despliegue:** pendientes de pedido; no se despliega desde este entorno.
