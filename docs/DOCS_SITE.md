# 🧈 buttery — the docs site

The playground becomes buttery's docs website: where a developer or a coding agent goes to learn buttery, find a component, copy an example and build an app. It's organized in a sensible order, and it's a showcase of buttery's own look, motion and layout. It's built only from buttery components (`NavBar`, `CommandSearch`, `Tabs`, `SidePanel` and the rest), with no other UI library.

It's built in Phase 7, where "docs inside the playground" already lives (`docs/BUILD_PLAN.md`). Until then the playground keeps its current structure; see "Until Phase 7" at the end.

## Structure

- `apps/playground` is renamed `apps/docs`. Its public routes are what the site ships.
- `/lab` holds internal pages: layout fixtures, the matrix targets, the compare pages and the timing tests. The nav never links to it, production builds leave it out, and Playwright still uses it.
- Content lives in `apps/docs/content/<section>/<page>.mdx`, or `.tsx` for a heavy demo. Each page starts with frontmatter: `title`, `description`, `section`, `order`, `status` (`new`, `beta`, `stable` or `deprecated`), `since` (the version it arrived in) and `related`.
- The nav is generated from that frontmatter and never maintained by hand. A check in `pnpm check` fails if a page is missing metadata, if two pages in a section share an `order`, or if an internal link is broken.
- Demos and their code blocks render from the same example files that ship in the packages (`examples/`), so the docs and the code can't drift apart.

## Navigation

The sidebar's sections and their pages, in this order.

1. Get started, a learning path read top to bottom: Introduction · Installation · Quick start (a first screen in 10 minutes) · Make anything buttery (the four levels) · Desktop apps (Tauri) · Using coding agents (`AGENTS.md`, the skill, the MCP server).
2. Foundations, in dependency order: Colors · Typography · Spacing and sizing · Radius · Elevation · Layers · Icons · Palettes · Theming (`createTheme`, dark mode, density).
3. Layout: The layout contract (the rules) · Stack, Inline and Grid · Surface and nesting · Page grid and containers · FitBox · OverflowCluster · Responsive (container queries).
4. Motion: Principles (the ten rules) · Tokens · Presets (`Presence`, `Morph`, `SharedIndicator`, `Reveal`, `Stagger`, `Loop`) · Choreography (the morph menu, card to modal, the staggered entrance) · Reduced motion.
5. Components, grouped by job and alphabetical inside each group: Actions · Inputs · Selection · Navigation · Overlays · Data display · Feedback and status. The table below assigns each one.
6. Patterns, smallest to largest: Page header · Forms · Settings pages · Detail page · Catalog page · Plans · Search and results · Data table page · Overview · Onboarding · Inspector · App shell · Marketing page.
7. Templates: a page each for `blank`, `dashboard`, `editor` and `marketing`, with a live preview, `create-buttery --template <name>` and what's inside.
8. Guides, by task: Build an app in 15 minutes · Build your own buttery component · Make an existing app buttery · Bring your brand (theming) · Check your layout (`buttery check`, `LayoutGuard`) · Accessibility.
9. Tools: CLI · MCP server · Lint configs · Testing (`expectButtery`) · VS Code.
10. Resources: What's new · Roadmap · Brand · Contributing.

## Where every export is documented

Every component, primitive and layer has one home. Component-scale parts get a component page in one of the seven groups; building blocks live in Foundations, Layout or Motion; page-scale parts are documented on their pattern's page. Names marked † arrive with Phase 6B's settings, search and panels.

| Section and group | Exports |
|---|---|
| Components › Actions | `ArrowLink`, `Button`, `Chip`, `FloatingToolbar`, `IconButton`, `InfoButton`, `Pressable`, `QuickActions`, `SplitButton` |
| Components › Inputs | `ColorPicker`, `Control`, `DateRangeBar`, `DropZone`, `Field`, `NumberField`, `PasswordField`, `SearchField`, `Slider`, `TextArea`, `TextField`, `TiltPad` |
| Components › Selection | `AnchorGrid`, `Checkbox`, `ColorDot`, `FilterBar`, `OptionTiles`†, `PreferencesMatrix`†, `RadioCardGroup`†, `SegmentedControl`, `Select`, `SwatchGrid`, `Switch`, `ViewToggle` |
| Components › Navigation | `AccountMenu`, `Breadcrumbs`†, `CommandSearch`†, `MorphMenu`, `NavBar`, `PageDots`, `SavedViews`, `SettingsIndex`, `Sidebar`, `StatTabs`, `SubNav`, `TabNav`, `Tabs`, `TopBar` |
| Components › Overlays | `AnnouncementDialog`, `ChoiceDialog`, `ConsequenceDialog`†, `Dialog`, `ExpandableCard`, `FormDialog`†, `FullscreenDialog`†, `Menu`, `NotificationNudge`, `Popover`, `SidePanel`†, `Tooltip` |
| Components › Data display | `AreaChart`, `Avatar`, `BarChart`, `ChartFrame`, `ColumnSettings`, `DataTable`, `GroupedList`, `HoverActions`†, `InitialsTile`, `Kbd`, `LineChart`, `MetricCard`, `ScopeBadge`†, `Sparkline`, `TagChip`†, `ValueBadge` |
| Components › Feedback and status | `Banner`, `Callout`, `Confetti`, `EmptyState`, `FeatureIntro`, `LoadingPill`, `RecommendationCard`, `SetupGuide`, `Skeleton`, `StatusBadge`, `Toaster` |
| Foundations | `Text` and `TextStack` (Typography), `Icon` (Icons), `Layer`, `Scrim`, `Sticky` and `FloatingLanes` (Layers) |
| Layout | `Center`, `Container`, `Divider`, `FitBox`, `Grid`, `Inline`, `OverflowCluster`, `Page`, `Section`, `Stack`, `Surface` |
| Motion | `buttery` (the motion elements), `Loop`, `Morph`, `Presence`, `Reveal`, `SharedIndicator`, `Stagger` |
| Patterns | `PageHeader` (Page header); `SignInForm`, `SignUpForm` (Forms); `SettingRow`†, `SettingsPage`†, `SettingsSection`† (Settings pages); `DetailPage`† (Detail page); `CatalogPage`† (Catalog page); `PlanComparison`† (Plans); `SearchResults`† (Search and results); `Onboarding` (Onboarding); `HeaderBar`, `Inspector`, `Stage` (Inspector); `AppPage`, `AppShell` (App shell); `ArticleLayout`, `Bento`, `CenteredHero`, `Footer`, `LogoStrip`, `SplitHero`, `StatStrip` (Marketing page) |

The Data table page and Overview patterns are compositions of the parts above and add no export of their own. A new export gets a row here in the change that adds it, and the docs check fails on an export that has none.

## Landing page (`/`)

- A hero: the 🧈 `BrandMark`, "Make anything buttery", a one-line description, "Get started" as the primary button with a forward arrow, "Browse components", and a copyable `npx create-buttery my-app`.
- Where to start: three cards, each with a forward-arrow link: a new app (`create-buttery`), an existing app (`buttery init`), building with a coding agent (`AGENTS.md` and the MCP server).
- What's new: the latest three releases, each with its version, date and two or three highlights, from Changesets plus a short `content/whats-new/` entry per release, and a link to the full changelog.
- A live strip of real components the visitor can touch (a segmented control, a slider, a menu, a toast) that shows the feel instead of describing it.
- Explore tiles with counts: Foundations, Layout, Motion, Components, Patterns, Templates.
- A footer: the version, GitHub, the roadmap and the brand page.
- Motion per `docs/MOTION_SPEC.md`: sections reveal once as they scroll in, the tiles stagger, and nothing plays by itself to distract.

## A component page

Every component page has the same parts in the same order.

1. Breadcrumbs, the title, a one-line description, the status badge, a "New" badge while `since` is the current minor, and a copyable import line.
2. A live demo with prop controls, theme and density toggles, and "Show code".
3. When to use it, when not to, and what to use instead.
4. Examples, from `examples/`.
5. Anatomy, variants, sizes and states.
6. A props table generated from the types and their JSDoc.
7. Accessibility: a keyboard table and ARIA notes.
8. Motion: the preset it uses and what reduced motion does.
9. Layout: its sizing rules, truncation and hit areas.
10. Related components.
11. Previous and next links in nav order, "Edit this page", and when it was last updated.

Guides and foundations pages use the same shell without the component-only parts.

## The shell

- Three columns: the nav on the left (240 wide, groups that fold, the current page highlighted and scrolled into view, scrolling on its own), the content (prose at most 720 wide, demos wider when they need it), and an "On this page" list with scroll-spy on the right from 1280px. Under 1100 the list hides; under 768 the nav becomes a sheet.
- A top bar: the `BrandMark`, links to the sections, `CommandSearch` (⌘K) across pages, components, props and tokens, the version, a theme toggle and GitHub.
- Anchors on headings, copy buttons on code, and syntax highlighting done at build time.
- Every docs page passes `expectButtery` across the full matrix, like the rest of buttery. The docs site is buttery's biggest dogfood test.

## Build and deploy

- `pnpm docs:build` writes prerendered HTML for every public route, and a `sitemap.xml`.
- Approved if they're needed: `@mdx-js/rollup` and `shiki`. For static prerendering, use the smallest maintained option and log the choice in `docs/DECISIONS.md`.
- Where it's deployed is the maintainer's call. When Phase 7 gets there, it goes in `notes/NEEDS-YOU.md` with a recommendation.

## Order of work in Phase 7

`BrandMark`, then the docs shell and nav generation, then the existing pages moved into the structure (Get started, Foundations, Layout and Motion first), then component pages with the full anatomy, then Patterns, Templates and Guides, then the landing page, then search, and last the full matrix and a reviewer who reads the site cold as a new user and answers "could you build an app from this?".

## Where today's playground pages go

| Today | On the site |
|---|---|
| A component page (a `*.meta.ts` with its `*.playground.tsx` and `examples/`) | Its component page, in the group the table above gives it |
| Tokens, Surfaces, Levels, Palettes, Text stacks | Foundations (Colors, Elevation, Palettes, Typography and the rest) |
| Motion | Motion |
| Card Studio, the Card Studio site, Halfmoon Roastery | Live previews on the `editor`, `marketing` and `dashboard` template pages |
| Compare, and the routes only tests visit | `/lab` |

## Phase 8

`llms.txt`, `llms-full.txt`, `manifest.json` and the MCP server's resources are generated from the same docs content, so the site and agents share one source. The Tools pages document the CLI and the MCP server with real output.

## Until Phase 7

Two habits keep the move mechanical. Nothing that exists is moved or restructured before Phase 7.

- Every new playground page carries page metadata: `section`, `title`, `description`, `order`, `status` and `since`. A new component's `*.playground.tsx` exports it as `page`, next to its `demos`.
- Test fixtures, pages broken on purpose and anything that reads `reference/` go under `/lab`.
