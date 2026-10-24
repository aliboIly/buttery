/** buttery's docs site, which an app's agent files and README point to. */
export const DOCS_SITE = "https://aliboily.github.io/buttery";

/** The MCP server's entry in each agent's config: `npx`, which finds the copy installed in the app. */
const SERVER = { command: "npx", args: ["-y", "@butteryui/mcp"] };

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

/** Codex's entry for the MCP server, in `.codex/config.toml`, with time for a first `npx` download. */
export const CODEX_SERVER = `[mcp_servers.buttery]
command = "npx"
args = ["-y", "@butteryui/mcp"]
startup_timeout_sec = 30
tool_timeout_sec = 180
`;

/**
 * Each coding agent's config in an app, by path: buttery's MCP server for Claude Code and Copilot
 * (`.mcp.json`), Codex, Gemini CLI, Cursor and VS Code, and `AGENTS.md` as Gemini CLI's context.
 */
export const AGENT_CONFIGS: Readonly<Record<string, string>> = {
  ".mcp.json": json({ mcpServers: { buttery: SERVER } }),
  ".codex/config.toml": CODEX_SERVER,
  ".gemini/settings.json": json({
    context: { fileName: ["AGENTS.md", "GEMINI.md"] },
    mcpServers: { buttery: SERVER },
  }),
  ".cursor/mcp.json": json({ mcpServers: { buttery: SERVER } }),
  ".vscode/mcp.json": json({ servers: { buttery: SERVER } }),
};

/** Where buttery's section of an app's `AGENTS.md` starts and ends, so `buttery init` can replace it. */
export const GUIDE_MARKS = {
  start: "<!-- buttery:start -->",
  end: "<!-- buttery:end -->",
} as const;

/** buttery's section of an app's `AGENTS.md`: where to look things up, the rules and the checks. */
export function butteryGuide(docs: string): string {
  return `${GUIDE_MARKS.start}
## Building UI with buttery

This app is built with buttery, a React design system: tokens, layout primitives, components and patterns, with checks that fail when something overlaps, overflows or drifts off the scale. Build with it, not around it.

### Before you change UI
- Look a component up before you use it: the \`buttery\` MCP server answers with \`buttery_search\` and \`buttery_get\`, and \`buttery_scaffold\` starts a whole page. Without it, the docs are at ${docs}, every page also as Markdown at its path plus \`.md\`.
- Start a page with \`npx buttery add page <kind>\`.
- Start a component of your own with \`npx buttery create component <Name> --purpose "…"\` and build it from buttery's public parts: \`Control\` for a control's height, \`Pressable\` for what people press, \`SharedIndicator\` for a highlight that slides, \`variants()\` for typed looks and \`useControllableState\` for a value that's controlled or not. Give it a class of its own; \`data-bt\` belongs to buttery's components.
- Follow \`.claude/skills/make-it-buttery/SKILL.md\` for any screen you build or restyle.

### Rules
1. Tokens only: colors, sizes, radii, shadows, durations and z-indexes come from \`var(--bt-*)\`, or from a spacing step on a primitive (\`gap={3}\`, \`pad={4}\`).
2. Lay things out with \`Stack\`, \`Inline\` and \`Grid\` and a gap: no outer margins, no negative margins, no \`position: absolute\` or \`fixed\` in app code.
3. Overlays only through buttery's layers: \`Menu\`, \`Select\`, \`Popover\`, \`Dialog\`, \`Sheet\`, \`toast()\`.
4. Text through \`Text\` with a role, icons through \`Icon\`, and buttery's components before hand-made controls.

### Checks
- \`npm run typecheck\` and \`npm run lint\`: buttery's lint configs flag raw values, stray positioning and \`transition: all\`.
- \`npx buttery check / /settings\` runs the layout checks on those pages of the app at 390 and 1280, light and dark, starting the dev server if it isn't running, and says how to fix what it finds; \`--json\` for a machine, \`--full\` for every width, compact density and WebKit.
- \`npx buttery doctor\` checks the setup itself.
${GUIDE_MARKS.end}
`;
}

/**
 * `existing`, an app's `AGENTS.md`, with buttery's section in it: replaced between its marks, or added at
 * the end when it isn't there, so running `buttery init` again changes nothing.
 */
export function withGuide(existing: string, docs: string): string {
  const guide = butteryGuide(docs);
  const start = existing.indexOf(GUIDE_MARKS.start);
  const end = existing.indexOf(GUIDE_MARKS.end);
  if (start !== -1 && end > start) {
    const after = existing
      .slice(end + GUIDE_MARKS.end.length)
      .replace(/^\n/, "");
    return `${existing.slice(0, start)}${guide}${after}`;
  }
  const trimmed = existing.trimEnd();
  return trimmed === "" ? guide : `${trimmed}\n\n${guide}`;
}

/** `existing`, an app's `CLAUDE.md`, importing `AGENTS.md` so Claude Code reads the same instructions. */
export function withAgentsImport(existing: string): string {
  if (/^@AGENTS\.md\s*$/m.test(existing)) return existing;
  const trimmed = existing.trimEnd();
  return trimmed === "" ? "@AGENTS.md\n" : `@AGENTS.md\n\n${trimmed}\n`;
}

type Json = Record<string, unknown>;

function objectAt(value: unknown): Json {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value))
    : {};
}

/**
 * `existing`, the text of one of the agents' JSON configs at `path`, with buttery's MCP server added where
 * it's missing and everything else kept as it was. Null when `existing` isn't JSON, so it's left alone.
 */
export function withServer(path: string, existing: string): string | null {
  let parsed: unknown;
  try {
    parsed = existing.trim() === "" ? {} : JSON.parse(existing);
  } catch {
    return null;
  }
  const config = objectAt(parsed);
  const field = path === ".vscode/mcp.json" ? "servers" : "mcpServers";
  const servers = objectAt(config[field]);
  const next: Json = { ...config };
  if (!("buttery" in servers)) next[field] = { ...servers, buttery: SERVER };
  if (path === ".gemini/settings.json") {
    const context = objectAt(config["context"]);
    const names = context["fileName"];
    const listed = Array.isArray(names)
      ? names.filter((name): name is string => typeof name === "string")
      : typeof names === "string"
        ? [names]
        : [];
    if (!listed.includes("AGENTS.md")) {
      next["context"] = { ...context, fileName: ["AGENTS.md", ...listed] };
    }
  }
  return json(next);
}

/** `existing`, a Codex config, with buttery's MCP server added at the end unless it has one. */
export function withCodexServer(existing: string): string {
  if (/^\[mcp_servers\.buttery\]\s*$/m.test(existing)) return existing;
  const trimmed = existing.trimEnd();
  return trimmed === "" ? CODEX_SERVER : `${trimmed}\n\n${CODEX_SERVER}`;
}
