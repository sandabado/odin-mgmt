# Whole Body Records Component Catalog

## Canonical source

The production visual law is the dated Ink on Water system:

- `docs/design/WHOLE_BODY_RECORDS_INK_ON_WATER_BRAND_SYSTEM_2026-07-30.md`
- `src/components/whole-body-records/brand/tokens.ts`
- `src/components/whole-body-records/brand/index.ts`

The older `docs/design/whole-body-records.tokens.json` remains an archive for
route compatibility. Its multicolor currents, Cinzel typography, persistent
WebGL atmosphere, large blur fields, and glass-card language are not approved
for new production work. The only approved WebGL exception is the scoped,
lazy `RecordPlayerWaterField` inside the listening-current chapter.

The active palette is only void `#090a0a`, bone `#f5f2eb`, muted neutral, and
water `#2d9cdb`. Display type is Fraunces. Body and controls use Schibsted
Grotesk. Every transition uses `cubic-bezier(0.25, 0.1, 0.25, 1)`.

## Brand primitives

| Component               | Purpose                                                                                 | Useful states                                                                |
| ----------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `RecordsWordmark`       | Typographic Whole Body Records identity                                                 | Compact, standard, display; on void or bone                                  |
| `RecordsCurrentDivider` | Tributaries joining one downstream current                                              | Direction; decorative or labeled; on void or bone                            |
| `RecordsSection`        | Shared full-bleed editorial plane and exact vertical rhythm                             | Full, contained, inset; compact, standard, ceremonial; divider; water accent |
| `RecordsSectionIntro`   | Eyebrow, Fraunces statement, quiet italic emphasis, and bounded copy                    | Stacked or split; compact, section, display; quiet or water emphasis; h1–h3  |
| `RecordsActionRow`      | Predictable action grouping and mobile stacking                                         | Start, center, end; compact or standard                                      |
| `RecordsActionLink`     | Accessible link treatment without local button CSS                                      | Solid, outline, text                                                         |
| `RecordsHorizontalRail` | Responsive grid that becomes a keyboard-scrollable mobile rail with a visible swipe cue | Compact, standard, wide items; cue on or off                                 |
| `RecordsRailCue`        | Shared swipe instruction and current indicator for bespoke ordered rails                | Mobile or compact breakpoint                                                 |
| `RecordsTerrainRiver`   | Verified terrain painting with a topographically credible current                       | Rest, active, replay cycle, reduced motion                                   |
| `RecordsWatershed`      | Active-label hero and current carousel                                                  | Editorial state, current state, reduced motion                               |

## Shared runtime components

These components remain composition-level concerns and should consume the
brand primitives over time. They are not substitutes for the layout layer.

| Component                | Purpose                                                | Boundary                                                                     |
| ------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `RecordsPageShell`       | Public-route accessibility and shared page frame       | Does not dictate section composition                                         |
| `RecordsHeader`          | Floating public navigation, cart, and member threshold | Navigation only                                                              |
| `FeaturedArtistPortal`   | Broad artist activity portrait                         | Published artist-facing data only                                            |
| `WatercolorRecordPlayer` | Inline listening room                                  | User-initiated audio                                                         |
| `RecordPlayerWaterField` | Chapter-local interactive water plane                  | Decorative; lazy; offscreen-paused; static reduced-motion/Save-Data fallback |
| `RecordsBookingCorridor` | Joshua Tree–Los Angeles–San Diego booking practice     | Public, grounded booking language                                            |
| `RecordsRevenueCurrent`  | Four opportunity currents mirrored from ØDIN           | Explanatory projection, not a live ledger                                    |
| `PoolingWaterClosing`    | Final statement and yin-yang current                   | One restrained closing gesture                                               |
| `RecordsFooter`          | Compact global wayfinding and ØDIN member threshold    | No repeated mega-navigation                                                  |
| `TurntableProvider`      | Cross-route listening state                            | Public routes only                                                           |
| `PublicationConsole`     | Human approval boundary between ØDIN and Records       | Authenticated administration                                                 |

`PersistentRecordsAtmosphere`, `WholeBodyRecordsAtmosphere`,
`MuseumTrackFrame`, and the former service-card system are archived references,
not production layout dependencies.

## Composition rules

- Public sections share one visual plane. Do not add outer card gutters,
  page-sized white surfaces, large radii, drop shadows, or blur fields.
- Choose one section rhythm deliberately. `compact` supports utility and
  metadata, `standard` supports most narrative chapters, and `ceremonial` is
  reserved for a major threshold.
- A full-bleed visual may use `width="full"`; its text should normally sit in a
  nested contained or inset composition owned by the section.
- Titles stay within the intro scale and line-length bounds. A unique hero may
  exceed them only when its own reviewed component owns the behavior.
- Title continuations use quiet neutral Fraunces italic. Blue emphasis is an
  explicit signal state, not the default hierarchy treatment.
- Album art and primary record artifacts remain square. Artist editorial
  portraits may retain their approved photographic ratio.
- Use blue for current, focus, and active signal only. Artist and album media
  may reveal full color on hover or focus according to the media law.
- Interactive media uses `--wbr-media-rest-filter` and
  `--wbr-media-rest-veil`; do not recreate a page-specific solid blue block.
- Major page chapters use `--wbr-gutter` and the 42/68/110 rhythm variables.
  Meaningful controls retain a 44px target even when their visible treatment
  is only an underlined text current.
- Boundaries communicate structure, interaction, transaction, form, or
  security. They do not decorate every content group.
- Motion communicates entry, selection, or flow and includes reduced-motion
  behavior. Ambient agitation is not part of the production system. WebGL may
  appear only in the listening-current chapter through
  `RecordPlayerWaterField`; it must remain local, lazy, frame-capped,
  offscreen-paused, decorative, and canvas-free under reduced motion or
  Save-Data.

## Migration examples

### Replace a locally framed chapter

Before: a page-specific `<section>` with `width: calc(...)`, a dark translucent
background, `48px` radius, shadow, and its own large padding scale.

After:

```tsx
<RecordsSection
  accent
  aria-labelledby="practice-title"
  divider="top"
  rhythm="standard"
  width="contained"
>
  <RecordsSectionIntro
    eyebrow="The working current"
    layout="split"
    supportingCopy="One concise explanation of the practice."
    title="A clear editorial chapter"
    titleId="practice-title"
  />
  {/* Keep the section-specific content grid here. */}
</RecordsSection>
```

### Replace local CTA classes

```tsx
<RecordsActionRow density="compact">
  <RecordsActionLink href="/submit" variant="solid">
    Submit your work
  </RecordsActionLink>
  <RecordsActionLink href="/services" variant="text">
    See how we serve artists
  </RecordsActionLink>
</RecordsActionRow>
```

### Normalize a mobile collection

```tsx
<RecordsHorizontalRail aria-label="All artists" itemWidth="compact">
  {artists.map((artist) => (
    <ArtistPortrait artist={artist} key={artist.slug} />
  ))}
</RecordsHorizontalRail>
```

Adoption is intentionally incremental. Replace local shells first, verify the
page at desktop and mobile widths, then remove only the CSS made unreachable by
that migration.
