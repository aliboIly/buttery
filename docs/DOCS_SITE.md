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
| Resources › Brand | `BrandMark` |
| Patterns | `PageHeader` (Page header); `SignInForm`, `SignUpForm` (Forms); `SettingRow`†, `SettingsPage`†, `SettingsSection`† (Settings pages); `DetailPage`† (Detail page); `CatalogPage`† (Catalog page); `PlanComparison`† (Plans); `SearchResults`† (Search and results); `Onboarding` (Onboarding); `HeaderBar`, `Inspector`, `Stage` (Inspector); `AppPage`, `AppShell` (App shell); `ArticleLayout`, `Bento`, `CenteredHero`, `Footer`, `LogoStrip`, `SplitHero`, `StatStrip` (Marketing page) |

The Data table page and Overview patterns are compositions of the parts above and add no export of their own. A new export gets a row here in the change that adds it, and the docs check fails on an export that has none. An export of `@buttery/react` from outside a component's folder, such as `ButteryProvider` or the shared form parts, is listed in the `exports` frontmatter of the written page that describes it.

## Landing page (`/`)

- A hero: the 🧈 `BrandMark`, "Make anything buttery", a one-line description, "Get started" as the primary button with a forward arrow, "Browse components", and a copyable `npx create-buttery my-app` (`pnpm new-app my-app` until `create-buttery` is published).
- Where to start: three cards, each with a forward-arrow link: a new app (`create-buttery`), an existing app (`buttery init`), building with a coding agent (`AGENTS.md` and the MCP server). Until the CLI and the MCP server exist, the cards name `pnpm new-app`, the existing-app guide, and `AGENTS.md` with the make-it-buttery skill.
- What's new: the latest three releases, each with its version, date and two or three highlights, from Changesets plus a short `content/whats-new/` entry per release, and a link to the full changelog. Each entry is `content/whats-new/<version>.md`, with `version`, `date` and `title` in its frontmatter and its highlights as `- ` lines; Resources › What's new lists every entry with the changes each package's `CHANGELOG.md` gives its version. The docs check fails on an entry without two or three highlights and on a changelog version without an entry.
- A live strip of real components the visitor can touch (a segmented control, a slider, a menu, a toast) that shows the feel instead of describing it.
- Explore tiles with counts: Foundations, Layout, Motion, Components, Patterns, Templates, each counted from the nav and opening the section's first page. A section with no pages yet has no tile.
- A footer: the version, GitHub, the roadmap and the brand page.
- Motion per `docs/MOTION_SPEC.md`: sections reveal once as they scroll in, the tiles stagger, and nothing plays by itself to distract.

## A component page

Every component page has the same parts in the same order.

1. Breadcrumbs, the title, a one-line description, the status badge, a "New" badge while `since` is the current minor, and a copyable import line.
2. A live demo with prop controls, theme and density toggles, and "Show code".
3. When to use it, when not to, and what to use instead.
4. Examples, from `examples/`.
5. Anatomy, variants, sizes and states.
6. A props table generated from the types and their JSDoc, one per part, and under "Also exported" the hooks and helpers its folder exports, with their signatures and JSDoc.
7. Accessibility: a keyboard table and ARIA notes.
8. Motion: the preset it uses and what reduced motion does.
9. Layout: its sizing rules, truncation and hit areas.
10. Related components.
11. Previous and next links in nav order, "Edit this page", and when it was last updated.

Guides and foundations pages use the same shell without the component-only parts.

## The shell

- Three columns: the nav on the left (240 wide, groups that fold, the current page highlighted and scrolled into view, scrolling on its own), the content (prose at most 720 wide, demos wider when they need it), and an "On this page" list with scroll-spy on the right from 1280px. Under 1100 the list hides; under 768 the nav becomes a sheet.
- A top bar: the `BrandMark`, links to the sections, the docs search (below), the version, a theme toggle and GitHub.
- Anchors on headings, copy buttons on code, and syntax highlighting done at build time.
- Every docs page passes `expectButtery` across the full matrix, like the rest of buttery. The docs site is buttery's biggest dogfood test.

## Search

The docs search is buttery's own `CommandSearch`, opened with ⌘K or `/`. It works offline, with no hosted service, so it works in the desktop app too.

- The index is generated at build time from the docs content, never by hand: pages, every heading, components, props (name, type, default, description), tokens (name, value per theme, role), examples (title, caption), guides, CLI commands and changelog entries. Titles and headings load on the first focus, fetched ahead while the browser is idle; the full text loads after them.
- Ranking: an exact title, then a component's name, then a heading, then a prop or token, then body text. It tolerates typos and matches prefixes. `apps/docs/src/search/synonyms.ts` maps the words people use to buttery's names: "modal" and "popup" to `Dialog`, "dropdown" to `Menu` and `Select`, "drawer" to `SidePanel`, "snackbar" to the toast, "spinner" to `LoadingPill`, "toggle" to `SegmentedControl`, and so on.
- Results are grouped (Components, Guides, Foundations, Patterns, Props, Tokens, Examples, Changelog). Each shows its breadcrumb path and a snippet with the matched text highlighted. Enter goes straight to the heading's anchor; ⌘Enter opens it in a new tab.
- An empty query shows recent searches and suggestions: Quick start, Button, Dialog, Theming and the layout contract.
- The filter syntax is `CommandSearch`'s: `component:`, `prop:`, `token:` and `guide:`.
- Where the window has room beside the search (from about 1024px wide), a preview pane shows the highlighted result: its description, its import line, and a small live demo for a component, left out when the demo is wider than the pane.
- No results shows a "did you mean" suggestion and a link to ask for the missing docs.
- `/search?q=` lists every result, with filters by section.
- Results change in the frame the query does once the index has loaded, and the index loads in under 200ms on a normal connection.
- `apps/docs/tests/search-golden.ts` lists at least 40 real queries with the result each should find, such as "modal" for `Dialog`, "dark mode" for Theming, "onValueChange" for the props of the components that have it, "--bt-r-lg" for Radius, "no overlap" for the layout contract and "make my app buttery" for Make anything buttery. `pnpm check` fails if an expected result drops out of the top three.
- `minisearch` is approved; a small index of buttery's own is fine if it turns out simpler. Either way the choice is logged in `docs/DECISIONS.md`.

## Examples

No pictures of components, no buttons that do nothing, no TODOs and no "imagine this does X".

- Every example is a real `.tsx` file in its package's `examples/` folder. The live demo imports it and the code block shows its source, so they can't drift apart.
- Every example is complete on its own: all its imports, real state (`useState` for a controlled example), and a one-line caption that says what it shows. Copying it gives code that runs when pasted into a fresh `create-buttery` app.
- Every component page has at least these: basic, controlled, variants and sizes, states (disabled, loading, error and empty where they apply), and one real composition, such as a `Slider` in an inspector row.
- A live demo's prop controls really change the component.
- Each example exports `play`, a small script that drives it, such as pressing Next and seeing the step change, or moving a slider with the arrow keys. It's an async function given a few role-and-name actions (`press`, `type`, `key` and `see`), typed `ExamplePlay` in `@buttery/core`, so example files need no testing library.
- The Phase 7 gate checks every example: typecheck and lint; it renders in Chromium and WebKit with no console errors or warnings; its play script runs; axe passes; `expectButtery` passes on its frame in light, dark, compact and reduced motion; each prop control changes what renders; and a copy test pastes it into a fresh starter app and builds it.
- Coverage checks fail the build when an export from `@buttery/react` has no docs page, an exported prop has no JSDoc, a page links to a route or heading that doesn't exist, or a component page has fewer than the required examples.

## Writing

`docs/WRITING.md` (written in Phase 7) holds these rules, and every page follows them.

- The first sentence says what the thing is and the second says when to use it. Then comes code.
- Plain English: short sentences, second person, present tense, active voice. A term is defined where it first appears. One idea per paragraph. No filler or marketing words; the prose rules of `scripts/check-ai-tells.mjs` apply to the docs content.
- Exact names: the exact prop, token, default and file. Never "it", "this" or "the above" without a clear subject.
- The same headings in the same order on every page (the anatomy above), so people and coding agents know where to look.
- Nothing lives only in a picture or a demo: whatever a demo shows is also said in text or code. Tables are real tables. Code blocks carry a language tag and full imports.
- Do and don't pairs are code, each with a one-line reason.
- Every page is also served as clean Markdown at its path plus `.md`, with a "Copy page as Markdown" button, and `llms.txt` links to those versions.
- A comprehension gate per group of pages: a reviewer who hasn't seen the code reads the rendered page cold and answers three questions about it, and the page is fixed if any answer is wrong. Then a fresh agent gets only a component's `.md` page and builds a small feature with that component; its code has to typecheck and pass `expectButtery`. If it fails, the page is unclear: the page gets fixed, not the test.

## Demos

- Each demo is its own app in `apps/demos/<name>/`, with its own entry, routing and state, served inside the site at `/demos/<name>/` as a full-screen site without the docs' chrome.
- The demos: Card Studio (an editor), the roaster (a dashboard, with settings and search), the Card Studio marketing site, and any later ones. Phase 7 moves the existing demos out of the playground into this structure.
- A `/demos` page lists them as cards: a preview image, a one-line description, the components and patterns it uses, "Open demo", "View source", and "Start from this template" with its `create-buttery` command.
- Inside a demo, a small floating pill in a `FloatingLanes` lane, never over the demo's own UI, holds "Docs", "View source" and a theme toggle, and it folds away. Deep links work, such as `/demos/roaster/settings/notifications`. State is saved locally, with a "Reset demo" action. Data is fake and deterministic, and everything works offline.
- Each demo is its template plus demo content, so templates stay small and the demos prove the templates hold up.
- Pattern and component pages link to the exact demo screen that uses them, such as "See it in the roaster's settings".
- `pnpm docs:build` builds the docs and every demo into one static output, and each demo also runs on its own with `pnpm --filter demo-<name> dev`.
- Each demo passes the full matrix, runs its end-to-end flows from earlier phases, and logs no console errors.

## Build and deploy

- `pnpm docs:build` writes prerendered HTML for every public route, the demos and a `sitemap.xml` into `apps/docs/dist`, with each page's Markdown at its path plus `.md` and `llms.txt`. It renders each route with React's own `react-dom/server` and the app takes over in the browser; `DOCS_URL` sets the site address the sitemap links to. It runs the docs check first and builds nothing while the check finds a problem.
- Approved if they're needed: `@mdx-js/rollup`, `shiki` and `minisearch`. For static prerendering, use the smallest maintained option and log the choice in `docs/DECISIONS.md`.
- Where it's deployed is the maintainer's call. When Phase 7 gets there, it goes in `notes/NEEDS-YOU.md` with a recommendation.

## Order of work in Phase 7

`BrandMark`, then the docs shell and nav generation, then the existing pages moved into the structure (Get started, Foundations, Layout and Motion first), then component pages with working examples and their checks, then Patterns, Templates and Guides, then the demos split into their own sites, then search with its golden queries, then the Markdown versions with the comprehension and agent tests, then the landing page, and last the full matrix and a reviewer who reads the site cold as a new user and answers "could you build an app from this?".

## Where today's playground pages go

| Today | On the site |
|---|---|
| A component page (a `*.meta.ts` with its `*.playground.tsx` and `examples/`) | Its component page, in the group the table above gives it |
| Tokens, Surfaces, Levels, Palettes, Text stacks | Foundations (Colors, Elevation, Palettes, Typography and the rest) |
| Motion | Motion |
| Card Studio, the Card Studio site, Halfmoon Roastery | Their own apps in `apps/demos/<name>/`, served at `/demos/<name>/` and previewed on the `editor`, `marketing` and `dashboard` template pages |
| Compare, and the routes only tests visit | `/lab` |

## Phase 8

`llms.txt`, `llms-full.txt`, `manifest.json` and the MCP server's resources are generated from the same docs content, so the site and agents share one source; `llms.txt` links to the pages' `.md` versions. The MCP server's `search_docs` tool uses the docs search's index. The Tools pages document the CLI and the MCP server with real output.

## Until Phase 7

Three habits keep the move mechanical. Nothing that exists is moved or restructured before Phase 7.

- Every new playground page carries page metadata: `section`, `title`, `description`, `order`, `status` and `since`. A new component's `*.playground.tsx` exports it as `page`, next to its `demos`.
- Test fixtures, pages broken on purpose and anything that reads `reference/` go under `/lab`.
- Every new example follows the rules under "Examples": a real, complete file with its imports, real state and a one-line caption, and a play script.
