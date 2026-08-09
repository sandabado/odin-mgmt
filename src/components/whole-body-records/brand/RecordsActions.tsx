import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./RecordsActions.module.css";

export type RecordsActionVariant = "solid" | "outline" | "text";

export interface RecordsActionRowProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  align?: "start" | "center" | "end";
  children: ReactNode;
  density?: "compact" | "standard";
}

export type RecordsActionLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "className"
> & {
  className?: string;
  variant?: RecordsActionVariant;
};

/** Groups primary and secondary actions with predictable wrapping. */
export function RecordsActionRow({
  align = "start",
  children,
  className,
  density = "standard",
  ...rowProps
}: RecordsActionRowProps) {
  return (
    <div
      className={`${styles.row} ${className ?? ""}`.trim()}
      data-align={align}
      data-density={density}
      {...rowProps}
    >
      {children}
    </div>
  );
}

/** A restrained Records link treatment for CTAs and textual pathways. */
export function RecordsActionLink({
  children,
  className,
  variant = "outline",
  ...linkProps
}: RecordsActionLinkProps) {
  return (
    <Link
      className={`${styles.link} ${className ?? ""}`.trim()}
      data-variant={variant}
      {...linkProps}
    >
      {children}
    </Link>
  );
}
