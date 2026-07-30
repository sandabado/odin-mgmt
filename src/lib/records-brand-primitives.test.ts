import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Whole Body Records brand primitives", () => {
  it("exports a small typed layout layer without changing composition", () => {
    const barrel = read("src/components/whole-body-records/brand/index.ts");
    const section = read(
      "src/components/whole-body-records/brand/RecordsSection.tsx",
    );

    for (const component of [
      "RecordsSection",
      "RecordsSectionIntro",
      "RecordsActionRow",
      "RecordsActionLink",
      "RecordsHorizontalRail",
      "RecordsRailCue",
    ]) {
      expect(barrel).toContain(component);
    }

    expect(section).toContain('"full" | "contained" | "inset"');
    expect(section).toContain('"compact"');
    expect(section).toContain('"standard"');
    expect(section).toContain('"ceremonial"');
    expect(read("src/components/whole-body-records/brand/tokens.ts")).toContain(
      'touch: "44px"',
    );
    expect(section).toMatch(
      /extends Omit<\s*ComponentPropsWithoutRef<"section">/,
    );
    expect(
      read("src/components/whole-body-records/brand/RecordsSectionIntro.tsx"),
    ).toContain("id={titleId}");
  });

  it("keeps the shared plane free of card, blur, and canvas treatments", () => {
    const sectionCss = read(
      "src/components/whole-body-records/brand/RecordsSection.module.css",
    );
    const primitives = [
      sectionCss,
      read(
        "src/components/whole-body-records/brand/RecordsSectionIntro.module.css",
      ),
      read("src/components/whole-body-records/brand/RecordsActions.module.css"),
      read(
        "src/components/whole-body-records/brand/RecordsHorizontalRail.module.css",
      ),
    ].join("\n");

    expect(sectionCss).toContain("max-width: var(--records-section-contained");
    expect(sectionCss).toContain('data-rhythm="ceremonial"');
    expect(primitives).not.toMatch(/backdrop-filter|filter:\s*blur|<canvas/i);
    expect(primitives).not.toMatch(/box-shadow:\s*0\s+\d/);
  });

  it("uses only the Ink on Water palette, type, motion, and focus law", () => {
    const actions = read(
      "src/components/whole-body-records/brand/RecordsActions.module.css",
    );
    const intro = read(
      "src/components/whole-body-records/brand/RecordsSectionIntro.module.css",
    );
    const primitives = `${actions}\n${intro}`.toLowerCase();
    const forbidden = [
      "#6d4aff",
      "#d4af37",
      "#e56b3d",
      "#2ba8a0",
      "#d16b45",
      "#8f5bff",
    ];

    expect(actions).toContain("cubic-bezier(0.25, 0.1, 0.25, 1)");
    expect(actions).toContain(":focus-visible");
    expect(actions).toContain("@media (prefers-reduced-motion: reduce)");
    expect(intro).toContain('"Fraunces"');
    expect(intro).toContain('"Schibsted Grotesk"');
    expect(intro).toContain("font-style: italic");
    expect(intro).toContain('.emphasis[data-tone="water"]');
    expect(primitives).toContain("#2d9cdb");
    for (const color of forbidden) {
      expect(primitives).not.toContain(color);
    }
  });

  it("makes the small-screen rail labeled, focusable, and scrollable", () => {
    const rail = read(
      "src/components/whole-body-records/brand/RecordsHorizontalRail.tsx",
    );
    const railCss = read(
      "src/components/whole-body-records/brand/RecordsHorizontalRail.module.css",
    );

    expect(rail).toContain('"aria-label": string');
    expect(rail).toContain('role="region"');
    expect(rail).toContain("tabIndex={0}");
    expect(rail).toContain('mobileCue = "Swipe to explore"');
    expect(rail).toContain("data-breakpoint={breakpoint}");
    expect(railCss).toContain("overflow-x: auto");
    expect(railCss).toContain("scroll-snap-type: inline proximity");
    expect(railCss).toContain("scroll-snap-stop: always");
    expect(railCss).toContain(".cueTrack");
  });

  it("keeps the shared blue media rest state legible before color reveal", () => {
    const tokens = read("src/components/whole-body-records/brand/tokens.ts");
    const homepage = read(
      "src/components/whole-body-records/InkOnWaterPreview.module.css",
    );
    const artistPortal = read(
      "src/components/whole-body-records/FeaturedArtistPortal.module.css",
    );

    expect(tokens).toContain(
      'monochromeFilter: "grayscale(1) brightness(1.18) contrast(0.94)"',
    );
    expect(tokens).toContain('blueVeil: "rgba(45, 156, 219, 0.72)"');
    for (const stylesheet of [homepage, artistPortal]) {
      expect(stylesheet).toContain("--wbr-media-rest-filter");
      expect(stylesheet).toContain("--wbr-media-rest-veil");
    }
  });
});
