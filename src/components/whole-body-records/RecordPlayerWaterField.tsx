"use client";

import { useEffect, useRef, useState } from "react";
import { waterFragmentShader, waterVertexShader } from "./water-shaders";
import styles from "./RecordPlayerWaterField.module.css";

export interface RecordPlayerWaterFieldProps {
  /** Optional chapter-local styling hook. The field remains decorative. */
  className?: string;
}

type MotionPolicy = "checking" | "full" | "reduced" | "save-data";
type WaterState = "fallback" | "loading" | "ready" | "unavailable";

interface NetworkInformation {
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
  saveData?: boolean;
}

const WATER_PALETTE = {
  base: new Float32Array([10 / 255, 10 / 255, 9 / 255]),
  primary: new Float32Array([45 / 255, 156 / 255, 219 / 255]),
  secondary: new Float32Array([16 / 255, 16 / 255, 15 / 255]),
  surface: new Float32Array([245 / 255, 242 / 255, 235 / 255]),
} as const;

const PRELOAD_MARGIN = "320px 0px";
const MAX_FRAMEBUFFER_PIXELS = 1_200_000;

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Water shader allocation failed.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message =
      gl.getShaderInfoLog(shader) ?? "Water shader compilation failed.";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, waterVertexShader);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, waterFragmentShader);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error("Water program allocation failed.");
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message =
      gl.getProgramInfoLog(program) ?? "Water program link failed.";
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error(message);
  }

  return { fragment, program, vertex };
}

/**
 * Chapter-scoped water enhancement for the inline record-player room.
 *
 * Integration contract: mount this as the first child of a positioned,
 * isolated chapter and keep readable chapter content in a higher stacking
 * layer. The component never captures pointer events or creates audio.
 */
export function RecordPlayerWaterField({
  className = "",
}: RecordPlayerWaterFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasApproached, setHasApproached] = useState(false);
  const [motionPolicy, setMotionPolicy] = useState<MotionPolicy>("checking");
  const [waterState, setWaterState] = useState<WaterState>("fallback");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!("IntersectionObserver" in window)) {
      setHasApproached(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasApproached(true);
        observer.disconnect();
      },
      { rootMargin: PRELOAD_MARGIN, threshold: 0 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection;
    const updatePolicy = () => {
      if (motion.matches) {
        setMotionPolicy("reduced");
      } else if (connection?.saveData) {
        setMotionPolicy("save-data");
      } else {
        setMotionPolicy("full");
      }
    };

    updatePolicy();
    motion.addEventListener("change", updatePolicy);
    connection?.addEventListener?.("change", updatePolicy);
    return () => {
      motion.removeEventListener("change", updatePolicy);
      connection?.removeEventListener?.("change", updatePolicy);
    };
  }, []);

  useEffect(() => {
    if (motionPolicy !== "full") setWaterState("fallback");
  }, [motionPolicy]);

  const canRender =
    hasApproached && motionPolicy === "full" && waterState !== "unavailable";

  useEffect(() => {
    if (!canRender) return;

    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let disposed = false;
    let animationFrame = 0;
    let isIntersecting = false;
    let elapsed = 0;
    let lastRenderedAt = 0;
    let readyFrames = 0;
    let resizeDirty = true;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let pointerTargetX = 0.5;
    let pointerTargetY = 0.5;
    let pointerEnergy = 0;
    let pointerTargetEnergy = 0;
    let interactionSpeed = 0;
    let lastPointerX = 0.5;
    let lastPointerY = 0.5;
    let sectionProgress = 0.5;
    let sectionScrollSpeed = 0;
    let previousSectionProgress = 0.5;

    const markUnavailable = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (!disposed) setWaterState("unavailable");
    };

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });
    if (!gl) {
      markUnavailable();
      return;
    }

    try {
      const shaderProgram = createProgram(gl);
      const positionBuffer = gl.createBuffer();
      if (!positionBuffer) {
        throw new Error("Water geometry buffer allocation failed.");
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );

      const position = gl.getAttribLocation(shaderProgram.program, "aPosition");
      const uniforms = {
        time: gl.getUniformLocation(shaderProgram.program, "uTime"),
        resolution: gl.getUniformLocation(shaderProgram.program, "uResolution"),
        pointer: gl.getUniformLocation(shaderProgram.program, "uPointer"),
        pointerActive: gl.getUniformLocation(
          shaderProgram.program,
          "uPointerActive",
        ),
        scrollProgress: gl.getUniformLocation(
          shaderProgram.program,
          "uScrollProgress",
        ),
        scrollSpeed: gl.getUniformLocation(
          shaderProgram.program,
          "uScrollSpeed",
        ),
        colorBase: gl.getUniformLocation(shaderProgram.program, "uColorBase"),
        colorPrimary: gl.getUniformLocation(
          shaderProgram.program,
          "uColorPrimary",
        ),
        colorSecondary: gl.getUniformLocation(
          shaderProgram.program,
          "uColorSecondary",
        ),
        colorSurface: gl.getUniformLocation(
          shaderProgram.program,
          "uColorSurface",
        ),
      };

      const updateSectionProgress = () => {
        const bounds = root.getBoundingClientRect();
        const next = clamp(
          (window.innerHeight - bounds.top) /
            Math.max(1, window.innerHeight + bounds.height),
        );
        sectionScrollSpeed = Math.min(
          1,
          Math.abs(next - previousSectionProgress) * 18,
        );
        sectionProgress = next;
        previousSectionProgress = next;
      };

      const pointerMove = (event: PointerEvent) => {
        const bounds = root.getBoundingClientRect();
        const inside =
          event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom;
        if (!inside) {
          pointerTargetEnergy = 0;
          return;
        }

        const nextX = clamp(
          (event.clientX - bounds.left) / Math.max(bounds.width, 1),
        );
        const nextY =
          1 - clamp((event.clientY - bounds.top) / Math.max(bounds.height, 1));
        const velocity = Math.hypot(nextX - lastPointerX, nextY - lastPointerY);
        pointerTargetX = nextX;
        pointerTargetY = nextY;
        pointerTargetEnergy = event.buttons ? 1 : 0.58;
        interactionSpeed = Math.min(1, interactionSpeed + velocity * 8);
        lastPointerX = nextX;
        lastPointerY = nextY;
      };

      const pointerDown = (event: PointerEvent) => {
        pointerMove(event);
        if (pointerTargetEnergy > 0) pointerTargetEnergy = 1;
      };
      const pointerUp = () => {
        pointerTargetEnergy = pointerTargetEnergy > 0 ? 0.58 : 0;
      };
      const clearPointer = () => {
        pointerTargetEnergy = 0;
      };
      const markResize = () => {
        resizeDirty = true;
      };

      const resize = () => {
        const width = Math.max(1, canvas.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        const pixelRatioLimit = Math.sqrt(
          MAX_FRAMEBUFFER_PIXELS / Math.max(1, width * height),
        );
        const ratio = Math.max(
          0.75,
          Math.min(
            window.devicePixelRatio || 1,
            width < 720 ? 1 : 1.25,
            pixelRatioLimit,
          ),
        );
        const framebufferWidth = Math.max(1, Math.floor(width * ratio));
        const framebufferHeight = Math.max(1, Math.floor(height * ratio));
        if (
          canvas.width !== framebufferWidth ||
          canvas.height !== framebufferHeight
        ) {
          canvas.width = framebufferWidth;
          canvas.height = framebufferHeight;
          gl.viewport(0, 0, framebufferWidth, framebufferHeight);
        }
        canvas.dataset.waterQuality = width < 720 ? "low" : "standard";
        resizeDirty = false;
      };

      const schedule = () => {
        if (disposed || !isIntersecting || document.hidden || animationFrame) {
          return;
        }
        animationFrame = window.requestAnimationFrame(render);
      };

      const render = (now: number) => {
        animationFrame = 0;
        if (disposed || !isIntersecting || document.hidden) return;

        const targetFps = canvas.clientWidth < 720 ? 24 : 30;
        const frameInterval = 1000 / targetFps;
        if (lastRenderedAt && now - lastRenderedAt < frameInterval) {
          schedule();
          return;
        }

        const deltaSeconds = Math.min(
          0.05,
          Math.max(
            1 / 120,
            lastRenderedAt ? (now - lastRenderedAt) / 1000 : 1 / 60,
          ),
        );
        lastRenderedAt = now;
        elapsed += deltaSeconds;
        if (resizeDirty) resize();

        const pointerEase = 1 - Math.pow(0.8, deltaSeconds * 60);
        const energyEase = 1 - Math.pow(0.74, deltaSeconds * 60);
        pointerX += (pointerTargetX - pointerX) * pointerEase;
        pointerY += (pointerTargetY - pointerY) * pointerEase;
        pointerEnergy += (pointerTargetEnergy - pointerEnergy) * energyEase;
        interactionSpeed *= Math.pow(0.9, deltaSeconds * 60);
        sectionScrollSpeed *= Math.pow(0.9, deltaSeconds * 60);

        gl.disable(gl.BLEND);
        gl.useProgram(shaderProgram.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(uniforms.time, elapsed);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform2f(uniforms.pointer, pointerX, pointerY);
        gl.uniform1f(uniforms.pointerActive, pointerEnergy);
        gl.uniform1f(uniforms.scrollProgress, sectionProgress);
        gl.uniform1f(
          uniforms.scrollSpeed,
          Math.max(sectionScrollSpeed, interactionSpeed * 0.7),
        );
        gl.uniform3fv(uniforms.colorBase, WATER_PALETTE.base);
        gl.uniform3fv(uniforms.colorPrimary, WATER_PALETTE.primary);
        gl.uniform3fv(uniforms.colorSecondary, WATER_PALETTE.secondary);
        gl.uniform3fv(uniforms.colorSurface, WATER_PALETTE.surface);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        readyFrames += 1;
        if (readyFrames === 3 && !disposed) setWaterState("ready");
        schedule();
      };

      const visibilityObserver =
        "IntersectionObserver" in window
          ? new IntersectionObserver(
              ([entry]) => {
                isIntersecting = Boolean(entry?.isIntersecting);
                lastRenderedAt = 0;
                if (isIntersecting) {
                  schedule();
                } else {
                  window.cancelAnimationFrame(animationFrame);
                  animationFrame = 0;
                }
              },
              { threshold: 0.01 },
            )
          : null;
      const visibilityChange = () => {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        lastRenderedAt = 0;
        if (!document.hidden) schedule();
      };
      const contextLost = (event: Event) => {
        event.preventDefault();
        markUnavailable();
      };
      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(markResize);

      window.addEventListener("pointermove", pointerMove, { passive: true });
      window.addEventListener("pointerdown", pointerDown, { passive: true });
      window.addEventListener("pointerup", pointerUp, { passive: true });
      window.addEventListener("blur", clearPointer);
      window.addEventListener("resize", markResize);
      window.addEventListener("scroll", updateSectionProgress, {
        passive: true,
      });
      document.addEventListener("visibilitychange", visibilityChange);
      canvas.addEventListener("webglcontextlost", contextLost);
      resizeObserver?.observe(canvas);
      visibilityObserver?.observe(root);
      resize();
      updateSectionProgress();
      setWaterState("loading");
      if (!visibilityObserver) {
        isIntersecting = true;
        schedule();
      }

      return () => {
        disposed = true;
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("pointermove", pointerMove);
        window.removeEventListener("pointerdown", pointerDown);
        window.removeEventListener("pointerup", pointerUp);
        window.removeEventListener("blur", clearPointer);
        window.removeEventListener("resize", markResize);
        window.removeEventListener("scroll", updateSectionProgress);
        document.removeEventListener("visibilitychange", visibilityChange);
        canvas.removeEventListener("webglcontextlost", contextLost);
        resizeObserver?.disconnect();
        visibilityObserver?.disconnect();
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(shaderProgram.program);
        gl.deleteShader(shaderProgram.vertex);
        gl.deleteShader(shaderProgram.fragment);
      };
    } catch (error) {
      console.warn(
        "Whole Body Records record-player water enhancement unavailable.",
        error,
      );
      markUnavailable();
    }
  }, [canRender]);

  return (
    <div
      aria-hidden="true"
      className={`${styles.field} ${className}`.trim()}
      data-motion-policy={motionPolicy}
      data-scope="record-player-chapter"
      data-water-state={waterState}
      ref={rootRef}
    >
      <div className={styles.fallback}>
        <span className={styles.current} />
        <span className={styles.surface} />
      </div>
      {canRender ? (
        <canvas
          aria-hidden="true"
          className={styles.canvas}
          data-testid="wbr-record-player-water-canvas"
          ref={canvasRef}
        />
      ) : null}
    </div>
  );
}
