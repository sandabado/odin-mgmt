import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./RecordsSectionIntro.module.css";

export type RecordsSectionIntroSize = "compact" | "section" | "display";
export type RecordsSectionIntroLayout = "stacked" | "split";

export interface RecordsSectionIntroProps extends Omit<
  ComponentPropsWithoutRef<"header">,
  "children" | "title"
> {
  /** Optional Schibsted context label above or beside the title. */
  eyebrow?: ReactNode;
  /** Optional water-colored continuation of the title. */
  emphasis?: ReactNode;
  /** Places the emphasis beside the title or on its own current. */
  emphasisPlacement?: "inline" | "block";
  /** Quiet italic is canonical; water is reserved for an active current. */
  emphasisTone?: "quiet" | "water";
  /** Selects a semantic heading without changing the visual scale. */
  headingLevel?: "h1" | "h2" | "h3";
  /** Stacked is the default; split gives the eyebrow its own left column. */
  layout?: RecordsSectionIntroLayout;
  /** Keeps title scale deliberate across page contexts. */
  size?: RecordsSectionIntroSize;
  /** Reading copy. May contain inline emphasis or links. */
  supportingCopy?: ReactNode;
  /** Main section statement, rendered in Fraunces. */
  title: ReactNode;
  /** ID applied to the semantic heading for aria-labelledby relationships. */
  titleId?: string;
}

/** A reusable editorial introduction with no enclosing card treatment. */
export function RecordsSectionIntro({
  className,
  emphasis,
  emphasisPlacement = "block",
  emphasisTone = "quiet",
  eyebrow,
  headingLevel = "h2",
  layout = "stacked",
  size = "section",
  supportingCopy,
  title,
  titleId,
  ...headerProps
}: RecordsSectionIntroProps) {
  const Heading = headingLevel;

  return (
    <header
      className={`${styles.intro} ${className ?? ""}`.trim()}
      data-layout={layout}
      data-size={size}
      {...headerProps}
    >
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <div className={styles.statement}>
        <Heading className={styles.title} id={titleId}>
          {title}
          {emphasis ? (
            <span
              className={styles.emphasis}
              data-placement={emphasisPlacement}
              data-tone={emphasisTone}
            >
              {emphasisPlacement === "inline" ? " " : null}
              {emphasis}
            </span>
          ) : null}
        </Heading>
        {supportingCopy ? (
          typeof supportingCopy === "string" ? (
            <p className={styles.copy}>{supportingCopy}</p>
          ) : (
            <div className={styles.copy}>{supportingCopy}</div>
          )
        ) : null}
      </div>
    </header>
  );
}
