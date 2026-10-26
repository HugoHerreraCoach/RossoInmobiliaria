# 0031 · `jheferson` sincronizada con `main` (rediseño de ISABEL-ROSSO) y el plano oficial de vuelta

**Fecha:** 2026-10-26 · **Rama:** `jheferson`

## Qué se pidió

> «Ahora main ha incluido un rediseño de toda la landing en ambas landing, lo que quiero es que sincronices main con
> Jheferson y con local; y lo único que vas a conservar de nuestro trabajo es el croquis del plano con los lotes y su
> distribución»

## Punto de partida

- **`main` (`520e468`, en producción):** el dueño fusionó `jheferson` (`577bf5f`, docs 0016–0029) y la rama
  `ISABEL-ROSSO`. Esa rama trae un rediseño de UX/UI de las dos landings: portada, formulario, chat, fichas, renders
  y un selector de propuestas de color.
- **El plano en el rediseño:** `src/components/LotStack.tsx` volvió a un **esquema dibujado a mano** (`MASTERPLAN_GEOM`,
  rectángulos iguales por manzana). Ya no usaba la geometría del plano de lotización oficial (`src/content/plano.ts`,
  0019) ni la versión girada (`planoGirado.ts`, 0025). Por eso fallaba la prueba «Lot map follows the official
  subdivision plan».
- **Ramas:** la local y `origin/jheferson` estaban detrás de `main`.

## Qué se hizo

1. **Sincronizar:** la rama local `jheferson` avanzó a `main` (`520e468`) en fast-forward, sin conflictos. Todo el
   rediseño queda como está en `main`.
2. **Apartar el cambio de evento:** el cambio de `/promocion` a `Contact` (0030) estaba sin commit y se guardó aparte
   (`git stash`) para no mezclarlo. Se aplica solo si el usuario lo confirma.
3. **Plano oficial dentro del componente del rediseño (`LotStack.tsx`).** Se cambió solo la geometría del SVG; queda
   todo lo demás del rediseño:
   - barra con «Disponibles», zoom, arrastre y restablecer;
   - foto de referencia con su opacidad;
   - tooltip, leyenda, ficha lateral y colores por estado;
   - animación de trazo, URL `?vista=&lote=` y aviso al formulario.

   Lo que se reemplazó:
   - `MASTERPLAN_GEOM` y los rectángulos → los 132 contornos reales (`PLANO.lotes[l.id].d`), con el código del lote
     donde el plano rotula su número y su tamaño de letra (`fs`).
   - Perímetro, vías, parques y pórtico dibujados a mano → el terreno con su perímetro, la Vía a San Nicolás y sus
     tiempos («Chiclayo 30 min», de 0029), las bermas con palmeras, los 4 parques con sus áreas comunes, el
     reservorio, los nombres de las calles (Calle 1–12) y el pórtico, todo del plano oficial.
   - Encuadres de manzana a mano → `PLANO.manzanas[X].vista`, con la misma proporción que el lienzo.
   - La rosa de los vientos fija → la flecha gira 97°, el norte real.
   - La animación de trazo se aplica a `<path>` (`SVGGeometryElement`) en vez de `<rect>`.
   - El título de «Ver foto de referencia» dice ahora «no está alineada al plano».

   **Orientación:** el lienzo del rediseño tiene proporción fija de 1160 × 760 (`.mp-viewport`). El plano oficial de
   0019 mide exactamente eso y lo llena. La versión girada de 0025 (proporción 2.8 en horizontal, 0.36 en vertical)
   dejaría vacía casi la mitad del lienzo, así que no se usó y **se borró `src/content/planoGirado.ts`**, que quedaba
   sin uso. Está en el historial (`577bf5f`) si se quiere volver a esa disposición, que también pide el diseño de
   pantalla completa de 0025.
4. **Textos:** el pie de `Landing.tsx` dice otra vez «El plano interactivo se basa en el plano de lotización oficial y
   no lo sustituye» (el rediseño decía «es un esquema»). `LoteDetalle.tsx` ya decía que reproduce el plano de
   lotización: vuelve a ser cierto.
5. **Pruebas (`scripts/check-source.mjs`):**
   - **Plano:** exige `PLANO.lotes[l.id]` y `MZ_VIEWBOX` en `LotStack.tsx`, y que no exista `MASTERPLAN_GEOM`. Ya no
     lee `planoGirado.ts`. La validación de los 132 contornos contra sus áreas oficiales no cambió.
   - **Imágenes referenciales:** se quitó el mínimo de «7 usos», que respondía al diseño de 0024; el rediseño ya no
     usa esas imágenes. Si alguna vuelve a usarse, la prueba sigue exigiendo «referencial» y que no diga «Foto real»
     ni lleve fecha.

## Lo que no se tocó (es del rediseño)

- Las imágenes `editada-*.jpg` de `media.json`, también en la sección «Así avanza La Campiña», donde el texto promete
  «fotos fechadas del propio terreno» (ver 0030). El usuario eligió conservar el rediseño. Si se quiere, se cambia ese
  texto o se vuelve a las tomas reales.
- Nuestras imágenes de 0024 (`imagenes.json`, los 7 `.webp` y `scripts/build-imagenes.mjs`) quedan en el repositorio
  sin uso.

## Cómo se verificó

- `npx tsc --noEmit`: sin errores.
- `TYPESCRIPT_PATH=<typescript 5.9.3> npm test`: **42 pasan, 1 falla**. Falla «Global Privacy Control», la de
  siempre. Pasa otra vez la prueba del plano oficial, que fallaba en `main`.
- `next dev` (Next 16.4.3) con Chrome automatizado:
  - `/`, `/promocion` y `/lote/G18` responden 200;
  - **1440 px:** 132 contornos (`path`) y ningún `rect` de lote, viewBox `0 0 1160 760`, rosa `rotate(97)`. El rótulo
    D acerca la manzana; al tocar D21 la ficha cambia a D21 y la URL queda en `?vista=D&lote=D21`. Sin errores de
    consola.
  - **390 px, `/promocion`:** 132 contornos y sin desborde horizontal (`scrollWidth` 390).
  - **`/lote/G18`:** 132 contornos con G18 seleccionado.

## Pendientes

- [ ] Que el dueño fusione `jheferson` en `main` y despliegue. Hoy producción muestra el esquema a mano.
- [ ] Decidir si se aplica el evento `Contact` en `/promocion` (0030, guardado aparte).
- [ ] Decidir el texto o las imágenes de «Así avanza La Campiña».
