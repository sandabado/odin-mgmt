import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("RecordPlayerWaterField", () => {
  const component = read(
    "src/components/whole-body-records/RecordPlayerWaterField.tsx",
  );
  const css = read(
    "src/components/whole-body-records/RecordPlayerWaterField.module.css",
  );
  const player = read(
    "src/components/whole-body-records/InkOnWaterPreview.tsx",
  );

  it("reuses the canonical Records water shader in a chapter-local plane", () => {
    expect(component).toContain("waterFragmentShader");
    expect(component).toContain("waterVertexShader");
    expect(component).toContain('data-scope="record-player-chapter"');
    expect(component).toContain('aria-hidden="true"');
    expect(component).not.toMatch(/AudioContext|createOscillator|<audio/i);
    expect(css).toMatch(/\.field\s*\{[\s\S]*?position: absolute;/);
    expect(css).not.toContain("position: fixed");
    expect(css).toContain("pointer-events: none");
    expect(css).not.toMatch(/blur\(/i);
  });

  it("loads near the chapter and pauses outside the visible viewport", () => {
    expect(component).toContain('const PRELOAD_MARGIN = "320px 0px"');
    expect(component).toContain("new IntersectionObserver");
    expect(component).toContain("hasApproached");
    expect(component).toContain("{canRender ? (");
    expect(component).toContain("{ threshold: 0.01 }");
    expect(component).toContain("window.cancelAnimationFrame(animationFrame)");
    expect(component).toContain('document.addEventListener("visibilitychange"');
    expect(component).toContain("new ResizeObserver(markResize)");
  });

  it("maps pointer energy locally and preserves a static fallback policy", () => {
    expect(component).toContain("root.getBoundingClientRect()");
    expect(component).toContain("pointerTargetEnergy");
    expect(component).toContain("interactionSpeed");
    expect(component).toContain("uPointerActive");
    expect(component).toContain('canvas.getContext("webgl"');
    expect(component).toContain('setWaterState("unavailable")');
    expect(component).toContain("prefers-reduced-motion: reduce");
    expect(component).toContain("connection?.saveData");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain('.field[data-water-state="ready"] .canvas');
  });

  it("uses only the Records black, bone, and Studios-blue palette", () => {
    for (const approved of ["#0a0a09", "#10100f", "#2d9cdb", "#f5f2eb"]) {
      expect(css).toContain(approved);
    }
    for (const forbidden of [
      "#6d4aff",
      "#d4af37",
      "#e56b3d",
      "#2ba8a0",
      "#d16b45",
      "#8f5bff",
    ]) {
      expect(`${component}\n${css}`.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("is mounted only inside the inline listening-current chapter", () => {
    expect(player).toContain(
      'import { RecordPlayerWaterField } from "./RecordPlayerWaterField"',
    );
    expect(player).toMatch(
      /aria-labelledby="watercolor-player-heading"[\s\S]{0,220}<RecordPlayerWaterField/,
    );
    expect(player.match(/<RecordPlayerWaterField/g)).toHaveLength(1);
  });
});
