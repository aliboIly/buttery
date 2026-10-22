<div align="center">

<h1>🧈 buttery</h1>

<p><b>Make anything buttery.</b></p>

A React design system, with layout and motion rules to match, for web apps and Tauri desktop apps.

[Docs](https://aliboily.github.io/buttery/) · [Get started](https://aliboily.github.io/buttery/get-started/introduction) · [Components](https://aliboily.github.io/buttery/components/overview) · [Roadmap](ROADMAP.md)

[![License: MIT](https://img.shields.io/badge/license-MIT-e8b64a?style=flat-square)](LICENSE)
[![Status: early](https://img.shields.io/badge/status-early-6b6b6b?style=flat-square)](ROADMAP.md)
![React 19](https://img.shields.io/badge/React-19-2862e0?style=flat-square)
![TypeScript 7](https://img.shields.io/badge/TypeScript-7-2862e0?style=flat-square)
![Tauri v2](https://img.shields.io/badge/Tauri-v2-2862e0?style=flat-square)

</div>

Wrap an app in buttery and it gets the tokens, type, surfaces, motion and layout rules written up in [`docs/`](docs), plus checks that fail when something overlaps, overflows or drifts off the scale. People and coding agents work from the same small vocabulary, and a wrong value fails type-checking instead of shipping.

The tokens, primitives, layers, motion, over a hundred components and patterns, four templates and the docs site are in place. Nothing is on npm yet: 1.0, the first release there, brings the command line tool and the MCP server. [ROADMAP.md](ROADMAP.md) shows where things stand.

## What's in it

<table>
<tr>
<td width="33%" valign="top">

### Tokens

Color, type, spacing, heights, radii, shadows, layers and motion as CSS variables and typed TypeScript. Light, dark and a compact density are built in.

</td>
<td width="33%" valign="top">

### Surfaces

Eight levels, from the app background down to an inset well. A nested surface keeps concentric corners and the same inset on every side.

</td>
<td width="33%" valign="top">

### Text

Thirteen text roles and four fluid display roles. Text stacks trim to the cap height, so the gap in the spec is the gap on screen.

</td>
</tr>
<tr>
<td width="33%" valign="top">

### Themes

`createTheme` builds a theme from an accent, a primary, a gray tint and a corner scale, and derives the dark values. The defaults pass WCAG AA for every active text pair in both themes.

</td>
<td width="33%" valign="top">

### Palettes

24 gradients and 18 solids, defined in OKLCH and blended in OKLab so the midpoints don't go gray.

</td>
<td width="33%" valign="top">

### Desktop

The starter runs as a Tauri v2 app with an overlay title bar, a header that drags the window, and fonts bundled for offline use.

</td>
</tr>
<tr>
<td width="33%" valign="top">

### Plain HTML

The recipes are classes and data attributes, so markup that isn't React can use surfaces, text roles and controls too.

</td>
<td width="33%" valign="top">

### Tailwind

A Tailwind v4 bridge maps the tokens to utilities such as `bg-surface`, `rounded-card` and `h-control`, and they follow the theme.

</td>
<td width="33%" valign="top">

### Agents

Coding agents get the rules people get: `AGENTS.md`, the make-it-buttery skill, and `tokens.json` with every value and what it's for.

</td>
</tr>
<tr>
<td width="33%" valign="top">

### Primitives

`Stack`, `Inline`, `Grid`, `Surface`, `Text`, `Icon`, `FitBox` and the rest lay things out with spacing steps instead of margins, and `OverflowCluster` folds actions into a menu instead of wrapping.

</td>
<td width="33%" valign="top">

### Layers

`Popover`, `Layer`, `Scrim`, `Sticky` and `FloatingLanes` own everything out of flow, so z-indexes stay on the bands and floating UI stays inside the viewport.

</td>
<td width="33%" valign="top">

### Layout checks

`expectButtery` fails a Playwright test on overlap, overflow, off-scale spacing, small targets, contrast and layout shift, with a fix for each. `LayoutGuard` outlines the layout problems among them while you work.

</td>
</tr>
<tr>
<td width="33%" valign="top">

### Motion

Five springs and the primitives built on them: `Presence`, `Morph`, `SharedIndicator`, `Reveal`, `Stagger`, `Loop` and `celebrate()`. A Playwright test reads each of them every frame in Chromium and WebKit and checks the curve against its token. `Loop`'s steps are timed on a fake clock.

</td>
<td width="33%" valign="top">

### Wrap anything

`buttery.div` and `buttery(Component)` add a surface, spacing, press and focus feedback, hover, an entrance or layout animation through token-typed props.

</td>
<td width="33%" valign="top">

### Reduced motion

Springs land at once, fades take 100ms, loops hold still and confetti stays off. Every animated component renders its final state with motion off.

</td>
</tr>
</table>

## A quick look

Nothing is published yet, so for now this works inside the repo, where apps import the workspace packages directly.

```tsx
import "@buttery/core/styles.css";
import "@buttery/react/styles.css";
import { createTheme } from "@buttery/core";
import { ButteryProvider } from "@buttery/react";

const theme = createTheme({ accent: "#1f8a70", radius: "soft" });

function Root() {
  return (
    <ButteryProvider theme={theme}>
      <App />
    </ButteryProvider>
  );
}
```

`ButteryProvider` follows the OS color scheme and motion setting. Pass `colorScheme="dark"`, `density="compact"` or `reducedMotion="always"` to pin them, and read what it resolved with `useButtery()`.

Without React, the same recipes are plain markup:

```html
<section class="bt-surface" data-level="card">
  <h2 class="bt-text" data-role="title">Your canvas is empty</h2>
  <p class="bt-text" data-role="body-sm">Start a fresh card, or open one from your library.</p>
</section>
```

With Tailwind v4, import the bridge after Tailwind and keep `@buttery/core/styles.css`, which defines the variables the utilities read:

```css
@import "tailwindcss";
@import "@buttery/core/tailwind.css";
```

```html
<div class="bg-surface rounded-card shadow-card p-4 text-fg">…</div>
```

## Requirements

- Node 22.18+, 24.11+ or 26+
- pnpm 12.14, the version `packageManager` pins. On Node 22 and 24, `corepack enable` installs it; Node 25 and later don't ship Corepack, so run `npm install -g pnpm@12.14.0` there.
- For the desktop app: Rust (`rustup`) and Xcode Command Line Tools (`xcode-select --install`)

## Commands

| Command | What it does |
| --- | --- |
| `pnpm install` | Installs dependencies and the git hooks |
| `pnpm dev` | Runs the docs site, with a page for every component |
| `pnpm build` | Builds every package and app |
| `pnpm tokens` | Regenerates the CSS, JSON and Tailwind files from the token source |
| `pnpm check` | Authorship and private-path checks, typecheck, lint, stylelint, format check, unit, browser and smoke tests, and layout checks on every playground page and the starter at 390 and 1280 |
| `pnpm test:layout` | Layout checks across the full viewport, theme and density matrix; `--reporter=json` prints one report |
| `pnpm new-component <Name> --purpose "…"` | Scaffolds a component folder that passes the contract once it's filled in |
| `pnpm --filter starter tauri dev` | Runs the starter as a desktop app |
| `pnpm --filter demo-roastery dev` | Runs a demo on its own (`demo-card-studio`, `demo-card-studio-site` and `demo-roastery`) |
| `pnpm demos:previews` | Retakes the demos' pictures for the docs site's demos page |
| `pnpm new-app <name> --template <template>` | Copies a template to `apps/<name>`: `blank` (the starter, the default), `dashboard`, `editor` or `marketing` |

## Repo layout

| Path | Contents |
| --- | --- |
| `packages/core` | Tokens, recipes, themes, palettes, layout and motion primitives, layers and the layout checker |
| `packages/react` | `ButteryProvider`, the components and patterns, `celebrate` and the `buttery` factory |
| `packages/test` | `expectButtery()`: layout, accessibility and stability checks for Playwright |
| `packages/lint` | ESLint and stylelint rules that keep values on tokens and positioning owned |
| `packages/cli`, `packages/mcp` | The command line tool and the MCP server, coming in 1.0 |
| `apps/docs` | The docs site: a page for every component with its demos and examples; the layout checks run against it |
| `apps/starter` | The blank template for new apps, with a Tauri v2 shell |
| `apps/templates` | The dashboard, editor and marketing templates, web apps built from the patterns |
| `apps/demos` | The demo apps, each a template with its own content, which the docs site serves under `/demos` |
| `docs/` | Architecture, design, motion and layout specs |

## Docs

| Doc | What it covers |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | Packages, layers, APIs and the component contract |
| [Design spec](docs/DESIGN_SPEC.md) | Tokens and measured component specs |
| [Motion spec](docs/MOTION_SPEC.md) | Motion rules, tokens and timings |
| [Layout rules](docs/LAYOUT_RULES.md) | The no-overlap, sizing and uniformity rules and how they're checked |
| [Developer and agent experience](docs/DX_AND_AI.md) | What buttery gives people and coding agents |
| [Build plan](docs/BUILD_PLAN.md) | Phases and acceptance criteria |
| [Decisions](docs/DECISIONS.md) | Judgment calls and the reasons for them |

## Contributing

[AGENTS.md](AGENTS.md) has the rules for anyone changing the code, people and coding agents alike: tokens only, the layout rules, the component contract, and how commits and comments are written.

## License

[MIT](LICENSE) © Ali Adam
