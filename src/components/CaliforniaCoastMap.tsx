import Image from "next/image";

export type CaliforniaCoastMapProps = {
  className?: string;
};

/** A static, decorative California satellite field for the public exchange story. */
export function CaliforniaCoastMap({ className = "" }: CaliforniaCoastMapProps) {
  return (
    <div aria-hidden="true" className={`california-coast-map ${className}`.trim()}>
      <Image
        alt=""
        fill
        sizes="(min-width: 768px) 100vw, 1px"
        src="/california-coast-map.png"
      />
    </div>
  );
}
