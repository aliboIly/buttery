# 🧈 buttery — Build Plan

Nine phases (0–8). Each ends with a **hard stop**: the agent shows screenshots + a short summary and waits for the go-ahead. Guardrails (Phase 2) come *before* components, so every component after is checked automatically. `ROADMAP.md` mirrors these phases as checkboxes — tick them as items land.

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

**Accept:** a Compare page with each control next to its crop from the references (light + dark). The page is local only: it reads from `reference/`, hides itself when the folder is missing, and is left out of builds and CI. Keyboard + screen-reader tests; `expectButtery` green. The arrow (MOTION_SPEC §4.5): unit tests for its states, zero width change on hover, reduced motion and no arrow on touch; Playwright samples it per frame against §4.5 and proves zero layout shift on hover; side-by-side frames against `reference/inspiration-nav/` with the differences listed.

## Phase 5 — Inspector & app patterns
- `SwatchGrid`, `ColorDot`, `TiltPad`, `AnchorGrid`, `Menu`, `Select` (footer slot), `Toast`, `FloatingToolbar`, `EmptyState`/`DropZone`, `Stage`, `Inspector` (Section/Row/Row.Split/Footer), `HeaderBar` (`OverflowCluster`, `dragRegion`), `AppShell`.
- Demo in playground: **Card Studio** — an *original* app (style a title card: its text, background, edge style, scale, rotation and 3D tilt, placement, canvas shape and crop, then export an image) that exercises every component. Not a clone of the reference product.

**Accept:** Card Studio matches the measured motion table (MOTION_SPEC §3) and passes the full matrix; resizing 1728 → 960 → 390 never overlaps or overflows (header actions collapse into "…", inspector becomes a sheet).

## Phase 6 — Overlays & choreography
- `Dialog`, `Onboarding` (StepDialog: morphing media scene, page dots, back and forward buttons with a last-step label, confetti, first-run persistence), `PageDots`.
- `NavBar` + `MorphMenu` (Radix NavigationMenu; `behavior` static, sticky or auto-hide; a sheet below 640), `SubNav`, `ExpandableCard`, `Bento`, `Page`/`Section`/`Container`/`Grid`, `SplitHero`, `CenteredHero`, `StatStrip`, `Stat`, `LogoStrip`, `ArticleLayout`, `Footer`.
- Demo: an original marketing page for Card Studio using the page patterns and `NavBar`; Card Studio gets a 4-step onboarding; the playground's docs shell moves onto `NavBar`.

**Accept:** onboarding compared frame-by-frame with `reference/motion/`; menu morph and card → modal compared with the local choreography strips (behavior, not look); matrix green. `NavBar`: Playwright samples the panel per frame and reports open, switch and close times against MOTION_SPEC §4.1, and the panel never overlaps the bar's items or overflows the viewport at 390, 960 and 1440; side-by-side frames against `reference/inspiration-nav/` with the differences listed.

## Phase 7 — Hardening & brand
- Accessibility audit (axe + manual keyboard pass), dark-mode tuning, compact density pass, visual-regression baselines.
- Docs inside the playground: each component page shows a live demo, generated props table, examples, do/don't, a11y and motion notes; search.
- Rewrite all public-facing prose (README, component docs, changelog and the planning docs in `docs/`) in plain voice per the authorship section of `AGENTS.md`, then extend the prose checks to `docs/`.
- **Brand:** original `BrandMark` per `docs/BRAND.md` (SVG component + favicon + Tauri icons + README hero). Present 3 directions first and wait for a pick.
- `new-app` script finished and tested; Changesets configured.
- Test the `make-it-buttery` skill on a deliberately plain, messy page: before/after + `expectButtery` results.

**Accept:** `pnpm new-app demo` is buttery out of the box and passes the matrix with zero changes.

## Phase 8 — Developer & agent experience
Everything in `docs/DX_AND_AI.md`:
- Generated `manifest.json`, `tokens.json`, `llms.txt`, `llms-full.txt`; docs and examples shipped inside the packages.
- Dev warnings with fixes and docs links; `.vscode/buttery.code-snippets`.
- `buttery` CLI: `create-buttery`, `init` (idempotent; appends a delimited section to an existing `AGENTS.md`), `add <pattern>`, `doctor`, `check [--json]`, `migrate` (skeleton).
- `@buttery/mcp` (stdio) with the tools in DX_AND_AI §3, plus configs for the coding agents listed there, verified against each tool's current docs.
- Agent eval (DX_AND_AI §6) with the agents listed there; results in `docs/AGENT_EVAL.md`; fix the top failure causes.

**Accept:** in a fresh folder, `npx create-buttery eval-app` (via local tarballs) → each agent completes the eval tasks; `buttery check --json` pass rate recorded; top issues fixed and re-run.
