export interface RecordsFlowMarkProps {
  className?: string;
  decorative?: boolean;
  title?: string;
}

export function RecordsFlowMark({
  className = "",
  decorative = false,
  title = "Whole Body Records flow mark",
}: RecordsFlowMarkProps) {
  return (
    <svg
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      className={className}
      role={decorative ? undefined : "img"}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="records-flow-mark__field" cx="50" cy="50" r="42" />
      <path
        className="records-flow-mark__current records-flow-mark__current--one"
        d="M50 8a42 42 0 0 1 0 84 21 21 0 0 0 0-42 21 21 0 0 1 0-42Z"
      />
      <path
        className="records-flow-mark__current records-flow-mark__current--two"
        d="M50 92a42 42 0 0 1 0-84 21 21 0 0 0 0 42 21 21 0 0 1 0 42Z"
      />
      <circle
        className="records-flow-mark__dot records-flow-mark__dot--one"
        cx="50"
        cy="29"
        r="5"
      />
      <circle
        className="records-flow-mark__dot records-flow-mark__dot--two"
        cx="50"
        cy="71"
        r="5"
      />
      <circle className="records-flow-mark__ring" cx="50" cy="50" r="42" />
    </svg>
  );
}
