import {
  Client,
  InMemoryTransport,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import type { CallToolResult } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { beforeAll, describe, expect, it } from "vitest";
import { repoKnowledge } from "../scripts/fixture.ts";
import { createSearcher } from "./search.ts";
import { createButteryServer, instructionsFor } from "./server.ts";
import type { ServerSetup } from "./server.ts";

let setup: ServerSetup;

beforeAll(() => {
  const knowledge = repoKnowledge();
  setup = {
    loaded: { knowledge, source: "bundled", installed: null },
    searcher: createSearcher(knowledge),
    projectRoot: null,
    serverVersion: "0.0.0-test",
    allowedOrigins: [],
  };
});

/** A client on the 2025 handshake, as most agents still connect. */
async function legacyClient(): Promise<Client> {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createButteryServer(setup).connect(serverSide);
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(clientSide);
  return client;
}

/** A client on protocol 2026-07-28, stateless, through the SDK's web handler. */
async function modernClient(): Promise<Client> {
  const handler = createMcpHandler(() => createButteryServer(setup));
  const client = new Client(
    { name: "test", version: "0.0.0" },
    { versionNegotiation: { mode: { pin: "2026-07-28" } } },
  );
  await client.connect(
    new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
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
  ["2025-11-25", legacyClient],
  ["2026-07-28", modernClient],
] as const)("over protocol %s", (version, connect) => {
  it("speaks the protocol it was asked for", async () => {
    const client = await connect();
    expect(client.getNegotiatedProtocolVersion()).toBe(version);
    expect(client.getInstructions()).toBe(
      instructionsFor(setup.loaded.knowledge),
    );
    await client.close();
  });

  it("lists its tools in one order every time, each read-only with an object input schema", async () => {
    const client = await connect();
    const first = await client.listTools();
    const second = await client.listTools();
    expect(first.tools.map((tool) => tool.name)).toEqual([
      "buttery_search",
      "buttery_get",
      "buttery_lint",
      "buttery_check_layout",
    ]);
    expect(second.tools).toEqual(first.tools);
    for (const tool of first.tools) {
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.annotations).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: tool.name === "buttery_check_layout",
      });
      if (
        tool.name === "buttery_lint" ||
        tool.name === "buttery_check_layout"
      ) {
        expect(tool.outputSchema?.["type"]).toBe("object");
      }
      expect(tool.description?.length ?? 0).toBeLessThanOrEqual(800);
    }
    await client.close();
  });

  it("searches and gets in Markdown that names the version", async () => {
    const client = await connect();
    const found = textOf(
      await client.callTool({
        name: "buttery_search",
        arguments: { query: "modal" },
      }),
    );
    expect(found).toMatch(/^buttery \d+\.\d+\.\d+: \d+ found for "modal"/);
    expect(found).toContain("- component/Dialog:");
    expect(found).toContain('Next: buttery_get({"ids":["component/Dialog"');
    const got = await client.callTool({
      name: "buttery_get",
      arguments: { ids: ["component/Dialog", "tokens/space"] },
    });
    expect(got.isError).not.toBe(true);
    expect(textOf(got)).toContain('import { Dialog } from "@butteryui/react";');
    expect(textOf(got)).toContain("## Tokens: space");
    await client.close();
  });

  it("answers an id that names nothing with a tool error naming the one meant, and how to ask for it", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "buttery_get",
      arguments: { ids: ["component/Modal"] },
    });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toBe(
      'Nothing has the id "component/Modal". Did you mean component/Dialog? buttery_get({"ids":["component/Dialog"]})',
    );
    await client.close();
  });

  it("lints a snippet into JSON whose text is exactly its structured content", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "buttery_lint",
      arguments: {
        code: 'import { Stack } from "@butteryui/core";\nexport const A = () => <Stack gap="16px" />;',
      },
    });
    expect(result.isError).not.toBe(true);
    expect(textOf(result)).toBe(JSON.stringify(result.structuredContent));
    expect(result.structuredContent).toMatchObject({
      summary: { files: 1, errors: 1 },
      diagnostics: [
        {
          file: "snippet.tsx",
          line: 2,
          rule: "buttery/prop-values",
          fix: "Write gap={4}: spacing step 4 is 16px.",
        },
      ],
      truncated: false,
    });
    await client.close();
  });

  it("asks for files or code, one of them, with a call that works", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "buttery_lint",
      arguments: { files: ["src/App.tsx"], code: "<Stack />" },
    });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('buttery_lint({"files":["src/App.tsx"]})');
    await client.close();
  });

  it("only opens pages on this machine for a layout check", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "buttery_check_layout",
      arguments: { url: "https://example.com/" },
    });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain("BUTTERY_MCP_ALLOW_URLS");
    await client.close();
  });

  it("explains a call that breaks its schema instead of running it", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "buttery_search",
      arguments: { query: "modal", limit: 99 },
    });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toMatch(/limit/);
    await client.close();
  });

  it("reads a docs page, a component, a token group and llms.txt as Markdown", async () => {
    const client = await connect();
    for (const uri of [
      "buttery://docs/layout/the-layout-contract",
      "buttery://docs/components/dialog",
      "buttery://component/Dialog",
      "buttery://tokens/space",
      "buttery://llms.txt",
    ]) {
      const { contents } = await client.readResource({ uri });
      expect(contents[0]?.mimeType, uri).toBe("text/markdown");
      expect(
        contents[0] && "text" in contents[0] ? contents[0].text : "",
        uri,
      ).not.toBe("");
    }
    const listed = await client.listResources();
    expect(listed.resources.map((resource) => resource.uri)).toContain(
      "buttery://docs/layout/the-layout-contract",
    );
    await client.close();
  });

  it("answers a page that doesn't exist with invalid params, as the spec asks", async () => {
    const client = await connect();
    await expect(
      client.readResource({ uri: "buttery://docs/no/such-page" }),
    ).rejects.toMatchObject({ code: -32602 });
    await client.close();
  });

  it("gives the make-it-buttery steps and its page and review prompts", async () => {
    const client = await connect();
    const { prompts } = await client.listPrompts();
    expect(prompts.map((entry) => entry.name)).toEqual([
      "make-it-buttery",
      "build-page",
      "review-ui",
    ]);
    const skill = await client.getPrompt({ name: "make-it-buttery" });
    expect(JSON.stringify(skill.messages)).toContain("# Make it buttery");
    const review = await client.getPrompt({
      name: "review-ui",
      arguments: { target: "http://localhost:5173/settings" },
    });
    expect(JSON.stringify(review.messages)).toContain("buttery_check_layout");
    await client.close();
  });
});

describe("caching", () => {
  it("marks the 2026 lists public for an hour", async () => {
    const client = await modernClient();
    const tools = await client.listTools();
    expect(tools).toMatchObject({ ttlMs: 3_600_000, cacheScope: "public" });
    await client.close();
  });

  it("leaves cache fields off 2025 lists, which don't have them", async () => {
    const client = await legacyClient();
    const tools = await client.listTools();
    expect(tools).not.toHaveProperty("ttlMs");
    await client.close();
  });
});
