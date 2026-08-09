import type { CSSProperties } from "react";
import {
  getRecordsTone,
  recordsBrandTokens,
  type RecordsBrandTone,
} from "./tokens";

export interface RecordsCurrentDividerProps {
  /** Additional class name for page-level placement. */
  className?: string;
  /** Marks the divider as decorative by default; set false for a labeled separator. */
  decorative?: boolean;
  /** Reverses the current while preserving tributary-to-main-stem flow. */
  direction?: "left-to-right" | "right-to-left";
  /** Accessible name used when decorative is false. */
  label?: string;
  /** Selects the neutral hairline appropriate to the surrounding surface. */
  tone?: RecordsBrandTone;
}

const waterGradient = `linear-gradient(90deg, ${recordsBrandTokens.color.waterQuiet}, ${recordsBrandTokens.color.water})`;

export function RecordsCurrentDivider({
  className,
  decorative = true,
  direction = "left-to-right",
  label = "Section current",
  tone = "on-void",
}: RecordsCurrentDividerProps) {
  const colors = getRecordsTone(tone);

  const tributaryStyle: CSSProperties = {
    position: "absolute",
    left: 0,
    width: "34px",
    height: "1px",
    background: waterGradient,
    transformOrigin: "right center",
  };

  return (
    <div
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      className={className}
      role={decorative ? undefined : "separator"}
      style={{
        position: "relative",
        width: "100%",
        minWidth: recordsBrandTokens.space[5],
        height: recordsBrandTokens.space[3],
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "12px 0 auto",
          height: recordsBrandTokens.line.hairline,
          background: colors.hairline,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: recordsBrandTokens.space[5],
          height: recordsBrandTokens.space[3],
          transform:
            direction === "right-to-left"
              ? "translateX(-50%) scaleX(-1)"
              : "translateX(-50%)",
          transformOrigin: "center",
        }}
      >
        <span
          style={{
            ...tributaryStyle,
            top: "7px",
            transform: "rotate(14deg)",
          }}
        />
        <span
          style={{
            ...tributaryStyle,
            top: "17px",
            transform: "rotate(-14deg)",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "12px",
            left: "33px",
            width: "35px",
            height: "1px",
            background: waterGradient,
            boxShadow: `0 0 8px ${recordsBrandTokens.color.waterVeil}`,
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "10px",
            left: "31px",
            width: "4px",
            height: "4px",
            background: recordsBrandTokens.color.water,
            borderRadius: "50%",
          }}
        />
      </span>
    </div>
  );
}
