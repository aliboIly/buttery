# buttery — Layout Rules

**The promise:** anything built with buttery never overlaps, is always sized from the system, stays uniform, and lays out well at every size — without the builder having to think about it.

That promise is kept three ways, and all three are required:

1. **Primitives make the right layout the easy layout** (you can't easily express a bad one).
2. **Static lint** blocks the usual causes (raw values, negative margins, ad-hoc z-index, stray absolute positioning).
3. **Automated layout checks** (`@buttery/test` + the dev-time `LayoutGuard`) catch anything that slips through, at every viewport, in both themes.

Page layout follows a strict grid with a consistent section rhythm: split heroes, bento grids, sticky asides. App layout follows the inspector-style editor in the local app captures.

---

## 1. The 13 non-negotiables

1. **Flow layout only.** Siblings are positioned by `Stack` / `Inline` / `Grid` with `gap` from the spacing scale. Components never set their own outer margin. Negative margins are banned.
2. **Out-of-flow is owned.** In app code and patterns, `position: absolute|fixed|sticky` is off-limits. It lives only in (a) layer primitives in `packages/core/src/layers/` (`Layer`/`Portal`, `Popover`, `Scrim`, `Sticky`, `FloatingLanes`), which render into portals and use z-index tokens; and (b) a component's own internal parts (a slider thumb, a segmented indicator, `FitBox` content), which stamp `data-bt-part`. The overlay components in `@buttery/react` (`Menu`, `Select`, `Tooltip`, `Dialog`, `Toast`, `FloatingToolbar`) are built on those primitives and never set `position` themselves.
3. **Floating lanes.** Free-floating UI (toasts, notices) lives in a `FloatingLanes` lane (`bottom-center`, `bottom-end`, `top-end`): items stack with an 8px gap and respect safe insets (sticky header/footer, macOS titlebar). Anchored floating UI (a crop toolbar under its crop box) is positioned by its anchor but registers its rect as an obstacle, so lane items move clear of it. A toolbar and a toast can never cover each other.
4. **Collision-aware overlays.** Popovers/menus: `avoidCollisions`, `collisionPadding={8}`, side offset 8, never cover their trigger, `max-height` = available space with internal scroll.
5. **No component chooses its own height.** Heights come from tokens (`--bt-h-*`). Widths are intrinsic, fluid (`minmax(0,1fr)`), or a named token (`--bt-w-*`).
6. **`min-width: 0` by default.** Every flex/grid child inside buttery primitives gets it, so long content shrinks instead of pushing siblings off-screen.
7. **Text never overflows.** Single-line control text truncates with an ellipsis *and* exposes the full text (tooltip/`title`). Content text wraps, with a max measure (body ≤ 60ch, display headings ≤ 22ch). Numbers that change use tabular figures and a reserved min-width so nothing jitters.
8. **Media keeps its shape.** Aspect-ratio boxes and explicit `object-fit`. Stage content uses `FitBox` (largest rect that fits the available space at a given aspect, always centered).
9. **Container queries, not viewport queries.** Components respond to the space they're given, so the same component works in a 340px inspector and a 1200px page.
10. **Priority overflow instead of wrapping.** Toolbars, header bars and nav bars use `OverflowCluster`: when items don't fit, the lowest-priority ones move into a "More" (`…`) menu. They never wrap to two lines, never overlap, never shrink text.
11. **Scroll is contained.** The shell never scrolls horizontally. Panels scroll internally (`overscroll-behavior: contain`, `scrollbar-gutter: stable`, 12px fade masks at scrolled edges).
12. **Sticky things reserve space.** Sticky headers publish their height as `--bt-sticky-top`; anchors use `scroll-margin-top: var(--bt-sticky-top)`.
13. **Zero layout shift on interaction.** Loading states, skeletons and label swaps (e.g. "Continue" → "Finish") keep exact dimensions. Fonts are bundled and preloaded with a metric-matched fallback.

---

## 2. Uniformity rules

- **One left edge.** Everything inside a container aligns to its padding edge. Section titles, row labels, card titles — same x.
- **Equal siblings are equal.** Groups of peers share size: `Grid` with equal columns; `Inline uniform` for equal-width buttons (a dialog's back and forward buttons).
- **Concentric corners.** Nested surface radius = parent radius − parent padding (`Surface radius="auto"`). The one deliberate exception is Panel → Section (sections are sized inside-out: card 12 + well 4 = 16) — see DESIGN_SPEC §4.
- **Hit areas.** Every interactive element has a hit area of at least 24×24 (WCAG 2.5.8); standalone buttons are at least 28 tall. Small visuals (thumb, color dot, chip, crop handle) get an invisible `[data-bt-hit]` element that extends their hit area without changing layout.
- **One gap per relationship.** Use the relationship tokens, not ad-hoc numbers:

| Relationship | Gap |
|---|---|
| Icon ↔ label inside a control | 6 |
| Label ↔ value badge | 8 |
| Controls in a toolbar / header cluster | 4 |
| Buttons in a button group | 8 |
| Sections inside a panel | 8 |
| Cards in a grid / bento | 16 |
| Heading ↔ body | 8 (app) · 16 (page) |
| Body ↔ actions | 20 (app) · 24–32 (page) |
| Section intro ↔ section content | 48 (md) · 64 (lg) |
| Page sections (padding-block) | 64 (sm) · 96 (md) · 128 (lg) |

- **Baselines line up.** Rows use a two-column grid (`[label+badge] [control]`) with center alignment; bento card titles in the same row share a baseline.
- **Icons are 16px** in controls (stroke 1.75), 20px in empty states, never mixed within one cluster.

---

## 3. App layouts (from the inspector app)

### AppShell
Max width `--bt-w-shell-max` (1380), centered; below that it fills the window.
```
┌───────────────────────────────────────────── 16px page padding ─┐
│ HeaderBar (56h, r16)                       │ Inspector (340w)    │
│────────────────────────────────────────────│  Panel r16, pad 8   │
│                                            │  Section…           │
│          Stage (fills, FitBox content)     │  Section…           │
│                                            │  ── sticky footer ──│
└────────────────────────────────────────────┴─────────────────────┘
grid-template-columns: minmax(0,1fr) var(--bt-w-inspector); gap: 8px;
height: 100dvh; overflow: hidden;
```
- The inspector is full-height (it runs alongside the header). Its body scrolls; its footer is sticky.
- `< 900px` container width: the inspector becomes a bottom sheet toggled from the header; stage takes full width. (A desktop window never gets this narrow; its minimum width is 960.)
- Desktop (Tauri): `HeaderBar dragRegion` adds `data-tauri-drag-region="deep"` (the whole header drags the window, buttons stay clickable) and reserves `--bt-inset-titlebar` on the left for macOS traffic lights when the window uses an overlay title bar. Minimum window 960×640.

### Inspector rows
- Row: 50h, `grid-template-columns: minmax(0,1fr) auto`, padding-x 16, 1px divider between rows.
- Left cell: label (truncates) + optional value badge (reserved min-width).
- Right cell: control at its token width (slider 164, segmented intrinsic, swatch grid spans both columns).
- `Row.Split`: two half-rows side by side with a 1px vertical divider (two compact controls in one row).

### Stage
- Centers content with `FitBox` at the chosen aspect ratio with a 32px minimum margin from stage edges.
- Empty state, crop mode and drop overlay all occupy the same box — swapping between them never moves surrounding UI.

---

## 4. Page layouts

### Grid
| Container width | Columns | Gutter | Side padding |
|---|---|---|---|
| < 640 | 4 | 16 | 16 |
| 640–1023 | 8 | 24 | 24 |
| ≥ 1024 | 12 | 24 | 32 |

- Content max-width: `--bt-w-page: 1200px`, centered. Everything snaps to columns. Visuals may bleed past the container to the viewport edge (`bleed="right"`), text never does.
- Dev overlay: `⌥⇧G` toggles a column overlay (dev only — not a visual feature).

### Patterns
- **NavBar**: sticky, 64h, container-aligned. Links use `MorphMenu` (one morphing panel, see MOTION_SPEC §4.1). Collapses to a sheet below 640.
- **SubNav**: sticky under NavBar, 48h, scroll-spy highlight.
- **SplitHero**: text 6–7 cols / visual 5–6 cols, vertically centered; headline is two-tone (strong + secondary continuation) ≤ 22ch; actions 24 below body.
- **CenteredHero**: centered text (≤ 8 cols) above a full-width visual stage.
- **Bento**: 12-col grid, cards span 4/6/8/12 cols and 1–2 row units (`--bt-bento-row: 320px`), gap 16. Card anatomy: title top-left, affordance top-right, visual anchored to the bottom and allowed to bleed to the card edges. Cards can expand to a modal (`ExpandableCard`).
- **StatStrip**: 2 or 4 equal columns; each stat has a 1px left hairline, number (display, tabular) and label.
- **LogoStrip**: N equal cells, logos optically normalized into a 120×24 box, monochrome.
- **ArticleLayout**: main 8 cols + aside 3 cols (1 col gap). Aside is sticky (`top: calc(var(--bt-sticky-top) + 24px)`) and stops at the end of the article — never overlaps the footer.
- **Footer**: multi-column link grid on the same 12-col grid.

### Display type (pages only)
| Role | lg | md | sm |
|---|---|---|---|
| `display` | 48/52 | 40/44 | 32/38 |
| `heading-1` | 32/38 | 28/34 | 24/30 |
| `heading-2` | 24/30 | 22/28 | 20/26 |
| `body-lg` | 18/28 | 17/26 | 16/24 |

Weight 600 for display/headings, letter-spacing −0.02em at ≥ 32px. Two-tone headlines: first clause `--bt-text-strong`, continuation `--bt-text-secondary`.

---

## 5. Automated checks

### `@buttery/test` — `expectButtery(page, options)`
Runs in Playwright against every playground route and every app built on buttery.

| Check | Fails when |
|---|---|
| **Overlap** | Two visible boxes (`[data-bt]` elements and text runs) **in the same layer** (page, or the same portal) intersect by > 1px — unless one contains the other, one is a `data-bt-part` of the other's component (thumb over track, indicator under items), or either is inside `[data-bt-allow-overlap]` (stage artwork, a dialog's close button over its media). Each open layer is checked on its own. |
| **Overflow** | An element with `overflow: visible` has `scrollWidth > clientWidth + 1` or `scrollHeight > clientHeight + 1`; or the document scrolls horizontally. Elements with `data-bt-truncate` or a declared clip (`data-bt-clip`: bleed visuals, stage, rounded media) are exempt. |
| **Clipping** | Text is ellipsized without `data-bt-truncate` and an accessible full text (tooltip or `title`). |
| **Scale** | A computed gap or padding on a `[data-bt]` element isn't on the spacing scale, or a control root (`[data-bt-control]`) has a height that isn't a `--bt-h-*` token. Allow-list: 1px hairlines. Content-sized elements (text blocks, cards, tooltips) aren't height-checked. |
| **Target size** | An interactive element's hit area (the element, or its `[data-bt-hit]` child) is smaller than 24×24, or a standalone button is shorter than 28. Inline text links inside a sentence and `data-bt-target="group"` members are exempt. |
| **Viewport fit** | A floating layer extends past the viewport minus 8px. |
| **Layering** | A z-index that isn't a `--bt-z-*` token. |
| **Accessibility** | axe-core serious/critical violations, or text contrast below AA. |
| **Stability** | During a scripted interaction, a `[data-bt]` element that isn't the interaction target (or animating as its direct result) moves by > 1px — measured by sampling element rects before/after, not by the browser's CLS metric (which ignores shifts right after input). Once buttery reports settled (below), anything still moving must be a declared `Loop`. |

How checks run: static checks emulate reduced motion and wait for buttery's settled flag before measuring. buttery counts its own running animations (every motion primitive registers when an animation starts and when it finishes; `Loop`s don't count) and sets `data-bt-settled` on `<html>` while the count is zero. `document.getAnimations()` can't stand in for this: Motion runs springs and `layout` animations on requestAnimationFrame, and those never appear there. Motion itself is verified separately by the Phase 3 sampling tests. The report is human-readable **and** JSON (`--reporter=json`), with selector, rule, measured value and a suggested fix — so coding agents can self-correct.

Default matrix: viewports `390×844, 768×1024, 960×640, 1280×800, 1440×900, 1728×1117` × themes `light, dark` × densities `comfortable, compact`, in **Chromium and WebKit** (Tauri on macOS renders with WKWebView, so WebKit is the closest stand-in for the desktop app). Failures print the offending selectors and save an annotated screenshot. `pnpm check` runs the pages you changed at `390×844` and `1280×800`, light and dark, comfortable, in both engines; the full matrix runs with `pnpm test:layout` and at every phase stop. Playwright's WebKit is its own build rather than the system WebKit, so each phase stop also includes a short pass in the real desktop app.

### `LayoutGuard` (dev only)
Mounted by `ButteryProvider` in development. Re-checks overlap, overflow and off-scale values on resize/mutation (debounced), outlines offenders in red with a label, and logs a grouped console report. `⌥⇧L` toggles it. Zero cost in production builds (tree-shaken).

### `@buttery/lint`
- **stylelint**:
  - No raw colors outside token files.
  - z-index only `var(--bt-z-*)`.
  - No negative margins.
  - `position: absolute|fixed|sticky` only in `packages/core/src/layers/**` and component files (for `data-bt-part` internals) — never in apps or patterns.
  - No `!important`, no `transition: all`.
  - Raw lengths are allowed only in: token files; component-scoped variable declarations (`--bt-<component>-*: 24px`) at the top of a component's CSS; `@container`/`@media` conditions (CSS can't use `var()` there); `letter-spacing` (em); border/outline widths ≤ 2px. Everywhere else lengths must be `var(--bt-*)`, `0`, `%`, `fr`, `ch`, `dvh`/`dvw`.
- **ESLint**: no inline `style` with margin/zIndex/position/width/height literals in app code; components must forward refs and spread `...rest` props.
