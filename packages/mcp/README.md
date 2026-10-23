# @butteryui/mcp

An MCP server that lets coding agents look buttery up instead of guessing: components, props and token values for the version a project uses, its docs as Markdown, page starters, and checks that say how to fix what they find.

## Tools

| Tool | What it does |
|---|---|
| `buttery_search` | Finds components, patterns, docs pages, props, tokens and rules by meaning or name: "modal" finds `Dialog`, "settings page" the settings patterns. Each result is an id for `buttery_get`. |
| `buttery_get` | Up to 10 ids in one call: a component's import, props with types and defaults, parts, the values its token-typed props take and a working example; a docs page or one section of it; a token group; a rule or check. |
| `buttery_scaffold` | A page to save, from the pattern made for it (`table`, `detail`, `settings`, `catalog`, `plans`, `sign-in` and more), or the setup for a new app. Writes nothing. |
| `buttery_lint` | Files or a snippet against buttery's rules, through the project's ESLint and stylelint with buttery's configs, plus a check of literal prop values: `gap="16px"` comes back as `gap={4}`. JSON, each problem with its fix. |
| `buttery_check_layout` | `checkButtery` from `@butteryui/test` on a page of the running app, at the widths and themes asked for, in the project's Playwright. JSON, each problem once with its fix and the conditions it showed in. Local URLs only. |

Resources: every docs page at `buttery://docs/{path}`, a component at `buttery://component/{name}`, a token group at `buttery://tokens/{group}`, and `buttery://llms.txt`. Prompts: `make-it-buttery`, `build-page` and `review-ui`.

## Set it up

Install it next to buttery, so `npx` finds the local copy and its answers match the installed version:

```bash
npm install --save-dev @butteryui/mcp
```

Claude Code, in `.mcp.json` at the project root (Copilot reads the same file):

```json
{ "mcpServers": { "buttery": { "command": "npx", "args": ["-y", "@butteryui/mcp"] } } }
```

Codex, in `.codex/config.toml`:

```toml
[mcp_servers.buttery]
command = "npx"
args = ["-y", "@butteryui/mcp"]
startup_timeout_sec = 30
tool_timeout_sec = 180
```

Gemini CLI, in `.gemini/settings.json`:

```json
{ "mcpServers": { "buttery": { "command": "npx", "args": ["-y", "@butteryui/mcp"] } } }
```

Cursor, in `.cursor/mcp.json`, takes the same `mcpServers` entry; VS Code, in `.vscode/mcp.json`, takes it under `servers`.

The server finds the project from `--project <dir>`, else `CLAUDE_PROJECT_DIR`, else the nearest folder up from where it starts whose `package.json` depends on buttery.

## How it works

- It answers from the docs of the buttery version installed in the project, and from its own copy when the project has none, and says which.
- It speaks protocol 2026-07-28 and the 2025 handshake, over stdio.
- Every tool is read-only. Nothing goes over the network: `buttery_check_layout` opens only `localhost`, `127.0.0.1` and `[::1]`, plus origins listed in `BUTTERY_MCP_ALLOW_URLS`, and `buttery_lint` reads only files inside the project.
- Lists and reads carry a public cache hint of an hour.

## License

MIT
