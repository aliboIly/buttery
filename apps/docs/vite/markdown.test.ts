import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  componentHref,
  componentSources,
  contentRoutesIn,
  llmsText,
  pageMarkdown,
} from "./markdown.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const components = componentSources(root);

/** The lines of `markdown` outside its code blocks that still look like JSX. */
function jsxLeftIn(markdown: string): string[] {
  const left: string[] = [];
  let fenced = false;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    else if (!fenced && /^\s*<\/?[A-Z]/.test(line)) left.push(line);
  }
  return left;
}

describe("the site as Markdown", () => {
  it.each(contentRoutesIn(root))(
    "writes %s out as Markdown, its components as text and code",
    (route) => {
      const markdown = pageMarkdown(root, route, components);
      expect(markdown).not.toBeNull();
      expect(markdown?.startsWith("# ")).toBe(true);
      expect(jsxLeftIn(markdown ?? "")).toEqual([]);
    },
  );

  it("writes every component page out with its import, examples and props", () => {
    for (const component of components.filter(
      (candidate) => candidate.home === undefined,
    )) {
      const markdown =
        pageMarkdown(root, componentHref(component).slice(1), components) ?? "";
      expect(markdown.startsWith(`# ${component.name}\n`)).toBe(true);
      expect(markdown).toContain(
        `import { ${component.name} } from "${component.packageName}";`,
      );
      expect(jsxLeftIn(markdown)).toEqual([]);
    }
  });

  it("shows an example's code as a reader copies it, without its check exports", () => {
    const markdown = pageMarkdown(root, "components/button", components) ?? "";
    expect(markdown).toContain("export function AddToOrder(): ReactElement {");
    expect(markdown).not.toContain("export const play");
    expect(markdown).not.toContain("ExampleKind");
  });

  it("writes out the types a component's props use, after its props", () => {
    const markdown =
      pageMarkdown(root, "components/data-table", components) ?? "";
    const types = markdown.indexOf("### DataTableColumn\n");
    expect(types).toBeGreaterThan(markdown.indexOf("### DataTable\n"));
    expect(markdown.indexOf("## Accessibility")).toBeGreaterThan(types);
    expect(markdown.slice(types)).toMatch(
      /\| `minWidth` \| `[^`]+` \| `"sm"` \|/,
    );
  });

  it("turns a page's token blocks into tables", () => {
    const markdown = pageMarkdown(root, "foundations/radius", components) ?? "";
    expect(markdown).toMatch(/\| `--bt-r-lg` \| \d+px \|/);
  });

  it("writes What's new out with every release, newest first", () => {
    const markdown =
      pageMarkdown(root, "resources/whats-new", components) ?? "";
    expect(markdown).toContain("## 0.9.0: Docs site");
    expect(markdown.indexOf("## 0.9.0")).toBeLessThan(
      markdown.indexOf("## 0.1.0: Foundation"),
    );
  });

  it("lists every page in llms.txt with a link to its Markdown, by section in the site's order", () => {
    const text = llmsText(root, components);
    for (const route of contentRoutesIn(root))
      expect(text).toContain(`(/${route}.md)`);
    expect(text).toContain("(/components/button.md)");
    expect(text.indexOf("## Get started")).toBeLessThan(
      text.indexOf("## Foundations"),
    );
    expect(text.indexOf("## Foundations")).toBeLessThan(
      text.indexOf("## Components"),
    );
  });

  it("links a template's page to its live preview", () => {
    expect(pageMarkdown(root, "templates/dashboard", components)).toContain(
      "The template runs live at [/templates/dashboard/preview](/templates/dashboard/preview).",
    );
  });

  it("has nothing for a route that isn't a page", () => {
    expect(pageMarkdown(root, "nowhere/at-all", components)).toBeNull();
  });
});
