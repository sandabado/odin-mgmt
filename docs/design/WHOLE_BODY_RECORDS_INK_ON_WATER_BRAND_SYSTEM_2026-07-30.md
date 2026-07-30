# Whole Body Records — Ink on Water Brand System

**Date:** 2026-07-30
**Status:** Canonical for Layers 1–3; adoption may proceed section by section
**Scope:** Tokens, identity, layout rhythm, actions, media law, and motion law

## The governing image

Whole Body Records is ink held by water: music and information moving through
a disciplined editorial system. The work must feel physical, exact, and alive.
Water is not a decorative synonym for blur, glass, or rounded cards. It has a
source, tributaries, a main stem, direction, weight, and consequence.

This document and
`src/components/whole-body-records/brand/tokens.ts` govern new Ink on Water
work. The earlier `whole-body-records.tokens.json` remains untouched for
historical and existing-route compatibility. Where the two conflict, this
dated system controls the Ink on Water direction until a deliberate global
migration is approved.

## Layer 1 — canonical tokens

### Color law

| Role  | Value     | Use                                      |
| ----- | --------- | ---------------------------------------- |
| Void  | `#090a0a` | Primary field and dark text on bone      |
| Bone  | `#f5f2eb` | Primary text and restrained light fields |
| Muted | `#aaa69f` | Secondary copy and metadata              |
| Water | `#2d9cdb` | The only chromatic color                 |

Alpha variants of the four canonical colors are permitted for hairlines,
veils, and depth. New hues are not. Purple, gold, teal, rainbow gradients, and
full-frame color washes are outside this system.

Blue must mean water, current, focus, or active signal. Meaning must never
depend on blue alone; pair state color with text, shape, position, or an
accessible label.

### Typography

- Display: Fraunces, optical sizing enabled, generally `600–700`.
- Body and controls: Schibsted Grotesk, generally `400–500`.
- Display type carries titles, artist names, records, and rare ceremonial
  statements.
- Body type carries navigation, metadata, controls, captions, and reading copy.
- Avoid all-caps Fraunces. Uppercase belongs to short Schibsted metadata.

The app already exposes the Next Font variables `--font-records-display` and
`--font-records-body`. Components use those variables first and named local
fallbacks second.

### Spacing and line

Use the existing Whole Body sequence: `8, 16, 25, 42, 68, 110px`. Structural
boundaries are one-pixel hairlines. Empty space creates hierarchy; container
decoration does not.

### Motion

The only easing curve is:

```css
cubic-bezier(0.25, 0.1, 0.25, 1)
```

Motion may reveal a current, clarify state, or support spatial continuity. It
must not create ambient agitation. Every integrated animation requires a
reduced-motion state:

```css
@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none;
    transition: none;
    transform: none;
  }
}
```

The two Layer 2 primitives are static by construction and therefore require no
motion override.

## Layer 2 — identity primitives

### `RecordsWordmark`

The wordmark is an intentional identity lockup, not a generic icon badge:

- The canonical yin-yang current mark leads the lockup.
- `Whole Body` is a small Schibsted signal line.
- `Records` is the Fraunces sovereign line.
- One short blue hairline introduces the current.
- It has no badge, pill, glass field, or enclosing card.

Available scales are `compact`, `standard`, and `display`. Available tones are
`on-void` and `on-bone`. The component exposes an accessible label and remains
safe when nested inside a link.

```tsx
import { RecordsWordmark } from "@/components/whole-body-records/brand";

<RecordsWordmark size="standard" tone="on-void" />;
```

### `RecordsCurrentDivider`

The divider is built from semantic HTML and CSS, with no SVG. Two upstream
tributaries meet once and continue as one downstream stem. Reversing the
direction mirrors the entire watershed, so the branches still merge rather
than incorrectly splitting.

It is decorative by default. Set `decorative={false}` and provide a useful
`label` only when the separator conveys document structure.

```tsx
import { RecordsCurrentDivider } from "@/components/whole-body-records/brand";

<RecordsCurrentDivider direction="left-to-right" tone="on-void" />;
```

## Layer 3 — layout and action primitives

Layer 3 makes the site feel like one publication without turning every section
into the same template. It normalizes the frame, vertical rhythm, introduction,
actions, and small-screen collection behavior. It does not choose a section's
content, imagery, grid, or narrative order.

### `RecordsSection`

`RecordsSection` creates one shared editorial plane. Its width choices are:

- `full`: true edge-to-edge composition with no injected gutter.
- `contained`: the primary `1440px` site plane with responsive gutters.
- `inset`: a quieter `1120px` editorial plane with the same gutters.

Its rhythm choices are the canonical `42px`, `68px`, and `110px` steps:
`compact`, `standard`, and `ceremonial`. On small screens each steps down once
to preserve reading flow. Optional dividers are hairlines, and the optional
accent is one short water-blue rule. The component never adds a background,
radius, shadow, blur, or glass panel.

```tsx
<RecordsSection
  accent
  aria-labelledby="artist-services-title"
  divider="top"
  rhythm="standard"
  width="contained"
>
  {/* The page owns this composition. */}
</RecordsSection>
```

### `RecordsSectionIntro`

The introduction pairs a Schibsted eyebrow with a Fraunces title and bounded
reading copy. Semantic heading level and visual size are separate choices.
Title continuations default to quiet neutral Fraunces italic. Set
`emphasisTone="water"` only when the words identify an active current. Use
`layout="split"` only when the left label creates useful editorial orientation;
it returns to one column on small screens.

```tsx
<RecordsSectionIntro
  eyebrow="Artist services"
  emphasis="without losing the source."
  size="section"
  supportingCopy="Records, press, licensing, management, and booking move as one practice."
  title="Build the whole artist world"
  titleId="artist-services-title"
/>
```

### `RecordsActionRow` and `RecordsActionLink`

Actions wrap predictably and become full-width controls on narrow screens.
Use one `solid` action per decision group, then `outline` or `text`. Focus is
identified by outline and underline in addition to water blue.

```tsx
<RecordsActionRow>
  <RecordsActionLink href="/submit?intent=artist" variant="solid">
    Join the roster <span aria-hidden="true">→</span>
  </RecordsActionLink>
  <RecordsActionLink href="/artists" variant="text">
    Meet the artists
  </RecordsActionLink>
</RecordsActionRow>
```

### `RecordsHorizontalRail`

Use the rail only when a collection is meaningfully scanable. It is a normal
responsive grid on larger screens and a labeled, keyboard-focusable horizontal
region on small screens. Its visible swipe cue and strict snap stops communicate
the off-screen collection without animated instruction. The child content
remains unstyled so album art, artists, dates, and opportunities can preserve
their own semantics.

`RecordsCurrentDivider` remains the canonical flow rule. Layer 3 deliberately
does not create a second decorative river component.

## Media law

Record art and primary editorial media are square:

```css
aspect-ratio: 1 / 1;
```

The base image language is realistic monochrome watercolor. It must retain
credible terrain, light, scale, material, and human anatomy. Monochrome is an
editorial treatment, not license for fantasy texture.

A restrained `#2d9cdb` veil may identify water. The veil follows the water
feature instead of tinting the entire image.

Interactive artist and album media uses the shared blue rest veil from
`recordsBrandTokens.media`. The underlying monochrome exposure must remain
legible—the face, instrument, or artwork silhouette cannot disappear into a
flat blue block. Hover and keyboard focus remove the veil and restore the
approved full-color source.

Hydrological rules:

1. Water descends with the terrain.
2. Small upstream tributaries merge into a wider downstream stem.
3. Line weight may increase downstream; it does not arbitrarily pulse.
4. A current does not climb slopes, branch symmetrically for ornament, or end
   in a disconnected glow.
5. Blue is reserved for the water path and verified signal.

## Composition law

- Use editorial planes, square artifacts, hairlines, and deliberate negative
  space.
- Do not introduce generic rounded wellness cards.
- Do not use glassmorphism as a substitute for depth.
- Do not restart the background image in every section.
- Do not put every piece of content in a bordered container.
- Rounded geometry is reserved for physically round subjects or controls whose
  function requires it, not content framing.

## Accessibility and implementation boundary

- Bone-on-void is the primary reading pair; muted text is reserved for
  secondary content.
- Keyboard focus must be visible with text or geometry as well as blue.
- Real content images need specific alt text; decorative current diagrams are
  hidden from assistive technology.
- Reduced-motion behavior is mandatory before any animated primitive is
  integrated.
- WebGL is permitted only as the decorative `RecordPlayerWaterField` behind the
  listening-current chapter. It must initialize near view, pause offscreen,
  cap its frame and framebuffer budgets, use local pointer coordinates, and
  remain canvas-free under reduced motion or Save-Data. It may never become a
  fixed or site-wide atmosphere.
- The production homepage, floating masthead, media states, and footer now
  consume this law. Further route adoption remains incremental and reviewed.
- Brand primitives do not mutate Supabase, commerce, playback, or protected
  data; those operational boundaries remain independently governed.

## Change control

Any new chromatic color, typeface, card language, current geometry, or motion
curve requires explicit creative approval. Update this dated reference and the
TypeScript tokens together so design law and implementation never diverge.
