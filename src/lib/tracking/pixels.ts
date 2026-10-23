/* Píxeles de Rosso (docs/0013). Son IDs públicos, así que viven en el código como en DLC y producción
   los usa sin variables. NEXT_PUBLIC_* los reemplaza al compilar; una variable vacía apaga ese píxel. */
// Meta: conjunto de datos «Píxel de ROSSO», portfolio ROSSO (908149363097272).
export const META_PIXEL_ID = "948475092408783";
// TikTok: código del píxel (ttq.load), no el ID numérico.
export const TIKTOK_PIXEL_ID = "DBDTQQRC77U4SEFNIUQ0";
export const metaPixelId = () => (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? META_PIXEL_ID).trim();
export const tiktokPixelId = () => (process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? TIKTOK_PIXEL_ID).trim();
/** Conversión de la landing en los dos píxeles: se envía solo cuando el registro quedó guardado (fila en la hoja). */
export const REGISTRATION_EVENT = "CompleteRegistration";
