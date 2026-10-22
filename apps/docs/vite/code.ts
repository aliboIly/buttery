import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";
import { shownSource } from "./example-source.ts";
import { highlight } from "./highlight.ts";

/**
 * An example file's source as a reader copies it, highlighted at build time, and the one-line caption its
 * JSDoc gives it.
 */
export interface ExampleCode {
  readonly source: string;
  readonly html: string;
  readonly caption: string;
}

/** The JSDoc right above a file's first exported component, as one line. */
export function captionOf(source: string): string {
  const found = /\/\*\*([\s\S]*?)\*\/\s*export function [A-Z]/.exec(source);
  return (found?.[1] ?? "")
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter((line) => line !== "")
    .join(" ");
}

/**
 * Lets a module import a file with `?code` for its source, highlighted HTML and caption, so an example's
 * demo and its code block come from the same file.
 */
export function exampleCode(): Plugin {
  return {
    name: "buttery-docs-example-code",
    enforce: "pre",
    async load(id) {
      const [file, query] = id.split("?");
      if (query !== "code" || file === undefined) return null;
      const source = await readFile(file, "utf8");
      const shown = shownSource(source);
      const code: ExampleCode = {
        source: shown,
        html: await highlight(shown.trimEnd(), "tsx"),
        caption: captionOf(source),
      };
      return `export default ${JSON.stringify(code)};`;
    },
  };
}
