#!/usr/bin/env node
import { readFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { loadKnowledge } from "./knowledge.ts";
import { projectRootFrom } from "./project.ts";
import { createSearcher } from "./search.ts";
import { createButteryServer } from "./server.ts";

function ownVersion(): string {
  const manifest: unknown = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  const version: unknown =
    typeof manifest === "object" && manifest !== null
      ? Reflect.get(manifest, "version")
      : undefined;
  return typeof version === "string" ? version : "0.0.0";
}

try {
  const projectRoot = projectRootFrom(
    process.argv.slice(2),
    process.env,
    process.cwd(),
  );
  const loaded = loadKnowledge(
    projectRoot,
    fileURLToPath(new URL("./knowledge.json", import.meta.url)),
  );
  const searcher = createSearcher(loaded.knowledge);
  const serverVersion = ownVersion();
  const allowedOrigins = (process.env["BUTTERY_MCP_ALLOW_URLS"] ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin !== "");
  serveStdio(
    () =>
      createButteryServer({
        loaded,
        searcher,
        projectRoot,
        serverVersion,
        allowedOrigins,
      }),
    {
      onerror: (error) => {
        process.stderr.write(`buttery-mcp: ${error.message}\n`);
      },
    },
  );
} catch (error) {
  process.stderr.write(
    `buttery-mcp: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
