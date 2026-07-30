import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

describe("Whole Body Records route accessibility regressions", () => {
  it("keeps creative-direction labs local-only in production", () => {
    for (const file of [
      "src/app/hero-lab/page.tsx",
      "src/app/ink-on-water/page.tsx",
    ]) {
      const page = read(file);

      expect(page).toContain('process.env.NODE_ENV === "production"');
      expect(page).toContain('redirect("/")');
    }
  });

  it("gives both Spotify embed hosts valid labelled group semantics", () => {
    for (const file of [
      "src/components/whole-body-records/turntable/InlineTurntablePlayer.tsx",
      "src/components/whole-body-records/turntable/TurntablePlayer.tsx",
    ]) {
      const player = read(file);

      expect(player).toMatch(
        /aria-label="Spotify playback controls"[\s\S]{0,180}role="group"/,
      );
    }
  });

  it("keeps the smallest hero-lab labels at WCAG AA contrast", () => {
    const css = read("src/app/hero-lab/HeroLab.module.css");
    const black = css.match(/--black:\s*(#[0-9a-f]{6})/i)?.[1];
    const muted = css.match(/--gray-deep:\s*(#[0-9a-f]{6})/i)?.[1];

    expect(black).toBeDefined();
    expect(muted).toBeDefined();
    expect(contrastRatio(muted!, black!)).toBeGreaterThanOrEqual(4.5);
  });

  it("stops the shared ØDIN signal mark under reduced motion", () => {
    const css = read("src/app/globals.css");

    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.odin-orbit-mark__signal-ring[\s\S]*?animation: none !important;/,
    );
  });
});
