export interface WaterFlowTransitionProps {
  current?: "cyan" | "gold" | "violet";
}

export function WaterFlowTransition({
  current = "cyan",
}: WaterFlowTransitionProps) {
  return (
    <div
      aria-hidden="true"
      className={`records-water-transition records-water-transition--${current}`}
    >
      <svg
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1440 180"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="records-water-transition__far"
          d="M-90 120C140 18 318 176 542 94S907 18 1126 96s343 24 422-25"
        />
        <path
          className="records-water-transition__middle"
          d="M-110 88C94 168 291 15 502 90s397 99 608 2 330-42 438 10"
        />
        <path
          className="records-water-transition__near"
          d="M-100 142C111 55 286 140 463 116s330-122 549-42 368 105 541 18"
        />
      </svg>
      <span />
    </div>
  );
}
