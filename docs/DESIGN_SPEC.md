# buttery — Design Spec

Every value below was measured from local reference captures that aren't part of the repo (the two app screenshots are 2× retina captures, converted to CSS px). Where something is **derived** (not visible in the references), it's marked _derived_ — tune it by eye. Where a measured value was snapped to the scale, the measurement is noted.

**buttery is its own design system.** The references are inspiration, not a template:

- **Look & feel** (this doc) comes from the app captures: quiet neutral grays, nested rounded surfaces, dark pill actions, tactile knobs.
- **Layout & motion choreography** comes from a second set of page captures; see `LAYOUT_RULES.md` and `MOTION_SPEC.md`.

Never copy either product's branding, names, icons, illustrations, copy or gradients-as-brand. Recreate the *qualities*, with buttery's own components. Every buttery component uses these tokens and nothing else.

---

## 1. Color tokens

### Light (measured)

| Token | Value | Used for |
|---|---|---|
| `--bt-bg-app` | `#f3f3f4` | Page / stage background behind everything |
| `--bt-bg-surface` | `#ffffff` | Cards: header bar, inspector panel, inner rows, dialogs |
| `--bt-bg-raised` | `#ffffff` | Raised elements on a surface or control track: the active segment, secondary buttons. Same as surface in light; lighter than the track in dark. |
| `--bt-bg-floating` | `#ffffff` | Menus, popovers, floating toolbars. Same as surface in light; a step lighter in dark. |
| `--bt-bg-section` | `#f7f7f7` | Group "wells" (section backgrounds in the inspector) |
| `--bt-bg-inset` | `#fefefe` | Small recessed controls: tilt pad, anchor-grid box. Measured on the anchor box; the tilt pad reads `#fcfcfc`–`#fdfdfd` under its knob's shadow. |
| `--bt-bg-control` | `#f1f1f1` | Segmented track, value badge, soft button, hover fill |
| `--bt-bg-control-subtle` | `#f9f9f9` | Disabled soft button, disabled chip |
| `--bt-bg-item-hover` | `#f7f7f7` | Menu item hover |
| `--bt-bg-control-active` | `#ececec` | Ghost trigger while its menu is open |
| `--bt-border` | `#ebebeb` | Row dividers, section border, footer divider, header separator |
| `--bt-border-strong` | `#e3e3e3` | Slider track, inputs, anchor-grid box, tilt pad |
| `--bt-text-strong` | `#1a1a1a` | Dialog titles |
| `--bt-text` | `#303030` | Labels, primary text, active segment |
| `--bt-text-secondary` | `#616161` | Section titles, body copy, value badges, icons, inactive segments |
| `--bt-text-tertiary` | `#6b6b6b` | Captions/hints. **The reference uses `#8a8a8a`, which fails WCAG AA.** `#6b6b6b` passes on white (5.3:1), section (5.0:1) and app bg (4.8:1). |
| `--bt-text-disabled` | `#acacac` | Disabled text (exempt from contrast rules, like all inactive UI) |
| `--bt-text-disabled-subtle` | `#b8b8b8` | Disabled chip text (measured; lighter than `text-disabled`) |
| `--bt-icon-disabled` | `#c0c0c0` | Disabled icons |
| `--bt-primary` | `#1a1a1a` | Primary button / split button |
| `--bt-primary-hover` | `#2b2b2b` | Primary hover (lightens, doesn't darken) |
| `--bt-primary-disabled` | `#a3a3a3` | Disabled primary background (text stays white) |
| `--bt-on-primary` | `#ffffff` | Text on primary |
| `--bt-divider-on-primary` | `rgba(255,255,255,.18)` | Hairline between a split button's halves |
| `--bt-inverse-bg` / `--bt-inverse-text` / `--bt-inverse-text-secondary` | `#1a1a1a` / `#ffffff` / `#a3a3a3` | Tooltip, toast |
| `--bt-accent` | `#2862e0` | Focus ring, tilt-direction arc, selection highlights |
| `--bt-selection` | `rgba(40,98,224,0.2)` | Text selection (_derived_: the accent at 20%) |
| `--bt-overlay` | `rgba(0,0,0,0.32)` | Dialog scrim (no blur) |
| `--bt-wash` | `rgba(255,255,255,0.55)` | Blur scrim wash behind menus |
| `--bt-dot` / `--bt-dot-active` | `#e8e8e8` / `#303030` | Page dots, idle anchor dots |
| `--bt-ring-selected` | `#cacaca` | Selected swatch ring, crop handle border, drop-zone dashes |

Knob (slider thumb, tilt knob, active anchor dot):

| Token | Value |
|---|---|
| `--bt-knob-top` → `--bt-knob-bottom` | `#535353` → `#2e2e2e` (vertical gradient — slider thumb) |
| `--bt-knob-center` → `--bt-knob-edge` | `#5c5c5c` → `#262626` (radial gradient lit 30% down from the top and ending at the bottom edge: `radial-gradient(circle farthest-side at 50% 30%, …)` — tilt knob, active anchor dot; re-measured in Phase 2, the first spec's `#474747` → `#353535` read flat) |
| `--bt-knob-border` | `#1c1c1c` |
| `--bt-knob-highlight` | `#7a7a7a` (1px inset top highlight) |
| `--bt-knob-grip` | `#b2b2b2` (two vertical grip lines) |

Decorative (onboarding illustrations, brand mark):

| Token | Value |
|---|---|
| `--bt-traffic-red/yellow/green` | `#ed6c61` / `#f5c05c` / `#5ac55e` |
| `--bt-brand-butter` / `--bt-brand-butter-deep` / `--bt-brand-cream` | `#f5d06f` / `#e8b64a` / `#fff4d6` — buttery's own brand colors (see `BRAND.md`). Decorative only: the mark, docs site, marketing. The UI itself stays neutral. |
| `--bt-skeleton` / `--bt-skeleton-strong` | `#f2f2f4` / `#ececee` (skeleton blocks/lines in illustrations) |

### Palettes (`@buttery/core/palettes`)

buttery's own set, derived in OKLCH rather than taken from the references: 20 two-stop gradients and 14 solids. Six hue families (butter, apricot, rose, lilac, sky, mint) run across three rows: cream pastels (L 0.95 → 0.87), fresh mids (L 0.84 → 0.66, more chroma) and a deep row (espresso, slate, ink, forest, plum, graphite). A fourth row holds a light neutral pair: paper (warm, C ≤ 0.022) and stone (cool, C ≤ 0.014). Each gradient's second stop shifts lightness, chroma and hue a little toward a neighbor; `gradientCss` blends them in OKLab at 135°, top-left → bottom-right, which keeps the midpoints from going gray. The solids are the OKLab midpoints of the cream, deep and neutral rows. Hex values are gamut-mapped from the OKLCH source, so CSS and canvas export draw the same color.

### Dark (_derived_ — references are light-only)

| Token | Value |
|---|---|
| bg-app / surface / section / inset | `#0f0f10` / `#19191b` / `#141416` / `#161618` |
| control / control-subtle / item-hover / control-active | `#232326` / `#1e1e20` / `#202023` / `#2a2a2d` |
| border / border-strong | `#2a2a2e` / `#333338` |
| text-strong / text / secondary / tertiary | `#f5f5f6` / `#ececed` / `#a0a0a6` / `#93939a` (tertiary raised from `#8e8e95` in Phase 2, which measured 4.27:1 on the raised surface) |
| text-disabled / icon-disabled | `#55555b` / `#4a4a50` |
| primary / primary-hover / primary-disabled / on-primary | `#f2f2f3` / `#ffffff` / `#4a4a50` / `#111111` |
| divider-on-primary | `rgba(17,17,17,.18)` |
| inverse-bg / inverse-text / inverse-text-secondary | `#f2f2f3` / `#111111` / `#6b6b6b` |
| knob | same gradients, border `#000`, plus a 1px `rgba(255,255,255,.08)` outer ring |
| overlay / wash | `rgba(0,0,0,.55)` / `rgba(15,15,16,.55)` |
| ring-selected / dot / dot-active | `#4a4a50` / `#2e2e32` / `#ececed` |
| raised / floating (Phase 1) | `#2c2c30` / `#1f1f22`: lighter than the surface, so raised and floating layers still read as raised |
| accent / selection (Phase 1) | `#4f89ff` (the light accent at OKLCH L 0.65, 5.3:1 on the surface) / `rgba(79,137,255,0.3)` |
| text-disabled-subtle (Phase 1) | `#4d4d53`: one step closer to the background than `text-disabled` (`#55555b`), as in light |
| skeleton / skeleton-strong (Phase 1) | `#232326` / `#2a2a2d` |
| shadow-card (Phase 1) | `0 0 0 1px rgba(255,255,255,.06), 0 1px 2px rgba(0,0,0,.24)`: a light ring replaces the black one, which disappears on `#19191b`, and the drop stays soft so a card's well reads evenly |
| shadow-raised / floating / dialog (Phase 1) | light ring at 9%, 9% and 10% over drops at 60%, 50% + 30%, and 60% black |
| shadow-inset (Phase 1) | `inset 0 0 0 1px rgba(255,255,255,.06)` |

Every dark value is _derived_; they need a visual pass on real screens.

Every **active** text/background pair passes WCAG AA in both themes. Disabled states are exempt (WCAG 1.4.3). Phase 1 verifies this with a unit test that computes contrast for every declared token pair.

---

## 2. Typography

- Family: **Inter Variable**, bundled via `@fontsource-variable/inter`. It's a dependency of `@buttery/core`, and `styles.css` imports it, so apps get it from the two CSS imports. Desktop apps must work offline, so there's no font CDN. Fallback: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- Numbers in values, badges, dimensions: `font-variant-numeric: tabular-nums`.
- Tracking tokens: `--bt-tracking-tight: -0.01em` (≥15px semibold), `--bt-tracking-display: -0.02em` (≥32px).

| Role token | Size / line-height | Weight | Color | Where |
|---|---|---|---|---|
| `title` | 15 / 20 | 600, tight | text | Empty-state title (re-measured in Phase 1; the first spec said 16 / 22) |
| `dialog-title` | 15 / 20 | 600 | text-strong | Dialog title |
| `title-sm` | 14 / 20 | 600 | text | App/document title in the header |
| `label` | 14 / 20 | 500 | text | Inspector row labels |
| `body` | 14 / 22 | 400 | text-secondary | Dialog body |
| `body-sm` | 13 / 20 | 400 | text-secondary | Empty-state description (re-measured in Phase 1) |
| `button` | 14 / 20 | 500 | — | Pill buttons |
| `button-lg` | 15 / 20 | 600 | — | 48px CTA buttons |
| `control` | 13 / 18 | 500 | secondary / text when active | Segmented items, section titles, reset links |
| `menu` | 14 / 20 | 400 | text | Menu items |
| `badge` | 12 / 16 | 500 tabular | text-secondary | Value badges, chips |
| `caption` | 12 / 16 | 400 | text-tertiary | Hints under a title, such as a shortcut tip |
| `kbd` | 11 / 14 | 500 | text-secondary | Keycaps |

Page display roles (`display`, `heading-1`, `heading-2`, `body-lg`) are tokens too — values in `LAYOUT_RULES.md` §4.

Text stacks (a title, body and caption under each other in dialogs, empty states and page sections) trim their line boxes with `text-box: trim-both cap alphabetic` where the engine supports it (WebKit 18.2+, Chromium 133+, so the macOS desktop app has it). The spacing token between two text blocks is then the gap you see. Gaps stay on the 4px scale; engines without support show them a few px larger, which is fine. Control text (buttons, segments, rows) is centered by its control and isn't trimmed, and trimmed text never sits in a box that clips overflow, because its descenders would be cut. The text-stack gaps in §5 were re-derived this way in Phase 1, and the trimmed onboarding block lands within 1px of the capture. Without `text-box` support the same tokens make that block about 28px taller, because every line box keeps its half-leading.

---

## 3. Spacing, sizing, radius

### Spacing scale (4px grid)
`0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128` → tokens `--bt-space-0, -0_5, -1, -1_5, -2, -3, -4, -5, -6, -8, -10, -12, -16, -24, -32` (number = px ÷ 4; props accept `"0.5"`, `"1.5"`, `4`, …).
The section well is `--bt-space-well: 4px`, on the scale (the capture shows 3px; widened by the maintainer's call so the inner card reads as sitting inside its section).

### Control heights

| Token | Comfortable | Compact | Used by |
|---|---|---|---|
| `--bt-h-badge` | 20 | 18 | Value badge, chip, keycap |
| `--bt-h-sm` | 28 | 28 | Small icon buttons, dialog close (stays 28 in compact: standalone buttons are never shorter) |
| `--bt-h-control` | 34 | 30 | Segmented track (items = height − 4), inputs, selects |
| `--bt-h-button` | 36 | 32 | Pill buttons, split button, header actions, menu items, toast |
| `--bt-h-cta` | 48 | 40 | Step dialog buttons, floating toolbar |
| `--bt-h-row` | 50 (49 + 1px divider) | 42 | Inspector row |
| `--bt-h-row-split` | 64 (63 + 1px divider) | 56 | Inspector split row (tilt pad, anchor grid); measured 63.5 in Phase 2 |
| `--bt-h-header` | 56 | 48 | App header bar |

### Widths & layout sizes

| Token | Value |
|---|---|
| `--bt-w-shell-max` | 1380 (AppShell max width, centered — measured) |
| `--bt-w-inspector` | 340 |
| `--bt-w-dialog` | 400 |
| `--bt-w-menu-min` | 200 |
| `--bt-w-row-control` | 164 (slider width in a row) |
| `--bt-w-page` | 1200 (page content max width) |
| `--bt-bento-row` | 320 (bento row unit) |
| `--bt-inset-titlebar` | 84 (HeaderBar's left padding in desktop apps, measured from its own left edge: the macOS window controls span x 28–88 of the window, so content starts at 100, 12px clear) |

Component-internal dimensions (thumb 24, tilt pad 32, anchor box 43, color dot 22, handle 12, dot 6…) are declared as component-scoped variables at the top of that component's CSS (`--bt-slider-thumb: 24px`), not as global tokens.

### Radius scale (concentric)

| Token | Value | Used by |
|---|---|---|
| `--bt-r-xs` | 6 | Value badge, chip |
| `--bt-r-kbd` | 5 | Keycap |
| `--bt-r-thumb` | 7 | Slider thumb, app icon |
| `--bt-r-sm` | 8 | Swatch, illustration window card, tooltip |
| `--bt-r-md` | 10 | Anchor grid box, menu item, dialog media (18 − 8) |
| `--bt-r-lg` | 12 | Inner row card, inputs, CTA buttons, stage canvas |
| `--bt-r-xl` | 14 | Spare step between `lg` and `2xl`; no component uses it yet |
| `--bt-r-2xl` | 16 | Section well (card 12 + well 4) |
| `--bt-r-3xl` | 16 | Header bar, inspector panel, menu |
| `--bt-r-dialog` | 18 | Dialog |
| `--bt-r-full` | 9999 | Pill buttons, toast, floating toolbar, dots |

### Elevation (shadows)

| Token | Value | Used by |
|---|---|---|
| `--bt-shadow-card` | `0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)` | Header bar, inspector panel, inner row card |
| `--bt-shadow-raised` | `0 0 0 1px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.08)` | Secondary button, hovered card |
| `--bt-shadow-selected` | Same as raised in light; dark rings it with `rgba(255,255,255,.16)` | The selected pill on a control track (segmented items, shared indicators) |
| `--bt-shadow-knob` | `0 1px 2px rgba(0,0,0,.25), 0 2px 6px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.18)` | Slider thumb, tilt knob |
| `--bt-shadow-floating` | `0 0 0 1px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.04)` | Menu, floating toolbar, toast |
| `--bt-shadow-dialog` | `0 0 0 1px rgba(0,0,0,.08), 0 16px 48px rgba(0,0,0,.16)` | Dialog |
| `--bt-shadow-inset` | `inset 0 0 0 1px rgba(0,0,0,.06)` | Swatches, color dots |
| `--bt-ring-select` | `0 0 0 2px var(--bt-bg-surface), 0 0 0 3.5px var(--bt-ring-selected)` | Selected swatch |
| `--bt-ring-focus` | `0 0 0 2px var(--bt-bg-surface), 0 0 0 4px var(--bt-accent)` | Focus ring as a shadow, for components that can't use the outline. `:focus-visible` everywhere else draws an outline: 2px `accent`, 2px offset (`--bt-focus-width`, `--bt-focus-offset`), which composes with surface shadows. |

### Z layers (never use raw z-index)

`base 0 · raised 10 · scrim-nav 15 · sticky 20 · floating 30 · dropdown 40 · overlay 50 · modal 60 · toast 70 · tooltip 80 · dev 90`

- A scrim belongs to its owning layer and renders directly beneath that layer's content (a dialog's scrim is at `modal − 1`).
- The menu blur scrim (`scrim-nav`) sits **below** the nav bar, which stacks at `sticky` whatever its `behavior`; the open menu panel sits in the bar's stacking context, so the bar and the menu stay crisp while the page blurs.
- Overlays opened from inside another overlay (a Select inside a Dialog) stack above their parent: the layer manager assigns increasing z within the band, in open order.

---

## 4. Surfaces — the nesting recipe

The signature look is **nested surfaces with concentric corners**:

```
app bg #f3f3f4
└─ Panel        white, r16, shadow-card, padding 8, gap 8
   └─ Section   #f7f7f7, r16, 1px border, header 36px padded 16 (title left, a reset action right), padding 0 4 4
      └─ Card   white, r12 (= 16 − 4), shadow-card (its 1px ring is the edge; no border), rows divided by 1px border
         └─ Row 50px, padding-x 16
```

Concentric rule: **a child's radius = its parent's radius − the parent's padding.** Section → Card follows it (16 − 4 = 12). **Panel → Section is the one deliberate exception**: sections are sized from the inside out (card 12 + well 4 = 16), so `Section` sets `r16` explicitly instead of `auto`.

A nested surface sits evenly inside its parent: the same inset on every open side, and its title (a section header) on the same left edge as the rows inside it. That's why the section header is padded 16, matching the rows, rather than 12.

`Surface` levels: `app · panel · section · card · raised · floating · dialog · inset`. Each level sets background, border, shadow, radius and padding. In React, `radius="auto"` computes `parentRadius − parentPadding` (min 4px) from context. Don't implement this with self-referencing CSS custom properties — they form a cycle on the same element. The CSS-only recipes carry pre-computed values.

---

## 5. Components (measured specs)

### Button
| Variant | Rest | Hover | Disabled |
|---|---|---|---|
| `primary` | bg `primary`, text `on-primary` | `primary-hover` | bg `primary-disabled`, text `on-primary` |
| `secondary` | `bg-surface`, no ring or shadow, text `text` (measured on the stage; on a white surface use `soft`) | shadow-raised _derived_ | text `text-disabled` |
| `soft` | bg `bg-control`, text `text` | bg `border` (#ebebeb) | bg `bg-control-subtle`, text `text-disabled` |
| `ghost` | transparent, text `text-secondary` | bg `bg-control`, text `text` | text `icon-disabled` |

- Sizes: `sm` 28 · `md` 36 (default) · `cta` 48.
- Shapes: `pill` (default, r-full, padding-x 20) or `rounded` (r12 — dialog CTAs).
- Icons 16px, stroke 1.75, gap 6. `loading` swaps the label for a spinner without changing width.
- `arrow="forward" | "back"` adds the navigation arrow (MOTION_SPEC §4.5): a 16px chevron after the label (before it for back), gap 6, that draws its stem on hover or focus. Only its transforms change, so the button never changes width: the head nudges 3px into the padding. `loading` hides it and keeps the space.
- Press: scale 0.97 (MOTION_SPEC).

### ArrowLink
A text link with the same arrow part as `Button`: `label` role in `primary`, hover `primary-hover`, arrow 16px after the label, gap 4. Its arrow box is 3px wider than a button's, since a link has no padding for the head to nudge into. Underlined only on keyboard focus, beside the focus ring.

### IconButton
Ghost, square, r-full: `md` 36×36 (header, default) · `sm` 28×28 (dialog close, inline). Icon 16 `text-secondary`, disabled `icon-disabled`, hover bg `bg-control`. Requires `label` (tooltip + aria-label): every icon button carries its own `Tooltip`. For a toggle, pass `aria-pressed`; the hover background stays on while it's pressed.

### SplitButton
Primary pill 36h. Main segment + 1px `divider-on-primary` divider, half the button's height (18; measured 17.5) and centered, + 36px chevron segment that opens a Menu. Both halves share hover/disabled visuals but are separate focus targets.

### SegmentedControl
Track `bg-control`, 34h, `r-full`, padding 2. Items 30h, `r-full`, padding-x 12, `control` type. Re-measured in Phase 1: the track and items are full pills (the first spec said r14 and r12). The capture insets its items 3px; buttery keeps the 2px step, so its active item is 2px taller. Inactive text `text-secondary`; active = `bg-surface` + shadow-raised, text `text`. Exactly one item is always selected: Radix `ToggleGroup type="single"` lets users deselect, so ignore empty values in `onValueChange` (or build on `RadioGroup`). The active background is one shared element that slides. Segments share the track equally (equal grid columns), so the pill keeps its width as it slides; built on Radix `RadioGroup`, so arrow keys move the selection.

### Slider row
- Row grid: `[label + badge] [track]`. Label `label` role, gap 8 to badge.
- Value badge: 20h, r6, bg `bg-control`, padding-x 6, `badge` role, min-width reserved for the longest formatted value (e.g. `-180°`) so it never jitters.
- Track: 164w × 14h, r7, 1px `border-strong`, fill `bg-surface`. **No filled range** (reference). Optional `showRange`.
- Thumb: 24×24, r7, knob gradient + border + highlight, two 1.5×8 grip lines 3px apart, shadow-knob. Hit area 36×36 via a `[data-bt-hit]` element.
- Behaviors: click/drag anywhere on the track · arrows step, Shift = ×10 · double-click label or badge, or Backspace/Delete on the thumb = reset to default · optional `detents` (soft snap within ±2% to e.g. 0°, while dragging only, so keyboard steps pass through) · value formatter (`%`, `°`, px), also read to screen readers as the thumb's value text. The badge reserves the formatted min and max.

### Chip (a small reset action next to a control)
20h, r6, `badge` role, hit area 24. Disabled: bg `bg-control-subtle`, text `text-disabled-subtle`. Enabled: bg `bg-control`, text `text-secondary`, hover text `text`.

### SwatchGrid
6 columns, gap 8, swatches fill the column (41px at inspector width), aspect 1, r8, shadow-inset. Selected: `--bt-ring-select`. Radio-group semantics with arrow-key navigation. Holds gradient or solid presets.

### ColorDot + swap
22px circle, shadow-inset, 6px gap between dots, hit area 28. Opens a color picker (native `<input type="color">` in v1). Swap = `IconButton sm` with `arrow-left-right`.

### TiltPad
Pad 32px circle: `bg-inset`, 1px `border-strong`. Knob 24px: radial `knob-center` → `knob-edge`, 1px `knob-border`, shadow-knob. When tilted, an accent arc (`accent`, 2px) appears on the knob edge in the tilt direction, opacity ∝ magnitude. Value `{x, y}` in −1…1 (maps to rotateY/rotateX ±20°, perspective 1200px). Paired with a reset chip.

### AnchorGrid
43×43 box, r10, 1px `border-strong`, `bg-inset`. 3×3 dots on an 11.5px pitch: idle 6px `dot`, active 10px radial knob. Radio semantics, 2D arrow keys. The whole box is the hit target (cells are ~14px), marked `data-bt-target="group"`.

### Menu / Select
- Trigger: ghost pill; while open, bg `bg-control-active`.
- Content: `bg-surface`, r16, padding 6, shadow-floating, min-width 200, side offset 8, align end.
- Item: 36h, r10, padding-x 12 (measured ~14), `menu` role; highlight `bg-item-hover`; selected shows a 16px check on the right.
- Separator: 1px `border`, margin 6 0.
- Footer slot (e.g. a pair of number fields): labels `control` role in `text-secondary`, inputs 34h r12 1px `border-strong`, tabular, with a stepper.

### NumberField
34h, 128w (`--bt-number-field-width`), r12, 1px `border-strong`, padding-x 12, tabular, stepper on hover/focus, optional scrub-to-change by dragging the label (one change per frame). The whole field is the label. Typing edits a draft: Enter or leaving commits, Escape puts back the value; arrows step, Shift = ×10. The stepper buttons stay out of the tab order, since the arrow keys do the same.

### Tooltip
`inverse-bg` pill, `inverse-text` 12/500, padding 4×8, r8, 500ms open delay, no arrow. Content-sized (not height-checked). Opens at once on keyboard focus, closes on Escape, renders in the tooltip band above dialogs. The root `ButteryProvider` hosts one provider for all tooltips, so moving between them skips the delay.

### Dialog
400w, r18, padding 8 (media) / 24 (text), shadow-dialog, scrim `overlay`. Close: `IconButton sm` at the media's top-right, centered 24px from the top and right edges (designed overlap — marked `data-bt-allow-overlap`).

### Onboarding (StepDialog)
- Media: 384×200, r10, per-step gradient background, holding a small scene whose elements morph between steps.
- Title `dialog-title` (24px below media) · body `body` (16px below) · caption `caption` (20px below). Gaps are between trimmed text boxes (see §2).
- PageDots 20px below caption: dots 6px, gap 6, inactive `dot`, active = 18×6 pill `dot-active`. Dots are indicators, not buttons.
- Buttons 16px below the dots: two equal columns (`Inline uniform`), gap 8, 48h, r12. The back button is soft with `arrow="back"` (disabled on the first step) and the forward button is primary with `arrow="forward"`; on the last step its label changes (e.g. "Continue" → "Finish") and the arrow goes, since finishing isn't moving on; the button keeps its width, as the two columns are equal. Bottom padding 24.
- Scenes: each step's media is a small scene built from buttery parts whose shared elements morph between steps. Card Studio designs its own scenes around its features.

### Toast
`inverse-bg` pill, 36h (measured 38, snapped to `--bt-h-button`), padding-x 16, `body`-size text in `inverse-text`, action 14/500 in `inverse-text-secondary` (hover `inverse-text`), gap 20, shadow-floating. One line: a long message truncates at the lane's width (the viewport minus 24 a side). The action's target is 24 tall (2px block padding).
- Shown with `toast(message, options)` from `@buttery/react`; the `Toaster` that `ButteryProvider` mounts stacks them in the `bottom-center` floating lane, 8 apart, newest at the bottom.
- **Three at most.** A fourth lets the one shown or updated longest ago go. A toast with the `id` of one showing updates it in its place, with its time started over and read out again, so repeating an action never stacks copies and nothing moves.
- Stays 3s (`--bt-toast-life`), or 5s with an action (`--bt-toast-life-action`); `duration: Infinity` keeps it until dismissed. The clock stops while the pointer or focus is on the toasts or the window is in the background.
- Closes on Escape while it has focus (with the region focused, Escape closes the newest), a swipe down past 50px, its action, or `toast.dismiss(id)`. Escape anywhere else is left to the page, so menus, dialogs and the app's own shortcuts keep it. F8 moves focus to the region ("Notifications (F8)"); Tab goes through the toasts newest first, each followed by its action. When the last toast leaves, focus goes back to where it was before F8 or the click.
- Screen readers hear "Notification" and the message, then the action's `altText` as its own sentence; `background: true` toasts are read at the next pause.

### FloatingToolbar (crop bar)
`bg-surface` pill, 48h (padding 6), gap 4, shadow-floating. Left to right: meta text (the current size, `control` role, tabular), a ghost reset, a soft cancel and a primary confirm. **Anchored**: positioned 12px below its anchor, centered, clamped to the viewport, and registered with `FloatingLanes` as an obstacle so lane items (toasts) move above it.

### HeaderBar
56h, r16, `bg-surface`, shadow-card, padding-x 16. Left: 24px app mark (the app's own icon; buttery's playground uses `BrandMark`) + title (`title-sm`, 12px gap, truncates). Right: ghost text actions, ghost icon actions, Select trigger, a 1px × 24 separator, undo/redo/help `IconButton`s; gap 4. Overflowing actions move into a "…" menu automatically (`OverflowCluster`).

### NavBar + MorphMenu (_derived_ from buttery's tokens; behavior in MOTION_SPEC §4.1)
- Bar: 64h, aligned to the page container. Left: `BrandMark` (24) and the nav items, ghost pills 36h, padding-x 12, `control` role in `text-secondary` (hover `text`); triggers add a 16px chevron, gap 4; plain links have none. Right: a `secondary` pill and a `primary` call to action with `arrow="forward"`, gap 8. At rest over a colorful hero the bar has no background.
- Open trigger: label `text-strong`, chevron turned 180°.
- Panel: the `floating` surface (r16, shadow-floating) reaching up behind the bar row, so the nav items sit inside its top edge. Padding 24; columns laid out with `Grid`, gap 32. A column has a group heading (`control` role, `text-secondary`) and items 8 apart, each a title (`label`, `text`) over a one-line caption (`caption`, `text-secondary`), r10, hover background `bg-item-hover`. An optional featured column fills the panel's end edge to edge on the `section` level, padding 24, clipped by the panel's corners rather than given a radius of its own (so the concentric rule keeps its one exception). A footer row under a 1px `border` divider holds a "See all" `ArrowLink`. Max width: the container, never wider than the viewport minus 16px.
- Below 640px of container width: a menu button (`IconButton md`) opens a full-height sheet in which each menu becomes an accordion section.
- `behavior`: `static` (default) · `sticky` · `auto-hide`. Pinned past the hero, the bar takes the `panel` surface with `shadow-card`.

### Inspector
340w panel (padding 8, gap 8 between sections) with a sticky footer: 1px divider, padding 12, buttons 36h gap 8 (a soft button with an icon, padded 32 a side — measured 118 wide with a short label — and a primary SplitButton filling the rest). The body scrolls internally with 12px fade masks at scrolled edges.

### EmptyState / DropZone
Centered in the stage. Title `title`, description `body-sm` 12px below, actions 24px below (primary pill + secondary pill, gap 8); gaps are between trimmed text boxes. The whole stage accepts drops; paste `⌘V`, open `⌘O`. Drag-over (_derived_): bg tints to `bg-control-active`, 2px dashed `ring-selected` inset 16px, r16, label "Drop to add".

### Stage (canvas)
Content box fits the available space at the chosen aspect ratio (`FitBox`: never overflows, always centered, 32px minimum margin), r12, shadow-card. Artwork inside is `data-bt-allow-overlap`. Crop mode: background fades out, the image scales to fit, 8 handles (12px `bg-surface` circles, 1px `ring-selected` border, 24px hit areas) on a 1px frame, FloatingToolbar below.

### Kbd
Keycap: 20h, min-width 20, r5, `bg-surface`, 1px `border-strong` plus a 1px bottom edge, `kbd` role.
