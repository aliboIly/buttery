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
  listedRoutesIn,
  llmsFullText,
  llmsText,
  markdownRequests,
  missingMarkdown,
  pageMarkdown,
} from "./markdown.ts";
import type { MarkdownMiddleware } from "./markdown.ts";
import { parseFrontmatter, splitFrontmatter } from "./frontmatter.ts";
import { roadmapIn } from "./roadmap.ts";
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

/** What `handle` answers a request for `url` with, or `null` when it passes the request on. */
function bodyOf(handle: MarkdownMiddleware, url: string): string | null {
  const written: string[] = [];
  handle(
    { url },
    {
      statusCode: 200,
      setHeader: () => undefined,
      end: (body: string) => written.push(body),
    },
    () => undefined,
  );
  return written[0] ?? null;
}

/** The links in `markdown`, outside its code blocks, to a path on the site that isn't under `base`. */
function linksOutside(markdown: string, base: string): string[] {
  let fenced = false;
  return markdown.split("\n").flatMap((line) => {
    if (line.startsWith("```")) fenced = !fenced;
    if (fenced || line.startsWith("```")) return [];
    return [...line.matchAll(/\]\((\/[^)\s]*)\)/g)].flatMap(([, href = ""]) =>
      href.startsWith(base) ? [] : [href],
    );
  });
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

  it("lists what a component's folder also exports, with its signature and JSDoc, after the props", () => {
    const markdown = pageMarkdown(root, "components/toaster", components) ?? "";
    const also = markdown.indexOf("### Also exported\n");
    expect(also).toBeGreaterThan(markdown.indexOf("### Toaster\n"));
    expect(markdown.indexOf("## Accessibility")).toBeGreaterThan(also);
    expect(markdown.slice(also)).toMatch(/\| `toast\(/);
  });

  it("skips a page's imports whole, however many lines one takes", () => {
    const markdown =
      pageMarkdown(root, "foundations/spacing-and-sizing", components) ?? "";
    expect(markdown).toMatch(
      /^# Spacing and sizing\n\n[^\n]+\n\nbuttery's spacing is a scale/,
    );
    expect(markdown).not.toContain("HeightScale,");
  });

  it.each(contentRoutesIn(root))(
    "leaves no sentence in %s's Markdown ending in a colon with nothing after it",
    (route) => {
      const lines = (pageMarkdown(root, route, components) ?? "").split("\n");
      const dangling = lines.flatMap((line, at) => {
        if (!/[^:]:$/.test(line) || /^\s*(?:[-*|#]|\d+\.)/.test(line))
          return [];
        const next = lines.slice(at + 1).find((after) => after.trim() !== "");
        return next === undefined || next.startsWith("#") ? [line] : [];
      });
      expect(dangling).toEqual([]);
    },
  );

  it("points to the live page where a block can't be written out", () => {
    expect(pageMarkdown(root, "foundations/elevation", components)).toContain(
      "The same levels in both:\n\nThe page draws this live: [Elevation › The levels](/foundations/elevation#the-levels).",
    );
    expect(
      pageMarkdown(root, "layout/surface-and-nesting", components),
    ).toContain(
      "[Surface and nesting › The nesting recipe](/layout/surface-and-nesting#the-nesting-recipe)",
    );
  });

  it("says where a component page's live demo and its variants and states are, in the page's order", () => {
    const markdown = pageMarkdown(root, "components/button", components) ?? "";
    const demo = markdown.indexOf(
      "## Demo\n\nThe page has a live demo of Button, with controls for its props and the code for what it shows: [Button › Demo](/components/button#demo).",
    );
    const gallery = markdown.indexOf(
      "## Variants and states\n\nThe page draws each of these live: [Button › Variants and states](/components/button#variants-and-states).\n\n- Variants: Primary for the one main action in view,",
    );
    expect(demo).toBeGreaterThan(-1);
    expect(markdown.indexOf("## When to use it")).toBeGreaterThan(demo);
    expect(gallery).toBeGreaterThan(markdown.indexOf("## Examples"));
    expect(markdown.indexOf("## Props")).toBeGreaterThan(gallery);
    expect(markdown).toContain(
      "- Sizes and shapes: 28, 36 and 48px tall; rounded corners for dialog steps.",
    );
  });

  it("turns a page's token blocks into tables", () => {
    const markdown = pageMarkdown(root, "foundations/radius", components) ?? "";
    expect(markdown).toMatch(/\| `--bt-r-lg` \| \d+px \|/);
  });

  it("writes What's new out with every release, newest first", () => {
    const markdown =
      pageMarkdown(root, "resources/whats-new", components) ?? "";
    expect(markdown).toContain("## 0.9.0: The docs site");
    expect(markdown.indexOf("## 0.9.0")).toBeLessThan(
      markdown.indexOf("## 0.1.0: Foundation"),
    );
  });

  it("writes the Introduction's cards as their headings and words, its newest release and the path on from it", () => {
    const markdown =
      pageMarkdown(root, "get-started/introduction", components) ?? "";
    expect(markdown).not.toMatch(/<\/?(?:Feature|FeatureGrid)\b/);
    expect(markdown).toContain("### Tokens and themes");
    expect(markdown).toContain("## New in 1.0");
    expect(markdown).toContain(
      "[Release notes for 1.0.0](/resources/whats-new#release-1-0-0)",
    );
    expect(markdown).toMatch(
      /^1\. \[Installation\]\(\/get-started\/installation\): /m,
    );
    expect(markdown).not.toContain("[Introduction](/get-started/introduction)");
  });

  it("writes the layout contract's rules numbered and its do and don't labelled, without their components' tags", () => {
    const markdown =
      pageMarkdown(root, "layout/the-layout-contract", components) ?? "";
    expect(markdown).toContain("**1. Flow layout**");
    expect(markdown).toContain("**13. Nothing moves after a press**");
    expect(markdown).toContain("**Do:**");
    expect(markdown).toContain("**Don't:**");
    expect(markdown).not.toMatch(/<\/?(?:Rules|Rule|DoDont|Do|Dont)\b/);
  });

  it("writes the Roadmap out from ROADMAP.md: the release being built with its boxes, and the shipped ones linking to their notes", () => {
    const markdown = pageMarkdown(root, "resources/roadmap", components) ?? "";
    const { releases } = roadmapIn(root);
    const building = releases.find((release) => release.stage === "now");
    const shipped = releases.filter((release) => release.stage === "shipped");
    const newest = shipped.at(-1);
    if (!building || !newest)
      throw new Error("ROADMAP.md has no release in progress or none shipped.");
    expect(markdown).toContain(
      `## Now: ${building.version}, ${building.title}`,
    );
    expect(markdown).toMatch(/^- \[[ x]\] /m);
    expect(markdown).toContain(
      `(/resources/whats-new#release-${newest.version.replaceAll(".", "-")})`,
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

  it("writes every page llms.txt lists into llms-full.txt as its Markdown, in llms.txt's order, with the demos last", () => {
    const text = llmsText(root, components);
    const full = llmsFullText(root, components);
    const routes = [...text.matchAll(/^- \[[^\]]+\]\(\/([^)]+)\.md\)/gm)].map(
      ([, route]) => route ?? "",
    );
    expect(routes).toEqual(listedRoutesIn(root, components));
    expect(full.startsWith("# buttery\n\n> A React design system")).toBe(true);
    let after = 0;
    for (const route of routes) {
      const at = full.indexOf(
        `\n\n---\n\n${(pageMarkdown(root, route, components) ?? "").trim()}\n\n---\n\n`,
        after,
      );
      expect(at, route).toBeGreaterThanOrEqual(after);
      after = at;
    }
    expect(full.slice(full.lastIndexOf("\n---\n"))).toContain("\n## Demos\n");
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

describe("the site as Markdown under a base", () => {
  const base = "/buttery/";

  it("links every page's Markdown under the base: its own links, its components' and the live page's", () => {
    const routes = [
      ...contentRoutesIn(root),
      ...components
        .filter((component) => component.home === undefined)
        .map((component) => componentHref(component).slice(1)),
    ];
    for (const route of routes) {
      const markdown = pageMarkdown(root, route, components, base) ?? "";
      expect(linksOutside(markdown, base), route).toEqual([]);
    }
    expect(
      pageMarkdown(root, "foundations/palettes", components, base),
    ).toContain("[color tokens](/buttery/foundations/colors)");
    const button = pageMarkdown(root, "components/button", components, base);
    expect(button).toContain(
      "[Button › Demo](/buttery/components/button#demo)",
    );
    expect(button).toContain(
      "- [IconButton](/buttery/components/icon-button.md)",
    );
    expect(
      pageMarkdown(root, "components/data-table", components, base),
    ).toContain("(/buttery/demos/roastery/orders)");
    expect(
      pageMarkdown(root, "templates/dashboard", components, base),
    ).toContain(
      "The template runs live at [/buttery/templates/dashboard/preview](/buttery/templates/dashboard/preview).",
    );
  });

  it("lists every page in llms.txt with a link to its Markdown under the base", () => {
    const text = llmsText(root, components, base);
    for (const route of contentRoutesIn(root))
      expect(text).toContain(`(/buttery/${route}.md)`);
    expect(text).toContain("(/buttery/components/button.md)");
    expect(listedUnder(text, "Demos")).toEqual([
      "/buttery/demos",
      ...demoPages.map((demo) => `/buttery/demos/${demo.route}`),
    ]);
    expect(linksOutside(text, base)).toEqual([]);
  });

  it("answers each page's Markdown, llms.txt and llms-full.txt at their addresses under the base", () => {
    const handle = markdownRequests(root, (path) => path === "/notes.md", base);
    expect(ask(handle, "/buttery/get-started/installation.md")).toEqual({
      status: 200,
      type: "text/markdown; charset=utf-8",
      passed: false,
    });
    expect(
      linksOutside(
        bodyOf(handle, "/buttery/get-started/installation.md") ?? "",
        base,
      ),
    ).toEqual([]);
    expect(ask(handle, "/buttery/llms.txt").type).toBe(
      "text/plain; charset=utf-8",
    );
    expect(bodyOf(handle, "/buttery/llms.txt")).toContain(
      "(/buttery/components/button.md)",
    );
    expect(ask(handle, "/buttery/llms-full.txt").type).toBe(
      "text/plain; charset=utf-8",
    );
    expect(
      linksOutside(bodyOf(handle, "/buttery/llms-full.txt") ?? "", base),
    ).toEqual([]);
    expect(ask(handle, "/buttery/get-started/instalation.md").status).toBe(404);
    expect(ask(handle, "/buttery/notes.md").passed).toBe(true);
    expect(ask(handle, "/get-started/installation.md").passed).toBe(true);
  });

  it("answers 404 for a .md address under the base the static build has no file for", () => {
    const out = mkdtempSync(join(tmpdir(), "buttery-markdown-"));
    try {
      mkdirSync(join(out, "get-started"));
      writeFileSync(
        join(out, "get-started/installation.md"),
        "# Installation\n",
      );
      const handle = missingMarkdown(out, base);
      expect(ask(handle, "/buttery/get-started/installation.md").passed).toBe(
        true,
      );
      expect(ask(handle, "/buttery/get-started/instalation.md")).toEqual({
        status: 404,
        type: "text/plain; charset=utf-8",
        passed: false,
      });
      expect(ask(handle, "/get-started/instalation.md").passed).toBe(true);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
