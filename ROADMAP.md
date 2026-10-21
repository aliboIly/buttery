# 🧈 buttery — Roadmap

Tick boxes as work lands (agents do this too). Details and acceptance criteria per phase: `docs/BUILD_PLAN.md`.

**Now:** Phase 5 (inspector and app patterns) is done, and the App kit is in the plan (specs, Phase 6B, v0.7). Next: Phase 6 (overlays and choreography), then Phase 6B. The public-kit rule is in place.

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
- [ ] Dialog, Onboarding (StepDialog), PageDots
- [ ] NavBar (static, sticky, auto-hide) + MorphMenu, SubNav
- [x] Bento + ExpandableCard
- [x] Page patterns: SplitHero, CenteredHero (with the hero assembly), StatStrip, LogoStrip, ArticleLayout, Footer
- [ ] Card Studio marketing page + onboarding; NavBar in the playground's docs shell

## v0.7 — App kit (Phase 6B)
- [ ] App kit tokens (widths, table row height, `title-lg`/`title-md`, chart colors, shimmer and delays)
- [ ] Shell: `AppShell layout="sidebar"`, `Sidebar` (groups, Recent, More, rail, sheet), `TopBar`, `AppPage` (contained/full, right rail, fill)
- [ ] Page header: `PageHeader`, `Button shortcut`, underline `Tabs`, `QuickActions`, `ViewToggle`
- [ ] Data: `DataTable`, `StatusBadge`, `SavedViews`, `SearchField`, `FilterBar`, `ColumnSettings`, `StatTabs`, `GroupedList`
- [ ] Overview: `MetricCard`, `DateRangeBar`, in-house `LineChart`, `AreaChart`, `BarChart`, `Sparkline`
- [ ] Guidance: `Banner`, `RecommendationCard`, `SetupGuide`, `FeatureIntro`, `EmptyState` icon + docs, `LoadingPill`, `NotificationNudge`
- [ ] Menus and dialogs: `Menu` submenus and instant entrance, `AccountMenu`, `Avatar`/`InitialsTile`, `ChoiceDialog`, `AnnouncementDialog`, `SettingsIndex`
- [ ] Lanes shared by toasts and the setup guide, `--bt-lane-clearance`
- [ ] Coffee roaster dashboard demo (original), passes the full matrix; app-chrome timing measured per frame

## v0.9 — Hardening & brand (Phase 7)
- [ ] Accessibility audit, dark + compact passes, visual regression baselines
- [ ] Docs pages in the playground (props, examples, do/don't)
- [ ] 🧈 Original BrandMark (3 directions → pick one) + favicon + app icons + README hero
- [ ] `new-app` finished; Changesets
- [ ] make-it-buttery skill tested on a messy page

## v1.0 — Developer & agent experience (Phase 8)
- [ ] `manifest.json`, `tokens.json`, `llms.txt`, docs + examples shipped in packages
- [ ] Dev warnings with fixes; VS Code snippets
- [x] Public kit: components use only what users can import (`Surface`, `Pressable`, `Field`, `Control`, `SharedIndicator`, `Presence`, `Morph`, the layers, `useControllableState`, `useButteryTransition`, `variants()`), enforced by the contract test
- [ ] CLI: `create-buttery` (`--template blank|dashboard|editor|marketing`), `init`, `add` (and `add page table|detail|overview|settings|empty|feature-intro`), `create component`, `doctor`, `check`, `migrate`
- [ ] Make any app: `LayoutGuard`, `buttery check` and the lint configs on user code; every template and `add page` passes `buttery check` with zero edits
- [ ] Guides: "Build an app in 15 minutes" and "Build your own buttery component" (a Stepper)
- [ ] `@buttery/mcp` (with `scaffold_page` and `scaffold_component`) + configs for the common coding agents (`docs/DX_AND_AI.md`)
- [ ] Agent eval run (including a filtered table page and a custom component) + top issues fixed
- [ ] npm org `buttery` claimed (or own scope chosen); first publish

## Later (ideas, not commitments)
- [ ] Docs site deployed from the playground
- [ ] More patterns: command palette (⌘K), file browser, chat
- [ ] Next.js / SSR support
- [ ] Figma library generated from tokens
