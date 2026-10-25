# 0026 · La pregunta de Lima y el botón flotante al formulario

- **Fecha:** 2026-10-24
- **Rama:** `jheferson` (sin commit al cerrar este documento; tampoco lo tienen 0016–0025).

## Pedido del usuario

> «Ya tenemos las preguntas de la otra landing /promocion, serán las siguientes:
> Para asegurar tu lote en Sipán – Valle Zaña, ¿qué modalidad de preventa prefieres?
> 🔘 Al contado S/ 17,000 · 🔘 Financiado desde S/ 3,000
> Revisa el funcionamiento de la landing de Rosso en cuanto al botón flotante, que funcione igual abriendo el
> formulario. Y ya lo voy a desplegar, en el otro agente lanza la tarea de qué otra cosa necesito agregar al servidor
> para que funcione»

La tarea del servidor se le pidió a la otra sesión: es `docs/0027`.

## Qué se hizo

### 1. La pregunta de `/promocion` (Lima)

- Una sola pregunta, con el texto del cliente tal cual: «Para asegurar tu lote en Sipán – Valle Zaña, ¿qué modalidad
  de preventa prefieres?», con dos opciones: «Al contado S/ 17,000» y «Financiado desde S/ 3,000». Reemplaza a
  «¿Con cuánto cuentas de inicial?», que Lima usaba de forma provisional (0017).
- Los montos salen de la lista de precios, como en Lambayeque: el contado más bajo con promoción (`DESDE_CONTADO`) y
  la inicial mínima. Si cambia la lista, las opciones cambian solas.
- **Sin opción marcada.** En el boceto las dos opciones aparecen iguales y la pregunta busca saber qué prefiere el
  público de Lima: con una marcada de antemano, la respuesta mediría el valor por defecto. Si el visitante no elige,
  el formulario lo avisa antes de enviar («Elige una opción.») y lleva el foco a la primera opción. Antes ese aviso
  llegaba solo desde el servidor. Lambayeque no cambia y sigue con su opción marcada.
- En la hoja de Lima la columna se llama **MODALIDAD** (antes INICIAL). Encabezados de la hoja de Lima:
  `NOMBRE DE CAMPAÑA | FECHA | NOMBRE | NUMERO | MODALIDAD | TikTok Lead ID | TikTok Lead Status | Lead creation time |
  Lead update time | ORIGEN | FUENTE | LOTE`. La respuesta viaja como `respuestas.modalidad`.
- La prueba de `/promocion` fija el texto, la columna, las dos opciones y que ninguna venga marcada.

### 2. El botón flotante del asesor lleva al formulario

- Antes abría WhatsApp en otra pestaña. Ahora hace lo mismo que «Consultar este lote» del plano (0025): sube al
  formulario de la portada y pone el cursor en «Nombres y apellidos». Vale para las dos landings. Conserva su aspecto
  (asesor en línea, círculo de WhatsApp), porque el formulario pide el WhatsApp y el asesor responde por ahí.
- Sin JavaScript sigue siendo un enlace a `#formulario`.
- Se mide como clic con su fuente de siempre (`float-contact`), ya no como intención de WhatsApp.

### 3. Un desfase que tenían todos los enlaces internos

Al probar el botón flotante con animaciones activas, el formulario quedaba 72 px más abajo de lo debido. La causa venía
de antes: Lenis, el desplazamiento suave, ya descuenta el alto de la cabecera (`scroll-padding-top`, 84 px) y además se
le había puesto un desfase propio de −72 px. Por eso todo enlace `#…` (menú, «Lotes», «Obra», etc.) quedaba 156 px bajo
el borde y no a 84. Se quitó ese desfase (`src/components/motion/SmoothScroll.tsx`): ahora todos quedan justo bajo la
cabecera, con y sin animaciones.

Los tres desplazamientos que hace el código («Consultar este lote», «Ver detalle de este lote» y el botón flotante)
usan una misma función, `desplazarA` (`src/lib/formulario.ts`). Con Lenis activo desplaza con Lenis; si no, usa el
desplazamiento del navegador. Así Lenis no pierde la cuenta de dónde está la página.

## Archivos

| Archivo | Cambio |
|---|---|
| `src/content/landings.ts` | Pregunta `MODALIDAD` de Lima (texto del cliente, montos de la lista, sin opción marcada) |
| `src/components/ContactForm.tsx` | Aviso «Elige una opción.» antes de enviar si una pregunta no tiene respuesta; foco en la primera opción |
| `src/components/AsesorFlotante.tsx` | Lleva al formulario en vez de abrir WhatsApp |
| `src/lib/formulario.ts` | Nuevo: `desplazarA` e `irAlFormulario` |
| `src/components/LotStack.tsx` | «Consultar» y «Ver detalle» usan esas funciones |
| `src/components/motion/SmoothScroll.tsx` | Lenis sin el desfase de −72 px en los enlaces internos |
| `scripts/check-source.mjs` | La prueba de `/promocion` fija la pregunta del cliente |
| `docs/0017-landing-promocion-lima.md` | Nota: las preguntas de Lima llegaron |
| `DESIGN.md` | El botón flotante |

## Cómo se verificó

Build de producción en Chrome (Playwright):

| Prueba | Resultado |
|---|---|
| Formulario de `/promocion` | La pregunta y las dos opciones con el texto del cliente, ninguna marcada |
| Enviar sin elegir | «Elige una opción.», foco en la primera opción, no sale ninguna petición |
| Enviar eligiendo «Financiado» | `source: promocion-form`, `respuestas: { modalidad: "Financiado desde S/ 3,000" }`, `busca` vacío |
| Formulario de `/` | Sin cambios: «¿Con cuánto cuentas de inicial?», primera opción marcada, la respuesta en `busca` |
| Botón flotante (`/` y `/promocion`, 1440 y 390 px) | Sube al formulario, cursor en el nombre, no abre pestañas |
| Recorrido en `/` y `/promocion`, con y sin animaciones, en 1440 y 390 px: elegir lote → «Ver detalle de este lote» → botón flotante → «Consultar este lote» | Cada destino queda a 84 px (bajo la cabecera) en los 8 casos; el formulario muestra «G18, 510 m²»; sin errores |
| Enlace del menú `#lotes` con animaciones | 84 px (antes 156) |
| `npm test` | 42 pasan, 1 falla (Global Privacy Control, la misma de antes) |
| `tsc --noEmit` | Sin errores |

## Para confirmar con el cliente

- La pregunta dice «Sipán – Valle Zaña» y el resto de la web dice «Valle de Zaña». Se dejó como la escribió el cliente.
- La pregunta de Lima va sin opción marcada. Si prefieren una marcada, como en Lambayeque, es un cambio de una línea
  (`marcada` en `MODALIDAD`).

## Pendientes

- Lo que necesita el servidor para desplegar: `docs/0027`.
- Commit y push de 0016–0027 cuando se pida.
