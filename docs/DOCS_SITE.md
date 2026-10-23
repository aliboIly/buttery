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
5. Components: All components (`components/overview`, every component under its group with the line its page starts with, listed from the pages by `<ComponentList group="…" />` under a heading per group), then the components grouped by job and alphabetical inside each group: Actions · Inputs · Selection · Navigation · Overlays · Data display · Feedback and status. The table below assigns each one.
6. Patterns, smallest to largest: Page header · Forms · Settings pages · Detail page · Catalog page · Plans · Search and results · Data table page · Overview · Onboarding · Inspector · App shell · Marketing page.
7. Templates: a page each for `blank`, `dashboard`, `editor` and `marketing`, with a live preview, `create-buttery --template <name>` (with `pnpm new-app my-app --template <name>`, the command that works until `create-buttery` is published) and what's inside: its files and the patterns it's made from. The preview is the template's own app in a frame, served full-window at `/templates/<name>/preview`, a route the nav leaves out.
8. Guides, by task: Build an app in 15 minutes · Build your own buttery component · Make an existing app buttery · Bring your brand (theming) · Check your layout (`buttery check`, `LayoutGuard`) · Accessibility.
9. Tools: CLI · MCP server · Lint configs · Testing (`expectButtery`) · VS Code.
10. Resources: What's new · Roadmap · Contributing.

## Where every export is documented

Every component, primitive and layer has one home. Component-scale parts get a component page in one of the seven groups; building blocks live in Foundations, Layout or Motion; page-scale parts are documented on their pattern's page. Names marked † arrive with Phase 6B's settings, search and panels.

| Section and group | Exports |
|---|---|
| Components › Actions | `ArrowLink`, `Button`, `Chip`, `FloatingToolbar`, `IconButton`, `InfoButton`, `Pressable`, `QuickActions`, `SplitButton` |
| Components › Inputs | `ColorPicker`, `Control`, `DateRangeBar`, `DropZone`, `Field`, `NumberField`, `PasswordField`, `SearchField`, `Slider`, `TextArea`, `TextField`, `TiltPad` |
| Components › Selection | `AnchorGrid`, `Checkbox`, `ColorDot`, `FilterBar`, `OptionTiles`†, `PreferencesMatrix`†, `RadioCardGroup`†, `SegmentedControl`, `Select`, `SwatchGrid`, `Switch`, `ViewToggle` |
| Components › Navigation | `AccountMenu`, `Breadcrumbs`†, `CommandSearch`†, `MorphMenu`, `NavBar`, `PageDots`, `SavedViews`, `SettingsIndex`, `Sidebar`, `StatTabs`, `SubNav`, `TabNav`, `Tabs`, `TopBar` |
| Components › Overlays | `AnnouncementDialog`, `ChoiceDialog`, `ConsequenceDialog`†, `Dialog`, `ExpandableCard`, `FormDialog`†, `FullscreenDialog`†, `Menu`, `NotificationNudge`, `Popover`, `SidePanel`†, `Tooltip` |
| Components › Data display | `Accordion`, `AreaChart`, `Avatar`, `BarChart`, `ChartFrame`, `ColumnSettings`, `DataTable`, `GroupedList`, `HoverActions`†, `InitialsTile`, `Kbd`, `LineChart`, `MetricCard`, `ScopeBadge`†, `Sparkline`, `TagChip`†, `ValueBadge` |
| Components › Feedback and status | `Banner`, `Callout`, `Confetti`, `EmptyState`, `FeatureIntro`, `LoadingPill`, `RecommendationCard`, `SetupGuide`, `Skeleton`, `StatusBadge`, `Toaster` |
| Foundations | `Text` and `TextStack` (Typography), `Icon` (Icons), `Layer`, `Scrim`, `Sticky` and `FloatingLanes` (Layers) |
| Layout | `Center`, `Container`, `Divider`, `FitBox`, `Grid`, `Inline`, `OverflowCluster`, `Page`, `Section`, `Stack`, `Surface` |
| Motion | `buttery` (the motion elements), `Loop`, `Morph`, `Presence`, `Reveal`, `SharedIndicator`, `Stagger` |
| Patterns | `PageHeader` (Page header); `SignInForm`, `SignUpForm` (Forms); `SettingRow`†, `SettingsPage`†, `SettingsSection`† (Settings pages); `DetailPage`† (Detail page); `CatalogPage`† (Catalog page); `PlanComparison`† (Plans); `SearchResults`† (Search and results); `Onboarding` (Onboarding); `HeaderBar`, `Inspector`, `Stage` (Inspector); `AppPage`, `AppShell` (App shell); `ArticleLayout`, `Bento`, `CenteredHero`, `Footer`, `LogoStrip`, `SplitHero`, `StatStrip` (Marketing page) |

The Data table page and Overview patterns are compositions of the parts above and add no export of their own. A new export gets a row here in the change that adds it, and the docs check fails on an export that has none. An export of `@buttery/react` from outside a component's folder, such as `ButteryProvider` or the shared form parts, is listed in the `exports` frontmatter of the written page that describes it.

## Landing page (`/`)

- A hero: the 🧈 logo, "Make anything buttery", a one-line description, "Get started" as the primary button with a forward arrow, "Browse components" (All components), and a copyable `npx create-buttery my-app` (`pnpm new-app my-app` until `create-buttery` is published, with a line under it saying it runs in a clone of the repository and linking Installation).
- Where to start: three cards, each with a forward-arrow link: a new app (`create-buttery`), an existing app (`buttery init`), building with a coding agent (`AGENTS.md` and the MCP server). Until the CLI and the MCP server exist, the cards name `pnpm new-app`, the existing-app guide, and `AGENTS.md` with the make-it-buttery skill.
- What's new: the latest three releases, each with its number, its tag (Latest, or In progress for the release being built), its date and two or three highlights, from Changesets plus a short `content/whats-new/` entry per release, and a link to the full release notes. Each entry is `content/whats-new/<version>.md`, with `version`, `date`, `title`, `summary` (a sentence on what the release is for) and, for a release with something to try, `examples` (`[Component/example-file, …]`) in its frontmatter, and its highlights as `- ` lines. The docs check fails on an entry without a summary or two or three highlights, on an example that doesn't exist, on a changelog version without an entry, and on a page whose `since` names a release with no entry. Releases are numbered one minor version per phase, 0.1 to 0.9, and 1.0 is the first on npm.
- A live strip of real components the visitor can touch (a segmented control, a slider, a menu, a toast) that shows the feel instead of describing it.
- Explore tiles with counts: Foundations, Layout, Motion, Components, Patterns, Templates, each counted from the nav and opening the section's first page, and Demos, counting the demos and opening `/demos`. Components counts its components, not the overview. A section with no pages yet has no tile.
- A footer: the version, GitHub, the roadmap and What's new.
- Motion per `docs/MOTION_SPEC.md`: sections reveal once as they scroll in, the tiles stagger, and nothing plays by itself to distract.

## The Introduction (`/get-started/introduction`)

The first page of Get started says what buttery is by showing it.

- Try it: a theme playground. A launch checklist made of buttery's components sits on a stage, a gradient from the palettes in the brand color's hue family, and a nested `ButteryProvider` applies the scheme, density, brand color (the theme's `accent` and `primary`) and corners picked beside it, to the card alone. It follows the page's scheme and density until one is picked. Ticking every task and pressing Launch celebrates.
- What buttery gives an app: a card for each of tokens and themes, layout, motion, components, checks and coding agents, each with a small live part on top (a toolbar that folds into More as its slider narrows it, an indicator that slides and a total that crossfades) and its heading, words and link written in the page's Markdown inside `<Feature>`, so the `.md` and the search have them.
- New in and the newest release's minor number: its summary, its `examples` live, its highlights, and links to its release notes and the roadmap, written from the newest What's new entry, so it changes with each release.
- Where to go next: the rest of Get started as a numbered path, from the pages' own titles and descriptions.

## Release notes and the roadmap

- Resources › What's new is the release notes, newest first, on a timeline: each release's number and tag, its name as a heading that links to itself, its date, its summary, its `examples` live, its highlights, the components whose `since` is its version (the first dozen, then Show all) and every change its packages' changelogs list. The page's "On this page" list has a line for each release, and a component page's "Since" opens its release. Each shipped release is a `v<version>` tag on GitHub with a GitHub release, which its notes link to: pushing the tag runs `.github/workflows/release.yml`, which publishes the release with the notes `scripts/release-notes.mjs` writes from the What's new entry.
- Resources › Roadmap is read from `ROADMAP.md` at build time, so it can't fall behind the boxes ticked there: how many releases have shipped, how much of the one being built has landed, then Now (the first release with boxes left: its number, phase, summary, a bar for its progress and every item, ticked or not), Next (releases planned after it), Later (the ideas not yet landed) and Shipped (each finished release with its date, summary and a link to its notes). A release's summary is the quoted line under its heading in `ROADMAP.md`; a shipped release takes its name, date and summary from its What's new entry.

## A component page

Every component page has the same parts in the same order.

1. Breadcrumbs, the title, a one-line description, the status badge with an info button saying what the status means, a "New" badge while `since` is the current minor, "Since" and the release, linking to that release's notes, and a copyable import line.
2. A live demo with prop controls, theme and density toggles, and "Show code".
3. When to use it, when not to, and what to use instead.
4. Examples, from `examples/`.
5. Anatomy, variants, sizes and states.
6. A props table generated from the types and their JSDoc, one per part: its own props and the ones it takes from buttery's types, with DOM and library props summarized in a line. After them, the fields of each exported type its props use, such as `DataTableColumn`. Under "Also exported", the hooks and helpers its folder exports, with their signatures and JSDoc. A name stays on one line, types and defaults break only at their spaces, and a description shows its backticked code as code. Descriptions keep at least 30 characters of width, so in a narrow column the table scrolls sideways instead of squeezing them.
7. Accessibility: a keyboard table and ARIA notes.
8. Motion: the preset it uses and what reduced motion does.
9. Layout: its sizing rules, truncation and hit areas.
10. Related components.
11. Previous and next links in nav order, "Edit this page", and when it was last updated.

Guides and foundations pages use the same shell without the component-only parts.

## The shell

- Three columns: the nav on the left (240 wide, groups that fold, the current page highlighted and scrolled into view, scrolling on its own), the content (prose at most 720 wide, demos wider when they need it), and an "On this page" list with scroll-spy on the right from 1280px, marking the last heading that has reached the top bar however the page got there, scrolled or jumped. Under 1100 the list hides; under 768 the nav becomes a sheet.
- A top bar, a header across the window's whole width, square, on the surface with a hairline under it, its brand lined up with the sidebar's items: the 🧈 logo and the name, the sections in five menus (Learn: Get started, Foundations, Layout and Motion; Components, by group, each group opening its heading on All components, with "Every component" at the menu's foot; Patterns and Templates; Guides and Tools; Resources, with a Demos column holding the demos page and each demo), the docs search (below), the version, a theme toggle, the display settings (a popover titled Display, with a labelled segmented control each for the theme, the density and the motion) and GitHub. A component page's group crumb opens the same heading. On a phone the bar folds into a menu sheet, where those tools are labelled rows under the sections, starting where the sections start, with the version under them.
- Anchors on headings, copy buttons on code, and syntax highlighting done at build time.
- An address with no page shows "Page not found" under that address: its own title, a docs search holding the address's last words (`/get-started/instalation` holds "instalation") and a link to each section and the demos. A section's own address, such as `/foundations`, opens the section's first page and puts that page's address in the bar. Only a demo or a template's preview draws the paths under its address, with its own router.
- Every docs page passes `expectButtery` across the full matrix, like the rest of buttery. The docs site is buttery's biggest dogfood test.

## Search

The docs search is buttery's own `CommandSearch`, opened with ⌘K or `/`. It works offline, with no hosted service, so it works in the desktop app too.

- The index is generated at build time from the docs content, never by hand: pages, every heading, components, props (name, type, default, description), tokens (name, value per theme, role), examples (title, caption), guides, CLI commands and changelog entries. Titles and headings load on the first focus, fetched ahead while the browser is idle; the full text loads after them.
- Ranking: a page or component whose title is the query, whatever the rest score, then a component's name, then a heading, then a prop or token, then body text. It tolerates typos and matches prefixes. `apps/docs/src/search/synonyms.ts` maps the words people use to buttery's names: "modal" and "popup" to `Dialog`, "dropdown" to `Menu` and `Select`, "drawer" to `SidePanel`, "snackbar" to the toast, "spinner" to `LoadingPill`, "toggle" to `SegmentedControl`, and so on.
- Results are grouped (Components, Guides, Foundations, Patterns, Props, Tokens, Examples, Changelog). A page, heading or component shows under its page's section, so `Stack` is under Layout and `PageHeader` under Patterns. The groups go in the order of their best results, so the panel and `/search` open on the query's best result, whichever group it's in. Each shows its breadcrumb path and a snippet with the matched text highlighted. Enter goes straight to the heading's anchor; ⌘Enter opens it in a new tab.
- An empty query shows recent searches and suggestions: Quick start, Button, Dialog, Theming and the layout contract.
- The filter syntax is `CommandSearch`'s: `component:`, `prop:`, `token:` and `guide:`. `component:` keeps components wherever their pages are, and `guide:` keeps the Guides and Get started pages.
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
- A page-scale component, one whose layout changes at desktop widths, such as `AppShell`, `AppPage` and the page templates, exports `width = "desktop"` (typed `DemoWidth`) from its `*.playground.tsx`. From 640px of frame its live demo, variants and examples lay out at an app page's width, 1280, scaled down to fit as a template's preview is, and stay live; in a narrower frame, or for an example that keeps itself narrower than its frame, such as a phone-sized screen, they lay out at their own size.
- A live demo's prop controls really change the component. The check compares the demo's frame and the layers its overlays portal to, so a control that changes only a menu, popover or tooltip counts while the overlay is open: put a control that opens it first, as Menu's `open` does.
- Each example exports `play`, a small script that drives it, such as pressing Next and seeing the step change, or moving a slider with the arrow keys. It's an async function given a few role-and-name actions (`press`, `hover`, `focus`, `type`, `key` and `see`), typed `ExamplePlay` in `@buttery/core`, so example files need no testing library. `hover` rests the pointer on an element and `focus` gives it keyboard focus, either of which opens a tooltip; use `focus` rather than Tab to reach a button, which WebKit focuses neither on a click nor on Tab. `key` holds its key down for two frames, as a person does, so the arrow keys pick options in a radio group such as `SegmentedControl`. `see` waits for text a sighted person can see: text only screen readers get, such as a chart's data table, doesn't count, so a play opens a tooltip before it sees what the tooltip says.
- The Phase 7 gate checks every example: typecheck and lint; it renders in Chromium and WebKit with no console errors or warnings; its play script runs; axe passes; `expectButtery` passes on its frame in light, dark, compact and reduced motion; each prop control changes what renders; and a copy test pastes it into a fresh starter app and builds it.
- `packages/core/src/examples.test.tsx` and `packages/react/src/examples.test.tsx` run the plays, one test per example, each starting without the toasts or confetti the one before left. A test is named for its example's folder and file, such as `slider/opacity-row`, so `pnpm vitest run --project browser packages/react/src/examples.test.tsx -t "slider/"` runs one folder's.
- Coverage checks fail the build when an export from `@buttery/react` has no docs page, an exported prop has no JSDoc, a page links to a route or heading that doesn't exist, or a component page has fewer than the required examples.

## Writing

`docs/WRITING.md` (written in Phase 7) holds these rules, and every page follows them.

- The first sentence says what the thing is and the second says when to use it. Then comes code.
- Plain English: short sentences, second person, present tense, active voice. A term is defined where it first appears. One idea per paragraph. No filler or marketing words; the prose rules of `scripts/check-ai-tells.mjs` apply to the docs content.
- Exact names: the exact prop, token, default and file. Never "it", "this" or "the above" without a clear subject.
- The same headings in the same order on every page (the anatomy above), so people and coding agents know where to look.
- Nothing lives only in a picture or a demo: whatever a demo shows is also said in text or code. Tables are real tables. Code blocks carry a language tag and full imports.
- Do and don't pairs are code, each with a one-line reason.
- Every page is also served as clean Markdown at its path plus `.md`, with a "Copy page as Markdown" button, and `llms.txt` links to those versions, under the nav's sections in the nav's order, each component group a section of its own, such as `## Components › Actions`, and last the demos page and each demo, with its template and its folder. A block the Markdown can't write out, such as the surface levels drawn in light and dark, becomes a line linking to it on the live page, under its heading's anchor; a component that only lays out the Markdown inside it, such as `<Feature>`, leaves that Markdown as it is; the release notes, the roadmap, the newest release and the Get started path are written out as Markdown; and a component's Markdown says where its live demo and its variants and states are, listing each section of the gallery with its description.
- No page runs on as a wall of text. A list of more than four or five long items, or paragraphs that are really parallel items, becomes one of the written page's blocks, which an MDX page uses without importing them, and whose words stay in the page's Markdown:
  - `<Steps>` with a `<Step>` for each thing done in order, its `###` heading first, for installing, migrating or any procedure (`start={0}` numbers from 0).
  - `<Rules>` with a `<Rule title="…">` for each of a numbered set of rules or principles, such as the layout contract's 13; the Markdown numbers them.
  - `<Cards columns={2|3}>` with a `<Card icon="…" title="…">` for each of a set of parallel things: requirements, features, options, what changes where. A card's title is a line of its own, not a heading.
  - `<DoDont>` with a `<Do>` and a `<Dont>`, each a code block and a line on why.
  - A blockquote, `> **Name.** …`, for a note: something to know that isn't a step.
  - `<DocsTable>` for facts in columns, such as names, values and defaults, with code in backticks and no links in its cells.
  - A code block that belongs in a file names it, as in ` ```tsx title="src/App.tsx" `.
- Paragraphs stay short: one idea each, about three lines at the column's width.
- A comprehension gate per group of pages: a reviewer who hasn't seen the code reads the rendered page cold and answers three questions about it, and the page is fixed if any answer is wrong. Then a fresh agent gets only a component's `.md` page and builds a small feature with that component; its code has to typecheck and pass `expectButtery`. If it fails, the page is unclear: the page gets fixed, not the test.

## Demos

- Each demo is its own app in `apps/demos/<name>/` (package `demo-<name>`), with its own entry, routing and state, served inside the site at `/demos/<name>/` as a full-screen site without the docs' chrome. The site depends on each demo's package and renders the root it exports under that path.
- The demos: Halfmoon Roastery (a coffee roaster's dashboard, with settings and search, `roastery`), the Halfmoon shop (the same roastery's online store, `roastery-shop`), Deckhand (a slide editor, `deckhand`), and any later ones. Each is a real kind of product anyone recognizes at a glance, with believable content and every control working.
- A `/demos` page lists them as cards: a preview image, a one-line description, the components and patterns it uses, "Open demo", "View source", and "Start from this template" with its `create-buttery` command (`pnpm new-app my-app --template <name>` until `create-buttery` is published). `pnpm demos:previews` takes the pictures from each demo's own dev server, light and dark, into `apps/docs/public/previews`.
- Inside a demo, a small floating pill in the bottom-end `FloatingLanes` lane, never over the demo's own UI, holds "Docs" (back to `/demos`), "View source", a theme toggle and "Reset demo", and it folds away to one button, staying folded from demo to demo. On a phone it starts folded, so it and a demo's own floating UI cover less of the page, until someone unfolds it. Lanes keep clear of the demo's own chrome and floating UI, and it steps back under its dialogs. Deep links work, such as `/demos/roastery/settings/notifications`. State is saved locally: each demo keeps everything it saves under one storage prefix and exports `clearSavedState`, which "Reset demo" calls before reloading. Data is fake and deterministic, and everything works offline.
- Every app, template or demo, has a small router of its own in `src/router.tsx` (a `useSyncExternalStore` over the address and `popstate`, with links made from a base path), so it runs at `/` on its own and under `/demos/<name>` or `/templates/<name>/preview` inside the site. The site passes its own navigation, so its display settings stay in the address as a demo moves between pages.
- Each demo is its template plus demo content, so templates stay small and the demos prove the templates hold up.
- Pattern and component pages link to the exact demo screen that uses them, such as "See it in the roastery demo's settings". A part of every screen of a demo, such as the roastery's shell, links to the demo itself, and only when no screen of it uses the component.
- `pnpm docs:build` builds the docs and every demo into one static output, and each demo also runs on its own with `pnpm --filter demo-<name> dev`. A node test checks that each demo keeps its template's entry, router, Vite config, tsconfig and `index.html`, apart from its name.
- Each demo passes the full matrix, runs its end-to-end flows from earlier phases, and logs no console errors.

## Build and deploy

- `pnpm docs:build` writes prerendered HTML for every public route, the demos and a `sitemap.xml` into `apps/docs/dist`, with each page's Markdown at its path plus `.md` and `llms.txt`. The demos and the template previews come with the pages inside them, from the paths each app's package exports as `routes`, and a `404.html` lets the app draw any other address, such as a demo's customer page. It renders each route with React's own `react-dom/server` and the app takes over in the browser. Each section's own address is written as the page it opens, naming that page as canonical, and left out of the sitemap. A `.md` address no page has gets a 404: from the dev server's Markdown middleware, from `vite preview` serving the build, and from a static host, which serves `404.html` with that status. It also writes an empty `.nojekyll`, so GitHub Pages never runs the files through Jekyll. It runs the docs check first and builds nothing while the check finds a problem.
- The site can be served under a path rather than a domain's root. `BUTTERY_DOCS_BASE` (default `/`, such as `/buttery/`) is Vite's `base` for `apps/docs` and the base of everything the build writes. The source, the MDX content and the route data write every address from the site's root, such as `/components/button`, and `sitePath` in `apps/docs/src/base.ts` puts it under the base where it's rendered or written: through `siteHref` in the browser, which reads `import.meta.env.BASE_URL`, and with the base passed in for the Markdown, `llms.txt` and the sitemap. The router reads a route from the path under the base, and the demos and template previews get their routers' `base` under it. The sitemap and the canonical links are `DOCS_URL`'s origin plus the base; a `DOCS_URL` whose path isn't the base stops the build and says how to fix it. Development and the tests run at `/`; `BUTTERY_DOCS_BASE=/buttery/ pnpm --filter docs preview` serves a build made with that base. With a base, a link in a live example (`data-docs-example`) that points outside it, such as a sidebar's `/orders`, does nothing when clicked.
- Approved if they're needed: `@mdx-js/rollup`, `shiki` and `minisearch`. For static prerendering, use the smallest maintained option and log the choice in `docs/DECISIONS.md`.
- The site is deployed to GitHub Pages, at https://aliboily.github.io/buttery/, by `.github/workflows/docs.yml` on each push to `main` (or run by hand). It builds with `BUTTERY_DOCS_BASE=/buttery/` and `DOCS_URL=https://aliboily.github.io/buttery`, from a full clone so each page's "Last updated" date comes from git, and deploys `apps/docs/dist`. GitHub Pages serves the root `404.html` for any address under `/buttery/` without a file, and the app draws that address. Pages has to be turned on in the repository's settings, with GitHub Actions as its source.

## Order of work in Phase 7

The brand, then the docs shell and nav generation, then the existing pages moved into the structure (Get started, Foundations, Layout and Motion first), then component pages with working examples and their checks, then Patterns, Templates and Guides, then the demos split into their own sites, then search with its golden queries, then the Markdown versions with the comprehension and agent tests, then the landing page, and last the full matrix and a reviewer who reads the site cold as a new user and answers "could you build an app from this?".

## Where today's playground pages go

| Today | On the site |
|---|---|
| A component page (a `*.meta.ts` with its `*.playground.tsx` and `examples/`) | Its component page, in the group the table above gives it |
| Tokens, Surfaces, Levels, Palettes, Text stacks | Foundations (Colors, Elevation, Palettes, Typography and the rest) |
| Motion | Motion |
| Card Studio, the Card Studio site, Halfmoon Roastery | Their own apps in `apps/demos/<name>/`, served at `/demos/<name>/`, built on the `editor`, `marketing` and `dashboard` templates, whose pages link to them. Deckhand and the Halfmoon shop have since replaced Card Studio and its site. |
| Compare, and the routes only tests visit | `/lab` |

## Phase 8

`llms.txt`, `llms-full.txt`, `manifest.json` and the MCP server's resources are generated from the same docs content, so the site and agents share one source; `llms.txt` links to the pages' `.md` versions. The MCP server's `search_docs` tool uses the docs search's index. The Tools pages document the CLI and the MCP server with real output.

## Until Phase 7

Three habits keep the move mechanical. Nothing that exists is moved or restructured before Phase 7.

- Every new playground page carries page metadata: `section`, `title`, `description`, `order`, `status` and `since`. A new component's `*.playground.tsx` exports it as `page`, next to its `demos`.
- Test fixtures, pages broken on purpose and anything that reads `reference/` go under `/lab`.
- Every new example follows the rules under "Examples": a real, complete file with its imports, real state and a one-line caption, and a play script.
