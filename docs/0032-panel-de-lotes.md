# 0032 · Panel de lotes: el administrador cambia el estado de cada lote y las landings lo muestran

**Fecha:** 2026-10-26 · **Rama:** `jheferson` (sobre 0031) · sin commit al cerrar este documento


> **Actualización (0033):** a pedido del usuario, los textos de la landing volvieron a como están en producción; respecto de
> producción solo cambia el dibujo del mapa.

## Qué se pidió

> «Y en /panel para el administrador que pueda ingresar a ver los lotes y que pueda marcar un lote como vendido y que
> no se muestre como disponible en las landing, pero que también pueda seleccionar uno que no esté disponible y
> pasarlo a disponible, por si un comprador se arrepienta.»

**Decisiones del usuario:**

- **Dónde se guarda:** en la base de datos. El dueño ejecuta una vez el SQL.
- **Estados:** disponible, reservado y vendido.
- **Precio al reabrir un vendido:** lo escribe el administrador.

## Cómo estaba

- Los 132 lotes, sus estados y precios vivían solo en `src/content/lotes.ts` (lista del 21/08/2026) y se fijaban al
  compilar. Cambiar un estado exigía editar el código y desplegar.
- Los lotes vendidos no tienen precio en la lista. Solo lo tienen los 70 disponibles.

## Cómo funciona ahora

1. **Entrar:** el administrador entra a `/panel` con la contraseña de siempre. En el menú hay una sección nueva,
   **«Lotes»**:
   - los 132 lotes con su estado actual, el de la lista y la cuota;
   - filtros por manzana, por estado o «Cambiados desde la lista», y búsqueda por código;
   - el conteo de disponibles, reservados y vendidos.
2. **Cambiar:** «Cambiar» → elige **Disponible, Reservado o Vendido** → «Guardar».
   - **Lote con precio en la lista:** se reabre con ese precio. Se puede marcar «Cambiar el precio de la lista».
   - **Lote sin precio en la lista** (un vendido que vuelve a estar disponible): el panel pide el **precio por m²**, la
     **inicial** y, opcional, la **promoción al contado**. Muestra la vista previa: financiado, 48 cuotas y contado.
     Sin precio no se publica.
   - **«Volver al estado de la lista»:** borra el cambio.
3. **Publicar:**
   - Al guardar, el servidor revalida `/`, `/promocion` y todas las `/lote/[id]`. La **próxima visita** ya ve el
     lote con su nuevo estado: el plano, la ficha, los conteos («N lotes disponibles») y los «desde» (cuota, inicial,
     contado) del texto, el chat y la descripción de la página.
   - No hace falta desplegar.
   - Por si una revalidación falla, las páginas se regeneran solas cada 5 minutos.

**Precios calculados con las reglas de la lista.** Se comprobaron en los 70 lotes con precio, sin diferencias:

| Valor | Regla |
| --- | --- |
| Financiado | m² × S/ por m² |
| Cuota | (financiado − inicial) / 48 |
| Contado | financiado − 15 % |

## Cambios

- **`src/content/lotes.ts`:**
  - `PrecioPanel` y `CambioLote` (los tipos de los cambios);
  - `precioDe()`, que aplica las reglas de arriba;
  - `aplicarCambios()`: la lista con los cambios. Solo los disponibles llevan precio, y uno sin precio no se publica
    disponible;
  - `catalogo()`: lotes, disponibles, «desde», contado mínimo, inicial mínima, conteos y `loteById`.
  - Las constantes de antes (`LOTES`, `DESDE`, etc.) quedan como la lista base.
- **`src/server/lotes.ts` (nuevo):** `lotesVigentes()` lee los cambios de la base y los aplica, una lectura por
  solicitud. **Si la base no responde, devuelve la lista**: la landing nunca se cae por esto. Por ejemplo, al
  compilar sin `DATABASE_URL`.
- **`src/components/LotesProvider.tsx` (nuevo):** contexto que reparte los lotes vigentes a los componentes de
  cliente. Sin proveedor, la lista.
- **Páginas** (`/`, `/promocion`, `/lote/[id]`):
  - son `async`, leen `lotesVigentes()` y tienen `revalidate = 300`;
  - el layout calcula su descripción («Desde S/ … al mes») con los lotes vigentes.
- **Componentes:**
  - `Landing.tsx` recibe `lotes`, calcula todo con `catalogo()` y envuelve la página en `LotesProvider`. Textos: «lotes
    disponibles» (antes «… en la lista») y, en el pie, «según la lista del 21/08/2026 y sus actualizaciones».
  - `LotStack.tsx` (plano y ficha), `AsesorFlotante.tsx` (montos «desde» del chat) y `ContactForm.tsx` (lote elegido)
    usan `useLotes()`.
- **API `src/app/api/panel/lotes/route.ts` (nueva):**
  - **`GET`:** lista para el panel. Solo con la sesión del administrador; si no, 401.
  - **`POST`:** exige origen propio (si no, 403), sesión del administrador (401) y un límite de 60 por minuto.
    - Valida el código, el estado y los montos: precio por m² de 1 a 5000; inicial menor que el financiado;
      promoción menor que el contado.
    - Si se pide disponible para un lote sin precio en la lista, exige el precio.
    - Guarda (`lot_set`), revalida las páginas y devuelve la lista. `{ restaurar: true }` borra el cambio.
- **Base (`db/schema.sql`):**
  - un nuevo `kind` `'lot'` en `rosso_tracking_records`. En una base ya instalada, el `check` de `kind` se reemplaza
    sin importar el nombre que le haya dado Postgres;
  - dos acciones nuevas en `rosso_tracking`: `lots` (lee todos los cambios) y `lot_set` (guarda o borra uno);
  - `prune` no toca los lotes;
  - el archivo sigue pudiendo ejecutarse más de una vez.
- **`src/server/store.ts`:** las mismas dos acciones en el modo archivo, el que se usa en desarrollo y en las pruebas.
- **Panel:**
  - `src/components/panel/LotesPanel.tsx` (nuevo);
  - el enlace «Lotes» y la sección en `AnalyticsPanel.tsx`;
  - los estilos en `src/app/panel/panel.css`.
- **Pruebas (`scripts/check-source.mjs`):** se sustituye `next/cache` por un doble que registra las revalidaciones.
  Hay tres pruebas nuevas:
  1. **Reglas de precio:** `precioDe()` reproduce los 70 precios de la lista. `aplicarCambios()` no publica sin
     precio, reabre A1 con su precio y deja G18 vendido sin precio. El «desde» cambia y un catálogo vacío no se cae.
  2. **API del panel:**
     - sin sesión, 401; con otro origen, 403;
     - A1 sin precio, un código inexistente, un estado inventado o una inicial imposible: 422, y no se guarda nada;
     - A1 con precio y G18 vendido: 200, se revalidan las tres rutas y `lotesVigentes()` ve los cambios;
     - restaurar los dos los devuelve a la lista;
     - el `GET` trae los 132 lotes.
  3. **Revisión estática:** las tres páginas leen `lotesVigentes` y revalidan; el plano, el chat y el formulario usan
     `useLotes()`; el SQL tiene las acciones nuevas y `prune` no toca los lotes.

## Cómo se verificó

- `npx tsc --noEmit`: sin errores.
- `TYPESCRIPT_PATH=<typescript 5.9.3> npm test`: **45 pasan, 1 falla**. Falla «Global Privacy Control», la de
  siempre.
- **`next dev` con Chrome automatizado, en modo archivo** (`.data/`), con una contraseña de prueba solo para esa
  sesión, ya borrada:
  - el panel muestra «Lotes» con 132 filas y «70 disponibles · 1 reservados · 61 vendidos»;
  - **A1** (vendido sin precio): se eligió Disponible y el panel pidió el precio. Con S/ 42 por m² y S/ 3,000 de
    inicial, la vista previa dio financiado S/ 23,016.00, 48 cuotas de S/ 417.00 y contado S/ 19,563.60. Se guardó
    y quedó Disponible;
  - **G18** → Vendido;
  - **en `/`:** el plano muestra A1 disponible y G18 vendido, y la ficha arranca en G20, el nuevo disponible con la
    cuota más baja;
  - **en `/lote/A1`:** la ficha dice «Disponible»;
  - los dos se restauraron con la API: sin cambios guardados.
- `next build` (Next 16.4.3), sin `DATABASE_URL` en local: **terminó sin errores**, 152 páginas.
  - `/` y `/promocion` quedan estáticas con revalidación cada 5 minutos (`○ … 5m`).
  - Las 132 `/lote/[id]` se generan de antemano con la misma revalidación (`● … 5m`).
  - `/api/panel/lotes` es dinámica.
  - Sin base, cada página usó la lista, como estaba previsto. El aviso de respaldo salía una vez por página; se
    dejó en una vez por proceso.

## Lo que tiene que hacer el dueño

1. **Ejecutar otra vez `db/schema.sql`** en la base de ConexiGO, como el rol `landing_rosso`. Agrega el `kind` `lot` y
   las acciones; no borra nada. Sin esto, guardar un estado en el panel da 503 («Base de rastros no disponible») y las
   landings siguen mostrando la lista.
2. Fusionar `jheferson` y desplegar.
3. Probar: cambiar un lote en `/panel`, abrir la landing en una ventana privada y comprobar el cambio. Luego volverlo
   a la lista.

## Limitaciones

- **Precios:** el chat y los textos «desde» se recalculan, pero la ficha del rediseño no muestra precios por lote.
  Las preguntas del formulario («S/ 3,000 a S/ 10,000», «Al contado S/ 17,000», «Financiado desde S/ 3,000») siguen
  con los montos de la lista: el servidor valida las respuestas contra esos textos exactos y no conviene que cambien
  solos.
- **Si se venden todos:** si no quedara ningún lote disponible, los «desde» de la portada mostrarían los de la lista.
- **Una sola contraseña:** el panel tiene una sola contraseña de administrador. Cada cambio guarda su fecha
  (`actualizado`), pero no quién lo hizo.
