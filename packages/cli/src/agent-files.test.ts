import { describe, expect, it } from "vitest";
import {
  AGENT_CONFIGS,
  GUIDE_MARKS,
  withAgentsImport,
  withCodexServer,
  withGuide,
  withServer,
} from "./agent-files.ts";

const DOCS = "https://example.com/buttery";

describe("agent files", () => {
  it("runs the app's own MCP server through npx in every agent's config", () => {
    expect(Object.keys(AGENT_CONFIGS)).toEqual([
      ".mcp.json",
      ".codex/config.toml",
      ".gemini/settings.json",
      ".cursor/mcp.json",
      ".vscode/mcp.json",
    ]);
    for (const text of Object.values(AGENT_CONFIGS)) {
      expect(text).toMatch(/"-y",\s*"@butteryui\/mcp"/);
    }
    const vscode: unknown = JSON.parse(AGENT_CONFIGS[".vscode/mcp.json"] ?? "");
    expect(vscode).toHaveProperty("servers.buttery");
    expect(AGENT_CONFIGS[".codex/config.toml"]).toContain(
      "startup_timeout_sec = 30\ntool_timeout_sec = 180\n",
    );
  });

  it("adds buttery's section to an AGENTS.md once, and replaces it in place after that", () => {
    const own = "# Plant shop\n\nRun the tests before you push.\n";
    const once = withGuide(own, DOCS);
    expect(once.startsWith(`${own}\n${GUIDE_MARKS.start}\n`)).toBe(true);
    expect(once.trimEnd().endsWith(GUIDE_MARKS.end)).toBe(true);
    expect(withGuide(once, DOCS)).toBe(once);
    const edited = once.replace("Build with it, not around it.", "Old words.");
    expect(withGuide(`${edited}\n## Deploys\n`, DOCS)).toBe(
      `${once}\n## Deploys\n`,
    );
    expect(withGuide("", DOCS).startsWith(GUIDE_MARKS.start)).toBe(true);
  });

  it("imports AGENTS.md into CLAUDE.md once", () => {
    expect(withAgentsImport("")).toBe("@AGENTS.md\n");
    expect(withAgentsImport("Be brief.\n")).toBe("@AGENTS.md\n\nBe brief.\n");
    expect(withAgentsImport("@AGENTS.md\n\nBe brief.\n")).toBe(
      "@AGENTS.md\n\nBe brief.\n",
    );
  });

  it("adds the MCP server to a config the app has, keeping what's in it", () => {
    const merged: unknown = JSON.parse(
      withServer(
        ".cursor/mcp.json",
        '{ "mcpServers": { "db": { "command": "db-mcp" } } }',
      ) ?? "",
    );
    expect(merged).toEqual({
      mcpServers: {
        db: { command: "db-mcp" },
        buttery: { command: "npx", args: ["-y", "@butteryui/mcp"] },
      },
    });
    const gemini: unknown = JSON.parse(
      withServer(
        ".gemini/settings.json",
        '{ "context": { "fileName": "GEMINI.md" }, "theme": "dark" }',
      ) ?? "",
    );
    expect(gemini).toMatchObject({
      theme: "dark",
      context: { fileName: ["AGENTS.md", "GEMINI.md"] },
    });
    const once = withServer(".mcp.json", "") ?? "";
    expect(withServer(".mcp.json", once)).toBe(once);
    expect(withServer(".vscode/mcp.json", "{ not json")).toBeNull();
  });

  it("adds the Codex server once", () => {
    const own = '[mcp_servers.db]\ncommand = "db-mcp"\n';
    const once = withCodexServer(own);
    expect(once).toContain(
      '[mcp_servers.db]\ncommand = "db-mcp"\n\n[mcp_servers.buttery]',
    );
    expect(withCodexServer(once)).toBe(once);
  });
});
