# 0002 — Contexto de producto (`/impeccable init`) → PRODUCT.md

**Fecha:** 2026-10-08

## Qué se hizo
Se corrió `/impeccable init`. Se exploró el proyecto (solo existe `Recursos/` con un ZIP de ~2 GB de drone, avances de obra y fotos de Campiña), se entrevistó al usuario en dos rondas y se escribió `PRODUCT.md` en la raíz.

## Por qué
Impeccable necesita PRODUCT.md (la información del producto que no cambia) antes de diseñar cualquier página, para no inventar público, diferencial ni datos.

## Decisiones confirmadas por el usuario
- Alcance: web **solo del proyecto Campiña** (venta de **lotes**).
- Tres compradores: inversionista local (35–70), comprador para vivir (45–65), inversionista a distancia en Lima/Trujillo (35–55).
- Diferenciales: obra visible y avanzada, ubicación y entorno, precio y financiamiento, trayectoria de la empresa.
- Contacto: WhatsApp, formulario a CRM, agendar visita y llamada.
- Stack: **Next.js / React**, hosting **Vercel**.
- No hay generación de imágenes en este equipo, así que el trabajo empieza directo en código (no se guardó `buildPath`). El modo live no se configuró porque aún no hay app que ejecutar.

## Archivos tocados
- `PRODUCT.md` (nuevo)

## Cómo se verificó
Se revisó el contenido del ZIP con `unzip -l`. Las respuestas del usuario quedaron registradas tal cual en PRODUCT.md, y lo que no se confirmó quedó marcado como pendiente.

## Pendientes
- Documento con los datos de respaldo (años de Rosso, proyectos entregados, precio, cuota, plazo, % de avance, fecha de entrega, documentación legal): el usuario indicará dónde está.
- Ubicación exacta del proyecto; tamaños y número de lotes; amenidades.
- Números de WhatsApp y teléfono; CRM de destino del formulario; mecanismo para agendar visitas.
- Logo, colores y voz de marca.
