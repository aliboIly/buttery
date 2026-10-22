import { createCssVariablesTheme, createHighlighter } from "shiki";
import type { Highlighter } from "shiki";

/** The languages code blocks on the site are written in. */
export const LANGUAGES = [
  "tsx",
  "ts",
  "js",
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

/** Where the process keeps its one highlighter, outside this module, which a config reload loads afresh. */
const store = globalThis as typeof globalThis & {
  __butteryDocsHighlighter?: Promise<Highlighter>;
};

/**
 * One shiki highlighter for the whole process. The dev server loads its config again after each change to
 * it, and a highlighter made on each load fills the regex engine's memory until highlighting fails, so it's
 * kept on `globalThis` and made once.
 */
export function sharedHighlighter(): Promise<Highlighter> {
  store.__butteryDocsHighlighter ??= createHighlighter({
    themes: [THEME],
    langs: [...LANGUAGES],
  });
  return store.__butteryDocsHighlighter;
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
  data?: { meta?: string | null };
}

/** The file a fenced block's info line names, as in ```tsx title="src/main.tsx"```, if it names one. */
export function titleOf(meta: string | null | undefined): string | undefined {
  return /\btitle="([^"]+)"/.exec(meta ?? "")?.[1];
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
          if (pre) {
            const title = titleOf(code.data?.meta);
            pre.properties = {
              ...pre.properties,
              "data-language": lang,
              ...(title === undefined ? {} : { "data-title": title }),
            };
            node.children[index] = pre;
          }
          continue;
        }
        visit(child);
      }
    };
    visit(tree);
  };
}
