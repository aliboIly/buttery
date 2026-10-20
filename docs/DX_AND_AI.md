# 🧈 buttery — Developer & Agent Experience

buttery should be **the easiest correct way to build UI** — for a developer in VS Code and for a coding agent (Claude Code, Codex, Gemini CLI, Cursor, Copilot) in a terminal. If either one has to guess, buttery failed, not them.

## Principles
1. **Zero-config start.** One provider, two CSS imports, and it already looks and moves right.
2. **One vocabulary.** The same prop names everywhere (`value`/`defaultValue`/`onValueChange`, `size`, `variant`, `disabled`, `label`, `asChild`). No synonyms, no per-component dialects. Predictable APIs are what make agents reliable.
3. **Wrong is a type error.** Spacing, sizes, surfaces, motion presets and variants are string/number unions of tokens, so a bad value fails `tsc` before anyone sees it.
4. **Errors teach.** Every dev warning names the problem, the fix and a docs link, in one line:
   `[buttery:IconButton] needs a "label" (tooltip + screen readers). Fix: <IconButton label="Undo" …/> → docs/icon-button#label`
5. **Machine-readable everything.** Anything a human reads in the docs, an agent can read as structured data.
6. **Checks close the loop.** Layout/motion/a11y problems come back as JSON with a suggested fix, so an agent can fix its own work without a human pointing at screenshots.

## For developers

| Tool | What it does |
|---|---|
| `npx create-buttery my-app` | New Vite + React (+ optional Tauri) app, fully wired, with agent files. |
| `npx buttery init` | Adds buttery to an existing React app: packages, provider, styles, font, lint config, `AGENTS.md` section, `CLAUDE.md` import, skill. Idempotent. |
| `buttery add <pattern>` | Scaffolds a screen from a pattern (`app-shell`, `settings`, `onboarding`, `marketing-page`, `article`). |
| `buttery doctor` | Verifies setup (provider, styles, font, React version, lint, Tauri config) and prints exact fixes. |
| `buttery check [url]` | Runs `expectButtery` against a running app across the matrix. `--json` for machines. |
| `buttery migrate` | Codemods for breaking changes between versions. |
| Playground = docs | Per component: live demo, props table generated from types, examples, do/don't, a11y and motion notes, search. |
| JSDoc | Every component and prop: what, when, default, `@example`. Shows up in editor hovers. |
| VS Code | Recommended extensions, `--bt-*` autocomplete, snippets (`btshell`, `btsection`, `btrow`, `btbento`…), tasks for dev/check. |

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
- `examples/` — 2–4 canonical, copy-pasteable snippets per component. Agents copy examples more reliably than they follow prose.
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

Resources: every doc in `docs/`. Transport: stdio (`npx @buttery/mcp`). Phase 8 adds ready-made config for Claude Code (`.mcp.json`), Codex, Gemini CLI and Cursor — checked against each tool's current docs at that time.

### 4. Parseable feedback
`LayoutGuard` console output and `buttery check --json` share one format:
```json
{ "rule": "overlap", "a": "[data-bt=Button]:nth-of-type(2)", "b": "[data-bt=Chip]", "px": 12,
  "viewport": "390x844", "theme": "dark", "fix": "Put both in <Inline gap={2}> or move the chip into OverflowCluster." }
```

### 5. Skill
`.claude/skills/make-it-buttery/SKILL.md` is the step-by-step procedure for building or converting UI. Claude Code loads it as a skill; `AGENTS.md` points every other agent at the same file.

### 6. Agent eval (keeps us honest)
Phase 8 includes a repeatable eval: in a fresh `create-buttery` app, give Claude Code, Codex and Gemini CLI the same tasks — "build a settings screen", "make this messy form buttery", "add a 3-step onboarding", "build a pricing page", "add a toolbar with 10 actions that must fit at 390px". Score each with `buttery check --json` (pass/fail per rule) plus a screenshot review. Record results in `docs/AGENT_EVAL.md`; anything that repeatedly trips agents becomes a better API, example, warning or doc.
