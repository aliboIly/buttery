# 🧈 buttery — Roadmap

Tick boxes as work lands (agents do this too). Details and acceptance criteria per phase: `docs/BUILD_PLAN.md`.

**Now:** Phase 6B (the App kit): the verification fixes are landing, and settings, search and panels (from a second set of dashboard references) joined the phase before its gate. Then the gate (full checks, comparisons, review, push), Phase 7 (hardening and brand) and Phase 8 (developer and agent experience). The public-kit rule is in place.

---

## v0.1 — Foundation (Phases 0–1)
- [x] Agent files merged (`AGENTS.md` ← `AGENTS.buttery.md`), `CLAUDE.md` import, `.gemini/settings.json`
- [x] Monorepo, tooling, scripts, VS Code tasks
- [x] Playground + starter running on web; starter running as a desktop app
- [x] All tokens (light, dark, compact) + `tokens.json` + contrast test
- [x] Recipes, `ButteryProvider`, `createTheme`, palettes, Tailwind bridge
- [x] Tokens + Surfaces playground pages

## v0.2 — Guardrails (Phase 2)
- [x] Layout primitives + layer system
- [x] `expectButtery` (all checks, JSON reports, Chromium + WebKit)
- [x] `LayoutGuard` + grid overlay
- [x] `@buttery/lint` enforced repo-wide
- [x] `new-component` generator

## v0.3 — Motion (Phase 3)
- [x] Motion tokens, presets, `useButteryTransition`
- [x] `Morph`, `Presence`, `SharedIndicator`, `Reveal`, `Stagger`, `Loop`, `Confetti`
- [x] `buttery` factory (`buttery.div`, `buttery(Component)`)
- [x] Settle times verified against the spec

## v0.4 — Controls (Phase 4)
- [x] Button family, IconButton, SplitButton, with the forward/back arrow shared with ArrowLink
- [x] SegmentedControl, Slider + ValueBadge, Chip, NumberField
- [x] Tooltip, Kbd, ArrowLink
- [x] Compare page vs references

## v0.4.5 — Forms and text (Phase 4.5)
- [x] TextField, PasswordField, TextArea, Field
- [x] Checkbox, Switch, Callout
- [x] TextStack
- [x] SignInForm and SignUpForm patterns, with an original sign-in demo page

## v0.5 — App patterns (Phase 5)
- [x] SwatchGrid, ColorDot, TiltPad, AnchorGrid
- [x] Toast (`toast()` and `Toaster`, built early)
- [x] Menu, Select, FloatingToolbar
- [x] EmptyState/DropZone, Stage, Inspector, HeaderBar, AppShell
- [x] Card Studio demo (original), passes the full matrix at every size

## v0.6 — Choreography (Phase 6)
- [x] Dialog, Onboarding (a step dialog), PageDots
- [x] NavBar (static, sticky, auto-hide) + MorphMenu, SubNav
- [x] Bento + ExpandableCard
- [x] Page patterns: SplitHero, CenteredHero (with the hero assembly), StatStrip, LogoStrip, ArticleLayout, Footer
- [x] Card Studio marketing page + onboarding; NavBar in the playground's docs shell

## v0.7 — App kit (Phase 6B)
- [x] App kit tokens (widths, table row height, `title-lg`/`title-md`, chart colors, shimmer and delays)
- [x] Shell: `AppShell layout="sidebar"`, `Sidebar` (groups, Recent, More, rail, sheet), `TopBar`, `AppPage` (contained/full, right rail, fill)
- [x] Page header: `PageHeader`, `Button shortcut`, underline `Tabs` (and `TabNav` for pages), `QuickActions`, `ViewToggle`
- [x] Data: `DataTable`, `StatusBadge`, `SavedViews`, `SearchField`, `FilterBar`, `ColumnSettings`, `StatTabs`, `GroupedList`
- [x] Overview: `MetricCard`, `DateRangeBar`, in-house `LineChart`, `AreaChart`, `BarChart`, `Sparkline`
- [x] Guidance: `Banner`, `RecommendationCard`, `SetupGuide`, `FeatureIntro`, `EmptyState` icon + docs, `LoadingPill`, `NotificationNudge`
- [x] Menus and dialogs: `Menu` submenus and instant entrance, `AccountMenu`, `Avatar`/`InitialsTile`, `ChoiceDialog`, `AnnouncementDialog`, `SettingsIndex`
- [x] Lanes shared by toasts and the setup guide, `--bt-lane-clearance`
- [ ] Page grammar for app pages (LAYOUT_RULES §3): order, sections that aren't cards, one primary button per region (checked), the 960 and 820 widths, section-level loading, a page footer
- [ ] `CommandSearch`: the top bar's field and panel, typed sources (pages, filters, recents, the app's own), `key:value` filters, a `SearchResults` page
- [ ] Settings: `SettingsPage`, `SettingsSection`, `SettingRow`, `PreferencesMatrix`, `HoverActions`; `SettingsIndex` hover and its "more" tile
- [ ] Pages: `Breadcrumbs`, `ScopeBadge`, `DetailPage`, `CatalogPage` with `TagChip`, `PlanComparison`
- [ ] Dialogs: `FormDialog`, `RadioCardGroup`, `ConsequenceDialog`, `FullscreenDialog` with `OptionTiles`
- [ ] `SidePanel`: docked beside the page from 1280, a sheet under it
- [ ] `SetupGuide` expanded: groups that fold, done steps checked, a footer link
- [ ] Coffee roaster dashboard demo (original), passes the full matrix; app-chrome timing measured per frame; settings (index, profile, team notifications, plans), search across the demo and a help panel

## v0.9 — Hardening, brand & docs site (Phase 7)
- [ ] 🧈 Original BrandMark (3 directions → pick one) + favicon + app icons + README hero
- [ ] Docs site shell (`docs/DOCS_SITE.md`): `apps/docs` with `/lab`, the nav generated from frontmatter, the docs check in `pnpm check`
- [ ] Existing pages moved in (Get started, Foundations, Layout, Motion first); component pages with the full anatomy and working examples (each with a `play` script), and the example and coverage checks
- [ ] Patterns, Templates, Guides, Tools and Resources pages
- [ ] Demos as their own sites in `apps/demos/<name>/`, served at `/demos/<name>/`, with a `/demos` page
- [ ] Docs search: an offline index built from the content, synonyms, a preview pane, `/search`, and the golden-query gate
- [ ] `docs/WRITING.md`, every page as Markdown (`.md`), the comprehension and agent tests
- [ ] Docs landing page (What's new from Changesets)
- [ ] `pnpm docs:build`: prerendered routes and a sitemap; deploy target recommended in NEEDS-YOU
- [ ] Accessibility audit, dark + compact passes, visual regression baselines
- [ ] `new-app` finished; Changesets
- [ ] make-it-buttery skill tested on a messy page; the site read cold by a reviewer

## v1.0 — Developer & agent experience (Phase 8)
- [ ] `manifest.json`, `tokens.json`, `llms.txt`, docs + examples shipped in packages, generated with the MCP resources from the docs site's content
- [ ] Dev warnings with fixes; VS Code snippets
- [x] Public kit: components use only what users can import (`Surface`, `Pressable`, `Field`, `Control`, `SharedIndicator`, `Presence`, `Morph`, the layers, `useControllableState`, `useButteryTransition`, `variants()`), enforced by the contract test
- [ ] CLI: `create-buttery` (`--template blank|dashboard|editor|marketing`), `init`, `add` (and `add page table|detail|overview|settings|settings-index|catalog|plans|search-results|empty|feature-intro`, all of them in the dashboard template), `create component`, `doctor`, `check`, `migrate`
- [ ] Make any app: `LayoutGuard`, `buttery check` and the lint configs on user code; every template and `add page` passes `buttery check` with zero edits
- [ ] Guides: "Build an app in 15 minutes" and "Build your own buttery component" (a Stepper); Tools pages for the CLI and MCP with real output
- [ ] `@buttery/mcp` (with `scaffold_page`, `scaffold_component` and `search_docs` on the docs search's index) + configs for the common coding agents (`docs/DX_AND_AI.md`)
- [ ] Agent eval run (including a filtered table page and a custom component) + top issues fixed
- [ ] npm org `buttery` claimed (or own scope chosen); first publish

## Later (ideas, not commitments)
- [ ] Docs site deployed from the playground
- [ ] More patterns: command palette (⌘K), file browser, chat
- [ ] Next.js / SSR support
- [ ] Figma library generated from tokens
