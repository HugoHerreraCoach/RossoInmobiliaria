# 0010 · Guía para que el agente del navegador prepare los píxeles

**Fecha:** 2026-10-21

> **Actualización 2026-10-23 ([0013](0013-pixeles-y-hoja-de-leads.md)):** los IDs de los dos píxeles ya
> están en el código (Meta `948475092408783`, TikTok `DBDTQQRC77U4SEFNIUQ0`), así que el dueño ya no
> necesita `NEXT_PUBLIC_*_PIXEL_ID`. El token de TikTok ya existe. Siguen pendientes el token de CAPI de
> Meta y la entrega de tokens al dueño.

## Qué se pidió

> «Para este proyecto faltan conectar los pixel verdad??»
>
> «Revisa el proyecto de DLCconexigo y dame una guía para darle al agente de Claude que maneja y
> gestiona el navegador para que pueda generar esos IDs y token para integrarlos a la configuración»
>
> «el link ya no es el que dices de producción, ahora producción es el siguiente:
> https://rossoinmobiliaria.conexigo.com/ que no lo administramos nosotros lo administra el dueño»

## Qué se hizo

- Se revisó el estado de los píxeles en el código, en el sitio de producción y en las cuentas de
  Meta y TikTok. Todo fue de solo lectura.
- Se revisó cómo se conectaron en DLC (`DLCconexigo/docs/0002`, `0003`, `0009`, `0020`) para
  copiar lo que funcionó y evitar lo que falló.
- Se escribió el prompt para el agente de Claude en Chrome:
  **[`guias/agente-navegador-pixeles.md`](guias/agente-navegador-pixeles.md)**. Se pega completo.
- Se actualizó la rama `main` local con el commit de Hugo `952c7ed` (avance directo). Por eso este
  documento es el 0010.

No se cambió código, no se cargaron variables y no se desplegó nada.

## Hallazgos

### El código está listo; faltan los valores

- `src/lib/tracking/client.ts` carga el píxel de Meta y el de TikTok en cuanto existen
  `NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_TIKTOK_PIXEL_ID`.
- Los píxeles cargan aunque falle `/api/tracking/consent`, porque `loadPixels()` se llama antes de
  sincronizar con el servidor.
- El código apaga los eventos automáticos de Meta (`fbq("set","autoConfig",false,…)`).
- `src/server/delivery.ts` envía el `Lead` desde el servidor (Meta CAPI y TikTok Events API) solo
  si existen `META_CAPI_ACCESS_TOKEN` + `META_GRAPH_VERSION` y `TIKTOK_EVENTS_ACCESS_TOKEN`.

### Producción no tiene los IDs

- `https://rossoinmobiliaria.conexigo.com/` (Vercel, `gru1`) lo administra el dueño.
- En sus scripts compilados quedó `process.env.NEXT_PUBLIC_META_PIXEL_ID` sin reemplazar, y lo
  mismo con TikTok. O sea, se compiló sin esas variables y hoy no carga ningún píxel.

### Meta: el píxel existe y nunca se usó

| Qué | Valor |
| --- | --- |
| Portfolio | ROSSO (`908149363097272`) |
| Cuenta publicitaria | ROSSO (`act_404164447628504`), activa y con método de pago |
| Píxel | «Píxel de ROSSO» (`948475092408783`), creado el 2021-09-18, activo, **nunca disparó** (ni navegador ni servidor) |

### TikTok: no hay nada de Rosso visible

- El conector solo ve tres cuentas publicitarias: MAU, ads dlc inmobiliaria y ads nr inversiones.
- La de DLC tiene un único píxel, el de DLC. La de NR no tiene ninguno.
- No se sabe si Rosso tiene Business Center o cuenta de TikTok Ads. La guía solo permite crear el
  píxel en un portafolio propio de Rosso. Si no hay ninguno, el agente se detiene.

### Vercel

- El proyecto `jhef-dev/rosso-inmobiliaria` (`rosso-inmobiliaria.vercel.app`) **no es producción**
  y no tiene ninguna variable de entorno.
- Su último despliegue, el del commit de Hugo `952c7ed`, quedó *Blocked*: «the commit author
  doesn't have permission to create deployments for this project».
- No se toca. Producción es el Vercel del dueño.

### Lo que se aprendió de DLC

- En DLC, el píxel de TikTok se creó en el BC de la agencia, **CONEXIPEMA SAC**
  (`7687346904935596048`), y hubo que compartirlo con la cuenta publicitaria del cliente. **Con
  Rosso no se repite.** Por decisión del usuario, todo debe quedar en el portafolio de Rosso, para
  no crearlo en otro por error. De DLC solo se conserva la forma del nombre:
  `Pixel_ROSSO-CONEXIPEMA_LaCampina`. Lo que sí sigue valiendo: el píxel tiene que estar compartido
  con la cuenta publicitaria que hará las campañas, o no aparece en su Events Manager.
- El token del Events Manager de TikTok sirve para **enviar** eventos, que es lo que usa Rosso. No
  sirve para leer estadísticas.
- En DLC se usó primero un píxel equivocado. Las campañas deben optimizar con el **mismo** píxel que
  está en la web (0009 de DLC).
- La CSP de DLC bloqueaba el envío por formulario del píxel de Meta (0020 de DLC). Rosso no tiene
  CSP (`next.config.ts` solo define `nosniff`, `X-Frame-Options` y `Referrer-Policy`), así que no le
  afecta.
- Graph API `v26.0` funciona en DLC. Se usa para `META_GRAPH_VERSION`.

## Cómo usar la guía

1. Requisitos en el Chrome del usuario:
   - sesión con permisos de administrador en el portfolio ROSSO de Meta;
   - acceso al Business Center o a la cuenta publicitaria de TikTok **de Rosso**;
   - la extensión Claude in Chrome con permiso para `business.facebook.com`,
     `business.tiktok.com`, `ads.tiktok.com` y `rossoinmobiliaria.conexigo.com`.
2. Pegar al agente todo el contenido de
   [`guias/agente-navegador-pixeles.md`](guias/agente-navegador-pixeles.md).
3. El agente se detiene a propósito en estos casos:
   - para confirmar contigo el portafolio de Rosso en TikTok;
   - si no encuentra un portafolio de Rosso en TikTok, y entonces no crea nada;
   - cada vez que aparece un token, para que el usuario lo copie. Los tokens nunca pasan por el
     chat.

   Antes de crear o generar algo, escribe en el chat qué portafolio ve. Si no es el de Rosso, no
   hace clic.
4. Con su informe, armar la entrega al dueño (abajo).

## Entrega al dueño (después de la guía)

Variables para su proyecto de Vercel, entorno **Production**. Marcar los tokens como *Sensitive*.

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_META_PIXEL_ID` | `948475092408783` |
| `META_GRAPH_VERSION` | `v26.0` |
| `META_CAPI_ACCESS_TOKEN` | El que guardó el usuario |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | El código que reporte el agente |
| `TIKTOK_EVENTS_ACCESS_TOKEN` | El que guardó el usuario |
| `NEXT_PUBLIC_SITE_URL` | `https://rossoinmobiliaria.conexigo.com` (lo usa CAPI como URL del evento) |

Después hay que **volver a desplegar**. Las `NEXT_PUBLIC_*` se incorporan al compilar.

Qué se activa con eso:

| Desde | Eventos | Condición |
| --- | --- | --- |
| Navegador | `PageView`, `ViewContent` (lote), `WhatsAppClick` y `FormSubmitted` (personalizados) | Basta con los IDs y el redespliegue |
| Servidor | `Lead` | Además hace falta la cadena del CRM: `DATABASE_URL` (0009), `CONEXIGO_EMPRESA_ID`, `CONEXIGO_WEBHOOK_SECRET`, el callback de ConexiGO (`CONEXIGO-INTEGRACION.md`) y la tarea programada `/api/tracking/drain` con `CRON_SECRET`. Mientras no exista, los tokens quedan cargados pero sin uso. |

## Cómo se verificó

Todo fue de solo lectura:

- Búsqueda en el código de `fbq`, `ttq`, `NEXT_PUBLIC_*_PIXEL_ID`, `CAPI` y de la CSP.
- `.env.local` revisado solo por nombres. No tiene variables de Meta ni de TikTok.
- `vercel env ls` en `jhef-dev/rosso-inmobiliaria`: ninguna variable. `vercel ls` e `inspect`:
  despliegue bloqueado y alias.
- `curl` a `https://rossoinmobiliaria.conexigo.com/` y a sus scripts `/_next/static/*.js`: no
  tienen los IDs incorporados.
- Conector de Meta Ads: cuentas publicitarias y conjuntos de datos de ROSSO.
- Conector de TikTok: cuentas autorizadas y píxeles de las cuentas de DLC y NR.

La guía todavía no se ha probado con el agente del navegador.

## Pendientes

- [ ] Ejecutar la guía con el agente del navegador y guardar su informe.
- [ ] Confirmar si Rosso tiene Business Center o cuenta de TikTok Ads y si nos da acceso. Sin eso
      no se crea el píxel de TikTok; nunca se crea en el BC de la agencia.
- [ ] Entregar las variables al dueño y pedirle que vuelva a desplegar.
- [ ] Después del despliegue, comprobar el `PageView` en «Probar eventos» de Meta y de TikTok
      (paso 6 de la guía).
- [ ] Para el `Lead` del servidor: completar la cadena del CRM y el formulario
      (`LEAD_WEBHOOK_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`), que según 0009 siguen sin configurar.
      Rosso aún no lanza campañas.
- [ ] Cuando haya campañas, optimizar con el mismo píxel que está en la web.
- [ ] Opcional: verificar el dominio en Meta. Depende del DNS de `conexigo.com`, que es del dueño.
