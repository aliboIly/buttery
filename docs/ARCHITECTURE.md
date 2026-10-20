# 🧈 buttery — Architecture

## What buttery is

A React design system + layout/motion framework. Its job: **anything built with it — or wrapped in it — comes out buttery** (the look in `DESIGN_SPEC.md`, the motion in `MOTION_SPEC.md`, the layout guarantees in `LAYOUT_RULES.md`) with very little effort — whether the builder is a developer or a coding agent. See `DX_AND_AI.md`.

Targets: web apps and desktop apps (Tauri v2 wraps the same web code).

## Stack (current stable as of Oct 2026 — verify with `npm view <pkg> version` before installing)

| Concern | Choice |
|---|---|
| Language / UI | TypeScript 7, React 19 |
| Monorepo | pnpm workspaces |
| Accessible behavior | `radix-ui` (unified package) — Dialog, DropdownMenu, NavigationMenu, Popover, Slider, ToggleGroup, RadioGroup, Tooltip, Slot |
| Motion | `motion` (`motion/react`) |
| Icons | `lucide-react` (16px, stroke 1.75) |
| Styling | Plain CSS + CSS custom properties, in cascade layers. No CSS-in-JS runtime. Optional Tailwind v4 bridge. |
| Font | Inter Variable via `@fontsource-variable/inter` (bundled — works offline in desktop apps) |
| Library build | `tsdown` (ESM + `.d.ts`), CSS concatenated per package |
| App build | Vite 8 |
| Desktop | Tauri v2 |
| Tests | Vitest + Testing Library (behavior), Playwright in Chromium **and WebKit** (layout, visual, a11y via `@axe-core/playwright`) |
| Formatting / lint | Prettier, ESLint (typescript-eslint), stylelint |
| Agent tooling | `@modelcontextprotocol/sdk` (for `@buttery/mcp`) |
| Releases | Changesets |

**TypeScript 7 caveat:** TS 7 is the native (Go) compiler. Use it for type-checking, but some tools (`.d.ts` emit in tsdown, typescript-eslint) may still need the JS-API `typescript` package. In Phase 0, verify both work; if not, install TS 6 alongside for tooling and record it in `docs/DECISIONS.md`.

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
│  ├─ new-component.mjs          # scaffolds a component that already follows every rule
│  └─ new-app.mjs                # copies apps/starter → apps/<name>
└─ tooling/                      # shared tsconfig, vite, playwright configs
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
Props (all optional, all token-typed so wrong values fail type-checking): `surface` (`panel|section|card|raised|floating|dialog|inset`), `radius` (`auto` = concentric from parent), `pad`, `gap` (spacing-scale steps), `stack`/`inline`/`grid`, `press`, `focus`, `hover` (`lift|tint`), `enter` (`fade|rise|pop|stagger`), `layout` (animate layout changes), `truncate`.

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
- Controlled **and** uncontrolled (`value` / `defaultValue` / `onValueChange` — same names everywhere).
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

- `apps/starter` includes `src-tauri/` (generated with `pnpm tauri init`). Window: 1280×820 default, min 960×640, macOS overlay title bar (`titleBarStyle: "Overlay"`, `hiddenTitle: true`).
- `HeaderBar dragRegion` → `data-tauri-drag-region` + `--bt-inset-titlebar` for the traffic lights.
- No network fonts or CDN assets anywhere (desktop must work offline).
- Shortcuts use a shared `useShortcut("mod+o", …)` that maps `mod` to ⌘/Ctrl per platform.
- Layout checks run in WebKit too, because Tauri on macOS renders with WKWebView.

## Starting a new app

Inside the monorepo:
```
pnpm new-app my-app              # copies apps/starter → apps/my-app, renames, installs
pnpm --filter my-app dev         # web
pnpm --filter my-app tauri dev   # desktop
```
Outside the monorepo (after publishing): `npx create-buttery my-app`, or `npx buttery init` in an existing React app (adds packages, provider, styles, lint config, agent instructions and the skill).

## Publishing (later)

`buttery` is taken on npm (placeholder package). Before publishing, create the npm org `buttery` to own `@buttery/*` — or publish under your own scope. Workspace names work locally regardless. Packages ship their docs (`@buttery/core/docs/*.md`), `llms.txt`, and `manifest.json` so agents in consuming apps can read them from `node_modules`.
