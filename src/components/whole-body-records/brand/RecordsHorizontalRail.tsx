import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./RecordsHorizontalRail.module.css";

export interface RecordsHorizontalRailProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "aria-label" | "children" | "role" | "tabIndex"
> {
  /** Accessible label for the scrollable collection. */
  "aria-label": string;
  children: ReactNode;
  itemWidth?: "compact" | "standard" | "wide";
  /** Visible small-screen hint; set false when nearby copy already explains it. */
  mobileCue?: string | false;
}

export interface RecordsRailCueProps extends Omit<
  ComponentPropsWithoutRef<"p">,
  "children"
> {
  breakpoint?: "compact" | "mobile";
  children?: ReactNode;
}

/** A consistent visible cue for bespoke horizontal collections. */
export function RecordsRailCue({
  breakpoint = "mobile",
  children = "Swipe to explore",
  className,
  ...cueProps
}: RecordsRailCueProps) {
  return (
    <p
      {...cueProps}
      aria-hidden="true"
      className={`${styles.cue} ${className ?? ""}`.trim()}
      data-breakpoint={breakpoint}
    >
      <span>{children}</span>
      <span className={styles.cueTrack}>
        <span />
      </span>
    </p>
  );
}

/**
 * A compact collection grid that becomes a keyboard-scrollable rail on small
 * screens. Child composition remains entirely owned by the caller.
 */
export function RecordsHorizontalRail({
  "aria-label": ariaLabel,
  children,
  className,
  itemWidth = "standard",
  mobileCue = "Swipe to explore",
  ...railProps
}: RecordsHorizontalRailProps) {
  return (
    <div className={styles.root}>
      <div
        {...railProps}
        aria-label={ariaLabel}
        className={`${styles.rail} ${className ?? ""}`.trim()}
        data-item-width={itemWidth}
        role="region"
        tabIndex={0}
      >
        {children}
      </div>
      {mobileCue ? <RecordsRailCue>{mobileCue}</RecordsRailCue> : null}
    </div>
  );
}
