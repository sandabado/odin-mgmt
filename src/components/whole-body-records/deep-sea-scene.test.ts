import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEEP_SEA_ICOSAHEDRONS,
  DEEP_SEA_SCENE_BUDGETS,
  getDeepSeaIcosahedrons,
  getDeepSeaSceneBudget,
  ICOSAHEDRON_EDGE_VERTICES,
  ICOSAHEDRON_FACES,
  ICOSAHEDRON_VERTICES,
  type DeepSeaDepthBand,
} from "./deep-sea-scene";

function vertex(index: number) {
  const offset = index * 3;
  return [
    ICOSAHEDRON_VERTICES[offset],
    ICOSAHEDRON_VERTICES[offset + 1],
    ICOSAHEDRON_VERTICES[offset + 2],
  ] as const;
}

function vectorKey(values: readonly number[]) {
  return values.map((value) => value.toFixed(6)).join(",");
}

function depthCounts(configs: readonly { depthBand: DeepSeaDepthBand }[]) {
  return configs.reduce<Record<DeepSeaDepthBand, number>>(
    (counts, config) => {
      counts[config.depthBand] += 1;
      return counts;
    },
    { near: 0, mid: 0, far: 0 },
  );
}

describe("deep sea scene geometry", () => {
  it("provides a normalized canonical 12-vertex, 20-face icosahedron", () => {
    expect(ICOSAHEDRON_VERTICES).toBeInstanceOf(Float32Array);
    expect(ICOSAHEDRON_VERTICES).toHaveLength(12 * 3);
    expect(ICOSAHEDRON_FACES).toBeInstanceOf(Uint16Array);
    expect(ICOSAHEDRON_FACES).toHaveLength(20 * 3);

    for (let index = 0; index < 12; index += 1) {
      expect(Math.hypot(...vertex(index))).toBeCloseTo(1, 6);
    }

    for (let offset = 0; offset < ICOSAHEDRON_FACES.length; offset += 3) {
      const indices = [
        ICOSAHEDRON_FACES[offset],
        ICOSAHEDRON_FACES[offset + 1],
        ICOSAHEDRON_FACES[offset + 2],
      ];
      expect(new Set(indices).size).toBe(3);
      indices.forEach((index) => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(12);
      });

      const [a, b, c] = indices.map(vertex);
      const ab = b.map((value, axis) => value - a[axis]);
      const ac = c.map((value, axis) => value - a[axis]);
      const normal = [
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0],
      ];
      const center = a.map((value, axis) => (value + b[axis] + c[axis]) / 3);
      const outwardDot = normal.reduce(
        (sum, value, axis) => sum + value * center[axis],
        0,
      );
      expect(outwardDot).toBeGreaterThan(0);
    }
  });

  it("expands exactly 30 unique canonical edges for gl.LINES", () => {
    expect(ICOSAHEDRON_EDGE_VERTICES).toBeInstanceOf(Float32Array);
    expect(ICOSAHEDRON_EDGE_VERTICES).toHaveLength(30 * 2 * 3);

    const canonicalVertices = new Set(
      Array.from({ length: 12 }, (_, index) => vectorKey(vertex(index))),
    );
    const edges = new Set<string>();
    const lengths: number[] = [];

    for (
      let offset = 0;
      offset < ICOSAHEDRON_EDGE_VERTICES.length;
      offset += 6
    ) {
      const start = Array.from(
        ICOSAHEDRON_EDGE_VERTICES.slice(offset, offset + 3),
      );
      const end = Array.from(
        ICOSAHEDRON_EDGE_VERTICES.slice(offset + 3, offset + 6),
      );
      const startKey = vectorKey(start);
      const endKey = vectorKey(end);
      expect(canonicalVertices.has(startKey)).toBe(true);
      expect(canonicalVertices.has(endKey)).toBe(true);
      edges.add([startKey, endKey].sort().join("|"));
      lengths.push(
        Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]),
      );
    }

    expect(edges.size).toBe(30);
    lengths.forEach((length) => {
      expect(length).toBeCloseTo(lengths[0], 6);
    });
    expect(12 - edges.size + ICOSAHEDRON_FACES.length / 3).toBe(2);
  });
});

describe("deep sea scene budgets", () => {
  it("uses restrained, monotonic low, medium, and high budgets", () => {
    expect(DEEP_SEA_SCENE_BUDGETS).toEqual({
      low: {
        quality: "low",
        icosahedronCount: 8,
        signalParticleCount: 68,
        targetFps: 24,
        maxDevicePixelRatio: 1,
        maxFramebufferPixels: 921_600,
      },
      medium: {
        quality: "medium",
        icosahedronCount: 16,
        signalParticleCount: 110,
        targetFps: 30,
        maxDevicePixelRatio: 1,
        maxFramebufferPixels: 1_440_000,
      },
      high: {
        quality: "high",
        icosahedronCount: 25,
        signalParticleCount: 179,
        targetFps: 45,
        maxDevicePixelRatio: 1.25,
        maxFramebufferPixels: 2_100_000,
      },
    });

    expect(getDeepSeaSceneBudget("low")).toBe(DEEP_SEA_SCENE_BUDGETS.low);
    expect(getDeepSeaSceneBudget("medium")).toBe(DEEP_SEA_SCENE_BUDGETS.medium);
    expect(getDeepSeaSceneBudget("high")).toBe(DEEP_SEA_SCENE_BUDGETS.high);
  });

  it("provides deterministic depth-balanced object prefixes", () => {
    const low = getDeepSeaIcosahedrons("low");
    const medium = getDeepSeaIcosahedrons("medium");
    const high = getDeepSeaIcosahedrons("high");

    expect(low).toHaveLength(8);
    expect(medium).toHaveLength(16);
    expect(high).toHaveLength(25);
    expect(high).toBe(DEEP_SEA_ICOSAHEDRONS);
    expect(low).toEqual(DEEP_SEA_ICOSAHEDRONS.slice(0, 8));
    expect(medium).toEqual(DEEP_SEA_ICOSAHEDRONS.slice(0, 16));
    expect(depthCounts(low)).toEqual({ near: 2, mid: 2, far: 4 });
    expect(depthCounts(medium)).toEqual({ near: 3, mid: 5, far: 8 });
    expect(depthCounts(high)).toEqual({ near: 3, mid: 8, far: 14 });
    expect(Object.isFrozen(low)).toBe(true);
    expect(Object.isFrozen(medium)).toBe(true);
    expect(Object.isFrozen(high)).toBe(true);
  });

  it("keeps every floating object finite, normalized, and restrained", () => {
    const ids = new Set<number>();

    DEEP_SEA_ICOSAHEDRONS.forEach((config, index) => {
      ids.add(config.id);
      expect(config.id).toBe(index);
      expect(config.position.every(Number.isFinite)).toBe(true);
      expect(config.position[2]).toBeLessThan(0);
      expect(config.scale).toBeGreaterThan(0.2);
      expect(config.scale).toBeLessThanOrEqual(1.1);
      expect(config.phase).toBeGreaterThanOrEqual(0);
      expect(config.phase).toBeLessThan(Math.PI * 2);
      expect(config.driftAmplitude.every(Number.isFinite)).toBe(true);
      expect(config.driftRate).toBeGreaterThan(0);
      expect(Math.hypot(...config.rotationAxis)).toBeCloseTo(1, 5);
      expect(config.rotationRate).toBeGreaterThan(0);
      expect(config.colorIndex).toBeGreaterThanOrEqual(0);
      expect(config.colorIndex).toBeLessThan(7);
      expect(config.faceOpacity).toBeGreaterThan(0);
      expect(config.faceOpacity).toBeLessThanOrEqual(0.06);
      expect(config.edgeOpacity).toBeGreaterThan(0);
      expect(config.edgeOpacity).toBeLessThanOrEqual(0.34);
      if (config.depthBand === "near") {
        expect(Math.abs(config.position[0])).toBeGreaterThanOrEqual(2.2);
      }
    });

    expect(ids.size).toBe(DEEP_SEA_ICOSAHEDRONS.length);
  });

  it("contains no runtime randomness or Three.js dependency", () => {
    const source = readFileSync(
      new URL("./deep-sea-scene.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toContain("Math.random");
    expect(source).not.toMatch(/@react-three\/fiber|from ["']three["']/);
  });
});
