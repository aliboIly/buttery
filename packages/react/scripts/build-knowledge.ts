import { fileURLToPath } from "node:url";
import { buildKnowledge } from "../../mcp/scripts/knowledge.ts";
import { reactFiles, writeShipped } from "../../mcp/scripts/shipped.ts";

writeShipped(
  fileURLToPath(new URL("../dist/", import.meta.url)),
  reactFiles(
    buildKnowledge(fileURLToPath(new URL("../../../", import.meta.url))),
  ),
  ["examples"],
);
