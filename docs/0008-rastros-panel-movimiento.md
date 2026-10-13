# 0008 · Rastros, píxeles, panel y movimiento

Fecha de entrega: 13 de octubre de 2026. Continúa el rediseño del documento 0007.

## 1. Arquitectura

```text
Visitante → elección de medición/publicidad
  → ID de navegador firmado + sesión de 30 minutos de inactividad
  → eventos propios → /api/tracking/events → base de Rosso
  → clic WhatsApp → intención persistida + referencia R-… en el mensaje
  → formulario → /api/lead → destino comercial configurado

ConexiGO guarda el PRIMER mensaje entrante del contacto
  → callback firmado /api/conexigo/conversiones
  → validación de empresa, firma, fecha y referencias exactas
  → deduplicación por conversión + identidad estable del contacto
  → Lead propio + cola de conversión (solo con permiso publicitario)
  → Meta CAPI / TikTok Events API, mismo event_id en cada reintento

Administrador → /panel → cookie privada → /api/panel → datos de Rosso
```

Este ZIP no modifica ConexiGO, no configura Meta/TikTok, no crea una base remota ni publica la web. Incluye la implementación de la landing y el contrato para configurar su integración. No copia IDs ni claves de las cuentas de DLC.

## 2. Eventos y significado

| Evento propio | Cuándo ocurre | Publicidad |
|---|---|---|
| `page_view` | Página visitada después de aceptar medición | Meta `PageView`; TikTok `page()`, solo con permiso publicitario |
| `section_view` | Sección visible | Solo registro propio |
| `scroll_depth` | 25, 50, 75 y 100 % de lectura | Solo registro propio |
| `engagement` | Intervalos visibles con actividad reciente | Solo registro propio; no duración exacta |
| `cta_click` | Clic en navegación o botón identificado | Solo registro propio |
| `form_start`, `form_error` | Primer foco y errores clasificados | No incluye valores escritos |
| `lot_view` | Lote seleccionado o ficha visitada | `ViewContent` cuando hay permiso publicitario |
| `lot_filter`, `simulator_change` | Cambio de vista/filtro o simulación | Datos numéricos/categorías permitidos, sin texto libre |
| `gallery_view`, `video_play`, `share_lot` | Interacción con medios y compartir | Solo registro propio |
| `whatsapp_click` | Se preparó el acceso a WhatsApp y su referencia | Evento personalizado `WhatsAppClick`, **no Lead** |
| `form_submit` | El destino configurado aceptó el POST del formulario | Evento personalizado `FormSubmitted`, **no Lead** |
| `lead_confirmed` | Confirmación firmada del primer mensaje entrante almacenado en ConexiGO | `Lead` desde un único emisor de servidor |

Un destino de formulario que responde HTTP 2xx se interpreta como aceptación técnica de la solicitud; no como entrega de un mensaje ni como una venta. Para WhatsApp, un clic tampoco demuestra que la pestaña se abrió correctamente o que el texto se envió. Los clics modificados o con botón central usan la navegación nativa y no generan la referencia de intención de este flujo.

No se usa `SubmitForm` para los formularios de TikTok: su nomenclatura actual lo convierte a `Lead`. Conservarlo como evento personalizado evita inflar los resultados confirmados. El seguimiento automático de formularios/contactos debe permanecer desactivado en la configuración externa de los píxeles y en cualquier gestor de etiquetas adicional.

## 3. Atribución y referencias

Se admiten `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `campaign_id`, `adset_id`, `ad_id`. `fbclid`, `ttclid` y `gclid` ayudan a clasificar el origen. Se guarda el primer origen conocido y el último origen no directo conocido; una navegación interna no reemplaza una campaña por “directo”. No es un modelo de atribución oficial de Ads Manager.

Ejemplo conceptual para una campaña de Meta:

```text
?utm_source=meta&utm_medium=paid_social&utm_campaign=campina_preventa&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}
```

Comprobar las macros disponibles en la plataforma donde se configure el anuncio. Para TikTok, utilizar los identificadores/macros que ofrezca esa cuenta, no copiar macros de Meta sin verificar.

Las URLs registradas se reducen a rutas aprobadas; no se guardan consultas completas ni mensajes. Las propiedades de eventos pasan una lista permitida. Los IDs de sesión y navegador no revelan automáticamente el nombre del visitante. Es posible que un visitante borre sus datos, cambie de dispositivo o rechace cookies: no hay fingerprinting para saltarse esa decisión.

La referencia de WhatsApp tiene el formato **`R-` + 16 caracteres hexadecimales** y se añade al mensaje con `Ref: R-…`. La coincidencia es exacta. No se adopta el prefijo `L-` de DLC para evitar cruzar proyectos. Si el visitante borra la referencia y el CRM no conserva `intencion_id`, el mensaje se registra como **sin atribución web**, sin adivinar por nombre, teléfono parecido o cercanía temporal.

## 4. Almacenamiento

### Desarrollo local

`TRACKING_STORAGE=file` usa `.data/<TRACKING_SITE_ID>.json`. Escritura serializada, archivo temporal + renombrado y permisos restrictivos. Permite probar el panel sin infraestructura remota. No es un motor multiinstancia; no se utiliza en producción.

### Producción

Configurar `TRACKING_STORAGE=supabase`. Ejecutar el instalador **`db/schema.sql`** en la base correcta. Crea únicamente:

- `public.rosso_tracking_records`, con partición lógica por `site`, tipo e identificador.
- RPC `public.rosso_tracking`, para operaciones atómicas sobre esos registros.
- Índices únicos para intención/código y conversión/identidad estable.

El servidor accede por REST con clave privada; no hay SDK de Supabase ni claves de servicio en el navegador. RLS está activado; `PUBLIC`, `anon` y `authenticated` no tienen acceso a la tabla ni a la función. La función es `SECURITY INVOKER` y solo se concede al rol de servicio. No crear una política de acceso público para “hacer funcionar” el panel.

Comprobar después de ejecutar:

```sql
select has_function_privilege('anon','public.rosso_tracking(text,text,jsonb)','EXECUTE');
select has_table_privilege('authenticated','public.rosso_tracking_records','SELECT');
-- Ambos resultados deben ser false.
```

La RPC contiene transacciones de confirmación y reclamación de trabajos mediante `FOR UPDATE SKIP LOCKED`, con leases para no aceptar resultados de trabajadores obsoletos. La API lee errores de configuración como errores; no sustituye una base fallida por métricas ficticias.

### Retención

La tarea `prune` elimina eventos, intenciones, entregas y operaciones de formulario con más de 90 días, además de límites de solicitudes vencidos. Los identificadores HMAC mínimos de conversiones y las revocaciones se conservan para impedir duplicados/reactivaciones. Definir con el responsable una política de eliminación de esas claves, sabiendo que eliminarlas también elimina su protección histórica frente a duplicados.

`APP_SECRET` protege firmas y HMAC de deduplicación. No rotarlo sin una migración planificada: cambiarlo invalida sesiones y cambia las claves de identidad. El secreto del webhook es independiente y permite una clave anterior temporal.

## 5. Panel privado

Acceder a `/panel`. La página de login puede ser pública; los datos se entregan únicamente tras verificar la cookie firmada del administrador en **cada API**. Se usa scrypt para la contraseña, cookie HttpOnly/SameSite Strict/Secure en producción, duración de ocho horas, controles de origen en escrituras y límites de intentos de login. Cambiar `PANEL_PASSWORD_HASH` invalida sesiones anteriores. El cierre de sesión elimina la cookie de ese navegador; no es un sistema multiusuario con revocación centralizada por dispositivo.

El panel no almacena nombre, teléfono completo, contraseña ni mensaje del visitante. Exporta registros técnicos; tampoco devuelve tokens publicitarios, hashes telefónicos de matching o cookies de plataformas. Los CSV neutralizan celdas interpretables como fórmulas.

La zona horaria de informes es **America/Lima / UTC−5**, propia del proyecto, independientemente de la ubicación del administrador. Rango máximo de 31 días; hasta 20 000 eventos por consulta. Cuando se alcanza el límite, se indica que las cifras son parciales y no se permite una exportación que aparentaría estar completa: reducir fechas. La exportación aplica el rango de fechas completo, no el filtro de fuente del navegador. La tabla de entregas muestra como máximo las 200 más recientes del rango.

La tasa de conversión usa sesiones que tienen una visita y un lead atribuido dentro del rango seleccionado. WhatsApp y formulario son rutas alternativas, no fases obligatorias de un embudo lineal. La última actividad registrada ayuda a analizar la salida, pero **no prueba el motivo del abandono**. No se incluye mapa de calor ni grabación de sesiones.

## 6. Variables y controles de seguridad

Consultar `.env.example`. Grupos:

| Grupo | Variables |
|---|---|
| Dominio y canales públicos | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_MAPS_URL` |
| Autenticación | `APP_SECRET`, `PANEL_PASSWORD_HASH` |
| Base | `TRACKING_STORAGE`, `TRACKING_SITE_ID`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Formulario | `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_TOKEN` |
| Callback CRM | `CONEXIGO_EMPRESA_ID`, `CONEXIGO_WEBHOOK_SECRET`, opcional `CONEXIGO_WEBHOOK_SECRET_ANTERIOR` |
| Un solo emisor | `CONVERSION_SENDER=landing` o `crm` |
| Meta | `NEXT_PUBLIC_META_PIXEL_ID`, `META_GRAPH_VERSION`, `META_CAPI_ACCESS_TOKEN`, opcional `META_TEST_EVENT_CODE` |
| TikTok | `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `TIKTOK_EVENTS_ACCESS_TOKEN`, opcional `TIKTOK_TEST_EVENT_CODE` |
| Mantenimiento | `CRON_SECRET` |

`META_GRAPH_VERSION` es la versión Graph habilitada para la app y su token, **no la versión de Embedded Signup**. Se exige un valor explícito: no se presupone una versión permanente. El archivo no contiene un ID real ni una contraseña predeterminada.

Las variables públicas se incorporan al compilar. El dominio HTTPS debe coincidir exactamente con el origen canónico servido; redirigir dominios alternativos a él. En instalaciones con otro proxy, comprobar que sobrescribe `X-Forwarded-For`: no permitir que el visitante falsifique el identificador utilizado para los límites. No se guarda la IP en claro.

## 7. Cola y mantenimiento

Configurar un programador del hosting o del sistema que haga, por ejemplo cada cinco minutos, una petición a:

```http
GET /api/tracking/drain
Authorization: Bearer <CRON_SECRET>
```

Admite también POST con la misma autorización. No colocar el secreto en la URL. Programar la llamada es un paso de despliegue pendiente; el ZIP no crea una tarea remota. La ejecución drena hasta 20 trabajos y aplica limpieza. Ajustar frecuencia al tráfico; el endpoint no queda abierto públicamente. El callback CRM intenta además drenar cuatro trabajos mediante `after`, pero la persistencia de la cola y el programador son necesarios para recuperarse de fallos.

La cola conserva el mismo `event_id` en todos los reintentos; cada plataforma tiene una entrega independiente. Reintentos con espera creciente, hasta seis intentos automáticos; el panel permite reactivar fallidos/desactivados después de corregir credenciales. Los envíos con consentimiento retirado no se reactivan. El estado “Aceptado” requiere confirmación técnica del proveedor (`events_received` en Meta o `code: 0` en TikTok), no solamente HTTP 200. Eso no garantiza atribución a un anuncio, calidad de matching ni aparición instantánea en reportes.

Se revalida la revocación antes del envío. Una petición que ya haya salido a una plataforma no puede retirarse desde esta web. No se intenta enviar conversiones con más de siete días de antigüedad.

## 8. Privacidad y movimiento

La landing ofrece aceptar todo, solo medición o rechazar. No carga scripts de publicidad antes del permiso específico. Con GPC activo, marketing queda desactivado. El permiso comercial del formulario es independiente: rechazar tracking no impide pedir información. Las pestañas sincronizan cambios de consentimiento; una retirada detiene el cliente y desactiva la cola pendiente.

`/privacidad` explica la implementación técnica, pero **su responsable legal y contacto verificable deben completarse y aprobarse antes de publicar**. No constituye una certificación de cumplimiento legal ni sustituye la revisión de los ajustes de privacidad de Meta/TikTok/CRM.

El movimiento usa los medios reales incluidos, sin bibliotecas nuevas: video de ingreso silencioso, respaldo fotográfico, animaciones al aparecer, fondo con desplazamiento leve, galería automática cada seis segundos, pausa por interacción/visibilidad, detalles hover e indicador de lectura. El control global y `prefers-reduced-motion` detienen animaciones automáticas. Con ahorro de datos o 2G no se descarga el video de fondo. Las imágenes permanecen visibles si falla el autoplay o JavaScript.

## 9. Aceptación antes de publicar

1. Ejecutar `npm ci`, `npm test`, `npm run typecheck` y `npm run build` con las dependencias reales. Revisar en escritorio y móvil; comprobar pausa, menú, formulario, ficha y galería.
2. Instalar SQL y verificar permisos con anon/authenticated. Abrir APIs del panel sin cookie: deben devolver 401. Login incorrecto no debe entregar datos.
3. Sin permiso, verificar ausencia de llamadas a píxeles y de eventos de navegación. “Solo medición” debe guardar rastros sin cargar los SDK. Revisar GPC y retirada en dos pestañas.
4. Desde un enlace de prueba con UTMs, consultar secciones/lotes, abrir WhatsApp y comprobar recorrido/campaña. **No debe aparecer Lead** por abrir el chat o enviar el formulario.
5. Enviar un mensaje real y verificar la recepción/persistencia en el CRM, la referencia exacta, el callback firmado, un solo Lead y su entrega a cada proveedor autorizado.
6. Repetir el webhook y otro mensaje del mismo contacto: no aumentar la conversión. Probar firma incorrecta, empresa distinta y referencia ausente.
7. Simular token inválido y reintento de cola; corregirlo y confirmar el mismo `event_id`, sin duplicado. Probar también retirada del permiso con una entrega pendiente.
8. Revisar los eventos de prueba en las plataformas, quitar códigos de prueba, activar mantenimiento y aprobar el aviso de privacidad.

## Fuentes técnicas consultadas

- Meta, deduplicación de Pixel y Conversions API: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/
- TikTok, nomenclatura actualizada de eventos estándar: https://ads.tiktok.com/help/article/how-to-adopt-tiktoks-updated-standard-events
- TikTok, deduplicación de eventos: https://ads.tiktok.com/help/article/event-deduplication
- Supabase, seguridad de la API: https://supabase.com/docs/guides/api/securing-your-api
- Supabase, funciones de base: https://supabase.com/docs/guides/database/functions
- Next.js, ejecución `after`: https://nextjs.org/docs/app/api-reference/functions/after

Se contrastó el contrato de referencia de DLCconexigo; esta implementación separa los datos y códigos de Rosso y no traslada credenciales de ese proyecto.
