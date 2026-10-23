# 0012 · Rediseño guiado por la landing de Grupo DLC

- **Fecha:** 2026-10-23
- **Rama:** `jheferson`, subido el 2026-10-23 a `origin/jheferson` en el commit `c316261`; el trabajo de píxeles
  de la otra sesión va en `23e2395`. `main` intacto.
- **Reemplaza a:** la dirección visual de `0011-rediseno-inmersivo.md`. De 0011 se conservan las
  piezas técnicas (motor de movimiento, plano diferido, banda de drone, pruebas actualizadas).
- **Pedido:** "Cuando te pasé el link de la página no fuera para que lo hagas igual, en todo caso si
  quieres guiarte de una página guíate de esta: https://grupodlc.conexigo.com/" y "El formulario
  pásalo al principio también".

## Por qué cambió

La versión 0011 tomaba de landonorris.com su firma visual (el nombre gigante en lima sobre fondos
oscuros con historia fija). El usuario aclaró que esa página era una muestra del nivel de experiencia,
no un estilo para copiar, y fijó como referencia la landing de Grupo DLC (Finca Algarrobo), que es
una landing hermana de ConexiGO pensada para convertir.

## Qué se tomó de la referencia (estructura y experiencia, no la marca)

Desmontaje de grupodlc.conexigo.com (curl + Playwright, escritorio y 390 px): Next.js, fondo negro,
acento dorado, Outfit + Inter, barra flotante redondeada, hero centrado con antetítulo, titular en
tres líneas con la palabra clave grande, chips de beneficios, carrusel de fotos + tarjeta blanca de
formulario, bloque del proyecto con esquema de lotes + cifras + lista con checks + botones, galería y
video, pestañas "Ubicación / Financiamiento / Papeles", testimonios, contacto con tarjetas de canales,
pie en columnas y botón flotante "Asesor en línea".

Adaptado a La Campiña:

| Referencia DLC | La Campiña |
|---|---|
| Negro + dorado | Verde bosque casi negro `#06120e` + lima de marca `#A6C138` |
| Outfit + Inter | Outfit (titulares y cifras) + Plus Jakarta Sans (texto) |
| "CASA DE CAMPO" desde 500 m² a 3 min | "TU CASA DE CAMPO" desde 510 m² con escritura pública |
| Formulario: nombre, WhatsApp, inicial → WhatsApp | Formulario existente al CRM (`hero-form`), con "Estoy buscando un lote para…" |
| "Bono exclusivo: cerco vivo" | Promoción real de la lista: contado desde S/ 17,000 en 19 lotes |
| Renders del proyecto | Fotos y vuelos de drone reales, fechados |
| Esquema estático de lotes | Mini plano real con el lote de cuota más baja + el explorador completo con simulador |
| Testimonios | No hay testimonios reales: no se inventan. Su lugar lo ocupa la bitácora de obra y las preguntas frecuentes |
| Asesor con foto | Botón flotante sin foto (no hay foto de asesor); WhatsApp si hay número, si no el formulario |

**El formulario va al principio:** está en la portada (escritorio: a la derecha del carrusel; móvil:
justo después del titular y los chips, antes del carrusel) y se repite en "Da el primer paso hoy".
El botón "Agenda tu visita" de la barra lleva al de la portada (`#formulario`).

## Archivos

| Archivo | Cambio |
|---|---|
| `src/app/page.tsx` | Composición nueva: portada con formulario, proyecto, lo que vas a disfrutar, obra, lotes, por qué, preguntas, contacto, pie |
| `src/app/globals.css` | Sistema visual nuevo (oscuro, tarjetas, píldoras, tarjeta blanca de formulario); estilos del plano, ficha y carrusel |
| `src/app/layout.tsx` | Outfit + Plus Jakarta Sans con `display: optional` (sin salto de diseño) |
| `src/components/HeroCarousel.tsx` | Restaurado desde `main` (pase automático pausable, `gallery_view`, `video_play`); miniaturas con nombre accesible visible |
| `src/components/DecisionTabs.tsx` | Nuevo: pestañas accesibles Ubicación / Financiamiento directo / Papeles claros |
| `src/components/AsesorFlotante.tsx` | Nuevo: botón flotante de asesor con saludo descartable (solo escritorio) |
| `src/lib/tracking/schema.ts` | Nueva fuente de medición `float-contact` ("Botón flotante · asesor") |
| `src/components/SiteHeader.tsx` | Barra flotante; enlaces a las secciones nuevas; acción a `#formulario` |
| `src/app/panel/panel.css` | `color-scheme: light` solo para el panel (el sitio ahora es oscuro) |
| `scripts/check-source.mjs` | La prueba estática vuelve a revisar el carrusel (`setInterval`, `rosso:motion`) |
| Eliminados | `PinnedHero.tsx`, `MobileActions.tsx` y la fuente Erode (eran de la dirección 0011) |

## Medición

- `id` de secciones: `inicio`, `proyecto`, `areas`, `avance`, `lotes`, `por-que` (nueva),
  `preguntas`, `contacto`. Ya no existen `pagar` ni `ubicacion` como secciones: su contenido vive en
  las pestañas de `por-que`.
- `data-track`: `header-contact` (barra y menú), `float-contact` (nuevo), `contact-whatsapp`,
  `lot-whatsapp`, `lot-contact`. Formularios: `hero-form` y `contacto-form`.

## Cómo se verificó

| Prueba | Resultado |
|---|---|
| `tsc --noEmit`, `next build` | sin errores |
| `npm test` (TypeScript 5.9) | 36 pasan, 1 falla (la misma que en `main`) |
| Inspector de Taste | 0 FAIL con `--allow eyebrow,micro-label,hairline,outlined-box,icon-cards` (recursos de la referencia DLC) |
| Lighthouse escritorio | rendimiento 92, accesibilidad 100, CLS 0 |
| Lighthouse móvil (3 corridas) | rendimiento 71/55/60 (mediana 60; `main`: 55), accesibilidad 100, CLS 0 |
| Movimiento reducido (390 px) | sin textos ocultos, sin videos, sin Lenis, carrusel en "Recorrido manual" |
| Rutas | `/`, `/lote/G18`, `/privacidad`, `/panel` responden 200 |
| `impeccable detect` | antetítulos y tarjetas anidadas (de la referencia); contraste del texto de ayuda del buscador (corregido); "bajo contraste" sobre la foto del hero = falso positivo (la herramienta mide la foto sin el velo; con el velo el lima da unos 7:1) |

Las mediciones de Lighthouse en móvil oscilan mucho en este equipo (memoria libre de 0.3 GB de 7.8).
El único error de consola es el 503 de `/api/tracking/*` en local: `.env.local` no tiene `DATABASE_URL`.

## Pendientes

- Revisión del dueño, unión a `main` y despliegue (no se hacen desde este entorno).
- Si Rosso tiene testimonios reales o la foto de un asesor, se pueden sumar como en la referencia.
- Número de WhatsApp, teléfono y enlace de Maps siguen pendientes del cliente: hoy los botones
  llevan al formulario.
- Actualización de seguridad de Next 16.4.0 → 16.4.3 (propuesta aparte).
