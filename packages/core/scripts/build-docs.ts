import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { coreFiles, writeShipped } from "../../mcp/scripts/shipped.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const manifest: unknown = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const version =
  typeof manifest === "object" &&
  manifest !== null &&
  "version" in manifest &&
  typeof manifest.version === "string"
    ? manifest.version
    : "0.0.0";

writeShipped(
  fileURLToPath(new URL("../dist/", import.meta.url)),
  coreFiles(root, version),
  ["docs"],
);
