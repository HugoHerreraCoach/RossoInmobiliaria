// Íconos de señalética: trazo de 2 px, esquinas rectas, rejilla de 24.

const PATHS = {
  chat: "M4 5h16v11H9l-5 4zM8 10h8M8 13h5",
  fono: "M6 3h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z",
  pin: "M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  der: "M4 12h15M13 6l6 6-6 6",
  izq: "M20 12H5M11 6l-6 6 6 6",
  compartir: "M12 4v11M7 9l5-5 5 5M5 14v6h14v-6",
  play: "M8 5v14l11-7z",
  pausa: "M8 5h3v14H8zM13 5h3v14h-3z",
  check: "M5 12.5l4.5 4.5L19 7",
  plano: "M3 5h18v14H3zM3 12h18M10 5v14M16 12v7",
  calendario: "M4 6h16v14H4zM4 10h16M8 3v5M16 3v5",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, className }: { name: IconName; size?: number; className?: string }) {
  const filled = name === "play" || name === "pausa";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
