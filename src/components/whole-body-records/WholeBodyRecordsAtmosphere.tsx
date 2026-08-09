"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WaterPalette } from "./WaterCanvas";
import { DeepSeaFallback } from "./DeepSeaFallback";

export interface WholeBodyRecordsAtmosphereProps {
  audioEnabled?: boolean;
  className?: string;
  palette?: WaterPalette;
  waterEnabled?: boolean;
}

type AudioGraph = {
  context: AudioContext;
  gain: GainNode;
  noise: AudioBufferSourceNode;
  lfo: OscillatorNode;
};

type MotionPolicy =
  "disabled" | "full" | "loading" | "reduced" | "save-data" | "unavailable";

interface NetworkInformation {
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
  saveData?: boolean;
}

function afterPaint(callback: () => void) {
  let idleId: number | undefined;
  const frameOne = window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(callback, { timeout: 500 });
      } else {
        globalThis.setTimeout(callback, 48);
      }
    });
  });
  return () => {
    window.cancelAnimationFrame(frameOne);
    if (idleId !== undefined && "cancelIdleCallback" in window) {
      window.cancelIdleCallback(idleId);
    }
  };
}

function buildAudioGraph(): AudioGraph {
  const context = new AudioContext();
  const seconds = 4;
  const buffer = context.createBuffer(
    1,
    context.sampleRate * seconds,
    context.sampleRate,
  );
  const channel = buffer.getChannelData(0);
  let previous = 0;
  for (let index = 0; index < channel.length; index += 1) {
    const white = Math.random() * 2 - 1;
    previous = previous * 0.985 + white * 0.015;
    channel[index] = previous;
  }

  const noise = context.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const lowPass = context.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.value = 540;
  lowPass.Q.value = 0.7;
  const gain = context.createGain();
  gain.gain.value = 0;
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.009;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  noise.connect(lowPass);
  lowPass.connect(gain);
  gain.connect(context.destination);
  noise.start();
  lfo.start();
  return { context, gain, noise, lfo };
}

export function WholeBodyRecordsAtmosphere({
  audioEnabled = true,
  className = "",
  palette,
  waterEnabled = true,
}: WholeBodyRecordsAtmosphereProps) {
  const [WaterCanvas, setWaterCanvas] = useState<
    null | typeof import("./WaterCanvas").default
  >(null);
  const [waterReady, setWaterReady] = useState(false);
  const [waterFailed, setWaterFailed] = useState(false);
  const [motionPolicy, setMotionPolicy] = useState<MotionPolicy>(
    waterEnabled ? "loading" : "disabled",
  );
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<AudioGraph | null>(null);
  const waterUnavailable = motionPolicy !== "full" || waterFailed;

  useEffect(() => {
    if (!waterEnabled) {
      setMotionPolicy("disabled");
      return;
    }

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
  }, [waterEnabled]);

  useEffect(() => {
    if (motionPolicy !== "full" || WaterCanvas) return;
    let cancelled = false;
    const cancelAfterPaint = afterPaint(() => {
      import("./WaterCanvas")
        .then((module) => {
          if (!cancelled) setWaterCanvas(() => module.default);
        })
        .catch(() => {
          if (!cancelled) {
            setWaterReady(false);
            setWaterFailed(true);
          }
        });
    });
    return () => {
      cancelled = true;
      cancelAfterPaint();
    };
  }, [WaterCanvas, motionPolicy]);

  useEffect(() => {
    if (motionPolicy !== "full") setWaterReady(false);
  }, [motionPolicy]);

  useEffect(() => {
    const handleClientError = (event: ErrorEvent) => {
      if (/webgl/i.test(event.message)) {
        console.warn(
          "[WBR] WebGL failed; the Records gradient fallback remains active.",
        );
        setWaterReady(false);
        setWaterFailed(true);
      }
    };
    window.addEventListener("error", handleClientError);
    return () => window.removeEventListener("error", handleClientError);
  }, []);

  useEffect(() => {
    if (!audioEnabled) return;
    setSoundOn(window.localStorage.getItem("wbr-ambient-sound") === "on");
  }, [audioEnabled]);

  useEffect(() => {
    if (!audioEnabled || !soundOn || !waterReady) return;
    const resume = () => {
      try {
        const graph = audioRef.current ?? buildAudioGraph();
        audioRef.current = graph;
        void graph.context
          .resume()
          .then(() => {
            const now = graph.context.currentTime;
            graph.gain.gain.cancelScheduledValues(now);
            graph.gain.gain.setValueAtTime(graph.gain.gain.value, now);
            graph.gain.gain.linearRampToValueAtTime(0.035, now + 1.2);
          })
          .catch(() => undefined);
      } catch {
        setSoundOn(false);
        window.localStorage.setItem("wbr-ambient-sound", "off");
      }
    };
    resume();
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [audioEnabled, soundOn, waterReady]);

  useEffect(() => {
    if (!audioEnabled || !soundOn || !waterReady) return;
    const root = document.documentElement;
    const syncMusicDuck = () => {
      const graph = audioRef.current;
      if (!graph) return;
      const now = graph.context.currentTime;
      const musicPlaying = root.dataset.wbrPlayback === "playing";
      graph.gain.gain.cancelScheduledValues(now);
      graph.gain.gain.setValueAtTime(graph.gain.gain.value, now);
      graph.gain.gain.linearRampToValueAtTime(
        musicPlaying ? 0 : 0.035,
        now + (musicPlaying ? 0.45 : 1.2),
      );
    };
    const observer = new MutationObserver(syncMusicDuck);
    observer.observe(root, {
      attributeFilter: ["data-wbr-playback"],
      attributes: true,
    });
    syncMusicDuck();
    return () => observer.disconnect();
  }, [audioEnabled, soundOn, waterReady]);

  useEffect(
    () => () => {
      const graph = audioRef.current;
      if (!graph) return;
      graph.noise.stop();
      graph.lfo.stop();
      void graph.context.close();
    },
    [],
  );

  const toggleSound = useCallback(() => {
    if (!audioEnabled) return;
    const next = !soundOn;
    setSoundOn(next);
    window.localStorage.setItem("wbr-ambient-sound", next ? "on" : "off");
    const graph = audioRef.current;
    if (!next && graph) {
      const now = graph.context.currentTime;
      graph.gain.gain.cancelScheduledValues(now);
      graph.gain.gain.setValueAtTime(graph.gain.gain.value, now);
      graph.gain.gain.linearRampToValueAtTime(0, now + 0.35);
    }
  }, [audioEnabled, soundOn]);

  return (
    <div
      aria-hidden={waterUnavailable && !audioEnabled ? "true" : undefined}
      className={`water-canvas-container ${waterReady ? "water-canvas-container--ready" : ""} ${waterUnavailable ? "water-canvas-container--static" : ""} ${className}`.trim()}
      data-motion-policy={waterFailed ? "unavailable" : motionPolicy}
      data-scene="deep-sea-signal-river"
      data-water-state={
        waterReady ? "ready" : waterUnavailable ? "fallback" : "loading"
      }
    >
      <DeepSeaFallback visible={!waterReady || waterUnavailable} />
      {WaterCanvas && !waterUnavailable ? (
        <WaterCanvas
          className="water-canvas"
          onReady={() => setWaterReady(true)}
          onUnavailable={() => {
            setWaterReady(false);
            setWaterFailed(true);
          }}
          palette={palette}
        />
      ) : null}
      <button
        aria-label={
          audioEnabled
            ? `Turn ambient field ${soundOn ? "off" : "on"}`
            : "Ambient field unavailable"
        }
        aria-pressed={soundOn}
        className="ambient-audio-toggle"
        disabled={!audioEnabled || !waterReady}
        onClick={toggleSound}
        title={
          !audioEnabled
            ? "Ambient sound is disabled."
            : !waterReady
              ? "Ambient sound becomes available with the water field."
              : undefined
        }
        type="button"
      >
        <span aria-hidden="true">{soundOn ? "◉" : "○"}</span>
        {soundOn ? "Ambient on" : "Ambient off"}
      </button>
    </div>
  );
}
