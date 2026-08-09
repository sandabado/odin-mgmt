import type { ReactNode } from "react";
import type {
  RecordsActiveNavId,
  RecordsRouteId,
} from "@/lib/records-public-routes";
import { RecordsFooter } from "./RecordsFooter";
import { RecordsHeader } from "./RecordsHeader";
import { RecordsSpatialExperience } from "./RecordsSpatialExperience";

export type RecordsPageShellVariant = "auth" | "default" | "legal";

export interface RecordsPageShellProps {
  activeNav?: RecordsActiveNavId;
  children: ReactNode;
  continuousWater?: boolean;
  overlayHeader?: boolean;
  route: RecordsRouteId;
  variant?: RecordsPageShellVariant;
}

export function RecordsPageShell({
  activeNav,
  children,
  continuousWater = false,
  overlayHeader = false,
  route,
  variant = "default",
}: RecordsPageShellProps) {
  const isAuth = variant === "auth";
  const rootClassName = [
    "records-site",
    "records-museum",
    "records-continuous-flow",
    continuousWater ? "records-home-flow" : "",
    isAuth ? "records-auth" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassName}
      data-records-route={route}
      data-records-shell-variant={variant}
    >
      <a
        className="records-skip-link"
        href={isAuth ? "#member-access" : "#records-main"}
      >
        {isAuth ? "Skip to member access" : "Skip to the exhibition"}
      </a>
      <RecordsSpatialExperience />
      <RecordsHeader activeNav={activeNav} overlay={overlayHeader} />
      {isAuth ? (
        children
      ) : (
        <main
          className={
            variant === "legal"
              ? "legal-page records-legal-page records-continuous-flow"
              : undefined
          }
          id="records-main"
          tabIndex={-1}
        >
          {children}
        </main>
      )}
      <RecordsFooter />
    </div>
  );
}
