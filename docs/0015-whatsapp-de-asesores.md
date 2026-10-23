# 0015 · WhatsApp de asesores: 941 377 136

- **Fecha:** 2026-10-23
- **Rama:** `jheferson`. `main` intacto.
- **Pedido del usuario:** "El número que se va a usar para recibir mensajes es el siguiente: 941377136,
  agrégalo y haz el push a Jheferson".

## Qué se hizo

- `src/content/proyecto.ts`: nueva constante `WHATSAPP_ROSSO = "51941377136"` (Perú, +51, formato
  internacional sin "+", como lo pide `wa.me`). `PROYECTO.contacto.whatsapp` la usa por defecto. Una
  variable `NEXT_PUBLIC_WHATSAPP_NUMBER` con valor la reemplaza al compilar; vacía o ausente, queda este
  número. Antes el número salía solo de esa variable, que estaba vacía, y por eso el botón flotante llevaba
  al formulario.
- `PRODUCT.md`: el WhatsApp sale de la lista de pendientes; siguen pendientes el teléfono para llamadas, el
  CRM de destino del formulario y el mecanismo para agendar visitas.

## Qué cambia en la página

Con el criterio de `0014` (todo botón de contacto va al formulario; WhatsApp solo en el botón flotante):

- El botón flotante "Asesor en línea · ¡Hablemos!" abre `https://wa.me/51941377136` con el mensaje
  "Hola, quiero información de los lotes de La Campiña." en una pestaña nueva.
- La medición lo trata como intención de WhatsApp (`data-track="float-contact"`): pide a
  `/api/tracking/intent` un código `R-` y lo agrega al final del mensaje (`Ref: R-…`), que ConexiGO lee
  del mensaje entrante (`docs/CONEXIGO-INTEGRACION.md`). Si la medición falla, el enlace abre igual sin
  código.
- Ningún otro botón cambia: la ficha, los canales de contacto, la barra y las pestañas siguen llevando a
  `#formulario`. El número no se muestra escrito en la página.

## Archivos

| Archivo | Cambio |
|---|---|
| `src/content/proyecto.ts` | `WHATSAPP_ROSSO` y su uso como valor por defecto |
| `PRODUCT.md` | Pendientes actualizados |

## Cómo se verificó

| Prueba | Resultado |
|---|---|
| `tsc --noEmit` | sin errores |
| `npm test` (TypeScript 5.9) | 39 pasan, 1 falla: "Global Privacy Control forces marketing off", la misma de `main` |
| `next build` | completo, 150 páginas |
| Enlaces a WhatsApp en `/` (Chrome real) | 1: el botón flotante, `https://wa.me/51941377136?text=Hola%2C%20quiero%20informaci%C3%B3n…` |
| Enlaces a WhatsApp en `/lote/G18` | 0 |
| Clic en el botón flotante | abre una pestaña nueva con `wa.me/51941377136` y el mensaje (se interceptó `wa.me` para no salir a internet). En local no se agrega `Ref: R-…` porque `/api/tracking/intent` responde 503 sin `DATABASE_URL` |
| Otros enlaces de contacto | 9, todos a `#formulario` |

## Pendientes

- **ConexiGO:** el 941 377 136 debe estar conectado en ConexiGO para que los mensajes entrantes con `Ref: R-…`
  confirmen la intención y creen el Lead (`docs/CONEXIGO-INTEGRACION.md`). Lo configura el dueño.
- **Producción:** si en Vercel existe `NEXT_PUBLIC_WHATSAPP_NUMBER` con otro número, ese valor gana; conviene
  borrarla o ponerle `51941377136`. Hace falta un nuevo despliegue para que el número aparezca (no se despliega
  desde este entorno).
- **Dominio del formulario (aviso de la otra sesión):** en producción `NEXT_PUBLIC_SITE_URL` apunta a
  `rosso-inmobiliaria-eight.vercel.app`; en `rossoinmobiliaria.conexigo.com` el formulario responde 403
  hasta que el dueño la cambie a ese dominio.
- El teléfono para llamadas sigue pendiente (`NEXT_PUBLIC_CONTACT_PHONE`).
