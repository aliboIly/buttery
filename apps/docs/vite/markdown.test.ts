import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  componentHref,
  componentSources,
  contentRoutesIn,
  llmsText,
  markdownRequests,
  missingMarkdown,
  pageMarkdown,
} from "./markdown.ts";
import type { MarkdownMiddleware } from "./markdown.ts";
import { parseFrontmatter, splitFrontmatter } from "./frontmatter.ts";
import { SECTIONS } from "../src/nav.ts";
import { demoPages } from "../src/routes.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const components = componentSources(root);

/** The pages `llms.txt` lists under `heading`, by their links, in its order. */
function listedUnder(text: string, heading: string): string[] {
  const start = text.indexOf(`\n## ${heading}\n`);
  if (start === -1) return [];
  const end = text.indexOf("\n## ", start + 1);
  return [
    ...text
      .slice(start, end === -1 ? undefined : end)
      .matchAll(/^- \[[^\]]+\]\(([^)]+)\)/gm),
  ].map(([, href]) => href ?? "");
}

/** What `handle` does with a request for `url`: the status and type it answers with, or whether it passes it on. */
function ask(
  handle: MarkdownMiddleware,
  url: string,
): {
  readonly status: number;
  readonly type: string | undefined;
  readonly passed: boolean;
} {
  const headers = new Map<string, string>();
  let passed = false;
  const response = {
    statusCode: 200,
    setHeader: (name: string, value: string) => headers.set(name, value),
    end: () => undefined,
  };
  handle({ url }, response, () => {
    passed = true;
  });
  return {
    status: response.statusCode,
    type: headers.get("Content-Type"),
    passed,
  };
}

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

  it("lists every component on the components overview under its group, in the nav's order", () => {
    const markdown =
      pageMarkdown(root, "components/overview", components) ?? "";
    const groups = SECTIONS.flatMap((section) => section.groups ?? []);
    expect(groups).not.toEqual([]);
    for (const group of groups) {
      const start = markdown.indexOf(`\n## ${group.title}\n`);
      expect(start, group.title).toBeGreaterThan(-1);
      const end = markdown.indexOf("\n## ", start + 1);
      const listed = [
        ...markdown
          .slice(start, end === -1 ? undefined : end)
          .matchAll(/^\| \[([A-Za-z]+)\]\((\/[^)]+)\) \|/gm),
      ].map(([, name, href]) => `${name ?? ""} ${href ?? ""}`);
      const wanted = components
        .filter((component) => component.section === group.section)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
        .map((component) => `${component.name} ${componentHref(component)}.md`);
      expect(listed, group.title).toEqual(wanted);
    }
  });

  it("lists each section's pages in llms.txt in the nav's order, and the components under their groups' names", () => {
    const text = llmsText(root, components);
    const written = contentRoutesIn(root).map((route) => {
      const { block } = splitFrontmatter(
        readFileSync(join(root, "apps/docs/content", `${route}.mdx`), "utf8"),
      );
      const data = parseFrontmatter(block ?? "", route);
      return {
        section: String(data["section"]),
        order: Number(data["order"]),
        title: String(data["title"]),
        href: `/${route}.md`,
      };
    });
    const pages = [
      ...written,
      ...components
        .filter((component) => component.home === undefined)
        .map((component) => ({
          section: component.section,
          order: component.order,
          title: component.title,
          href: `${componentHref(component)}.md`,
        })),
    ];
    const inOrder = (section: string): string[] =>
      pages
        .filter((page) => page.section === section)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
        .map((page) => page.href);
    for (const section of SECTIONS) {
      expect(listedUnder(text, section.title), section.title).toEqual(
        inOrder(section.root),
      );
      for (const group of section.groups ?? [])
        expect(
          listedUnder(text, `${section.title} › ${group.title}`),
          group.title,
        ).toEqual(inOrder(group.section));
    }
    expect(listedUnder(text, "Get started")[0]).toBe(
      "/get-started/introduction.md",
    );
  });

  it("lists the demos page and each demo in llms.txt", () => {
    expect(listedUnder(llmsText(root, components), "Demos")).toEqual([
      "/demos",
      ...demoPages.map((demo) => `/demos/${demo.route}`),
    ]);
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

describe("the Markdown addresses", () => {
  it("answers a page's Markdown, and 404 for a .md address that's no page's or file's", () => {
    const handle = markdownRequests(root, (path) => path === "/notes.md");
    expect(ask(handle, "/get-started/installation.md?theme=dark")).toEqual({
      status: 200,
      type: "text/markdown; charset=utf-8",
      passed: false,
    });
    expect(ask(handle, "/get-started/instalation.md")).toEqual({
      status: 404,
      type: "text/plain; charset=utf-8",
      passed: false,
    });
    expect(ask(handle, "/notes.md").passed).toBe(true);
    expect(ask(handle, "/get-started/instalation").passed).toBe(true);
  });

  it("answers 404 for a .md address the static build has no file for", () => {
    const out = mkdtempSync(join(tmpdir(), "buttery-markdown-"));
    try {
      mkdirSync(join(out, "get-started"));
      writeFileSync(
        join(out, "get-started/installation.md"),
        "# Installation\n",
      );
      const handle = missingMarkdown(out);
      expect(ask(handle, "/get-started/installation.md").passed).toBe(true);
      expect(ask(handle, "/get-started/instalation.md")).toEqual({
        status: 404,
        type: "text/plain; charset=utf-8",
        passed: false,
      });
      expect(ask(handle, "/get-started/instalation").passed).toBe(true);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
