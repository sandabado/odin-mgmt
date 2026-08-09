"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type {
  PlayablePublicRelease,
  PublicArtist,
  PublicRelease,
  PublicShow,
} from "@/lib/public-catalog";
import type { PublicStoreProduct } from "@/lib/commerce/catalog";
import type { PublicEditorialItem } from "@/lib/public-editorial";
import type { RecordsLabelSlide } from "@/lib/records-label-current";
import { FeaturedArtistPortal } from "./FeaturedArtistPortal";
import { RecordPlayerWaterField } from "./RecordPlayerWaterField";
import { RecordsBookingCorridor } from "./RecordsBookingCorridor";
import { RecordsFlowMark } from "./RecordsFlowMark";
import { RecordsHeader } from "./RecordsHeader";
import { RecordsRevenueCurrent } from "./RecordsRevenueCurrent";
import { RecordsWatershed } from "./brand/RecordsWatershed";
import { useTurntable } from "./turntable/TurntableProvider";
import styles from "./InkOnWaterPreview.module.css";

export interface InkOnWaterPreviewProps {
  artist?: PublicArtist;
  artists: PublicArtist[];
  editorial: PublicEditorialItem[];
  heroSlides: RecordsLabelSlide[];
  playableRelease?: PlayablePublicRelease;
  products: PublicStoreProduct[];
  release?: PublicRelease;
  releases: PublicRelease[];
  secondaryArtist?: PublicArtist;
  tourDates: PublicShow[];
}

const quietEase = [0.25, 0.1, 0.25, 1] as const;

export function InkOnWaterPreview({
  artist,
  artists,
  editorial,
  heroSlides,
  playableRelease,
  products,
  release,
  releases,
  secondaryArtist,
  tourDates,
}: InkOnWaterPreviewProps) {
  const reduceMotion = useReducedMotion();
  const [currentOpen, setCurrentOpen] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [carouselTouched, setCarouselTouched] = useState(false);
  const [watershedCycle, setWatershedCycle] = useState(0);
  const heroPointerFrame = useRef<number | null>(null);
  const pendingHeroPointer = useRef<{
    element: HTMLElement;
    x: number;
    y: number;
  } | null>(null);
  const activeSlide = heroSlides[activeHeroSlide] ?? heroSlides[0];

  useEffect(() => {
    if (reduceMotion || carouselPaused || heroSlides.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveHeroSlide((index) => (index + 1) % heroSlides.length);
      setCurrentOpen(false);
    }, 11_000);
    return () => window.clearInterval(interval);
  }, [carouselPaused, heroSlides.length, reduceMotion]);

  useEffect(
    () => () => {
      if (heroPointerFrame.current !== null) {
        window.cancelAnimationFrame(heroPointerFrame.current);
      }
    },
    [],
  );

  const handleHeroPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    pendingHeroPointer.current = {
      element: event.currentTarget,
      x: event.clientX,
      y: event.clientY,
    };
    if (heroPointerFrame.current !== null) return;
    heroPointerFrame.current = window.requestAnimationFrame(() => {
      heroPointerFrame.current = null;
      const pointer = pendingHeroPointer.current;
      if (!pointer) return;
      const bounds = pointer.element.getBoundingClientRect();
      const horizontal = (pointer.x - bounds.left) / bounds.width - 0.5;
      const vertical = (pointer.y - bounds.top) / bounds.height - 0.5;
      pointer.element.style.setProperty(
        "--watershed-shift-x",
        `${horizontal * 20}px`,
      );
      pointer.element.style.setProperty(
        "--watershed-shift-y",
        `${vertical * 10}px`,
      );
    });
  };

  const resetHeroPointer = (event: PointerEvent<HTMLElement>) => {
    if (heroPointerFrame.current !== null) {
      window.cancelAnimationFrame(heroPointerFrame.current);
      heroPointerFrame.current = null;
    }
    pendingHeroPointer.current = null;
    event.currentTarget.style.setProperty("--watershed-shift-x", "0px");
    event.currentTarget.style.setProperty("--watershed-shift-y", "0px");
    setCurrentOpen(false);
  };

  const runWatershed = () => {
    if (activeSlide?.visual !== "watershed") return;
    setCurrentOpen(true);
    setWatershedCycle((cycle) => cycle + 1);
  };

  const handleHeroKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    runWatershed();
  };

  const selectHeroSlide = (index: number) => {
    setActiveHeroSlide(index);
    setCarouselTouched(true);
    setCurrentOpen(false);
  };

  return (
    <div
      className={`${styles.site} records-site records-museum records-continuous-flow records-home-flow records-ink-home`}
      data-current-open={currentOpen}
      data-records-route="home"
    >
      <a className={styles.skipLink} href="#ink-main">
        Skip to the preview
      </a>

      <RecordsHeader overlay />

      <main id="ink-main">
        <section
          className={styles.hero}
          onKeyDown={handleHeroKeyDown}
          onPointerDown={runWatershed}
          onPointerEnter={() => setCurrentOpen(true)}
          onPointerLeave={resetHeroPointer}
          onPointerMove={handleHeroPointerMove}
          tabIndex={0}
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              animate={{ opacity: 1 }}
              className={styles.heroMedia}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key={activeSlide?.id ?? "record-watershed"}
              transition={{ duration: reduceMotion ? 0 : 1.4, ease: quietEase }}
            >
              {activeSlide?.visual === "watershed" ? (
                <RecordsWatershed
                  active={currentOpen}
                  cycle={watershedCycle}
                  priority={activeHeroSlide === 0}
                />
              ) : activeSlide ? (
                <div className={styles.heroStill}>
                  <Image
                    alt=""
                    className={styles.heroStillImage}
                    fill
                    priority={activeHeroSlide === 0}
                    sizes="100vw"
                    src={activeSlide.image}
                  />
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className={styles.heroCopy}>
            <motion.p
              className={styles.eyebrow}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: quietEase }}
            >
              An instrument for many voices
            </motion.p>
            <motion.h1
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, delay: 0.15, ease: quietEase }}
            >
              Many voices.
              <em>One whole body.</em>
            </motion.h1>
            <motion.p
              className={styles.heroStatement}
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.8, delay: 0.45, ease: quietEase }}
            >
              A self-sustaining creative economy for artists who own their work
              and fans who seek the source.
            </motion.p>
            <nav aria-label="Hero actions" className={styles.heroActions}>
              <Link href="/submit">Join the roster →</Link>
              <Link href="/catalog">Explore catalog</Link>
              <Link href="/submit#submission-form">Submit your work</Link>
            </nav>
          </div>

          {activeSlide ? (
            <motion.aside
              animate={{ opacity: 1, y: 0 }}
              aria-atomic="true"
              aria-live={carouselTouched ? "polite" : "off"}
              className={styles.labelCurrent}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              key={`story-${activeSlide.id}`}
              transition={{ duration: reduceMotion ? 0 : 0.9, ease: quietEase }}
            >
              <div className={styles.currentHeading}>
                <RecordsFlowMark
                  className={styles.currentFlowMark}
                  decorative
                />
                <p>
                  <span>{activeSlide.kind.replaceAll("-", " ")}</span>
                  <small>{activeSlide.meta}</small>
                </p>
              </div>
              <h2>{activeSlide.title}</h2>
              <p className={styles.currentSummary}>{activeSlide.summary}</p>
              {activeSlide.external ? (
                <a
                  className={styles.currentLink}
                  href={activeSlide.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {activeSlide.action} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <Link className={styles.currentLink} href={activeSlide.href}>
                  {activeSlide.action} <span aria-hidden="true">→</span>
                </Link>
              )}
            </motion.aside>
          ) : null}

          <div className={styles.heroIndex}>
            <span aria-hidden="true">
              {String(activeHeroSlide + 1).padStart(2, "0")} /{" "}
              {String(heroSlides.length).padStart(2, "0")}
            </span>
            <div aria-label="Label current" className={styles.heroRail}>
              {heroSlides.map((slide, index) => (
                <button
                  aria-current={activeHeroSlide === index ? "true" : undefined}
                  aria-label={`Show ${slide.title}`}
                  key={slide.id}
                  onClick={() => selectHeroSlide(index)}
                  onPointerDown={(event) => event.stopPropagation()}
                  type="button"
                >
                  <i />
                </button>
              ))}
            </div>
            <button
              aria-label={
                carouselPaused ? "Resume label current" : "Pause label current"
              }
              className={styles.carouselPause}
              onClick={() => {
                setCarouselPaused((paused) => !paused);
                setCarouselTouched(true);
              }}
              onPointerDown={(event) => event.stopPropagation()}
              type="button"
            >
              {carouselPaused ? "Play" : "Pause"}
            </button>
          </div>
        </section>

        <section className={styles.artistRoom} data-featured-artist-section="">
          <div className={styles.roomIntro}>
            <p className={styles.eyebrow}>Artist 001 · Full color by consent</p>
            <h2>
              {artist?.name ?? "The artist"}
              <em>
                {artist?.description ??
                  "Portrait, records, story, and the living work around them."}
              </em>
            </h2>
          </div>

          <FeaturedArtistPortal
            artist={artist}
            editorial={editorial}
            featuredRelease={release}
            products={products}
            releases={releases}
            shows={tourDates}
          />
        </section>

        <WatercolorRecordPlayer release={playableRelease} />

        <section
          className={styles.secondArtistRoom}
          data-has-image={secondaryArtist?.image ? "true" : "false"}
        >
          <div className={styles.secondArtistIndex} aria-hidden="true">
            <span>02</span>
            <i />
            <small>Second featured current</small>
          </div>
          {secondaryArtist?.image ? (
            <Link
              aria-label={`Enter ${secondaryArtist.name}'s artist room`}
              className={styles.secondArtistMedia}
              href={`/artists/${secondaryArtist.slug}`}
            >
              <Image
                alt={secondaryArtist.imageAlt ?? secondaryArtist.name}
                fill
                sizes="(max-width: 760px) 100vw, 38vw"
                src={secondaryArtist.image}
              />
              <span aria-hidden="true" />
              <small>Artist 002 · Palo Xanto · Photo Mandy Sanchez</small>
            </Link>
          ) : null}
          <div className={styles.secondArtistCopy}>
            <p className={styles.eyebrow}>Artist 002 · A distinct current</p>
            <h2>{secondaryArtist?.name ?? "The next voice"}</h2>
            <p>
              {secondaryArtist?.description ??
                "A second featured artist room is held open by design. The voice enters only with artist approval."}
            </p>
            <small>
              This placement remains intentionally quiet until the artist
              approves more work for public display.
            </small>
            <Link
              href={
                secondaryArtist
                  ? `/artists/${secondaryArtist.slug}`
                  : "/submit#submission-form"
              }
            >
              {secondaryArtist ? "Enter the artist room" : "Enter the roster"}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <section className={styles.allArtistsRoom}>
          <div className={styles.allArtistsHeading}>
            <p className={styles.eyebrow}>The complete artist field</p>
            <h2>
              Every voice keeps its name.
              <em>Every artist keeps their color.</em>
            </h2>
            <Link href="/artists">
              View all artist rooms <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.artistDirectory}>
            {artists.map((entry, index) => (
              <Link
                className={styles.artistDirectoryCard}
                href={`/artists/${entry.slug}`}
                key={entry.slug}
              >
                <span className={styles.artistDirectoryMedia}>
                  {entry.image ? (
                    <Image
                      alt={entry.imageAlt ?? `${entry.name} artist portrait`}
                      fill
                      sizes="(max-width: 760px) 50vw, (max-width: 1120px) 33vw, 25vw"
                      src={entry.image}
                    />
                  ) : (
                    <span
                      className={styles.artistDirectoryHeld}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </span>
                <span className={styles.artistDirectoryMeta}>
                  <small>Artist {String(index + 1).padStart(2, "0")}</small>
                  <strong>{entry.name}</strong>
                  <span>
                    {entry.location ??
                      (entry.catalogStatus === "published"
                        ? "Whole Body Records"
                        : "Public room held")}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <RecordsBookingCorridor />
        <RecordsRevenueCurrent />
      </main>
    </div>
  );
}

interface WatercolorRecordPlayerProps {
  release?: PlayablePublicRelease;
}

function WatercolorRecordPlayer({ release }: WatercolorRecordPlayerProps) {
  const {
    announcement,
    controllerReady,
    isActiveRelease,
    nextTrack,
    previousTrack,
    progress,
    registerSpotifyHost,
    selectRelease,
    selectTrack,
    status,
    togglePlayback,
    trackIndex,
  } = useTurntable();

  if (!release) {
    return (
      <section className={styles.playerRoom}>
        <p className={styles.eyebrow}>The watercolor record player</p>
        <h2>The listening current is held.</h2>
        <Link className={styles.listenLink} href="/catalog">
          Enter the catalog <span aria-hidden="true">→</span>
        </Link>
      </section>
    );
  }

  const active = isActiveRelease(release);
  const isPlaying = active && status === "playing";
  const canControl = active && controllerReady;
  const currentTrack = release.tracks[active ? trackIndex : 0];

  const playOrCue = () => {
    if (active) togglePlayback();
    else selectRelease(release);
  };

  return (
    <section
      aria-labelledby="watercolor-player-heading"
      className={styles.playerRoom}
      data-playing={isPlaying}
    >
      <RecordPlayerWaterField className={styles.playerWaterField} />

      <div className={styles.playerHeading}>
        <p className={styles.eyebrow}>Room 03 · The listening current</p>
        <h2 id="watercolor-player-heading">
          Lower the needle.
          <em>Let the record become water.</em>
        </h2>
      </div>

      <div className={styles.waterPlayer}>
        <div className={styles.waterPlatter}>
          <div className={styles.waterRings} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <button
            aria-label={
              isPlaying
                ? "Pause record"
                : active
                  ? "Play record"
                  : `Cue ${release.title} by ${release.artistName}`
            }
            aria-pressed={isPlaying}
            className={styles.waterRecord}
            disabled={active && !controllerReady}
            onClick={playOrCue}
            type="button"
          >
            <span className={styles.vinylDisc} aria-hidden="true">
              <span className={styles.vinylGrooves} />
              <span className={styles.recordArtwork}>
                <strong>{release.title}</strong>
                <small>{release.artistName}</small>
              </span>
              <span className={styles.recordSpindle} />
            </span>
            <span className={styles.recordLabel} aria-hidden="true">
              {isPlaying ? "Ⅱ" : "▶"}
            </span>
          </button>
          <span className={styles.waterTonearm} aria-hidden="true">
            <i />
            <b />
          </span>
        </div>

        <div className={styles.playerDetails}>
          <p aria-atomic="true" aria-live="polite" className="sr-only">
            {announcement}
          </p>
          <div className={styles.playerIdentity}>
            <div className={styles.playerSleeve} tabIndex={0}>
              <Image
                alt={release.coverImageAlt ?? `${release.title} album artwork`}
                fill
                sizes="128px"
                src={release.coverImage}
              />
            </div>
            <div className={styles.nowPlaying}>
              <span>
                {isPlaying
                  ? "Now flowing"
                  : active
                    ? "Record cued"
                    : "Platter open"}
              </span>
              <strong>{release.title}</strong>
              <p>
                {release.artistName} · {currentTrack?.title}
              </p>
            </div>
          </div>

          <progress
            aria-label="Track playback progress"
            className={styles.playerProgress}
            max="100"
            value={active ? progress : 0}
          />

          <div
            aria-label="Record controls"
            className={styles.playerControls}
            role="group"
          >
            <button
              aria-label="Previous track"
              disabled={!canControl}
              onClick={previousTrack}
              type="button"
            >
              ‹
            </button>
            <button
              aria-label={isPlaying ? "Pause" : active ? "Play" : "Cue record"}
              aria-pressed={isPlaying}
              disabled={active && !controllerReady}
              onClick={playOrCue}
              type="button"
            >
              {isPlaying ? "Pause" : active ? "Play" : "Cue"}
            </button>
            <button
              aria-label="Next track"
              disabled={!canControl}
              onClick={nextTrack}
              type="button"
            >
              ›
            </button>
          </div>

          <ol
            className={styles.playerTracks}
            aria-label={`${release.title} track list`}
          >
            {release.tracks.map((track, index) => (
              <li key={track.spotifyUri}>
                <button
                  aria-current={
                    active && index === trackIndex ? "true" : undefined
                  }
                  disabled={!canControl}
                  onClick={() => selectTrack(index)}
                  type="button"
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{track.title}</strong>
                  <time>{track.duration}</time>
                </button>
              </li>
            ))}
          </ol>

          <a
            className={styles.playerExternal}
            href={release.listenUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open in Spotify <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className={styles.waterPlayerSpotify} ref={registerSpotifyHost} />
    </section>
  );
}
