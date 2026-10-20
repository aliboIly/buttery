# 🧈 buttery — Architecture

## What buttery is

A React design system + layout/motion framework. Its job: **anything built with it — or wrapped in it — comes out buttery** (the look in `DESIGN_SPEC.md`, the motion in `MOTION_SPEC.md`, the layout guarantees in `LAYOUT_RULES.md`) with very little effort — whether the builder is a developer or a coding agent. See `DX_AND_AI.md`.

Targets: web apps and desktop apps (Tauri v2 wraps the same web code).

## Stack (current stable as of Oct 2026 — verify with `npm view <pkg> version` before installing)

| Concern | Choice |
|---|---|
| Language / UI | TypeScript 7 for type-checking (TypeScript 6.0 alongside it for typescript-eslint), React 19 |
| Browser baseline | Safari 17.5+ and current Chromium; newer CSS such as `text-box-trim` only as progressive enhancement |
| Monorepo | pnpm workspaces |
| Accessible behavior | `radix-ui` (unified package) — Dialog, DropdownMenu, NavigationMenu, Popover, Slider, ToggleGroup, RadioGroup, Tooltip, Slot |
| Motion | `motion` (`motion/react`) |
| Icons | `lucide-react` (16px, stroke 1.75) |
| Styling | Plain CSS + CSS custom properties, in cascade layers. No CSS-in-JS runtime. Optional Tailwind v4 bridge. |
| Font | Inter Variable via `@fontsource-variable/inter`, a dependency of `@buttery/core` (bundled, so desktop apps work offline) |
| Library build | `tsdown` (ESM + `.d.ts`), CSS concatenated per package |
| App build | Vite 8 with `@vitejs/plugin-react` |
| React Compiler | On in the apps (`babel-plugin-react-compiler` through `@rolldown/plugin-babel`, which needs `@babel/core`); library code stays compiler-compatible through `eslint-plugin-react-hooks` |
| Desktop | Tauri v2 |
| Tests | Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`): pure logic in Node, components in browser mode (`@vitest/browser-playwright`, Chromium and WebKit). Playwright in Chromium **and WebKit** for app smoke tests, layout, visual and a11y (`@axe-core/playwright`) |
| Formatting / lint | Prettier, ESLint 10 (typescript-eslint, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `@eslint/js`, `globals`), stylelint |
| Tooling | `@types/node` for configs and scripts |
| Agent tooling | `@modelcontextprotocol/sdk` (for `@buttery/mcp`) |
| Releases | Changesets |

**TypeScript 7 and 6:** TS 7 is the native (Go) compiler and has no classic compiler API, so typescript-eslint (which accepts `typescript` < 6.1) runs on TS 6.0, installed as `typescript`. TS 7 is installed as `typescript-native` and `pnpm typecheck` runs it by path. tsdown emits `.d.ts` through oxc because packages use `isolatedDeclarations`, so it needs neither. Verified in Phase 0; see `docs/DECISIONS.md`.

## Repo layout

```
buttery/
├─ AGENTS.md                     # rules for every coding agent (single source of truth)
├─ CLAUDE.md                     # imports @AGENTS.md + agent-specific notes
├─ ROADMAP.md                    # milestones + checkboxes
├─ .gemini/settings.json         # loads AGENTS.md as agent context
├─ .vscode/                      # recommended extensions + workspace settings
├─ .claude/skills/make-it-buttery/SKILL.md
├─ docs/                         # ARCHITECTURE, DESIGN_SPEC, MOTION_SPEC, LAYOUT_RULES, DX_AND_AI, BRAND, BUILD_PLAN, DECISIONS
├─ reference/                    # local only, never committed: screenshots, frames, motion strips
├─ packages/
│  ├─ core/    @buttery/core     # tokens, themes, recipes CSS, primitives, layers/, motion presets, layout engine, LayoutGuard, docs (shipped)
│  ├─ react/   @buttery/react    # components + patterns, built only on core; ships manifest.json + examples
│  ├─ test/    @buttery/test     # expectButtery() Playwright checks (human + JSON reports)
│  ├─ lint/    @buttery/lint     # stylelint + eslint configs
│  ├─ cli/     buttery CLI       # `npx create-buttery`, `buttery init | add | doctor | check`
│  └─ mcp/     @buttery/mcp      # MCP server so any agent can query components, tokens and run layout checks
├─ apps/
│  ├─ playground/                # every component × state × theme × density; demo screens; docs pages; Playwright target
│  └─ starter/                   # template for new apps: Vite + React + Tauri v2, wired up, with agent files + skill
├─ scripts/
│  ├─ check-ai-tells.mjs         # authorship checks (pnpm check + commit-msg hook)
│  ├─ check-private-paths.mjs    # fails if reference/ or PROMPTS.md is tracked
│  ├─ new-component.mjs          # scaffolds a component that already follows every rule
│  └─ new-app.mjs                # copies apps/starter → apps/<name>
├─ .githooks/                    # commit-msg and pre-commit, installed by pnpm install
└─ tooling/                      # shared tsconfig presets
```

## The layers ("the butter stack")

Each layer only depends on the ones above it. That's what makes buttery modular and makes custom work look native.

```
1. Tokens      --bt-* CSS variables + typed TS exports (colors, type, space, heights, widths, radii,
               shadows, z, motion)
2. Recipes     CSS classes that bundle tokens: .bt-surface[data-level], .bt-press, .bt-focus,
               .bt-control[data-size], .bt-text[data-role], .bt-truncate
3. Primitives  Surface, Pressable, Stack, Inline, Grid, Center, Divider, Text, Icon, Kbd,
               FitBox, OverflowCluster, Morph (auto-height + crossfade), Presence (enter/exit presets),
               SharedIndicator, Reveal, Stagger, Loop
   Layers      (packages/core/src/layers/) Layer/Portal + layer manager, Scrim, Sticky, Popover,
               FloatingLanes
4. Components  Button, IconButton, SplitButton, SegmentedControl, Slider, ValueBadge, Chip,
               SwatchGrid, ColorDot, TiltPad, AnchorGrid, Menu, Select, NumberField,
               Tooltip, Dialog, Toast, PageDots, ArrowLink, Stat, Confetti, BrandMark
5. Patterns    AppShell, HeaderBar, Inspector (Section/Row/Row.Split/Footer), Stage,
               EmptyState/DropZone, FloatingToolbar, Onboarding (StepDialog),
               NavBar + MorphMenu, SubNav, Page/Section/Container, SplitHero, CenteredHero,
               Bento + ExpandableCard, StatStrip, LogoStrip, ArticleLayout, Footer
```

Only the layer primitives, and a component's own `data-bt-part` internals, set `position`. The overlay components (Menu, Select, Tooltip, Dialog, Toast, FloatingToolbar) are built on the layer primitives.

CSS cascade layers, declared once in `@buttery/core/styles.css`:
```css
@layer bt.reset, bt.tokens, bt.base, bt.recipes, bt.primitives, bt.components, bt.patterns, bt.utilities;
```
App CSS is unlayered, so it **always wins** over buttery without `!important` — overriding is trivial.

## "Make anything buttery" — four levels of effort

### Level 0 — zero effort
```tsx
import "@buttery/core/styles.css";
import "@buttery/react/styles.css";
import { ButteryProvider } from "@buttery/react";

<ButteryProvider>{app}</ButteryProvider>
```
You get: tokens, Inter, base typography, focus rings, selection color, scrollbars, motion presets with reduced-motion handling, light/dark, the toast/floating-lane hosts, the layer stack, and `LayoutGuard` in dev. (`npx buttery init` does this wiring for you.)

### Level 1 — wrap anything
The `buttery` factory (like `motion.div`) turns any element or component into a buttery one:
```tsx
import { buttery } from "@buttery/react";

<buttery.div surface="card" pad={4} gap={3} enter="rise">…</buttery.div>
<buttery.button press focus>…</buttery.button>
const ButteryThing = buttery(ThirdPartyCard, { surface: "raised", press: true, layout: true });
```
Props (all optional, all token-typed so wrong values fail type-checking): `surface` (a `SurfaceLevel`: `panel|section|card|raised|floating|dialog|inset`; the prop is named after the recipe it applies, `.bt-surface[data-level]`, and takes the same type as `Surface`'s `level`, so it isn't a synonym), `radius` (`auto` = concentric from parent), `pad`, `gap` (spacing-scale steps), `stack`/`inline`/`grid`, `press`, `focus`, `hover` (`lift|tint`), `enter` (`fade|rise|pop|stagger`), `layout` (animate layout changes), `truncate`.

Same thing without React — recipes are plain classes/attributes:
```html
<div class="bt-surface" data-level="card">…</div>
<button class="bt-press bt-focus">…</button>
```

### Level 2 — compose components
```tsx
<Inspector>
  <Inspector.Section title="Card" onReset={reset}>
    <Inspector.Row label="Scale"><Slider value={scale} onValueChange={setScale} format="%" /></Inspector.Row>
    <Inspector.Row label="Edge"><SegmentedControl items={["Plain", "Outline", "Glow"]} … /></Inspector.Row>
  </Inspector.Section>
</Inspector>
```

### Level 3 — patterns
`<AppShell header={…} inspector={…}>{stage}</AppShell>`, `<Page><SplitHero …/><Bento>…</Bento></Page>` — whole screens that already obey the layout rules.

## Component contract (every component, no exceptions)

- Accepts `ref` as a regular prop (React 19 — no `forwardRef`); spreads `...rest` onto the root; accepts `className` and `style`.
- Controlled **and** uncontrolled, with the same names everywhere: `value` / `defaultValue` / `onValueChange` for a selected value, and `open` / `defaultOpen` / `onOpenChange` for anything that opens (dialogs, menus, popovers, tooltips, sheets).
- Shared prop vocabulary: `size`, `variant`, `disabled`, `label`, `asChild`. No synonyms.
- `asChild` where it wraps a single element (Radix `Slot`).
- Stamps `data-bt="<Name>"` plus state attributes (`data-state`, `data-size`, `data-variant`, `data-disabled`) — styling hooks and what `LayoutGuard`/`@buttery/test` scan. Fixed-height controls also stamp `data-bt-control`; internal parts stamp `data-bt-part`; extended hit areas use `data-bt-hit`.
- Compound API for multi-part components (`Inspector.Section`, `Menu.Item`, `Onboarding.Step`).
- Variants are data attributes styled in the component's own CSS file using tokens (component-internal sizes as `--bt-<component>-*` variables).
- Keyboard complete, screen-reader labelled, `:focus-visible` ring, works with motion disabled.
- No outer margin. Height from tokens. Text truncation declared.
- Every exported component and prop has a short, factual JSDoc comment (what it is, when to use it, the default). No other comments unless a non-obvious *why* needs one — see the authorship section of `AGENTS.md`.
- Ships with: playground page (variants × states × themes × densities), 2–4 canonical examples in `examples/`, Vitest behavior tests, `expectButtery` coverage, and an entry in `manifest.json` (generated).

`scripts/new-component.mjs <Name>` generates all of that from a template, so new components start compliant.

## Theming & extension

- `createTheme({ accent, primary, neutral: "gray" | "warm" | "cool", radius: "soft" | "default" | "crisp", density })` → returns a CSS-variable map; `ButteryProvider theme={…}` applies it. Dark is derived automatically and can be overridden token by token.
- `ButteryProvider` props: `theme`, `colorScheme` (`light | dark | system`), `density` (`comfortable | compact`), `platform` (`web | desktop`, auto-detected under Tauri — desktop uses the default cursor on controls, not the pointer hand), `reducedMotion`.
- Tailwind v4 users: `@import "@buttery/core/tailwind.css";` maps tokens to `@theme` (e.g. `bg-surface`, `rounded-card`, `shadow-floating`, `h-control`, `ease-buttery`).
- Palettes (gradient + solid presets) are data in `@buttery/core/palettes` — swap or extend per app.

## Desktop (Tauri v2)

- `apps/starter` includes `src-tauri/` (generated with `pnpm tauri init`). Window: 1280×820 default, min 960×640, macOS overlay title bar (`titleBarStyle: "Overlay"`, `hiddenTitle: true`) with `trafficLightPosition` (x 28, y 46) placing the window controls on the 56px header's middle line. macOS first: other platforms get native window decorations.
- `HeaderBar dragRegion` → `data-tauri-drag-region="deep"` + `--bt-inset-titlebar` for the traffic lights. In Tauri 2.12 a bare attribute only drags on clicks on the element itself; `"deep"` drags from anywhere in the header while buttons and links stay clickable. The drag needs the `core:window:allow-start-dragging` permission.
- No network fonts or CDN assets anywhere (desktop must work offline).
- Shortcuts use a shared `useShortcut("mod+o", …)` that maps `mod` to ⌘/Ctrl per platform.
- Layout checks run in WebKit too, because Tauri on macOS renders with WKWebView. Playwright's WebKit is its own build, so every phase stop also includes a short manual pass in the real desktop app.

## Starting a new app

Inside the monorepo:
```
pnpm new-app my-app              # copies apps/starter → apps/my-app, renames, installs
pnpm --filter my-app dev         # web
pnpm --filter my-app tauri dev   # desktop
```
Outside the monorepo (after publishing): `npx create-buttery my-app`, or `npx buttery init` in an existing React app (adds packages, provider, styles, lint config, agent instructions and the skill).

## Publishing (later)

Packages publish under the `@buttery` npm org; the unscoped `buttery` name belongs to someone else, and `create-buttery` is free. The packages stay `private` until the first publish in Phase 8. Packages ship their docs (`@buttery/core/docs/*.md`), `llms.txt`, and `manifest.json` so agents in consuming apps can read them from `node_modules`.
