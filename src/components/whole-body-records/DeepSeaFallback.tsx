export interface DeepSeaFallbackProps {
  visible: boolean;
}

export function DeepSeaFallback({ visible }: DeepSeaFallbackProps) {
  return (
    <svg
      aria-hidden="true"
      className="records-deep-sea-fallback"
      data-visible={visible ? "true" : "false"}
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1600 900"
    >
      <defs>
        <linearGradient id="wbr-static-signal" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2d9cdb" stopOpacity="0" />
          <stop offset="0.22" stopColor="#2d9cdb" stopOpacity="0.54" />
          <stop offset="0.48" stopColor="#f5f2eb" stopOpacity="0.58" />
          <stop offset="0.72" stopColor="#2d9cdb" stopOpacity="0.5" />
          <stop offset="1" stopColor="#2d9cdb" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wbr-static-form" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2d9cdb" />
          <stop offset="0.52" stopColor="#f5f2eb" />
          <stop offset="1" stopColor="#2d9cdb" />
        </linearGradient>
        <g id="wbr-static-icosahedron">
          <path d="M0 -58 46 -18 29 40 0 56 -29 40 -46 -18ZM0 -58-29 40 46 -18-46 -18 29 40 0 56M-46 -18 0 0 46 -18M-29 40 0 0 29 40M0 -58V56" />
        </g>
      </defs>

      <path
        className="records-deep-sea-fallback__river"
        d="M-80 640C220 520 390 730 690 618S1160 500 1680 640"
      />
      <path
        className="records-deep-sea-fallback__signal"
        d="M-80 640C220 520 390 730 690 618S1160 500 1680 640"
      />

      <g className="records-deep-sea-fallback__form records-deep-sea-fallback__form--one">
        <use
          href="#wbr-static-icosahedron"
          transform="translate(190 260) scale(2.25)"
        />
      </g>
      <g className="records-deep-sea-fallback__form records-deep-sea-fallback__form--two">
        <use
          href="#wbr-static-icosahedron"
          transform="translate(1370 300) scale(1.55)"
        />
      </g>
      <g className="records-deep-sea-fallback__form records-deep-sea-fallback__form--three">
        <use
          href="#wbr-static-icosahedron"
          transform="translate(1245 715) scale(2.8)"
        />
      </g>
      <g className="records-deep-sea-fallback__form records-deep-sea-fallback__form--four">
        <use
          href="#wbr-static-icosahedron"
          transform="translate(350 760) scale(1.15)"
        />
      </g>
    </svg>
  );
}
