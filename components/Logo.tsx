import Image from "next/image";

// Prototipo: logo.jpg tiene fondo blanco sólido. Sobre fondo claro usa mix-blend-multiply
// para integrarse sin recuadro; con `onDark` se envuelve en una píldora blanca limpia.
export function Logo({
  onDark = false,
  className = "h-14",
}: {
  onDark?: boolean;
  className?: string;
}) {
  const image = (
    <Image
      src="/logo.jpg"
      alt="RB Repuestos Chorry"
      width={2752}
      height={1536}
      priority
      className={`${className} w-auto ${!onDark ? "mix-blend-multiply" : ""}`}
    />
  );

  if (!onDark) return image;

  return (
    <span className="inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-md">
      {image}
    </span>
  );
}
