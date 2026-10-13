# ConexiGO → Rosso: confirmación de mensajes y atribución

**Destinatario:** agente/programador que mantiene ConexiGO. Esta tarea sí requiere un cambio/configuración en el CRM; el ZIP modifica únicamente la landing de Rosso.

## Resultado esperado

Visitas, formularios y clics se miden como intención. El contador **Lead** aumenta una sola vez cuando ConexiGO ha recibido y almacenado el primer mensaje entrante del contacto para esta empresa. No emitirlo al preparar un enlace, al despachar una plantilla, al crear un contacto manualmente, por un estado de entrega/lectura, al recibir un eco saliente o al enviar el formulario web.

La fuente de verdad de esa decisión es el CRM. La landing valida un callback firmado; no tiene acceso independiente a los mensajes para comprobar que el CRM disparó el evento correcto.

## A. Preparación de intenciones

### WhatsApp

La landing genera un `intencion_id` UUID y una referencia exacta `R-` seguida de 16 caracteres hexadecimales. El mensaje prellenado termina con:

```text
Ref: R-0123456789ABCDEF
```

El usuario debe enviar el mensaje. Leer esa referencia del **mensaje entrante real**. Se puede extraer con una expresión como `/\bR-[A-F0-9]{16}\b/i`; normalizar a mayúsculas. No convertir códigos R en códigos L de DLC. Resolver primero la empresa y la URL de callback de Rosso; no buscar globalmente entre negocios ni compartir el secreto de DLC.

Un código puede ser borrado por el visitante. En ese caso no inferir la sesión por cercanía temporal ni por nombres. El CRM puede confirmar una adquisición sin referencias y la landing la mostrará sin atribución web, sin enviar publicidad basada en una identidad no autorizada.

### Formulario

`/api/lead` envía al `LEAD_WEBHOOK_URL` configurado:

```json
{
  "nombre": "Datos voluntarios del visitante",
  "celular": "+51…",
  "ciudad": "Chiclayo",
  "busca": "Para mi familia",
  "lote": "G18",
  "visita": false,
  "dia": "",
  "consentimiento": true,
  "proyecto": "La Campiña",
  "origen": "web",
  "fecha": "<ISO UTC>",
  "submission_id": "<UUID estable del envío>",
  "intencion_id": "<UUID; solo con medición autorizada>",
  "codigo": "<R-…; solo con medición autorizada>",
  "atribucion": {"first": {}, "last": {}},
  "tracking_consent": {"analytics": true, "marketing": true}
}
```

Las propiedades de intención/atribución faltan cuando el visitante rechaza medición. No debe fallar la recepción del formulario por ello. Se conserva la autorización de contacto, independiente de la publicidad.

Cabeceras: `Content-Type: application/json`, `Idempotency-Key: <submission_id>` y, cuando está configurado, `Authorization: Bearer <LEAD_WEBHOOK_TOKEN>`. El receptor debe aplicar la idempotencia de ese encabezado. La landing también la aplica, pero un timeout después de que el CRM acepte el POST solo puede resolverse correctamente si ambos extremos la respetan.

Responder 2xx cuando la solicitud haya sido aceptada/persistida. No interpretar esa aceptación como Lead confirmado. Asociar `intencion_id` a la ficha/intención correspondiente para poder devolverlo después del primer mensaje entrante real.

## B. Callback canónico de conversión

```http
POST https://<DOMINIO-ROSSO>/api/conexigo/conversiones
Content-Type: application/json
X-Conexigo-Firma: sha256=<HMAC-SHA256 del cuerpo exacto>
```

Cuerpo:

```json
{
  "conversion_id": "<UUID canónico de esta adquisición>",
  "empresa_id": "<UUID exacto de Rosso>",
  "contacto_id": "<ID canónico estable del contacto en la empresa>",
  "intencion_id": "<UUID de la intención; opcional>",
  "codigo": "<R-16-hex; opcional>",
  "recibido_en": "2026-10-13T17:00:00.000Z",
  "ts": 1791910800
}
```

Los valores de fecha son ilustrativos: generar fechas reales. `ts` debe ser la hora actual en segundos al **firmar cada intento**, con tolerancia de cinco minutos. `recibido_en` conserva la fecha real del primer mensaje, incluso en reintentos. No sustituirla por una fecha nueva para intentar volver a contar un contacto.

`contacto_id` admite letras, números, guiones y guiones bajos, hasta 120 caracteres. Como alternativa admite `telefono_huella`, un hex de 64 caracteres calculado consistentemente por el CRM. **Usar siempre la misma estrategia de identidad por empresa.** No enviar primero solo huella telefónica y después solo ID para el mismo contacto: son claves distintas. Se recomienda enviar siempre `contacto_id` canónico, estable incluso ante fusiones/normalizaciones de contactos.

`telefono_huella` es para deduplicar: no se presupone que sea un hash publicitario. Opcionalmente el CRM puede incluir **`telefono_sha256`**, hash SHA-256 hexadecimal del teléfono normalizado con código de país, solo dígitos, para matching de la conversión. La landing solo lo utiliza si existe consentimiento publicitario atribuible y nunca lo devuelve en el panel. No enviar el teléfono en claro en este callback.

`conversion_id` identifica de manera permanente la adquisición, no el intento HTTP ni cada nuevo mensaje. Persistirlo junto con una outbox transaccional en el CRM. La landing también protege contra un ID nuevo para el mismo contacto, pero no sustituye la deduplicación canónica del CRM.

Cuando llegan ambos `intencion_id` y `codigo`, deben apuntar exactamente a la misma intención. Un conflicto se rechaza; no se decide arbitrariamente cuál prevalece. La empresa es obligatoria y debe coincidir con `CONEXIGO_EMPRESA_ID`.

### Ejemplo Node.js / servidor

Este ejemplo firma un evento **ya confirmado por el negocio**. No es el disparador de confirmación ni debe ejecutarse al enviar el formulario.

```js
import { createHmac } from 'node:crypto';

export async function avisarConversionRosso(eventoPersistido) {
  const destino = process.env.ROSSO_CONVERSION_CALLBACK_URL;
  const secreto = process.env.ROSSO_CONVERSION_WEBHOOK_SECRET;
  if (!destino || !secreto || secreto.length < 32) {
    throw new Error('Falta configurar el callback de Rosso');
  }
  const url = new URL(destino);
  if (url.protocol !== 'https:') throw new Error('El callback debe ser HTTPS');

  const cuerpo = JSON.stringify({
    conversion_id: eventoPersistido.conversion_id,
    empresa_id: eventoPersistido.empresa_id,
    contacto_id: eventoPersistido.contacto_id,
    ...(eventoPersistido.intencion_id ? {intencion_id: eventoPersistido.intencion_id} : {}),
    ...(eventoPersistido.codigo ? {codigo: eventoPersistido.codigo} : {}),
    recibido_en: eventoPersistido.recibido_en,
    ts: Math.floor(Date.now() / 1000),
  });
  const firma = createHmac('sha256', secreto).update(cuerpo).digest('hex');
  const respuesta = await fetch(url, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(12000),
    headers: {'content-type': 'application/json', 'x-conexigo-firma': `sha256=${firma}`},
    body: cuerpo,
  });
  const resultado = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok || resultado.ok !== true) {
    // La outbox reintenta fallos transitorios; alertar por 4xx de configuración/contrato.
    // No crear una nueva conversion_id para resolver un error.
    throw new Error(`Callback Rosso no confirmado: HTTP ${respuesta.status}`);
  }
  return resultado;
}
```

Los nombres `ROSSO_*` son la configuración recomendada **en el CRM** para ese destino. En la landing el mismo secreto se llama `CONEXIGO_WEBHOOK_SECRET`. Guardarlos por empresa, no en código público. No copiar estas variables sobre las de DLC.

### Respuestas

- 200: `{ok:true, proyectada:true, idempotente:boolean, evento_id:"UUID", atribuida:boolean}`.
- 400: JSON, identificador, código o fecha inválidos.
- 401: firma incorrecta o `ts` fuera de tolerancia.
- 403: empresa diferente/ausente.
- 409: referencias inconsistentes.
- 413: cuerpo excesivo.
- 422: falta identidad estable de contacto.
- 503: configuración o persistencia no disponible.

200 con `idempotente:true` significa que no aumentó el contador. 200 con `atribuida:false` conserva la adquisición canónica pero no la inventa como originada en una sesión de la web.

`/api/whatsapp/recibido` es un alias del mismo contrato estricto. **No acepta el contrato antiguo de solo código/fecha para crear Leads**. Los emisores antiguos deben migrar; no se debe degradar la validación para hacerlos pasar.

## C. Un solo emisor publicitario

Por defecto `CONVERSION_SENDER=landing`: el CRM confirma; la landing encola Meta CAPI y TikTok Events API con sus IDs de Rosso. **El CRM no debe enviar otra conversión publicitaria por el mismo hecho.** El navegador no dispara un Lead paralelo.

Solo elegir `CONVERSION_SENDER=crm` si ConexiGO ya implementa el envío publicitario canónico completo para este negocio, con sus propias credenciales, consentimiento, matching y deduplicación. En ese modo la landing conserva su contador y atribución, pero no encola CAPI. Este ZIP no incorpora esa funcionalidad dentro del CRM ni le transfiere automáticamente las cookies de matching; esa ruta requiere la integración existente del CRM o trabajo adicional allí.

## D. Pruebas cruzadas obligatorias

Probar en la empresa correcta: primer mensaje real con referencia; formulario sin mensaje; segundo mensaje del mismo contacto; webhook duplicado; callback con empresa distinta; código inexistente; código borrado; discrepancia entre ID/código; consentimiento retirado; proveedor publicitario temporalmente caído. Revisar un solo Lead y los estados reales en `/panel` y Events Manager.

No activar la conversión optimizada de las campañas hasta comprobar recepción real, consentimiento y ausencia de doble emisor.
