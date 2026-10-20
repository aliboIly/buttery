import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  renderLayoutCss,
  renderSurfaceRecipeCss,
  renderTailwindCss,
  renderTextRecipeCss,
  renderTokensCss,
  renderTokensJson,
} from "../src/tokens/render.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

const outputs = [
  ["src/tokens/tokens.css", renderTokensCss()],
  ["src/tokens/tokens.json", renderTokensJson()],
  ["src/styles/recipes/surface.css", renderSurfaceRecipeCss()],
  ["src/styles/recipes/text.css", renderTextRecipeCss()],
  ["src/styles/tailwind.css", renderTailwindCss()],
  ["src/styles/primitives/layout.css", renderLayoutCss()],
] as const;

function current(path: string): string | undefined {
  const file = `${root}${path}`;
  return existsSync(file) ? readFileSync(file, "utf8") : undefined;
}

const stale = outputs.filter(([path, content]) => current(path) !== content);

if (process.argv.includes("--check")) {
  if (stale.length > 0) {
    process.stderr.write(
      `Generated token files are out of date: ${stale.map(([path]) => path).join(", ")}. Run pnpm tokens.\n`,
    );
    process.exitCode = 1;
  }
} else {
  for (const [path, content] of stale) {
    mkdirSync(dirname(`${root}${path}`), { recursive: true });
    writeFileSync(`${root}${path}`, content);
  }
  process.stdout.write(
    stale.length > 0
      ? `Wrote ${stale.map(([path]) => path).join(", ")}.\n`
      : "Token files are up to date.\n",
  );
}
