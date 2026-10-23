import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import type { CallToolResult } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { beforeAll, describe, expect, it } from "vitest";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const STARTER = fileURLToPath(
  new URL("../../../apps/starter/", import.meta.url),
);

beforeAll(() => {
  execFileSync("pnpm", ["run", "build"], { cwd: PACKAGE, stdio: "ignore" });
}, 120_000);

async function connect(modern: boolean): Promise<Client> {
  const client = new Client(
    { name: "smoke", version: "0.0.0" },
    modern ? { versionNegotiation: { mode: { pin: "2026-07-28" } } } : {},
  );
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [`${PACKAGE}dist/index.js`, "--project", STARTER],
      stderr: "pipe",
    }),
  );
  return client;
}

function textOf(result: CallToolResult): string {
  return result.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");
}

describe.each([
  ["2025-11-25", false],
  ["2026-07-28", true],
] as const)("the built server over stdio, protocol %s", (version, modern) => {
  it("calls every tool, reads every kind of resource and gets every prompt", async () => {
    const client = await connect(modern);
    expect(client.getNegotiatedProtocolVersion()).toBe(version);
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual([
      "buttery_search",
      "buttery_get",
      "buttery_scaffold",
      "buttery_lint",
      "buttery_check_layout",
    ]);
    const calls: readonly (readonly [
      string,
      Record<string, unknown>,
      RegExp,
    ])[] = [
      ["buttery_search", { query: "modal" }, /component\/Dialog/],
      ["buttery_get", { ids: ["component/Dialog"] }, /import \{ Dialog \}/],
      ["buttery_scaffold", { kind: "page", page: "settings" }, /```tsx/],
      [
        "buttery_lint",
        {
          code: 'import { Stack } from "@butteryui/core";\nexport const A = () => <Stack gap="16px" />;',
        },
        /buttery\/prop-values/,
      ],
    ];
    for (const [name, args, expected] of calls) {
      const result = await client.callTool({
        name,
        arguments: args,
      });
      expect(result.isError, name).not.toBe(true);
      expect(textOf(result), name).toMatch(expected);
    }
    const refused = await client.callTool({
      name: "buttery_check_layout",
      arguments: { url: "https://example.com/" },
    });
    expect(refused.isError).toBe(true);
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates.map((template) => template.uriTemplate)).toEqual([
      "buttery://docs/{+path}",
      "buttery://component/{name}",
      "buttery://tokens/{group}",
    ]);
    for (const uri of [
      "buttery://docs/layout/the-layout-contract",
      "buttery://component/Stack",
      "buttery://tokens/space",
      "buttery://llms.txt",
    ]) {
      const { contents } = await client.readResource({ uri });
      expect(contents, uri).toHaveLength(1);
    }
    for (const [name, args] of [
      ["make-it-buttery", undefined],
      ["build-page", { kind: "settings" }],
      ["review-ui", { target: "src/App.tsx" }],
    ] as const) {
      const prompt = await client.getPrompt(
        args === undefined ? { name } : { name, arguments: args },
      );
      expect(prompt.messages.length, name).toBeGreaterThan(0);
    }
    await client.close();
  }, 60_000);
});
