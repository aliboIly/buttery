# 🧈 buttery — Developer & Agent Experience

buttery should be **the easiest correct way to build UI** — for a developer in VS Code and for a coding agent (Claude Code, Codex, Gemini CLI, Cursor, Copilot) in a terminal. If either one has to guess, buttery failed, not them.

## Principles
1. Zero-config start. One provider, two CSS imports, and it already looks and moves right.
2. One vocabulary. The same prop names everywhere (`value`/`defaultValue`/`onValueChange`, `checked`/`defaultChecked`/`onCheckedChange` for something on or off, `open`/`defaultOpen`/`onOpenChange`, `size`, `variant`, `disabled`, `label`, `asChild`). No synonyms, no per-component dialects. Predictable APIs are what make agents reliable.
3. Wrong is a type error. Spacing, sizes, surfaces, motion presets and variants are string/number unions of tokens, so a bad value fails `tsc` before anyone sees it.
4. Errors teach. Every dev warning names the problem, the fix and a docs link, in one line:
   `[buttery:IconButton] needs a "label" (tooltip + screen readers). Fix: <IconButton label="Undo" …/> → docs/icon-button#label`
5. Machine-readable everything. Anything a human reads in the docs, an agent can read as structured data.
6. Checks close the loop. Layout/motion/a11y problems come back as JSON with a suggested fix, so an agent can fix its own work without a human pointing at screenshots.

## For developers

| Tool | What it does |
|---|---|
| `npx create-buttery my-app --template blank\|dashboard\|editor\|marketing` | New Vite + React (+ optional Tauri) app, fully wired, with agent files. `dashboard` starts from the App kit (sidebar shell, overview, a table page, settings), `editor` from the inspector shell, `marketing` from the page patterns. Each passes `buttery check` with zero edits. Until it's published, `pnpm new-app my-app --template <name>` makes the same apps inside the buttery repository, from `apps/starter` (`blank`) and `apps/templates/<name>`. |
| `npx buttery init` | Adds buttery to an existing React app: packages, provider, styles, font, lint config, `AGENTS.md` section, `CLAUDE.md` import, skill. Idempotent. |
| `buttery add <pattern>` | Scaffolds a screen from a pattern (`app-shell`, `settings`, `onboarding`, `marketing-page`, `article`). |
| `buttery add page table\|detail\|overview\|settings\|empty\|feature-intro` | Adds an App kit page to a dashboard app: a filtered table, a detail page with a right rail, an overview of metric cards and charts, a settings index, an empty state, a feature intro. Each passes `buttery check` with zero edits. |
| `buttery create component <Name>` | Scaffolds your own component the way `pnpm new-component` does in this repo: a folder with the component built on public parts only, its CSS on tokens, tests, a playground demo and examples, so it comes out buttery and passes the same checks. |
| `buttery doctor` | Verifies setup (provider, styles, font, React version, lint, Tauri config) and prints exact fixes. |
| `buttery check [url]` | Runs `expectButtery` against a running app across the matrix. `--json` for machines. |
| `buttery migrate` | Codemods for breaking changes between versions. |
| Playground = docs | Per component: live demo, props table generated from types, examples, do/don't, a11y and motion notes, search. |
| JSDoc | Every component and prop: what, when, default, `@example`. Shows up in editor hovers. |
| VS Code | Recommended extensions, `--bt-*` autocomplete, snippets (`btshell`, `btsection`, `btrow`, `btbento`…), tasks for dev/check. |

## Make any app

buttery has to hold for code it didn't write. Three things make that true:
- The public kit is the whole kit. buttery's own components use only what a user can import: `Surface`, `Pressable`, `Control`, `Field`, `SharedIndicator`, `Presence`, `Morph`, the layer primitives (`Layer`, `Portal`, `Popover`, `Menu`, `Scrim`, `Sticky`, `FloatingLanes`), `useControllableState`, `useButteryTransition`, `useLayoutAnimation` and `variants()`. The contract test fails when a component imports a helper the packages don't export, so a custom component can always be built the way buttery builds its own.
- `variants()` turns typed variant props into the `data-*` attributes and class a component's CSS reads, so a custom component styles its variants the way buttery's do.
- The checks run on user code. `LayoutGuard` watches any app wrapped in `ButteryProvider`, `buttery check` runs `expectButtery` on any running app, and `@buttery/lint` applies the token, position and motion rules to the app's own CSS and TSX.

Two guides ship with the docs: "Build an app in 15 minutes" (a dashboard from the template to a filtered table page) and "Build your own buttery component" (a `Stepper` built from `Control`, `Pressable`, `SharedIndicator`, `variants()` and `useControllableState`).

## For coding agents

### 1. Instructions every agent reads
- `AGENTS.md` is the single source of truth (Codex, Cursor, Copilot and others read it natively).
- `CLAUDE.md` contains `@AGENTS.md` plus Claude-specific notes (Claude Code skips `AGENTS.md` when a `CLAUDE.md` exists, so the import is required).
- `.gemini/settings.json` sets `"context": { "fileName": ["AGENTS.md", "GEMINI.md"] }` so Gemini CLI loads it.
- `buttery init` writes the same setup into consuming apps (appending a delimited "buttery" section to an existing `AGENTS.md`, never overwriting it).

### 2. Knowledge shipped in the packages (readable from `node_modules`)
- `llms.txt` (index with one line per doc/component) and `llms-full.txt` (everything concatenated) — in `@buttery/core` and on the docs site.
- `manifest.json` (generated at build from types + JSDoc): every primitive/component/pattern → purpose, use when / don't use when, props (type, default, required, allowed token values), compound parts, examples, related components, a11y notes, motion class.
- `tokens.json` — every token with its value per theme and density and what it's for.
- `examples/` — 2–6 canonical, copy-pasteable snippets per component. Agents copy examples more reliably than they follow prose.
- `docs/*.md` — the specs themselves.

### 3. `@buttery/mcp` — MCP server
Any MCP-capable agent can query buttery instead of guessing.

| Tool | Returns |
|---|---|
| `list_components(query?)` | Names + one-line purpose |
| `get_component(name)` | Manifest entry + examples |
| `find_component(description)` | Best matches, e.g. "toggle between 3 options" → `SegmentedControl` |
| `get_tokens(category?)` | Tokens with values and roles |
| `get_pattern(name)` | Pattern template + when to use it |
| `explain_rule(id)` | The layout or motion rule, with a do/don't example |
| `check_layout(url, options?)` | Runs `expectButtery`, returns JSON violations with fixes |
| `scaffold_page(kind, options?)` | Files for an App kit page (`table`, `detail`, `overview`, `settings`, `empty`, `feature-intro`), as `buttery add page` writes them |
| `scaffold_component(name, purpose)` | Files for a custom component on public parts, as `buttery create component` writes them |

Resources: every doc in `docs/`. Transport: stdio (`npx @buttery/mcp`). Phase 8 adds ready-made config for Claude Code (`.mcp.json`), Codex, Gemini CLI and Cursor — checked against each tool's current docs at that time.

### 4. Parseable feedback
`LayoutGuard` console output and `buttery check --json` share one format:
```json
{ "rule": "overlap", "a": "[data-bt=\"Inline\"] > [data-bt=\"Button\"]:nth-child(2)", "b": "[data-bt=\"Chip\"]", "px": 12,
  "message": "overlaps [data-bt=\"Chip\"] by 12px × 20px",
  "fix": "Lay them out with Stack, Inline or Grid and a gap, or move extra items into OverflowCluster. …",
  "page": "settings", "viewport": "390x844", "theme": "dark", "density": "comfortable", "engine": "webkit" }
```

`a` is always the offending element and `b` the second one for overlaps; `px` is how far off it is where that applies. `LayoutGuard` logs the same objects without the page and conditions.

### 5. Skill
`.claude/skills/make-it-buttery/SKILL.md` is the step-by-step procedure for building or converting UI. Claude Code loads it as a skill; `AGENTS.md` points every other agent at the same file.

### 6. Agent eval (keeps us honest)
Phase 8 includes a repeatable eval: in a fresh `create-buttery` app, give Claude Code, Codex and Gemini CLI the same tasks — "build a settings screen", "make this messy form buttery", "add a 3-step onboarding", "build a pricing page", "add a toolbar with 10 actions that must fit at 390px", "build a filtered table page", "create a custom component that matches buttery". Score each with `buttery check --json` (pass/fail per rule) plus a screenshot review. Record results in `docs/AGENT_EVAL.md`; anything that repeatedly trips agents becomes a better API, example, warning or doc.
