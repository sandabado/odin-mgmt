# Whole Body Records — Homepage Design and Layout Audit

**Date:** 2026-07-30
**Status:** Post-cleanup implementation record; final deployment verification pending
**Owner:** Whole Body Records / Jesse
**Scope:** Public homepage, shared public masthead, closing/footer, and the reusable Records design layer

## Executive finding

The homepage no longer needs less substance. It needs one visual law and a
clearer reading sequence. The useful material has therefore been preserved and
recomposed rather than deleted.

The current direction is a continuous Ink on Water publication:

- one fixed, floating masthead over the opening artwork;
- one dark editorial plane instead of a stack of unrelated containers;
- Fraunces for sovereign display language and Schibsted Grotesk for reading and
  controls;
- water blue as the only chromatic system signal;
- artist and album color revealed by hover or keyboard focus;
- hairlines, negative space, and current diagrams for structure;
- horizontal rails on small screens where a long vertical stack would dilute
  the story;
- one compact ending, including a clear, full-width ØDIN management threshold.

This is a hierarchy correction, not a content purge.

## Audit basis

This record reflects the post-cleanup component tree in:

- `src/app/page.tsx`
- `src/components/whole-body-records/InkOnWaterPreview.tsx`
- `src/components/whole-body-records/FeaturedArtistPortal.tsx`
- `src/components/whole-body-records/RecordsBookingCorridor.tsx`
- `src/components/whole-body-records/RecordsRevenueCurrent.tsx`
- `src/components/whole-body-records/RecordsHeader.tsx`
- `src/components/whole-body-records/RecordsFooter.tsx`
- `src/components/whole-body-records/PoolingWaterClosing.tsx`
- `src/components/whole-body-records/brand/`

The canonical visual law remains
`docs/design/WHOLE_BODY_RECORDS_INK_ON_WATER_BRAND_SYSTEM_2026-07-30.md`.
The older `whole-body-records.tokens.json` is an archive, not authority for new
work.

## Homepage structure — top to bottom

1. **Floating public masthead — `RecordsHeader`**
   - Fixed over the content rather than occupying a separate slab.
   - Uses the typographic `RecordsWordmark`, primary rooms, Store, Cart, member
     state, and the compact native-details menu.
   - The dark-to-transparent header wash protects legibility without blur or a
     glass panel.

2. **Active label hero — `RecordsWatershed` inside `InkOnWaterPreview`**
   - Holds the locked statement: “Many voices. One whole body.”
   - Supports the Record Watershed and the other public label-current slides.
   - Includes the public story card, carousel position, pause control, and hero
     actions.
   - Pointer, keyboard, and timed states are deliberate; reduced motion is
     respected.

3. **Featured artist 001 — `FeaturedArtistPortal`**
   - Presents the breadth of an artist rather than a single promotional tile:
     portrait, music, film, story, editions, campaign, and live work.
   - Approved color is available without abandoning the monochrome/blue Records
     frame.

4. **Listening current — `WatercolorRecordPlayer`**
   - A real record/platter interaction with album sleeve, playback status,
     track list, controls, and external listen path.
   - `RecordPlayerWaterField` concentrates the approved WebGL water language
     behind this chapter only; it initializes near view, pauses offscreen, and
     falls back to a static current for reduced motion, Save-Data, or missing
     WebGL.
   - Audio remains user initiated.

5. **Featured artist 002**
   - Preserves the second editorial feature, currently Palo Xanto.
   - Uses the approved Mandy Sanchez performance portrait and a quieter amount
     of supporting copy.

6. **Complete artist field**
   - Square artist tiles with explicit artist metadata.
   - Four columns at wide desktop, three at intermediate width, and two on
     mobile.

7. **Southern California operating corridor — `RecordsBookingCorridor`**
   - Explains artist-first management and intentional booking between Joshua
     Tree, Los Angeles, and San Diego.
   - Keeps the service loop and all three management/booking pathways.

8. **ØDIN value current — `RecordsRevenueCurrent`**
   - Shows four public opportunity currents: PR; Records, licensing, and
     distribution; Management; and Booking.
   - Carries them into the protected ØDIN operating layer and the approved Feed
     First projection.
   - It is explanatory, not a live ledger and not a disclosure of protected
     account data.

9. **Pooling-water closing — `PoolingWaterClosing`**
   - One restrained, interactive closing gesture using the Records flow mark.
   - It is part of the ending, not a second independent landing page.

10. **Compact global footer — `RecordsFooter`**
    - Leads with one prominent, full-width ØDIN Management/member-login band.
    - Consolidates identity, public navigation, current artists, contact, and
      policy links.
    - Desktop links are distributed evenly; mobile links collapse into native
      disclosure groups.

## Problems found

### 1. Valuable content was competing at the same volume

The hero, artist worlds, player, artist directory, booking story, revenue
diagram, closing ritual, and footer were each behaving like a climax. The
result was not a lack of quality; it was a lack of modulation.

**Correction:** preserve every meaningful chapter while assigning a deliberate
role: threshold, feature, utility, explanation, or coda.

### 2. The masthead read as a separate interface layer

The earlier header treatment was visually heavy and the identity was too small
to establish the label.

**Correction:** use a fixed floating header, a stronger typographic lockup, one
subtle dark-to-transparent legibility wash, and no background blur, card, or
drop shadow.

### 3. Two artists expanded to fill an oversized directory

An auto-fitting grid made a short roster appear as two very large promotional
panels. That contradicted the requested three-to-four-across editorial field.

**Correction:** use an explicit `4 / 3 / 2` grid. Empty capacity now reads as a
growing roster rather than stretching the available artists beyond their
proper weight.

### 4. Mobile repeated the desktop hierarchy vertically

Artist activity, management steps, and revenue sources became long consecutive
stacks. The content was correct, but reading it required excessive downward
travel.

**Correction:** convert scanable peer collections to visible, keyboard-focusable
horizontal rails with snap points and text cues. Narrative and transactional
content remains vertical.

### 5. The blue media treatment obscured the work

An opaque blue rest state risked making faces, instruments, and artwork
indistinct.

**Correction:** use the shared legible veil
`rgba(45, 156, 219, 0.72)` over a controlled monochrome exposure. Hover and
keyboard focus remove the veil and reveal the approved source color.

### 6. Booking and revenue looked like inserted microsites

Outer gutters, rounded enclosures, and isolated surfaces made system chapters
feel detached from the label narrative.

**Correction:** place both chapters on the shared dark plane with edge-to-edge
hairlines, canonical gutters, quiet italic title continuations, and no generic
card shell.

### 7. The footer repeated the site instead of ending it

The closing ritual and a large multi-column sitemap produced two endings and
too much navigation weight.

**Correction:** make the closing and footer one sequence. Give ØDIN one clear
member threshold, keep desktop links evenly distributed, and use compact
native disclosures on mobile.

### 8. Metadata was too easy to lose

Several indexes and support labels relied on low contrast or scale alone.

**Correction:** keep short metadata in Schibsted Grotesk with stable tracking,
adequate line height, stronger muted contrast, and a structural position that
does not depend on blue alone.

### 9. Ambient effects carried cost without meaning

Legacy atmosphere layers, large blur fields, and unused CSS made the page more
expensive without clarifying interaction or narrative.

**Correction:** remove production mounting of the persistent atmosphere and
page-wide canvas, remove obsolete heavy objects and unused selectors where
verified, and retain only motion that communicates flow, entry, playback, or
selection. The one deliberate kinetic-background exception is the
chapter-scoped, frame-capped player water field; it never becomes a fixed or
site-wide layer.

## Changes implemented

- Fixed floating public header with responsive mobile menu and protected anchor
  offsets.
- Stronger `Whole Body / Records` typographic lockup with the current mark and
  one blue signal line.
- Explicit four-, three-, and two-column artist directory.
- Mobile horizontal rails for the featured artist activity world, artist
  service loop, and opportunity-current list.
- A shared visible rail cue rather than an unexplained partial card.
- Legible blue media veil with full-color reveal on hover and keyboard focus.
- Square album and artist-directory media; approved editorial portraits may
  keep their source ratio.
- Booking and revenue chapters flattened into one continuous editorial plane.
- Canonical quiet-neutral italic continuations in major section headings.
- Revenue language tied to the existing ØDIN/Feed First model without exposing
  protected records or pretending to show a live balance.
- Compact one-ending footer with a prominent ØDIN member-login band, balanced
  link distribution, and mobile disclosures.
- Metadata contrast, spacing, line height, and focus treatment normalized.
- Persistent heavy atmosphere removed from the production page; the archived
  source remains available for deliberate future study.
- Scoped WebGL water field added behind the record player only, with local
  pointer energy, lazy initialization, offscreen pausing, a capped framebuffer,
  and canvas-free reduced-motion/Save-Data fallback.
- Hero pointer work throttled to animation frames; reduced-motion paths remain
  available.

## Measured layout effect

These figures are document heights from the audit checkpoints, not target
heights and not a mandate to compress content further.

| View    | Before cleanup | Latest measured checkpoint |                Change |
| ------- | -------------: | -------------------------: | --------------------: |
| Desktop |      `8,805px` |                  `8,274px` |    `-531px` (`-6.0%`) |
| Mobile  |     `13,224px` |                 `10,723px` | `-2,501px` (`-18.9%`) |

The latest local checkpoint includes the refined Artist 001 threshold, compact
mobile footer, centered revenue confluence, two-artist editorial diptych, and
the scoped player water field. The 768px tablet checkpoint is `9,775px`.
Production still receives its own independent measurement at the deployment
gate.

The objective is not the smallest possible page. It is a page where each
vertical step earns its space and scanable collections do not become repeated
full-height chapters.

## Valuable content explicitly preserved

- The locked hero statement and its three calls to action.
- Record Watershed interaction and the complete sanitized label-current
  carousel.
- Both featured-artist placements.
- The first artist’s broad world: portrait, music, video/film, editorial,
  merchandise/editions, campaign, and live activity when published.
- The watercolor record player, album identity, track list, and Spotify path.
- Palo Xanto’s approved portrait, credit, artist room, and quiet consent
  boundary.
- The complete public artist roster and artist-room links.
- Joshua Tree, Los Angeles, and San Diego corridor logic.
- All four artist-service steps and management/booking calls to action.
- The four public opportunity groupings and approved `50 / 25 / 15 / 10` Feed
  First projection.
- The distinction between a public explanatory diagram and protected ØDIN
  financial/account data.
- The pooling-water/yin-yang closing gesture.
- Contact, public navigation, account, policy, social, and current-artist
  pathways.
- Existing archive sources that may still have research value; nothing was
  destructively removed merely because it was unmounted.

## Canonical component library for Jesse

The public import surface is
`src/components/whole-body-records/brand/index.ts`. New Records work should use
that surface rather than reaching into a component file directly.

| Component                | Use it when                                                                                                | Do not use it for                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `recordsBrandTokens`     | A component needs canonical color, type, space, layout, media, or motion values.                           | Creating a second local palette or spacing scale.                                 |
| `RecordsWordmark`        | The Whole Body Records identity appears in a header, footer, campaign lockup, or approved partner context. | An icon-only generic badge or decorative seal.                                    |
| `RecordsSection`         | A page needs a full, contained, or inset editorial plane with compact, standard, or ceremonial rhythm.     | Wrapping every small content group in another container.                          |
| `RecordsSectionIntro`    | A chapter needs an eyebrow, Fraunces statement, restrained emphasis, and bounded supporting copy.          | Recreating hero-specific composition or adding blue to every title.               |
| `RecordsActionRow`       | Related actions need consistent spacing, alignment, and mobile wrapping.                                   | A navigation menu or dense toolbar.                                               |
| `RecordsActionLink`      | A primary, outline, or textual public pathway needs canonical focus and interaction treatment.             | A form submit button that requires button semantics.                              |
| `RecordsHorizontalRail`  | A peer collection is meaningfully scanable and should become a mobile rail.                                | Long-form narrative, legal text, or a sequence whose full visibility is required. |
| `RecordsRailCue`         | A bespoke mobile rail already owns its layout but needs the shared visible swipe instruction.              | Decorative motion or an unlabeled overflow hack.                                  |
| `RecordsCurrentDivider`  | Two editorial chapters need one restrained current/hairline transition.                                    | Filling empty space or separating every paragraph.                                |
| `RecordsWatershed`       | The active-label hero needs the verified record-watershed behavior.                                        | A repeated background on internal pages.                                          |
| `RecordsTerrainRiver`    | A reviewed terrain composition needs a credible downstream current and replay state.                       | Arbitrary decorative blue paths that ignore terrain.                              |
| `RecordPlayerWaterField` | The listening-current chapter needs its one approved interactive WebGL water plane.                        | A fixed background, another page chapter, or any non-decorative information.      |

Composition-level components remain responsible for their specific content:
`RecordsHeader`, `FeaturedArtistPortal`, `RecordsBookingCorridor`,
`RecordsRevenueCurrent`, `PoolingWaterClosing`, and `RecordsFooter`. They should
adopt the primitives incrementally; the library should not erase their distinct
semantics.

## Design laws

### Spacing and layout

1. Use the canonical sequence: `8, 16, 25, 42, 68, 110px`.
2. Use `clamp(25px, 7vw, 110px)` for the primary horizontal page gutter.
3. Use `1440px` for the contained plane, `1120px` for an editorial inset, and
   approximately `760px` for sustained reading copy.
4. Use a one-pixel hairline only when it communicates hierarchy, interaction,
   transaction, form, or security.
5. Do not use outer page cards, repeated large radii, glass panels, drop shadows,
   or blur to manufacture hierarchy.
6. A section may be `compact` (`42px`), `standard` (`68px`), or `ceremonial`
   (`110px`). Ceremonial space is rare and must mark a genuine threshold.
7. Prefer one shared plane and controlled negative space over alternating
   unrelated backgrounds.

### Typography

1. Display and artist names: Fraunces with optical sizing, generally weight
   `600–700`.
2. Body, metadata, controls, and navigation: Schibsted Grotesk, generally weight
   `400–500`.
3. Major title continuations are quiet neutral Fraunces italic. Blue title text
   is reserved for an active current, not ordinary emphasis.
4. Body copy should begin at `16px` on mobile and keep a reading line height of
   approximately `1.7–1.8`.
5. Short indexes may be smaller only when they are secondary, high contrast,
   nonessential to comprehension, and paired with a readable label.
6. Uppercase is limited to short Schibsted control or metadata labels. Do not
   set Fraunces display copy in all caps.

### Color

| Role  | Canonical value | Meaning                                          |
| ----- | --------------- | ------------------------------------------------ |
| Void  | `#090a0a`       | Primary field; dark text on bone                 |
| Bone  | `#f5f2eb`       | Primary reading text; restrained light field     |
| Muted | `#aaa69f`       | Secondary information                            |
| Water | `#2d9cdb`       | Current, focus, verified signal, and interaction |

Alpha variants of these colors are allowed for depth, hairlines, and veils.
No new purple, gold, teal, rainbow, or full-frame color wash belongs in the
Records production system. Blue must be paired with position, underline,
geometry, text, or an accessible label so meaning never depends on color alone.

### Media

1. Album art and artist-directory artifacts are square (`aspect-ratio: 1 / 1`).
2. An approved editorial portrait may retain its source ratio when the ratio is
   part of the composition; it must not silently redefine album or directory
   geometry.
3. The monochrome base is controlled with
   `grayscale(1) brightness(1.18) contrast(0.94)`.
4. Interactive media uses the shared blue rest veil
   `rgba(45, 156, 219, 0.72)` and must leave the subject legible.
5. Hover and keyboard focus reveal the approved full-color source. Touch layouts
   must not hide essential information behind hover.
6. Real content images need specific alt text. Decorative terrain/current
   layers use empty alt text or are hidden from assistive technology.
7. A water path must follow credible terrain, merge downstream, and gain weight
   with flow. It must not climb a slope or become an ornamental disconnected
   glow.

### Motion

1. Use only `cubic-bezier(0.25, 0.1, 0.25, 1)` for editorial transitions.
2. Motion must communicate current, entry, playback, selection, or state.
3. Ambient agitation, permanent glow breathing, and motion without information
   are not production behavior.
4. Long-running carousels require a visible pause control.
5. Pointer-driven work must be frame-throttled.
6. Every animation and transition requires a `prefers-reduced-motion` path.
7. Future performance work should pause offscreen motion rather than merely
   making it visually subtle.

### Accessibility

1. Maintain a visible skip link and semantic landmark/heading order.
2. Interactive targets must be at least `44px` in the relevant dimension.
3. Every hover reveal must also work with keyboard focus.
4. Focus uses outline, underline, text, or geometry in addition to water blue.
5. Mobile rails require an accessible label, keyboard focus, visible swipe cue,
   and strict snap points.
6. Decorative SVG paths are hidden; explanatory diagrams carry a title and
   description.
7. Live playback/carousel announcements must remain concise and user initiated
   where appropriate.
8. Fixed-header anchors use a matching `scroll-margin-top` so headings are not
   obscured.
9. Native `details`/`summary` remains preferred for compact public navigation
   and footer disclosure.
10. Verify contrast in the actual rendered state; token names alone do not prove
    conformance.

## Remaining P1 technical debt

These are controlled follow-ups, not reasons to destabilize the current
release.

1. **Surgical CSS extraction**
   - `globals.css` and `records-brand.css` still carry historical layers and
     late overrides.
   - Extract only selectors proven to be active, route by route.
   - Do not perform a mass deletion or global rename in the same change as a
     visual release.

2. **Pause offscreen animation**
   - Reduced motion is implemented, but visible-state and offscreen-state are
     different concerns.
   - Use a shared intersection observer to suspend carousel/current animation
     when its chapter is outside the viewport.
   - Preserve component state and resume without restarting audio.

3. **Visual regression coverage**
   - Establish reviewed baselines at wide desktop, tablet, mobile, and reduced
     motion.
   - Include header-over-hero, both artist features, player, artist grid,
     booking corridor, revenue current, and complete ending.
   - Add interaction captures for media rest/reveal, mobile menu, rail focus,
     record controls, and footer disclosures.

## Deployment gate checklist

The homepage is ready to deploy only when every applicable gate is recorded.

- [ ] `npm run lint` passes with no new errors.
- [ ] The complete automated test suite passes.
- [ ] A clean production build completes after the local development server is
      stopped.
- [ ] Public-route crawl returns HTTP 200 for every intended route with no
      console errors or hydration warnings. The homepage mounts no canvas at
      entry, one decorative player canvas only when the chapter approaches,
      and no canvas under reduced motion or Save-Data.
- [ ] Homepage is reviewed at wide desktop, tablet, and mobile widths.
- [ ] Final desktop and mobile document heights are recorded; replace the
      approximate mobile checkpoint above only with a reproducible measurement.
- [ ] Fixed header remains legible over every hero slide and does not obscure
      anchor targets.
- [ ] Mobile menu, footer disclosures, horizontal rails, and record controls are
      fully keyboard operable.
- [ ] Visible focus is present for navigation, media reveals, CTAs, and player
      controls.
- [ ] Reduced-motion review confirms no traveling signals, auto-motion, or long
      transitions remain active against user preference.
- [ ] Album/directory media is square, approved portrait ratios are intentional,
      and the blue rest veil leaves each subject legible.
- [ ] All real images have accurate alt text and all decorative layers are
      correctly hidden.
- [ ] ØDIN value-current language remains public-safe, aggregate, and explicitly
      non-live; no protected IDs, agreements, balances, or account data appear.
- [ ] Footer ends once, ØDIN member login is prominent, and no useful navigation
      or contact pathway was lost.
- [ ] Git diff is reviewed for unrelated changes, credentials, private artifacts,
      generated output, and unapproved database migrations.
- [ ] Production deployment is smoke-tested on `wholebodyrecords.com`, including
      hero interaction, images, navigation, artist links, player fallback,
      footer login, and mobile layout.

## Definition of done

The homepage is complete when a first-time visitor can understand, in sequence:

1. what Whole Body Records believes;
2. who the artists are and what the label does around them;
3. how to listen;
4. how artists are served and shows are routed;
5. how value remains connected to its source through ØDIN; and
6. where to explore, submit, or enter the protected management system.

No single section should have to shout for that sequence to be clear.
