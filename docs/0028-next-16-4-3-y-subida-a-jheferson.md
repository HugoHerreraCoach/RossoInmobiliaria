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

## Prueba en producción (después del despliegue)

El usuario desplegó y pidió «lanza la prueba» con datos «Prueba de Jhef» y 999999999. Antes se comprobó que producción
tenía la versión nueva: `/`, `/promocion` y `/lote/G18` responden 200 y `/promocion` trae la pregunta de modalidad.
Se envió un formulario en cada landing desde Chrome, con `?utm_source=prueba&utm_campaign=prueba-pixel` para que la
fila se reconozca en la hoja:

| Landing | /api/lead | Meta | TikTok |
|---|---|---|---|
| `/` (Lambayeque), inicial «S/ 3,000 a S/ 10,000» | 200, registro `7ce0b7e3-25b4-41b4-8a2e-8c25385d835b` | PageView, **CompleteRegistration** | LandingPageView, Pageview, **CompleteRegistration**, EngagedSession |
| `/promocion` (Lima), «Financiado desde S/ 3,000» | 200, registro `4e262a3a-e1e0-4b80-937d-5ce2ed361533` | PageView, **SubmitApplication** | LandingPageView, Pageview, **SubmitApplication**, EngagedSession |

Las dos hojas confirmaron la fila (el evento solo sale después de esa confirmación) y la página mostró «Solicitud
recibida». Las dos filas de prueba quedan en las hojas con la campaña «prueba-pixel»; se pueden borrar.

## Pendientes (del dueño, ver `docs/0027`)

Resueltos por la prueba: el despliegue, la hoja de Lima (guarda), la pestaña «LEADS TIKTOK» de Lambayeque (ahí cayó la
prueba, que no viene de Meta), los píxeles (cargan los dos) y `NEXT_PUBLIC_SITE_URL` (el formulario acepta el origen).
Quedan, y no se pueden comprobar desde el navegador:

- Antes de las campañas: `META_CAPI_ACCESS_TOKEN`, `TIKTOK_EVENTS_ACCESS_TOKEN` y `CONEXIGO_EMPRESA_ID`.
- La tarea diaria a `/api/tracking/drain`.
- Conectar el WhatsApp 941 377 136 en ConexiGO.
- Borrar las dos filas de prueba («prueba-pixel») de las hojas cuando ya no sirvan.
