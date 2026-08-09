import { OdinOrbitMark } from "@/components/OdinOrbitMark";

export interface OdinLoadingScreenProps {
  label?: string;
}

/** Quiet route-level loading state that keeps the ØDIN shell visible. */
export function OdinLoadingScreen({ label = "Loading ØDIN operations" }: OdinLoadingScreenProps) {
  return (
    <div aria-live="polite" className="odin-route-loader" role="status">
      <span className="odin-route-loader__halo" aria-hidden="true" />
      <OdinOrbitMark className="odin-route-loader__mark" decorative />
      <span className="sr-only">{label}</span>
    </div>
  );
}
