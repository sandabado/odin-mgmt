import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("PoolingWaterClosing", () => {
  const component = read(
    "src/components/whole-body-records/PoolingWaterClosing.tsx",
  );
  const css = read(
    "src/components/whole-body-records/PoolingWaterClosing.module.css",
  );

  it("keeps the complete closing scripture unchanged", () => {
    for (const line of [
      "Music lives here.",
      "Paper gives the system stillness.",
      "Ink gives it intelligence.",
      "The artist gives it life.",
    ]) {
      expect(component).toContain(line);
    }
  });

  it("keeps the yin-yang drain interactive and visibly pooled", () => {
    expect(component).toContain("RecordsFlowMark");
    expect(component).toContain("sendRipple");
    expect(component).toContain("styles.fallingWater");
    expect(component).toContain("styles.basin");
    expect(component).toContain("Array.from({ length: 9 }");
    expect(css).toContain("@keyframes water-fall");
    expect(css).toContain("@keyframes basin-breathe");
    expect(css).toContain("@keyframes basin-release");
    expect(css).toContain('.drain[data-surging="true"] .basin');
  });

  it("stays compact, scoped, motion-safe, and within Records colors", () => {
    expect(css).toContain("min-height: 260px");
    expect(css).not.toMatch(/position:\s*fixed|<canvas|WebGL|blur\(/i);
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.fallingWater i,[\s\S]*?\.basin,[\s\S]*?animation: none !important;/,
    );
    expect(css).toContain("#2d9cdb");
    expect(css).toContain("#f5f2eb");
    for (const forbidden of [
      "#6d4aff",
      "#d4af37",
      "#e56b3d",
      "#7c9cf5",
      "#2ba8a0",
      "#d16b45",
      "#8f5bff",
    ]) {
      expect(css.toLowerCase()).not.toContain(forbidden);
    }
  });
});
