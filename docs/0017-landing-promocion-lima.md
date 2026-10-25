# 0017 · Landing duplicada en /promocion (Lima): sus preguntas, sus eventos de píxel y su hoja

- **Fecha:** 2026-10-24
- **Rama:** `jheferson` (sin commit al cerrar este documento). Sigue a `0016`, que tampoco tiene commit todavía.
- **Pedido del usuario:**
  1. "Vamos a duplicar la landing, prácticamente va a ser la misma landing, lo único que va a cambiar son las
     preguntas del formulario. El motivo es hacer testeos. La página que ya creamos va a permanecer sin cambios y es
     para Lambayeque, y la otra landing va a ser para otro público de Lima con otras preguntas […] en otra URL,
     /promocion/, y los eventos que va a registrar el píxel van a ser distintos tanto para Meta y TikTok; al Google
     Sheets que van a ir esos leads van a cambiar también, va a ser en otro archivo […]. En un rato te paso las
     nuevas preguntas."
  2. A mitad del trabajo, para **las dos landings**: la pregunta pasa de "¿Con cuánto de inicial te gustaría
     empezar?" a **"¿Con cuánto cuentas de inicial?"**, con las opciones **"S/. 3,000 a S/. 10,000"** y
     **"Pago al contado S/. 17 mil"**, "por ahora en ambas landing".

## Qué se hizo

### Una landing, dos variantes (`src/content/landings.ts`)

La página dejó de vivir en `src/app/page.tsx` y pasó a `src/components/Landing.tsx`, con una propiedad `landing`:

| | Lambayeque | Lima |
|---|---|---|
| Dirección | `/` | `/promocion` (`/promocion/` redirige ahí) |
| Contenido | el de siempre | el mismo |
| Fuente del formulario | `hero-form` | `promocion-form` ("Formulario de promoción (Lima)") |
| Preguntas | `src/content/landings.ts` → `LANDINGS.lambayeque.preguntas` | `LANDINGS.lima.preguntas` |
| Respuestas en `/api/lead` | `busca` (el contrato de siempre) | `respuestas: { <id de pregunta>: <opción> }` |
| Hoja de Google Sheets | `GOOGLE_SHEETS_ID` | **`GOOGLE_SHEETS_ID_PROMOCION`** (otro archivo) |
| Evento del píxel al registrarse | `CompleteRegistration` (Meta y TikTok) | **`SubmitApplication` (Meta y TikTok)**; hasta 0021, TikTok recibía `SubmitForm` |
| Buscadores | indexada | `noindex, nofollow` (página de campaña, duplicado de la portada) |
| Medición de la página (`path`) | `/` | `/promocion` (antes toda dirección desconocida se guardaba como `/`) |

Todo lo que distingue a las landings está en `src/content/landings.ts`: el formulario (navegador), `/api/lead`, la
hoja (servidor) y los píxeles leen de ahí. **Para poner las preguntas de Lima basta editar `LANDINGS.lima.preguntas`**:
el formulario las dibuja, la API solo acepta esas opciones y la hoja crea una columna por pregunta.

### La pregunta nueva (las dos landings)

"¿Con cuánto cuentas de inicial?", con "S/ 3,000 a S/ 10,000" (marcada, como en el diseño) y "Pago al contado
S/ 17 mil". El 3,000 (inicial mínima) y el 17 mil (contado más bajo) salen de la lista de precios; el tope de
10,000 lo fijó el cliente. Se escribió "S/" sin punto, el símbolo vigente que usa todo el sitio (el pedido decía
"S/."). Valores que se guardan: `"Inicial de S/ 3,000 a S/ 10,000"` y `"Pago al contado S/ 17 mil"`.

En escritorio, si las dos opciones no caben lado a lado sin cortar su texto, van una debajo de otra.

### Formulario (`src/components/ContactForm.tsx`)

Dibuja las preguntas de su landing (`landing="lambayeque" | "lima"`). En Lambayeque envía exactamente lo mismo que
antes (`busca`); en Lima, `respuestas`. Muestra el error de cada pregunta si la API lo devuelve.

### `/api/lead` (`src/app/api/lead/route.ts`)

- `source: "promocion-form"` identifica la landing de Lima. Sus `respuestas` se validan contra sus preguntas: una
  opción que no existe o una pregunta sin responder devuelve 422 con el error en ese campo.
- La fila va **solo** a la hoja de promoción. Si `GOOGLE_SHEETS_ID_PROMOCION` no está configurada (y no hay CRM),
  responde 503 "sin destino": **nunca cae en la hoja de Lambayeque**.
- Al CRM (si `LEAD_WEBHOOK_URL` está configurada) se le suman `landing: "lima"` y `respuestas`.
- Lambayeque: sin cambios en lo que envía, valida ni escribe.

### Hoja de promoción (`src/server/sheets.ts`)

- Otro archivo de Google Sheets, con la **misma cuenta de servicio**: basta compartir el archivo nuevo con el
  correo de `GOOGLE_SHEETS_CLIENT_EMAIL` como Editor.
- Pestaña: `GOOGLE_SHEETS_HOJA_PROMOCION` si se define; si no, como en Lambayeque, «LEADS META» para tráfico de
  Meta y «LEADS TIKTOK» para el resto.
- Columnas (`landingColumns`): las de DLC hasta «NUMERO», **una columna por pregunta** y luego las de DLC desde
  «TikTok Lead ID». Con la pregunta actual, la fila 1 del archivo nuevo debe ser:

  `NOMBRE DE CAMPAÑA | FECHA | NOMBRE | NUMERO | INICIAL | TikTok Lead ID | TikTok Lead Status | Lead creation time | Lead update time | ORIGEN | FUENTE | LOTE`

  (12 columnas; no lleva «TIEMPO DE COMPRA»). Cuando cambien las preguntas de Lima, sus columnas cambian con ellas.

### Píxeles (`src/lib/tracking/client.ts`)

Al confirmar la fila, el navegador envía a Meta y a TikTok el evento de la landing, con el mismo id de evento (el
id del envío, que también queda en la hoja). Lambayeque sigue con `CompleteRegistration`; Lima envía
`SubmitApplication` a los dos píxeles, evento estándar en Meta y en TikTok (hasta 0021, TikTok recibía `SubmitForm`). Se eligió estándar para
que cada campaña pueda optimizar por su propio evento; **nunca `Lead`**, que sigue siendo solo del servidor cuando
ConexiGO confirma el mensaje de WhatsApp. El nombre se cambia en `LANDINGS.lima.evento`.

### La ficha del lote no mezcla los públicos

"Ver detalle" desde `/promocion` abre `/lote/X?origen=promocion`; en esa página, "Volver al plano", "Todos los
lotes de la manzana" y el formulario de respaldo vuelven a `/promocion` (también al tocar otros lotes). Desde `/`,
todo sigue igual.

## Archivos

| Archivo | Cambio |
|---|---|
| `src/content/landings.ts` | Nuevo: las dos landings (preguntas, fuente, eventos), validación de respuestas |
| `src/components/Landing.tsx` | La landing completa (antes `src/app/page.tsx`), con la propiedad `landing` |
| `src/app/page.tsx` | `<Landing landing="lambayeque" />` |
| `src/app/promocion/page.tsx` | Nuevo: `<Landing landing="lima" />`, `noindex` |
| `src/components/ContactForm.tsx` | Preguntas desde la configuración; `respuestas` en Lima |
| `src/app/api/lead/route.ts` | Landing por fuente, validación de `respuestas`, hoja propia, fila con columnas por pregunta |
| `src/server/sheets.ts` | `sheetConfig(fuente, landing)`, `GOOGLE_SHEETS_ID_PROMOCION`, `landingColumns`, `landingRow` |
| `src/lib/tracking/client.ts` | Evento de registro según la landing (`track` o `trackCustom` según sea estándar en Meta) |
| `src/lib/tracking/schema.ts` | Fuente `promocion-form`; `safePath` acepta `/promocion` |
| `src/components/LazyLotStack.tsx`, `LotStack.tsx`, `Ficha.tsx`, `LoteDetalle.tsx` | `origen=promocion` en la ficha completa del lote |
| `src/app/globals.css` | Opciones que no cortan su texto; campo de WhatsApp en el móvil |
| `scripts/check-source.mjs` | Prueba nueva de la landing de promoción; la prueba de píxeles también revisa los eventos de Lima; la revisión estática de movimiento mira `Landing.tsx` y que las dos páginas lo usen |

## Cómo se verificó

| Prueba | Resultado |
|---|---|
| `tsc --noEmit` | sin errores |
| `npm test` (TypeScript 5.9) | 40 pasan, 1 falla: "Global Privacy Control forces marketing off", la misma de `main` |
| Prueba nueva (sin red, Google simulado) | `/promocion` sin hoja propia → 503 y ninguna fila; opción inventada o sin respuesta → 422; envío válido → una fila solo en `sheet-promocion-test`, pestaña «LEADS TIKTOK», 12 columnas con la respuesta en «INICIAL» y ORIGEN "Landing · Formulario de promoción (Lima)"; con `GOOGLE_SHEETS_HOJA_PROMOCION` usa esa pestaña; Lambayeque sigue escribiendo en su hoja con sus 13 columnas; `safePath('/promocion')` = `/promocion` |
| Prueba de píxeles | Lambayeque: un `CompleteRegistration` por píxel; Lima: un `SubmitApplication` (Meta) y un `SubmitForm` (TikTok) con el mismo id de evento; nunca `Lead`. Desde 0021: un `SubmitApplication` por píxel |
| `next build` | 151 páginas (`/promocion` estática) |
| Rutas | `/`, `/promocion`, `/lote/G18`, `/privacidad`, `/panel` responden 200; `/promocion/` redirige a `/promocion` |
| Chrome, `/` | formulario `hero-form`, pregunta nueva, envía `busca`; ficha → `/lote/G18`, vuelta a `/` |
| Chrome, `/promocion` | `noindex, nofollow`; formulario `promocion-form`, envía `respuestas` y la medición registra `/promocion`; ficha → `/lote/G18?origen=promocion`, vuelta a `/promocion` (también tras tocar F11) |
| Errores de consola | ninguno (salvo los 503 conocidos de `/api/tracking/*` en local) |

## Pendientes

- ~~**Preguntas de Lima:** las entrega el cliente. Hoy `/promocion` usa la misma pregunta que Lambayeque.~~ Llegaron el
  2026-10-24: una pregunta de modalidad de preventa, columna MODALIDAD (docs/0026).
- **Para el dueño (producción, no se hace desde aquí):**
  1. Crear el archivo de Google Sheets de Lima con la fila 1 de arriba (o la que resulte de las preguntas nuevas)
     y compartirlo con el correo de la cuenta de servicio (`GOOGLE_SHEETS_CLIENT_EMAIL`) como Editor.
  2. En Vercel: `GOOGLE_SHEETS_ID_PROMOCION` = id del archivo nuevo (lo que va entre `/d/` y `/edit`) y, si se
     quiere una sola pestaña, `GOOGLE_SHEETS_HOJA_PROMOCION`.
  3. En Meta y TikTok, usar `SubmitApplication` como evento de optimización de las campañas de Lima (0021)
     (y `CompleteRegistration` en las de Lambayeque).
  4. Si `LEAD_WEBHOOK_URL` (CRM) está configurada, confirmar que acepta los campos nuevos `landing` y `respuestas`.
  5. Desplegar.
- **Confirmar con el cliente:** el nombre del evento de Lima (`SubmitApplication`; el cliente pidió uno solo para los dos píxeles, 0021), y "S/" frente a "S/." en las opciones.
- **Lead del servidor:** el `Lead` que se envía cuando ConexiGO confirma un mensaje de WhatsApp sigue siendo el mismo
  para las dos landings (se distingue por la página de origen en la medición). Si también debe ser distinto, es un
  cambio aparte en `src/server/delivery.ts`.
