---
name: make-it-buttery
description: Build new UI or convert existing UI to the buttery design system so it looks, moves and lays out buttery — correct tokens, components, motion and layout with no overlaps. Use whenever building, restyling, or reviewing UI in a project that depends on @buttery/core or @buttery/react.
---

# Make it buttery

Goal: the result should look like it was designed with buttery from day one, pass `expectButtery`, and need no hand-tuned values.

Works for any coding agent: Claude Code loads this as a skill; Codex, Gemini CLI and others are pointed here by `AGENTS.md`.

## 1. Read the system (first time in a session)
- `docs/DESIGN_SPEC.md`, `docs/MOTION_SPEC.md`, `docs/LAYOUT_RULES.md` — in the buttery repo, or `node_modules/@buttery/core/docs/` in an app (shipped from Phase 8).
- What exists: the `@buttery/mcp` tools (`list_components`, `find_component`, `get_component`) if connected; otherwise each docs page as Markdown, listed in `llms.txt` (on the docs site, or under `pnpm dev` in the buttery repo at `/llms.txt` and `/components/<name>.md`); otherwise the component folders themselves: each has a `Name.meta.ts` (what it's for, when not to use it, related components) and `examples/` you can copy. Layout primitives, layers (`Menu`, `Popover`, `Layer`, `Sticky`, `FloatingLanes`), `Text` and `Icon` come from `@buttery/core`; components and patterns from `@buttery/react`. Reuse before you build.

## 2. Inventory the UI
For the screen or component in scope, list:
- **Structure**: what are the regions (header, stage, side panel, page sections, cards, overlays)?
- **Controls**: every input/button/toggle and what buttery component it maps to.
- **Raw values**: hardcoded colors, px sizes, radii, shadows, z-indexes, durations, margins.
- **Motion**: what changes state, what appears/disappears, what the user drags.
- **Risks**: things that can overlap, overflow, wrap or jitter (long labels, changing numbers, many toolbar actions, fixed-position elements).

## 3. Map to buttery (top-down, reuse first)
1. Whole screen → a pattern if one fits: `AppShell`, `Page` + `SplitHero`/`Bento`/`ArticleLayout`, `Onboarding`, `EmptyState`, `SignInForm`/`SignUpForm`. A list or table page is `AppPage` + `PageHeader` + `DataTable`, with `FilterBar` over the table for its search and filters; inside `AppShell layout="sidebar"` when the app has navigation, on its own when it doesn't.
2. Regions → `Surface` levels (`panel → section → card`, `radius="auto"` for concentric corners) and layout primitives (`Stack`, `Inline` with `uniform` for equal buttons, `Grid`, `Center`, `Divider`, `FitBox`, `OverflowCluster`). Spacing props take spacing steps: `gap={3}`, `pad={4}`, `padX="0.5"`. Text goes through `Text` with a role (`variant="title"`, `asChild` for headings); icons through `Icon`.
3. Controls → buttery components (`Button`, `SegmentedControl`, `Slider`, `Menu`/`Select`, `SwatchGrid`, …). Never restyle a native control by hand if a component exists. Forms: `TextField`/`PasswordField`/`TextArea` (label above, `hint`, `error`; pass `type`, `autoComplete`, `inputMode`), `Checkbox` for a choice that waits for submit, `Switch` for one that takes effect at once, `Field` to label anything else, `Callout` for an error summary or a note. Text blocks (title, body, caption) → `TextStack`.
4. Anything custom/third-party → wrap with `buttery(Component, recipe)` or `<buttery.div surface=… press …>`; plain HTML → recipe classes (`.bt-surface[data-level]`, `.bt-press`, `.bt-focus`).
5. Raw values → tokens. If no token fits, use the nearest one; only add a token for a genuinely new concept (log it in `docs/DECISIONS.md`).

## 4. Apply motion by rule, not taste
| Situation | Use |
|---|---|
| User drags / picks a value | Instant update, no tween |
| Filtering, sorting or searching a list | The results swap in the same frame, with no animation; list the rows in the filtering interaction's `allowMove` in tests |
| Discrete state change (toggle, snap, reset, resize) | `spring.smooth` via `layout`: `buttery.div layout`, or spread `useLayoutAnimation()` on a `motion` element, with `layoutDependency` set to the state that moves it |
| Content swaps inside a container | `Morph` (auto-height + crossfade) |
| Selection indicator | `SharedIndicator` (`spring.snappy`) |
| Something appears/disappears | `Presence` preset (exit faster than enter) |
| Section/list enters the viewport | `Reveal` / `Stagger` (once) |
| One surface changes context (menu sections, card → detail) | Keep it mounted and morph it (`MorphMenu`, `ExpandableCard`) |
| Real completion moment | `celebrate()` — rarely |

Check it with reduced motion on: final states must still render correctly.

## 5. Guarantee layout
- No outer margins on components; spacing via `gap` relationship tokens (LAYOUT_RULES §2).
- Single-line text in controls: `truncate` + accessible full text. Changing numbers: `tabular-nums` + reserved width.
- Toolbars/headers/navs: `OverflowCluster` with priorities; a toolbar over a list or table: `FilterBar`. Fixed UI: register in `FloatingLanes`.
- Overlays only through buttery layer components: `Menu` for a list of actions (or a setting picked from a few, with `Menu.RadioGroup`), `Select` for a value a control shows, `Popover` for anchored panels with anything else in them, `Layer` + `Scrim` for anything else out of flow, `toast()` for toasts (three at most, give repeated messages an `id`), `FloatingLanes.Item` for notices, `Sticky` for sticky bars. They pick the z band and keep floating UI 8px inside the viewport.
- App code never sets `position: absolute|fixed|sticky`; if a small target needs a bigger hit area, use or build a component that adds a `[data-bt-hit]` part.
- Mark intentional overlaps (artwork on a stage) with `data-bt-allow-overlap`.

## 6. Verify — don't skip
1. `pnpm check` (lint + stylelint catch raw values, z-index, negative margins, stray positioning; the quick layout matrix runs on every page).
2. `pnpm test:layout --reporter=json` in the buttery repo, or `await expectButtery(page, { ...fullMatrix, name })` from `@buttery/test` in an app's Playwright tests (later `buttery check --json` and the MCP `check_layout` tool). For an app inside the buttery repo, its own specs run with `node scripts/e2e.mjs rest apps/<app>/e2e`. Check every state, not just the first paint: pass `interactions` that open each menu, dialog, toast and empty state (every check runs on the state each one leaves), and list what an interaction moves on purpose, such as filtered rows, in its `allowMove`. Fix each JSON violation at the root; the `fix` field says how.
3. In a Vite dev build `LayoutGuard` is already on: resize from widest to 390px and watch for red outlines and `[buttery:LayoutGuard]` warnings in the console. `⌥⇧L` hides the outlines, `⌥⇧G` shows the page grid.
4. Screenshot before/after (light + dark). If the repo has a local `reference/` folder (it's never committed), compare against it; `reference/README.md` says which captures show the look and which show layout and motion behavior.
5. Report: what changed, any tokens added, any rule you had to bend and why.

New components start from `pnpm new-component <Name> --purpose "…"`; `pnpm check` fails until the folder is complete (manifest entry, tests, demos, 2–6 examples).

## Buttery checklist (all must be true)
- [ ] Every color, size, radius, shadow, duration and z-index is a token.
- [ ] Nested surfaces have concentric corners.
- [ ] Peers are uniform (equal buttons, equal cards, one left edge).
- [ ] Nothing overlaps, overflows, wraps unexpectedly or jitters at any matrix size.
- [ ] Every interaction has the right motion class from the table above, and nothing waits on an animation.
- [ ] Keyboard, focus ring, labels, AA contrast, hit areas ≥ 24 (buttons ≥ 28 tall). A button that can't act once it's pressed takes `aria-disabled`, not `disabled`, so focus stays on it.
- [ ] Works in light, dark, comfortable, compact, and reduced motion.
- [ ] Nothing copied from reference products' branding or copy.
