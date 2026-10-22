# 🧈 buttery — Build Plan

Phases 0–8, with 4.5 (forms and text) and 6B (the App kit) between them. Each ends with a **hard stop**: the agent shows screenshots + a short summary and waits for the go-ahead. Guardrails (Phase 2) come *before* components, so every component after is checked automatically. `ROADMAP.md` mirrors these phases as checkboxes — tick them as items land.

Definition of done for every phase:
- `pnpm check` passes (authorship and private-path checks, typecheck, lint, stylelint, format, unit and smoke tests; from Phase 2 on, also `expectButtery` on every playground page and the starter at 390 and 1280, light and dark, comfortable, in Chromium + WebKit).
- From Phase 2 on, `pnpm test:layout` passes the full matrix. A short manual pass in the real desktop app finds nothing wrong.
- Playground pages for everything built in the phase, light + dark, comfortable + compact.
- Side-by-side screenshots against the relevant `reference/` images, with differences listed honestly.
- `docs/DECISIONS.md` updated with any judgment calls; `ROADMAP.md` ticked.

---

## Phase 0 — Foundation
- Merge `AGENTS.buttery.md` into `AGENTS.md` (keep existing rules and the `buttery:start/end` markers; flag conflicts), then delete `AGENTS.buttery.md`. Confirm `CLAUDE.md` imports it and `.gemini/settings.json` loads it.
- pnpm monorepo per `ARCHITECTURE.md` (packages: core, react, test, lint, cli, mcp — cli/mcp as empty stubs; apps: playground, starter; scripts; tooling).
- TypeScript project references with the strict flags from `AGENTS.md` → "Code quality bar", tsdown builds, Vite apps, Vitest, Playwright (Chromium + WebKit projects), Prettier, ESLint (typescript-eslint strict-type-checked, react-hooks, jsx-a11y, zero warnings), stylelint, Changesets, `.gitignore`.
- `scripts/check-ai-tells.mjs` (wired into `pnpm check`) and a `commit-msg` git hook, per the authorship section of `AGENTS.md`. Confirm `.claude/settings.json` turns attribution off.
- Root scripts: `dev`, `build`, `check`, `test`, `test:layout` (stub until Phase 2), `new-app`, `new-component` (stub until Phase 2).
- `.vscode/tasks.json` for dev / check / test:layout; verify the recommended extensions in `.vscode/extensions.json`.
- `apps/starter` with Tauri v2 (`pnpm tauri init`), window config from ARCHITECTURE. Inter Variable bundled in apps.
- Verify the TypeScript 7 caveat in ARCHITECTURE and record the outcome.

**Accept:** clean install + `pnpm check` green; playground and starter run in the browser; `pnpm --filter starter tauri dev` documented with one-time Mac setup (user verifies).

## Phase 1 — Tokens & recipes
- Every token from `DESIGN_SPEC.md` (light, derived dark, compact density; page display roles from `LAYOUT_RULES.md` §4) as CSS vars + typed TS exports + generated `tokens.json`.
- Cascade layers, reset, base typography, focus ring, scrollbars, selection.
- Recipes: `.bt-surface[data-level]`, `.bt-press`, `.bt-focus`, `.bt-control[data-size]`, `.bt-text[data-role]`, `.bt-truncate`.
- `ButteryProvider`, `createTheme`, palettes, Tailwind v4 bridge.
- Unit test computing AA contrast for every declared active text/background token pair in both themes.
- Playground: Tokens page + Surfaces page recreating the nested panel → section → card → row structure.

**Accept:** Surfaces page next to the inspector in `reference/01-editor-empty.png` reads as the same family; contrast test green.

## Phase 2 — Layout primitives & guardrails
- Primitives: `Stack`, `Inline` (`uniform`), `Grid`, `Center`, `Divider`, `Text`, `Icon`, `Surface` (`radius="auto"` via context), `Pressable`, `FitBox`, `OverflowCluster`.
- Layers (`packages/core/src/layers/`): layer manager + `Layer`/`Portal`, `Scrim`, `Sticky`, `Popover`, `FloatingLanes`.
- `@buttery/test`: `expectButtery(page, opts)` with every check in `LAYOUT_RULES.md` §5, human + JSON reports, annotated failure screenshots.
- `LayoutGuard` dev overlay (`⌥⇧L`), grid overlay (`⌥⇧G`), same JSON format in the console.
- `@buttery/lint`: stylelint + ESLint configs from `LAYOUT_RULES.md` §5, applied to the whole repo.
- `scripts/new-component.mjs`: template producing a contract-compliant component (CSS with component-scoped vars, JSDoc, examples, playground page, tests, manifest entry). Use it for every component from here on.

**Accept:** a deliberately broken fixture page (overlap, overflow, off-scale gap, tiny hit area, raw z-index, clipped text, layout shift) fails each check with a clear message and fix; the fixed version passes.

## Phase 3 — Motion system
- Motion tokens + presets, `useButteryTransition` (normal + reduced sets).
- `Morph`, `Presence` (fade/rise/pop/toast/menu presets), `SharedIndicator`, `Reveal`, `Stagger`, `Loop` (pauses offscreen), `Confetti` (`celebrate(fromElement)`), and the `buttery` factory (`buttery.div`, `buttery(Component, recipe)`).

**Accept:** Motion playground page with one demo per preset and a reduced-motion toggle; Playwright samples transforms per frame and reports settle times (95% of travel) vs `MOTION_SPEC.md` §3; reduced motion renders final states with transforms instant and opacity ≤ 100ms.

## Phase 4 — Controls
- `Button` (primary/secondary/soft/ghost, sm/md/cta, pill/rounded, loading, icon slots, `arrow="forward" | "back"`, the same arrow part `ArrowLink` uses), `IconButton`, `SplitButton`, `SegmentedControl`, `Slider` (+ `ValueBadge`, detents, double-click reset), `Chip`, `Tooltip`, `Kbd`, `ArrowLink`, `NumberField`.

**Accept:** a Compare page with each control next to its crop from the references (light + dark). The page is local only: it reads from `reference/`, hides itself when the folder is missing, and is left out of builds and CI. Keyboard + screen-reader tests; `expectButtery` green. The arrow (MOTION_SPEC §4.5): unit tests for its states, zero width change on hover, reduced motion and only the chevron on touch; Playwright samples it per frame against §4.5 and proves zero layout shift on hover; side-by-side frames against `reference/inspiration-nav/` with the differences listed.

## Phase 4.5 — Forms and text
- `TextField` (label above, hint, error, optional icons), `PasswordField` (a show and hide toggle), `TextArea` (grows with its text up to a limit, then scrolls), `Field` (label, hint and error wiring for any control), `Checkbox`, `Switch`, `Callout` (an inline message: info, success, warning, error), `TextStack` (a title, body and caption with the gaps between trimmed text, as on the Text stacks page).
- Patterns: `SignInForm` and `SignUpForm` (email and password with autofill attributes, remember me, a forgot-password link, third-party sign-in buttons without anyone's brand mark, an error summary, inline field errors).
- Playground: a page for each, and an original sign-in demo page.

**Accept:** keyboard and screen-reader tests for each component (names, descriptions, error announcements, focus moving to an error summary on submit whose links lead to each invalid field); autofill attributes checked; `expectButtery` green with errors showing and the password visible, at 390 and 1280, light and dark.

## Phase 5 — Inspector & app patterns
- `SwatchGrid`, `ColorDot`, `TiltPad`, `AnchorGrid`, `Menu`, `Select` (footer slot), `FloatingToolbar` (`Toast` landed early, in Phase 4), `EmptyState`/`DropZone`, `Stage`, `Inspector` (Section/Row/Row.Split/Footer), `HeaderBar` (`OverflowCluster`, `dragRegion`), `AppShell`.
- Demo in playground: **Card Studio** — an *original* app (style a title card: its text, background, edge style, scale, rotation and 3D tilt, placement, canvas shape and crop, then export an image) that exercises every component. Not a clone of the reference product.

**Accept:** Card Studio matches the measured motion table (MOTION_SPEC §3) and passes the full matrix; resizing 1728 → 960 → 390 never overlaps or overflows (header actions collapse into "…", inspector becomes a sheet).

## Phase 6 — Overlays & choreography
- `Dialog`, `Onboarding` (a step dialog: morphing media scene, page dots, back and forward buttons with a last-step label, confetti, first-run persistence), `PageDots`.
- `NavBar` + `MorphMenu` (Radix NavigationMenu; `behavior` static, sticky or auto-hide; a sheet below 640), `SubNav`, `ExpandableCard`, `Bento`, `Page`/`Section`/`Container`/`Grid`, `SplitHero` and `CenteredHero` (with the hero assembly, MOTION_SPEC §4.3), `StatStrip`, `Stat`, `LogoStrip`, `ArticleLayout`, `Footer`.
- Demo: an original marketing page for Card Studio using the page patterns and `NavBar`; Card Studio gets a 4-step onboarding; the playground's docs shell moves onto `NavBar`.

**Accept:** onboarding compared frame-by-frame with `reference/motion/`; menu morph and card → modal compared with the local choreography strips (behavior, not look); matrix green. `NavBar`: Playwright samples the panel per frame and reports open, switch and close times against MOTION_SPEC §4.1, and the panel never paints over the bar's items or overflows the viewport at 390, 960 and 1440; side-by-side frames against `reference/inspiration-nav/` with the differences listed.

## Phase 6B — App kit
Everything a dashboard-style app needs, so building one is composing parts. Specs: DESIGN_SPEC §6, MOTION_SPEC §3 "App chrome", LAYOUT_RULES §3. Structure, density and timing come from `reference/inspiration-dashboard/` (local only); the look is buttery's, and the demo's domain, names, copy and data are original.
- Tokens first: the widths, `--bt-h-table-row`, `title-lg` and `title-md`, `chart-1`…`chart-5`, `--bt-dur-shimmer`, `--bt-delay-submenu` and `--bt-delay-loading`, with their contrast pairs.
- Shell: `AppShell layout="sidebar"`; `Sidebar` (workspace switcher, `Sidebar.Item`, `Sidebar.Section`, `Sidebar.Group` that collapses, the automatic Recent section, a More group; a rail under 1100, a sheet under 640); `TopBar` (search, actions with a notification dot, a round create button); `AppPage` (`width` contained or full, `aside`, `fill`, `AppPage.Section`).
- Page header: `PageHeader` (title, inline value, info tooltip, actions), `Button shortcut` with a `Kbd` inside, underline `Tabs` on a `SharedIndicator`, `QuickActions`, `ViewToggle`.
- Data: `DataTable` (selection, sortable headers, `DataTable.Amount` with a secondary currency, `DataTable.Id` in mono with a tooltip, row hover, row actions, sticky header and first column, skeleton rows, pagination, no-results row with Clear all, `size="compact"`), `StatusBadge`, `SavedViews`, `SearchField`, `FilterBar` and `FilterPill`, `ColumnSettings`, `StatTabs`, `GroupedList`.
- Overview: `MetricCard`, `DateRangeBar`; `LineChart`, `AreaChart`, `BarChart` and `Sparkline` drawn in SVG in-house, with a crosshair, points and a tooltip that follows the pointer and flips at the edges. No chart library unless one is truly needed, and then logged in DECISIONS first.
- Guidance: `Banner` (time estimate, dismiss), `RecommendationCard`, `SetupGuide` (bottom-end lane, progress, Next, expand, dismiss, remembered), `FeatureIntro`, `EmptyState` with `icon` and `docs`, `LoadingPill`, `NotificationNudge` and `IconButton dot`.
- Menus and dialogs: `Menu` submenus (`Menu.Sub`, pointer grace, `--bt-delay-submenu`) and `entrance="instant"` on `Menu` and `Popover`; `AccountMenu`; `Avatar` and `InitialsTile`; `ChoiceDialog` and `AnnouncementDialog` on Phase 6's `Dialog`; `SettingsIndex`.
- Lanes: the bottom lanes stack into one column when they'd touch, `--bt-lane-clearance`, and bottom-pinned bars as obstacles.
- Demo: an original dashboard in the playground for a fictional coffee roaster (orders, subscriptions, customers, payouts, settings) on deterministic fake data from a seeded generator, using every App kit part: an overview with metric cards and charts, an orders table with saved views, filters and column settings, a customer detail page with a right rail, a settings index, the setup guide, an announcement and a nudge.

**Settings, search and panels.** Added before the gate, from a second set of local references of the same dashboard (`reference/inspiration-settings/`): structure, behavior and timing only, buttery's look, original demo content. Specs: LAYOUT_RULES §3 "App pages", MOTION_SPEC §3 "Settings, search and panels", DESIGN_SPEC §6.
- Page grammar for every app page: breadcrumbs (only when nested), the title row (title, an optional `ScopeBadge` with an info button, actions at the end), an optional one-line description, optional tabs, then content. Sections aren't cards; cards hold objects. One primary button per region, checked by `expectButtery`. Widths `--bt-w-app-page` (1280) for index and table pages, `--bt-w-app-page-md` (960) for settings detail pages, `--bt-w-app-page-sm` (820) for dense forms and preference matrices. Sections load on their own. Save stays disabled until something changes. Pages end with a hairline and an optional small footer.
- `CommandSearch`: the top bar's field (360 at rest, 600 focused, widening on `spring.smooth`) and a panel as wide as the field, anchored under it, scrolling inside a maximum height with a steady minimum. An empty query lists filters you can type (a key chip, an example value, a description at the end), recent searches and a link to every filter; typing shows grouped results (filters, pages with their path, the app's own groups, help), 3 to 5 per group, only groups with results, matched characters highlighted, and a link to a `SearchResults` page. `key:value` filters with typed suggestions; Tab completes a key and a finished token becomes a chip in the field. Local sources answer in the same frame; remote ones are debounced 120ms, keep their last results until new ones arrive and show a spinner row only in their own group. No results keeps the panel's size. `/` and ⌘K focus it; arrows move across groups; Enter opens; Escape clears, then closes. ARIA combobox and listbox with `aria-activedescendant`. API: `sources: SearchSource[]` (`{ id, label, search(query, signal), renderItem? }`, fully typed), with built-in sources for pages (from the app's nav), filters (from a schema) and recents.
- Settings: `SettingsPage`, `SettingsSection` (heading, description, action, content), `SettingRow` (title, its current state under it, an action at the end); `PreferencesMatrix` (tabs, groups, a checkbox column per channel with its header repeated per group, locked cells, row hover); `HoverActions` (a row shows its hidden actions and an accent bar at its start on hover and on keyboard focus); `SettingsIndex` gets a hover background on the whole item and a dashed tile for more.
- Pages: `Breadcrumbs`, `ScopeBadge`; `DetailPage` (a main column and an aside of link lists with one primary action, the aside dropping below under 1100); `CatalogPage` (a filter column with search, category links, checkbox filters and an action; a featured block on a tinted surface; a card grid) with `TagChip` (a colored dot); `PlanComparison` (a billing-period `SegmentedControl` and a volume `Select` as one control group, plan cards with an optional ribbon tab, a price, a full-width action and an "everything in the plan before, and" checklist, then a row of other options).
- Dialogs: `FormDialog` (a header over a divider, copy with a link, a field that takes focus once the dialog has settled, Cancel and Submit disabled until valid); `RadioCardGroup` (options with descriptions, one of which can reveal a nested field); `ConsequenceDialog` (icon rows each with a heading and body, a divider, small terms, a full-width primary); `FullscreenDialog` with `OptionTiles` (checkbox tiles, the chosen ones with an accent border, actions at the bottom end).
- `SidePanel`: docks at the end of the shell from 1280px and makes the page narrower instead of covering it; a sheet under that. Its header has an overflow menu (a destructive item in `danger`), expand and close; its body scrolls above a pinned footer slot, such as a composer.
- `SetupGuide` expanded: groups that fold, done steps checked, a footer link.
- Demo: the roaster gets settings (an index, a profile page, a team notifications matrix, plans), `CommandSearch` across its pages, orders, customers and help, and the `SidePanel` as a help panel.

**Accept:**
- Every part follows the component contract (folder, tests in Chromium and WebKit, playground page, 2–4 examples, manifest entry) and the demo is built only from what `@buttery/core` and `@buttery/react` export.
- `pnpm check` and the full matrix (`pnpm test:layout --reporter=json`) are green on every new page and on the demo, including the demo at 390, 768, 960, 1280, 1440 and 1728 with the sidebar as a sheet, a rail and full, the table scrolled sideways, and a toast and the setup guide showing together.
- Per-frame timing (Playwright sampling, as in Phase 3) against MOTION_SPEC §3 "App chrome": chrome menus complete within one frame of the press; a submenu opens 40ms (±1 frame) after the hover and is fully in by 40ms + `dur-fast`; a dialog opens in `dur-fast` (±4ms) with its scale from 0.97, and closes no slower; a sidebar group opens on `spring.snappy` (95% within 3%) and closes in `dur-fast`; skeleton → content moves no element more than 1px; the chart crosshair sits on the pointer's nearest point in the same frame as the pointer move.
- Per-frame timing against MOTION_SPEC §3 "Settings, search and panels": a dialog fades in, growing from 0.97 and rising 4px, in `dur-fast`, its first field focused once it settles, and closes in at most 120ms; a full-screen dialog closes with a `dur-fast` fade; a side panel docks in one frame with the page reflowing in that frame and its content fading in within `dur-fast`; search results change in the frame the query does, and the field widens on `spring.smooth`; a row's hover actions show within `dur-fast`.
- Side-by-side frames against `reference/inspiration-dashboard/` and `reference/inspiration-settings/` with the differences listed honestly, and a fresh reviewer's findings fixed.
- A phase report in `notes/` sent to the maintainer.

## Phase 7 — Hardening, brand and the docs site
The playground becomes buttery's docs website, built only from buttery components: `docs/DOCS_SITE.md` has the structure, the nav, the page anatomy, the landing page and the shell. Work in this order:
- Brand: original `BrandMark` per `docs/BRAND.md` (SVG component + favicon + Tauri icons + README hero). Present 3 directions first and wait for a pick.
- Docs shell and nav generation: `apps/playground` renamed `apps/docs`, its internal pages moved under `/lab` (left out of production builds, still used by Playwright); content in `apps/docs/content/<section>/<page>.mdx` (or `.tsx`) with frontmatter; the nav generated from it; a docs check in `pnpm check` for missing metadata, an `order` shared within a section, broken internal links and exports with no home in `DOCS_SITE.md`.
- Existing pages moved into the structure: Get started, Foundations, Layout and Motion first.
- Component pages with the full anatomy and working examples (`DOCS_SITE.md` "Examples"): each a real file with its imports, real state, a caption and a `play` script, at least basic, controlled, variants and sizes, states and one real composition per page, the demo's prop controls really changing the component; their demos and code blocks rendered from the packages' `examples/`, the props table generated from the types and JSDoc; and the example and coverage checks.
- **Patterns, Templates and Guides**, then Tools and Resources.
- Demos as their own sites: each demo moved to `apps/demos/<name>/`, served at `/demos/<name>/` without the docs' chrome, with the floating docs pill, deep links, local state with "Reset demo", and a `/demos` page; each built from its template plus demo content.
- Search (`DOCS_SITE.md` "Search"): `CommandSearch` over an index generated at build time, offline, with synonyms, grouped results, a preview pane, `/search?q=` and the golden queries in `tests/search-golden.ts`.
- Writing and Markdown: `docs/WRITING.md`, every page served as Markdown at its path plus `.md` with a copy button, then the comprehension and agent tests per group of pages.
- **The landing page**, with What's new read from Changesets and `content/whats-new/`.
- **Static build:** `pnpm docs:build` prerenders every public route and the demos into one output and writes `sitemap.xml` (`@mdx-js/rollup`, `shiki` and `minisearch` approved if needed; the prerenderer is the smallest maintained option, logged in DECISIONS); the deploy target goes in NEEDS-YOU with a recommendation.
- Alongside: an accessibility audit (axe + a manual keyboard pass), dark-mode tuning, a compact density pass and visual-regression baselines, across the site's pages; all public-facing prose rewritten in plain voice per the authorship section of `AGENTS.md` as it moves into the site, then the prose checks extended to `docs/` and the site's content; `new-app` finished and tested; Changesets configured.
- Last: test the `make-it-buttery` skill on a deliberately plain, messy page (before/after + `expectButtery` results), then the full matrix and a reviewer who reads the site cold as a new user.

**Accept:**
- `pnpm new-app demo` is buttery out of the box and passes the matrix with zero changes.
- Every public docs route passes `expectButtery` across the full matrix in Chromium and WebKit.
- The nav is generated: a new content file with frontmatter shows up in its section, in its order, with no other edit. The docs check fails, saying how to fix it, on a page missing metadata, two pages sharing an `order` in a section, a broken internal link and an export with no home, each shown by a fixture under `/lab`.
- Every component page has the eleven parts of `DOCS_SITE.md` in order (a test walks every component page), and every demo and code block comes from an `examples/` file.
- Every example typechecks and lints, renders in Chromium and WebKit with no console errors or warnings, runs its `play` script, passes axe and `expectButtery` on its frame in light, dark, compact and reduced motion, changes what renders when each prop control changes, and builds when pasted into a fresh starter app. The build fails on an `@buttery/react` export without a docs page, an exported prop without JSDoc, a link to a missing route or heading, or a component page with fewer than the required examples.
- Search: every query in `tests/search-golden.ts` (at least 40) finds its expected result in the top three, checked in `pnpm check`; results change in the frame the query does once the index is loaded; the index loads in under 200ms on a normal connection; it all works offline and in the desktop app.
- Every page is served as Markdown at its path plus `.md`. For each group of pages, a reviewer reading a page cold answers three questions about it correctly, and a fresh agent given only a component's `.md` page builds a small feature with it that typechecks and passes `expectButtery`.
- Each demo runs on its own (`pnpm --filter demo-<name> dev`) and inside the site at `/demos/<name>/`, passes the full matrix, runs its end-to-end flows from earlier phases, and logs no console errors.
- `pnpm docs:build` writes prerendered HTML for every public route and a `sitemap.xml`, with no `/lab` route in the output, while Playwright still reaches `/lab` in development.
- The landing page, the shell and search behave as `DOCS_SITE.md` describes, measured against MOTION_SPEC where they move.
- A fresh reviewer reading the site cold answers "could you build an app from this?" with yes, and their findings are fixed.
- A phase report in `notes/` sent to the maintainer.

## Phase 8 — Developer & agent experience
Everything in `docs/DX_AND_AI.md`:
- Generated `manifest.json`, `tokens.json`, `llms.txt`, `llms-full.txt`; docs and examples shipped inside the packages. `llms.txt`, `llms-full.txt`, `manifest.json` and the MCP server's resources are generated from the docs site's content (`docs/DOCS_SITE.md`), so the site and agents share one source; `llms.txt` links to the pages' `.md` versions, and the MCP server gets a `search_docs` tool that uses the docs search's index.
- Dev warnings with fixes and docs links; `.vscode/buttery.code-snippets`.
- `buttery` CLI: `create-buttery` (with `--template blank|dashboard|editor|marketing`), `init` (idempotent; appends a delimited section to an existing `AGENTS.md`), `add <pattern>`, `add page table|detail|overview|settings|settings-index|catalog|plans|search-results|empty|feature-intro` (every page kind follows the page grammar in LAYOUT_RULES §3, and the dashboard template includes them all), `create component <Name>`, `doctor`, `check [--json]`, `migrate` (skeleton).
- Make any app: `LayoutGuard`, `buttery check` and `@buttery/lint` work on user code as they do on buttery's; every template and every `add page` output passes `buttery check` with zero edits.
- Guides: "Build an app in 15 minutes" and "Build your own buttery component" (a `Stepper`, built only from public parts: `Control`, `Pressable`, `SharedIndicator`, `variants()`, `useControllableState`), published as docs-site pages. The site's Tools pages document the CLI and the MCP server with real output.
- `@buttery/mcp` (stdio) with the tools in DX_AND_AI §3, `scaffold_page` and `scaffold_component` among them, plus configs for the coding agents listed there, verified against each tool's current docs.
- Agent eval (DX_AND_AI §6) with the agents listed there, including "build a filtered table page" and "create a custom component that matches buttery"; results in `docs/AGENT_EVAL.md`; fix the top failure causes.

**Accept:** in a fresh folder, `npx create-buttery eval-app` (via local tarballs) → each agent completes the eval tasks; `buttery check --json` pass rate recorded; top issues fixed and re-run. Each template (`blank`, `dashboard`, `editor`, `marketing`) and each `buttery add page` kind passes `buttery check` and the lint configs with zero edits; a component made with `buttery create component` passes the component contract and `expectButtery` untouched.
