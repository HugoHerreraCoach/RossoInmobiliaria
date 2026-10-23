# Tarea: dejar listos los píxeles de Meta y TikTok de Rosso Inmobiliaria (La Campiña)

Eres el agente que maneja Chrome. Trabajas para Conexipema, la agencia de marketing de Rosso
Inmobiliaria. Tu tarea es confirmar o crear los píxeles de la landing de La Campiña y generar sus
tokens de envío desde el servidor.

- **No instalas código ni tocas la web.** El código de los píxeles ya está hecho. Solo le faltan
  los valores.
- **La web de producción la administra el dueño, no nosotros.** No entres a su Vercel, a su
  dominio ni a su CRM para cambiar algo. Los valores se le entregan a él.
- **Todo se hace en el portafolio comercial de Rosso Inmobiliaria y en ningún otro.** En Meta es el
  portfolio **ROSSO** (`908149363097272`). En TikTok, el Business Center o la cuenta publicitaria
  propios de Rosso. La sesión tiene acceso a portafolios de otros clientes y de la agencia
  (Conexigo, CONEXIPEMA SAC, DLC, MAU, Mundo Divina, NR Inversiones): **en esos no se crea ni se
  genera nada**.

## Lo que ya sabemos

| Qué | Valor |
| --- | --- |
| Landing en producción | https://rossoinmobiliaria.conexigo.com/ (administrada por el dueño) |
| Meta · portfolio comercial | **ROSSO** (`908149363097272`) |
| Meta · cuenta publicitaria | **ROSSO** (`act_404164447628504`) |
| Meta · píxel | **«Píxel de ROSSO»** (`948475092408783`). Es de 2021 y **nunca ha recibido eventos**. |
| TikTok · cuentas publicitarias visibles hoy | MAU, ads dlc inmobiliaria, ads nr inversiones. **Ninguna de Rosso.** |
| TikTok · Business Center de la agencia | CONEXIPEMA SAC (`7687346904935596048`). **No se usa para Rosso.** En DLC el píxel se creó ahí; con Rosso **no** se repite. |

## Lo que tienes que conseguir

| Variable | Qué es | De dónde sale | ¿Se puede mostrar? |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID del píxel de Meta (solo números) | Administrador de eventos | Sí |
| `META_GRAPH_VERSION` | `v26.0` (la que ya funciona en DLC) | No hay que buscarla | Sí |
| `META_CAPI_ACCESS_TOKEN` | Token de la API de conversiones | Administrador de eventos → píxel → Configuración | **No** |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | **Código** del píxel: unos 20 caracteres de letras y números, como `DAQ48QRC77U77GG14PMG`. **No** es el ID numérico largo. | Events Manager de TikTok | Sí |
| `TIKTOK_EVENTS_ACCESS_TOKEN` | Token de Events API del píxel | Events Manager → píxel → Configuración | **No** |

## Reglas

1. **Tokens.** Nunca escribas un token en el chat, en un documento, en un comentario ni en ningún
   campo de ninguna web. Cuando aparezca uno en pantalla, detente y pide al usuario que lo copie él
   y lo guarde para entregarlo al dueño. Espera a que confirme antes de cerrar el aviso. En tu
   informe pon solo «generado» y la fecha.
2. **Portafolio.** Antes de cada acción que cree o genere algo (píxel, token, vínculo):
   - mira el selector de portafolio o Business Center;
   - confirma que dice **ROSSO** (`908149363097272`) en Meta, o el Business Center o la cuenta de
     Rosso en TikTok;
   - escribe en el chat qué portafolio ves.

   Si dice otro, o no puedes confirmarlo, **no hagas clic**: cambia a Rosso o detente y pregunta.
   No modifiques nada de los portafolios de otros clientes ni de la agencia.
3. No crees ni edites campañas, conjuntos, anuncios, presupuestos, métodos de pago, cuentas
   publicitarias, Business Centers, portafolios ni usuarios de personas. **No crees píxeles en
   Meta** (ya existe el de Rosso). No borres ni archives píxeles.
4. No cambies nada en Vercel ni en https://rossoinmobiliaria.conexigo.com/. La web pública solo la
   abres para verificar, en el paso 6.
5. **Detente y pregunta** al usuario si:
   - no tienes acceso al portfolio ROSSO;
   - aparece más de un portafolio que podría ser de Rosso (por ejemplo «ROSSO» y «Rosso
     Inmobiliaria»);
   - no encuentras un Business Center o una cuenta de TikTok propios de Rosso;
   - el píxel no es `948475092408783` o aparece más de un píxel de Rosso;
   - la pantalla pide contraseña, código de verificación o aceptar términos nuevos;
   - un botón no está donde dice esta guía y no hay un equivalente claro;
   - algo podría generar un cobro.
6. Trabaja en una pestaña nueva y no dispares alertas ni diálogos del navegador.

## Paso 1 · Meta: confirmar el píxel

1. Abre https://business.facebook.com/events_manager2 y elige el portfolio **ROSSO** en el
   selector de arriba a la izquierda. Confirma que su ID es `908149363097272`: aparece en la URL
   como `business_id=908149363097272` o en la Configuración del negocio.
2. En «Orígenes de datos» busca **«Píxel de ROSSO»**. Confirma tres cosas:
   - su ID es `948475092408783`;
   - su propietario es el portfolio ROSSO;
   - está vinculado a la cuenta publicitaria ROSSO (`act_404164447628504`).

   Anota también su estado. Lo esperado es que figure sin actividad.
3. Si aparecen otros píxeles o conjuntos de datos de Rosso, haz una lista con nombre, ID y último
   evento, y **pregunta cuál usar** antes de seguir.
4. Entra a la pestaña **Configuración** del píxel y revisa:
   - **Permisos de tráfico:** si hay una lista de dominios permitidos activa y no incluye
     `rossoinmobiliaria.conexigo.com`, agrégalo. Si no hay ninguna lista, no actives una.
   - **Configuración automática de eventos** (o «seguimiento de eventos sin código»): no la
     actives. La web ya la apaga desde su código. Anota en qué estado está.
   - **Coincidencia avanzada automática:** no la cambies. Anota en qué estado está.

## Paso 2 · Meta: token de la API de conversiones

1. Antes de seguir, revisa otra vez que el selector diga **ROSSO** y que estés dentro de «Píxel de
   ROSSO» (`948475092408783`).
2. En ese píxel → **Configuración** → sección **«API de conversiones»** → **«Generar token de
   acceso»**. Puede estar dentro de «Configurar integración directa».
3. Meta crea o reutiliza el usuario del sistema «Conversions API System User» dentro del portfolio
   ROSSO. No crees ningún otro usuario.
4. Cuando aparezca el token, aplica la regla 1: **no lo transcribas**. Pide al usuario que lo copie
   ahora, porque Meta lo muestra una sola vez. Cuando confirme que lo guardó, cierra el aviso.
5. En esta tarea no hace falta el código de prueba (`META_TEST_EVENT_CODE`).

## Paso 3 · TikTok: encontrar el portafolio de Rosso

1. Abre https://business.tiktok.com/. En el selector de Business Center, busca uno **propio de
   Rosso** (por ejemplo «Rosso», «Rosso Inmobiliaria» o «ROSSO»). No entres al de CONEXIPEMA SAC
   ni al de otros clientes.
2. Si no hay Business Center de Rosso, revisa en https://ads.tiktok.com/ si existe una **cuenta
   publicitaria de Rosso**.
3. Según lo que encuentres:
   - **Hay un Business Center o una cuenta de Rosso:** muéstrale al usuario su nombre e ID y
     **espera su confirmación** antes de seguir.
   - **No hay ninguno, o no tienes acceso:** **detente**. No crees el píxel en otro lugar, ni un
     Business Center, ni una cuenta nueva. Informa al usuario: Rosso tendrá que crearlo o darnos
     acceso. Salta al paso 6.
4. Dentro del portafolio de Rosso, revisa **Activos → Eventos** (píxeles web). Si ya hay un píxel
   de Rosso, pregunta si se usa ese.

## Paso 4 · TikTok: crear o confirmar el píxel

Si hay que crearlo, hazlo **dentro del Business Center o la cuenta de Rosso confirmados en el
paso 3**. Revisa el selector antes de empezar.

1. **Activos → Eventos → Eventos web** → «Configurar eventos web» («Set up web events»).
2. Nombre: **`Pixel_ROSSO-CONEXIPEMA_LaCampina`**.
3. Método de conexión: **TikTok Pixel** con configuración **manual** del código. No elijas socios
   (Shopify, Google Tag Manager, etc.) ni la configuración automática de eventos. No instales nada
   en ninguna web.
4. Al terminar, copia el **código del píxel**. Aparece en el fragmento como `ttq.load('XXXX')` y en
   los detalles del píxel. Comprueba que tiene unos 20 caracteres de letras y números y que no es
   el ID numérico largo.
5. Si lo creaste en el Business Center de Rosso, compártelo solo con la **cuenta publicitaria de
   Rosso**: en el BC → **Activos → Eventos** → el píxel → asignar a esa cuenta con permiso para
   publicar anuncios. Si no tiene cuenta, déjalo sin vincular y anótalo. No lo compartas con
   cuentas de otros clientes ni de la agencia.
6. En la **configuración** del píxel:
   - Si hay **detección automática de eventos** (envío de formularios, clics en botones),
     desactívala. La web envía sus propios eventos.
   - **Coincidencia avanzada:** no la cambies. Anota en qué estado está.

Si el píxel ya existía, haz solo los puntos 4 y 6.

## Paso 5 · TikTok: token de Events API

1. Events Manager → el píxel → **Configuración** → **Events API** → «Generar token de acceso»
   («Generate Access Token»).
2. Igual que con Meta: pide al usuario que lo copie y lo guarde. No lo transcribas.

## Paso 6 · Verificación (solo mirar)

1. Abre https://rossoinmobiliaria.conexigo.com/ en una pestaña nueva.
   - **Si el dueño todavía no cargó los valores**, lo normal es que **no** haya peticiones a
     `facebook.com/tr` ni a `analytics.tiktok.com`. Anótalo así; no es un fallo.
   - **Si ya los cargó y volvió a desplegar:**
     - En las peticiones de red debe salir `facebook.com/tr?id=948475092408783&ev=PageView` y una
       petición a `analytics.tiktok.com` con el código del píxel.
     - En la consola, `typeof window.fbq` y `typeof window.ttq` no deben dar `"undefined"`.
     - Confirma también el `PageView` en **Meta → Probar eventos** y en **TikTok → Probar
       eventos**, abriendo la URL desde ahí.
2. **No envíes el formulario ni abras WhatsApp para probar un `Lead`.** La web manda el `Lead`
   desde su servidor solo cuando el CRM confirma un mensaje real.

## Informe final

Entrega esto al usuario, **sin tokens**:

| Variable | Valor o estado |
| --- | --- |
| `NEXT_PUBLIC_META_PIXEL_ID` | `948475092408783` (o el que se confirmó) |
| `META_GRAPH_VERSION` | `v26.0` |
| `META_CAPI_ACCESS_TOKEN` | Generado el «fecha». Lo guardó el usuario. |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | «código» y nombre del píxel, o «no creado» y el motivo |
| `TIKTOK_EVENTS_ACCESS_TOKEN` | Generado el «fecha». Lo guardó el usuario. |

Además, incluye:

- **en qué portafolio quedó cada cosa**, con su nombre e ID: el portfolio de Meta del píxel y del
  token, y el Business Center o la cuenta de TikTok del píxel y de su vínculo. Todo debe ser de
  Rosso;

- cada ajuste que cambiaste, con su estado antes y después;
- el estado de la coincidencia avanzada y de los eventos automáticos en las dos plataformas;
- el resultado de la verificación;
- cada punto en el que te detuviste y por qué.
