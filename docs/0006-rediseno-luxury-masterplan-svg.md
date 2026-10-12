# 0006 — Rediseño integral Luxury Real Estate + Masterplan Interactivo en SVG

**Fecha:** 2026-10-12

## Qué se hizo
- Se rediseñó por completo la landing de **La Campiña — Rosso Inmobiliaria**, reemplazando el estilo anterior de "cartel de obra" por un sistema de diseño residencial y editorial contemporáneo tomando como referencia:
  1. `https://grupodlc.conexigo.com/` (Finca Algarrobo — Grupo DLC): Hero oscuro arquitectónico, navegación flotante con desenfoque (`backdrop-blur`), píldoras de beneficios, carrusel multimedia con tira de miniaturas (`HeroCarousel.tsx`), tarjeta de conversión directa en el Hero y pestañas interactivas de valor (`WhyProjectTabs.tsx`).
  2. `https://www.gpogea.mx/` (Grupo GEA Desarrollos — Mahal / Wayúum): Contraste editorial con tipografía serif cursiva (`Cormorant Garamond` + `Outfit` + `Plus Jakarta Sans`), presentación por tipologías de lotes (Estándar 510 m², Frente a Parque y Macrolotes de hasta 1,658 m²), Bento Grid de las 9 amenidades y experiencia de Masterplan interactivo.
- **Masterplan Interactivo de Lotes en SVG (`src/components/LotStack.tsx`):**
  - Plano vectorial interactivo con las 8 manzanas (`A`–`H`) y los **132 lotes individuales** (`A1`..`H10`) posicionados según la geometría del terreno trazado en obra (`hero.webp`), incluyendo la Vía a San Nicolás, el Pórtico de Ingreso, la Alameda Central con iluminación solar y el Gran Parque Central (cancha de grass natural, zona de parrillas, zona de hamacas, juegos para niños, gimnasio al aire libre y pozo tubular).
  - Controles de **Zoom y Pan** (arrastre con mouse, botones `+`, `-`, `Reset` y enfoque automático al seleccionar cada manzana `Mz A`–`Mz H`).
  - **Superposición de Toma de Drone Real:** Botón y control deslizante de opacidad para superponer la fotografía aérea real (`/media/hero.webp`) directamente sobre el plano SVG.
  - **Modos de coloreado:** Por disponibilidad (`70 libres`, `1 reservado`, `61 vendidos`), por tramo de cuota mensual o por superficie (`m²`).
  - **Buscador y filtros en vivo:** Búsqueda instantánea por código de lote (`G18`, `C3`, `F11`), filtro de solo disponibles, filtro de Bono Promo Contado y filtro por cuota máxima mensual, además de conmutador entre **Plano Masterplan SVG** y **Cuadrícula Comparativa**.
- **Simulador Financiero 0% Interés en la Ficha Técnica (`src/components/Ficha.tsx`):**
  - Al tocar cualquier lote en el Masterplan, el panel lateral permite alternar entre **Financiado 0% Interés** y **Al Contado (-15% / Promo)**, ajustar la cuota inicial con un control deslizante y elegir el plazo (`12`, `24`, `36` o `48 cuotas`), recalculando la cuota mensual exacta en tiempo real.
- **Páginas individuales `/lote/[id]` (`src/app/lote/[id]/page.tsx`):**
  - Actualizadas al nuevo diseño e integradas con el componente `MiniMasterplan` que resalta la posición exacta del lote dentro del plano general.
- **Sistema de doble paleta conservado (`?paleta=proyecto | rosso`):**
  - Ambas paletas (`Proyecto` en verde esmeralda/lima dorada y `Rosso` en obsidiana/terracota coral) funcionan en vivo sobre la nueva arquitectura visual.

## Archivos tocados
- `src/app/layout.tsx`
- `src/app/tokens.css`
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/app/lote/[id]/page.tsx`
- `src/components/LotStack.tsx`
- `src/components/Ficha.tsx`
- `src/components/HeroCarousel.tsx` (nuevo)
- `src/components/WhyProjectTabs.tsx` (nuevo)
- `src/components/ContactForm.tsx`
- `src/components/Schedule.tsx`
- `src/components/Icon.tsx`
- `DESIGN.md`

## Cómo se verificó
- `npx tsc --noEmit`: 0 errores de tipos.
- `npm run build`: Compilación estática exitosa de las 136 rutas (`/`, `/api/lead` y los 132 expedientes `/lote/A1`..`/lote/H10`).
- Verificación visual y de accesibilidad en escritorio y móvil con ambas paletas (`proyecto` y `rosso`).

