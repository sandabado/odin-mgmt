"use client";

import { useEffect, useRef } from "react";
import {
  getDeepSeaIcosahedrons,
  getDeepSeaSceneBudget,
  ICOSAHEDRON_EDGE_VERTICES,
  type DeepSeaSceneQuality,
} from "./deep-sea-scene";
import {
  icosahedronFragmentShader,
  icosahedronVertexShader,
  waterFragmentShader,
  waterVertexShader,
} from "./water-shaders";

export interface WaterCanvasProps {
  className?: string;
  onReady?: () => void;
  onUnavailable?: () => void;
  palette?: WaterPalette;
}

export interface WaterPalette {
  base: string;
  primary: string;
  secondary: string;
  surface: string;
}

const DEFAULT_WATER_PALETTE: WaterPalette = {
  base: "#10100f",
  primary: "#2d9cdb",
  secondary: "#181816",
  surface: "#f5f2eb",
};

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL shader allocation failed.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message =
      gl.getShaderInfoLog(shader) ?? "WebGL shader compilation failed.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("WebGL program allocation failed.");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message =
      gl.getProgramInfoLog(program) ?? "WebGL program link failed.";
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error(message);
  }
  return { fragment, program, vertex };
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ] as const;
}

const DEEP_SEA_COLORS = [
  "#2d9cdb",
  "#f5f2eb",
  "#aaa69f",
  "#181816",
  "#2d9cdb",
  "#10100f",
  "#f5f2eb",
].map((color) => new Float32Array(hexToRgb(color)));

function sceneQualityForWidth(width: number): DeepSeaSceneQuality {
  if (width < 720) return "low";
  if (width < 1440) return "medium";
  return "high";
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function paletteToRgb(palette: WaterPalette) {
  return {
    base: [...hexToRgb(palette.base)],
    primary: [...hexToRgb(palette.primary)],
    secondary: [...hexToRgb(palette.secondary)],
    surface: [...hexToRgb(palette.surface)],
  };
}

type RgbPalette = ReturnType<typeof paletteToRgb>;

function easeColor(
  current: number[],
  target: readonly number[],
  amount: number,
) {
  for (let index = 0; index < current.length; index += 1) {
    current[index] += (target[index] - current[index]) * amount;
  }
}

export default function WaterCanvas({
  className,
  onReady,
  onUnavailable,
  palette = DEFAULT_WATER_PALETTE,
}: WaterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  const onUnavailableRef = useRef(onUnavailable);
  const paletteRef = useRef<RgbPalette>(paletteToRgb(palette));

  useEffect(() => {
    onReadyRef.current = onReady;
    onUnavailableRef.current = onUnavailable;
  }, [onReady, onUnavailable]);

  useEffect(() => {
    paletteRef.current = paletteToRgb(palette);
  }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const network = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (reducedMotion || network.connection?.saveData) {
      onUnavailableRef.current?.();
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });
    if (!gl) {
      onUnavailableRef.current?.();
      return;
    }

    let animationFrame = 0;
    let disposed = false;
    let readyFrames = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let pointerActive = 0;
    let lastScrollY = window.scrollY;
    let scrollProgress = 0;
    let scrollSpeed = 0;
    const currentPalette = paletteToRgb(DEFAULT_WATER_PALETTE);
    const startedAt = performance.now();

    try {
      const waterProgram = createProgram(
        gl,
        waterVertexShader,
        waterFragmentShader,
      );
      const icosahedronProgram = createProgram(
        gl,
        icosahedronVertexShader,
        icosahedronFragmentShader,
      );

      const positionBuffer = gl.createBuffer();
      const edgeBuffer = gl.createBuffer();
      if (!positionBuffer || !edgeBuffer) {
        throw new Error("WebGL geometry buffer allocation failed.");
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, ICOSAHEDRON_EDGE_VERTICES, gl.STATIC_DRAW);

      const position = gl.getAttribLocation(waterProgram.program, "aPosition");
      const uniforms = {
        time: gl.getUniformLocation(waterProgram.program, "uTime"),
        resolution: gl.getUniformLocation(waterProgram.program, "uResolution"),
        pointer: gl.getUniformLocation(waterProgram.program, "uPointer"),
        pointerActive: gl.getUniformLocation(
          waterProgram.program,
          "uPointerActive",
        ),
        scrollProgress: gl.getUniformLocation(
          waterProgram.program,
          "uScrollProgress",
        ),
        scrollSpeed: gl.getUniformLocation(
          waterProgram.program,
          "uScrollSpeed",
        ),
        colorBase: gl.getUniformLocation(waterProgram.program, "uColorBase"),
        colorPrimary: gl.getUniformLocation(
          waterProgram.program,
          "uColorPrimary",
        ),
        colorSecondary: gl.getUniformLocation(
          waterProgram.program,
          "uColorSecondary",
        ),
        colorSurface: gl.getUniformLocation(
          waterProgram.program,
          "uColorSurface",
        ),
      };
      const icosahedronPosition = gl.getAttribLocation(
        icosahedronProgram.program,
        "aPosition",
      );
      const icosahedronUniforms = {
        anchor: gl.getUniformLocation(icosahedronProgram.program, "uAnchor"),
        color: gl.getUniformLocation(icosahedronProgram.program, "uColor"),
        drift: gl.getUniformLocation(icosahedronProgram.program, "uDrift"),
        driftRate: gl.getUniformLocation(
          icosahedronProgram.program,
          "uDriftRate",
        ),
        opacity: gl.getUniformLocation(icosahedronProgram.program, "uOpacity"),
        phase: gl.getUniformLocation(icosahedronProgram.program, "uPhase"),
        pointer: gl.getUniformLocation(icosahedronProgram.program, "uPointer"),
        pointerActive: gl.getUniformLocation(
          icosahedronProgram.program,
          "uPointerActive",
        ),
        resolution: gl.getUniformLocation(
          icosahedronProgram.program,
          "uResolution",
        ),
        rotationAxis: gl.getUniformLocation(
          icosahedronProgram.program,
          "uRotationAxis",
        ),
        scale: gl.getUniformLocation(icosahedronProgram.program, "uScale"),
        scrollProgress: gl.getUniformLocation(
          icosahedronProgram.program,
          "uScrollProgress",
        ),
        spin: gl.getUniformLocation(icosahedronProgram.program, "uSpin"),
        time: gl.getUniformLocation(icosahedronProgram.program, "uTime"),
      };

      let sceneQuality = sceneQualityForWidth(canvas.clientWidth);
      let sceneBudget = getDeepSeaSceneBudget(sceneQuality);
      let sceneObjects = getDeepSeaIcosahedrons(sceneQuality);
      let resizeDirty = true;
      let lastRenderedAt = 0;

      const resize = () => {
        const clientWidth = Math.max(1, canvas.clientWidth);
        const clientHeight = Math.max(1, canvas.clientHeight);
        const nextQuality = sceneQualityForWidth(clientWidth);
        if (nextQuality !== sceneQuality) {
          sceneQuality = nextQuality;
          sceneBudget = getDeepSeaSceneBudget(sceneQuality);
          sceneObjects = getDeepSeaIcosahedrons(sceneQuality);
        }
        const pixelRatioLimit = Math.sqrt(
          sceneBudget.maxFramebufferPixels / (clientWidth * clientHeight),
        );
        const ratio = Math.max(
          0.5,
          Math.min(
            window.devicePixelRatio || 1,
            sceneBudget.maxDevicePixelRatio,
            pixelRatioLimit,
          ),
        );
        const width = Math.max(1, Math.floor(clientWidth * ratio));
        const height = Math.max(1, Math.floor(clientHeight * ratio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
        }
        canvas.dataset.sceneQuality = sceneQuality;
        resizeDirty = false;
      };
      const markResize = () => {
        resizeDirty = true;
      };
      const pointerMove = (event: PointerEvent) => {
        pointerX = event.clientX / Math.max(window.innerWidth, 1);
        pointerY = 1 - event.clientY / Math.max(window.innerHeight, 1);
        pointerActive = 1;
      };
      const pointerLeave = () => {
        pointerActive = 0;
      };
      const scroll = () => {
        const next = window.scrollY;
        scrollSpeed = Math.min(1, Math.abs(next - lastScrollY) / 80);
        scrollProgress = Math.min(
          1,
          next /
            Math.max(
              1,
              document.documentElement.scrollHeight - window.innerHeight,
            ),
        );
        lastScrollY = next;
      };
      const contextLost = (event: Event) => {
        event.preventDefault();
        window.cancelAnimationFrame(animationFrame);
        onUnavailableRef.current?.();
      };

      const render = (now: number) => {
        if (disposed || document.hidden) return;
        const frameInterval = 1000 / sceneBudget.targetFps;
        if (lastRenderedAt > 0 && now - lastRenderedAt < frameInterval) {
          animationFrame = window.requestAnimationFrame(render);
          return;
        }
        const deltaSeconds = Math.min(
          0.05,
          Math.max(
            1 / 120,
            lastRenderedAt > 0 ? (now - lastRenderedAt) / 1000 : 1 / 60,
          ),
        );
        lastRenderedAt = now;
        if (resizeDirty) resize();
        scrollSpeed *= Math.pow(0.94, deltaSeconds * 60);
        const elapsed = (now - startedAt) / 1000;
        const colorEase = 1 - Math.pow(1 - 0.035, deltaSeconds * 60);

        gl.disable(gl.BLEND);
        gl.useProgram(waterProgram.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(uniforms.time, elapsed);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform2f(uniforms.pointer, pointerX, pointerY);
        gl.uniform1f(uniforms.pointerActive, pointerActive);
        gl.uniform1f(uniforms.scrollProgress, scrollProgress);
        gl.uniform1f(uniforms.scrollSpeed, scrollSpeed);
        easeColor(currentPalette.base, paletteRef.current.base, colorEase);
        easeColor(
          currentPalette.primary,
          paletteRef.current.primary,
          colorEase,
        );
        easeColor(
          currentPalette.secondary,
          paletteRef.current.secondary,
          colorEase,
        );
        easeColor(
          currentPalette.surface,
          paletteRef.current.surface,
          colorEase,
        );
        gl.uniform3fv(uniforms.colorBase, currentPalette.base);
        gl.uniform3fv(uniforms.colorPrimary, currentPalette.primary);
        gl.uniform3fv(uniforms.colorSecondary, currentPalette.secondary);
        gl.uniform3fv(uniforms.colorSurface, currentPalette.surface);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.useProgram(icosahedronProgram.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
        gl.enableVertexAttribArray(icosahedronPosition);
        gl.vertexAttribPointer(icosahedronPosition, 3, gl.FLOAT, false, 0, 0);
        gl.uniform1f(icosahedronUniforms.time, elapsed);
        gl.uniform2f(
          icosahedronUniforms.resolution,
          canvas.width,
          canvas.height,
        );
        gl.uniform2f(icosahedronUniforms.pointer, pointerX, pointerY);
        gl.uniform1f(icosahedronUniforms.pointerActive, pointerActive);
        gl.uniform1f(icosahedronUniforms.scrollProgress, scrollProgress);
        gl.lineWidth(1);

        for (const object of sceneObjects) {
          const worldDepth = Math.max(1, -object.position[2]);
          const depth = clamp((worldDepth - 3.5) / 18, 0, 1);
          const perspective = 1.7 / worldDepth;
          const drift =
            Math.max(object.driftAmplitude[0], object.driftAmplitude[1]) *
            perspective *
            1.35;
          gl.uniform3f(
            icosahedronUniforms.anchor,
            object.position[0] * perspective,
            object.position[1] * perspective,
            depth,
          );
          gl.uniform1f(icosahedronUniforms.scale, object.scale * 0.46);
          gl.uniform1f(icosahedronUniforms.phase, object.phase);
          gl.uniform1f(icosahedronUniforms.spin, object.rotationRate);
          gl.uniform1f(icosahedronUniforms.drift, drift);
          gl.uniform1f(icosahedronUniforms.driftRate, object.driftRate);
          gl.uniform3fv(icosahedronUniforms.rotationAxis, object.rotationAxis);
          gl.uniform3fv(
            icosahedronUniforms.color,
            DEEP_SEA_COLORS[object.colorIndex % DEEP_SEA_COLORS.length],
          );
          gl.uniform1f(
            icosahedronUniforms.opacity,
            clamp(object.edgeOpacity * 2.2, 0, 0.88),
          );
          gl.drawArrays(gl.LINES, 0, ICOSAHEDRON_EDGE_VERTICES.length / 3);
        }
        gl.disable(gl.BLEND);

        readyFrames += 1;
        if (readyFrames === 3) onReadyRef.current?.();
        animationFrame = window.requestAnimationFrame(render);
      };

      const visibilityChange = () => {
        window.cancelAnimationFrame(animationFrame);
        if (!document.hidden && !disposed) {
          lastRenderedAt = 0;
          animationFrame = window.requestAnimationFrame(render);
        }
      };
      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(markResize);

      window.addEventListener("resize", markResize);
      window.addEventListener("pointermove", pointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", pointerLeave);
      window.addEventListener("scroll", scroll, { passive: true });
      document.addEventListener("visibilitychange", visibilityChange);
      canvas.addEventListener("webglcontextlost", contextLost);
      resizeObserver?.observe(canvas);
      resize();
      scroll();
      animationFrame = window.requestAnimationFrame(render);

      return () => {
        disposed = true;
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", markResize);
        window.removeEventListener("pointermove", pointerMove);
        document.documentElement.removeEventListener(
          "pointerleave",
          pointerLeave,
        );
        window.removeEventListener("scroll", scroll);
        document.removeEventListener("visibilitychange", visibilityChange);
        canvas.removeEventListener("webglcontextlost", contextLost);
        resizeObserver?.disconnect();
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(edgeBuffer);
        gl.deleteProgram(waterProgram.program);
        gl.deleteShader(waterProgram.vertex);
        gl.deleteShader(waterProgram.fragment);
        gl.deleteProgram(icosahedronProgram.program);
        gl.deleteShader(icosahedronProgram.vertex);
        gl.deleteShader(icosahedronProgram.fragment);
      };
    } catch (error) {
      console.warn("Whole Body Records water enhancement unavailable.", error);
      onUnavailableRef.current?.();
    }
  }, []);

  return (
    <canvas
      aria-hidden="true"
      className={className}
      data-scene="deep-sea-signal-river"
      data-testid="wbr-deep-sea-canvas"
      ref={canvasRef}
    />
  );
}
