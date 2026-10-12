# DESIGN.md — La Campiña · Rosso Inmobiliaria

## 1. Dirección estética: Arquitectura Residencial & Editorial Contemporánea

El diseño reemplaza por completo el antiguo lenguaje de "cartel de obra" por un portal inmobiliario de alto valor percibido, inspirado en dos referentes de desarrollos campestres y residenciales:

1. **Grupo DLC (`grupodlc.conexigo.com` — Finca Algarrobo):**
   - Superficies arquitectónicas oscuras en el Hero y en el Masterplan (`#061510` / `#0b221a`) con barra de navegación flotante translúcida (`backdrop-filter: blur(18px)`).
   - Píldoras de valor con íconos de verificación, métricas clave en tarjetas de cristal (`hero-kpi`), visor multimedia interactivo con tira de miniaturas (`HeroCarousel.tsx`) y tarjeta blanca elevada de conversión inmediata (`hero-form-card`) junto al titular principal.
   - Pestañas interactivas de resolución de objeciones (`WhyProjectTabs.tsx`).
2. **Grupo GEA (`gpogea.mx` — Desarrollos Mahal / Wayúum / Gran Telchac):**
   - Contraste armónico entre secciones oscuras de impacto y secciones editoriales cálidas (`#f5f4ef` travertino / marfil), titulares con acentos en serif cursiva (`Cormorant Garamond`), presentación por tipologías de lotes (Estándar 510 m², Frente a Parque y Macrolotes de hasta 1,658 m²), grilla Bento de amenidades e integración de Masterplan interactivo.

---

## 2. Sistema de doble paleta en vivo (`?paleta=proyecto | rosso`)

Se mantiene la capacidad de alternar en vivo entre las dos identidades cromáticas sin parpadeo:

### Paleta 1 · `data-paleta="proyecto"` (Verde La Campiña · Esmeralda & Oro Botánico)
- **Superficies oscuras (`--dark-bg` / `--dark-surface`):** `#061510` / `#0b221a`
- **Superficies editoriales claras (`--ground` / `--paper`):** `#f5f4ef` / `#ffffff`
- **Color primario de marca (`--brand-primary`):** `#006f55`
- **Acento luminoso y CTAs (`--accent`):** `#a6c138` (texto `--accent-ink: #062319`)
- **Semántica del Masterplan:** Disponible `#10b981`, Reservado `#f59e0b`, Vendido `#1e352d`

### Paleta 2 · `data-paleta="rosso"` (Marca Rosso Inmobiliaria · Obsidiana, Arena & Terracota Coral)
- **Superficies oscuras (`--dark-bg` / `--dark-surface`):** `#110c0e` / `#1b1316`
- **Superficies editoriales claras (`--ground` / `--paper`):** `#f8f5f2` / `#ffffff`
- **Degradado primario (`--brand-gradient`):** `linear-gradient(115deg, #e8601a 0%, #e0284f 100%)`
- **Acento y CTAs (`--accent`):** `#e8601a` (texto `--accent-ink: #ffffff`)

---

## 3. Tipografía

Cargada mediante `next/font/google` en `src/app/layout.tsx`:
- **Display Geométrica (`--font-display`):** `Outfit` (pesos 400–800) para titulares, KPIs, botones, pestañas y códigos de lote.
- **Editorial Serif (`--font-serif`):** `Cormorant Garamond` (500–700, normal e itálica) para énfasis editorial en titulares (`h1 em`, `h2 em`) y numeración de pasos.
- **Cuerpo y Tablas (`--font-body`):** `Plus Jakarta Sans` (400–700) con `font-variant-numeric: tabular-nums` para precios, áreas y simulaciones de cuotas.

---

## 4. Componentes clave

- **`LotStack.tsx` (Masterplan Interactivo en SVG + Cuadrícula Comparativa):**
  - Lienzo vectorial `SVG` (`viewBox="0 0 1160 760"`) con las 8 manzanas (`A`–`H`) y los **132 lotes individuales** (`A1`..`H10`), alameda central con iluminación solar, pórtico de ingreso sobre la vía a San Nicolás y el Gran Parque Central (cancha de grass natural, zona de parrillas, hamacas, juegos para niños, gimnasio al aire libre y pozo tubular).
  - Controles de **Zoom & Pan** (arrastre con mouse + botones `+`, `-`, `Reset` y enfoque automático al elegir cualquier manzana `Mz A`–`Mz H`).
  - **Superposición de Toma de Drone Real (`Ver Toma Drone Real`):** Permite superponer y regular la opacidad de la foto aérea real (`/media/hero.webp`) sobre el plano vectorial.
  - **Modos de color:** Por disponibilidad, mapa de calor por cuota mensual o por superficie (`m²`).
  - **Filtros en vivo:** Buscador por código (`G18`, `C3`, `F11`), filtro de solo disponibles, filtro de Bono Promo Contado y filtro por cuota mensual máxima.
  - Exporta también `MiniMasterplan` para resaltar la ubicación exacta de cada lote en `/lote/[id]`.
- **`Ficha.tsx` (Expediente Técnico & Simulador Financiero 0% Interés):**
  - Permite alternar entre **Financiado 0% Interés** y **Al Contado (-15% / Promo)**.
  - Incluye deslizador interactivo de **Cuota Inicial** y selector de plazo (`12`, `24`, `36`, `48 cuotas`), recalculando la cuota mensual en tiempo real y sincronizando con WhatsApp o el formulario de asesores (`campina:lote`).
- **`HeroCarousel.tsx`:**
  - Visor multimedia en el Hero con reproducción de video de drone `.mp4` en línea y 5 miniaturas interactivas fechadas.
- **`WhyProjectTabs.tsx`:**
  - Pestañas interactivas para explorar tipologías de lotes, financiamiento directo, respaldo legal con escritura pública y ubicación en el Valle de Zaña.
- **`Schedule.tsx`:**
  - Línea de tiempo interactiva (abril 2026 – entrega julio 2027) y bitácora con los 9 registros reales de drone y tierra.
