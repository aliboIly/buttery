import { fileURLToPath } from "node:url";
import type { Knowledge } from "../src/knowledge.ts";
import { buildKnowledge } from "./knowledge.ts";

let built: Knowledge | null = null;

/** The knowledge built from this repository, once per test file. */
export function repoKnowledge(): Knowledge {
  built ??= buildKnowledge(
    fileURLToPath(new URL("../../../", import.meta.url)),
  );
  return built;
}
