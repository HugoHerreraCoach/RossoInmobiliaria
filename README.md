# La Campiña / Rosso Inmobiliaria

Landing rediseñada, con **movimiento, medición consentida, píxeles Meta y TikTok, confirmación de mensajes desde ConexiGO y panel privado en `/panel`**.

Se conservan el catálogo original de **132 lotes**, las fotografías, los videos, los filtros y el simulador. Precios y disponibilidad proceden del archivo recibido; no se presentan como una consulta en tiempo real al CRM.

## Regla comercial principal

**Clic en WhatsApp ≠ formulario ≠ Lead.** El Lead se registra únicamente tras un callback firmado de ConexiGO que confirma el primer mensaje entrante guardado del contacto. El navegador no puede crear un Lead. No se interpreta abrir WhatsApp como enviar un mensaje.

## Abrir y probar en local

Requiere Node.js compatible con la versión de Next del proyecto, npm y acceso al registro de paquetes. Se conserva el `package-lock.json` recibido.

```bash
npm ci
```

Copiar `.env.example` a `.env.local`. Generar la contraseña y los secretos:

```bash
npm run panel:password
```

El comando solicita una contraseña de al menos 12 caracteres sin mostrarla y devuelve su hash y los secretos aleatorios. Copiar cada valor a su variable en `.env.local`; no compartir esa salida. Mantener `TRACKING_STORAGE=file` para probar sin base remota.

```bash
npm run dev
```

Abrir `http://localhost:3000` y `http://localhost:3000/panel`. Aceptar la medición en la landing y navegar para generar datos. El panel está vacío inicialmente: no contiene resultados de demostración. El modo local guarda eventos en `.data/`, excluido de Git. Sin IDs publicitarios no se cargan los píxeles; sin destino de formulario no se simula una solicitud exitosa.

## Activar en producción

1. La base es el esquema `landing_rosso` dentro de la base de ConexiGO, con su propio rol (ver `docs/0009-base-en-conexigo.md`). Ejecutar `db/schema.sql` conectado como `landing_rosso`. No toca tablas del CRM.
2. Configurar `DATABASE_URL` (pooler de transacción, usuario `landing_rosso.<ref>`), `APP_SECRET`, `PANEL_PASSWORD_HASH` y el dominio HTTPS exacto en `NEXT_PUBLIC_SITE_URL`. Ya no se usan claves de Supabase.
3. Configurar el WhatsApp de Rosso, el destino del formulario, su empresa en ConexiGO y el callback descrito en **`docs/CONEXIGO-INTEGRACION.md`**. Es necesario adaptar el emisor del CRM; subir este ZIP no cambia ConexiGO.
4. Configurar los IDs y tokens de **Rosso**, no los de DLC, y elegir un solo emisor de conversiones. Completar el aviso de privacidad con el responsable legal y su canal verificado.
5. Ejecutar las verificaciones y compilar. Programar la tarea autenticada `/api/tracking/drain` para reintentos y limpieza; detalles en la guía técnica.

```bash
npm test
npm run typecheck
npm run build
npm start
```

Los IDs `NEXT_PUBLIC_*` se incorporan al bundle: cambiar un ID o dominio exige recompilar. Nunca dar ese prefijo a tokens, contraseñas o a `DATABASE_URL`.

## Qué incluye `/panel`

Acceso con contraseña protegida con un hash scrypt, sesión firmada de ocho horas y APIs privadas. Muestra visitantes y sesiones medidos, clics de WhatsApp, solicitudes aceptadas por el destino del CRM, leads confirmados, fuentes/campañas, primer y último origen conocido, profundidad de lectura, tiempo activo estimado y recorridos por sesión. Permite filtrar fechas/fuente, descargar CSV del rango y revisar o reintentar entregas a Meta/TikTok.

Son registros propios de esta web, **no gasto, presupuesto ni estadísticas descargadas de Ads Manager**. Las visitas de usuarios que rechazan el seguimiento no se contabilizan. No se prometen cobertura del 100 %, identificación personal automática ni reconstrucción de pasos anteriores al consentimiento.

## Movimiento

Video real y silencioso en portada con imagen de respaldo; desplazamiento suave del fondo; aparición de bloques al recorrer la página; detalles al pasar el cursor; galería con transición y recorrido automático; indicador de avance de lectura. El usuario puede pausarlo. Se respeta movimiento reducido y se evita el video de fondo con ahorro de datos/conexión 2G.

## Documentación

- **`docs/0008-rastros-panel-movimiento.md`**: variables, eventos, seguridad, almacenamiento, mantenimiento, límites y puesta en marcha.
- **`docs/CONEXIGO-INTEGRACION.md`**: contrato de integración y ejemplo de firma para el agente que mantiene ConexiGO.
- **`db/schema.sql`**: instalador de base y RPC atómica.
- **`docs/verificacion-v2.json`**: resultados y alcance de esta entrega.
- Documentos `0001` a `0007`: decisiones históricas del proyecto y del rediseño anterior.

## Verificación de esta entrega

Se ejecutaron pruebas offline de sintaxis y contratos, con persistencia temporal en archivo, respuestas de CRM/proveedores simuladas y comprobaciones del cliente en un DOM simulado. Se revisaron adicionalmente tipos del código de servidor y del cliente de tracking con una declaración temporal de `next/server`.

**No se ejecutó una compilación completa de Next ni una prueba end-to-end del sitio con sus dependencias reales**: `npm ci --offline` encontró paquetes ausentes de la caché y el entorno de revisión no tenía acceso de red al registro. Tampoco se ejecutó el SQL en una base remota ni se validaron credenciales reales de Meta, TikTok o ConexiGO. Antes de publicar, completar los pasos y la aceptación descritos en las guías. El repositorio remoto y la web publicada no se han modificado.
