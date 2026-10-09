# 0005 — Cambio de estilo: Cartel de obra con dos paletas (Proyecto / Rosso)

**Fecha:** 2026-10-08

## Qué se hizo
- El usuario pidió cambiar el estilo de la web. Se volvió a mostrar la ronda de dirección de Impeccable (semilla `cddc6e02`) y eligió **Cartel de obra**. Además pidió **dos paletas** para presentarle la propuesta al cliente:
  1. **Proyecto:** #006F55 / #349C80 / #A6C138 (manual de La Campiña).
  2. **Rosso** (marca de la empresa): degradado naranja → coral, gris del edificio y blanco, con el logotipo "ROSSO · LIVE YOUR WAY".
- Las paletas se eligen en vivo con el selector **Paleta: Proyecto | Rosso** de la franja superior, o por enlace: `?paleta=proyecto` / `?paleta=rosso`. Se recuerda por visitante y se aplica antes del primer pintado, sin parpadeo.
- Se reconstruyó la capa visual sobre los mismos datos y lógica:
  - **Cartel principal:** banda de color con el titular expandido y tabla de campos (Proyecto, Ubicación, Cuota desde, Financiamiento, Entrega, Título). Lleva la foto de drone con sello de fecha, la placa del promotor ROSSO y dos postes plantados en una línea de suelo.
  - **Avance de obra:** cronograma desde abril de 2026 hasta la entrega en julio de 2027, con cada toma en su fecha real y la marca de HOY. Al tocar un hito se abre su foto o video.
  - **Lotes:** tablero de manzanas. Libre = papel, reservado = rayado, vendido = sólido. Ficha técnica por lote con su enlace propio.
  - **Resto de secciones:** ¿Qué buscas? como tira reglada, cómo pagar en filas regladas, ubicación con barras de minutos, áreas comunes (lo hecho y lo que viene) y contacto.
  - **Celular:** barra fija "Lotes | Asesor".
- **Tipografía:** Archivo variable con eje de ancho (rótulos al 72, texto al 100, titulares al 125, que recuerda al logotipo de ROSSO).
- **Fotos:** van a color, que es lo propio de un cartel de obra. Se quitó el tramado.
- **Archivos:**
  - Se eliminaron los componentes de HyperCard: `PixelIcon`, `Ridge`, `dither.ts`, `StackNav` y `Reveal`.
  - Componentes nuevos: `Photo`, `Schedule`, `PaletaSwitch`, `NavCurrent` e `Icon`.
- **Rosso para pantalla:** el degradado es un paso más profundo que el del logo (#E8601A → #E0284F) para que el texto blanco tenga contraste suficiente.

## Archivos tocados
- `src/app/tokens.css`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/lote/[id]/page.tsx`
- `src/components/` (nuevos y reescritos)
- `src/content/avance.ts` (fechas ISO para el cronograma)
- `scripts/build-assets.mjs` (solo color + clips + procedencia)
- `scripts/capture.mjs` (captura de pantalla visible real)
- `.impeccable/surfaces/src-app-page-tsx.md` (nuevo contrato de dirección)
- `DESIGN.md` y `.impeccable/design.json` (reescritos por el documentador)

## Cómo se verificó
- `npm run build`: OK, 136 páginas.
- `impeccable detect`: solo avisos menores, medidos contra el DESIGN.md anterior.
- Procedencia de imágenes: 9 de 9.
- Capturas de escritorio y celular con las dos paletas, en `.impeccable/review/`.
- Revisión final del agente `impeccable-finish-reviewer`:
  - Primer veredicto: **fix**, con 8 correcciones (logotipo Rosso ausente, rayado de "reservado" invisible, barra de celular sin evidencia, hitos superpuestos en celular, antetítulo de fecha, franja lateral, pasos en cajas anidadas, "cuota" sin "desde").
  - Se aplicaron todas y se recapturó. El veredicto final es **ship**.

## Pendientes
- Archivo del logo de Rosso: hoy el logotipo está compuesto en texto.
- WhatsApp, teléfono, CRM (`LEAD_WEBHOOK_URL`), enlace de Google Maps, Libro de Reclamaciones, renders y plano.
- Sin capturar: el estado "formulario sin CRM" y la reproducción de video.
