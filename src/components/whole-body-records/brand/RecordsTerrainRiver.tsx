"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useId } from "react";
import styles from "./RecordsTerrainRiver.module.css";

const quietEase = [0.25, 0.1, 0.25, 1] as const;

const riverSegments = [
  {
    d: "M1625 274C1599 310 1570 344 1536 374C1508 399 1478 431 1442 459C1414 480 1386 495 1358 509",
    delay: 0,
    duration: 1.65,
    signalWidth: 1.1,
    washWidth: 4.2,
  },
  {
    d: "M1400 312C1393 348 1383 376 1374 408C1367 438 1364 474 1358 509",
    delay: 0.12,
    duration: 1.45,
    signalWidth: 0.9,
    washWidth: 3.2,
  },
  {
    d: "M1358 509C1309 525 1273 545 1226 568C1183 588 1145 609 1100 636",
    delay: 1.05,
    duration: 1.35,
    signalWidth: 1.7,
    washWidth: 8.5,
  },
  {
    d: "M1100 636C1053 654 1017 673 974 694C927 717 884 738 838 763",
    delay: 1.88,
    duration: 1.3,
    signalWidth: 2.6,
    washWidth: 17,
  },
  {
    d: "M838 763C789 789 753 814 708 838C666 861 625 888 584 915C566 928 551 940 538 953",
    delay: 2.62,
    duration: 1.45,
    signalWidth: 3.8,
    washWidth: 31,
  },
] as const;

export interface RecordsTerrainRiverProps {
  active?: boolean;
  className?: string;
  cycle?: number;
  priority?: boolean;
}

export function RecordsTerrainRiver({
  active = false,
  className = "",
  cycle = 0,
  priority = false,
}: RecordsTerrainRiverProps) {
  const reduceMotion = useReducedMotion();
  const gradientId = `wbr-river-${useId().replaceAll(":", "")}`;

  return (
    <div
      aria-hidden="true"
      className={`${styles.field} ${className}`.trim()}
      data-active={active}
    >
      <Image
        alt=""
        className={styles.painting}
        fill
        priority={priority}
        sizes="100vw"
        src="/images/backgrounds/wbr-monochrome-watercolor-river-v2.png"
      />
      <svg
        className={styles.overlay}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1672 941"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="1580"
            x2="560"
            y1="300"
            y2="940"
          >
            <stop offset="0" stopColor="#2d9cdb" stopOpacity="0.52" />
            <stop offset="0.5" stopColor="#2d9cdb" stopOpacity="0.38" />
            <stop offset="1" stopColor="#2d9cdb" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <g key={cycle}>
          {riverSegments.map((segment, index) => (
            <g key={`${cycle}-${index}`}>
              <motion.path
                className={styles.wash}
                d={segment.d}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                stroke={`url(#${gradientId})`}
                strokeWidth={segment.washWidth}
                transition={{
                  delay: reduceMotion ? 0 : segment.delay,
                  duration: reduceMotion ? 0 : segment.duration,
                  ease: quietEase,
                }}
              />
              <path
                className={styles.signal}
                d={segment.d}
                pathLength="1"
                strokeWidth={segment.signalWidth}
                style={{ animationDelay: `${segment.delay}s` }}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
