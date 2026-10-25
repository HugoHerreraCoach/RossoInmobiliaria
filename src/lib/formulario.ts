/** Desplaza la página hasta `destino`, que queda bajo la cabecera (scroll-padding-top). Con Lenis activo (movimiento
 *  permitido) va por Lenis, que también atiende los enlaces #…: así su posición no se desfasa. Sin Lenis, el
 *  desplazamiento del navegador, sin animación con movimiento reducido o pausado. */
export function desplazarA(destino: HTMLElement) {
  if (window.__lenis) {
    window.__lenis.scrollTo(destino);
  } else {
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && document.documentElement.dataset.motion !== "paused";
    destino.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  }
}

/** Lleva al formulario de la portada (#formulario) y pone el cursor en el nombre. Lo usan el botón «Consultar este
 *  lote» del plano (docs/0025) y el botón flotante del asesor (docs/0026). Devuelve false si la página no tiene
 *  formulario, para que el enlace siga su `href`. */
export function irAlFormulario(): boolean {
  const destino = document.getElementById("formulario");
  if (!destino) return false;
  desplazarA(destino);
  destino.querySelector<HTMLInputElement>("input[autocomplete=name]")?.focus({ preventScroll: true });
  return true;
}
