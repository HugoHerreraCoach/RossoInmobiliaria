import { whatsappHref } from "@/content/proyecto";
import { Icon, type IconName } from "./Icon";

/** Botón de contacto: abre WhatsApp con el mensaje ya escrito. La medición (TrackingProvider) agrega al
 *  mensaje el código R- de la visita según `track`. Sin número configurado cae al formulario. */
export function WhatsAppCta({
  mensaje,
  children,
  className = "btn btn--lime",
  track,
  lot,
  icon = "whatsapp",
  fallback = "#formulario",
  onClick,
}: {
  mensaje: string;
  children: React.ReactNode;
  className?: string;
  track?: string;
  lot?: string;
  icon?: IconName | null;
  fallback?: string;
  onClick?: () => void;
}) {
  const href = whatsappHref(mensaje);
  return (
    <a
      className={className}
      href={href ?? fallback}
      data-track={track}
      data-lot={lot}
      onClick={onClick}
      {...(href ? { target: "_blank", rel: "noopener" } : {})}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </a>
  );
}
