import type { Plugin } from "vite";
import { slugify } from "../src/slug.ts";

/** A frontmatter value: a string, a number or a list of strings. */
export type FrontmatterValue = string | number | readonly string[];

function valueOf(raw: string): FrontmatterValue {
  const text = raw.trim();
  if (text.startsWith("[") && text.endsWith("]")) {
    return text
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter((item) => item !== "");
  }
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text.replace(/^"(.*)"$/s, "$1").replace(/^'(.*)'$/s, "$1");
}

/**
 * Reads a flat YAML block, one `key: value` per line, where a value is a string (quoted or not), a number
 * or a `[a, b]` list, which may go on over indented lines as Prettier breaks a long one. Throws, naming the
 * file and line, on anything else.
 */
export function parseFrontmatter(
  block: string,
  file: string,
): Record<string, FrontmatterValue> {
  const entries: { readonly line: number; text: string }[] = [];
  for (const [index, line] of block.split("\n").entries()) {
    if (line.trim() === "") continue;
    const last = entries.at(-1);
    if (/^\s/.test(line) && last) last.text = `${last.text} ${line.trim()}`;
    else entries.push({ line: index + 2, text: line });
  }
  const data: Record<string, FrontmatterValue> = {};
  for (const { line, text } of entries) {
    const match = /^([a-zA-Z][\w-]*):\s*(.*)$/.exec(text);
    if (!match?.[1] || match[2] === undefined) {
      throw new Error(
        `${file}: frontmatter line ${String(line)} isn't "key: value". Fix: one key per line, such as title: Button.`,
      );
    }
    data[match[1]] = valueOf(match[2]);
  }
  return data;
}

/** The frontmatter block at the start of an MDX page, if it has one, and the page after it. */
export function splitFrontmatter(source: string): {
  readonly block: string | null;
  readonly body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  return match
    ? { block: match[1] ?? "", body: source.slice(match[0].length) }
    : { block: null, body: source };
}

/** A page's heading for its "On this page" list. */
export interface Heading {
  readonly depth: 2 | 3;
  readonly text: string;
  readonly id: string;
}

/** The `##` and `###` headings of a page's Markdown, outside its code blocks, with their anchor ids. */
export function headingsOf(body: string): Heading[] {
  return [
    ...body.replace(/^```[\s\S]*?^```/gm, "").matchAll(/^(#{2,3})\s+(.+)$/gm),
  ].map(([, hashes = "", text = ""]) => ({
    depth: hashes.length === 2 ? 2 : 3,
    text: text.replace(/[`*_]/g, ""),
    id: slugify(text),
  }));
}

/**
 * Turns an MDX page's frontmatter into `export const page = {…}`, so the nav reads it as a module export,
 * and lists its headings as `export const headings`.
 */
export function frontmatter(): Plugin {
  return {
    name: "buttery-docs-frontmatter",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith(".mdx")) return null;
      const { block, body } = splitFrontmatter(code);
      const page = block === null ? undefined : parseFrontmatter(block, id);
      return {
        code: `export const page = ${JSON.stringify(page)};\nexport const headings = ${JSON.stringify(headingsOf(body))};\n\n${body}`,
        map: null,
      };
    },
  };
}
