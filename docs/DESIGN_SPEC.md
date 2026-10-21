# buttery — Design Spec

Every value below was measured from local reference captures that aren't part of the repo (the two app screenshots are 2× retina captures, converted to CSS px). Where something is **derived** (not visible in the references), it's marked _derived_ — tune it by eye. Where a measured value was snapped to the scale, the measurement is noted.

**buttery is its own design system.** The references are inspiration, not a template:

- **Look & feel** (this doc) comes from the app captures: quiet neutral grays, nested rounded surfaces, dark pill actions, tactile knobs.
- **Layout & motion choreography** comes from a second set of page captures; see `LAYOUT_RULES.md` and `MOTION_SPEC.md`.
- **The App kit's structure, density and timing** (§6) come from frames of a product dashboard; its look is this doc's.

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
| `--bt-border-strong` | `#e3e3e3` | Slider track, anchor-grid box, tilt pad, a disabled input's edge (inputs were measured with it; they now take `control-border`) |
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
| `--bt-inverse-success` / `-warning` / `-danger` | `#4cc38a` / `#f2a33a` / `#ff7a6e` (dark: `#177245` / `#9a4d00` / `#c72a1c`) | A toned toast's icon |
| `--bt-inverse-success-bg` / `-warning-bg` / `-danger-bg` | `#26342c` / `#3b3024` / `#3e2b28` (dark: `#d5e0d9` / `#e7dad3` / `#f0d9d5`) | A toned toast's pill |
| `--bt-accent` | `#2862e0` | Focus ring, tilt-direction arc, selection highlights |
| `--bt-selection` | `rgba(40,98,224,0.2)` | Text selection (_derived_: the accent at 20%) |
| `--bt-overlay` | `rgba(0,0,0,0.32)` | Dialog scrim (no blur) |
| `--bt-wash` | `rgba(255,255,255,0.55)` | Blur scrim wash behind menus |
| `--bt-dot` / `--bt-dot-active` | `#e8e8e8` / `#303030` | Page dots, idle anchor dots |
| `--bt-ring-selected` | `#cacaca` | Selected swatch ring, crop handle border, drop-zone dashes |
| `--bt-danger` / `--bt-danger-subtle` | `#c72a1c` / `#fdeceb` | A field's error border and message, error icons / an error callout's background (_derived_, Phase 4.5) |
| `--bt-success` / `--bt-success-subtle` | `#177245` / `#e7f5ed` | Success text and icons, a met requirement / a success callout (_derived_) |
| `--bt-warning` / `--bt-warning-subtle` | `#9a4d00` / `#fdf1e2` | Warning text and icons / a warning callout (_derived_) |
| `--bt-accent-subtle` | `#e9f0fd` | An info callout's background (_derived_) |
| `--bt-accent-text` | `#2862e0` | The accent as text: links and icons in an info callout, 4.5:1 on the surface and on `accent-subtle`; the accent itself unless a theme's accent is too light (_derived_) |
| `--bt-control-border` | `#858585` | The edge that marks a control where nothing else does: a text input's box, a checkbox's box, a switch's track; 3:1 on every surface, as WCAG 1.4.11 asks (_derived_, Phase 4.5) |

Knob (slider thumb, tilt knob, active anchor dot):

| Token | Value |
|---|---|
| `--bt-knob-top` → `--bt-knob-bottom` | `#535353` → `#2e2e2e` (vertical gradient — slider thumb) |
| `--bt-knob-center` → `--bt-knob-edge` | `#5c5c5c` → `#262626` (radial gradient lit 30% down from the top and ending at the bottom edge: `radial-gradient(circle farthest-side at 50% 30%, …)` — tilt knob, active anchor dot; re-measured in Phase 2, the first spec's `#474747` → `#353535` read flat) |
| `--bt-knob-border` | `#1c1c1c` |
| `--bt-knob-highlight` | `#7a7a7a` (1px inset top highlight) |
| `--bt-knob-grip` | `#b2b2b2` (two vertical grip lines) |
| `--bt-knob-ring` | `#ffffff` in both themes: the ring around the color picker's thumbs, which sit on any color |

Decorative (onboarding illustrations, brand mark):

| Token | Value |
|---|---|
| `--bt-traffic-red/yellow/green` | `#ed6c61` / `#f5c05c` / `#5ac55e` |
| `--bt-brand-butter` / `--bt-brand-butter-deep` / `--bt-brand-cream` | `#f5d06f` / `#e8b64a` / `#fff4d6` — buttery's own brand colors (see `BRAND.md`). Decorative only: the mark, docs site, marketing. The UI itself stays neutral. |
| `--bt-skeleton` / `--bt-skeleton-strong` | `#f2f2f4` / `#ececee` (skeleton blocks/lines in illustrations) |

### Palettes (`@buttery/core/palettes`)

buttery's own set, derived in OKLCH rather than taken from the references: 24 two-stop gradients in four rows of six (`gradientRows`), and 18 solids. Six hue families (butter, apricot, rose, lilac, sky, mint), one to a column, run down three rows: cream pastels (L 0.95 → 0.87), fresh mids (L 0.84 → 0.66, more chroma) and a deep row (espresso, rust, plum, ink, navy, forest). The fourth row is neutral, light to dark, each a clear step from the last (midpoints L 0.94 → 0.30): paper (warm white), fog (cool), stone (warm gray), sand (tan), slate (blue-gray) and graphite (near-black, distinct from every deep color). Each gradient's second stop shifts lightness, chroma and hue a little toward a neighbor; `gradientCss` blends them in OKLab at 135°, top-left → bottom-right, which keeps the midpoints from going gray. The solids are the OKLab midpoints of the cream, deep and neutral rows. Hex values are gamut-mapped from the OKLCH source, so CSS and canvas export draw the same color.

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
| control-border (Phase 4.5) | `#75757c`: 3:1 on every surface, the raised one included |
| danger, success, warning and their `-subtle` backgrounds, accent-subtle, accent-text (Phase 4.5) | `#ff7a6e` / `#3a1916`, `#4cc38a` / `#132c20`, `#f2a33a` / `#33230f`, `#16223b`, `#4f89ff`: each tone passes 4.5:1 on every surface and on its own background, and text passes on each background |
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
| `title-lg` | 24 / 30 | 600, tight | text-strong | App page titles, metric values (Phase 6B) |
| `title-md` | 18 / 24 | 600, tight | text-strong | Section headings in app pages, right-rail card titles (Phase 6B) |
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
| `--bt-h-nav-bar` | 64 | 64 | Page nav bar; page chrome keeps its height |
| `--bt-h-sub-nav` | 48 | 48 | Page sub nav bar under the nav bar; page chrome keeps its height |
| `--bt-h-table-row` | 36 (35 + 1px divider) | 32 | Table header and body rows (Phase 6B) |

### Widths & layout sizes

| Token | Value |
|---|---|
| `--bt-w-shell-max` | 1380 (AppShell max width, centered — measured) |
| `--bt-w-inspector` | 340 |
| `--bt-w-sidebar` / `--bt-w-sidebar-rail` | 240 / 56 (an app's sidebar, and the sidebar as an icon rail; Phase 6B) |
| `--bt-w-app-page` | 1280 (a contained app page's content, padding included) |
| `--bt-w-aside` | 320 (an app page's right rail) |
| `--bt-w-search` | 360 (the top bar's search field, at most) |
| `--bt-w-dialog` | 400 |
| `--bt-w-dialog-md` / `--bt-w-dialog-lg` | 560 / 880 (wider dialogs: a list of choices; copy beside an illustration) |
| `--bt-w-menu-min` | 200 |
| `--bt-w-row-control` | 160 (slider width in a row; measured 162–164, see DECISIONS) |
| `--bt-w-page` | 1200 (page content max width) |
| `--bt-bento-row` | 320 (bento row unit) |
| `--bt-nav-panel-min` | 200 (the least a nav menu's panel shows below its bar in a short window) |
| `--bt-inset-titlebar` | 84 (HeaderBar's left padding in desktop apps, measured from its own left edge: the macOS window controls span x 28–88 of the window, so content starts at 100, 12px clear) |

Component-internal dimensions (thumb 24, tilt pad 32, anchor box 43, color dot 24, handle 12, dot 6…) are declared as component-scoped variables at the top of that component's CSS (`--bt-slider-thumb: 24px`), not as global tokens.

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
| `secondary` | `bg-raised` (the same white as `bg-surface` in light, a step lighter in dark), no ring or shadow, text `text` (measured on the stage; on a white surface use `soft`) | shadow-raised _derived_ | text `text-disabled` |
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
Ghost, square, r-full: `md` 36×36 (header, default) · `sm` 28×28 (dialog close, inline). Icon 16 `text-secondary`, disabled `icon-disabled`, hover bg `bg-control`. Requires `label` (tooltip + aria-label): every icon button carries its own `Tooltip`. For a toggle, pass `aria-pressed`; the hover background stays on while it's pressed. `aria-disabled` keeps it focusable while it can't act (Undo with nothing to undo): it looks disabled and ignores presses.

### SplitButton
Primary pill 36h. Main segment + 1px `divider-on-primary` divider, half the button's height (18; measured 17.5) and centered, + 36px chevron segment that opens a Menu. Both halves share hover/disabled visuals but are separate focus targets.

### SegmentedControl
Track `bg-control`, 34h, `r-full`, padding 2. Items 30h, `r-full`, padding-x 12, `control` type. Re-measured in Phase 1: the track and items are full pills (the first spec said r14 and r12). The capture insets its items 3px; buttery keeps the 2px step, so its active item is 2px taller. Inactive text `text-secondary`; active = `bg-raised` + `shadow-selected`, text `text`. Exactly one item is always selected: Radix `ToggleGroup type="single"` lets users deselect, so ignore empty values in `onValueChange` (or build on `RadioGroup`). The active background is one shared element that slides. Segments share the track equally (equal grid columns), so the pill keeps its width as it slides; built on Radix `RadioGroup`, so arrow keys move the selection.

### Slider row
- Row grid: `[label + badge] [track]`. Label `label` role, gap 8 to badge.
- Value badge: 20h, r6, bg `bg-control`, padding-x 6, `badge` role, min-width reserved for the longest formatted value (e.g. `-180°`) so it never jitters.
- Track: 160w × 14h (measured 162–164), r7, 1px `border-strong`, fill `bg-surface`, 8 after the caption. **No filled range** (reference). Optional `showRange`.
- Thumb: 24×24, r7, knob gradient + border + highlight, two 1.5×8 grip lines 3px apart, shadow-knob. Hit area 36×36 via a `[data-bt-hit]` element.
- Behaviors: click/drag anywhere on the track · arrows step, Shift = ×10 · double-click label or badge, or Backspace/Delete on the thumb = reset to default · optional `detents` (soft snap within ±2% to e.g. 0°, while dragging only, so keyboard steps pass through) · value formatter (`%`, `°`, px), also read to screen readers as the thumb's value text. The badge reserves the formatted min and max.

### Chip (a small reset action next to a control)
20h, r6, `badge` role, hit area 24. Disabled: bg `bg-control-subtle`, text `text-disabled-subtle`. Enabled: bg `bg-control`, text `text-secondary`, hover text `text`.

### SwatchGrid
6 columns, gap 8, swatches fill the column (41px at inspector width), aspect 1, r8, shadow-inset. Selected: `--bt-ring-select`, at once. Radio-group semantics, one tab stop: left and right move along the swatches (wrapping), up and down move a column (stopping at the edges), Home and End reach the ends, and the selection follows. Holds gradient or solid presets, or any `{ value, label, fill }`.

### ColorDot + swap
24px circle, shadow-inset, 6px gap between dots (30 center to center), hit area 28 through a hit part that reaches 2px past the dot. A button named "label, color" that opens buttery's `ColorPicker` in a popover (padding 12) beside it; Escape or a press outside closes it and focus goes back to the dot. `onValueCommit` reports each settled change, as the picker does. Keyboard focus rings the dot. Swap = `IconButton sm` with `arrow-left-right`.

### ColorPicker
216 wide, its parts stacked 12 apart (_derived_; the references only show the system picker):
- Area: saturation across and brightness up, 3:2, r10, edged by `shadow-inset`. Its thumb is an 18px circle filled with the color inside a 2px `knob-ring`, with `shadow-knob`; its center marks the color, so at the edges it rides past the area (`data-bt-allow-overlap`).
- Hue track: 14h, r7 (`r-thumb`), `shadow-inset`, under a 20px thumb ring filled with the hue that stays inside the track end to end, as a slider's does; a 28px hit area.
- Code row: a 24px swatch of the color, then the hex field, 34h (`h-control`), r12, 1px `control-border`, `#` in `text-tertiary` and the six digits uppercase and tabular.
- Optional presets under it in a 6-column `SwatchGrid`.

Dragging moves a thumb with the pointer in the same frame (MotionValues set directly); keys, codes and presets glide on `spring.smooth`. Arrows step 1% (1° of hue), Shift ×10, Page Up and Page Down ten steps, Home and End to the ends. Three visually hidden sliders carry it for screen readers ("Saturation", "Brightness", "Hue", read as "40%" and "210°"); the area's two share one Tab stop that follows the axis last moved. The code field edits a draft (`data-bt-draft`): Enter or leaving takes a valid 3- or 6-digit code, Escape puts it back. A color taken to gray keeps its hue. `onValueChange` reports every change, `onValueCommit` each settled one: a drag's end, a key, a code, a preset.

### TiltPad
Pad 32px circle: `bg-inset`, 1px `border-strong`. Knob 24px: radial `knob-center` → `knob-edge`, 1px `knob-border`, shadow-knob, moving up to 4px toward the tilt. When tilted, an accent arc (`accent`, 2px, a 50° slice of a ring) appears on the knob edge in the tilt direction, opacity ∝ magnitude; CSS works out its angle and strength from x and y (`atan2`, `hypot`). Value `{x, y}` in −1…1, kept inside the unit circle (Card Studio maps it to rotateY/rotateX ±20° at a perspective of 1.1 × the canvas width, the measured 1200px on an 1100px canvas). A drag moves 48px for a full tilt and moves the knob in the same frame as the pointer (MotionValues set directly); keys and resets glide on `spring.smooth`. Two visually hidden sliders carry it for screen readers ("Left and right", "Up and down", values like "30% right"; the up-and-down one counts up as it tilts up), one Tab stop between them that follows the axis last moved; arrows tilt, Shift ×5, Page Up and Page Down take ×5 steps on that axis, Backspace/Delete/Home level it, End does nothing. Paired with a reset chip.

### AnchorGrid
43×43 box, r10, 1px `border-strong`, `bg-inset`. 3×3 dots on an 11.5px pitch: idle 6px `dot`, active 10px radial knob (shadow-knob), which is a `SharedIndicator` and slides between dots on `spring.snappy` like any indicator. Radio semantics, one tab stop, 2D arrow keys that stop at the edges, Home/End for the corners; keyboard focus rings the box. The whole box is the hit target (a press picks the nearest dot; cells are 11.5px), marked `data-bt-target="group"`.

### Menu / Select
- Trigger: ghost pill; while open, bg `bg-control-active`. `Select`'s trigger shows the chosen value (or `valueLabel`, or a placeholder) and a 16px chevron, and is named "label, value".
- `Select variant="outline"`, for forms: a box like a text field's, 34h (`h-control`, 28 at `size="sm"`), r12, 1px `control-border`, `bg-surface`, padding-x 12, the value in `body` at its start and the chevron in `text-secondary` at its end, filling its column. `aria-invalid` turns the edge `danger`; disabled takes `bg-control-subtle` and a `border-strong` edge. Its list lines up with its start and is at least as wide as the box. In a `Field` it's named by the field's label followed by its value.
- Content: `bg-surface`, r16, padding 6, shadow-floating, min-width 200, side offset 8, align end.
- Item: 36h, r10, padding-x 12 (measured ~14), `menu` role; highlight `bg-item-hover`; selected shows a 16px check on the right. Keyboard focus also draws the accent ring inside the item, since the highlight alone is faint.
- Separator: 1px `border` with 6px above and below it, drawn as one 13px element so the list needs no margins.
- Group heading (`Menu.Group`, `Menu.RadioGroup` with `label`): 28h (`h-sm`), padding-x 12, `caption` role in `text-secondary`; it names the group.
- In a radio group the chosen item shows a 16px check at its end; the space is kept on every item so labels line up.
- Motion (MOTION_SPEC §3, "Menu open"): the content grows from 97% on the trigger's side on `spring.snappy` with a `dur-base` fade and leaves with a `dur-fast` fade, letting presses through while it fades. Popover content moves the same way. Focus goes back to the trigger once the close commits, whoever closed it (an owner setting `open` too), unless a press elsewhere closed it; a press on the open menu's trigger closes it once.
- Footer slot (e.g. a pair of number fields): after the separator, padding 6×4, labels above the inputs (`NumberField labelPosition="top"`, `control` role in `text-secondary`), inputs 34h r12 1px `control-border` (measured `border-strong`, raised to 3:1 like every text input), tabular, with a stepper, in two equal columns 8 apart. Tab loops between the list's focused option and the footer's controls. In a footer field holding an unsaved edit, the first Escape puts the field back and the second closes the list.
- Select keys: the arrow keys open it from the trigger. Typing jumps to the option the letters start; more letters keep the current option while it still matches, one letter typed again moves on to the next option with it, and Space types a space while a search is under way.

### NumberField
34h, 128w (`--bt-number-field-width`), r12, 1px `control-border` (measured `border-strong`; 3:1 like every text input), padding-x 12, tabular, stepper on hover/focus, optional scrub-to-change by dragging the label (one change per frame). The label names the input and is the scrub handle; the stepper sits outside it, so the input's name is the label alone. Typing edits a draft (marked `data-bt-draft` so a popover's Escape puts it back first): Enter or leaving commits, Escape puts back the value; `onValueCommit` fires once per change, at the end of a scrub rather than each frame; arrows step from what's typed, Shift = ×10. The stepper buttons stay out of the tab order, since the arrow keys do the same, and take no taps while hidden. A field narrower than 112px (a container query) drops the stepper, so the number keeps its room; `labelPosition="top"` puts the label above a field that fills its column.

### Form fields (Field, TextField, PasswordField, TextArea) (_derived_, Phase 4.5)
- Layout, top to bottom, 8 apart: the label (`label` role, `text`), the hint 6 under it (`caption`), the box, the error (`caption` in `danger` with a 16px alert icon, so it doesn't rest on color; the error's text keeps its 16px line instead of trimming it, so the icon centers on its first line). The hint and the error describe the control (`aria-describedby`, after any description of the caller's own); an error sets `aria-invalid` and turns the box's border `danger`.
- A new error's words are read out politely as it appears, with the field's name ("Email: Enter an email address"), through a live region that's always there, so an error shown on leaving a field is heard; the region empties after `announcement-life` (1s), so reading the page later finds the error once. The error itself renders once, links and all. `announceError={false}` leaves it to an error summary that takes focus.
- Box: `bg-surface`, 1px `control-border` (3:1, since the fill can match the surface around it), r12, the input filling it edge to edge with 12px of padding a side (16 at `lg`), so a press anywhere in it lands in the input; icons sit over that padding (12 from the edge, 16 at `lg`) and let presses through. A button at the end (a password's reveal toggle) keeps 4px from the edge (8 at `lg`), and the input runs up to it. Focus shows the accent ring on the box. `md` is 34 (`h-control`) with `body` text; `lg` is 48 (`h-cta`) with 16px text, for sign-in pages, so phones don't zoom in on focus. Disabled: `bg-control-subtle`, a `border-strong` edge, text `text-disabled`. A focused input keeps its label and hint clear of sticky bars (`scroll-margin` of `--bt-sticky-top` plus 48).
- PasswordField: a `sm` IconButton (eye) at the end of the box, a toggle named "Show password" with `aria-pressed`; it fills in a saved password unless `autoComplete="new-password"`; shown, the password is never corrected, capitalized or spell-checked, and it hides again when its form is submitted. Requirements list under it, 6 apart, each with a tick in `success` named "Met" or a circle named "Not met".
- TextArea: grows from `rows` (3) to `maxRows` (8) lines by measuring a hidden copy of its text, never animating its height and never collapsing itself to measure (which scrolled the page), then scrolls inside itself with faded edges. It fits again when its width changes and once fonts load.
- Field: the same label, hint and error for a control you bring, native or not, through a render prop that hands it `id`, `aria-labelledby`, `aria-describedby`, `aria-invalid` and `aria-required`.

### Checkbox and Switch (_derived_, Phase 4.5)
- Checkbox: an 18px box, r6 (`r-xs`), 1px `control-border` (3:1) on `bg-surface`; ticked or mixed it fills with `primary` and draws a 12px check or dash in `on-primary`. A 24px target around the box; the label (`label` role) 8 beside it takes presses too. An error turns an unticked box's edge `danger`. The hint and error sit under the label.
- Switch: a 32×20 track (`h-badge` tall, so 18 in compact), r-full, `bg-control` with a 1px inset `control-border` edge while off and `primary` while on; a thumb 4 smaller than the track, `bg-raised` with `shadow-raised` while off and `on-primary` while on, 2 from the end. The thumb moves by flex alignment and slides there on `spring.snappy` (Motion layout, off with reduced motion). A 24px target; the label 8 beside it. In forced colors it draws itself in system colors: a `CanvasText` edge and thumb while off, a `Highlight` track and `HighlightText` thumb while on, a `Canvas` track with a `GrayText` edge and thumb while disabled (on or off), and a `Highlight` focus ring.
- Both are Radix (`role="checkbox"` and `role="switch"`), named by their visible labels.

### Callout (_derived_, Phase 4.5)
A tinted box: r12, padding 12×16, gap 12, a 16px icon in the tone's color (`accent-text`, `success`, `warning` or `danger`), centered on the first line (its box is the line's 20px tall), over its `-subtle` tint. A title (`label` role), the body at `body-sm` size in `text-secondary` (not trimmed, so it can hold lists), and an optional action row 6 below. Plain links in its body take the tone's color and an underline, and links in its lists are 24px targets; buttery components inside (an `ArrowLink`) keep their own look. No role of its own: `role="alert"` for an error that appears after an action, `role="status"` for a result.

### SignInForm and SignUpForm (_derived_, Phase 4.5)
A column 20 apart, at most 400 wide (`w-dialog`): a `TextStack` heading (an `h1` unless told otherwise) with an optional line, the error summary, the fields 16 apart at size `lg`, a full-width 48 rounded primary submit, an "or" rule (two decorative dividers and a caption) over full-width soft buttons for other ways in (a generic icon and text, never a brand mark), and a footer line with an `ArrowLink` to the other form. Sign-in's keep-me-signed-in box and forgot-password link share a row that wraps.
- On a failed submit each field shows what to fix, and a danger `Callout` summary (`role="alert"`) with a link to each field appears above the fields and takes focus; a link focuses its field. The field errors clear as they're fixed; the summary holds still until the next submit, so a field never moves while it's being typed in. A message returned from `onSubmit` shows in the same summary, and so does `labels.submitFailed` when `onSubmit` throws or rejects. The submit button keeps its width while busy. The email field is `type="email"` with `autoComplete="username"`, so password managers pair it with the password.
- Sign-up lists the password's rules under it, ticked as they're met (8 characters and a number by default), and asks for the terms when there's a terms link.

### Tooltip
`inverse-bg` pill, `inverse-text` 12/500, padding 4×8, r8, 500ms open delay, no arrow. Content-sized (not height-checked). Opens at once on keyboard focus, closes on Escape, renders in the tooltip band above dialogs. The root `ButteryProvider` hosts one provider for all tooltips, so moving between them skips the delay.

### Dialog
`dialog` surface (r18, `shadow-dialog`) over a `dim` scrim in the modal layer, centered and kept 16px inside the window; `size` `sm` 400 (`--bt-w-dialog`, the default), `md` 560 (`--bt-w-dialog-md`) or `lg` 880 (`--bt-w-dialog-lg`). Its parts, stacked with their own padding: `Dialog.Media` 8px in at the top and sides, corners r10 (18 − 8); `Dialog.Text` (a `TextStack` at `size="dialog"`) padded 24, its title naming the dialog and its body describing it; `Dialog.Body` for fields or a list, 20 under the text and 24 at the sides; `Dialog.Actions`, equal columns 8 apart, 20 under what's above and padded 24 at the sides and bottom, holding 48px rounded buttons. The parts work inside a `<form>` that wraps them. Close: an `IconButton sm` centered 24px from the top and end edges, over the media when there is some (designed overlap, `data-bt-allow-overlap`); without media the text keeps 48px clear at its end. The body scrolls inside the dialog when it's taller than the window allows. Focus moves to the first control in the body, or to the dialog itself when there's none (so the close button's tooltip stays shut), stays inside, and goes back to what opened it; it's `aria-modal`, and a press on the scrim or the frame around it closes it. A dialog without a `Dialog.Text` title takes `label`, and warns with the fix when it has neither.

### Onboarding (a step dialog)
- Media: 384×200, r10, per-step gradient background, holding a small scene whose elements morph between steps.
- Title `dialog-title` (24px below media) · body `body` (16px below) · caption `caption` (20px below). Gaps are between trimmed text boxes (see §2).
- PageDots 20px below caption: dots 6px, gap 6, inactive `dot`, active = 18×6 pill `dot-active`. Dots are indicators, not buttons: one image named "Step 2 of 4" (`PageDots`, which moves its dots through Motion layout on `spring.snappy`).
- Buttons 16px below the dots: two equal columns (`Inline uniform`), gap 8, 48h, r12. The back button is soft with `arrow="back"` (disabled on the first step) and the forward button is primary with `arrow="forward"`; on the last step its label changes (e.g. "Continue" → "Finish") and the arrow goes, since finishing isn't moving on; the button keeps its width, as the two columns are equal. Bottom padding 24.
- Scenes: each step's media is a small scene built from buttery parts whose shared elements morph between steps. Card Studio designs its own scenes around its features.
- `Onboarding` takes `steps` (title, body, caption, media, background). A piece wrapped in `Onboarding.Shared` with the same `id` in two steps' scenes is the same piece, travelling (with that step's `rotate` and `scale`). The dialog is named and described by one hidden title and description that follow the step, so the crossfading text never names it twice; a polite live region says "Step 2 of 4" and the title as a step arrives. Left and right arrows step too. Back stays focusable while it can't go back (`aria-disabled`). The forward button holds both labels in one grid cell, so swapping "Next" for the finish label never changes its width, and the arrow goes on the last step. It opens with focus on the forward button, so Enter steps on. Finishing sends up confetti from the button, which keeps its look while they fly, and closes after `--bt-celebration` (at once with reduced motion). Every opening starts on the first step, whether the app controls `open` or not. A `storageKey` makes it open by itself the first time and remember once finished or closed; `hasSeenOnboarding(key)` tells an app that controls `open` whether to open it.

### Toast
`inverse-bg` pill, 36h (measured 38, snapped to `--bt-h-button`), padding-x 16, `body`-size text in `inverse-text`, action 14/500 in `inverse-text-secondary` (hover `inverse-text`), gap 20, shadow-floating. One line: a long message truncates at the lane's width (the viewport minus 24 a side). The action's target is 24 tall (2px block padding).
- Shown with `toast(message, options)` from `@buttery/react`; the `Toaster` that `ButteryProvider` mounts stacks them in the `bottom-center` floating lane, 8 apart, newest at the bottom.
- Tones (`tone`, or `toast.success()`, `toast.warning()`, `toast.danger()`): the pill takes `inverse-success-bg`, `inverse-warning-bg` or `inverse-danger-bg`, the inverse surface mixed toward the tone in OKLab (18%, 14% in dark), and leads with a 16px icon in `inverse-success`, `inverse-warning` or `inverse-danger` (a circled check, a warning triangle, a circled exclamation), 6 before the message, with the pill's start padding at 12. Each inverse tone is the other theme's tone, so it reads on the inverse surface. The action takes `inverse-text`, underlined on hover, since the secondary gray is too faint on a tint. A warning or danger toast stays 5s, as one with an action does. Screen readers hear the tone before the message ("Notification Error: Couldn't export the card"); `Toaster toneLabels` changes the words.
- **Three at most.** A fourth lets the one shown or updated longest ago go. A toast with the `id` of one showing updates it in its place, with its time started over and read out again, so repeating an action never stacks copies and nothing moves.
- Stays 3s (`--bt-toast-life`), or 5s with an action (`--bt-toast-life-action`); `duration: Infinity` keeps it until dismissed. The clock stops while the pointer or focus is on the toasts or the window is in the background.
- Closes on Escape while it has focus (with the region focused, Escape closes the newest), a swipe down past 50px, its action, or `toast.dismiss(id)`. Escape anywhere else is left to the page, so menus, dialogs and the app's own shortcuts keep it. F8 moves focus to the region ("Notifications (F8)"); Tab goes through the toasts newest first, each followed by its action. When the last toast leaves, focus goes back to where it was before F8 or the click.
- Screen readers hear "Notification" and the message, then the action's `altText` as its own sentence; `background: true` toasts are read at the next pause.

### FloatingToolbar (crop bar)
`bg-surface` pill, 48h (padding 6), gap 4, shadow-floating, in the `floating` layer band. Left to right: meta text (the current size, `control` role in `text-secondary`, tabular, truncating), a ghost reset, a soft cancel and a primary confirm (`FloatingToolbar.Button`, 36h). **Anchored**: positioned 12px below its anchor, centered, clamped 8px inside the viewport (above the anchor when there's no room below), following the anchor every frame while open (it may move by transforms), and registered with `FloatingLanes` as an obstacle, telling the lanes each time it moves, so lane items (toasts) move above it. `focusOnOpen` moves focus to its first button as it opens (crop mode's next step), and focus inside it goes back where it came from as it closes. It rises in on the `rise` preset (after `delay-follow`, 80ms, with `delayed`, as in crop mode) and fades out. A toolbar (Radix): one Tab stop, arrows between its buttons.

### HeaderBar
56h, r16, `bg-surface`, shadow-card, padding-x 16. Left: 24px app mark (the app's own icon; buttery's playground uses `BrandMark`) + title (`title-sm`, 12px gap, truncates). Right: ghost text actions, ghost icon actions, Select trigger, a 1px × 24 separator, undo/redo/help `IconButton`s; gap 4. Overflowing actions move into a "…" menu automatically (`OverflowCluster`): `HeaderBar.Actions` holds `HeaderBar.Action`s (one definition for the bar's button and the menu's item, by `priority`) and any `OverflowCluster.Item`. The actions take the room after the title, so they fold into the menu before the title truncates. A disabled `HeaderBar.Action` stays focusable (`aria-disabled`), so pressing the last Delete or Undo doesn't drop keyboard focus. With `dragRegion` the desktop window drags from the bar, and under the window controls it starts at `--bt-inset-titlebar` (84).

### NavBar + MorphMenu (_derived_ from buttery's tokens; behavior in MOTION_SPEC §4.1)
- Bar: 64h (`h-nav-bar`), aligned to the page container. Left: `BrandMark` (24) and the nav items, ghost pills 36h, padding-x 12, `control` role in `text-secondary` (hover `text`); triggers add a 16px chevron, gap 4; plain links have none. Right: a `secondary` pill and a `primary` call to action with `arrow="forward"`, gap 8. At rest over a colorful hero the bar has no background. The brand slot sets its text in `title`, `text-strong`, and a link in it keeps that color and a 28px target.
- Open trigger: label `text-strong`, chevron turned 180°.
- Panel: the `floating` surface (r16, shadow-floating) reaching up behind the bar row, so the nav items sit inside its top edge. Padding 24; columns laid out with `Grid`, gap 32. A column has a group heading (`control` role, `text-secondary`) and items 8 apart, each a title (`label`, `text`) over a one-line caption (`caption`, `text-secondary`), r10, hover background `bg-item-hover`. An optional featured column fills the panel's end edge to edge on the `section` level, padding 24, clipped by the panel's corners rather than given a radius of its own (so the concentric rule keeps its one exception). A footer row under a 1px `border` divider holds a "See all" `ArrowLink`. Max width: the container, never wider than the viewport minus 16px. Never taller than the room left below the bar either, 8px from the window's bottom edge (`--bt-nav-panel-min`, 200, at least): a taller menu scrolls inside the panel. With under 640px of room a menu stacks its columns, and its featured column under them.
- Below 640px of container width, or whenever the menus and actions don't fit beside the brand: a menu button (`IconButton md`) opens a full-height sheet, the `floating` surface 8px inside the window, in which each menu becomes an accordion section and the actions follow, over a dim scrim that holds the page still. Focus starts on the first section. Choosing any link in it closes the sheet first, so focus stays wherever the link moves it (a click that opens a new tab leaves it open); the bar widening past its fold closes it too, with focus moving to the row's first link.
- `behavior`: `static` (default) · `sticky` · `auto-hide`. Pinned, once the page has left its top, the bar takes the `panel` surface with `shadow-card`. While its panel is out it rises to `--bt-z-floating`, over sticky bars that follow it, such as a `SubNav`.
- A `MorphMenu` on its own (no bar) is its own stacking context and size container; a row too narrow for its triggers scrolls sideways, with room around them for the focus ring.

### SubNav (_derived_ from buttery's tokens)
- Bar: 48h (`h-sub-nav`), `bg-surface` with a 1px `border` line along its bottom, on the page container, gap 24. Title at the start in `label`, `text-strong`, truncating; an optional action at the end (`Button size="sm"`).
- Links: the bar's full height, padding-x 12, `control` role in `text-secondary` (hover `text`). The current section's link is `text-strong` with a 2px `primary` underline, r-full, inset 12 a side, over the bar's bottom line; it slides between links on `spring.snappy` (at once with reduced motion). "More sections" holds the links that don't fit.
- The current section is the last one whose top has reached the bottom of the sticky bars, or the last section once the page is scrolled to its end (`useScrollSpy`).

### Inspector
340w panel (padding 8, gap 8 between sections) with a sticky footer: 1px divider, padding 12, buttons 36h gap 8 (a soft button with an icon, padded 32 a side — measured 118 wide with a short label — and a primary SplitButton filling the rest). The body scrolls internally with 8px fade masks at its edges, inset 8 all round. `Inspector.Section` follows the nesting recipe (§4): a 36h header (title in `caption` role, `text-secondary`, padded 16 so it lines up with the rows; a Reset text action, 28h, named with the title, dimmed while nothing differs from the defaults), then a card of rows divided by 1px `border`. `Inspector.Row`: 50h, padding-x 16, label (and an `extra` such as a reset chip) at the start and the control at the end; without a label the control fills the row (a `Slider` brings its own); `block` grows to fit, padded 16 (a swatch grid). `Inspector.Row.Split`: two rows side by side, 64h, a 1px line between. Rows that change together (a fill type's rows) can sit in a `Morph` inside the card and keep their dividers while the height follows. The section heading is an `h2`, and each section is a region named by it.

### AppShell (_derived_ from the reference layout)
On `bg-app`, padding 8 and gap 8, at most `--bt-w-shell-max` (1380) wide and centered: the header and the stage in one column, the inspector (340) full height beside them. Under 840px of width the inspector moves into a modal sheet 8px in from the bottom and sides (at most the viewport minus 64 tall) that rises on the `rise` preset over a fading `dim` scrim, opened by a full-width 48h rounded primary button under the stage; Escape or the scrim closes it, and it closes when the window widens back past 840 (focus goes to the inspector beside the stage). `open`/`defaultOpen`/`onOpenChange` control it. Landmarks are left to the app.

### EmptyState / DropZone
Centered in the stage. Title `title`, description `body-sm` 12px below, actions 24px below (primary pill + secondary pill, gap 8); gaps are between trimmed text boxes (`EmptyState`, on `TextStack size="empty"`). The whole stage accepts drops (`DropZone`, filtered by `accept`); paste `⌘V` anywhere unless typing in a field, open `⌘O` (`useShortcut`), or a button wrapped in `DropZone.Open`. Drag-over (_derived_): bg tints to `bg-control-active`, 2px dashed `ring-selected` inset 16px, r16, label "Drop to add" (`label` role, `text-secondary`).

### Stage (canvas)
Content box fits the available space at the chosen aspect ratio (container query units, like `FitBox`: never overflows, always centered, 32px minimum margin), r12, shadow-card. It reshapes on `spring.smooth` through a Motion layout animation when its size changes; content that has to keep its own shape meanwhile (a card, text, an image) is a Motion element that spreads `useStageLayout`, so it scales evenly instead of stretching with the canvas. Artwork inside is `data-bt-allow-overlap` and clipped to the canvas. Crop mode: background and shadow fade out (`dur-base`), 8 handles (12px `bg-surface` circles, 1px `ring-selected` border, 24px hit areas) on a 1px frame arrive after `delay-follow` (80ms) over `dur-fast`, FloatingToolbar below. Dragging a handle resizes the canvas at a fixed scale, the opposite edge mirroring the held one, and the canvas fits again on release; `onSizeCommit` reports each drag's final size once, and a drag cut short by crop mode ending lets the canvas fit again. The canvas is an image named by `label`; exact sizes go through fields (a canvas Select's footer).

### Control
The root of a fixed-height control you build yourself (the `.bt-control` recipe as a primitive): one line, content centered 6 apart, `data-bt-control`. Sizes are the height tokens with padding to match: `badge` 20 (padding-x 6), `sm` 28 (12), `control` 34 (12, the default), `button` 36 (20), `cta` 48 (24); compact density shrinks them as it does every control. With `asChild` it makes a `Pressable` or a link the control. Composed with a `Surface` through `asChild`, the surface gives the look (background, edge, radius) and the control keeps its height and inline padding.

### Kbd
Keycap: 20h, min-width 20, r5, `bg-surface`, 1px `border-strong` plus a 1px bottom edge, `kbd` role.

### TextStack
A title over body text and an optional caption, the text block of dialogs, empty states and page sections, measured between trimmed text (§2). `size="dialog"` (the default): `dialog-title`, `body` 16 below, `caption` 20 below. `size="empty"`: `title`, `body-sm` 12 below, `caption` 12 below. `size="section"`: `heading-2`, `body-lg` 16 below, `caption` 16 below. `align="center"` centers it. The title is an `h2` unless `titleAs` names another level or `p`.

---

## 6. App kit (Phase 6B, _derived_)

Measured from local frames of a product dashboard (`reference/inspiration-dashboard/`, not in the repo), taken for structure, density and timing; the look is buttery's own. A dashboard built from these parts is white chrome around gray wells holding white cards (the nesting recipe, §4), quiet grays, dark primary pills and the accent only for focus, selection, links and charts.

### New tokens (Phase 6B)

| Token | Value | Used by |
|---|---|---|
| `--bt-w-sidebar` | 240 | Sidebar |
| `--bt-w-sidebar-rail` | 56 | Sidebar as an icon rail |
| `--bt-w-app-page` | 1280 | `AppPage width="contained"`: the content's max width, padding included |
| `--bt-w-aside` | 320 | `AppPage`'s right rail |
| `--bt-w-search` | 360 | The top bar's search field, at most |
| `--bt-h-table-row` | 36 comfortable · 32 compact (35 + a 1px divider) | Table header and body rows |
| `title-lg` | 24 / 30, 600, tight | Page titles, metric values |
| `title-md` | 18 / 24, 600, tight | Section headings in app pages, card titles in the right rail |
| `--bt-chart-1` … `--bt-chart-5` | `chart-1` is the accent; 2–5 derived in OKLCH from the mint, apricot, lilac and rose families at the accent's lightness, chroma 0.14 (or the most sRGB allows), each 3:1 on the surface in both themes (WCAG 1.4.11). Light: `#2862e0` `#008254` `#a65400` `#7b57b2` `#ae445b`; dark: `#4f89ff` `#1ea971` `#cf752d` `#9d7ad7` `#d6677c`, each at least 4.3:1 on the surface, section, app and floating backgrounds | Chart series, in order |
| `--bt-chart-muted` | The lightest gray still 3:1 on every chart background: light `#8b8b8b`, dark `#6e6e74` | A comparison series, such as the previous period |

Chart gridlines use `border`, axis labels `caption` in `text-tertiary`, and a comparison series (the previous period) `text-tertiary`, dashed.

### Shell: `AppShell layout="sidebar"`
- Sidebar (240) | content column. The whole shell is `bg-surface`; the sidebar has a 1px `border` hairline on its inline-end edge and scrolls on its own (`.bt-scroll-fade`).
- Sidebar, top to bottom, padding 12: the workspace switcher (the `AccountMenu` trigger: a 20px `InitialsTile`, the name in `title-sm`, truncating, and a 16px chevron; 36h, r10, hover `bg-item-hover`); the nav, 2 apart. A nav item is 28h (`h-sm`), r8, padding-x 8: a 16px icon in `text-secondary`, gap 6, the label in `menu` role, truncating. Hover `bg-item-hover`; the current page `bg-control` with `text-strong` and its icon in `text` (`aria-current="page"`). A section heading is 28h, padding-x 8, `caption` in `text-tertiary`, 12 above its first item. A collapsible group's header is an item with a 16px chevron at its end; its items sit under it without icons, their labels on the header label's left edge (padding-inline-start 30). A group holding the current page starts open; open groups are remembered (`storageKey`).
- An automatic "Recent" section lists the last four pages visited that aren't top-level items, newest first, each with a clock icon, remembered with `storageKey`. A "More" group at the end holds the rest.
- Top bar: 56h (`h-header`), padding-x as the page's side padding, no edge. A `SearchField` (`soft`, at most `--bt-w-search`) at its start; at its end, `IconButton`s 4 apart (one may carry a notification dot) and a round create button (`IconButton variant="primary"`, 28, r-full). The actions fold into "…" through `OverflowCluster`.
- Page width: `AppPage width="contained"` (content at most 1280 wide, centered in the content column) or `"full"`. Side padding 32 / 24 / 16 by the content column's width (the page grid, LAYOUT_RULES §4). `AppPage.Section` is a region: an optional `title-md` `h2` with actions at the end of its row, its content 16 under it, sections 32 apart. The page is the `main` landmark; its right rail is a `complementary` landmark named by `asideLabel`.

### Page header
- `PageHeader`: the title (`h1`, `title-lg`), then an optional inline value in `title-lg` at weight 400, `text-secondary`, tabular, 8 after it, and an info `IconButton sm` whose tooltip explains the value. Actions at the end: `IconButton`s and buttons 8 apart, folding into "…"; the primary one can show its shortcut (`Button shortcut="n"`: a `Kbd` 8 after the label, drawn in the button's own color at 30% for its edge, so it reads on a dark pill).
- `Tabs` (underline): items 36h, padding-x 4, 16 apart, `label` role in `text-secondary`, `text-strong` when chosen, over a 1px `border` line that spans the row. The chosen tab's 2px `primary` underline is one `SharedIndicator` that slides on `spring.snappy`. Tabs that don't fit fold into "…". Content tabs are Radix Tabs; route tabs are links with `aria-current`.
- `QuickActions`: a row of `soft` `sm` buttons with icons, 8 apart, folding into "…".
- `ViewToggle`: a `SegmentedControl` of icons (grid, list), each named by a tooltip.
- 16 between the header, tabs and quick actions; 24 from the header block to the page's first section.

### Data
- `DataTable`: ARIA table roles (`table`, `row`, `columnheader`, `cell`) on CSS grid rows that share one column template, so columns get exact minimum widths and shares. Header and body rows `--bt-h-table-row`, 1px `border` dividers, cells padding-x 12. Header text `control` role in `text`; body text `body-sm` in `text`, secondary text `text-secondary`. Numbers are right-aligned and tabular, with their currency code after them in `text-tertiary` (`DataTable.Amount`). IDs are `--bt-font-mono` and truncate with their full text in a tooltip (`DataTable.Id`). A column's `minWidth` is a component step (`xs` 64, `sm` 96, `md` 144, `lg` 192, `xl` 256) and `grow` its share of the table's width against the other columns, never below its minimum (CSS grid's `minmax(min, grow·fr)`).
  - Selection: a checkbox column with a header box that selects the page (mixed while some are); selected rows take `accent-subtle`.
  - Sortable headers: the header is a button with a 14px sort arrow (`text-tertiary`, shown on hover while unsorted, `text` while sorted); `aria-sort` on the header; presses go ascending, descending, off.
  - Row hover `bg-item-hover`, at once. Row actions: an `IconButton sm` ("…") in the last column opening a `Menu`, named "Actions for <row>".
  - Sticky header and sticky first column (with the checkbox column), `bg-surface`; while scrolled sideways the first column shows a 1px `border` edge.
  - Loading: skeleton rows shaped to each column (a checkbox square, text lines of the column's typical width, a badge pill), as many as the page holds.
  - Pagination under it: "1–14 of 14" in `body-sm` `text-secondary`, tabular, at its start; Previous and Next (`soft sm`, with the back and forward arrows, disabled at the ends) at its end.
  - No results: one row across every column, padded 16: "No results" (`label`), a line in `body-sm`, and a `soft sm` "Clear all" at its end. No data at all: an `EmptyState` with an icon tile in the table's place.
  - `size="compact"` drops selection and pagination for short lists, such as recent activity in an overview.
- `StatusBadge`: 20h (`h-badge`), r6, padding-x 6, `badge` role; tones `neutral` (`bg-control`, `text-secondary`), `success`, `warning`, `danger` (their `-subtle` backgrounds and text), `info` (`accent-subtle`, `accent-text`). An optional 12px icon. The label carries the meaning; the color only repeats it.
- `SavedViews`: a `bg-control` track (34h, r-full, padding 2) of intrinsic-width items (30h, padding-x 12, `control` role); the chosen view is a raised pill (`bg-raised`, `shadow-selected`) that slides as one `SharedIndicator` on `spring.snappy`. Views that don't fit fold into a "…" menu at the track's end, which lists every view as a radio item (a check on the chosen one), then actions on the chosen view (rename, duplicate, delete) and "Save as a new view".
- `SearchField`: a `TextField` with a 16px search icon at its start and, once it holds text, a clear `IconButton sm` at its end (Escape clears it too); while empty it can show a shortcut `Kbd` ("/" focuses it). `variant="soft"` (`bg-control`, no edge: the top bar) or `"outline"` (`control-border`: a table's toolbar).
- `FilterBar`: filter pills 8 apart that wrap, a "Clear filters" ghost text button once any is applied, and actions (Export, Analyze) on the first line's end. A `FilterPill` is 28h (`h-sm`), r-full, padding-x 12 (10 measured; 12 is the nearest step): unapplied, a 1px dashed `border-strong` edge, a 16px plus icon and the field name in `text-secondary`; applied, a solid 1px `border` edge on `bg-surface`, a remove button (x icon, 24 target) and "Name | value" with the value in `text`, named "Name: value". The edge is an outline drawn inside the pill, so its buttons keep the full 28. Pressing a pill opens a `Popover` with its editor. Under 640px of container width the pills fold into one "Filters · 2" button that opens them in a popover.
- `ColumnSettings`: an `IconButton` ("Columns") opening a `Popover` 240 wide: a checkbox per column (the first one fixed on), each with a grip; drag by the grip or Alt+Up/Down to reorder (Motion's `Reorder`); "Reset" restores the defaults.
- `StatTabs`: equal columns in a `bg-control` track (48h, r16, padding 4); each tab shows its label (`control`, `text-secondary`) and a count (`title-sm`, `text`, tabular) on one line; the chosen tab is a raised panel (r12, `shadow-selected`) that slides as one `SharedIndicator`. Under 640px of container width it becomes a `Select`.
- `GroupedList`: one well (`bg-section`, r16, padding 4, its rows 4 apart) holding groups of card rows. A group's title is `control` in `text`, on a 28h row 8 below what's above it, lined up with the rows' media, with an optional "…" menu (`IconButton sm`) at its end; a group can have no title. Rows are `bg-surface` cards with `shadow-card` (r12, 48h at least, padding 8 16, gap 12: media, then the title in `label` over a line in `body-sm`, then a value in `label`, tabular, at the end); a row that's a link or a button takes `shadow-raised` on hover. A dashed add row ends the list or a group (1px dashed `ring-selected`, r12, 48h, a plus icon and a label in `text-secondary`, centered, hover `bg-control`).

### Overview
- `MetricCard`: a `card` surface (r12, padding 16). Its header: the title (`label`, `text-secondary`) with an info tooltip, and an optional expand link (↗, `IconButton sm`) at the end when the card links to its details. Then the value (`title-lg`, tabular) with a delta `StatusBadge` (an arrow icon and the change, `success` or `danger`) and "vs previous period" in `caption`. Then a `LineChart` (`sm`) of the period against the previous one; then a footer: "Updated 4 min ago" in `caption` and a `Details` `ArrowLink`. Its skeleton has the same parts in the same places.
- `DateRangeBar`: a range `Select` (presets: today, the last 7 days, 4 weeks, 3 months, 12 months, month to date, year to date; a custom range through two date fields in its footer), an interval `Select` (daily, weekly, monthly), "compared to" in `caption`, and a comparison `Select` (previous period, previous year, none). Selects in their outline look at `size="sm"` (28h), 8 apart.
- Charts (`LineChart`, `AreaChart`, `BarChart`, `Sparkline`): SVG drawn in-house, filling their container's width at a height of `sm` 160, `md` 220 or `lg` 300 (component variables). Lines 2px, round joins; an area is the series color at 12%; bars r4 at the top, 4 apart. Horizontal gridlines at nice values, y labels at the end edge, x labels at the start and end (more at `lg`).
  - Hover: a 1px `border-strong` crosshair at the nearest point, an 8px point with a 2px `bg-surface` ring per series, and a tooltip (`floating` surface, r12, padding 8×12, `shadow-floating`): the date in `caption`, then a row per series (an 8px swatch, the name in `body-sm`, the value in `label`, tabular) and a delta badge. It sits beside the crosshair and flips to its other side near the chart's edge, never leaving the chart's box. Bars highlight their column with `bg-item-hover` instead of a crosshair.
  - Keyboard: the chart is one Tab stop; Left and Right move the crosshair point by point and show the tooltip; Home and End jump to the ends.
  - Screen readers: `role="img"` named by its title and a one-line summary, with the data in a visually hidden table.
  - No data: a dashed baseline and "No data for this period" in `caption`, centered. Loading: a `LoadingPill` centered over the chart's box.
  - `Sparkline`: 24h, no axes, the last point marked.

### Guidance
- `Banner`: one line, r12, `bg-section`, padding 8×16, gap 12: a 16px icon in `text-secondary`, the message in `body-sm` `text`, an action link in `accent-text`, an optional time estimate (a 14px clock and "1 min" in `caption`) and a dismiss `IconButton sm`. Under 640px of container width the message wraps and the action moves under it. Dismissed for good with `storageKey`.
- `RecommendationCard`: a `card` surface, padding 16, gap 8: a "Tip" `StatusBadge` (`info`, a lightbulb) and a dismiss `IconButton sm` on the first line; the title in `title-md`; the body in `body-sm` `text-secondary`; a footer with an `ArrowLink` and a time estimate at the end; optional media at the bottom, edge to edge.
- `SetupGuide`: a floating checklist in the `bottom-end` lane, 288 wide (a component variable), a `floating` surface (r16, padding 12, `shadow-floating`). Folded: the title (`title-sm`), an expand `IconButton sm` and a dismiss one; a 4px progress bar (`bg-control` track, `accent` fill, r-full); "Next:" in `caption` with the next task as a link. Unfolded (Morph height): the tasks, each a check circle (`success` once done), its title (`label`) and an optional line, with the next task's action as a `soft sm` button. Folded or unfolded, done tasks and dismissal are remembered with `storageKey`.
- `FeatureIntro`: copy at the start (a `title-lg` heading, a `body` line, two or three benefits with 16px icons, a primary button and a docs `ArrowLink`) and media at the end, in two columns from 720px of container width and stacked under it; an optional dismiss remembered with `storageKey`. The `buttery add page feature-intro` template is built from it.
- `EmptyState` gains `icon`, a 48px tile (r12, `bg-section`, 1px `border`) holding a 20px icon in `text-secondary`, 16 above the title, and `docs`, an `ArrowLink` 16 under the text.
- `LoadingPill`: 28h, r-full, `bg-control`, padding-x 12: a 14px spinner and its label in `control` role, `text-secondary`, `role="status"`. It shows after `--bt-delay-loading` (300ms), so quick loads never flash it.
- `NotificationNudge`: `IconButton`'s `dot` draws an 8px `accent` dot with a 2px `bg-surface` ring at the icon's top end and adds ", new" to its name. The nudge is a `Popover` anchored to that button (padding 16, at most 280 wide): the title in `title-sm`, a line in `body-sm`, a `primary sm` action and a ghost "Later". It opens by itself once per `storageKey`, without taking focus, and is announced as a status; Tab from its button goes into it.

### Menus and dialogs
- `AccountMenu`: the workspace switcher's menu, 280 wide (a component variable). A header (a 32px `InitialsTile` over the workspace name in `title-sm` and an optional caption, centered, padding 12), items with 16px icons (settings, a "Switch workspace" submenu listing workspaces with 20px tiles and a check on the current one, then "New workspace" and "Manage workspaces"; a "Create" submenu), a separator, the user's row (a 20px `Avatar`, the name, an action icon at its end), and "Sign out". Submenus fly out to the side and keep open while the pointer heads for them (pointer grace, Radix).
- `Avatar` and `InitialsTile`: sizes `xs` 20, `sm` 24, `md` 32, `lg` 40. An `InitialsTile` is a square, r6 (r8 from `md`), `bg-control`, with up to two initials in `badge` role, `text-secondary`. An `Avatar` is round and shows its picture, or the initials when there's none or it fails to load.
- `ChoiceDialog`: a `Dialog` at `--bt-w-dialog-md`: the title and a line, then choice rows 8 apart. A row is a button or link, r12, a 1px `border` edge, padding 16: a 36px icon tile (r10, `bg-control`), the title (`label`) over a line (`body-sm`, `text-secondary`), and a 20px forward arrow at the end that draws its stem on hover (MOTION_SPEC §4.5). Hover `bg-item-hover`.
- `AnnouncementDialog`: a `Dialog` at `--bt-w-dialog-lg`, padding 32: copy at the start (a `title-lg` heading, sections of a `title-sm` subheading over `body` text) and media at the end (r12, the app's own illustration), in two columns from 720px of container width and stacked, media first, under it. A primary button and an `ArrowLink` with an external icon at the bottom of the copy. Shown once per `storageKey`.
- `SettingsIndex`: sections 32 apart, each a `title-md` heading over a grid of links: three columns from 1024px of container width, two from 640, one under it, 8 apart down and 16 across. A link is a block, r12, padding 12, hover `bg-item-hover`: a 32px icon tile (r8, `bg-section`, 1px `border`), the title (`label`, `text`), and a line (`body-sm`, `text-secondary`) that wraps.
