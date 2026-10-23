# 0011 · Rediseño inmersivo de la landing (kit web-inmersiva)

> **Reemplazado por `0012-rediseno-guiado-por-dlc.md`** en cuanto a dirección visual. Se conservan las piezas técnicas descritas aquí.

- **Fecha:** 2026-10-23
- **Rama:** trabajado en `rediseno-inmersivo` (desde `main`); subido el
  2026-10-23 a `origin/jheferson` en el commit `c316261`. `main` intacto.
- **Pedido:** "reestructura todo este proyecto de Rosso usando el catálogo de skills y herramientas
  […] si es necesario que reconstruyas todo, hazlo".
- **Método:** skill `web-inmersiva` (flujo de 6 pasos) + `design-taste-frontend` (dirección y gate),
  `gsap-*`, `emil-design-eng` (criterio de movimiento), `impeccable detect`,
  `web-design-guidelines`, `playwright-cli` y Lighthouse.

## Qué se hizo

Se reconstruyó toda la capa de presentación. La capa funcional (medición, formulario al CRM,
referencias de WhatsApp, panel, APIs, base y webhooks de ConexiGO) no se tocó.

### Dirección de arte (ver `DESIGN.md`)

- Dirección repartida por Taste: **el nombre como monumento** (`name-as-monument`, semilla
  1342180353), con la paleta de marca conservada.
- **Idea:** las líneas de cal que trazan cada lote sobre la tierra. "La Campiña" queda fijo en
  lima mientras pasan cuatro capítulos reales de la obra (apertura de vías, ingreso de abril,
  trazado con cal de junio y obra civil de setiembre), cada uno con el color de su tierra, y el
  masterplan dibuja sus 132 lotes como líneas de cal que se trazan al entrar en pantalla.
- Una sola familia tipográfica (Erode, alojada en el proyecto), seis tamaños, botones planos y
  rectangulares; sin etiquetas sobre titulares, sin sombras, sin degradados, sin serif itálica
  de acento.
- Cambio de blueprint registrado: la sección de contacto pasó de "correo como titular" a
  "tarjeta de visita sobre foto", porque el producto necesita el formulario al CRM y no hay correo
  publicado.

### Secciones nuevas

Portada con historia fija → qué es → la obra desde el aire (cuatro vuelos de drone, la principal
se reproduce sola) → lotes por tamaño (cifras calculadas desde la lista) + explorador → precio en
una frase → qué incluye (en obra o proyectado) → dónde está (distancias y bitácora) → preguntas
frecuentes (nueva, 6 respuestas con datos de `PRODUCT.md`) → visita (formulario sobre la foto del
ingreso) → pie con el nombre.

### Archivos

| Archivo | Cambio |
|---|---|
| `src/app/page.tsx` | Composición nueva completa |
| `src/app/globals.css` | Sistema visual nuevo (reemplaza 4,273 líneas de `globals`, `redesign`, `experience` y `tokens`) |
| `src/app/layout.tsx` | Erode local, `SmoothScroll`, arranque `html.js` y pausa guardada; sin script de paletas |
| `src/app/fonts/erode-*.woff2` | Erode 400/500/600 (Fontshare, ITF Free Font License) |
| `src/app/icon.svg` | Favicon (antes daba 404) |
| `src/lib/motion.ts` | Registro de GSAP y `useMotion()` (sistema + pausa del visitante) |
| `src/components/PinnedHero.tsx` | Portada con historia fija |
| `src/components/ObraBand.tsx` | Banda de vuelos de drone |
| `src/components/LazyLotStack.tsx` | Monta el explorador al acercarse (o con enlace a un lote) |
| `src/components/MobileActions.tsx` | Barra del móvil que se esconde al bajar |
| `src/components/motion/SmoothScroll.tsx`, `Reveal.tsx` | Lenis + ScrollTrigger; revelados de titulares |
| `src/components/MotionExperience.tsx` | Estado global de movimiento + botón "Pausar animaciones" |
| `src/components/SiteHeader.tsx` | Barra nueva, menú móvil a pantalla completa |
| `src/components/LotStack.tsx` | Se conserva su lógica. Paleta cal sobre tierra, trazado animado, conteos calculados, sin calles inventadas |
| `src/components/Ficha.tsx` | Se conserva su lógica. Textos en minúscula inicial, cifra antes que su rótulo |
| `src/components/ContactForm.tsx` | Solo un separador de texto |
| `src/app/lote/[id]/page.tsx`, `src/app/privacidad/page.tsx` | Nuevo sistema visual |
| `src/app/panel/page.tsx`, `panel.css` | Carga sus fuentes (Jakarta, Outfit) y su estilo de enlaces: el panel se ve igual |
| `scripts/check-source.mjs` | La prueba estática de movimiento apunta a los archivos nuevos (misma intención) |
| `package.json` | `gsap@3.15.0`, `@gsap/react@2.1.2`, `lenis@1.3.27` |
| Eliminados | `HeroAtmosphere`, `HeroCarousel`, `Schedule`, `WhyProjectTabs`, `PaletaSwitch`, `Photo`, `NavCurrent`, `redesign.css`, `experience.css`, `tokens.css` |

### Correcciones de honestidad en el masterplan

El esquema heredado tenía nombres de calles inventados ("Calle Las Palmeras", "Av. Los Algarrobos",
"Paseo La Campiña", "Calle Mirador del Valle", "Alameda central"), un tiempo sin fuente
("16 min Zaña") y los conteos de la leyenda fijos en el código (70/61/1). Se quitaron los nombres y
el tiempo; los conteos salen de la lista de precios.

## Contrato de medición conservado

- Los `id` de las secciones dentro de `main` siguen siendo los mismos donde la sección existe
  (`inicio`, `proyecto`, `avance`, `lotes`, `pagar`, `areas`, `ubicacion`, `contacto`). Se agregó
  `preguntas`; desapareció `galeria` (su contenido vive ahora en `avance`).
- `data-track` usa solo fuentes de `SOURCES`: `hero-lots`, `header-contact`, `mobile-lots`,
  `mobile-contact`, `contact-whatsapp`, `lot-whatsapp`, `lot-contact`. `hero-form` ya no aparece
  (la portada no lleva formulario; queda el de `contacto-form`).
- `video_play` se mide solo cuando el visitante pide un video con el botón, no con la reproducción
  automática.

## Cómo se verificó

Todo contra builds de producción (`next build` + `next start`) en la misma máquina. La versión
anterior se midió desde un worktree temporal de `main`.

| Prueba | Antes (`main`) | Después |
|---|---|---|
| `tsc --noEmit` | sin errores | sin errores |
| `npm test` (con TypeScript 5.9) | 36 pasan, 1 falla | 36 pasan, 1 falla (la misma) |
| Inspector de Taste (1440/768/390, `--film`) | 14 FAIL, 10 WARN | **0 FAIL**, 2 WARN, sin excepciones `--allow` |
| `impeccable detect` (URL) | — | 0 antipatrones; 5 avisos de viudas, resueltos con `text-wrap: pretty` |
| Lighthouse móvil, mediana de 3 corridas alternadas | rendimiento 55, accesibilidad 96, LCP 7.9 s, TBT 426 ms | rendimiento **65**, accesibilidad **100**, LCP 7.3 s, TBT 423 ms |
| Lighthouse escritorio (corridas sueltas) | rendimiento 93, accesibilidad 96 | rendimiento 99 (dos corridas), accesibilidad 97 antes del último ajuste de `aria` |
| Auditorías en 0 (móvil) | consola, contraste, orden de encabezados, nombre accesible | solo consola (503 de la API local: en `next start` sin `DATABASE_URL` la medición no tiene base; pasa igual en `main`) |
| Movimiento reducido (Playwright, 390 px) | — | sin pin, 0 textos ocultos, 0 videos, sin Lenis |
| Panel `/panel` | — | se ve igual (Jakarta y Outfit cargadas en su ruta) |

Los dos WARN del inspector que quedan: tamaños extra que vienen de los textos del plano SVG (escalan
con el dibujo) y la tabla de precios, que en 390 px se desliza de lado (es una tabla real).

Fallos encontrados y corregidos en el camino: botones de radio del formulario con `width: 100%`
que desbordaban la página; título del hero sin caja propia (el inspector no lo veía); cifra de la
ficha con su rótulo encima; contraste falso del bloque de precio partido por palabras; separador
"·" que Erode dibuja pegado a la palabra siguiente; etiquetas tapadas por botones en la banda;
"Lote G18" repetido tres veces en la ficha; favicon 404.

**No verificado tras el último ajuste:** después de las correcciones de `web-design-guidelines`
(`translate="no"` en la marca, `color-scheme`, contorno de foco en "Qué incluye", `overscroll` del
menú y color del toque) pasaron `tsc` y `npm test`, pero el equipo se quedó sin memoria y el
sistema detuvo los servidores antes de volver a compilar y mirar en el navegador. Las dos
corridas de Lighthouse de escritorio de la comparación tampoco llegaron a correr.

## Pendientes

- **Revisión del dueño:** el trabajo está en la rama `jheferson` (commit `c316261`). No se une a `main`
  ni se despliega desde este entorno.
- **Seguridad de Next:** la compilación avisa que Next 16.4.0 tiene una vulnerabilidad conocida.
  La versión actual es 16.4.3. Se propone actualizar en una tarea aparte.
- **Prueba existente que ya fallaba:** "Global Privacy Control forces marketing off" falla igual
  en `main` (36/37 antes y después). Viene del cambio a medición automática (commit `ccc4fbf`).
- **`npm test` con TypeScript 7:** el script necesita la API de TypeScript 5. Se corrió con
  `TYPESCRIPT_PATH` apuntando a TypeScript 5.9 instalado aparte, sin tocar el proyecto.
- **Tipografía de marca:** el manual pide Guess Sans Heavy; si el cliente entrega la fuente con
  licencia web, puede reemplazar a Erode en el nombre.
- **Selector de paletas eliminado:** `?paleta=rosso` ya no existe. Si el cliente necesita la
  variante Rosso, se rehace sobre los tokens nuevos.
- **Teléfono real:** falta probar en un teléfono de gama media con datos móviles.
- **Datos que siguen pendientes del cliente** (de `PRODUCT.md`): WhatsApp, teléfono, enlace de
  Maps, horario de visitas guiadas (la tarjeta dice "Lo confirma un asesor").
