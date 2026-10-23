# DESIGN.md — La Campiña · Rosso Inmobiliaria

Vigente desde el 2026-10-23 (`docs/0012-rediseno-guiado-por-dlc.md`, ajustado en
`docs/0014-formulario-dlc-y-plano-en-proyecto.md`).

## 1. Referencia y criterio

La referencia es la landing de **Grupo DLC** (grupodlc.conexigo.com): una landing de conversión
oscura con formulario en la portada. Se toma su estructura y su experiencia, no su marca: colores,
fotos, textos y cifras son de La Campiña. Lo que la referencia tiene y La Campiña no (testimonios,
renders, foto del asesor, bonos) no se inventa.

Otras páginas que el usuario comparta muestran el nivel de experiencia deseado; no se copian.

## 2. Tokens (`src/app/globals.css`)

| Rol | Valor | Uso |
|---|---|---|
| Fondo | `#06120e` | la página |
| Superficies | `#0b1d16`, `#10271e` | tarjetas, bandas, ficha |
| Líneas | `rgba(238, 242, 234, 0.10 / 0.18)` | bordes de tarjetas y píldoras |
| Texto | `#eef2ea` | texto principal |
| Texto suave | `#a9b8ae` | párrafos secundarios (8.6:1 sobre el fondo) |
| Lima de marca (acento) | `#a6c138` | palabras clave de titulares, cifras, botón principal |
| Verde de marca | `#006f55` | botón de envío del formulario, cuota de la ficha, botón flotante |
| Tarjeta de formulario | `#ffffff` con tinta `#0b1d16` | formularios (esquema de color claro) |
| Plano | `--plan-*` | lotes trazados en cal sobre tierra |

**Tipografía:** Outfit (titulares, cifras, botones) y Plus Jakarta Sans (texto), con `next/font` y
`display: optional` para que el cambio de fuente no mueva la página.

**Forma:** tarjetas de 24 px de radio, píldoras y botones redondeados, antetítulo en mayúsculas con
línea, palabra clave del titular en lima.

## 3. Secciones

| Sección | id | Contenido |
|---|---|---|
| Portada | `inicio` (`#formulario`) | antetítulo, titular en tres líneas, chips, formulario + carrusel de fotos reales |
| El proyecto | `proyecto` (con `section#lotes`) | plano interactivo de los 132 lotes + ficha con simulador (se monta al acercarse) |
| Lo que vas a disfrutar | `areas` | fotos reales de lo construido + chips de lo proyectado |
| Obra | `avance` | banda de vuelos de drone + bitácora fechada |
| Por qué | `por-que` | pestañas Ubicación / Financiamiento directo / Papeles claros + cifras |
| Preguntas | `preguntas` | seis respuestas con datos de `PRODUCT.md` |
| Contacto | `contacto` | canales que llevan al formulario de la portada |
| Pie | — | marca, columnas, aviso legal, pausar animaciones |
| Flotante | — | botón "Asesor en línea": el único enlace a WhatsApp (formulario mientras no haya número) |

En el móvil el formulario de la portada va antes del carrusel. Es el único formulario: nombres y
apellidos, WhatsApp (+51) y la inicial ("Desde S/ 3 mil" / "Pago al contado S/ 17 mil"), sin
casilla; el aviso de contacto va bajo el botón. Todo botón de contacto lleva a `#formulario`.

`/lote/[id]` muestra el mismo plano con la ficha: abre completo con el lote resaltado y, al tocar otro,
cambia la ficha, el título y la dirección sin recargar.

## 4. Movimiento

Lenis (solo rueda), entradas escalonadas de los encabezados, carrusel con pase automático pausable,
banda de drone con la toma principal en reproducción automática, plano que se traza al entrar.
Todo se apaga con `prefers-reduced-motion` o con "Pausar animaciones".

## 5. Reglas

- Medición: no renombrar `id` de secciones, `data-track`, `data-lot` ni `data-track-form` sin
  actualizar el panel.
- Las cifras salen de `src/content/lotes.ts` y `src/content/proyecto.ts`. Montos y áreas llevan espacio
  duro entre la cifra y su símbolo o unidad.
- El plano es un esquema de consulta: sin calles ni medidas que no estén en el plano oficial.
