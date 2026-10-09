import { whatsappHref } from "@/content/proyecto";
import { Icon } from "./Icon";

/** La acción principal: WhatsApp si hay número; si no, el formulario de contacto. */
export function ContactCta({
  mensaje,
  children,
  className = "btn btn--primary",
}: {
  mensaje: string;
  children: React.ReactNode;
  className?: string;
}) {
  const wa = whatsappHref(mensaje);
  return (
    <a className={className} href={wa ?? "#contacto"} {...(wa ? { target: "_blank", rel: "noopener" } : {})}>
      <Icon name="chat" />
      {children}
    </a>
  );
}
