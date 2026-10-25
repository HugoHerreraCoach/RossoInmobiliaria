# 0029 · La primera pregunta de Lima que faltaba y el chat del asesor como en DLC

- **Fecha:** 2026-10-24
- **Rama:** `jheferson` (sin commit al cerrar este documento).
- **Corrige 0026.** Ahí faltó una de las dos preguntas de Lima y el botón flotante se resolvió mal.

## Pedido del usuario

> «Te faltó agregar una pregunta: […] El proyecto está en el Valle Zaña (a 30 min de Chiclayo y 5 min de Sipán). ¿Es la
> zona que buscas? 🔘 Sí, me interesa el Valle Zaña. 🔘 Me puedo adecuar (Este debía aparecer primero) […] El botón
> flotante, al hacerle click abría su propio formulario con las mismas preguntas del formulario principal, no que lo
> redirigieras al form, por eso te dije que revises el código de DLC y que lo repliques pero con las preguntas de cada
> landing correspondiente.»

Qué falló en 0026:
- En el mensaje que traía las preguntas, el mismo bloque pegado aparecía dos veces con la pregunta de modalidad. Se
  implementó esa sola, sin preguntar si faltaba otra.
- «que funcione igual abriendo el formulario» se entendió como llevar al formulario de la portada, en vez de replicar
  el chat flotante de DLC.

## Qué se hizo

### 1. Lima tiene dos preguntas, en este orden

1. «El proyecto está en el Valle Zaña (a 30 min de Chiclayo y 5 min de Sipán). ¿Es la zona que buscas?», con las
   opciones «Sí, me interesa el Valle Zaña.» y «Me puedo adecuar». Columna **ZONA**.
2. «Para asegurar tu lote en Sipán – Valle Zaña, ¿qué modalidad de preventa prefieres?», con las opciones «Al contado
   S/ 17,000» y «Financiado desde S/ 3,000». Columna **MODALIDAD** (0026).

- Los textos son los del cliente, tal cual. Ninguna de las dos viene marcada, y si falta una el formulario lo avisa
  antes de enviar.
- **Encabezados de la hoja de Lima** (pestañas «LEADS META» y «LEADS TIKTOK»): `NOMBRE DE CAMPAÑA | FECHA | NOMBRE |
  NUMERO | ZONA | MODALIDAD | TikTok Lead ID | TikTok Lead Status | Lead creation time | Lead update time | ORIGEN |
  FUENTE | LOTE`. La hoja que ya está en producción tiene MODALIDAD en la columna E. **Antes de desplegar esta versión
  hay que insertar en las dos pestañas una columna E llamada ZONA**; si no, cada dato quedaría corrido una columna.
- El evento de los píxeles lleva como parámetro la respuesta de la modalidad (`preguntaPixel`). Antes tomaba siempre
  la primera pregunta, que ahora sería la zona.

### 2. El chat del asesor, como el de DLC

Se replicó `WhatsAppFlotante.tsx` de DLC (`DLCconexigo/src/views/home/components/`), con lo de cada landing:

- **El botón flotante abre un chat sobre él**, en vez de llevar al formulario de arriba. El chat tiene una cabecera
  («Asesor de Rosso Inmobiliaria · En línea · La Campiña», con su punto verde y el botón para cerrar) y un saludo:
  «¡Hola! 👋 Soy tu asesor de Rosso Inmobiliaria. Estamos en preventa de lotes campestres en el Valle de Zaña: al
  contado desde S/ 17,000 o con inicial desde S/ 3,000 y 48 cuotas sin intereses. ¿Cómo te podemos ayudar hoy?». Los
  montos salen de la lista de precios.
- **Debajo, «Déjanos tus datos y un asesor te escribirá por WhatsApp:» y el mismo formulario de la landing:** nombre,
  WhatsApp con +51 y las preguntas. En `/` va «¿Con cuánto cuentas de inicial?», marcada como en la portada; en
  `/promocion`, las dos de Lima. Es el mismo componente de la portada (`ContactForm`, `variante="chat"`), así que
  cualquier cambio de preguntas vale para los dos formularios.
- **Al enviar**, igual que DLC:
  1. Guarda la fila en la hoja de la landing con su propio ORIGEN: «Landing · Chat del asesor» en Lambayeque y
     «Landing · Chat del asesor (Lima)» en Lima. Fuentes `chat-form` y `promocion-chat`.
  2. Con la fila confirmada, envía el evento de la landing: `CompleteRegistration` o `SubmitApplication`.
  3. Arma el enlace de WhatsApp con el código de la intención («Ref: R-…»), para que ConexiGO atribuya el chat.
  4. 0.8 s después, abre WhatsApp: en el celular en la misma pestaña (abre la app) y en escritorio en otra. Si el
     navegador lo bloquea, queda «¿No se abrió WhatsApp? Ábrelo aquí».
- El mensaje de WhatsApp lleva el nombre, el lote si eligió uno y las respuestas. Por ejemplo: «Hola, soy Prueba de
  Jhef. Acabo de dejar mis datos en la web de La Campiña. Me puedo adecuar. Financiado desde S/ 3,000. ¿Me envían el
  plano y los precios?». El botón «Escríbenos ahora por WhatsApp» del formulario de la portada usa el mismo mensaje.
- **El chat no se borra al cerrarlo:** se cierra con la X, con Escape o con el mismo botón, el foco vuelve al botón y,
  al reabrirlo, conserva lo escrito.
- **El botón de envío del chat siempre queda a la vista**, con una franja del color del fondo. En el celular el chat
  ocupa casi todo el ancho y nunca pasa bajo la cabecera.
- El aspecto es el de Rosso, no el de DLC: tarjeta blanca como el formulario de la portada, cabecera verde oscuro y el
  botón verde con el ícono de WhatsApp. La foto del asesor aparece cuando el cliente entregue una real.
- «Consultar este lote por WhatsApp» del plano sigue llevando al formulario de la portada, como se pidió en 0025.

### 3. Detalle técnico

`whatsappConRef` (`src/lib/tracking/client.ts`) arma el enlace con el código de intención. Lo usan los enlaces de
WhatsApp de siempre y el chat; antes estaba dentro de `trackedWhatsApp`.

### 4. Después: 30 minutos a Chiclayo en toda la web

A pedido del usuario («Cambia 35 por 30»), la web dice ahora 30 minutos a Chiclayo, como la pregunta de Lima:

- **El dato** (`PROYECTO.ubicacion.tramos`, `src/content/proyecto.ts`) pasa de 35 a 30. De ahí salen el antetítulo de la
  portada («A 30 min de Chiclayo»), el párrafo del proyecto, la cifra de «Por qué La Campiña», la lista de tiempos y el pie.
- **La descripción de la página** (`src/app/layout.tsx`, la que muestran Google y las redes) decía «35» escrito a mano:
  ahora lee el mismo dato, para que no vuelvan a diferir.
- **El rótulo de la vía en el plano** («Saltur 6 min · Cayaltí 8 min · Chiclayo 30 min») cambia en `src/content/plano.ts`
  y en su generador (`scripts/plano/write_ts.py`), así se mantiene si se regenera el plano.
- `PRODUCT.md` también dice 30.

Comprobado en `/`, `/promocion` y `/lote/G18` (texto visible, rótulos del plano y descripción): ningún «35 min» y 30 en
todos los lugares. `npm test`: 42 pasan, 1 falla (la de siempre).

## Archivos

| Archivo | Cambio |
|---|---|
| `src/content/landings.ts` | Pregunta `ZONA` primero en Lima; `chat` (fuente del chat) y `preguntaPixel` en cada landing; `landingPorSource` reconoce las dos fuentes de Lima |
| `src/components/AsesorFlotante.tsx` | Botón que abre el chat con cabecera, saludo y el formulario de la landing |
| `src/components/ContactForm.tsx` | `variante="chat"`: su fuente, su botón «Continuar en WhatsApp», abre WhatsApp al confirmarse el registro; mensaje con nombre, lote y respuestas |
| `src/components/Landing.tsx` | El chat recibe la landing |
| `src/app/api/lead/route.ts` | Acepta la fuente del chat de cada landing |
| `src/lib/tracking/schema.ts` | Fuentes `chat-form` y `promocion-chat` |
| `src/lib/tracking/client.ts` | `whatsappConRef`, separado de `trackedWhatsApp` |
| `src/app/globals.css` | Estilos del chat |
| `scripts/check-source.mjs` | La prueba de `/promocion` fija las dos preguntas y comprueba que cada chat escriba en la hoja de su landing con su ORIGEN |
| `DESIGN.md`, `docs/0026` | El botón flotante abre el chat |
| `src/content/proyecto.ts`, `src/app/layout.tsx`, `src/content/plano.ts`, `scripts/plano/write_ts.py`, `PRODUCT.md` | 30 minutos a Chiclayo |

## Cómo se verificó

Build de producción en Chrome (Playwright). En local no hay hoja: se simuló el 200 de `/api/lead` y se interceptó wa.me.

| Prueba | Resultado |
|---|---|
| Formulario de `/promocion` | Las dos preguntas en orden, sin opción marcada; «Elige una opción.» si falta una |
| Formulario de `/` | Sin cambios: una pregunta, marcada |
| Chat en `/promocion` (1440 y 390 px) | Se abre sobre el botón con las dos preguntas de Lima; aviso en las dos si no se elige; envía `source: promocion-chat` y `respuestas: { zona, modalidad }`; muestra «¡Listo! Abriendo WhatsApp…» y abre WhatsApp: otra pestaña en escritorio, la misma en el celular |
| Chat en `/` (1440 y 390 px) | Su pregunta marcada; envía `source: chat-form` y `busca`; abre WhatsApp |
| Mensaje de WhatsApp | «Hola, soy Prueba de Jhef. Acabo de dejar mis datos en la web de La Campiña. Me puedo adecuar. Financiado desde S/ 3,000. ¿Me envían el plano y los precios?» (en local sin «Ref:», porque no hay base de medición) |
| Escape | Cierra el chat, el foco vuelve al botón y al reabrir sigue el nombre escrito |
| «Consultar este lote» del plano | Sigue llevando al formulario de la portada con el lote |
| `npm test` | 42 pasan, 1 falla (la de Global Privacy Control, la misma de antes). La prueba de `/promocion` comprueba que el chat de Lima escribe en la hoja de Lima con «Landing · Chat del asesor (Lima)» y el de Lambayeque en la suya |
| `tsc --noEmit` | Sin errores |

## Para confirmar con el cliente

- ~~La pregunta dice «a 30 min de Chiclayo», pero la portada y «Por qué» decían 35 min.~~ Resuelto: el usuario pidió
  «Cambia 35 por 30» (ver abajo). Sigue sin confirmar en el Drive «5 min de Sipán» (0020).
- En DLC también el formulario principal abre WhatsApp al registrarse. En Rosso el principal sigue mostrando el botón
  «Escríbenos ahora por WhatsApp»; si se quiere igual que el chat, es un cambio de una línea.

## Pendientes

- Antes de desplegar: insertar la columna E «ZONA» en las dos pestañas de la hoja de Lima.
- Commit, push y despliegue cuando se pida.
