"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { RecordsFlowMark } from "@/components/whole-body-records/RecordsFlowMark";
import styles from "./HeroLab.module.css";

const concepts = [
  {
    name: "Confluence Choir",
    rationale:
      "Distinct voices descend from separate origins, then meet without losing their character. The shared river is the record.",
    image: "/images/backgrounds/hero-options/wbr-hero-01-confluence.png",
    index: "01",
  },
  {
    name: "Record Watershed",
    rationale:
      "The record becomes a living watershed: artists hold the source, songs form tributaries, and listeners enter downstream.",
    image: "/images/backgrounds/hero-options/wbr-hero-02-record-watershed.png",
    index: "02",
  },
  {
    name: "Voices Become Wave",
    rationale:
      "Many independent signals resolve into one coherent body of sound—a precise visual expression of collective resonance.",
    image: "/images/backgrounds/hero-options/wbr-hero-03-voices-wave.png",
    index: "03",
  },
  {
    name: "Artist Archipelago",
    rationale:
      "Each artist remains a sovereign world. A shared current connects the whole ecosystem without flattening its differences.",
    image:
      "/images/backgrounds/hero-options/wbr-hero-04-artist-archipelago.png",
    index: "04",
  },
  {
    name: "Source & Return",
    rationale:
      "Music travels outward toward the listener while attention, value, and belonging visibly return to the artists who made it.",
    image: "/images/backgrounds/hero-options/wbr-hero-05-source-return.png",
    index: "05",
  },
] as const;

const LAST_OPTION = concepts.length - 1;

export function HeroLab() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabListId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeConcept = concepts[activeIndex];

  const selectConcept = useCallback((index: number, moveFocus = false) => {
    const nextIndex = Math.max(0, Math.min(index, LAST_OPTION));
    setActiveIndex(nextIndex);
    if (moveFocus) {
      requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
    }
  }, []);

  const handlePickerKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === LAST_OPTION ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? LAST_OPTION : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = LAST_OPTION;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    selectConcept(nextIndex, true);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const selectedIndex = Number(event.key) - 1;
      if (
        Number.isInteger(selectedIndex) &&
        selectedIndex >= 0 &&
        selectedIndex <= LAST_OPTION
      ) {
        selectConcept(selectedIndex);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectConcept]);

  return (
    <main className={styles.lab}>
      <a className={styles.skipLink} href="#hero-lab-stage">
        Skip to the active hero
      </a>

      <header className={styles.labHeader}>
        <Link
          className={styles.wordmark}
          href="/"
          aria-label="Whole Body Records home"
        >
          <span aria-hidden="true" className={styles.mark}>
            <RecordsFlowMark className={styles.flowMark} decorative />
          </span>
          <span>Whole Body Records</span>
        </Link>
        <p>Private hero study · five directions</p>
      </header>

      <section
        aria-labelledby={`${tabListId}-tab-${activeIndex}`}
        className={styles.stage}
        id="hero-lab-stage"
        role="tabpanel"
        tabIndex={0}
      >
        {concepts.map((concept, index) => (
          <div
            aria-hidden={index !== activeIndex}
            className={`${styles.imageField} ${
              index === activeIndex ? styles.imageFieldActive : ""
            }`}
            key={concept.name}
            style={
              {
                "--hero-image": `url("${concept.image}")`,
              } as CSSProperties
            }
          />
        ))}

        <div className={styles.depthWash} aria-hidden="true" />

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Many artists · one living system</p>
          <h1>Many voices. One whole body.</h1>
          <p className={styles.subhead}>
            A self-sustaining creative economy for artists who own their work
            and fans who seek the source.
          </p>
          <nav aria-label="Hero actions" className={styles.actions}>
            <Link className={styles.primaryAction} href="/submit">
              Join the roster →
            </Link>
            <Link href="/catalog">Explore catalog</Link>
            <Link href="/submit#submission-form">Submit your work</Link>
          </nav>
        </div>

        <aside className={styles.conceptNote}>
          <span>{activeConcept.index} / 05</span>
          <h2>{activeConcept.name}</h2>
          <p>{activeConcept.rationale}</p>
        </aside>
      </section>

      <nav
        aria-label="Choose a hero concept"
        className={styles.picker}
        id={tabListId}
        role="tablist"
      >
        <p>
          <span>Hero study</span>
          <small>Keys 1–5</small>
        </p>
        <div className={styles.pickerOptions}>
          {concepts.map((concept, index) => (
            <button
              aria-controls="hero-lab-stage"
              aria-selected={index === activeIndex}
              className={styles.pickerOption}
              id={`${tabListId}-tab-${index}`}
              key={concept.name}
              onClick={() => selectConcept(index)}
              onKeyDown={(event) => handlePickerKeyDown(event, index)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={index === activeIndex ? 0 : -1}
              type="button"
            >
              <span>{concept.index}</span>
              <strong>{concept.name}</strong>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
