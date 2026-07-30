import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import styles from "./RecordsSection.module.css";
import {
  getRecordsTone,
  recordsBrandTokens,
  type RecordsBrandTone,
} from "./tokens";

export type RecordsSectionWidth = "full" | "contained" | "inset";
export type RecordsSectionRhythm = "compact" | "standard" | "ceremonial";
export type RecordsSectionDivider = "none" | "top" | "bottom" | "both";

export interface RecordsSectionProps extends Omit<
  ComponentPropsWithoutRef<"section">,
  "children"
> {
  /** Section contents. Use one width plane per editorial chapter. */
  children: ReactNode;
  /** Adds a short water signal without enclosing the section. */
  accent?: boolean;
  /** Adds only structural hairlines; it never creates a card boundary. */
  divider?: RecordsSectionDivider;
  /** Chooses one step from the canonical vertical rhythm. */
  rhythm?: RecordsSectionRhythm;
  /** Selects text contrast for the surrounding plane. */
  tone?: RecordsBrandTone;
  /** Full bleed, primary content width, or a quieter editorial inset. */
  width?: RecordsSectionWidth;
}

type RecordsSectionStyle = CSSProperties & {
  "--records-section-contained": string;
  "--records-section-foreground": string;
  "--records-section-gutter": string;
  "--records-section-hairline": string;
  "--records-section-inset": string;
  "--records-section-muted": string;
  "--records-section-water": string;
};

/**
 * Shared Records section plane.
 *
 * The component normalizes width and rhythm while leaving content composition
 * to the page. It intentionally adds no background, radius, shadow, or blur.
 */
export function RecordsSection({
  accent = false,
  children,
  className,
  divider = "none",
  rhythm = "standard",
  style,
  tone = "on-void",
  width = "contained",
  ...sectionProps
}: RecordsSectionProps) {
  const colors = getRecordsTone(tone);
  const sectionStyle: RecordsSectionStyle = {
    "--records-section-contained": recordsBrandTokens.layout.contained,
    "--records-section-foreground": colors.foreground,
    "--records-section-gutter": recordsBrandTokens.layout.gutter,
    "--records-section-hairline": colors.hairline,
    "--records-section-inset": recordsBrandTokens.layout.inset,
    "--records-section-muted": colors.muted,
    "--records-section-water": recordsBrandTokens.color.water,
    ...style,
  };

  return (
    <section
      className={`${styles.section} ${className ?? ""}`.trim()}
      data-accent={accent || undefined}
      data-divider={divider}
      data-rhythm={rhythm}
      data-tone={tone}
      data-width={width}
      style={sectionStyle}
      {...sectionProps}
    >
      <div className={styles.frame}>{children}</div>
    </section>
  );
}
