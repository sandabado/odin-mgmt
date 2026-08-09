import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

const heroAssets = [
  "wbr-hero-01-confluence.png",
  "wbr-hero-02-record-watershed.png",
  "wbr-hero-03-voices-wave.png",
  "wbr-hero-04-artist-archipelago.png",
  "wbr-hero-05-source-return.png",
] as const;

describe("Whole Body Records hero lab", () => {
  it("keeps the comparison room private and the production homepage untouched", () => {
    const page = read("src/app/hero-lab/page.tsx");
    const home = read("src/app/page.tsx");

    expect(page).toContain("robots: { index: false, follow: false }");
    expect(page).toContain("<HeroLab />");
    expect(home).toContain("InkOnWaterPreview");
    expect(home).not.toContain("HeroLab");
  });

  it("renders five complete concepts with the approved copy", () => {
    const lab = read("src/app/hero-lab/HeroLab.tsx");

    expect(lab).toContain("Many voices. One whole body.");
    expect(lab).toContain(
      "A self-sustaining creative economy for artists who own their work",
    );
    expect(lab).toContain("Join the roster →");
    expect(lab).toContain("Explore catalog");
    expect(lab).toContain("Submit your work");
    expect(lab).toContain("Keys 1–5");
    expect(lab.match(/index: "0[1-5]"/g)).toHaveLength(5);

    for (const asset of heroAssets) {
      expect(lab).toContain(asset);
      expect(
        existsSync(`public/images/backgrounds/hero-options/${asset}`),
      ).toBe(true);
    }
  });

  it("uses only the approved accent and preserves generated water color", () => {
    const css = read("src/app/hero-lab/HeroLab.module.css").toLowerCase();

    expect(css).toContain("#2d9cdb");
    expect(css).not.toContain("grayscale(1)");
    for (const forbidden of [
      "#6d4aff",
      "#d4af37",
      "#e56b3d",
      "#2ba8a0",
      "#d16b45",
      "#8f5bff",
    ]) {
      expect(css).not.toContain(forbidden);
    }
  });
});
