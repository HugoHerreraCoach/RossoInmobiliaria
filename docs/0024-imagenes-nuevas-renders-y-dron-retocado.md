# 0024 · Imágenes nuevas en las dos landings: renders del proyecto y tomas de dron retocadas

**Fecha:** 2026-10-24 · **Rama:** `jheferson` (sin commit al cerrar este documento)

## Qué se pidió

> «Las imágenes de ambas landing cambia por las de la siguiente carpeta: https://drive.google.com/drive/folders/1SF9YeUqJFyh51XeWMWk0KuG2tlH6Wp-w
> y las de la siguiente carpeta "C:\Users\jchal\Downloads\Marketing - MCP\FOTOS ROSSO" no es necesario que incluyas
> todas, elige aquellas que tengan mayor alineamiento gráfico con la landing»

## Qué había en las carpetas

**Drive** (de conexipemaagency, enlace público):

- `IMG_01`–`IMG_10`, PNG de 3840 × 2160. Son **renders 3D** del proyecto terminado: pórtico, ingreso con el
  letrero «LA CAMPIÑA · VALLE SAÑA», vista aérea, alameda con palmeras, parques con hamacas, juegos, gimnasio, mesas
  de pícnic y cancha.
- Las casas y la piscina que aparecen son ilustrativas: se venden lotes.
- También hay un video de WhatsApp (15/09/2026) que no se usó: se pidieron imágenes.

**FOTOS ROSSO** (local), 12 archivos que forman **6 pares de la misma escena**:

- Son tomas de dron del terreno real: ingreso, cerco de caña, jardín triangular con pérgola y lotes trazados.
- Cada par tiene un PNG de 1672 × 941 con nombre descriptivo («Entrada y pérgola frente a la montaña.png», etc.) y
  un JPG de 1600 × 900.
- **Los 6 PNG traen la credencial C2PA de OpenAI/ChatGPT** (`trainedAlgorithmicMedia`): son imágenes generadas o
  editadas con IA.
- Cada JPG difiere de su PNG en solo 3/255 de color medio. Uno es el otro redimensionado; casi seguro, los JPG son
  los PNG de ChatGPT reducidos y enviados por WhatsApp, que borra los metadatos.
- Comparadas con los fotogramas reales de dron de la web (`portico`, `ingreso-abr`, `trazado-jun`), muestran el mismo
  lugar con cambios:
  - nubes en un cielo que estaba despejado;
  - cerros más saturados y techos del fondo de colores;
  - más pasto.

**Conclusión:** ninguna de las imágenes nuevas es una foto sin retoque. La web las presentaba como «Foto real ·
fecha», «fotos fechadas del propio terreno» y «Conoce el terreno real». Ponerlas ahí induciría a error a quien compra
un lote, así que donde van se rotulan **«Imagen referencial»** y no llevan fecha. Las fotos y los videos fechados
de obra se quedan donde la web promete material real.

## Qué se eligió y dónde va

| Lugar | Antes | Ahora |
| --- | --- | --- |
| Carrusel de la portada, toma 1 «Conoce el terreno real» | video real de dron, jun 2026 | **igual**: promete el terreno real y es el video que se reproduce solo (0016) |
| Toma 2 «La bienvenida a La Campiña» | pórtico, video 11 abr | `ingreso-vista`: dron retocado, ingreso con cerco y cerros. «Imagen referencial» |
| Toma 3 «El valle, desde otra perspectiva» | vista general, video 21 jul | `parcelas-aerea`: dron retocado, lotes trazados y valle. «Imagen referencial» |
| Toma 4 (nueva) «Así se verá el ingreso» | frente con cerco, video jun | `render-ingreso`: render del ingreso con el letrero. «Imagen referencial; las casas son ilustrativas» |
| Toma 5 «Acércate a conocer tu próximo lote» | lotes, video jun | `lotes-cerros`: dron retocado, lotes marcados frente a los cerros. «Imagen referencial» |
| Tarjetas «Lo que vas a disfrutar» | 3 fotos reales de obra: pórtico, cerco, trazado | **3 renders de las áreas comunes proyectadas:** Zona de hamacas, Juegos para niños, Gimnasio al aire libre. «Imagen referencial · julio 2027» |
| Fondo de la portada | foto real del valle | **igual**: se muestra en gris al 30 % de opacidad (`.hero__bg img`), así que una imagen nueva se vería igual de apagada y solo sumaría peso a la carga inicial en celular |
| Banda «Así avanza La Campiña» y cronograma | videos y fotos fechadas de obra | **igual**: la sección promete «vuelos de drone y fotos fechadas del propio terreno» |
| Foto de referencia del plano y vista previa al compartir | `hero.webp` | **igual**: el plano necesita una vista cenital; la vista previa no es parte de la página |

Las dos landings usan el mismo `Landing.tsx`, así que `/` y `/promocion` cambian igual.

**Por qué estas:**

- Los renders de parques (verde, árboles, caminos) son lo que más calza con la paleta verde de la landing. Muestran
  justo las áreas de la lista «Proyectado para julio 2027», y los nombres coinciden con los rótulos del plano oficial.
- De las tomas retocadas se eligieron las de cielo azul y cerros, que dan variedad al carrusel: ingreso, valle y
  lotes.
- **Descartadas:**
  - El render aéreo (`IMG_04`): su trazado no es el del plano oficial (0019) y podría tomarse por un plano.
  - Los renders del pórtico y del letrero (`IMG_01`, `IMG_03`): repiten el ingreso.
  - La alameda con piscina (`IMG_05`), el pícnic (`IMG_08`) y la cancha (`IMG_10`): la lista dice «Cancha de grass
    natural» y el render no permite afirmarlo.
  - Las tomas retocadas restantes: repiten escenas.

## Cambios

- **`scripts/build-imagenes.mjs` (nuevo):**
  - convierte las 7 imágenes elegidas a WebP de 1600 × 900 (calidad 80, sin canal alfa), cada una con su procedencia
    en `.webp.json`;
  - escribe `src/content/imagenes.json`, cuyas entradas llevan `tipo: "render" | "editada"` y `video: null`;
  - las carpetas de origen se pasan con `IMAGENES_DRIVE` e `IMAGENES_FOTOS`;
  - va aparte de `build-assets.mjs` porque este regenera `media.json` desde `Recursos/drive`, que no está en el
    repositorio.
- **`public/media/`:** `ingreso-vista`, `parcelas-aerea`, `lotes-cerros`, `render-ingreso`, `render-hamacas`,
  `render-juegos` y `render-gimnasio`, de 206 a 334 KB cada una. No se borró ninguna imagen anterior: la banda de obra
  las sigue usando.
- **`src/content/avance.ts`:** `MEDIA = { ...media, ...imagenes }` y `Toma = keyof typeof MEDIA`.
- **`src/components/HeroCarousel.tsx`** (de la otra sesión, avisada; confirmó que no lo estaba editando):
  - las tomas 2–5 pasan a las imágenes nuevas, sin video, con «Imagen referencial» en el subtítulo y en la etiqueta
    para lectores de pantalla;
  - la insignia muestra el ícono de dron solo en las tomas con video y `sparkles` en las demás;
  - el botón de pausa dice «Pausar el recorrido», sin «de videos»;
  - la lógica no cambió: las tomas sin video ya pasaban solas cada 6 s.
- **`src/components/Landing.tsx`:**
  - las 3 tarjetas de «Lo que vas a disfrutar» pasan a los renders;
  - el pie dice ahora «Fotografías y videos del propio proyecto; las imágenes marcadas como referenciales son renders
    o fotos retocadas».
- **`scripts/check-source.mjs`:** prueba nueva.
  - Cada imagen de `media.json` e `imagenes.json` existe en disco.
  - Cada imagen referencial es `render` o `editada`, no tiene video y no repite un id de obra.
  - Toda toma de `Landing.tsx` o `HeroCarousel.tsx` que use una imagen referencial dice «referencial» y no dice «Foto
    real» ni lleva año, salvo el «julio 2027» de la entrega.

## Cómo se verificó

- `npx tsc --noEmit`: sin errores.
- `TYPESCRIPT_PATH=<typescript 5.9.3> npm test`: **42 pasan, 1 falla**. Falla «Global Privacy Control», que ya
  fallaba antes. La prueba nueva pasa.
- `next dev` con Chrome automatizado:
  - **1440 px:**
    - las 5 miniaturas del carrusel cargan `hero`, `ingreso-vista`, `parcelas-aerea`, `render-ingreso` y
      `lotes-cerros`;
    - en las tomas 2–5 no aparece «Ver video drone» y la insignia es `sparkles`;
    - las tarjetas muestran los 3 renders con «Imagen referencial · julio 2027»;
    - la banda de obra y el fondo siguen con `general-jul`, `portico`, `cerco-jun` y `trazado-jun`;
    - el pie tiene el texto nuevo.
  - **390 px, en `/promocion`:** carrusel y tarjetas sin desborde horizontal (`scrollWidth` 390) y sin errores de
    consola.

## Pendientes

- [ ] **Confirmar con Rosso** que acepta mostrar fotos retocadas con IA, rotuladas «Imagen referencial». Si prefiere
      las tomas sin retoque, se pueden volver a poner sin tocar el código: basta con cambiar las entradas de
      `imagenes.json`, o pasarlas al carrusel desde `media.json`.
- [x] En celular, el pie del carrusel tapaba la mitad inferior de la imagen; en `ingreso-vista` dejaba ver sobre todo
      cielo y cerros. **Resuelto en 0025**: el pie va debajo de la imagen. Comprobado a 390 px: la toma del ingreso
      se ve entera.
- [ ] Publicación (dueño), junto con lo demás de la rama.
