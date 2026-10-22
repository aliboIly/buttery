#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import {
  componentSources,
  llmsText,
  pageMarkdown,
} from "../apps/docs/vite/markdown.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const app = join(root, "apps/docs");

/** Where the site is served from, for the sitemap's absolute links. */
const SITE_URL = (process.env["DOCS_URL"] ?? "https://buttery.example").replace(
  /\/+$/,
  "",
);

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
 * server renderer into its own `index.html`, each page's Markdown at its path plus `.md`, `llms.txt` and a
 * `sitemap.xml`. Development-only routes under `/lab` aren't written.
 */
export async function buildDocs({
  out = join(app, "dist"),
  server = join(app, "dist-server"),
} = {}) {
  rmSync(out, { recursive: true, force: true });
  rmSync(server, { recursive: true, force: true });
  await build({
    root: app,
    configFile: join(app, "vite.config.ts"),
    logLevel: "warn",
    build: { outDir: out, emptyOutDir: true },
  });
  await build({
    root: app,
    configFile: join(app, "vite.config.ts"),
    logLevel: "warn",
    build: { ssr: "src/entry-server.tsx", outDir: server, emptyOutDir: true },
  });
  const entry = await import(
    pathToFileURL(join(server, "entry-server.js")).href
  );
  const template = readFileSync(join(out, "index.html"), "utf8");
  const routes = entry.publicRoutes();
  for (const route of routes) {
    const page = entry.render(route);
    const html = template
      .replace(
        "<title>buttery</title>",
        `<title>${escapeHtml(page.title)}</title>`,
      )
      .replace(
        "</title>",
        `</title>\n    <meta name="description" content="${escapeHtml(page.description)}" />`,
      )
      .replace('<div id="root"></div>', `<div id="root">${page.html}</div>`);
    write(join(out, route, "index.html"), html);
  }
  const components = componentSources(root);
  for (const route of routes) {
    const markdown = pageMarkdown(root, route, components);
    if (markdown !== null) write(join(out, `${route}.md`), markdown);
  }
  write(join(out, "llms.txt"), llmsText(root, components));
  write(
    join(out, "sitemap.xml"),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...routes.map((route) => `  <url><loc>${SITE_URL}/${route}</loc></url>`),
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
    `Wrote ${String(routes.length)} pages, their Markdown, llms.txt and sitemap.xml to apps/docs/dist.\n`,
  );
}
