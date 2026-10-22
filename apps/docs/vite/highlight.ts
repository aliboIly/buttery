import { createCssVariablesTheme, createHighlighter } from "shiki";
import type { Highlighter } from "shiki";

/** The languages code blocks on the site are written in. */
export const LANGUAGES = [
  "tsx",
  "ts",
  "css",
  "bash",
  "json",
  "html",
  "md",
] as const;

/** Code colors as CSS variables (`--docs-code-*`), which the site's stylesheet sets from buttery's tokens. */
const THEME = createCssVariablesTheme({
  name: "buttery",
  variablePrefix: "--docs-code-",
  variableDefaults: {},
  fontStyle: true,
});

let highlighter: Promise<Highlighter> | undefined;

/** One shiki highlighter for the whole build. */
export function sharedHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({
    themes: [THEME],
    langs: [...LANGUAGES],
  });
  return highlighter;
}

/** Highlights `code` as `lang` into HTML at build time, its colors as `--docs-code-*` variables. */
export async function highlight(code: string, lang: string): Promise<string> {
  const shiki = await sharedHighlighter();
  return shiki.codeToHtml(code, {
    lang: (LANGUAGES as readonly string[]).includes(lang) ? lang : "text",
    theme: "buttery",
  });
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  return node.type === "text"
    ? (node.value ?? "")
    : (node.children ?? []).map(textOf).join("");
}

function languageOf(code: HastNode): string | undefined {
  const names = code.properties?.["className"];
  const list = Array.isArray(names) ? names : [];
  const found = list.find(
    (name): name is string =>
      typeof name === "string" && name.startsWith("language-"),
  );
  return found?.slice("language-".length);
}

/** A rehype step that replaces every fenced code block with shiki's highlighted version. */
export function rehypeHighlight(): (tree: HastNode) => Promise<void> {
  return async (tree) => {
    const shiki = await sharedHighlighter();
    const visit = (node: HastNode): void => {
      for (const [index, child] of (node.children ?? []).entries()) {
        const [code] = child.children ?? [];
        if (
          child.tagName === "pre" &&
          code?.tagName === "code" &&
          node.children
        ) {
          const lang = languageOf(code) ?? "text";
          const root = shiki.codeToHast(textOf(code).replace(/\n$/, ""), {
            lang: (LANGUAGES as readonly string[]).includes(lang)
              ? lang
              : "text",
            theme: "buttery",
          }) as HastNode;
          const [pre] = root.children ?? [];
          if (pre) node.children[index] = pre;
          continue;
        }
        visit(child);
      }
    };
    visit(tree);
  };
}
