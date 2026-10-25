# 0020 · Cotejo de la información de la landing con el Drive del proyecto

**Fecha:** 2026-10-24 · Solo revisión: no se cambió la web en este paso.

## Qué se pidió

> «Después que termines de dibujar, revisa y coteja toda la info de la landing si es que es verídica
> usando como información de la carpeta de google drive»

## Cómo se hizo

- **Texto revisado:** el texto visible de `/`, `/promocion` (mismo texto), `/lote/G18` y `/privacidad`,
  leído con Chrome automatizado sobre `next dev`. También se leyó `src/components/Landing.tsx`, porque
  las pestañas y las preguntas no se ven todas a la vez.
- **Fuentes en la carpeta «2. ROSSO INMOBILIARIA»:**
  - «Info Corta ROSSO.docx» (actualizado el 21/10/2026);
  - «Info Extendida» (ficha del proyecto llenada por Rosso);
  - «Briefing-Comercializacion.pdf» (llenado por el dueño el 03/10/2026);
  - «PRECIOS LA CAMPIÑA ACTUALIZADO 21.08.26 ASESORES.xlsx»;
  - el plano PTL-01 (0019).
- **Fuente adicional:** para los tiempos de viaje, «Copys del Área comercial» (carpeta «La campiña» de
  marketing@rosso.pe).

## Coincide

| Dato en la landing | Fuente |
| --- | --- |
| 132 lotes de 510 m² a 1,658 m²; los códigos y las áreas de cada lote | Plano PTL-01 (0019) |
| 70 disponibles, 61 vendidos, 1 reservado; precio, inicial, cuota y contado de cada lote | Lista del 21/08/2026 (los 132 lotes). Info Corta del 21/10 también dice 70 disponibles |
| 48 cuotas sin intereses, financiamiento directo | Info Corta, Info Extendida |
| Inicial desde S/ 3,000 | Info Corta, lista de precios |
| Contado ~15 % menos; promoción desde S/ 17,000 en 19 lotes | Info Corta, Info Extendida, Briefing, lista |
| Entrega julio 2027 | Info Corta, Info Extendida, Briefing, Copys |
| «Club de campo privado y ecológico» | Info Corta |
| Vía a San Nicolás, Valle de Zaña, Lambayeque | Plano (distrito Zaña, provincia Chiclayo), Info Extendida |
| 35 min de Chiclayo, 6 min de Saltur, 8 min de Cayaltí | Copys del Área comercial |
| Pórtico, cerco, cancha de grass natural, parrillas, hamacas, juegos, gimnasio, agua de pozo tubular, vías con iluminación solar | Info Corta, Info Extendida, Copys |
| WhatsApp de asesores 941 377 136 | Briefing |
| Fechas de fotos, videos y del avance de obra (las tarjetas y el cronograma coinciden) | Metadatos de cada archivo (`src/content/avance.ts`, 0004) |

## Para corregir o confirmar con Rosso

1. **Escritura pública sin independización.** Info Extendida dice: «Se entrega escritura pública sin
   inscripción registral, es decir no entregamos los lotes independizados». También pide que no se
   prometan «servicios básicos, independización, agua potable».
   - Hoy la web no promete independización, pero la pestaña **«Papeles claros»** y la pregunta «¿Los
     lotes tienen escritura pública? Sí…» pueden hacer creer que el título queda inscrito.
   - Sugerencia: cambiar «Papeles claros» por «Documentos» y decir con claridad que la escritura se
     entrega sin inscripción registral. El texto final lo decide Rosso.
2. **La página de privacidad no describe la web actual.**
   - Habla de un aviso con «Solo medición» y «Aceptar todo», y de píxeles solo con permiso. Hoy la web
     mide sin aviso y carga los píxeles de Meta y TikTok desde el inicio (0008, 0013).
   - Muestra notas internas: «El responsable comercial del proyecto debe completar…».
   - No identifica al responsable. El Drive lo da: **NR Inversiones Inmobiliarias SAC** (razón social de
     Rosso Inmobiliaria), proyectos@rosso.pe.
   - Hay que reescribirla y que Rosso la apruebe.
3. **Tiempo a Chiclayo.** Las fuentes no coinciden: Copys dice 35 min; Info Corta (la más nueva) dice
   30 min; Info Extendida dice 35/40. La web dice 35.
4. **Sin fuente que lo confirme:** «Visitas guiadas los fines de semana» y la videollamada. En Info
   Extendida no se puede leer qué casillas marcaron («Atienden fines de semana»).
5. **Nombres de las áreas comunes en el plano.** Los rótulos del plano oficial dicen «Campo multiuso» y
   «Fogatas». La lista comercial dice «Cancha de grass natural» y «Zona de parrillas». Conviene usar
   los mismos nombres.
6. **Inicial.** El Briefing (03/10) decía S/ 2,000; la lista y la Info Corta (21/10) dicen S/ 3,000. La
   web usa S/ 3,000.
7. **Disponibilidad.** La lista es del 21/08/2026. Info Corta del 21/10 sigue diciendo 70 disponibles,
   pero conviene pedir la disponibilidad al día.

## Datos del Drive que la web no usa (opcionales)

- Separación desde S/ 200.
- 4 parques, 3 de ellos de más de 1,500 m².
- Vías de 12 m con separador de palmeras.
- Sol todo el año, zona no inundable y suelo sin salitre.
- A 20 min de la Panamericana Norte (Mocupe).
- Cerca del corredor Pomalca–Sipán. Info Corta dice «a 5 min de Sipán»; habría que confirmarlo antes
  de usarlo.

## Pendientes

- [ ] Decidir con Rosso los textos de los puntos 1 a 4.
- [ ] Unificar los nombres de las áreas comunes (punto 5, en `plano.ts`).
