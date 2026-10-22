import {
  existsSync,
  globSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  componentHref,
  componentSources,
  contentRoutesIn,
} from "../apps/docs/vite/markdown.ts";
import { demoPages, templates } from "../apps/docs/src/routes.ts";
import { buildDocs } from "./docs-build.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), "buttery-docs-build-"));
const out = join(scratch, "dist");
// The server build imports the app's packages, so it's written inside the app, where Node finds them.
const server = join(root, "apps/docs/dist-server-test");
let routes = [];

beforeAll(async () => {
  routes = await buildDocs({ out, server });
}, 180_000);

afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
  rmSync(server, { recursive: true, force: true });
});

describe("pnpm docs:build", () => {
  it("builds nothing while the docs check finds a problem", async () => {
    const elsewhere = join(scratch, "unbuilt");
    await expect(
      buildDocs({
        out: elsewhere,
        server,
        check: () => [
          "apps/docs/content/guides/x.mdx links to /nowhere, which isn't a page on the site.",
        ],
      }),
    ).rejects.toThrow(
      /found 1 problem, so the site wasn't built:\n {2}apps\/docs\/content\/guides\/x\.mdx/,
    );
    expect(existsSync(elsewhere)).toBe(false);
  });

  it("prerenders the landing page as the site's index", () => {
    const html = readFileSync(join(out, "index.html"), "utf8");
    expect(html).toContain("<title>buttery</title>");
    expect(html).toMatch(/<h1[^>]*>[^<]*Make anything buttery\.[^<]*<\/h1>/);
    expect(html).toContain(
      '<meta name="description" content="Make anything buttery." />',
    );
  });

  it("prerenders every written page, with its title and heading in the markup", () => {
    for (const route of contentRoutesIn(root)) {
      const html = readFileSync(join(out, route, "index.html"), "utf8");
      expect(html, route).toMatch(/<h1[^>]*>[^<]+<\/h1>/);
      expect(html, route).toMatch(/<title>[^<]+ · buttery<\/title>/);
      expect(existsSync(join(out, `${route}.md`)), route).toBe(true);
    }
  });

  it("prerenders every component page and writes its Markdown", () => {
    for (const component of componentSources(root).filter(
      (candidate) => candidate.home === undefined,
    )) {
      const route = componentHref(component).slice(1);
      const html = readFileSync(join(out, route, "index.html"), "utf8");
      expect(html, route).toContain(`>${component.name}</h1>`);
      expect(readFileSync(join(out, `${route}.md`), "utf8")).toContain(
        `# ${component.name}\n`,
      );
    }
  });

  it("prerenders the demos page, each demo and the pages inside it, and each template's preview", () => {
    expect(readFileSync(join(out, "demos/index.html"), "utf8")).toMatch(
      /<h1[^>]*>Demos<\/h1>/,
    );
    for (const demo of demoPages) {
      const html = readFileSync(
        join(out, "demos", demo.route, "index.html"),
        "utf8",
      );
      expect(html, demo.route).toContain(
        `<title>${demo.title} · buttery</title>`,
      );
    }
    expect(
      readFileSync(
        join(out, "demos/roastery/settings/notifications/index.html"),
        "utf8",
      ),
    ).toMatch(/<h1[^>]*>Notifications<\/h1>/);
    expect(
      readFileSync(
        join(out, "demos/roastery/settings/notifications/index.html"),
        "utf8",
      ),
    ).toContain('href="/demos/roastery/orders"');
    for (const template of templates) {
      expect(
        existsSync(join(out, "templates", template.name, "preview/index.html")),
        template.name,
      ).toBe(true);
    }
    expect(
      readFileSync(
        join(out, "templates/dashboard/preview/orders/index.html"),
        "utf8",
      ),
    ).toMatch(/<h1[^>]*>Orders<\/h1>/);
  });

  it("writes a 404.html that draws whatever address it's opened at", () => {
    expect(readFileSync(join(out, "404.html"), "utf8")).toContain(
      '<div id="root"></div>',
    );
  });

  it("lists every route it wrote in the sitemap, and leaves the lab out", () => {
    const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
    for (const route of routes) expect(sitemap).toContain(`/${route}</loc>`);
    expect(routes.some((route) => route.startsWith("lab"))).toBe(false);
    expect(globSync("**/lab/**", { cwd: out })).toEqual([]);
  });

  it("writes llms.txt beside the pages", () => {
    expect(readFileSync(join(out, "llms.txt"), "utf8")).toContain(
      "(/components/button.md)",
    );
  });
});
