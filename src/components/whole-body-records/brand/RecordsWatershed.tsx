"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useId } from "react";
import styles from "./RecordsWatershed.module.css";

const quietEase = [0.25, 0.1, 0.25, 1] as const;

const tributaries = [
  {
    d: "M790 145C824 154 862 164 892 179C916 190 914 204 892 218C874 230 885 243 915 255C953 270 1000 269 1044 287",
    delay: 0,
    duration: 2.7,
    washWidth: 4,
  },
  {
    d: "M912 143C948 156 988 166 1015 184C1032 196 1028 211 1009 224C995 234 1009 251 1044 287",
    delay: 0.08,
    duration: 2.55,
    washWidth: 4.5,
  },
  {
    d: "M1025 143C1060 157 1100 168 1125 188C1141 202 1137 216 1119 231C1104 244 1108 260 1139 278C1162 292 1170 310 1160 337",
    delay: 0.14,
    duration: 2.65,
    washWidth: 5,
  },
  {
    d: "M1145 143C1180 154 1219 169 1245 189C1260 201 1252 218 1228 233C1207 248 1216 267 1250 289",
    delay: 0.21,
    duration: 2.8,
    washWidth: 5.5,
  },
  {
    d: "M1276 143C1312 155 1352 170 1377 190C1394 204 1383 222 1358 238C1338 251 1343 270 1375 287C1393 297 1394 310 1381 321",
    delay: 0.29,
    duration: 2.9,
    washWidth: 6,
  },
  {
    d: "M1402 143C1443 156 1486 172 1512 194C1529 208 1518 226 1490 241C1463 256 1460 276 1487 291C1504 301 1498 314 1475 324",
    delay: 0.36,
    duration: 3.05,
    washWidth: 6.5,
  },
  {
    d: "M1570 145C1600 160 1620 178 1626 198C1630 215 1609 232 1580 246C1550 260 1542 279 1560 294C1570 304 1550 317 1518 326",
    delay: 0.44,
    duration: 3.2,
    washWidth: 7,
  },
] as const;

const mergeCurrents = [
  {
    d: "M1518 326C1470 322 1430 319 1381 321C1334 314 1298 302 1250 289",
    delay: 1.9,
    duration: 1.2,
    washWidth: 8,
  },
  {
    d: "M1250 289C1218 307 1190 323 1160 337",
    delay: 2.55,
    duration: 0.9,
    washWidth: 11,
  },
  {
    d: "M1044 287C1082 305 1125 317 1160 337",
    delay: 1.92,
    duration: 1.2,
    washWidth: 12,
  },
  {
    d: "M1160 337C1171 356 1152 376 1114 398C1105 411 1101 425 1103 442",
    delay: 3.1,
    duration: 1.25,
    washWidth: 18,
  },
] as const;

const grooveCurrents = [
  {
    d: "M990 415C1027 387 1176 387 1214 415",
    delay: 3.55,
    width: 1,
  },
  {
    d: "M1218 456C1202 486 1152 501 1104 501",
    delay: 3.9,
    width: 0.9,
  },
  {
    d: "M1102 501C1045 502 999 484 985 453",
    delay: 4.15,
    width: 0.9,
  },
  {
    d: "M945 397C1005 354 1214 350 1270 399",
    delay: 4.45,
    width: 0.85,
  },
  {
    d: "M1285 457C1264 508 1184 534 1104 534",
    delay: 4.85,
    width: 0.8,
  },
  {
    d: "M1102 534C1015 535 942 507 918 458",
    delay: 5.2,
    width: 0.8,
  },
] as const;

const returnCurrents = [
  {
    d: "M1103 486C1087 507 1069 526 1045 543C1034 552 1028 559 1027 568",
    delay: 3.9,
    duration: 0.9,
    washWidth: 13,
  },
  {
    d: "M1027 568C1004 592 985 614 957 635C943 646 930 658 916 675",
    delay: 4.45,
    duration: 1.05,
    washWidth: 24,
  },
  {
    d: "M916 675C883 701 849 724 810 746C780 763 750 783 720 803",
    delay: 5,
    duration: 1.15,
    washWidth: 42,
  },
  {
    d: "M720 803C682 827 648 851 620 876C602 892 584 914 567 941",
    delay: 5.65,
    duration: 1.3,
    washWidth: 72,
  },
] as const;

export interface RecordsWatershedProps {
  active?: boolean;
  className?: string;
  cycle?: number;
  priority?: boolean;
}

export function RecordsWatershed({
  active = false,
  className = "",
  cycle = 0,
  priority = false,
}: RecordsWatershedProps) {
  const reduceMotion = useReducedMotion();
  const instanceId = useId().replaceAll(":", "");
  const sourceGradientId = `wbr-watershed-source-${instanceId}`;
  const returnGradientId = `wbr-watershed-return-${instanceId}`;

  const pathAnimation = {
    initial: reduceMotion
      ? { opacity: 1, pathLength: 1 }
      : { opacity: 0, pathLength: 0 },
    animate: { opacity: 1, pathLength: 1 },
  } as const;

  return (
    <div
      aria-hidden="true"
      className={`${styles.field} ${className}`.trim()}
      data-active={active}
      data-records-watershed="true"
    >
      <Image
        alt=""
        className={styles.painting}
        fill
        priority={priority}
        sizes="100vw"
        src="/images/backgrounds/hero-options/wbr-hero-02-record-watershed.png"
      />

      <svg
        className={styles.overlay}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1672 941"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={sourceGradientId}
            gradientUnits="userSpaceOnUse"
            x1="1105"
            x2="1105"
            y1="140"
            y2="445"
          >
            <stop offset="0" stopColor="#2d9cdb" stopOpacity="0.08" />
            <stop offset="0.7" stopColor="#2d9cdb" stopOpacity="0.42" />
            <stop offset="1" stopColor="#2d9cdb" stopOpacity="0.68" />
          </linearGradient>
          <linearGradient
            id={returnGradientId}
            gradientUnits="userSpaceOnUse"
            x1="1105"
            x2="610"
            y1="480"
            y2="941"
          >
            <stop offset="0" stopColor="#2d9cdb" stopOpacity="0.62" />
            <stop offset="0.52" stopColor="#2d9cdb" stopOpacity="0.36" />
            <stop offset="1" stopColor="#2d9cdb" stopOpacity="0.14" />
          </linearGradient>
        </defs>

        <g key={`watershed-${cycle}`}>
          <g className={styles.tributaries}>
            {tributaries.map((tributary, index) => (
              <g key={`tributary-${index}`}>
                <motion.path
                  {...pathAnimation}
                  className={styles.sourceWash}
                  d={tributary.d}
                  stroke={`url(#${sourceGradientId})`}
                  strokeWidth={tributary.washWidth}
                  transition={{
                    delay: reduceMotion ? 0 : tributary.delay,
                    duration: reduceMotion ? 0.01 : tributary.duration,
                    ease: quietEase,
                  }}
                />
                <path
                  className={styles.sourceSignal}
                  d={tributary.d}
                  pathLength="1"
                  style={{ animationDelay: `${tributary.delay * -1.8}s` }}
                />
              </g>
            ))}
          </g>

          <g className={styles.merges}>
            {mergeCurrents.map((current, index) => (
              <g key={`merge-${index}`}>
                <motion.path
                  {...pathAnimation}
                  className={styles.mergeWash}
                  d={current.d}
                  stroke={`url(#${sourceGradientId})`}
                  strokeWidth={current.washWidth}
                  transition={{
                    delay: reduceMotion ? 0 : current.delay,
                    duration: reduceMotion ? 0.01 : current.duration,
                    ease: quietEase,
                  }}
                />
                <path
                  className={styles.mergeSignal}
                  d={current.d}
                  pathLength="1"
                  strokeWidth={1.4 + index * 0.32}
                  style={{ animationDelay: `${current.delay * -1.8}s` }}
                />
              </g>
            ))}
          </g>

          <g className={styles.grooves}>
            {grooveCurrents.map((groove, index) => (
              <g key={`groove-${index}`}>
                <motion.path
                  {...pathAnimation}
                  className={styles.grooveWash}
                  d={groove.d}
                  strokeWidth={groove.width * 4}
                  transition={{
                    delay: reduceMotion ? 0 : groove.delay,
                    duration: reduceMotion ? 0.01 : 2.6 + index * 0.18,
                    ease: quietEase,
                  }}
                />
                <path
                  className={styles.grooveSignal}
                  d={groove.d}
                  pathLength="1"
                  strokeWidth={groove.width}
                  style={{ animationDelay: `${groove.delay * -2}s` }}
                />
              </g>
            ))}
          </g>

          <g className={styles.returnFlow}>
            {returnCurrents.map((current, index) => (
              <g key={`return-${index}`}>
                <motion.path
                  {...pathAnimation}
                  className={styles.returnWash}
                  d={current.d}
                  stroke={`url(#${returnGradientId})`}
                  strokeWidth={current.washWidth}
                  transition={{
                    delay: reduceMotion ? 0 : current.delay,
                    duration: reduceMotion ? 0.01 : current.duration,
                    ease: quietEase,
                  }}
                />
                <path
                  className={styles.returnSignal}
                  d={current.d}
                  pathLength="1"
                  strokeWidth={1.8 + index * 0.9}
                  style={{ animationDelay: `${current.delay * -1.5}s` }}
                />
              </g>
            ))}
          </g>

          <g className={styles.spindle}>
            <motion.ellipse
              className={styles.spindleRipple}
              cx="1105"
              cy="445"
              rx="44"
              ry="16"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.55 }}
              animate={{ opacity: [0, 0.65, 0], scale: [0.55, 1.7, 2.35] }}
              transition={{
                delay: reduceMotion ? 0 : 2.1,
                duration: reduceMotion ? 0.01 : active ? 2.8 : 5.6,
                ease: quietEase,
                repeat: reduceMotion ? 0 : Infinity,
                repeatDelay: active ? 0.6 : 2.2,
              }}
            />
            <circle className={styles.spindlePoint} cx="1105" cy="445" r="3" />
          </g>
        </g>
      </svg>

      <span className={styles.currentMist} />
    </div>
  );
}
