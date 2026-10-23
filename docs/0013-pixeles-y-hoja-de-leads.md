# 0013 · Píxeles de Rosso y hoja de leads: `CompleteRegistration` solo con la fila guardada

**Fecha:** 2026-10-23 · **Rama:** `rediseno-inmersivo` (sin commit, junto con el rediseño de 0011/0012)

## Qué se pidió

> «quiero que tú en esta sesión agregues los pixel de tiktok y de meta tal cual lo hace el proyecto
> de DLC cuando se registra una lead en la hoja de google sheets es que se registra el evento»

Datos que pasó el usuario:

- **Meta:** conjunto de datos `948475092408783`, propietario **ROSSO** (`908149363097272`). Es el
  «Píxel de ROSSO» de 0010.
- **TikTok:** código del píxel `DBDTQQRC77U4SEFNIUQ0` (el fragmento `ttq.load(...)`).
- **TikTok Events API:** el usuario pegó el token en el chat. **No se guardó en ningún archivo**
  (ni en el código, ni en `.env.local`, ni en este documento). Va al Vercel del dueño.

Rosso no tenía hoja de leads: el formulario solo enviaba al CRM (`LEAD_WEBHOOK_URL`, sin
configurar) y en el Drive no aparece ninguna hoja de Rosso. Se le preguntó al usuario y eligió
**«Integrar hoja como DLC»**.

## Cómo lo hace DLC (y ahora Rosso)

DLC (`DLCconexigo/docs/0015`, `0021`): el formulario envía los datos al servidor, este agrega
**una fila** a la hoja de Google Sheets y responde ok **solo si Google confirma la fila**. Recién
entonces el navegador envía `CompleteRegistration` a Meta y a TikTok, en el mismo momento, con el
id del envío como id del evento. Ese id también queda en la columna «TikTok Lead ID» de la hoja,
así que cada evento se puede cruzar con su fila.

Rosso queda igual:

1. El visitante envía el formulario de la portada.
2. `POST /api/lead` valida y, si `LEAD_WEBHOOK_URL` está configurado, envía primero al CRM (con
   `Idempotency-Key`).
3. Luego agrega la fila a la hoja. Si Google no confirma exactamente una fila, responde **502** y no
   hay conversión. El reintento usa el mismo id: el CRM no duplica (aplica la clave) y la hoja recibe
   la fila una sola vez.
4. Con el ok, el navegador envía **`CompleteRegistration`** a los dos píxeles:

   ```ts
   window.fbq("track", "CompleteRegistration", { content_name: "La Campiña", content_category: "Lotes campestres", origen, rastro, lote, inicial }, { eventID: id });
   window.ttq.track("CompleteRegistration", { content_name: "La Campiña", content_category: "Lotes campestres", description: rastro }, { event_id: id });
   ```

   No llevan nombre ni celular.

Sin hoja ni CRM, `/api/lead` sigue respondiendo 503 «sin destino» y no se dispara nada.

### Qué envía cada píxel desde el navegador

| Evento | Cuándo | Antes |
| --- | --- | --- |
| `PageView` | Al cargar | Igual |
| `ViewContent` | Ficha de un lote | Igual |
| `WhatsAppClick` (personalizado) | Clic a WhatsApp, cuando haya número | Igual |
| **`CompleteRegistration`** | Registro guardado (fila en la hoja) | `FormSubmitted` (personalizado), y solo si había intención en la base |

`FormSubmitted` deja de enviarse. El `Lead` sigue siendo solo del servidor, para los mensajes que
confirma el CRM (sin cambios).

### Los IDs viven en el código, como en DLC

`src/lib/tracking/pixels.ts` trae los dos IDs por defecto. Así producción carga los píxeles **sin que
el dueño tenga que crear variables**. `NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_TIKTOK_PIXEL_ID` los
siguen reemplazando. Una variable vacía apaga ese píxel. El servidor (CAPI y Events API) usa los
mismos IDs, así que para el envío desde el servidor basta con cargar los tokens.

En `.env.local` se agregaron las dos variables vacías, para que el tráfico de `localhost` no llegue a
los píxeles reales. `.env.example` también las deja vacías y lo explica.

### Fila que se escribe

Las columnas A–L son las mismas de la hoja de DLC (formato de los formularios instantáneos de
TikTok). La M es nueva, para el lote:

| Col. | Encabezado | Valor |
| --- | --- | --- |
| A | NOMBRE DE CAMPAÑA | `utm_campaign` (o `campaign_id`) del último contacto de marketing de la visita |
| B | FECHA | Segundos Unix |
| C | NOMBRE | Nombre escrito |
| D | NUMERO | `+51 9XX XXX XXX` (otros países: `+<dígitos>`) |
| E | INICIAL | La opción elegida: «Inicial desde S/ 3 mil» o «Pago al contado S/ 17 mil» |
| F | TIEMPO DE COMPRA | Vacío |
| G | TikTok Lead ID | Id del envío = id del evento en los dos píxeles |
| H | TikTok Lead Status | Vacío |
| I | Lead creation time | Segundos Unix (igual que B) |
| J | Lead update time | Vacío |
| K | ORIGEN | «Landing · Formulario de portada» o «Landing · Formulario de contacto» |
| L | FUENTE | `meta`, `tiktok`, `google`, `otro` o `directo` |
| M | LOTE | Código del lote elegido, o vacío |

Pestaña: `GOOGLE_SHEETS_HOJA` si está definida. Si no, igual que DLC: «LEADS META» para tráfico de
Meta y «LEADS TIKTOK» para el resto. Se escribe con `valueInputOption=RAW`: nada de lo que escribe el
visitante se interpreta como fórmula.

## Archivos tocados

| Archivo | Cambio |
| --- | --- |
| `src/lib/tracking/pixels.ts` (nuevo) | IDs de Rosso por defecto, `metaPixelId()` / `tiktokPixelId()` y `REGISTRATION_EVENT = "CompleteRegistration"` |
| `src/server/sheets.ts` (nuevo) | Conexión con Google Sheets traída de DLC (`hoja-calculo.ts`): JWT RS256 sin librerías, `appendRow` que exige una fila confirmada, `leadRow` con las columnas A–M, `sheetSource` y `sheetPhone` |
| `src/app/api/lead/route.ts` | Destinos: CRM y/o hoja. El CRM va primero y la hoja al final. La respuesta incluye `id` (el del envío). Se mantienen el 422 sin consentimiento y el contrato de `busca` |
| `src/lib/tracking/client.ts` | `registrationEvent()`; `form_submit` pasa a `CompleteRegistration`; `loadPixels()` usa los IDs por defecto |
| `src/server/delivery.ts` | CAPI / Events API y el estado del panel usan los mismos IDs; «formulario configurado» incluye la hoja |
| `src/components/ContactForm.tsx` | Con la respuesta ok llama a `registrationEvent(id, { source, lot, inicial })`. Es la única línea tocada; el archivo es del rediseño de la otra sesión |
| `scripts/check-source.mjs` | Tres pruebas nuevas (fila de la hoja, CRM + hoja con reintento, IDs por defecto) y la prueba del cliente ahora espera `CompleteRegistration` |
| `.env.example` (no se sube: `.gitignore` tiene `.env*`) | Variables `GOOGLE_SHEETS_*` y nota de los IDs por defecto. Las variables para el dueño están en «Entrega al dueño» |
| `.env.local` (no se sube) | Píxeles vacíos en local |

## Cómo se verificó

- `TYPESCRIPT_PATH=<typescript 5.9.3> npm test`: **39 pasan, 1 falla**. La que falla es «Global
  Privacy Control forces marketing off», que ya fallaba antes (ver la memoria del rediseño). Las tres
  pruebas nuevas comprueban, sin red real:
  - una sola fila, en el orden de columnas de DLC, con `RAW`, en «LEADS META» para tráfico de
    Facebook, y el id del envío en la respuesta y en la columna G;
  - un reintento del mismo envío no agrega otra fila;
  - con CRM y hoja: primero el CRM, después la hoja. Si la fila no se confirma, la respuesta es 502
    sin id. El reintento reenvía la misma `Idempotency-Key` y termina en 200;
  - los IDs por defecto y que una variable vacía apaga el píxel;
  - en el navegador: un solo `CompleteRegistration` por píxel, con el mismo id de evento, sin nombre,
    y nunca `Lead` ni `FormSubmitted`.
- `npx tsc --noEmit`: sin errores.
- `next build` con el árbol completo (rediseño de 0014 + este cambio), corrido por la otra sesión:
  **OK, 150 páginas**. `/`, `/lote/G18`, `/privacidad` y `/panel` responden 200. El formulario con
  `registrationEvent` funciona en Chrome sin errores de consola, salvo los 503 locales de
  `/api/tracking` (no hay `DATABASE_URL` en local).
- **No se envió un evento real** a los píxeles: no hay hoja ni cuenta de servicio, y habría dejado
  conversiones de prueba en Meta y TikTok.

## Entrega al dueño

Producción (`rossoinmobiliaria.conexigo.com`) la administra el dueño. Para activarlo:

1. **Publicar** esta rama cuando revise el rediseño. Solo con eso, los píxeles cargan con los IDs de
   Rosso y envían `PageView`, `ViewContent` y `WhatsAppClick`.
2. **Hoja de leads de Rosso:**
   - crear la hoja con las pestañas «LEADS META» y «LEADS TIKTOK» (o una sola y fijar
     `GOOGLE_SHEETS_HOJA`), con los encabezados A–M de arriba en la fila 1;
   - compartirla como **Editor** con el correo de una cuenta de servicio de Google Cloud que tenga
     activa la API de Google Sheets (puede ser la misma de DLC);
   - en Vercel, entorno Production: `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL` y
     `GOOGLE_SHEETS_PRIVATE_KEY` (marcar *Sensitive*). Volver a desplegar.

   Desde ahí, cada registro es una fila y un `CompleteRegistration` en los dos píxeles.
3. **Tokens del servidor** (*Sensitive*): `TIKTOK_EVENTS_ACCESS_TOKEN` (el que pasó el usuario). Siguen
   pendientes `META_CAPI_ACCESS_TOKEN` y `META_GRAPH_VERSION=v26.0`. Se usan para el `Lead` del
   servidor, que además necesita la cadena del CRM (0010).
4. **Comprobar** en «Probar eventos» de Meta y TikTok: primero el `PageView`; después un registro real
   debe mostrar `CompleteRegistration`, con el mismo id de evento que la columna G de su fila.

## Pendientes

- [ ] Publicación y variables de la hoja (dueño), pasos 1–2.
- [ ] `TIKTOK_EVENTS_ACCESS_TOKEN` en el Vercel del dueño. El token pasó por el chat: si se quiere
      cumplir la regla de 0010 (los tokens nunca pasan por el chat), regenerarlo en TikTok y dárselo
      directo al dueño.
- [ ] Token de CAPI de Meta (paso 2 de la guía de 0010).
- [ ] Confirmar en TikTok a qué Business Center o cuenta pertenece `DBDTQQRC77U4SEFNIUQ0`. Lo creó el
      usuario y desde aquí no se verificó; según 0010, debe ser de Rosso.
- [ ] Cuando haya campañas, optimizar con **`CompleteRegistration`** de estos mismos píxeles.
- [ ] Opcional: enviar también `CompleteRegistration` desde el servidor (CAPI / Events API) con el mismo
      id, para no perder los registros de navegadores que bloquean píxeles. DLC no lo hace.
