<!-- buttery:start — merge this block into AGENTS.md; keep the markers so tools can update it later -->
# 🧈 buttery — instructions for coding agents

buttery is a React design system + layout/motion framework for web and desktop (Tauri v2) apps. Its purpose: anything built with it — or wrapped in it — looks, moves and lays out "buttery" with minimal effort, for developers and for coding agents alike.

## Read before any work
- `ROADMAP.md` — where the project is; what's next
- `docs/BUILD_PLAN.md` — phases and acceptance criteria
- `docs/ARCHITECTURE.md` — packages, layers, APIs, component contract
- `docs/DESIGN_SPEC.md` — tokens and measured component specs (the look)
- `docs/MOTION_SPEC.md` — motion rules, tokens, measured timings
- `docs/LAYOUT_RULES.md` — the no-overlap / sizing / uniformity contract and its automated checks
- `docs/DX_AND_AI.md` — developer and agent experience requirements
- `docs/BRAND.md` — name, 🧈 usage, the mark
- `docs/DECISIONS.md` — judgment calls already made
- `reference/README.md` — what each reference image shows

## Non-negotiables
1. **Tokens only.** No raw colors, sizes, radii, shadows, durations or z-indexes outside `packages/core/src/tokens/`, except component-scoped `--bt-<component>-*` variables declared at the top of a component's CSS. If no token fits, use the nearest one or add a token and log why in `docs/DECISIONS.md`.
2. **Layout rules are law.** Follow all 13 rules in `docs/LAYOUT_RULES.md` §1: flow layout with `gap`; no outer margins on components; no negative margins; absolute/fixed/sticky only in layer primitives and component-internal parts; heights from tokens; `min-width: 0`; declared truncation; container queries; `OverflowCluster` instead of wrapping.
3. **Component contract.** Every component follows `docs/ARCHITECTURE.md` → "Component contract": accepts `ref` as a prop, controlled + uncontrolled, one shared prop vocabulary, `data-bt*` attributes, JSDoc on every export and prop, keyboard + screen reader, works with motion off, no outer margin. Create components with `pnpm new-component <Name>` once it exists.
4. **Motion rules.** Direct manipulation is instant; discrete changes use `spring.smooth`; indicators use `spring.snappy`; one surface morphs instead of closing and reopening; exits faster than entrances; reduced motion via `useButteryTransition`. Animate only transform, opacity, color, shadow and filter; layout through Motion `layout` (the `Morph` height animation is the one exception). No `transition: all`.
5. **buttery has its own identity.** References are inspiration. Never copy the reference products' branding, names, logos, icons, illustrations, copy or brand gradients. Never use Apple's (or any vendor's) emoji artwork as an image — use the 🧈 character in text and the original `BrandMark` elsewhere. Demo apps are original.
6. **Accessibility is part of done.** Radix for behavior, visible `:focus-visible` ring, AA contrast for active text, hit areas ≥ 24×24 (standalone buttons ≥ 28 tall), full keyboard support.
7. **Agent-friendly by construction.** Token-typed props, one vocabulary, warnings that say how to fix, generated `manifest.json` / `tokens.json` / `llms.txt`, canonical examples. If an agent (including you) gets something wrong twice, improve the API, example, warning or doc — note it in `docs/DECISIONS.md`.
8. **No CSS-in-JS runtime, no network fonts or CDNs** (desktop apps must work offline). Ask before adding any dependency not listed in `docs/ARCHITECTURE.md`.

## Code quality bar
The code should read like a strong senior TypeScript/React engineer wrote it by hand.

**TypeScript**
- tsconfig: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`; packages also use `isolatedDeclarations`.
- No `any` (use `unknown` and narrow), no non-null `!`, no `@ts-ignore`. `as` only at validated boundaries; prefer `satisfies` and `as const`.
- Model variants and state as discriminated unions; exhaustive `switch` with a `never` check. No enums. Token values are literal unions derived from the token source.
- Explicit return types on exports, `import type` for types, named exports only in packages.
- ESLint: typescript-eslint `strict-type-checked` + `stylistic-type-checked`, `react-hooks`, `jsx-a11y`; zero warnings (`--max-warnings=0`).

**React 19**
- Function components; `ref` as a regular prop (no `forwardRef`), no `React.FC`. Props extend `ComponentPropsWithRef<…>`; polymorphism through `asChild`, not an `as` prop.
- Render is pure and React Compiler–compatible: no mutation or side effects in render; derive values instead of syncing state in effects. Effects only synchronize with external systems, always clean up, and survive Strict Mode.
- `useSyncExternalStore` for external state (reduced motion, layer manager), `useId` for ids, one shared `useControllableState` for controlled/uncontrolled.
- Memoize only when referential stability is needed or a measurement says so. Hot paths (drag, pointermove) use refs, `requestAnimationFrame` and Motion values — never React state per frame.
- Compound components share state through context (split by update frequency), not `cloneElement`. Stable keys. No `window`/`document` access at module scope.

## Authorship and no AI tells
- **No AI attribution anywhere**: no `Co-Authored-By` trailers, no "Generated with…" lines, no 🤖, no mentions of AI, Claude or agents in commits, PRs, code, comments, docs or changelogs. `.claude/settings.json` turns off Claude Code's attribution — never add it back by hand.
- **Comments: default to none.** Names and structure carry the meaning. Allowed: short, factual JSDoc on exported public API (what, when, default), and rare one-line *why* comments for non-obvious constraints (a browser bug, a spec quirk). Banned: comments that narrate what the code does, change-log comments (`// added`, `// updated`, `// fixed`, `// new`), comments addressed to the reader, step numbers, section banners, emoji, commented-out code, TODOs without an issue link, `console.log`.
- **Commits:** conventional prefix, imperative subject ≤ 72 chars, a body only when the why isn't obvious. No bullet-list essays, no "This commit…".
- **Prose** (README, docs, PRs, changelogs): plain and specific, the way the maintainer would write it. No filler ("seamless", "robust", "leverage", "comprehensive", "delve", "elevate"), no em-dash-heavy sentences, no bold-label bullet lists, no recap of what was just said.
- **Enforced:** `scripts/check-ai-tells.mjs` runs in `pnpm check` and in a `commit-msg` hook, failing on attribution trailers, banned phrases, narrating or change-log comment patterns, and commented-out code.

## How to work
- Work **one phase at a time** from `docs/BUILD_PLAN.md`; tick items in `ROADMAP.md` as they land. At the end of each phase, stop, show screenshots and a short summary, and wait for the go-ahead.
- Before saying anything is done:
  1. `pnpm check` is green (from Phase 2 on it includes the layout suite).
  2. `pnpm test:layout` (`expectButtery`) is green for every page you touched — Chromium and WebKit, full viewport × theme × density matrix. Use `--reporter=json` and fix every violation at the root.
  3. You took screenshots and compared them with the relevant `reference/` images. List visible differences honestly; never claim a match you didn't check.
- When a spec is ambiguous or two docs conflict: pick the option that best honors `docs/LAYOUT_RULES.md`, log it in `docs/DECISIONS.md`, and mention it in your summary. Ask only when the choice is expensive to undo.
- Keep docs current: if an API, token or rule changes, update its doc in the same change.
- Prefer small, composable primitives over big configurable components. A one-off style usually means a missing primitive or token.
- Commits: small and focused, conventional prefixes (`feat(core):`, `fix(react):`, `docs:`), one phase item per commit where practical, following "Authorship and no AI tells" above.

## Commands (once Phase 0 exists)
- `pnpm dev` — playground
- `pnpm build` — all packages
- `pnpm check` — typecheck + lint + stylelint + unit tests (+ layout checks from Phase 2)
- `pnpm test:layout` — `expectButtery` across the matrix
- `pnpm new-component <Name>` — scaffold a compliant component
- `pnpm new-app <name>` — new app from `apps/starter`
- `pnpm --filter starter tauri dev` — desktop app

## Making things buttery
To build or restyle any UI with buttery, follow `.claude/skills/make-it-buttery/SKILL.md` step by step (Claude Code loads it as a skill; other agents read the file directly).
<!-- buttery:end -->
