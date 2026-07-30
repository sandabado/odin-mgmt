import { RecordsFlowMark } from "../RecordsFlowMark";
import { type RecordsBrandTone, type RecordsWordmarkSize } from "./tokens";

export interface RecordsWordmarkProps {
  /** Additional class name for layout integration. */
  className?: string;
  /** Accessible name when the wordmark is used as a graphic or link child. */
  label?: string;
  /** Controls the editorial scale without changing the mark's proportions. */
  size?: RecordsWordmarkSize;
  /** Selects neutral contrast for a bone or void surface. */
  tone?: RecordsBrandTone;
}

export function RecordsWordmark({
  className,
  label = "Whole Body Records",
  size = "standard",
  tone = "on-void",
}: RecordsWordmarkProps) {
  const rootClassName = [
    "records-wordmark-lockup",
    `records-wordmark-lockup--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      aria-label={label}
      className={rootClassName}
      data-size={size}
      role="img"
    >
      <span aria-hidden="true" className="records-wordmark-lockup__mark">
        <RecordsFlowMark className="records-brand-flow-mark" decorative />
      </span>
      <span aria-hidden="true" className="records-wordmark-lockup__copy">
        <span className="records-wordmark-lockup__eyebrow">Whole Body</span>
        <span className="records-wordmark-lockup__title">Records</span>
        <span className="records-wordmark-lockup__current" />
      </span>
    </span>
  );
}
