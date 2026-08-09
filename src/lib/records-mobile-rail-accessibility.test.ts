import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Whole Body Records mobile rail accessibility", () => {
  it("makes the four-card artist world keyboard scrollable", () => {
    const component = read(
      "src/components/whole-body-records/FeaturedArtistPortal.tsx",
    );
    const css = read(
      "src/components/whole-body-records/FeaturedArtistPortal.module.css",
    );

    expect(component).toContain(
      'aria-label="Artist world: Artist, Album, Story, Merch"',
    );
    expect(component).toContain("Four ways into the artist world");
    expect(component).toContain("Swipe");
    expect(component).toMatch(
      /className=\{styles\.grid\}[\s\S]*?tabIndex=\{0\}/,
    );
    expect(css).toContain(".grid:focus-visible");
    expect(css).toContain("scrollbar-width: thin");
    expect(css).toContain("scroll-snap-stop: always");
  });

  it("uses one consistent image-first card system for all four article types", () => {
    const component = read(
      "src/components/whole-body-records/FeaturedArtistPortal.tsx",
    );
    const css = read(
      "src/components/whole-body-records/FeaturedArtistPortal.module.css",
    );

    expect(component).toContain('meta="Artist · Full world"');
    expect(component).toContain("meta={`Album ·");
    expect(component).toContain("<StoryCard artist={artist} entry={story} />");
    expect(component).toContain('meta="Merch · Artist edition"');
    expect(component).not.toContain("activityIndex");
    expect(css).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
    expect(css).toMatch(/\.media\s*\{[\s\S]*?aspect-ratio: 1;/);
    expect(css).toMatch(
      /@media \(max-width: 860px\)[\s\S]*?\.card\s*\{[\s\S]*?flex: 0 0 min\(78vw, 340px\);/,
    );
  });

  it("keeps the artist service sequence ordered and keyboard scrollable", () => {
    const component = read(
      "src/components/whole-body-records/RecordsBookingCorridor.tsx",
    );
    const css = read(
      "src/components/whole-body-records/RecordsBookingCorridor.module.css",
    );

    expect(component).toMatch(
      /<ol[\s\S]*?aria-label="How Whole Body Records serves artists"[\s\S]*?tabIndex=\{0\}/,
    );
    expect(css).toContain(".loop:focus-visible");
  });

  it("names the ordered opportunity current and exposes it to the keyboard", () => {
    const component = read(
      "src/components/whole-body-records/RecordsRevenueCurrent.tsx",
    );
    const css = read(
      "src/components/whole-body-records/RecordsRevenueCurrent.module.css",
    );

    expect(component).toContain(
      '<ol aria-label="Opportunity currents" tabIndex={0}>',
    );
    expect(css).toContain(".sources ol:focus-visible");
  });
});
