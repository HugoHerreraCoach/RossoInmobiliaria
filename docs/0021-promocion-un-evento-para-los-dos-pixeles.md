# 0021 · /promocion envía un solo evento, el mismo en Meta y en TikTok

**Fecha:** 2026-10-24 · **Rama:** `jheferson` (sin commit al cerrar este documento)

> **Actualización (0030, 2026-10-26):** TikTok no deja usar `SubmitApplication` («Envío de solicitud») para
> optimizar. Lima pasó a enviar **`Contact`** en los dos píxeles. Lo de abajo describe la versión anterior.

## Qué se pidió

> «el evento que se va a registrar en la landing /promocion debe ser el mismo para ambos pixel pero debe ser
> distintos al de las otras landing»

## Cómo estaba

La landing de Lima (`/promocion`, 0017) enviaba al confirmarse el registro:

- `SubmitApplication` a Meta;
- `SubmitForm` a TikTok.

Lambayeque (`/`) envía `CompleteRegistration` a los dos (0013). Los nombres vivían en
`LANDINGS.*.eventos = { meta, tiktok }`, así que nada impedía que los dos píxeles recibieran nombres distintos.

`SubmitForm` también contradecía una regla anterior. En `docs/0008` (línea 45) se decidió no usarlo porque TikTok
lo cuenta como `Lead`, y `Lead` lo envía solo el servidor cuando ConexiGO confirma el mensaje de WhatsApp.

## Qué se hizo

- **Evento elegido: `SubmitApplication`, en los dos píxeles.**
  - Es estándar en Meta y en TikTok. En TikTok sirve para el objetivo de clientes potenciales (Lead), según su
    [artículo de eventos estándar](https://ads.tiktok.com/help/article/standard-events-parameters). Las dos
    campañas pueden optimizar por él.
  - Meta ya lo recibía, así que en Meta no cambia nada.
  - Es distinto del `CompleteRegistration` de `/`.
  - No es `Lead` ni `SubmitForm`.
- **`src/content/landings.ts`:** `eventos: { meta, tiktok }` pasa a `evento: string`, un solo nombre por landing.
  Así los dos píxeles no pueden recibir nombres distintos.
  - Lambayeque: `evento: REGISTRATION_EVENT` (`CompleteRegistration`).
  - Lima: `evento: "SubmitApplication"`.
- **`src/lib/tracking/client.ts` (`registrationEvent`):**
  - envía `evento` a Meta y a TikTok, con el mismo id de evento de siempre (el id del envío, que también queda en la
    hoja);
  - a Meta lo sigue enviando con `track`, porque `SubmitApplication` ya estaba en `META_STANDARD`.
- **`scripts/check-source.mjs`:** la prueba del cliente del navegador exige ahora:
  - Lambayeque con `CompleteRegistration`;
  - Lima con `SubmitApplication`: una llamada `track` a Meta y una a TikTok con ese mismo nombre y el mismo id de
    evento;
  - ninguna llamada con `SubmitForm`, `Lead` ni `FormSubmitted`.
- **Documentos:** `docs/0017` y su entrada en `docs/README.md` mencionan el cambio donde nombraban `SubmitForm`.

No cambian la hoja, las preguntas, el formulario, el `Lead` del servidor ni la landing de Lambayeque.

Archivos de la otra sesión: `landings.ts` y `client.ts` son de 0017. Se le avisó antes de editarlos y confirmó que
no los estaba tocando.

## Archivos tocados

| Archivo | Cambio |
| --- | --- |
| `src/content/landings.ts` | `evento` único por landing; Lima `SubmitApplication` |
| `src/lib/tracking/client.ts` | `registrationEvent` envía `evento` a los dos píxeles |
| `scripts/check-source.mjs` | Prueba del cliente con un solo evento en Lima |
| `docs/0017-landing-promocion-lima.md`, `docs/README.md` | Referencias al evento de Lima |

## Cómo se verificó

- `npx tsc --noEmit`: sin errores, con el árbol completo.
- `TYPESCRIPT_PATH=<typescript 5.9.3> npm test`: **41 pasan, 1 falla**. Falla «Global Privacy Control», que ya
  fallaba antes. La prueba del cliente pasa con las condiciones nuevas.
- No se probó en el navegador ni en «Probar eventos»: un registro real en `/promocion` necesita la hoja de Lima
  (`GOOGLE_SHEETS_ID_PROMOCION`), que aún no está configurada.

## Pendientes

- [ ] **Dueño:** publicar, junto con 0017. `/promocion` todavía no está en producción, así que nunca envió
      `SubmitForm` a una campaña real.
- [x] ~~**Campañas de Lima:** elegir `SubmitApplication` como evento de optimización en Meta y en TikTok. En TikTok,
      si el píxel no lo muestra aún, aparece después del primer registro real.~~ Reemplazado por `Contact` (0030).
- [ ] Después del despliegue, comprobar en «Probar eventos» de Meta y TikTok un registro de prueba en
      `/promocion`: un `Contact` en cada uno (0030), con el mismo id de evento.
