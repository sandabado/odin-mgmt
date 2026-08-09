"use client";

import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { RecordsFlowMark } from "./RecordsFlowMark";
import { RecordsTerrainRiver } from "./brand/RecordsTerrainRiver";

export interface MuseumPageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
}

export function MuseumPageHero({
  eyebrow,
  title,
  description,
}: MuseumPageHeroProps) {
  const reduceMotion = useReducedMotion();
  const [flowing, setFlowing] = useState(false);
  const [cycle, setCycle] = useState(0);

  const openCurrent = () => {
    setFlowing(true);
    setCycle((value) => value + 1);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty(
      "--mountain-shift-x",
      `${horizontal * 12}px`,
    );
    event.currentTarget.style.setProperty(
      "--mountain-shift-y",
      `${vertical * 7}px`,
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openCurrent();
  };

  return (
    <section
      className="museum-page-hero museum-page-hero--terrain"
      data-flowing={flowing}
      onKeyDown={handleKeyDown}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--mountain-shift-x", "0px");
        event.currentTarget.style.setProperty("--mountain-shift-y", "0px");
        setFlowing(false);
      }}
      onPointerMove={handlePointerMove}
      tabIndex={0}
    >
      <RecordsTerrainRiver active={flowing} cycle={cycle} />
      <div className="museum-page-hero__veil" aria-hidden="true" />
      <div className="museum-page-hero__copy">
        <p className="records-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <button
        aria-label="Send the water through the mountain"
        className="museum-page-hero__source"
        onClick={openCurrent}
        type="button"
      >
        <RecordsFlowMark decorative />
        <span>{flowing ? "Current open" : "Open current"}</span>
      </button>
    </section>
  );
}
