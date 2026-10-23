# 🧈 buttery — Roadmap

Tick boxes as work lands (agents do this too). Details and acceptance criteria per phase: `docs/BUILD_PLAN.md`.

## Now / Next

Kept up to date as items finish.

**Now**, finishing Phase 7's open items:
- In progress: a modular catalog component, with the shop's coffees rebuilt on it
- Up next in this phase: style options (`variant`, `size`, `layout`) for the main controls, badges and page patterns
- Then the Phase 7 gate (`pnpm check` and the full layout matrix), `v0.9.0` and its release, and the phase report

Done since the last update: a right-click `ContextMenu` that also opens from the keyboard, on Deckhand's slides; a `Sheet` (a side panel on a laptop, a drawer on a phone) with the shop's bag on it and `/bag` and `/checkout` pages; an `Accordion` and an `Faq` pattern with the shop's questions on them; `NavBar`'s pinned actions; `OverflowCluster` refitting when its gap or size changes; Deckhand's big numbers kept to one line; core and react published one module per file. Earlier: the docs went live at https://aliboily.github.io/buttery/, and `v0.1.0` to `v0.8.0` are GitHub releases.

**Next**, in order:
1. `@buttery/mcp`: designed from the research, built, tested on both protocol versions, and measured with an evaluation that compares agents with and without it
2. npm, as `@butteryui/*` (`@buttery` belongs to another project; the `butteryui` org is set up): the repo renamed as soon as the open work above has merged, then `@butteryui/core`, `react`, `test` and `lint` published as 0.9.0; `@butteryui/mcp` and `create-buttery` follow when they're built. A rehearsal already packed the four packages and built a fresh app from them
3. The sign-in flow: an identifier field, a one-time code field, an `AuthFlow` pattern with a `useOtpFlow` hook, its docs page, `buttery add page sign-in`, and sign-in screens in the dashboard template and the roastery demo
4. Everything else that's left: the rest of 1.0 below, and the follow-ups the demos turned up

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

## v0.5 — Forms and text (Phase 4.5)
- [x] TextField, PasswordField, TextArea, Field
- [x] Checkbox, Switch, Callout
- [x] TextStack
- [x] SignInForm and SignUpForm patterns, with an original sign-in demo page

## v0.6 — App patterns (Phase 5)
- [x] SwatchGrid, ColorDot, TiltPad, AnchorGrid
- [x] Toast (`toast()` and `Toaster`, built early)
- [x] Menu, Select, FloatingToolbar
- [x] EmptyState/DropZone, Stage, Inspector, HeaderBar, AppShell
- [x] Card Studio demo (original), passes the full matrix at every size (Deckhand replaced it in 0.9)

## v0.7 — Choreography (Phase 6)
- [x] Dialog, Onboarding (a step dialog), PageDots
- [x] NavBar (static, sticky, auto-hide) + MorphMenu, SubNav
- [x] Bento + ExpandableCard
- [x] Page patterns: SplitHero, CenteredHero (with the hero assembly), StatStrip, LogoStrip, ArticleLayout, Footer
- [x] Card Studio marketing page + onboarding; NavBar in the playground's docs shell (the Halfmoon shop replaced the page in 0.9)

## v0.8 — App kit (Phase 6B)
- [x] App kit tokens (widths, table row height, `title-lg`/`title-md`, chart colors, shimmer and delays)
- [x] Shell: `AppShell layout="sidebar"`, `Sidebar` (groups, Recent, More, rail, sheet), `TopBar`, `AppPage` (contained/full, right rail, fill)
- [x] Page header: `PageHeader`, `Button shortcut`, underline `Tabs` (and `TabNav` for pages), `QuickActions`, `ViewToggle`
- [x] Data: `DataTable`, `StatusBadge`, `SavedViews`, `SearchField`, `FilterBar`, `ColumnSettings`, `StatTabs`, `GroupedList`
- [x] Overview: `MetricCard`, `DateRangeBar`, in-house `LineChart`, `AreaChart`, `BarChart`, `Sparkline`
- [x] Guidance: `Banner`, `RecommendationCard`, `SetupGuide`, `FeatureIntro`, `EmptyState` icon + docs, `LoadingPill`, `NotificationNudge`
- [x] Menus and dialogs: `Menu` submenus and instant entrance, `AccountMenu`, `Avatar`/`InitialsTile`, `ChoiceDialog`, `AnnouncementDialog`, `SettingsIndex`
- [x] Lanes shared by toasts and the setup guide, `--bt-lane-clearance`
- [x] Page grammar for app pages (LAYOUT_RULES §3): order, sections that aren't cards, one primary button per region (checked), the 960 and 820 widths, section-level loading, a page footer
- [x] `CommandSearch`: the top bar's field and panel, typed sources (pages, filters, recents, the app's own), `key:value` filters, a `SearchResults` page
- [x] Settings: `SettingsPage`, `SettingsSection`, `SettingRow`, `PreferencesMatrix`, `HoverActions`; `SettingsIndex` hover and its "more" tile
- [x] Pages: `Breadcrumbs`, `ScopeBadge`, `DetailPage`, `CatalogPage` with `TagChip`, `PlanComparison`
- [x] Dialogs: `FormDialog`, `RadioCardGroup`, `ConsequenceDialog`, `FullscreenDialog` with `OptionTiles`
- [x] `SidePanel`: docked beside the page from 1280, a sheet under it
- [x] `SetupGuide` expanded: groups that fold, done steps checked, a footer link
- [x] Coffee roaster dashboard demo (original), passes the full matrix; app-chrome timing measured per frame; settings (index, profile, team notifications, plans), search across the demo and a help panel

## v0.9 — Hardening, brand and docs site (Phase 7)
> This site, built only from buttery, with a page for every component, examples to try and search that works offline, and the fixes that writing it turned up.

- [x] 🧈 The logo is the 🧈 character, in the docs' header, the favicons and the README (a drawn `BrandMark` came first and was retired)
- [x] Docs site shell (`docs/DOCS_SITE.md`): `apps/docs` with `/lab`, the nav generated from frontmatter, the docs check in `pnpm check`
- [x] Existing pages moved in (Get started, Foundations, Layout, Motion first); component pages with the full anatomy and working examples (each with a `play` script), and the example and coverage checks
- [x] Patterns, Templates, Guides, Tools and Resources pages
- [x] Demos as their own sites in `apps/demos/<name>/`, served at `/demos/<name>/`, with a `/demos` page
- [x] Docs search: an offline index built from the content, synonyms, a preview pane, `/search`, and the golden-query gate
- [x] `docs/WRITING.md`, every page as Markdown (`.md`), the comprehension and agent tests
- [x] Docs landing page (What's new from Changesets)
- [x] `pnpm docs:build`: prerendered routes and a sitemap; deploy target recommended in NEEDS-YOU
- [x] Accessibility audit, dark + compact passes, visual regression baselines
- [x] `new-app` finished; Changesets
- [x] make-it-buttery skill tested on a messy page; the site read cold by a reviewer
- [x] Three more layout checks in `expectButtery` and `LayoutGuard`: text crowding the line under it, a word broken across lines, and controls out of line, including an icon off its button's center or off the line of text beside it
- [x] Introduction rebuilt: a theme playground, feature cards with live parts, the newest release's examples, and the Get started path
- [x] Releases numbered one minor per phase, 0.1 to 0.9; What's new as release notes with examples to try, and the Roadmap page read from this file
- [x] Get started rebuilt, with blocks for written pages: numbered steps, cards, rules, do and don't, notes, related pages, and previous and next as cards
- [x] Every written page laid out in those blocks, so none reads as a wall of text
- [x] Deckhand, a slide editor, and the Halfmoon shop, the roastery's online store, replace Card Studio and its site as the editor and marketing demos
- [x] `Sheet`, a side panel on a laptop and a drawer on a phone, with the shop's bag on it and pages of its own for the bag and checkout
- [x] `Accordion` and the `Faq` pattern (groups, a search, deep links, three layouts), with the shop's questions on them
- [ ] GitHub releases: `v0.1.0` to `v0.9.0` tagged, each with its notes from What's new, and a workflow that publishes the release for each `v*` tag pushed
- [x] The docs deployed to GitHub Pages, at https://aliboily.github.io/buttery/

## v1.0 — Developer and agent experience (Phase 8)
> buttery on npm, a command line tool that starts, extends and checks apps, and an MCP server so coding agents can look components up instead of guessing.

- [ ] `manifest.json`, `tokens.json`, `llms.txt`, and the docs and examples shipped in the packages, generated with the MCP server's resources from the docs site's content
- [ ] Development warnings that say how to fix what they find, and VS Code snippets
- [x] Public kit: components use only what apps can import (`Surface`, `Pressable`, `Field`, `Control`, `SharedIndicator`, `Presence`, `Morph`, the layers, `useControllableState`, `useButteryTransition` and `variants()`), enforced by the contract test
- [ ] The command line tool: `create-buttery` with `--template blank`, `dashboard`, `editor` or `marketing`; `init`; `add`, with `add page` for each page the dashboard template has (`table`, `detail`, `overview`, `settings`, `settings-index`, `catalog`, `plans`, `search-results`, `empty` and `feature-intro`); `create component`; `doctor`; `check`; and `migrate`
- [ ] Any app: `LayoutGuard`, `buttery check` and the lint configs work on an app's own code, and every template and `add page` passes `buttery check` with no edits
- [ ] Guides: "Build an app in 15 minutes" and "Build your own buttery component" (a Stepper), and Tools pages for the command line tool and the MCP server with real output
- [ ] `@buttery/mcp`, an MCP server with `scaffold_page`, `scaffold_component` and `search_docs` (on the docs search's index), and configs for the common coding agents (`docs/DX_AND_AI.md`)
- [ ] An agent evaluation, including a filtered table page and a custom component, with its top issues fixed
- [ ] A passwordless sign-in pattern: an identifier field (email or phone), a one-time code field, an `AuthFlow` with a headless `useOtpFlow` hook, a docs page, `buttery add page sign-in`, and a sign-in screen in the dashboard template and the roastery demo
- [ ] The first publish to npm, as `@butteryui/*` (the org is claimed; `@buttery` belongs to another project)

## Later (ideas, not commitments)
- [ ] More patterns: command palette (⌘K), file browser, chat
- [ ] Next.js / SSR support
- [ ] Figma library generated from tokens
