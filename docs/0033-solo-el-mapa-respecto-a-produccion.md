# 0033 · Respecto de producción, en la landing solo cambia el mapa

**Fecha:** 2026-10-26 · **Rama:** `jheferson`

## Qué se pidió

> «me gusta la distribución que han hecho en el croquis así que solamente cambia el mapa la descripción que muestra
> ahora en producción al seleccionar un lote déjala, solamente cambia el mapa después deja todo tal cual está ahora
> producción»

## Qué se hizo

Se comparó `jheferson` (`e005923`) con `main` (`6c0b2b4`, lo que está en producción). Además del dibujo del mapa
(0031), había tres textos visibles distintos, y volvieron a como están en producción:

| Dónde | En `jheferson` | Vuelve a (producción) |
| --- | --- | --- |
| Cifra de «Por qué» (`Landing.tsx`) | «lotes disponibles» (0032) | «lotes disponibles en la lista» |
| Pie (`Landing.tsx`) | «…según la lista del 21/08/2026 y sus actualizaciones…» y «El plano interactivo se basa en el plano de lotización oficial y no lo sustituye» (0031, 0032) | «…según la lista del 21/08/2026…» y «El plano interactivo es un esquema y no sustituye al plano oficial» |
| Título del botón «Ver foto de referencia» (`LotStack.tsx`) | «no está alineada al plano» (0031) | «no está georreferenciada ni alineada al esquema» |

**Lo que queda distinto de producción:**

- **A la vista:** solo el mapa. Es el SVG de `LotStack.tsx` con el plano de lotización oficial (`plano.ts`); el
  esquema dibujado a mano sale.
- **Cosas que no se ven:**
  - el evento `Contact` de `/promocion` (0030);
  - el panel de lotes en `/panel` (0032);
  - la lectura de los lotes vigentes en las páginas. Mientras nadie cambie un lote en el panel, da los mismos números
    que la lista.

Si el usuario también quiere sacar esto, se quita aparte.

## Cómo se verificó

- `npx tsc --noEmit`: sin errores. `npm test`: 45 pasan y falla «Global Privacy Control», la de siempre.
- `git diff origin/main` sobre `Landing.tsx` y `LotStack.tsx`: ya no queda ningún texto visible distinto fuera del
  SVG del mapa.
- **Chrome automatizado, a 1440 px:** se compararon el `next dev` local y `https://rossoinmobiliaria.conexigo.com`.
  En los dos se tocó D21:
  - ficha idéntica: «Manzana D · Lote D21 · Disponible · Ubicación disponible… · Financiamiento directo hasta en 48
    cuotas sin intereses · Descuento especial por pago al contado · Un asesor…»;
  - la misma barra («Disponibles (70) · Ver foto de referencia») y la misma leyenda;
  - en la captura lado a lado solo cambia el dibujo del mapa.
