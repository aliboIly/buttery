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
| `npx create-buttery my-app --template blank\|dashboard\|editor\|marketing` | New Vite + React (+ Tauri with `--desktop`) app in any folder, fully wired, with lint configs, Playwright specs, agent files and the MCP server in each agent's config. `dashboard` starts from the App kit with a page of every kind `add page` writes, `editor` from the inspector shell, `marketing` from the page patterns. Each passes its own specs and `buttery check` with zero edits (`pnpm test:apps`). Inside the buttery repository, `pnpm new-app my-app --template <name>` makes the same apps in `apps/`, from `apps/starter` (`blank`) and `apps/templates/<name>`. |
| `npx buttery init` | Adds buttery to an existing React app: packages, provider, styles (with the font), lint configs, `AGENTS.md` section, `CLAUDE.md` import, skill and MCP configs. Idempotent; lists what it can't do for certain. |
| `buttery add <pattern>` | A screen by its pattern's name: `settings`, `onboarding`, `marketing-page` and `article` are the matching pages; `app-shell` writes `src/AppFrame.tsx`, a sidebar and top bar to render pages in. |
| `buttery add page <kind> [--name]` | Writes a page from its pattern's whole-page example, framed in the page grammar (`table`, `detail`, `overview`, `settings`, `settings-index`, `catalog`, `plans`, `search-results`, `empty`, `feature-intro`, `sign-in`, `sign-up`, `onboarding`, `landing`, `article`, `faq`), to `src/pages`, and wires it into a dashboard app's routes, page switch and sidebar. Each passes `buttery check` with zero edits. |
| `buttery create component <Name> --purpose "…"` | Scaffolds your own component in `src/components/<Name>`: built on public parts only (`Slot`, `variants()`), its CSS on tokens, examples, a preview page the dev server serves, and a Playwright spec that runs `expectButtery` on it. |
| `buttery doctor` | Verifies setup (React version, packages at one version, styles at the entry and imported once, provider, network fonts, lint, Tauri window, what `check` needs, agent files) and prints exact fixes. |
| `buttery check [page…]` | Runs `@butteryui/test`'s checks on pages of the running app, starting its dev server when needed: 390 and 1280, light and dark, in Chromium; `--full` for every width, both densities and WebKit; `--json` for machines. Exits 1 on findings. |
| `buttery migrate` | Codemods for breaking changes between versions; none so far. |
| Playground = docs | Per component: live demo, props table generated from types, examples, do/don't, a11y and motion notes, search. |
| JSDoc | Every component and prop: what, when, default, `@example`. Shows up in editor hovers. |
| VS Code | Recommended extensions, `--bt-*` autocomplete, snippets (`btshell`, `btsection`, `btrow`, `btbento`…), tasks for dev/check. |

## Make any app

buttery has to hold for code it didn't write. Three things make that true:
- The public kit is the whole kit. buttery's own components use only what a user can import: `Surface`, `Pressable`, `Control`, `Field`, `SharedIndicator`, `Presence`, `Morph`, the layer primitives (`Layer`, `Portal`, `Popover`, `Menu`, `Scrim`, `Sticky`, `FloatingLanes`), `useControllableState`, `useButteryTransition`, `useLayoutAnimation` and `variants()`. The contract test fails when a component imports a helper the packages don't export, so a custom component can always be built the way buttery builds its own.
- `variants()` turns typed variant props into the `data-*` attributes and class a component's CSS reads, so a custom component styles its variants the way buttery's do.
- The checks run on user code. `LayoutGuard` watches any app wrapped in `ButteryProvider`, `buttery check` runs `expectButtery` on any running app, and `@butteryui/lint` applies the token, position and motion rules to the app's own CSS and TSX.

Two guides ship with the docs: "Build an app in 15 minutes" (a dashboard from the template to a filtered table page) and "Build your own buttery component" (a `Stepper` built from `Control`, `Pressable`, `SharedIndicator`, `variants()` and `useControllableState`).

## For coding agents

### 1. Instructions every agent reads
- `AGENTS.md` is the single source of truth (Codex, Cursor, Copilot and others read it natively).
- `CLAUDE.md` contains `@AGENTS.md` plus Claude-specific notes (Claude Code skips `AGENTS.md` when a `CLAUDE.md` exists, so the import is required).
- `.gemini/settings.json` sets `"context": { "fileName": ["AGENTS.md", "GEMINI.md"] }` so Gemini CLI loads it.
- `buttery init` writes the same setup into consuming apps (a delimited "buttery" section in an existing `AGENTS.md`, replaced in place on later runs and never overwriting the rest, the `CLAUDE.md` import, the skill, and the MCP server in each agent's config), and `create-buttery` gives every new app the same files.

### 2. Knowledge shipped in the packages (readable from `node_modules`)
An agent in an app reads the docs of the version it has installed, with no network: Codex's sandbox has none by default. The builds write these from the docs site's own sources (`packages/mcp/scripts/shipped.ts`, beside the MCP server's knowledge), so the packages, the site and the server agree for each version:
- `@butteryui/core/dist/llms.txt` (every page, a line each, linking to its Markdown) and `dist/llms-full.txt` (every page in one file), also at the docs site's root.
- `@butteryui/core/dist/docs/<path>.md`: every page of the docs site as Markdown, the Foundations, Layout and Motion pages carrying the specs' rules for app builders. Links between pages reach their files, so the docs read offline; a demo's link goes to the docs site.
- `@butteryui/core/dist/tokens.json`: every token with its value per theme and density and what it's for.
- `@butteryui/react/dist/manifest.json`: every primitive, layer, component and pattern, with the line that imports it, its purpose, use when and don't use when, props per part (type, default, required), related components, accessibility, keyboard, motion and layout notes, its page on the site and as Markdown, and its examples; plus the values each token and literal-union type its props take allows.
- `@butteryui/react/dist/examples/<Component>/<example>.tsx`: its 2–6 canonical examples, as their pages show them. Agents copy examples more reliably than they follow prose.
- `@butteryui/react/dist/knowledge.json`: what the MCP server answers from, so it answers for the version installed.

`pnpm test:apps` checks that the packages an app installs carry all of it, every link between the pages reaching its file.

### 3. `@butteryui/mcp` — MCP server
Any MCP-capable agent can look buttery up instead of guessing. Five read-only tools, in this order:

| Tool | Returns |
|---|---|
| `buttery_search({ query, kind?, limit? })` | One Markdown line per result, best first, from the docs site's own index and synonyms, ranked for agents (a component above a prop that shares a word): an id, its kind and what it's for. Ends with the `buttery_get` call for the top ids. `kind` narrows to component, pattern, page, guide, token, prop, example or rule; an empty query lists a kind. |
| `buttery_get({ ids, detail? })` | Up to 10 ids per call, as Markdown, for the installed version: a component's import, props with types and defaults, parts, the values its literal-union and token types take, one example and the ids of the rest; `detail: "full"` adds every part's props, accessibility, keyboard, motion and layout. Also a docs page or one section (`page/<route>#<section>`), a token group, a rule or check (`check/overlap` is the rule a violation names) and an example's code. Bare names and docs URLs work; an unknown id is an error naming the one meant and the call to make. |
| `buttery_scaffold({ kind, page? })` | A page to save, from its pattern's example that is a whole page (table, detail, overview, settings, settings-index, catalog, plans, search-results, empty, feature-intro, sign-in, sign-up, onboarding, landing, article, faq), with the ids of what it uses; or the setup for a new app. Writes nothing. |
| `buttery_lint({ files? \| code?, language? })` | JSON, its text exactly the structured content: the project's ESLint and stylelint with buttery's configs, plus literal prop values a component's types don't take (`gap="16px"` comes back as `gap={4}`). At most 50 problems, each with its fix; notes say what couldn't run and how to set it up. |
| `buttery_check_layout({ url, viewports?, themes?, engine? })` | JSON: `checkButtery` from the project's `@butteryui/test` in its Playwright, each problem once with its fix and the conditions it showed in, at most 30. Loopback URLs only, plus origins in `BUTTERY_MCP_ALLOW_URLS`. |

Resources: `buttery://docs/{+path}` (every docs page as Markdown, listed), `buttery://component/{name}` (completed, not listed, so a hundred components don't flood an `@` menu), `buttery://tokens/{group}` and `buttery://llms.txt`. Prompts: `make-it-buttery` (the skill), `build-page` (`kind`) and `review-ui` (`target`), each argument one word, since Claude Code splits prompt arguments on whitespace.

What the clients do decides the shapes (checked against each one's docs and source on 2026-10-22):
- Claude Code (since 2.1.292) and the Copilot CLI speak protocol 2026-07-28 over stdio; Codex, Gemini CLI, Cursor and VS Code's own client open with the 2025 `initialize` handshake. The server answers both, through the SDK's `serveStdio`.
- Claude Code drops text blocks when a result has structured content, Gemini CLI reads only text, and the Copilot CLI sends both. So search, get and scaffold return Markdown only, and lint and the layout check return JSON whose text block is exactly the serialized structured content, with object-root output schemas for 2025 clients.
- Claude Code and Codex load tools on demand and first show only tool names and the server's instructions, so the names explain themselves and the instructions (under 800 characters, the first 512 standing alone) carry the order to use them in.
- No client renders MCP Apps usefully for this, and the model can't see one, so there's no in-chat preview tool.

There's no planning tool: with no model behind the server, a plan would repeat what search and get return. A request for a login or sign-up screen finds its pattern through search instead, tested by the golden queries ("login form" and "sign in" put `SignInForm` first).

Configs, each `npx -y @butteryui/mcp` with the package installed in the project so `npx` uses that copy: `.mcp.json` (Claude Code; the Copilot CLI reads it too), `.codex/config.toml` (`[mcp_servers.buttery]`, with `startup_timeout_sec = 30` and `tool_timeout_sec = 180`), `.gemini/settings.json` (`mcpServers`, beside `context.fileName`), `.cursor/mcp.json` and `.vscode/mcp.json` (`servers`). This repo's `.mcp.json` runs the built server from `packages/mcp/dist`.

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
