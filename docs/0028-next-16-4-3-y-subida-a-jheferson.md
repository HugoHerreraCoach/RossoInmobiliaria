# 0028 · Next 16.4.3 y subida de 0016–0028 a `jheferson`

- **Fecha:** 2026-10-24
- **Rama:** `jheferson` (HugoHerreraCoach/RossoInmobiliaria).
- **Pedido del usuario:** «Actualiza, haz el commit y el push a Jheferson».

## Qué se hizo

### 1. Next 16.4.0 → 16.4.3

- La 16.4.0 tenía un aviso de seguridad crítico: el build se detenía una vez con `SecurityFatalError` y pedía
  actualizar (0027, punto 2). La 16.4.3 es la última de la serie 16.4.
- `npm install next@^16.4.3`: cambian `package.json` (`"next": "^16.4.3"`) y `package-lock.json` (3 paquetes). `npm`
  informa 0 vulnerabilidades.
- No hizo falta ningún cambio de código.

### 2. Commits y push

| Commit | Contenido |
|---|---|
| `9e54522` | `feat: portada segun diseno, landing /promocion y plano a pantalla completa (docs 0016-0027)`: todo el trabajo de las dos sesiones, desde la portada según los bocetos hasta la lista de producción |
| (este) | `chore(deps): Next 16.4.3 (docs 0028)` |

Antes del commit:
- `origin/main` y `origin/jheferson` seguían en `1be4da0`: no había cambios remotos que traer.
- Se revisó lo que se subía. No hay `.env*`, `.vercel/`, `.data/`, `__pycache__`, `.pyc` ni PDF (están ignorados o no
  existen) y no aparecen claves ni tokens en el diff.
- Las 7 imágenes nuevas de 0024 pesan entre 208 y 336 KB.

Push solo a `origin/jheferson`. No se tocó `main`, no se desplegó y no se cambiaron variables de producción.

## Cómo se verificó (con 16.4.3)

| Prueba | Resultado |
|---|---|
| `npm run build` | Termina al primer intento, sin `SecurityFatalError`; 151 páginas |
| `tsc --noEmit` | Sin errores |
| `npm test` | 42 pasan, 1 falla (Global Privacy Control, la misma de antes) |
| `next start`: `/`, `/promocion`, `/lote/G18`, `/privacidad`, `/panel` | 200 |
| Recorrido del plano (elegir lote → «Ver detalle de este lote» → botón flotante → «Consultar este lote») en `/` y `/promocion`, con y sin animaciones | Cada destino bajo la cabecera (84 px), el lote en el formulario, sin errores |
| Formularios | `/promocion`: la pregunta de modalidad sin opción marcada, aviso si no se elige, envía `respuestas.modalidad`; `/`: sin cambios |

## Pendientes (del dueño, ver `docs/0027`)

- Desplegar desde `jheferson` o fusionarla en `main`, como prefiera el dueño.
- La hoja de Lima: encabezados con MODALIDAD, compartida con la cuenta de servicio, y `GOOGLE_SHEETS_ID_PROMOCION`.
- La pestaña «LEADS TIKTOK» en la hoja de Lambayeque.
- En Vercel: las variables de los píxeles y `NEXT_PUBLIC_SITE_URL`; los tokens de CAPI y TikTok y
  `CONEXIGO_EMPRESA_ID` antes de las campañas; la tarea diaria a `/api/tracking/drain`.
- Conectar el WhatsApp 941 377 136 en ConexiGO.
