# 0004 — Landing de La Campiña (v1)

**Fecha:** 2026-10-08

## Qué se hizo
- Ronda de dirección de Impeccable (semilla `cddc6e02`): el usuario eligió **Pila HyperCard**, adaptado a una sola tinta de marca (#006F55 sobre blanco, tramado de puntos y lima #A6C138 solo en la acción principal). El contrato está en `.impeccable/surfaces/src-app-page-tsx.md`.
- Proyecto Next.js 16.4 + TypeScript (`src/`), listo para Vercel.
- Datos:
  - `src/content/lotes.ts`: los 132 lotes de la lista del 21.08.26, con 70 disponibles. Se verificaron las 70 cuotas y los 70 precios al contado: cero diferencias.
  - `proyecto.ts`: los contactos que valen `null` están PENDIENTES.
  - `avance.ts`: tomas reales con su fecha de grabación (11 abr, 25 jun, 21 jul y set 2026).
- Medios (`npm run assets`, `scripts/build-assets.mjs`):
  - En las tomas aéreas, las líneas de cal se detectan y se pintan en tinta sólida, como un plano dibujado sobre el terreno.
  - El tramado Atkinson se calcula en el navegador al tamaño real en pantalla, con puntos de 2 px (`src/components/dither.ts`). Queda un PNG pre-tramado de respaldo.
  - Clips mp4 livianos y la silueta real de los cerros.
  - Cada imagen lleva su procedencia incrustada (`impeccable embed-prompt --scan public/media`: 0 faltantes).
- Página de 8 tarjetas:
  - Inicio, ¿Qué buscas?, Avance, Lotes, Cómo pagar, Ubicación, Áreas comunes y Contacto.
  - Lotes: pila por manzana, ficha del lote y orden por cuota.
  - Áreas comunes: lista "ya en el terreno" frente a "por entregar".
  - Barra inferior de navegación "n de 8".
- `/lote/[id]`: 132 fichas estáticas para compartir por WhatsApp.
- `/api/lead`: reenvía a `LEAD_WEBHOOK_URL`. Si no está configurado, responde 503 y el formulario lo avisa.
- Tipografía: Bitcount Prop Single (ejes ELSH, CRSV y ELXP en 0, píxel cuadrado) para títulos y Atkinson Hyperlegible para el texto.
- `scripts/capture.mjs`: capturas de revisión con Chrome headless, sin dependencias.

## Cómo se verificó
- `npm run build` OK (136 páginas).
- `impeccable detect`: sin hallazgos.
- Dos rondas de capturas en escritorio (1440 px) y celular (390 px), en `.impeccable/review/`. Se corrigieron:
  - números ilegibles de Pixelify Sans → se cambió a Bitcount;
  - desborde horizontal en celular;
  - "S/" separado de la cifra;
  - espacio excesivo entre palabras.
- Revisión final con el agente `impeccable-finish-reviewer`, veredicto **fix** con 8 correcciones:
  1. imagen principal ilegible;
  2. grilla de íconos de áreas comunes;
  3. botones con palabras pegadas;
  4. texto bitmap chico demasiado fino;
  5. pestañas de manzana;
  6. silueta de cerros cortada;
  7. título repetido en la portada;
  8. menú marcando la sección equivocada.

  Tras aplicarlas, el mismo revisor las dio todas por resueltas: veredicto **ship**.
- `DESIGN.md` y `.impeccable/design.json` escritos por el agente `impeccable-documenter` a partir del código y las capturas finales. Contienen la paleta de una tinta, la escala tipográfica, los bordes, el movimiento, los componentes y las reglas con nombre. Detalles menores que registró sin corregir: `--teal` y `--ease-out` declarados pero sin uso, opacidad en botones deshabilitados y placeholders, y estilos inline en page.tsx.
- Sin capturar: el estado "formulario sin CRM" y las animaciones (disolución y revelado a color).

## Pendientes
- Datos:
  - número de WhatsApp y teléfono (`src/content/proyecto.ts`);
  - CRM (`LEAD_WEBHOOK_URL` en Vercel);
  - enlace de Google Maps;
  - Libro de Reclamaciones;
  - logos y renders;
  - plano (el mapa de manzanas es un esquema hasta tenerlo).
- Descargar del Drive a `Recursos/` las carpetas Renders, Logo, Planos, Fotos del proyecto, Diseños y Videos.
- La toma del 25 jun en "Avance" muestra la cal solo en su tercio derecho; reemplazarla cuando haya una toma más cercana.
