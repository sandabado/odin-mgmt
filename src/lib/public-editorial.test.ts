import { describe, expect, it } from "vitest";
import { parsePublicEditorialItem } from "./public-editorial";

const validRow = {
  payload: {
    action_label: "Watch the stream",
    artist_slug: "sandabado",
    href: "https://www.youtube.com/watch?v=approved",
    image_alt: "Sandābādo performing in the desert",
    image_url: "/images/artists/sandabado/live.jpg",
    kind: "livestream",
    live_status: "scheduled",
    meta: "Sandābādo · live from Joshua Tree",
    private_notes: "never cross this boundary",
    starts_at: "2099-01-02T20:00:00-08:00",
    summary: "An artist-approved broadcast from the source.",
    title: "Live from the watershed",
  },
  slug: "live-from-the-watershed",
  sort_order: 10,
};

describe("public editorial parser", () => {
  it("parses only the bounded public editorial contract", () => {
    const parsed = parsePublicEditorialItem(validRow);
    expect(parsed).toEqual({
      actionLabel: "Watch the stream",
      artistSlug: "sandabado",
      external: true,
      href: "https://www.youtube.com/watch?v=approved",
      image: "/images/artists/sandabado/live.jpg",
      imageAlt: "Sandābādo performing in the desert",
      kind: "livestream",
      liveStatus: "scheduled",
      meta: "Sandābādo · live from Joshua Tree",
      slug: "live-from-the-watershed",
      sortOrder: 10,
      startsAt: "2099-01-02T20:00:00-08:00",
      summary: "An artist-approved broadcast from the source.",
      title: "Live from the watershed",
    });
    expect(parsed).not.toHaveProperty("private_notes");
  });

  it("fails closed when a required public field or kind is invalid", () => {
    expect(
      parsePublicEditorialItem({
        ...validRow,
        payload: { ...validRow.payload, kind: "internal_finance" },
      }),
    ).toBeNull();
    expect(
      parsePublicEditorialItem({
        ...validRow,
        slug: "../private",
      }),
    ).toBeNull();
    expect(
      parsePublicEditorialItem({
        ...validRow,
        payload: { ...validRow.payload, action_label: "" },
      }),
    ).toBeNull();
  });

  it("rejects unsafe links and withholds unapproved remote images", () => {
    expect(
      parsePublicEditorialItem({
        ...validRow,
        payload: { ...validRow.payload, href: "javascript:alert(1)" },
      }),
    ).toBeNull();
    expect(
      parsePublicEditorialItem({
        ...validRow,
        payload: { ...validRow.payload, href: "//malicious.example/path" },
      }),
    ).toBeNull();

    const parsed = parsePublicEditorialItem({
      ...validRow,
      payload: {
        ...validRow.payload,
        image_url: "https://unapproved.example/private.jpg",
      },
    });
    expect(parsed?.image).toBeUndefined();
    expect(parsed?.imageAlt).toBeUndefined();
  });

  it("does not trust an authored external flag", () => {
    const parsed = parsePublicEditorialItem({
      ...validRow,
      payload: {
        ...validRow.payload,
        external: true,
        href: "/tour",
      },
    });
    expect(parsed?.external).toBe(false);
  });
});
