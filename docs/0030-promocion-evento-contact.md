# 0030 · /promocion envía `Contact`: TikTok no deja optimizar con «Envío de solicitud»

**Fecha:** 2026-10-26 · **Rama:** `jheferson`. El cambio se hizo sobre `main` (`520e468`), se guardó aparte mientras se sincronizaba la
rama (0031) y se aplicó encima del panel de lotes (0032) cuando el usuario lo confirmó.

## Qué pasó

> «el evento en TikTok de "envío de solicitud" me sale que no admite eventos de optimización y no me deja usarlo»

La captura del Administrador de anuncios mostraba «Envío de solicitud» **Activo**, con el aviso «El objetivo que has
seleccionado no admite eventos de optimización de Envío de solicitud».

## Por qué

- **El evento llega pero no se puede optimizar.** Es `SubmitApplication`, el que envía `/promocion` desde 0021. La
  API de TikTok, en solo lectura, lo confirma:
  - en el píxel `DBDTQQRC77U4SEFNIUQ0` («Landing-Rosso», cuenta «ads nr inversiones inmobiliarias sac»),
    `SUBMIT_APPLICATION` aparece con `optimization_event: null`;
  - en cambio, `ON_WEB_REGISTER` («Registro completado») y `ON_WEB_DETAIL` («Ver contenido») sí tienen evento de
    optimización.
- **No está en la lista oficial.** La lista de eventos de sitio web que TikTok acepta para optimizar un grupo de
  anuncios (`adgroup_create`) es: `ON_WEB_DETAIL`, `ON_WEB_SEARCH`, `ON_WEB_ADD_TO_WISHLIST`, `ON_WEB_CART`,
  `INITIATE_ORDER`, `ADD_BILLING`, `SHOPPING`, `CONSULT`, `DOWNLOAD_START`, `FORM`, `ON_WEB_REGISTER`,
  `ON_WEB_SUBSCRIBE`, `LANDING_PAGE_VIEW` y `ENGAGED_SESSION`. `SubmitApplication` no está.
- **La fuente de 0021 no alcanzaba.** En 0021 se eligió porque el artículo de ayuda de TikTok lo lista como evento
  estándar. Recibirlo no es lo mismo que poder optimizar con él.

## Qué se eligió: `Contact` («Contactar»)

Cumple las tres condiciones del pedido de 0021 y además se puede optimizar:

| Condición | `Contact` |
| --- | --- |
| El mismo nombre en los dos píxeles | Sí |
| Distinto del evento de `/` (`CompleteRegistration`) | Sí |
| Optimizable en TikTok | Sí: `CONSULT` está en la lista |
| Estándar en Meta | Sí: va con `track`, ya estaba en `META_STANDARD` |
| No es `Lead` | Sí. `Lead` lo envía solo el servidor cuando ConexiGO confirma el mensaje |
| No se cruza con otro evento de la web | Sí: el clic a WhatsApp es el evento personalizado `WhatsAppClick` |

**Descartados:**

- **`SubmitForm`** («Enviar formulario»): TikTok lo cuenta como `Lead` y lo mezclaría con los `Lead` confirmados por
  WhatsApp (0008). Además, en Meta no es estándar.
- **`Subscribe`** («Suscribirse»): se puede optimizar en las dos plataformas, pero Meta lo entiende como una
  suscripción pagada y no describe lo que hace la persona.

## Cambios

- **`src/content/landings.ts`:** Lima pasa de `evento: "SubmitApplication"` a `evento: "Contact"`, con el motivo en
  el comentario. El chat del asesor de Lima (`promocion-chat`, 0029) usa el mismo evento.
- **`src/lib/tracking/client.ts`:** solo el comentario de `registrationEvent`.
- **`scripts/check-source.mjs`:** la prueba del cliente exige `Contact` en Lima. Sigue exigiendo una llamada `track`
  a Meta y una a TikTok con el mismo id, y ningún `SubmitForm`, `Lead` ni `FormSubmitted`.
- **Documentos:** notas en 0021 y 0027, y una entrada en `docs/README.md`.

## Cómo se verificó

- `npx tsc --noEmit`: sin errores.
- `TYPESCRIPT_PATH=<typescript 5.9.3> npm test`: **40 pasan, 3 fallan**. La prueba del cliente pasa con `Contact`.
  Las 3 que fallan **ya fallaban en `main` (`520e468`) antes de este cambio**:
  - «Global Privacy Control», como siempre;
  - la del plano y la de las imágenes referenciales: las rompió la fusión del rediseño `ISABEL-ROSSO` (ver abajo).
- **Aplicado sobre 0031 y 0032** (2026-10-26): `tsc` sin errores; **45 pasan, 1 falla** («Global Privacy Control», la de
  siempre). Pasa la prueba del cliente con `Contact`.
- No se probó en «Probar eventos»: el cambio necesita despliegue.

## Lo que hay que hacer

1. **Dueño:** fusionar y desplegar. Hasta entonces, producción sigue enviando `SubmitApplication`.
2. **Probar:** hacer un registro de prueba en `/promocion`. Hasta que llega el primero, TikTok muestra «Contactar»
   como «Esperando actividad».
3. **TikTok:** en el grupo de anuncios de Lima, elegir **«Contactar»** como evento de optimización.
4. **Meta:** en las campañas de Lima, cambiar el evento de conversión a **«Contacto»** (`Contact`).

## Hallazgo aparte: lo que trajo a producción la fusión con `ISABEL-ROSSO`

> **Actualización (0031):** el usuario eligió quedarse con el rediseño y conservar de nuestro trabajo solo el plano.
> El plano oficial volvió en 0031; las imágenes editadas de «Así avanza La Campiña» se quedan.

Al poner la rama al día apareció esto. **No se cambió en este paso.**

- **El plano dejó de ser el oficial:**
  - `LotStack.tsx` volvió a un esquema de rectángulos dibujados a mano (`x: 110 + i * 64…`) y ya no usa
    `plano.ts` ni `planoGirado.ts` (0019, 0025);
  - la ficha del lote (`LoteDetalle.tsx`) sigue diciendo «El plano reproduce el plano de lotización del proyecto»;
  - falla la prueba «Lot map follows the official subdivision plan».
- **«Así avanza La Campiña» muestra imágenes editadas como si fueran fotos fechadas:**
  - `media.json` apunta todas las tomas de obra (`hero`, `portico`, `trazado-jun`, `cerco-jun`, `general-jul`,
    etc.) a `editada-*.jpg`, de la carpeta «ROSSO EDITADAS», y quitó los videos;
  - la sección sigue diciendo «Vuelos de drone y fotos fechadas del propio terreno», con fechas como «11 abr 2026»;
  - la prueba de imágenes referenciales falla porque las nuevas no están en `imagenes.json`.
- **Ya está en producción:** la portada pública sirve los `editada-*.jpg`, según un `GET` del 2026-10-26.
- **Decisión:** los dos puntos los decide el usuario o Rosso. Hay que volver al plano oficial y a las fotos y videos
  reales en la sección fechada, o cambiar esos textos.
