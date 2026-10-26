# 0027 · Lo que necesita el servidor de producción para que funcione todo lo de la rama

**Fecha:** 2026-10-24 · **Alcance:** solo revisión. No se desplegó ni se tocó Vercel ni sus variables.
**Producción:** el Vercel del dueño, `https://rossoinmobiliaria.conexigo.com`.

## Qué se pidió

> (Vía la otra sesión) El usuario va a desplegar ya y pidió «en el otro agente lances la tarea de qué otra cosa
> necesito agregar al servidor para que funcione».

## Resumen para el dueño, en orden

1. **Que el código esté en lo que se compila.** Todo el trabajo de 0016–0026 está **sin commit** en la carpeta de
   trabajo. Producción hoy es la versión vieja: `/promocion` da 404. Hay que subirlo a `jheferson` o compilar desde
   esta carpeta; si no, el despliegue no lo lleva.
2. **Actualizar Next a 16.4.3** antes de publicar. La 16.4.0 tiene un aviso de seguridad crítico (§10).
3. **Hoja de Lima:**
   - crear el archivo con sus dos pestañas y los encabezados de §3, con ZONA en E y MODALIDAD en F (si ya existe
     con MODALIDAD en E, insertar ZONA en E en las dos pestañas);
   - compartirlo con la cuenta de servicio;
   - cargar `GOOGLE_SHEETS_ID_PROMOCION`.
   Sin eso, el formulario de `/promocion` responde 503 y no guarda nada.
4. **Pestañas «LEADS META» y «LEADS TIKTOK»** en la hoja de Lambayeque (§3). La visita directa, de Google o de otro
   origen cae en «LEADS TIKTOK». Si falta esa pestaña, el formulario da error 502.
5. **Cargar explícitamente en Vercel los `NEXT_PUBLIC_*`.** Como mínimo:
   - `NEXT_PUBLIC_META_PIXEL_ID` = `948475092408783`;
   - `NEXT_PUBLIC_TIKTOK_PIXEL_ID` = `DBDTQQRC77U4SEFNIUQ0`;
   - `NEXT_PUBLIC_SITE_URL`.

   Si no, al compilar con `--prebuilt` se toman los del `.env.local` de la máquina que compila (§9).
6. **Tokens del servidor:** `META_CAPI_ACCESS_TOKEN`, `META_GRAPH_VERSION`, `TIKTOK_EVENTS_ACCESS_TOKEN` y
   `CONEXIGO_EMPRESA_ID`. Hay que cargarlos **antes** del tráfico de campañas: un evento que se procesa sin token
   queda desactivado para siempre (§4).
7. **Tarea programada** para `/api/tracking/drain`, que reintenta los envíos y borra lo de más de 90 días (§7). Hoy
   no hay `vercel.json`, así que no corre.
8. **Después del despliegue:** las comprobaciones de §11.

## 2. Variables de entorno

- **Compilación:** los `NEXT_PUBLIC_*` se fijan al compilar, **también en el código del servidor**. Si cambian, hay
  que recompilar y volver a desplegar.
- **Ejecución:** se leen en cada solicitud. Cambiarlas en Vercel solo pide volver a desplegar.

| Variable | Necesidad | Cuándo se fija | Si falta o está mal | Estado conocido |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Obligatoria**, `https://rossoinmobiliaria.conexigo.com` exacto | Compilación | El formulario, la medición y la confirmación de consentimiento responden 503 si no es HTTPS, o 403 si el origen no coincide (`requireOrigin`) | Bien en el build actual (§8) |
| `APP_SECRET` | **Obligatoria**, ≥ 32 caracteres; **no rotar** (protege sesiones y la deduplicación) | Ejecución | 503 en el formulario, la medición y el panel | Cargada |
| `DATABASE_URL` | **Obligatoria**: rol `landing_rosso` de la base de ConexiGO (0009) | Ejecución | **El formulario también da 503**: usa la base para el límite de envíos y el control de duplicados. Además fallan la medición (`/api/tracking/*`) y el panel | Cargada: la prueba real de 0013 guardó la fila |
| `GOOGLE_SHEETS_ID` | Obligatoria si no hay CRM | Ejecución | Sin hoja ni CRM, `/` responde 503 (`sin-destino`) | Cargada (hoja `1M7gart…`) |
| `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY` | Obligatorias con hoja; las mismas para las dos hojas | Ejecución | La hoja queda sin configurar | Cargadas, las de DLC |
| `GOOGLE_SHEETS_ID_PROMOCION` | **Obligatoria para `/promocion`** | Ejecución | El formulario de Lima responde 503; **nunca** escribe en la hoja de Lambayeque | **Falta** |
| `GOOGLE_SHEETS_HOJA`, `GOOGLE_SHEETS_HOJA_PROMOCION` | Opcionales: una sola pestaña fija | Ejecución | Sin ellas, «LEADS META» para Meta y «LEADS TIKTOK» para todo lo demás | — |
| `PANEL_PASSWORD_HASH` | Obligatoria para `/panel`; se genera con `npm run panel:password` | Ejecución | El panel responde 503 | Cargada |
| `CRON_SECRET` | Obligatoria para la tarea programada, ≥ 32 caracteres | Ejecución | `/api/tracking/drain` responde 401 | Cargada; falta la tarea (§7) |
| `CONEXIGO_WEBHOOK_SECRET` | Obligatoria para el `Lead` confirmado, ≥ 32 caracteres | Ejecución | `/api/conexigo/conversiones` responde 503 | Cargada |
| `CONEXIGO_EMPRESA_ID` | Obligatoria para el `Lead` confirmado: UUID de Rosso en ConexiGO | Ejecución | `/api/conexigo/conversiones` responde 503 | **Falta** |
| `CONEXIGO_WEBHOOK_SECRET_ANTERIOR` | Opcional, solo mientras se rota el secreto | Ejecución | — | — |
| `META_CAPI_ACCESS_TOKEN` + `META_GRAPH_VERSION` (formato `vNN.0`, p. ej. `v26.0`) | Necesarias para enviar el `Lead` a Meta desde el servidor | Ejecución | El envío queda «disabled: missing-provider-config» **para siempre** | **Faltan** |
| `TIKTOK_EVENTS_ACCESS_TOKEN` | Necesaria para enviar el `Lead` a TikTok desde el servidor | Ejecución | Igual que la de Meta | **Falta** (0013: el token pasó por el chat; conviene uno nuevo) |
| `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | Recomendadas **con valor explícito** | Compilación | Sin definir se usan los de Rosso; **vacías desactivan los píxeles** | Revisar (§9) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Opcional | Compilación | Se usa 941 377 136 | — |
| `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_MAPS_URL` | Opcionales | Compilación | Sin teléfono ni enlace de mapa | — |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_TOKEN` | Opcionales (CRM) | Ejecución | Sin CRM se usa solo la hoja. **Con CRM, si el CRM falla, el formulario da error 502 y no escribe la hoja** | — |
| `CONVERSION_SENDER` | Opcional; `landing` por defecto | Ejecución | — | Dejar `landing` |
| `META_TEST_EVENT_CODE`, `TIKTOK_TEST_EVENT_CODE` | Solo para pruebas | Ejecución | Con valor, los eventos van a «Probar eventos» y no a las campañas | **Vacías** en producción |
| `TRACKING_SITE_ID` | Opcional; `rosso-la-campina` por defecto | Ejecución | — | — |
| `TRACKING_STORAGE`, `TRACKING_LOCAL_DIR` | Solo para pruebas locales | — | En producción se usa siempre la base | No cargar |

`.env.example` todavía nombra `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` y dice `TRACKING_STORAGE=supabase`.
Está desactualizado desde 0009: el código usa `DATABASE_URL` y no lee las de Supabase.

## 3. Hojas de Google

Las dos usan la misma cuenta de servicio (`GOOGLE_SHEETS_CLIENT_EMAIL`), que debe tener **permiso de Editor** en cada
archivo. Cada archivo necesita **las dos pestañas**, salvo que se fije una con `GOOGLE_SHEETS_HOJA[_PROMOCION]`:

- **«LEADS META»:** visitas de Facebook o Instagram.
- **«LEADS TIKTOK»:** **todo lo demás**: TikTok, Google, directo y otros.

La fila 1 lleva los encabezados. La web agrega las filas debajo, como valores sin formato (`RAW`). FECHA y «Lead
creation time» van en segundos Unix, como en DLC.

**Lambayeque** (`/`, `GOOGLE_SHEETS_ID`), 13 columnas, A–M:

```
NOMBRE DE CAMPAÑA | FECHA | NOMBRE | NUMERO | INICIAL | TIEMPO DE COMPRA | TikTok Lead ID | TikTok Lead Status | Lead creation time | Lead update time | ORIGEN | FUENTE | LOTE
```

**Lima** (`/promocion`, `GOOGLE_SHEETS_ID_PROMOCION`), 13 columnas, A–M. Salen de `landingColumns()` con las dos
preguntas de Lima de `src/content/landings.ts`: ZONA y MODALIDAD. Las agregó la otra sesión (0026 y 0029):

```
NOMBRE DE CAMPAÑA | FECHA | NOMBRE | NUMERO | ZONA | MODALIDAD | TikTok Lead ID | TikTok Lead Status | Lead creation time | Lead update time | ORIGEN | FUENTE | LOTE
```

- **ZONA** guarda «Sí, me interesa el Valle Zaña.» o «Me puedo adecuar».
- **MODALIDAD** guarda «Al contado S/ 17,000» o «Financiado desde S/ 3,000».
- **ORIGEN** dice «Landing · Formulario de promoción (Lima)» o, desde el chat del botón flotante, «Landing · Chat del
  asesor (Lima)». En Lambayeque, el chat escribe «Landing · Chat del asesor».

**Actualización (0029):** si la hoja de Lima ya se creó con MODALIDAD en la columna E, antes de desplegar hay que
**insertar la columna ZONA en E en las dos pestañas**. Si no, las respuestas quedan corridas una columna. Si cambian
las preguntas de Lima, cambian estas columnas: hay que revisarlas antes de cada despliegue.

## 4. Píxeles y conversiones del servidor

- **Navegador:** al confirmarse la fila, envía un evento a los dos píxeles, con el id del envío como id del evento.
  - Lambayeque envía `CompleteRegistration` (0013).
  - Lima envía `Contact` (0030; antes `SubmitApplication`, que TikTok no deja usar para optimizar).
  - Esto no necesita tokens, solo los IDs de los píxeles.
- **Servidor:** el `Lead` se envía solo cuando ConexiGO confirma el primer mensaje de WhatsApp
  (`/api/conexigo/conversiones`). Va a Meta (CAPI) y a TikTok (Events API) desde una cola en la base.
  - La cola se procesa en el momento, con `after()`, y la tarea programada reintenta.
  - Si al procesarla falta el token de una plataforma, el envío queda «disabled» y **no se reintenta**.
  - Los eventos de más de 7 días se descartan.
  - Por eso, los tokens van **antes** del tráfico.
- Los códigos de prueba (`*_TEST_EVENT_CODE`) deben quedar vacíos en producción.

## 5. Base de datos de medición

- `DATABASE_URL` apunta al rol `landing_rosso` de la base de ConexiGO (0009), con pooler de transacción.
- El esquema es `db/schema.sql`. No cambió hasta 0031. **Desde 0032 (panel de lotes) hay que volver a ejecutarlo** como el rol `landing_rosso`: agrega el `kind` `lot` y las acciones `lots` y `lot_set`, y no borra nada. Sin eso, guardar un estado en `/panel` da 503 y las landings siguen con la lista.
- En local, sin `DATABASE_URL`, `/api/tracking/*` y el formulario responden 503. Es esperado.

## 6. ConexiGO y CRM

- **`Lead` confirmado:**
  - ConexiGO tiene que llamar a `POST https://rossoinmobiliaria.conexigo.com/api/conexigo/conversiones`;
  - lleva la firma `x-conexigo-firma: sha256=<HMAC>` con `CONEXIGO_WEBHOOK_SECRET` y `empresa_id` =
    `CONEXIGO_EMPRESA_ID`;
  - el contrato completo está en `docs/CONEXIGO-INTEGRACION.md`;
  - el número 941 377 136 tiene que estar conectado en ConexiGO (0015).
- **CRM (`LEAD_WEBHOOK_URL`):** es opcional. Si se usa, debe aceptar los campos `landing` y `respuestas` (0017) y
  responder 2xx. Un fallo del CRM bloquea la fila de la hoja.

## 7. Panel y tarea programada

- **Panel:** `/panel` necesita `PANEL_PASSWORD_HASH`, `APP_SECRET` y `DATABASE_URL`.
- **Tarea programada:** `GET /api/tracking/drain` con `Authorization: Bearer <CRON_SECRET>`.
  - Hace dos cosas: reintenta hasta 20 envíos y ejecuta `prune`, que borra lo de más de 90 días.
  - El repositorio **no tiene `vercel.json`**, así que hoy no hay tarea.
  - Con Vercel Cron basta con agregar el archivo y tener `CRON_SECRET` en las variables: Vercel envía ese
    encabezado solo.
  - En el plan Hobby solo se permite una vez al día; en Pro, por ejemplo, cada 15 minutos.

  ```json
  { "crons": [{ "path": "/api/tracking/drain", "schedule": "0 9 * * *" }] }
  ```

  Con `--prebuilt`, `vercel.json` tiene que existir **antes** de `vercel build`. No se agregó en este paso: la
  revisión es de solo lectura.

## 8. Dominio y `NEXT_PUBLIC_SITE_URL`

Se comprobó contra producción sin escribir nada. Un `POST /api/lead` con cuerpo vacío no llega a guardar: el origen
y la validación se revisan antes.

| Origen del envío | Respuesta |
| --- | --- |
| `https://rossoinmobiliaria.conexigo.com` | **422** (validación): el dominio grabado es el correcto |
| `https://www.rossoinmobiliaria.conexigo.com` | **403** «Origen no permitido» |

- El 403 aparece cuando la página se abre desde **otro origen**: `www.`, una URL `*.vercel.app` de vista previa o
  `http`.
- **Vista previa:** el formulario de una vista previa siempre dará 403, salvo que se compile con su propio
  `NEXT_PUBLIC_SITE_URL`.
- **`www`:** si está conectado al proyecto, conviene que Vercel lo redirija al dominio sin `www`.
- **Compilación:** como `NEXT_PUBLIC_SITE_URL` se fija al compilar, con `--prebuilt` vale el valor de la máquina
  que compila. El `.env.example` trae `http://localhost:3000`: un build que lo herede responde 503 en todo envío.

## 9. Despliegue con `--prebuilt` y `.vercelignore`

- **El cambio de `.vercelignore`:** el commit 1be4da0 sacó `.env.local` del archivo para evitar un ENOENT en
  `vercel deploy --prebuilt`.
- **Consecuencias de compilar en una máquina local:**
  - **Valores de compilación:** el `.env.local` de esa máquina participa del build. Next solo lo usa para las
    variables que **no** llegan desde Vercel con `vercel pull`.
  - **Riesgo con este checkout:** su `.env.local` deja **vacíos** los dos IDs de píxel, para que el tráfico local no
    llegue a los píxeles reales. Si producción se compila desde aquí y Vercel no tiene esas dos variables, **la web
    sale sin píxeles**. Lo mismo pasaría con `NEXT_PUBLIC_SITE_URL`.
  - **Remedio:** cargar en Vercel los `NEXT_PUBLIC_*` con su valor, o compilar desde una copia sin `.env.local`.
  - **Secretos:** según ese commit, el despliegue necesita leer `.env.local`, así que el archivo de la máquina que
    compila viaja con él. No debería tener secretos que no sean de producción. Hoy este checkout también guarda un
    `VERCEL_OIDC_TOKEN`, de corta duración.
- **Orden sugerido:** `vercel pull --yes --environment=production` → `vercel build --prod` →
  `vercel deploy --prebuilt --prod`.
- **Alternativa:** desplegar desde Git, con el build en Vercel, evita los dos problemas.

## 10. Aviso de seguridad de Next 16.4.0 (`SecurityFatalError`)

- **Vulnerabilidad:** `npm audit` marca `next` 16.0.0–16.4.0 como **crítico**. Son 3 avisos:
  - [GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw): ejecución remota en la optimización de
    imágenes con SVG;
  - [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r): denegación de servicio con Server
    Actions;
  - [GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr): ejecución remota en `use cache`.
- **Corrección:** la versión corregida, y la última (`latest`), es **16.4.3**.
- **Exposición de esta web:** no usa SVG en `next/image` ni `dangerouslyAllowSVG`, ni `use cache`, ni Server
  Actions, así que la exposición real es baja. Igual conviene actualizar antes de publicar: es un cambio de versión
  menor. Hay que reinstalar, correr las pruebas y compilar; esa decisión sigue abierta.
- **Qué es el `SecurityFatalError`** (`node_modules/next/dist/lib/upgrade/nudge.js`):
  - Con la política por defecto `experimental.agentUpgrade: 'security'`, Next detiene **una vez** `next build` o
    `next dev` **cuando lo ejecuta un agente de IA**, y pide correr `next upgrade`.
  - Al repetir el mismo comando, sigue.
  - A una persona en la terminal le muestra un menú.
  - En CI, como el build de Vercel en sus servidores, no se detiene.
  - No es un fallo del proyecto. Con Next 16.4.3 desaparece.

## 11. Comprobaciones después de desplegar

1. `/`, `/promocion`, `/lote/G18`, `/privacidad` y `/panel` responden 200. `/promocion` lleva `noindex`.
2. **Píxeles:** en el código de la página aparecen `948475092408783` y `DBDTQQRC77U4SEFNIUQ0`. En «Probar
   eventos», el `PageView`.
3. **Registro de prueba en `/`**, con datos ficticios marcados:
   - una fila en «LEADS META» o «LEADS TIKTOK» de la hoja de Lambayeque;
   - `CompleteRegistration` en los dos píxeles, con el mismo id que la columna «TikTok Lead ID».
4. **Registro de prueba en `/promocion`:**
   - una fila **solo** en la hoja de Lima, con ZONA y MODALIDAD en sus columnas;
   - lo mismo desde el chat del botón flotante, que además abre WhatsApp con el código `R-`;
   - `Contact` en los dos píxeles (0030).
5. Un `POST /api/lead` vacío desde el dominio da 422, no 403 ni 503.
6. Con la tarea configurada, el registro de Vercel muestra `/api/tracking/drain` con 200.
7. Borrar las filas de prueba de las hojas.

## 12. Pendientes heredados que no son del servidor

- **0010 y 0013:**
  - confirmar a qué Business Center de TikTok pertenece `DBDTQQRC77U4SEFNIUQ0`;
  - verificar el dominio en Meta, que depende del DNS de `conexigo.com`;
  - optimizar las campañas con `CompleteRegistration` (Lambayeque) y `Contact` (Lima, 0030).
- **0019:** lista de disponibilidad al día; la de la web es del 21/08/2026.
- **0020:** decidir con Rosso:
  - el texto sobre la escritura sin inscripción registral («Papeles claros»);
  - reescribir `/privacidad`, que describe un aviso de cookies que ya no existe, muestra notas internas y no
    nombra al responsable;
  - el tiempo a Chiclayo (30 o 35 min);
  - las visitas los fines de semana;
  - los nombres de las áreas comunes.
- **0024:** confirmar que Rosso acepta las fotos retocadas con IA rotuladas «Imagen referencial».

## Cómo se revisó

- **Código:** cada `process.env` de `src/` y `next.config.ts`: 31 variables, con la ruta que las usa y su respuesta
  si faltan. Se leyeron `store.ts`, `security.ts`, `sheets.ts`, `delivery.ts`, `/api/lead`, `/api/tracking/drain` y
  `/api/conexigo/conversiones`.
- **Archivos de configuración:** `.env.example`, `.vercelignore`, `next.config.ts` y la ausencia de `vercel.json`.
  De `.env.local` solo se leyeron los nombres y los valores públicos (IDs de píxel y modo de almacenamiento), nunca
  los secretos.
- **Producción, solo lectura:**
  - `GET` de la portada: el dominio en la vista previa para redes sociales, y `/promocion` responde 404;
  - dos `POST /api/lead` con cuerpo vacío, rechazados antes de escribir (422 y 403).
- **npm, solo lectura:** `npm view next` y `npm audit --omit=dev`.
- **Next:** `node_modules/next/dist/lib/upgrade/nudge.js`, para el comportamiento del aviso.
- **Docs:** los pendientes abiertos de 0008–0024.
