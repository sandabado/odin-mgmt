type OdinOrbitMarkProps = {
  className?: string;
  decorative?: boolean;
  label?: string;
};

/** A lightweight, scalable ØDIN identity mark for public-facing surfaces. */
export function OdinOrbitMark({ className, decorative = false, label = "ØDIN orbit mark" }: OdinOrbitMarkProps) {
  return (
    <svg
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      className={className}
      role={decorative ? undefined : "img"}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="odin-orbit-mark__ring" cx="50" cy="50" r="42" />
      <g className="odin-orbit-mark__glyph" aria-hidden="true">
        <circle className="odin-orbit-mark__glyph-ring" cx="50" cy="53" r="17.5" />
        <path className="odin-orbit-mark__glyph-slash" d="m34.5 69 31-32" />
      </g>
      <g className="odin-orbit-mark__satellites">
        <circle className="odin-orbit-mark__dot odin-orbit-mark__dot--north" cx="50" cy="8" r="2.4" />
        <circle className="odin-orbit-mark__dot odin-orbit-mark__dot--east" cx="92" cy="50" r="2.4" />
        <circle className="odin-orbit-mark__dot odin-orbit-mark__dot--south" cx="50" cy="92" r="2.4" />
        <circle className="odin-orbit-mark__dot odin-orbit-mark__dot--west" cx="8" cy="50" r="2.4" />
      </g>
    </svg>
  );
}
