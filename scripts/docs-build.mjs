#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import { checkDocs } from "./docs-check.mjs";
import { docsBase, sitePath } from "../apps/docs/src/base.ts";
import {
  componentSources,
  llmsFullText,
  llmsText,
  pageMarkdown,
} from "../apps/docs/vite/markdown.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const app = join(root, "apps/docs");

/**
 * The origin of `siteUrl`, the site's address, for the sitemap's and the canonical links' absolute
 * addresses, which add the base to it: `https://aliboily.github.io` for `https://aliboily.github.io/buttery`.
 * Throws when the address has a path the site isn't built to be served under, saying how to fix it.
 */
function originOf(siteUrl, base) {
  const url = new URL(siteUrl);
  const path = `${url.pathname.replace(/\/+$/, "")}/`;
  if (path !== "/" && path !== base) {
    throw new Error(
      `DOCS_URL is ${siteUrl}, under ${path}, but the site is built to be served from ${base}. Fix: set BUTTERY_DOCS_BASE=${path}, or leave the path off DOCS_URL.`,
    );
  }
  return url.origin;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function write(file, contents) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

/**
 * Builds the docs site into `apps/docs/dist`: the app, then every public route prerendered with React's own
 * server renderer into its own `index.html`, the demos and the template previews with the pages inside them
 * among them, each page's Markdown at its path plus `.md`, `llms.txt`, `llms-full.txt`, a `sitemap.xml`, a
 * `404.html` for addresses nothing was written for, such as a demo's customer, and a `.nojekyll` so GitHub
 * Pages serves the files as they are. Each section's own address, such as `/foundations`, is written as the
 * page it opens, naming that page as canonical, and left out of the sitemap. Development-only routes under
 * `/lab` aren't written. `base` is the path the site is served under, `BUTTERY_DOCS_BASE` or `/`: every link,
 * asset and address the build writes is under it, and the sitemap's and the canonical links' absolute
 * addresses are the origin of `siteUrl`, `DOCS_URL`, with the base after it. It runs the docs check first and
 * builds nothing while that finds a problem, such as an export with no page or a broken link.
 */
export async function buildDocs({
  out = join(app, "dist"),
  server = join(app, "dist-server"),
  check = checkDocs,
  base = docsBase(process.env["BUTTERY_DOCS_BASE"]),
  siteUrl = process.env["DOCS_URL"] ?? "https://buttery.example",
} = {}) {
  const origin = originOf(siteUrl, base);
  const problems = check();
  if (problems.length > 0) {
    throw new Error(
      `The docs check found ${String(problems.length)} problem${problems.length === 1 ? "" : "s"}, so the site wasn't built:\n${problems.map((problem) => `  ${problem}`).join("\n")}`,
    );
  }
  rmSync(out, { recursive: true, force: true });
  rmSync(server, { recursive: true, force: true });
  await build({
    root: app,
    configFile: join(app, "vite.config.ts"),
    base,
    logLevel: "warn",
    build: { outDir: out, emptyOutDir: true },
  });
  await build({
    root: app,
    configFile: join(app, "vite.config.ts"),
    base,
    logLevel: "warn",
    build: { ssr: "src/entry-server.tsx", outDir: server, emptyOutDir: true },
  });
  const entry = await import(
    pathToFileURL(join(server, "entry-server.js")).href
  );
  const template = readFileSync(join(out, "index.html"), "utf8");
  const pageHtml = (route, head = "") => {
    const page = entry.render(route);
    return template
      .replace(
        "<title>buttery</title>",
        `<title>${escapeHtml(page.title)}</title>`,
      )
      .replace(
        "</title>",
        `</title>\n    <meta name="description" content="${escapeHtml(page.description)}" />${head}`,
      )
      .replace('<div id="root"></div>', `<div id="root">${page.html}</div>`);
  };
  const routes = entry.publicRoutes();
  for (const route of routes) {
    write(join(out, route, "index.html"), pageHtml(route));
  }
  for (const [route, home] of entry.sectionRoutes()) {
    write(
      join(out, route, "index.html"),
      pageHtml(
        route,
        `\n    <link rel="canonical" href="${escapeHtml(`${origin}${sitePath(`/${home}`, base)}`)}" />`,
      ),
    );
  }
  const components = componentSources(root);
  for (const route of routes) {
    const markdown = pageMarkdown(root, route, components, base);
    if (markdown !== null) write(join(out, `${route}.md`), markdown);
  }
  write(join(out, "llms.txt"), llmsText(root, components, base));
  write(join(out, "llms-full.txt"), llmsFullText(root, components, base));
  // A static host serves 404.html for any address it has no file for, and the app draws that address itself.
  write(join(out, "404.html"), template);
  // Without it, GitHub Pages runs a site published from a branch through Jekyll, which skips files whose names start with "_" and turns the .md pages into HTML.
  write(join(out, ".nojekyll"), "");
  write(
    join(out, "sitemap.xml"),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...routes.map(
        (route) =>
          `  <url><loc>${origin}${sitePath(`/${route}`, base)}</loc></url>`,
      ),
      "</urlset>",
      "",
    ].join("\n"),
  );
  rmSync(server, { recursive: true, force: true });
  return routes;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const routes = await buildDocs();
  process.stdout.write(
    `Wrote ${String(routes.length)} pages, their Markdown, llms.txt, llms-full.txt, sitemap.xml and 404.html to apps/docs/dist, to be served under ${docsBase(process.env["BUTTERY_DOCS_BASE"])}.\n`,
  );
}
