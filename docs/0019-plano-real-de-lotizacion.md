# 0019 · El plano interactivo pasa a la geometría del plano de lotización oficial

**Fecha:** 2026-10-24 · **Rama:** `jheferson` (sin commit al cerrar este documento)

## Qué se pidió

> «Una consulta, el mapa/croquis interactivo de los lotes que me muestras ahí en la landing ¿De dónde lo has sacado?»
>
> «ahí está el mapa para que revises el estado de cada lote te paso una carpeta de Drive con toda la información del proyecto»
>
> (Ofrecimos redibujarlo sobre el plano real.) «Sí, hazlo. Voy a poner a otra sesión en mejorar unas cosas dentro de la página de diseño.»

## Cómo estaba

El croquis era un **esquema dibujado a mano** en `LotStack.tsx` (0006): cada manzana, una fila de
rectángulos iguales en un lienzo de 1160 × 760. El propio código y la web lo avisaban: «no representa
geometría catastral». Los datos de cada lote (código, m², estado, precio) sí eran reales
(`src/content/lotes.ts`, lista del 21/08/2026).

## Revisión previa: plano oficial y lista de precios

Fuente: carpeta de Drive «2. ROSSO INMOBILIARIA», compartida con eventonegocioslegendarios.

- **Plano:** «Plano de Lotización y Vías» PTL-01, La Campiña – Valle Saña, Arq. Renzo Tuesta, febrero
  2025, propietario **N.R. Inversiones**. Terreno de 109,817.17 m² (10.98 ha), con 14 vértices UTM.
- **Contra la web:** el cuadro de áreas del plano tiene los mismos 132 códigos (A 9, B 9, C 20, D 34,
  E 8, F 21, G 21, H 10) y la **misma superficie en los 132**.
- **Estados:** el plano no los trae. Se compararon los 132 lotes con «PRECIOS LA CAMPIÑA ACTUALIZADO
  21.08.26 ASESORES.xlsx» (estado, S/ por m², inicial, cuota, contado y promoción) y **no hay ninguna
  diferencia**: 61 vendidos, 70 disponibles y 1 reservado (D15). Es la lista más reciente de la carpeta.

## Qué se hizo

### Geometría generada desde el PDF (`scripts/plano/`)

El PDF es vectorial: unos 110,000 trazos y 999 textos. El proceso:

1. Se dibujan solo sus líneas (sin textos ni imágenes) y se rellena cada lote desde su rótulo de área
   `A:…m2`. Salen 132 regiones; la superficie de cada una difiere menos de 3 % de su rótulo.
2. Se traza el contorno de cada región y se simplifica a 4–12 vértices. A cada lote se le asigna el
   número que el plano dibuja en su círculo: exactamente uno por lote.
3. Los lotes vecinos se agrupan en 8 manzanas, con los tamaños exactos del cuadro, y cada una toma la
   letra del rótulo `MZ.X` más cercano. **Los 132 códigos coinciden con su superficie del cuadro
   oficial.**
4. Los vértices P1–P14 se calzan con sus coordenadas UTM: error máximo de 0.02 m y 0.3704 m por punto
   del PDF. El plano está orientado exactamente al norte.
5. Se detectan los 4 parques (7,524 m²; el plano declara 7,470.63), el reservorio (2,120 m²; plano:
   2,142), 8 bermas con palmeras en las alamedas y la franja de la Vía a San Nicolás.
6. Para llenar el lienzo horizontal sin tocar los estilos, el plano se gira 97° (el norte queda a la
   derecha y la vía abajo) y se escala a 1.52 unidades por metro.

Los scripts quedan en el repositorio. Desde una carpeta vacía generan un `plano.ts` **idéntico** al de
`src/content/` (verificado). Las instrucciones están en `scripts/plano/README.md`.

### En la web

- **`src/content/plano.ts` (nuevo, generado):**
  - contorno real de cada lote, con su punto de rótulo, tamaño de letra y ancho;
  - terreno, vía, parques, reservorio y bermas;
  - las 12 calles con nombre (Calle 1–12) y los rótulos de los parques (gimnasio, hamacas, juegos,
    campo multiuso, fogatas);
  - el pórtico de ingreso;
  - el rótulo y el encuadre de zoom de cada manzana;
  - el ángulo del norte.
- **`src/components/LotStack.tsx`:**
  - Se quitaron `ParcelGeom`, `MASTERPLAN_GEOM` y los encuadres a mano.
  - El `<svg>` dibuja ahora la geometría real: los lotes son `<path>` en lugar de `<rect>`.
  - Siguen igual los colores (`--plan-*`), el coloreo por disponibilidad, cuota o área, la promoción,
    el zoom y arrastre, el tooltip, la ficha, el trazo animado al entrar y la URL `?vista=&lote=`.
  - La rosa de los vientos gira con el plano.
  - El título de «Ver foto de referencia» dice ahora que la foto no está alineada al plano.
- **Avisos:**
  - El de `LoteDetalle.tsx` dice ahora «El plano reproduce el plano de lotización del proyecto y es
    referencial: confirma la ubicación, las medidas y la disponibilidad con un asesor».
  - Los dos de `Landing.tsx` (aviso del plano y pie) los cambió la otra sesión con el mismo texto, a
    pedido nuestro.
  - Regla de `DESIGN.md` §5 actualizada.
- **`scripts/check-source.mjs`:** prueba nueva. Exige un contorno por lote dentro del lienzo, con su
  superficie oficial (±8 %), un encuadre por manzana con la proporción del lienzo y que `LotStack` use
  `PLANO.lotes` y no el esquema viejo.

No se tocaron `globals.css` ni la portada (son de la otra sesión, 0016–0018).

## Archivos tocados

| Archivo | Cambio |
| --- | --- |
| `src/content/plano.ts` | Nuevo, generado |
| `src/components/LotStack.tsx` | Geometría y SVG del plano |
| `src/components/LoteDetalle.tsx` | Texto del aviso |
| `scripts/plano/*.py`, `scripts/plano/README.md` | Generador nuevo |
| `scripts/check-source.mjs` | Prueba de la geometría |
| `DESIGN.md` | Regla del plano |

## Cómo se verificó

- `TYPESCRIPT_PATH=<typescript 5.9.3> npm test`: **41 pasan, 1 falla**. La que falla es «Global Privacy
  Control», que ya fallaba antes de este cambio. La prueba nueva del plano pasa.
- `npx tsc --noEmit`: sin errores, con el árbol completo (incluido el trabajo de la otra sesión).
- `next dev` en el puerto 3300, con Chrome automatizado:
  - la portada muestra los 132 lotes con su forma real;
  - el rótulo «D» acerca la manzana y al tocar D21 se abren su tooltip, su ficha y la URL
    `?vista=D&lote=D21`;
  - `/lote/G18` abre el plano completo con G18 resaltado;
  - sin errores de consola;
  - a 390 px no hay desborde horizontal.
- Regeneración desde cero con los scripts del repositorio: resultado idéntico.

## Pendientes

- [ ] **Lista de estados actualizada.** La de la web es del 21/08/2026; el plano no trae estados. Pedir a
      Rosso la disponibilidad al día y actualizar `src/content/lotes.ts`.
- [ ] En celular el plano entero se ve chico, igual que el esquema anterior: se usa con los rótulos de
      manzana o con el zoom. Si se quiere, la otra sesión podría darle más alto al lienzo en pantallas
      angostas (es CSS de `globals.css`).
- [ ] La foto de dron superpuesta sigue sin alinearse al plano. Se podría alinear con los vértices UTM
      si se consigue una ortofoto georreferenciada.
- [ ] Publicación (dueño), junto con lo demás de la rama.
