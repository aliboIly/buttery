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
11. **Scroll is contained.** The shell never scrolls horizontally. Panels scroll internally (`overscroll-behavior: contain`, `scrollbar-gutter: stable`, 12px fade masks at the edges with `.bt-scroll-fade`), and a contained panel fits inside the viewport: if its end sits below the fold, containment keeps the page from scrolling to it. `<Sticky variant="aside">` fits a sidebar between the sticky bars and scrolls it inside without containment, because what follows an aside can push it up past the bars near the end of the page, and only a scroll that reaches the page brings it back.
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
- `Row.Split`: two half-rows side by side with a 1px vertical divider (two compact controls in one row), `--bt-h-row-split` (64) tall so a tilt pad or anchor grid has room.

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
- **NavBar**: 64h, aligned to the page container. Brand mark on the left, the nav items next to it (triggers carry a chevron, plain links don't), and a right cluster with a secondary pill and a primary call to action with a forward arrow. The nav items go through `OverflowCluster`; below 640px of container width everything collapses into a menu button that opens a full-height sheet with accordion sections. `behavior` is `static` (the default: it scrolls away with the page), `sticky` or `auto-hide`; while it can stay on screen it publishes its height as `--bt-sticky-top`. Its menus share one `MorphMenu` panel (MOTION_SPEC §4.1) laid out with `Grid`, never wider than the container or than the viewport minus 16px, and never over the bar's own items.
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
| **Overlap** | Two visible boxes **in the same layer** (page, or the same portal) intersect by > 1px. Boxes are `[data-bt]` elements and parts, and text measured one line at a time: glyph extents across, the line box down, and no taller than the box of text trimmed with `text-box` plus the last line's real descenders, measured in its font, so trimming can't hide a descender under the next box. Exempt: one contains the other, one sits in a `data-bt-part` of a component that contains the other (thumb over track, indicator under items), or either is inside `[data-bt-allow-overlap]` (stage artwork, a dialog's close button over its media). Each open layer is checked on its own; across layers, a floating-lane item may not cover a control in the page's header, navigation or a sticky bar. |
| **Overflow** | An element with `overflow: visible` has content past its padding box by more than 1px, or the document scrolls horizontally. Scroll sizes only pre-filter; the excess is measured from descendant boxes and text line boxes. Text trimmed with `text-box` (and inline content inside it) counts only across: its glyphs overhang the trimmed box by design. `[data-bt-hit]` areas don't count. Elements with `data-bt-truncate` or a declared clip (`data-bt-clip`: bleed visuals, stage, rounded media) and everything inside them are exempt. |
| **Clipping** | Text is ellipsized without `data-bt-truncate` and its full text in a `title` or tooltip, on the text or the control around it (an `aria-label` alone doesn't show it). Or text is cut off by an `overflow: hidden` or `clip` ancestor with no ellipsis. Scroll containers, declared clips (`data-bt-clip`) and visually hidden text are exempt. |
| **Scale** | A computed gap or padding on a `[data-bt]` element isn't on the spacing scale, or a control root (`[data-bt-control]`) has a height that isn't a `--bt-h-*` token. Allow-list: 1px hairlines. Content-sized elements (text blocks, cards, tooltips) aren't height-checked. |
| **Target size** | An interactive element's hit area (the element, its `[data-bt-hit]` child, and for inputs their labels) is smaller than 24×24, or a standalone button is shorter than 28. A standalone button is a button without a `[data-bt-hit]` area; small inline actions like chips extend their target with one instead. Disabled elements, inline text links inside a sentence and `data-bt-target="group"` members are exempt, and so are containers focusable only so keyboards can reach them: dialogs, tab panels, regions, groups, logs and feeds, and scroll areas whose only interactivity is `tabindex`. |
| **Reach** | Nothing that stays put hides its end. A sticky or fixed box must fit the viewport where it stays (a sticky box at its `top` or `bottom` offset), and a scroll area with `overscroll-behavior` other than `auto` that's sticky or fixed, or inside something that is, must sit entirely in the viewport, since scrolling inside it can't move the page. And no scroll area may start its content before the point it can scroll back to (content centered or end-aligned in an area it overflows); children without a box are skipped, `display: contents` wrappers count through their children, and reversed flows, which scroll from their far end, aren't checked on that axis. |
| **Viewport fit** | The outermost painted surface (a background, border, shadow or backdrop filter) of anything in a layer comes within 8px of the viewport edge. Full-viewport wrappers and scrims aren't surfaces. |
| **Layering** | A z-index that isn't a `--bt-z-*` token. |
| **Accessibility** | axe-core serious/critical violations, or text contrast below AA. |
| **Stability** | During a scripted interaction, a `[data-bt]` element that isn't the interaction target (or animating as its direct result) moves by > 1px — measured by sampling element rects before/after, not by the browser's CLS metric (which ignores shifts right after input). Movement is measured from the scroll container the element moved least relative to, so scrolling and stuck sticky bars don't count. Once buttery reports settled (below), anything still moving must be a declared `Loop`. |

How checks run: static checks emulate reduced motion, set the theme with an emulated color scheme and the density with `data-bt-density` on `<html>`, wait two frames for style changes to start their transitions, then wait for buttery's settled flag and for every finite CSS animation to finish before measuring. If the page has changed `data-bt-density` back by then, the run stops with an error rather than checking the wrong density. Scripted interactions run once, in order, at the first viewport, theme and density: each state they leave (an open menu, a toast) gets every check, then the stability comparison. Dev tooling (the `dev` layer, where `LayoutGuard` draws) is never checked. buttery counts its own running animations (every motion primitive registers when an animation starts and when it finishes; `Loop`s don't count) and sets `data-bt-settled` on `<html>` while the count is zero. `document.getAnimations()` can't stand in for this: Motion runs springs and `layout` animations on requestAnimationFrame, and those never appear there. Motion itself is verified separately by the Phase 3 sampling tests. The report is human-readable **and** JSON (`--reporter=json`), with selector, rule, measured value and a suggested fix — so coding agents can self-correct.

Default matrix: viewports `390×844, 768×1024, 960×640, 1280×800, 1440×900, 1728×1117` × themes `light, dark` × densities `comfortable, compact`, in **Chromium and WebKit** (Tauri on macOS renders with WKWebView, so WebKit is the closest stand-in for the desktop app). Failures print the offending selectors and save an annotated screenshot. `pnpm check` runs every playground page, the playground chrome and the starter at `390×844` and `1280×800`, light and dark, comfortable, in both engines; the full matrix runs with `pnpm test:layout` and at every phase stop. With `--reporter=json` it prints one machine-readable report, `{ passed, violations, failures }`, where `failures` lists tests that failed for any other reason, such as a page that never settles. Playwright's WebKit is its own build rather than the system WebKit, so each phase stop also includes a short pass in the real desktop app.

### `LayoutGuard` (dev only)
Mounted by `ButteryProvider` in Vite development builds (`layoutGuard={false}` turns it off). Re-checks overlap, overflow and off-scale values on resize, scroll and DOM changes, ignoring its own overlay: once the page has been quiet for 300ms, at least once a second while it keeps changing, and only while buttery reports settled. Each check waits for a rendered frame, so components that adapt in ResizeObserver callbacks (OverflowCluster) have done so. It outlines offenders in red with a label and logs each new set of problems as one `console.warn`: a summary line, then one JSON violation per line in the shared format. `⌥⇧L` toggles the outlines and `⌥⇧G` the 12-column page grid, except while typing in a field. Production builds don't include it.

### `@buttery/lint`
- **stylelint** (`@buttery/lint/stylelint`, rules `buttery/no-raw-color`, `buttery/z-index-token`, `buttery/no-negative-margin`, `buttery/position-owned`, `buttery/raw-length`, and `buttery/tailwind-tokens`, which checks the classes an `@apply` pulls in the same way the ESLint rule checks `className`):
  - No raw colors outside token files.
  - z-index only `var(--bt-z-*)`.
  - No negative margins.
  - `position: absolute|fixed|sticky` only in `packages/core/src/layers/**` and component files (for `data-bt-part` internals) — never in apps or patterns.
  - No `!important`, no `transition: all`.
  - Raw lengths and durations are allowed only in: token files; `--bt-<file>-*` variables declared in the first rule of their stylesheet (component variables, such as `--bt-slider-thumb` at the top of `slider.css`); `@container`/`@media` conditions (CSS can't use `var()` there); `@font-face` descriptors; `letter-spacing` (em); border/outline widths ≤ 2px. Everywhere else lengths must be `var(--bt-*)`, `0`, `%`, `fr`, `ch`, `dvh`/`dvw` or container units, and durations `var(--bt-dur-*)`.
  - Out-of-flow positioning in a component file is allowed only in rules that target `[data-bt-part]` internals.
- **ESLint** (`@buttery/lint/eslint`):
  - `buttery/no-literal-layout-style` rejects inline `style` margins, z-index, position and sizes with literal values (tokens, percentages, `auto` and computed values pass), and custom properties set to raw lengths.
  - `buttery/no-raw-motion-layout` rejects `layout` and `layoutId` written out on Motion elements (`motion.*` and `m.*` under any import name, and components from `motion.create()`): spread `useLayoutAnimation()` instead, or pass on the `layout` it returns (`layout={layout}`, `layoutId={layout ? "pill" : undefined}`), so reduced motion turns the layout animation off. `layout={false}` is fine.
  - `buttery/tailwind-tokens` keeps Tailwind classes on the tokens: no `absolute`/`fixed`/`sticky`, no z-index but `z-(--bt-z-*)`, no negative margins, no arbitrary values holding raw lengths, durations or colors, no `transition-all` or raw durations, none of Tailwind's own palette, type scale or shadows, and spacing only in steps on buttery's scale. Arbitrary properties (`[position:absolute]`) get the same checks. `butteryEslintConfig({ tailwind: false })` turns it off.
  - `buttery/spread-rest-props` makes components whose props accept a DOM element's props (function or arrow components; interfaces, aliases or imported types) collect `...rest` and spread it onto what they render (React 19 passes `ref` through it). With type information it reads the props' type; without it, the props declaration in the same file.
