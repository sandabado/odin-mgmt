import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Whole Body Records floating masthead", () => {
  it("keeps the complete primary navigation in desktop and native mobile controls", () => {
    const header = read("src/components/whole-body-records/RecordsHeader.tsx");

    expect(header).toContain('className="records-header__primary-nav"');
    expect(header).toContain('<details className="records-mobile-nav">');
    expect(header).toContain('aria-label="Mobile primary navigation"');
    expect(header).toContain("{navigation}");
    expect(header).toContain("<RecordsSessionControl");
  });

  it("uses one semantic typographic lockup for Whole Body and Records", () => {
    const wordmark = read(
      "src/components/whole-body-records/brand/RecordsWordmark.tsx",
    );

    expect(wordmark).toContain('className="records-wordmark-lockup__eyebrow"');
    expect(wordmark).toContain('className="records-wordmark-lockup__title"');
    expect(wordmark).toContain("Whole Body");
    expect(wordmark).toContain("Records");
    expect(wordmark).toContain("data-size={size}");
  });

  it("floats without backdrop blur and preserves anchor clearance", () => {
    const css = read("src/app/records-brand.css");
    const floatingLayer = css.slice(
      css.indexOf("/*\n * Floating public masthead"),
    );

    expect(floatingLayer).toContain("position: fixed !important");
    expect(floatingLayer).toContain("backdrop-filter: none !important");
    expect(floatingLayer).toContain("scroll-margin-top:");
    expect(floatingLayer).toContain("@media (max-width: 920px)");
    expect(floatingLayer).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
