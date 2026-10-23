import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildKnowledge } from "./knowledge.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const out = fileURLToPath(new URL("../dist/", import.meta.url));
mkdirSync(out, { recursive: true });
writeFileSync(`${out}knowledge.json`, JSON.stringify(buildKnowledge(root)));
