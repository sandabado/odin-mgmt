export type DeepSeaSceneQuality = "low" | "medium" | "high";

export type DeepSeaDepthBand = "near" | "mid" | "far";

export type DeepSeaVec3 = readonly [number, number, number];

export interface DeepSeaSceneBudget {
  readonly quality: DeepSeaSceneQuality;
  readonly icosahedronCount: number;
  readonly signalParticleCount: number;
  readonly targetFps: number;
  readonly maxDevicePixelRatio: number;
  readonly maxFramebufferPixels: number;
}

export interface DeepSeaIcosahedronConfig {
  readonly id: number;
  readonly depthBand: DeepSeaDepthBand;
  readonly position: DeepSeaVec3;
  readonly scale: number;
  readonly phase: number;
  readonly driftAmplitude: DeepSeaVec3;
  readonly driftRate: number;
  readonly rotationAxis: DeepSeaVec3;
  readonly rotationRate: number;
  readonly colorIndex: number;
  readonly faceOpacity: number;
  readonly edgeOpacity: number;
}

const PHI = (1 + Math.sqrt(5)) / 2;
const NORMALIZATION = Math.hypot(1, PHI);
const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Canonical unit-radius icosahedron vertices.
 *
 * The source coordinates are the permutations of `(0, ±1, ±φ)`, normalized
 * once here so every vertex lies on the unit sphere.
 */
export const ICOSAHEDRON_VERTICES = new Float32Array(
  [
    [-1, PHI, 0],
    [1, PHI, 0],
    [-1, -PHI, 0],
    [1, -PHI, 0],
    [0, -1, PHI],
    [0, 1, PHI],
    [0, -1, -PHI],
    [0, 1, -PHI],
    [PHI, 0, -1],
    [PHI, 0, 1],
    [-PHI, 0, -1],
    [-PHI, 0, 1],
  ].flatMap(([x, y, z]) => [
    x / NORMALIZATION,
    y / NORMALIZATION,
    z / NORMALIZATION,
  ]),
);

/**
 * Twenty outward-wound triangular faces referencing ICOSAHEDRON_VERTICES.
 */
export const ICOSAHEDRON_FACES = new Uint16Array([
  0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2,
  10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4,
  11, 6, 2, 10, 8, 6, 7, 9, 8, 1,
]);

function buildUniqueEdgeVertices() {
  const edgeKeys = new Set<number>();
  const lineVertices: number[] = [];
  const vertexCount = ICOSAHEDRON_VERTICES.length / 3;

  for (let offset = 0; offset < ICOSAHEDRON_FACES.length; offset += 3) {
    const triangle = [
      ICOSAHEDRON_FACES[offset],
      ICOSAHEDRON_FACES[offset + 1],
      ICOSAHEDRON_FACES[offset + 2],
    ];

    for (let edge = 0; edge < 3; edge += 1) {
      const first = triangle[edge];
      const second = triangle[(edge + 1) % 3];
      const start = Math.min(first, second);
      const end = Math.max(first, second);
      const key = start * vertexCount + end;
      if (edgeKeys.has(key)) continue;

      edgeKeys.add(key);
      for (const index of [start, end]) {
        const vertexOffset = index * 3;
        lineVertices.push(
          ICOSAHEDRON_VERTICES[vertexOffset],
          ICOSAHEDRON_VERTICES[vertexOffset + 1],
          ICOSAHEDRON_VERTICES[vertexOffset + 2],
        );
      }
    }
  }

  return new Float32Array(lineVertices);
}

/**
 * Thirty unique edges expanded into endpoint pairs for one `gl.LINES` draw.
 */
export const ICOSAHEDRON_EDGE_VERTICES = buildUniqueEdgeVertices();

export const DEEP_SEA_SCENE_BUDGETS: Readonly<
  Record<DeepSeaSceneQuality, DeepSeaSceneBudget>
> = Object.freeze({
  low: Object.freeze({
    quality: "low",
    icosahedronCount: 8,
    signalParticleCount: 68,
    targetFps: 24,
    maxDevicePixelRatio: 1,
    maxFramebufferPixels: 921_600,
  }),
  medium: Object.freeze({
    quality: "medium",
    icosahedronCount: 16,
    signalParticleCount: 110,
    targetFps: 30,
    maxDevicePixelRatio: 1,
    maxFramebufferPixels: 1_440_000,
  }),
  high: Object.freeze({
    quality: "high",
    icosahedronCount: 25,
    signalParticleCount: 179,
    targetFps: 45,
    maxDevicePixelRatio: 1.25,
    maxFramebufferPixels: 2_100_000,
  }),
});

const DEPTH_SEQUENCE: readonly DeepSeaDepthBand[] = [
  "near",
  "mid",
  "far",
  "far",
  "near",
  "mid",
  "far",
  "far",
  "mid",
  "far",
  "near",
  "mid",
  "far",
  "mid",
  "far",
  "far",
  "mid",
  "far",
  "far",
  "mid",
  "far",
  "far",
  "mid",
  "far",
  "far",
];

interface DepthBandParameters {
  readonly zStart: number;
  readonly zStep: number;
  readonly xSpread: number;
  readonly ySpread: number;
  readonly scale: number;
  readonly driftAmplitude: DeepSeaVec3;
  readonly driftPeriod: number;
  readonly rotationPeriod: number;
  readonly faceOpacity: number;
  readonly edgeOpacity: number;
}

const DEPTH_BAND_PARAMETERS: Readonly<
  Record<DeepSeaDepthBand, DepthBandParameters>
> = {
  near: {
    zStart: -3.8,
    zStep: 1.15,
    xSpread: 4.6,
    ySpread: 2.5,
    scale: 0.92,
    driftAmplitude: [0.2, 0.15, 0.06],
    driftPeriod: 42,
    rotationPeriod: 42,
    faceOpacity: 0.06,
    edgeOpacity: 0.34,
  },
  mid: {
    zStart: -7.2,
    zStep: 0.72,
    xSpread: 6.6,
    ySpread: 3.7,
    scale: 0.58,
    driftAmplitude: [0.16, 0.12, 0.05],
    driftPeriod: 68,
    rotationPeriod: 68,
    faceOpacity: 0.045,
    edgeOpacity: 0.24,
  },
  far: {
    zStart: -14,
    zStep: 0.74,
    xSpread: 10.4,
    ySpread: 5.8,
    scale: 0.38,
    driftAmplitude: [0.12, 0.09, 0.035],
    driftPeriod: 110,
    rotationPeriod: 110,
    faceOpacity: 0.026,
    edgeOpacity: 0.14,
  },
};

function round(value: number) {
  return Number(value.toFixed(6));
}

function vec3(x: number, y: number, z: number): DeepSeaVec3 {
  return Object.freeze([round(x), round(y), round(z)]);
}

function normalizedVec3(x: number, y: number, z: number): DeepSeaVec3 {
  const length = Math.hypot(x, y, z) || 1;
  return vec3(x / length, y / length, z / length);
}

function wave01(value: number) {
  return 0.5 + Math.sin(value) * 0.5;
}

function buildIcosahedronConfigs() {
  const bandOrdinals: Record<DeepSeaDepthBand, number> = {
    near: 0,
    mid: 0,
    far: 0,
  };

  return DEPTH_SEQUENCE.map((depthBand, id) => {
    const ordinal = bandOrdinals[depthBand];
    bandOrdinals[depthBand] += 1;
    const parameters = DEPTH_BAND_PARAMETERS[depthBand];
    const angle = (id + 1) * GOLDEN_ANGLE + ordinal * 0.19;
    const radialScale = 0.72 + wave01((id + 1) * 1.71) * 0.22;
    let x = Math.cos(angle) * parameters.xSpread * radialScale;
    const y =
      Math.sin(angle * 0.83 + ordinal * 0.31) *
      parameters.ySpread *
      (0.68 + wave01((id + 1) * 0.93) * 0.2);

    // Keep the largest foreground forms out of the central headline corridor.
    if (depthBand === "near" && Math.abs(x) < 2.2) {
      x = (Math.cos(angle) < 0 ? -1 : 1) * 2.2;
    }

    const scaleWave = wave01((id + 1) * 1.37);
    const driftWave = 0.82 + wave01((id + 1) * 0.77) * 0.24;
    const rotationWave = 0.88 + wave01((id + 1) * 1.13) * 0.24;
    const phase = (((id * GOLDEN_ANGLE) % TAU) + TAU) % TAU;

    return Object.freeze<DeepSeaIcosahedronConfig>({
      id,
      depthBand,
      position: vec3(x, y, parameters.zStart - ordinal * parameters.zStep),
      scale: round(parameters.scale * (0.86 + scaleWave * 0.24)),
      phase: round(phase),
      driftAmplitude: vec3(
        parameters.driftAmplitude[0] * driftWave,
        parameters.driftAmplitude[1] * driftWave,
        parameters.driftAmplitude[2] * driftWave,
      ),
      driftRate: round(TAU / (parameters.driftPeriod * driftWave)),
      rotationAxis: normalizedVec3(
        Math.cos(angle * 0.61),
        0.35 + wave01((id + 1) * 1.09) * 0.45,
        Math.sin(angle * 0.83),
      ),
      rotationRate: round(TAU / (parameters.rotationPeriod * rotationWave)),
      colorIndex: (id * 3 + ordinal) % 7,
      faceOpacity: round(parameters.faceOpacity * (0.88 + scaleWave * 0.12)),
      edgeOpacity: round(parameters.edgeOpacity * (0.86 + scaleWave * 0.14)),
    });
  });
}

/**
 * Stable high-tier object field. Lower tiers use deterministic prefixes whose
 * ordering preserves near, middle, and far depth representation.
 *
 * Coordinates assume a perspective camera at the origin looking down -Z.
 */
export const DEEP_SEA_ICOSAHEDRONS: readonly DeepSeaIcosahedronConfig[] =
  Object.freeze(buildIcosahedronConfigs());

const ICOSAHEDRONS_BY_QUALITY: Readonly<
  Record<DeepSeaSceneQuality, readonly DeepSeaIcosahedronConfig[]>
> = Object.freeze({
  low: Object.freeze(
    DEEP_SEA_ICOSAHEDRONS.slice(0, DEEP_SEA_SCENE_BUDGETS.low.icosahedronCount),
  ),
  medium: Object.freeze(
    DEEP_SEA_ICOSAHEDRONS.slice(
      0,
      DEEP_SEA_SCENE_BUDGETS.medium.icosahedronCount,
    ),
  ),
  high: DEEP_SEA_ICOSAHEDRONS,
});

export function getDeepSeaSceneBudget(
  quality: DeepSeaSceneQuality,
): DeepSeaSceneBudget {
  return DEEP_SEA_SCENE_BUDGETS[quality];
}

export function getDeepSeaIcosahedrons(
  quality: DeepSeaSceneQuality,
): readonly DeepSeaIcosahedronConfig[] {
  return ICOSAHEDRONS_BY_QUALITY[quality];
}
