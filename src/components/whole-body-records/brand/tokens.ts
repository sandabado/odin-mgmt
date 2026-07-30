/**
 * Whole Body Records — Ink on Water
 *
 * Layer 1 brand tokens. These values are intentionally isolated from the
 * existing global theme until the dated brand-system review is approved.
 */
export const recordsBrandTokens = {
  color: {
    void: "#090a0a",
    bone: "#f5f2eb",
    muted: "#aaa69f",
    mutedOnBone: "rgba(9, 10, 10, 0.68)",
    water: "#2d9cdb",
    hairlineOnVoid: "rgba(245, 242, 235, 0.18)",
    hairlineOnBone: "rgba(9, 10, 10, 0.18)",
    waterVeil: "rgba(45, 156, 219, 0.16)",
    waterQuiet: "rgba(45, 156, 219, 0.42)",
  },
  typography: {
    display: 'var(--font-records-display), "Fraunces", Georgia, serif',
    body: 'var(--font-records-body), "Schibsted Grotesk", Arial, sans-serif',
    displayWeight: 650,
    bodyWeight: 400,
    controlWeight: 500,
  },
  space: {
    1: "8px",
    2: "16px",
    3: "25px",
    4: "42px",
    5: "68px",
    6: "110px",
  },
  line: {
    hairline: "1px",
  },
  layout: {
    contained: "1440px",
    inset: "1120px",
    reading: "760px",
    gutter: "clamp(25px, 7vw, 110px)",
    touch: "44px",
    rhythm: {
      compact: "42px",
      standard: "68px",
      ceremonial: "110px",
    },
  },
  media: {
    aspectRatio: "1 / 1",
    monochromeFilter: "grayscale(1) brightness(1.18) contrast(0.94)",
    blueVeil: "rgba(45, 156, 219, 0.72)",
  },
  motion: {
    quietEase: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    quietEaseTuple: [0.25, 0.1, 0.25, 1] as const,
    settle: "680ms",
    reveal: "1100ms",
  },
} as const;

export type RecordsBrandTone = "on-bone" | "on-void";
export type RecordsWordmarkSize = "compact" | "standard" | "display";

export const recordsBrandCssVariables = {
  "--wbr-void": recordsBrandTokens.color.void,
  "--wbr-bone": recordsBrandTokens.color.bone,
  "--wbr-muted": recordsBrandTokens.color.muted,
  "--wbr-water": recordsBrandTokens.color.water,
  "--wbr-water-veil": recordsBrandTokens.color.waterVeil,
  "--wbr-media-rest-filter": recordsBrandTokens.media.monochromeFilter,
  "--wbr-media-rest-veil": recordsBrandTokens.media.blueVeil,
  "--wbr-font-display": recordsBrandTokens.typography.display,
  "--wbr-font-body": recordsBrandTokens.typography.body,
  "--wbr-content-max": recordsBrandTokens.layout.contained,
  "--wbr-inset-max": recordsBrandTokens.layout.inset,
  "--wbr-reading-measure": recordsBrandTokens.layout.reading,
  "--wbr-gutter": recordsBrandTokens.layout.gutter,
  "--wbr-touch": recordsBrandTokens.layout.touch,
  "--wbr-section-y-compact": recordsBrandTokens.layout.rhythm.compact,
  "--wbr-section-y-standard": recordsBrandTokens.layout.rhythm.standard,
  "--wbr-section-y-ceremonial": recordsBrandTokens.layout.rhythm.ceremonial,
  "--wbr-quiet-ease": recordsBrandTokens.motion.quietEase,
} as const;

export function getRecordsTone(tone: RecordsBrandTone) {
  if (tone === "on-bone") {
    return {
      foreground: recordsBrandTokens.color.void,
      hairline: recordsBrandTokens.color.hairlineOnBone,
      muted: recordsBrandTokens.color.mutedOnBone,
    } as const;
  }

  return {
    foreground: recordsBrandTokens.color.bone,
    hairline: recordsBrandTokens.color.hairlineOnVoid,
    muted: recordsBrandTokens.color.muted,
  } as const;
}
