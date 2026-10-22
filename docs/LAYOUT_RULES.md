# buttery — Layout Rules

**The promise:** anything built with buttery never overlaps, is always sized from the system, stays uniform, and lays out well at every size — without the builder having to think about it.

That promise is kept three ways, and all three are required:

1. Primitives make the right layout the easy layout (you can't easily express a bad one).
2. Static lint blocks the usual causes (raw values, negative margins, ad-hoc z-index, stray absolute positioning).
3. Automated layout checks (`@buttery/test` + the dev-time `LayoutGuard`) catch anything that slips through, at every viewport, in both themes.

Page layout follows a strict grid with a consistent section rhythm: split heroes, bento grids, sticky asides. App layout follows the inspector-style editor in the local app captures, and for dashboards a sidebar shell (§3).

---

## 1. The 13 non-negotiables

1. Flow layout only. Siblings are positioned by `Stack` / `Inline` / `Grid` with `gap` from the spacing scale. Components never set their own outer margin. Negative margins are banned.
2. Out-of-flow is owned. In app code and patterns, `position: absolute|fixed|sticky` is off-limits. It lives only in (a) layer primitives in `packages/core/src/layers/` (`Layer`/`Portal`, `Popover`, `Scrim`, `Sticky`, `FloatingLanes`), which render into portals and use z-index tokens; and (b) a component's own internal parts (a slider thumb, a segmented indicator, `FitBox` content), which stamp `data-bt-part`. The overlay components (`Menu`, `Select`, `Tooltip`, `Dialog`, `Toaster`) are built on those primitives and never set `position` themselves. `FloatingToolbar` renders into the floating layer and places its own `data-bt-part` wrapper there by script, following its anchor.
3. Floating lanes. Free-floating UI (toasts, notices) lives in a `FloatingLanes` lane (`bottom-center`, `bottom-end`, `top-end`): items stack with an 8px gap, never grow wider than their lane (the viewport minus 24 a side), and respect safe insets (sticky header/footer, macOS titlebar). A lane has room for three items: toasts come from `toast()`, which keeps three at most, and a fourth item in any lane logs a development warning. Anchored floating UI (a crop toolbar under its crop box) is positioned by its anchor but registers its resting rect as an obstacle and calls `notifyObstacleMoved()` when it moves, so lane items move clear of where it is. A toolbar and a toast can never cover each other. An obstacle at least half the window's height that meets its end edge or stands in its end half, such as a docked `SidePanel` or an editor `AppShell`'s inspector, moves the end lanes in past it and centers the bottom-center lane in the room left, publishing the width as `--bt-lane-inset-end`. The bottom lanes stack as one column when they'd touch (a narrow window), center items above end items, and `FloatingLanes` publishes the height they take as `--bt-lane-clearance` for scroll areas to keep clear (§3).
4. Collision-aware overlays. Popovers/menus: `avoidCollisions`, `collisionPadding={8}`, side offset 8, never cover their trigger, `max-height` = available space with internal scroll.
5. No component chooses its own height. Heights come from tokens (`--bt-h-*`). Widths are intrinsic, fluid (`minmax(0,1fr)`), or a named token (`--bt-w-*`).
6. `min-width: 0` by default. Every flex/grid child inside buttery primitives gets it, so long content shrinks instead of pushing siblings off-screen.
7. Text never overflows. Single-line control text truncates with an ellipsis *and* exposes the full text (tooltip/`title`). Content text wraps, with a max measure (body ≤ 60ch, display headings ≤ 22ch). Numbers that change use tabular figures and a reserved min-width so nothing jitters.
8. Media keeps its shape. Aspect-ratio boxes and explicit `object-fit`. Stage content uses `FitBox` (largest rect that fits the available space at a given aspect, always centered).
9. Container queries, not viewport queries. Components respond to the space they're given, so the same component works in a 340px inspector and a 1200px page.
10. Priority overflow instead of wrapping. Toolbars, header bars and nav bars use `OverflowCluster`: when items don't fit, the lowest-priority ones move into a "More" (`…`) menu. They never wrap to two lines, never overlap, never shrink text. Applied filter pills are the one exception: they're state the person has to see and remove, so a `FilterBar` wraps them, and folds them into one button under 640px.
11. Scroll is contained. The shell never scrolls horizontally. Panels scroll internally (`overscroll-behavior: contain`, `scrollbar-gutter: stable`, 12px fade masks at the edges with `.bt-scroll-fade`), and a contained panel fits inside the viewport: if its end sits below the fold, containment keeps the page from scrolling to it. `<Sticky variant="aside">` fits a sidebar between the sticky bars and scrolls it inside without containment, because what follows an aside can push it up past the bars near the end of the page, and only a scroll that reaches the page brings it back.
12. Sticky things reserve space. Sticky headers publish their height as `--bt-sticky-top`; anchors use `scroll-margin-top: var(--bt-sticky-top)`. A bar that slides away (`NavBar behavior="auto-hide"`) keeps reserving its height and publishes how far it has slid as `--bt-sticky-shift`, and every `Sticky` under it (a `SubNav`, an aside, a bar of your own) takes that off its offset: one that has stuck moves up with the bar, one still in the page's flow stays put.
13. Zero layout shift on interaction. Loading states, skeletons and label swaps (e.g. "Continue" → "Finish") keep exact dimensions. Fonts are bundled and preloaded with a metric-matched fallback.

---

## 2. Uniformity rules

- One left edge. Everything inside a container aligns to its padding edge. Section titles, row labels, card titles — same x.
- Equal siblings are equal. Groups of peers share size: `Grid` with equal columns; `Inline uniform` for equal-width buttons (a dialog's back and forward buttons).
- Concentric corners. Nested surface radius = parent radius − parent padding (`Surface radius="auto"`). The one deliberate exception is Panel → Section (sections are sized inside-out: card 12 + well 4 = 16) — see DESIGN_SPEC §4.
- Hit areas. Every interactive element has a hit area of at least 24×24 (WCAG 2.5.8); standalone buttons are at least 28 tall. Small visuals (thumb, color dot, chip, crop handle) get an invisible `[data-bt-hit]` element that extends their hit area without changing layout.
- One gap per relationship. Use the relationship tokens, not ad-hoc numbers:

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
| Section intro ↔ section content | 48 · 64 from 1024px of page |
| Page sections (padding-block) | 64 (sm) · 96 (md) · 128 (lg) |
| Sidebar items | 2 |
| An app page's header block ↔ its first section | 24 |
| Sections in an app page | 32 |
| Filter pills, quick actions | 8 |

- Baselines line up. Rows use a two-column grid (`[label+badge] [control]`) with center alignment; bento card titles in the same row share a baseline.
- Icons are 16px in controls (stroke 1.75), 20px in empty states, never mixed within one cluster.

---

## 3. App layouts (from the inspector app and a dashboard)

### AppShell
Its work is at most `--bt-w-shell-max` (1380) wide, centered; below that it fills the window.
```
┌────────────────────────────────────────────── 8px padding ──────┐
│ HeaderBar (56h, r16)                       │ Inspector (340w)    │
│────────────────────────────────────────────│  Panel r16, pad 8   │
│                                            │  Section…           │
│          Stage (fills, FitBox content)     │  Section…           │
│                                            │  ── sticky footer ──│
└────────────────────────────────────────────┴─────────────────────┘
grid-template-columns: minmax(0, calc(1380px - 340px - 8px)) var(--bt-w-inspector);
gap: 8px; padding: 8px; justify-content: center; block-size: 100%;
```
- The inspector is full-height (it runs alongside the header). Its body scrolls; its footer is sticky. The shell fills its container's height, which an app sets to the window.
- Under 840px of its own width: the inspector becomes a bottom sheet opened by a full-width button under the stage, and the stage takes the full width. The sheet closes when the window widens again. (A desktop window never gets this narrow; its minimum width is 960.)
- Desktop (Tauri): `HeaderBar dragRegion` adds `data-tauri-drag-region="deep"` (the whole header drags the window, buttons stay clickable) and reserves `--bt-inset-titlebar` on the left for macOS traffic lights when the window uses an overlay title bar. Minimum window 960×640.

### Inspector rows
- Row: 50h, `grid-template-columns: minmax(0,1fr) auto`, padding-x 16, 1px divider between rows.
- Left cell: label (truncates) + optional value badge (reserved min-width).
- Right cell: control at its token width (slider 160, segmented intrinsic, swatch grid spans both columns).
- `Row.Split`: two half-rows side by side with a 1px vertical divider (two compact controls in one row), `--bt-h-row-split` (64) tall so a tilt pad or anchor grid has room.

### Stage
- Centers content with `FitBox` at the chosen aspect ratio with a 32px minimum margin from stage edges.
- Empty state, crop mode and drop overlay all occupy the same box — swapping between them never moves surrounding UI.

### AppShell `layout="sidebar"` (Phase 6B)
For dashboards: a sidebar beside a column holding the top bar and the page.
```
┌ Sidebar 240 ──┬ Top bar (56h): search ············· actions · create ┐
│ workspace     │                                                      │
│ nav (2 apart) │ AppPage: contained ≤ 1280 or full, side padding      │
│ Recent        │ 32 / 24 / 16                                         │
│ groups        │   main ··················· │ aside 320 (≥ 1280)      │
│ More          │                            │                         │
└──────── 1px ──┴──────────────────────────────────────────────────────┘
grid-template-columns: var(--bt-w-sidebar) minmax(0, 1fr);
```
- The shell fills its container's height and never scrolls. The sidebar and the page each scroll on their own (`overscroll-behavior: contain`, `scrollbar-gutter: stable`, `.bt-scroll-fade`); the sidebar draws a 1px `border` hairline on its inline-end edge. In the sidebar only the nav scrolls: the workspace switcher stays at the top, centered on the top bar's row (`(h-header − h-button) / 2` above it), and the nav's first item sits 12 under it. A rail's nav scrolls without a scrollbar, since 56px has no room for one beside its icons.
- Breakpoints are the shell's own width, so they hold wherever the shell is mounted: the shell measures itself and sets `data-sidebar` (`full`, `rail` or `sheet`), and it's a named container (`bt-shell`, its column `bt-column`) for what's inside to query. From 1100px: the full sidebar. Under 1100: an icon rail (`--bt-w-sidebar-rail`, 56) where each item is an icon with its label in a tooltip, section headings become 1px dividers, and a group's items open in a flyout menu beside it. Under 640: no sidebar beside the page (it stays mounted but draws nothing, so Recent sees the page shown change while no menu or shortcut of its works behind the sheet); a menu button at the top bar's start (`aria-expanded`, `aria-haspopup="dialog"`) opens it as a sheet from the start edge, which closes on navigation, Escape or the scrim, handing focus back to that button. If the shell widens while the sheet is open, focus moves to the inline sidebar's current page. A new mode paints in the frame the shell resized in.
- `AppPage width="contained"` centers the page at most `--bt-w-app-page` (1280) wide in the column; `"full"` fills it. Side padding follows the page grid (§4): 32 from 1024px of column width, 24 from 640, 16 under it; the top bar pads the same. The page's header starts 24 under the top bar (the scroll area's 12px fade and 12 of padding), its sections follow 24 under the header and 32 apart, and its end padding adds `--bt-lane-clearance`.
- The right rail (`AppPage aside`, `--bt-w-aside`, 320) sits beside the main column, 32 apart, from 1040px of the shell's column in a shell at least 1100 wide (from 1280 of shell beside the full sidebar, more while a side panel is docked), and drops under the main content below that, including beside the narrower shell's icon rail.
- A page whose main block is a table can give it the rest of the height (`AppPage fill`): the header, tabs and filters keep their size and the table scrolls inside, with its header sticky.

### App pages (Phase 6B)
Every page in an app shell follows one grammar, from a second set of local references of the same dashboard (`reference/inspiration-settings/`, not in the repo). The page templates (`SettingsPage`, `DetailPage`, `CatalogPage`, `PlanComparison`, `SearchResults`) and `AppPage` build it in, and later `buttery add page` scaffolds it.
```
Breadcrumbs (only when the page is nested)
Title [ScopeBadge ⓘ] ··································· actions (one primary)
One-line description
Tabs ─────────────────────────────────────────────────────────────────────
Section heading ········································ its one action
One-line description
content
                                                       32, or a hairline
Section heading ········································ its one action
…
──────────────────────────────────────────────────────── hairline
Small footer: feedback · keyboard shortcuts
```
- Order: breadcrumbs only when the page is nested, then the title row (the title, an optional `ScopeBadge` whose info button says what the scope means, the page's actions at the end), an optional one-line description, optional tabs, then the content.
- Sections aren't cards. A section is a heading and a one-line description at the start, its action at the end of the heading's row, and its content under them, with 32 or a hairline between sections. Cards hold objects only: plans, metrics, catalog items and list rows that are things.
- One primary button per region (a page header, a section, a dialog's footer, a panel); everything else is secondary, ghost or a link. `expectButtery` reports a region with two.
- Hierarchy comes from type size and weight, not borders or color, and everything on a page shares one start edge: section content isn't indented under its heading.
- Widths: index and table pages are contained at `--bt-w-app-page` (1280); settings detail pages at most `--bt-w-app-page-md` (960); dense forms and preference matrices at most `--bt-w-app-page-sm` (820).
- Each section loads on its own, with a skeleton or a `LoadingPill` in its place; nothing blocks the whole page.
- In a form, Save stays disabled until something changes. Cancel and Save sit in the section's header or its footer, never both.
- A page ends with a hairline and an optional small footer, such as a feedback link and the keyboard shortcuts.

### Tables
- A `DataTable` is one scroll container for both axes. Its rows share one grid column template, so every column has a minimum width (a token step) and a share of what's left; when the minimums don't fit, the table scrolls sideways inside its container, and the page never does.
- The header row sticks to the top of the table's scroll area and the first column (with the checkbox column) to its inline start, both on `bg-surface`; the first column shows a 1px edge while the table is scrolled sideways. The header sticks whenever the table scrolls vertically, which it does when it's given a height (`AppPage fill`, or a parent with one); a table that grows with its rows scrolls with the page instead.
- A table that overflows its scroll area makes that area focusable (a region named by the table's label), so the keyboard can scroll it.
- Cells never wrap: text truncates with an ellipsis and its full text in a tooltip (`data-bt-truncate`). Numbers are right-aligned and tabular. Row height is `--bt-h-table-row`; skeleton rows use the same height, so swapping them for rows moves nothing.

### Floating guidance
- `SetupGuide` lives in the `bottom-end` lane and toasts in `bottom-center`. The `bottom-end` lane sits in the floating band, so a dialog or sheet dims it with the rest of the page; toasts and top-end notices sit in the toast band, above dialogs. When the two lanes would touch (a narrow window), they stack as one column at the bottom end: toasts above the guide, 8 apart, so neither covers the other.
- `FloatingLanes` publishes the height its bottom lanes take, plus the gap, as `--bt-lane-clearance` on `<html>` (0 while they're empty). The page adds it to its end padding, and a table in a filled page ends its rows with that much room to scroll (content inside its scroll area, not padding on it, so the area keeps its size and its pagination never moves), so the last row and the pagination can always clear a toast or the guide. A bar pinned to the bottom of the viewport, such as a filled page's pagination, registers as a lane obstacle, so lane items rise above it.

---

## 4. Page layouts

### Grid
| Container width | Columns | Gutter | Side padding |
|---|---|---|---|
| < 640 | 4 | 16 | 16 |
| 640–1023 | 8 | 24 | 24 |
| ≥ 1024 | 12 | 24 | 32 |

- Content max-width: `--bt-w-page: 1200px`, centered (`Container`, which centers with padding rather than margins). Everything snaps to columns. Visuals may bleed past the container to the viewport edge (`bleed="right"`), text never does.
- `Page` is the size container the page grid, side padding and display type follow. `Grid columns={{ base, md, lg }}` changes its columns at 640 and 1024px of the nearest size container. Patterns that change their own layout (`SplitHero`, `CenteredHero`, `StatStrip`, `Bento`) are size containers themselves, so they lay out by the room they're given, inside a `Page` or not.
- A `Section`'s room steps down one size on a phone (under 640px of page: `md` 64, `lg` 96), so its padding never outweighs its content.
- Dev overlay: `⌥⇧G` toggles a column overlay (dev only — not a visual feature).

### Patterns
- NavBar: 64h, aligned to the page container (or spanning its window with `contained={false}`, for an app's own chrome such as the playground's docs shell). Brand mark on the left, the nav items next to it (triggers carry a chevron, plain links don't), an optional `search` after them (at most 360px, narrowing to 160 before anything folds), and a right cluster with a secondary pill and a primary call to action with a forward arrow. The nav items never narrow past their own width, so they never run under the search. Below 640px of container width, or once the nav items and actions no longer fit beside the brand (measured, so they never overflow or wrap), everything but the brand and the search collapses into a menu button that opens a full-height sheet with accordion sections, 8px inside the window like any floating surface. A search with focus takes the nav items' room (and the brand's, while folded), so its field and panel can widen to 600px without covering anything; they come back as it lets go. `behavior` is `static` (the default: it scrolls away with the page), `sticky` or `auto-hide`; while it can stay on screen it publishes its height as `--bt-sticky-top`. It stacks at `--bt-z-sticky` whatever its `behavior`, rising to `--bt-z-floating` while a menu is out so the panel covers a `SubNav` under it. Its menus share one `MorphMenu` card (MOTION_SPEC §4.1), which opens 8px under the bar row and never covers the bar's own items (the triggers' full-height targets and a strip that draws nothing in the 8px gap carry the pointer down to it), is never wider than the container or than the viewport minus 16px, and never runs past the window's bottom edge: a taller menu scrolls inside it. The panel carries `data-bt-float`, so the layout checks treat it as a surface of its own.
- SubNav: sticky under NavBar, 48h (`--bt-h-sub-nav`), on the page container. A title at the start, the links at the end (at the start when there's no title) and an optional action after them. The links run the bar's full height, so the current one's underline sits on the bar's bottom edge, the one track it slides along. Links that don't fit fold into "More sections" (`OverflowCluster`). Once stuck, it moves up with an auto-hiding nav bar, as every `Sticky` does.
- SplitHero: text 6–7 cols / visual 5–6 cols, vertically centered; headline is two-tone (strong + secondary continuation) ≤ 22ch; actions 24 below body.
- CenteredHero: centered text (≤ 8 cols) above a full-width visual stage.
- Bento: 12-col grid, cards span 4/6/8/12 cols and 1–2 row units (`--bt-bento-row: 320px`), gap 16. From 640 to 1024px of bento the grid has 6 columns and a card takes half (4 and 6) or all of it (8 and 12); under 640 the cards stack. Card anatomy: title top-left (`heading-2`, at most 22ch, an `h3` that names the card), affordance top-right, visual anchored to the bottom and allowed to bleed to the card edges, which clip it. Cards can expand to a modal (`ExpandableCard`), at most `--bt-w-dialog-lg` (880) wide with the card's radius; its frame is a size container, so the title keeps the step it had in the bento.
- StatStrip: 2 or 4 equal columns; each stat has a 1px left hairline, number (tabular: `display` in two columns, `heading-1` in four, so a long number fits) and label. Four columns fall into two rows of two under 640px of strip.
- LogoStrip: N equal cells (`LogoStrip.Mark`), logos optically normalized into a 120×24 box, monochrome, wrapping onto more rows as the page narrows.
- ArticleLayout: main 8 cols + aside 3 cols (1 col gap). The aside is a `<Sticky variant="aside">`, so it sticks right under the bars and fits between them, with its 24px gap as padding inside it; it stops at the end of the article and never overlaps the footer, and once stuck it moves up with an auto-hiding nav bar. Under 1024px of room the aside follows the article as a plain block, never moved ahead of it. The layout is its own size container.
- Footer: multi-column link grid on the same 12-col grid: the brand takes 4 columns and each link column 2; on 8 columns the brand takes a row and the link columns go four to a row, on 4 columns two. Small print sits under a 1px `border` divider, 48 below the grid. Links are `body-sm` in `text-secondary`, 24px targets. The footer is its own size container.

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
| **Overlap** | Two visible boxes **in the same layer** (page, or the same portal) intersect by > 1px. Boxes are `[data-bt]` elements and parts, and text measured one line at a time: glyph extents across, the line box down, and no taller than the box of text trimmed with `text-box` plus the last line's real descenders, measured in its font, so trimming can't hide a descender under the next box. Exempt: one contains the other, one sits in a `data-bt-part` of a component that contains the other (thumb over track, indicator under items), or either is inside `[data-bt-allow-overlap]` (stage artwork, a dialog's close button over its media). Each open layer is checked on its own; a sticky bar, and a surface that floats over the page from inside it (`[data-bt-float]`: a nav bar's menu panel), count as layers of their own. Across layers, a floating-lane item may not cover a control in the page's header, navigation or a sticky bar. |
| **Overflow** | An element with `overflow: visible` has content past its padding box by more than 1px, or the document scrolls horizontally. Scroll sizes only pre-filter; the excess is measured from descendant boxes and text line boxes. Text trimmed with `text-box` (and inline content inside it) counts only across: its glyphs overhang the trimmed box by design. `[data-bt-hit]` areas don't count. Elements with `data-bt-truncate` or a declared clip (`data-bt-clip`: bleed visuals, stage, rounded media) and everything inside them are exempt, and so is what sits inside `[data-bt-allow-overlap]`, which may also ride past its parent's edges without making the parent overflow (stage artwork, crop handles on their frame). A `[data-bt-float]` surface doesn't make its parent overflow either, and is checked inside like any other part. Screen-reader-only content (a box of 1px or less with its overflow hidden, and what's inside it) draws nothing, so it's skipped; so is a box with opacity 0 and what's inside it, such as the card an `ExpandableCard` leaves in its grid while its dialog is open. |
| **Clipping** | Text is ellipsized without `data-bt-truncate` and its full text in a `title` or tooltip, on the text or the control around it (an `aria-label` alone doesn't show it). Or text is cut off by an `overflow: hidden` or `clip` ancestor with no ellipsis. Scroll containers, declared clips (`data-bt-clip`) and visually hidden text are exempt. |
| **Scale** | A computed gap or padding on a `[data-bt]` element isn't on the spacing scale, or a control root (`[data-bt-control]`) has a height that isn't a `--bt-h-*` token. Allow-list: 1px hairlines, and a `Container`'s side padding, which centers its column (half the room the page width leaves, never under its side token). Content-sized elements (text blocks, cards, tooltips) aren't height-checked. |
| **Target size** | An interactive element's hit area (the element, its `[data-bt-hit]` child, and for inputs their labels) is smaller than 24×24, or a standalone button is shorter than 28. A standalone button is a button without a `[data-bt-hit]` area that isn't an item of a larger control: a `<button>` with the role of a radio, tab, menu item or option (a segment, a tab, a menu row) only needs the 24px minimum, while a select trigger or switch is still standalone. Small inline actions like chips extend their target with a `[data-bt-hit]` area instead. Disabled elements, inline text links inside a sentence and `data-bt-target="group"` members are exempt, and so are containers focusable only so keyboards can reach them: dialogs, tab panels, regions, groups, logs and feeds, and scroll areas whose only interactivity is `tabindex`. |
| **Reach** | Nothing that stays put hides its end. A sticky or fixed box must fit the viewport where it stays (a sticky box at its `top` or `bottom` offset; a box that sticks only sideways, such as a table's first column, scrolls with the page and isn't checked here), and a scroll area with `overscroll-behavior` other than `auto` that's sticky or fixed, or inside something that is, must sit entirely in the viewport, since scrolling inside it can't move the page. And no scroll area may start its content before the point it can scroll back to (content centered or end-aligned in an area it overflows); children without a box are skipped, `display: contents` wrappers count through their children, and reversed flows, which scroll from their far end, aren't checked on that axis. |
| **Viewport fit** | The outermost painted surface (a background, border, shadow or backdrop filter) of anything in a layer, and any `[data-bt-float]` surface, comes within 8px of the viewport edge. Full-viewport wrappers and scrims aren't surfaces. |
| **Layering** | A z-index that isn't a `--bt-z-*` token. |
| **Emphasis** | A region holds more than one visible primary button (`Button` or `IconButton` with `variant="primary"`). A region is the nearest `[data-bt-region]` or dialog around the button: a page header, an `AppPage.Section`, a settings section, a side panel, a detail page's aside, a plan in a `PlanComparison` (its ribbon and card), a `PlanComparison.Option` or a dialog mark themselves. |
| **Accessibility** | axe-core serious/critical violations, or text contrast below AA. |
| **Stability** | During a scripted interaction, a `[data-bt]` element that isn't the interaction target (or animating as its direct result) moves by > 1px — measured by sampling element rects before/after, not by the browser's CLS metric (which ignores shifts right after input). Movement is measured from the scroll container the element moved least relative to, so scrolling and stuck sticky bars don't count; a popover, which follows its trigger, is measured from the page rather than the window. Once buttery reports settled (below), anything still moving must be a declared `Loop`. Or, at any point, a ResizeObserver callback resizes what it observes while the browser is delivering its notifications ("ResizeObserver loop completed with undelivered notifications"); call `watchResizeLoops(page)` before `page.goto` to count the ones while the page first lays out. |

A `[data-bt-preview]` element marks content drawn scaled down by the factor it holds, such as the docs site's desktop previews of page-scale components. Inside it the checks measure text line boxes, target sizes and control heights at the size the content lays out at, as they would in an iframe, and axe's target-size results inside it are left out.

How checks run: static checks emulate reduced motion, set the theme with an emulated color scheme and the density with `data-bt-density` on `<html>`, wait two frames for style changes to start their transitions, then wait for buttery's settled flag and for every finite CSS animation to finish before measuring. If the page has changed `data-bt-density` back by then, the run stops with an error rather than checking the wrong density. If the page changes while it's being checked (an element, text or attribute other than an inline style, or the settled flag dropping), such as a timer swapping a skeleton for data, the check runs again once it settles, up to three times, so a frame caught halfway through the swap isn't reported. Scripted interactions run once, in order, at the first viewport, theme and density: each state they leave (an open menu, a toast) gets every check, then the stability comparison. An interaction marked `acrossMatrix` also has the state it leaves checked at every viewport, theme and density, for states that last, such as a form's errors; positions are compared at the first only. When the run ends, the page goes back to the viewport it started at; a test that resizes step by step sets each size before checking it (Card Studio's 1728 → 960 → 390 resize does). Dev tooling (the `dev` layer, where `LayoutGuard` draws) is never checked. buttery counts its own running animations (every motion primitive registers when an animation starts and when it finishes; `Loop`s don't count) and sets `data-bt-settled` on `<html>` while the count is zero. `document.getAnimations()` can't stand in for this: Motion runs springs and `layout` animations on requestAnimationFrame, and those never appear there. Motion itself is verified separately by the Phase 3 sampling tests. The report is human-readable **and** JSON (`--reporter=json`), with selector, rule, measured value and a suggested fix — so coding agents can self-correct.

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
