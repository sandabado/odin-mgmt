"use client";

import { useEffect, useRef, useState } from "react";
import { RecordsFlowMark } from "./RecordsFlowMark";
import styles from "./PoolingWaterClosing.module.css";

export interface PoolingWaterClosingProps {
  /** Additional class name for embedding the ritual in a shared surface. */
  className?: string;
  /** Keeps the standalone contact/social coda available without duplicating footer metadata. */
  showMeta?: boolean;
}

export function PoolingWaterClosing({
  className,
  showMeta = true,
}: PoolingWaterClosingProps = {}) {
  const rippleFrameRef = useRef<number | null>(null);
  const surgeTimeoutRef = useRef<number | null>(null);
  const [surging, setSurging] = useState(false);

  const sendRipple = () => {
    if (rippleFrameRef.current !== null) {
      window.cancelAnimationFrame(rippleFrameRef.current);
    }
    if (surgeTimeoutRef.current !== null) {
      window.clearTimeout(surgeTimeoutRef.current);
    }

    setSurging(false);
    rippleFrameRef.current = window.requestAnimationFrame(() => {
      rippleFrameRef.current = null;
      setSurging(true);
    });
    surgeTimeoutRef.current = window.setTimeout(() => {
      surgeTimeoutRef.current = null;
      setSurging(false);
    }, 1800);
  };

  useEffect(
    () => () => {
      if (rippleFrameRef.current !== null) {
        window.cancelAnimationFrame(rippleFrameRef.current);
      }
      if (surgeTimeoutRef.current !== null) {
        window.clearTimeout(surgeTimeoutRef.current);
      }
    },
    [],
  );

  return (
    <section
      aria-labelledby="pooling-water-title"
      className={`${styles.section} ${className ?? ""}`.trim()}
      data-surging={surging}
    >
      <div aria-hidden="true" className={styles.currentField}>
        <span className={styles.fallingWater}>
          {Array.from({ length: 9 }, (_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className={`${styles.current} ${styles.currentFar}`} />
        <span className={`${styles.current} ${styles.currentMiddle}`} />
        <span className={`${styles.current} ${styles.currentNear}`} />
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>Many voices · One whole body</p>

        <button
          aria-label="Send a ripple through the Whole Body current"
          className={styles.drain}
          data-surging={surging}
          onClick={sendRipple}
          type="button"
        >
          <span aria-hidden="true" className={styles.ripple} />
          <span aria-hidden="true" className={styles.basin} />
          <RecordsFlowMark className={styles.flowMark} decorative />
        </button>

        <div className={styles.scripture}>
          <h2 id="pooling-water-title">Music lives here.</h2>
          <p>
            <span>Paper gives the system stillness.</span>
            <span>Ink gives it intelligence.</span>
            <strong>The artist gives it life.</strong>
          </p>
        </div>

        {showMeta ? (
          <div className={styles.meta}>
            <p>
              © 2026 Whole Body Studios <i aria-hidden="true">·</i>{" "}
              <a href="https://www.odin.management/">odin.management</a>
            </p>
            <a href="mailto:records@wholebody.earth">records@wholebody.earth</a>
            <nav aria-label="Whole Body Records social links">
              <a
                href="https://instagram.com/sandabadomusic"
                rel="noreferrer"
                target="_blank"
              >
                Instagram
              </a>
              <a href="mailto:records@wholebody.earth?subject=Whole%20Body%20Records%20YouTube">
                YouTube · request
              </a>
              <a href="mailto:records@wholebody.earth?subject=Whole%20Body%20Records%20Disco.ac">
                Disco.ac · request
              </a>
            </nav>
          </div>
        ) : null}
      </div>
    </section>
  );
}
