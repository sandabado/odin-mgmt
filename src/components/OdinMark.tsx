import Image from "next/image";

type OdinMarkProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  variant?: "electric" | "orbit";
};

const sourceByVariant = {
  electric: "/images/odin-electric-mark.png",
  orbit: "/images/odin-orbit-object.png",
} as const;

export function OdinMark({ alt = "ØDIN mark", className, priority = false, sizes = "(min-width: 1024px) 480px, 128px", variant = "electric" }: OdinMarkProps) {
  return <Image alt={alt} className={className} height={640} priority={priority} sizes={sizes} src={sourceByVariant[variant]} width={640} />;
}
