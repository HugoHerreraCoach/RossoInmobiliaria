# 0009 · La base de rastros pasa a la base de ConexiGO

Fecha: 21-oct-2026.

## Qué cambió

- La medición (`rosso_tracking_records` y la función `rosso_tracking`) vive ahora en el esquema
  `landing_rosso` de la base de ConexiGO, con su propio rol `landing_rosso`.
- Ese rol solo puede tocar su esquema. No ve ninguna tabla del CRM. Tiene 10 conexiones como
  máximo y 5 s por consulta.
- `src/server/store.ts` llama a `landing_rosso.rosso_tracking(...)` por una conexión directa
  (`postgres`, pooler de transacción). Ya no usa la API REST de Supabase ni la `service_role`.
- Variables: `DATABASE_URL` reemplaza a `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Se retiran
  de Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` y `DIRECT_URL`.

## Por qué

El proyecto propio de Supabase costaba 10 USD al mes y estaba vacío: la tabla de rastros nunca
se creó y en Vercel faltaba `SUPABASE_URL`, así que la medición no guardaba nada. Con este cambio
funciona, y el proyecto viejo puede salir de la organización de pago.

## Estado de la landing al 21-oct-2026 (sin cambios en este paso)

- `/api/lead` sigue exigiendo `LEAD_WEBHOOK_URL`, que no está configurada: el formulario responde
  «sin destino».
- Sin `NEXT_PUBLIC_WHATSAPP_NUMBER` no hay botones de WhatsApp.
- Rosso aún no lanza campañas. Configurar las dos cosas antes de hacerlo.
