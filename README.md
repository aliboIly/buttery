# 🧈 buttery

Make anything buttery.

buttery is a React design system and layout and motion framework for web apps and Tauri desktop apps. Wrap an app in it and you get the tokens, type, surfaces, motion and layout rules described in `docs/`, plus checks that fail when something overlaps, overflows or drifts off the scale.

It's early: the foundation is in place and nothing is published yet. `ROADMAP.md` shows where things stand.

## Requirements

- Node 22.18+ or 24.11+
- pnpm 12 (`corepack enable` picks up the pinned version)
- For the desktop app: Rust (`rustup`) and Xcode Command Line Tools (`xcode-select --install`)

## Commands

| Command | What it does |
| --- | --- |
| `pnpm install` | Installs dependencies and the git hooks |
| `pnpm dev` | Starts the playground |
| `pnpm build` | Builds every package and app |
| `pnpm check` | Authorship and private-path checks, typecheck, lint, stylelint, format check, unit and smoke tests |
| `pnpm test:layout` | Layout checks across the full viewport, theme and density matrix (from Phase 2) |
| `pnpm --filter starter tauri dev` | Runs the starter as a desktop app |
| `pnpm new-app <name>` | Copies `apps/starter` to `apps/<name>` |

## Layout

| Path | Contents |
| --- | --- |
| `packages/core` | Tokens, recipes, primitives, layers and motion presets |
| `packages/react` | Components and patterns |
| `packages/test` | `expectButtery()` layout checks for Playwright |
| `packages/lint` | ESLint and stylelint configs |
| `packages/cli`, `packages/mcp` | The command line and the MCP server (not started) |
| `apps/playground` | Every component in every state; the layout checks run against it |
| `apps/starter` | The template for new apps, with a Tauri v2 shell |
| `docs/` | Architecture, design, motion and layout specs |

## Contributing

`AGENTS.md` has the rules for anyone changing the code, people and coding agents alike: tokens only, the layout rules, the component contract, and how commits and comments are written.

## License

MIT
