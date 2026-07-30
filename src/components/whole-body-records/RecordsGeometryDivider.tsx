import { RecordsCurrentDivider } from "./brand/RecordsCurrentDivider";

export interface RecordsGeometryDividerProps {
  className?: string;
  tone?: "paper" | "deep";
}

export function RecordsGeometryDivider({
  className = "",
  tone = "paper",
}: RecordsGeometryDividerProps) {
  return (
    <RecordsCurrentDivider
      className={`records-geometry-divider records-geometry-divider--${tone} ${className}`.trim()}
      tone={tone === "paper" ? "on-bone" : "on-void"}
    />
  );
}
