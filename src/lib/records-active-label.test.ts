import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { PublicRelease, PublicShow } from "./public-catalog";
import { buildRecordsLabelCurrent } from "./records-label-current";

const read = (path: string) => readFileSync(path, "utf8");

const release: PublicRelease = {
  artistName: "Test Artist",
  artistSlug: "test-artist",
  description: "An approved release.",
  displayDate: "1 January 2099",
  format: "Album",
  listenUrl: "/catalog",
  slug: "future-record",
  status: "forthcoming",
  title: "Future Record",
  tracks: [],
  year: 2099,
};

const show: PublicShow = {
  artistName: "Test Artist",
  artistSlug: "test-artist",
  cityState: "Joshua Tree, California",
  date: "2099-01-02",
  slug: "test-artist-desert-room-2099",
  venueName: "Desert Room",
};

describe("Whole Body Records active label current", () => {
  it("keeps every approved hero study as useful carousel art", () => {
    const slides = buildRecordsLabelCurrent({
      releases: [release],
      tourDates: [],
    });
    const images = slides.map((slide) => slide.image);

    for (const asset of [
      "wbr-hero-01-confluence.png",
      "wbr-hero-02-record-watershed.png",
      "wbr-hero-03-voices-wave.png",
      "wbr-hero-04-artist-archipelago.png",
      "wbr-hero-05-source-return.png",
    ]) {
      expect(images.some((image) => image.endsWith(asset))).toBe(true);
    }

    expect(slides[0]).toMatchObject({
      id: "release-future-record",
      title: "Future Record",
      visual: "watershed",
    });
  });

  it("adds only real published video and confirmed-date data", () => {
    const withoutSignals = buildRecordsLabelCurrent({
      releases: [release],
      tourDates: [],
    });
    expect(withoutSignals.some((slide) => slide.kind === "video")).toBe(false);
    expect(withoutSignals.some((slide) => slide.kind === "tour")).toBe(false);

    const withSignals = buildRecordsLabelCurrent({
      releases: [
        {
          ...release,
          releaseType: "video",
          videoUrl: "https://www.youtube.com/watch?v=verified",
        },
      ],
      tourDates: [show],
    });
    expect(withSignals.find((slide) => slide.kind === "video")?.external).toBe(
      true,
    );
    expect(withSignals.find((slide) => slide.kind === "tour")?.href).toBe(
      `/tour#${show.slug}`,
    );
  });

  it("keeps two featured artist moments and adds the whole artist field", () => {
    const home = read(
      "src/components/whole-body-records/InkOnWaterPreview.tsx",
    );
    const css = read(
      "src/components/whole-body-records/InkOnWaterPreview.module.css",
    );

    expect(home).toContain("Artist 001 · Full color by consent");
    expect(home).toContain("Artist 002 · A distinct current");
    expect(home).toContain("The complete artist field");
    expect(home).toContain("artists.map((entry, index)");
    expect(css).toContain("width: min(100%, 760px)");
    expect(css).toContain("grid-template-columns: repeat(2");
    expect(css).toContain("background: transparent");
    expect(css).toContain(".artistDirectoryMedia::after");
    expect(css).toContain("mix-blend-mode: color");
  });

  it("offers explicit pause controls and honors reduced motion", () => {
    const home = read(
      "src/components/whole-body-records/InkOnWaterPreview.tsx",
    );
    const watershed = read(
      "src/components/whole-body-records/brand/RecordsWatershed.module.css",
    );

    expect(home).toContain("Pause label current");
    expect(home).toContain("Resume label current");
    expect(home).toContain("if (reduceMotion || carouselPaused");
    expect(watershed).toContain("prefers-reduced-motion: reduce");
  });

  it("types every new public doorway before it reaches the review queue", () => {
    const intents = read("src/lib/records-intake.ts");
    const validator = read("src/lib/validators/intake.schema.ts");
    const route = read("src/app/api/intake/booking/route.ts");

    for (const intent of ["artist", "partner", "sync", "art-of-the-song"]) {
      expect(intents).toContain(`"${intent}"`);
    }
    expect(validator).toContain("z.enum(recordsIntakeIntents)");
    expect(route).toContain("artist_interest: parsed.data.intent");
    expect(route).not.toContain('from("contacts")');
    expect(route).not.toContain('from("opportunities")');
  });
});
