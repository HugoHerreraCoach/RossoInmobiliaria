# 0007 · Rediseño editorial y responsive

## Alcance

Se modificó el código del ZIP recibido. La referencia visual fue la landing de Grupo DLC: imagen protagonista, jerarquía comercial y formulario contrastado. Se mantuvo la identidad cromática de La Campiña y la alternativa Rosso, sin copiar logos, testimonios, promociones ni imágenes de otra empresa. No se encontró acceso al repositorio indicado mediante el conector (respuesta 404); el ZIP es la base de esta entrega.

## Cambios principales

- `src/app/page.tsx`: nueva composición completa de la landing.
- `src/app/redesign.css`: sistema visual responsive, respetando el CSS funcional anterior.
- `src/components/SiteHeader.tsx`: navegación desktop/móvil, Escape y estados accesibles.
- `src/components/ContactForm.tsx`: formulario compacto/ampliado, validación, consentimiento explícito y estados de envío.
- `src/components/WhyProjectTabs.tsx`, `HeroCarousel.tsx`, `Schedule.tsx`: presentación y navegación del contenido, sin imágenes inventadas.
- `src/components/LotStack.tsx`, `Ficha.tsx`, `src/app/lote/[id]/page.tsx`: presentación del explorador y las fichas, selección sincronizada y errores de compartición.
- `src/content/proyecto.ts`, `.env.example`: canales de contacto configurables.
- `src/app/api/lead/route.ts`: guardas de JSON inválido y timeout al destino. Mismo contrato de lead y mismo comportamiento 503 sin destino.
- `scripts/check-source.mjs`: pruebas locales sin envío externo.

## Conservación de datos

El archivo `src/content/lotes.ts` y los recursos originales de `public/media/` se conservan byte a byte respecto al ZIP. La geometría del esquema no se sustituyó por un plano inventado. Se evita presentar dicho esquema como plano técnico o superposición georreferenciada.

La lista original contiene 132 lotes, 8 manzanas, 70 disponibles, 61 vendidos y 1 reservado. Estas cifras son de esa lista histórica, no de un sistema de disponibilidad en vivo. Se mantienen sus importes y fórmulas de cálculo. La cronología de obra no se presenta como porcentaje de avance físico.

## Verificación realizada

La comprobación de sintaxis se ejecutó con el compilador TypeScript disponible en el entorno. Los componentes se renderizaron en Chromium mediante un arnés local con React 18.2 y un adaptador de `next/image`; **no es una ejecución de Next.js con las dependencias del proyecto**. Las capturas usan fuentes locales de sustitución, por lo que la tipografía final puede variar ligeramente al cargar Outfit, Jakarta y Cormorant originales.

Se comprobaron en ese arnés: ausencia de errores de render inicial; IDs únicos; anclas con destino; anchos 320, 375, 390, 768, 1024 y 1440 sin desbordamiento horizontal; menú móvil y Escape; pestañas por teclado; selección de galería y activación/desactivación de video; simulador con cambio de plazo, inicial y modalidad; búsqueda de C3 con sincronización de ficha y ambos formularios; filtros sin resultados y cambio mapa/lista; consentimiento inicialmente desmarcado y errores de validación. Estas pruebas no sustituyen pruebas end-to-end de Next.js.

Los estados del servidor se verifican con dobles de prueba, nunca con datos enviados al CRM real. Consulta `verificacion-servidor.json` para el resultado de ejecución de esas pruebas. La instalación de dependencias y el build completo no se completaron por restricciones del entorno. Quedan pendientes el typecheck completo, la compilación Next.js, SSR/hidratación, navegación real entre rutas y prueba de entrega a un CRM de staging.

## Antes de publicar

Configurar WhatsApp, teléfono, Maps, dominio y webhook; confirmar precios y disponibilidad; aprobar el texto de autorización y requisitos legales de privacidad; revisar documentación de propiedad, entrega y condiciones comerciales; sustituir el esquema solo si se dispone del plano oficial; realizar una prueba real de captación autorizada en staging. Verificar límites de tráfico y protección contra abuso del endpoint en la infraestructura de producción, fuera del alcance visual de esta entrega.

Se mantienen los tiempos de viaje originales (incluidos 35 minutos a Chiclayo), marcados como aproximados. Confirmarlos con el responsable comercial. No se homogeneizaron con afirmaciones de otras piezas sin una fuente nueva aprobada.
