#!/usr/bin/env node
import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  parseFrontmatter,
  splitFrontmatter,
} from "../apps/docs/vite/frontmatter.ts";
import { demoPages } from "../apps/docs/src/routes.ts";
import { slugify } from "../apps/docs/src/slug.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

const SECTIONS = [
  "get-started",
  "foundations",
  "layout",
  "motion",
  "components/actions",
  "components/inputs",
  "components/selection",
  "components/navigation",
  "components/overlays",
  "components/data-display",
  "components/feedback",
  "patterns",
  "templates",
  "guides",
  "tools",
  "resources",
];
const STATUSES = ["new", "beta", "stable", "deprecated"];
const REQUIRED = [
  "title",
  "description",
  "section",
  "order",
  "status",
  "since",
];

function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** The text of a page outside its fenced code blocks, where headings and links can be. */
function prose(source) {
  return source.replace(/^```[\s\S]*?^```/gm, "");
}

function headingsOf(source) {
  return new Set(
    [...prose(source).matchAll(/^#{2,3}\s+(.+)$/gm)].map(([, text]) =>
      slugify(text ?? ""),
    ),
  );
}

function linksOf(source) {
  const text = prose(source);
  return [
    ...[...text.matchAll(/\]\(([^)\s]+)\)/g)].map(([, href]) => href),
    ...[...text.matchAll(/href=["{]["']?([^"'}\s]+)/g)].map(([, href]) => href),
  ].filter((href) => href !== undefined);
}

/** A metadata problem with one frontmatter field, or `null` when it's sound. */
function fieldProblem(key, value) {
  if (value === undefined) return `is missing ${key}`;
  switch (key) {
    case "order":
      return typeof value === "number"
        ? null
        : "has an order that isn't a number";
    case "section":
      return SECTIONS.includes(value)
        ? null
        : `has the section "${String(value)}", which isn't one of ${SECTIONS.join(", ")}`;
    case "status":
      return STATUSES.includes(value)
        ? null
        : `has the status "${String(value)}", which isn't one of ${STATUSES.join(", ")}`;
    case "since":
      return /^\d+\.\d+\.\d+$/.test(String(value))
        ? null
        : `has the version "${String(value)}" for since, which isn't x.y.z`;
    default:
      return typeof value === "string" && value.trim() !== ""
        ? null
        : `has an empty ${key}`;
  }
}

/** A component page's `page` export, read from its `*.playground.tsx`. */
function componentPage(file) {
  const source = readFileSync(file, "utf8");
  const block = /export const page: DocsPage = \{([\s\S]*?)\n\};/.exec(source);
  if (!block?.[1]) return null;
  const field = (name, pattern) => pattern.exec(block[1] ?? "")?.[1];
  const order = field("order", /order:\s*(\d+)/);
  return {
    section: field("section", /section:\s*"([^"]+)"/),
    title: field("title", /title:\s*"([^"]+)"/),
    order: order === undefined ? undefined : Number(order),
    home: field("home", /home:\s*"([^"]+)"/),
  };
}

/** The names `docs/DOCS_SITE.md` gives a home in its "Where every export is documented" table. */
function homesIn(docsSite) {
  const text = readFileSync(docsSite, "utf8");
  const start = text.indexOf("| Section and group | Exports |");
  if (start === -1) return new Set();
  const table = text.slice(start).split(/\n\s*\n/)[0] ?? "";
  return new Set([...table.matchAll(/`([A-Za-z]+)`/g)].map(([, name]) => name));
}

/**
 * Checks the docs site's pages: every page has its metadata, no two pages in a section share an order,
 * every internal link reaches a page (and heading) that exists, and every component has a home in
 * `docs/DOCS_SITE.md`. Returns the problems, each saying how to fix it.
 */
export function checkDocs({
  contentDir = join(root, "apps/docs/content"),
  metaFiles = globSync("packages/*/src/*/*/*.meta.ts", { cwd: root }).map(
    (file) => join(root, file),
  ),
  docsSite = join(root, "docs/DOCS_SITE.md"),
  references = [],
  demos = demoPages.map((page) => page.route),
} = {}) {
  const problems = [];
  const pages = [];
  const homed = [];
  const say = (file) => relative(root, file);

  const contentFiles = existsSync(contentDir)
    ? globSync("**/*.mdx", { cwd: contentDir }).map((file) =>
        join(contentDir, file),
      )
    : [];
  for (const file of contentFiles.sort()) {
    const source = readFileSync(file, "utf8");
    const route = relative(contentDir, file).replace(/\.mdx$/, "");
    const { block, body } = splitFrontmatter(source);
    const page = {
      route,
      file,
      headings: headingsOf(body),
      links: linksOf(body),
    };
    pages.push(page);
    if (block === null) {
      problems.push(
        `${say(file)} has no frontmatter. Fix: start it with a --- block holding ${REQUIRED.join(", ")}.`,
      );
      continue;
    }
    const data = parseFrontmatter(block, say(file));
    for (const key of REQUIRED) {
      const problem = fieldProblem(key, data[key]);
      if (problem)
        problems.push(
          `${say(file)} ${problem}. Fix: set ${key} in its frontmatter, as the other pages in its folder do.`,
        );
    }
    const folder = route.split("/")[0];
    if (
      typeof data.section === "string" &&
      data.section.split("/")[0] !== folder
    ) {
      problems.push(
        `${say(file)} is in content/${folder ?? ""}/ but its section is ${data.section}. Fix: move the file to content/${data.section.split("/")[0] ?? ""}/ or change its section.`,
      );
    }
    Object.assign(page, {
      section: data.section,
      title: data.title,
      order: data.order,
    });
    const related = data.related ?? [];
    page.links.push(
      ...(Array.isArray(related) ? related : [related]).map(
        (route) => `/${String(route)}`,
      ),
    );
  }

  for (const meta of metaFiles) {
    const name = basename(meta, ".meta.ts");
    const playground = join(dirname(meta), `${name}.playground.tsx`);
    const page = existsSync(playground) ? componentPage(playground) : null;
    if (!page) {
      problems.push(
        `${say(playground)} exports no page. Fix: export const page: DocsPage = { section, title, description, order, status, since }.`,
      );
      continue;
    }
    if (page.home !== undefined) {
      homed.push({ name, home: page.home, file: playground });
      continue;
    }
    const route = `${(page.section ?? "").split("/")[0]}/${kebab(name)}`;
    pages.push({
      route,
      file: playground,
      headings: new Set(),
      links: [],
      ...page,
    });
  }

  for (const { name, home, file } of homed) {
    const written = pages.find(
      (page) => page.route === home && page.file.endsWith(".mdx"),
    );
    if (!written) {
      problems.push(
        `${say(file)} gives ${name} the home ${home}, which isn't a written page. Fix: write apps/docs/content/${home}.mdx, or point home at one that exists.`,
      );
      continue;
    }
    const shown = new RegExp(`<ComponentDocs\\s+of="${name}"`).test(
      readFileSync(written.file, "utf8"),
    );
    if (!shown) {
      problems.push(
        `${say(written.file)} is ${name}'s home but doesn't show it. Fix: add a "## ${name}" heading and <ComponentDocs of="${name}" /> under it.`,
      );
    }
  }

  for (const reference of references) {
    pages.push({
      ...reference,
      file: join(root, "apps/docs/src/routes.ts"),
      headings: new Set(),
      links: [],
    });
  }

  const folders = new Map(
    metaFiles.map((meta) => [basename(meta, ".meta.ts"), dirname(meta)]),
  );
  for (const page of pages) {
    if (!page.file.endsWith(".mdx")) continue;
    const source = readFileSync(page.file, "utf8");
    for (const [, of, name] of prose(source).matchAll(
      /<Example\s+of="([^"]+)"\s+name="([^"]+)"/g,
    )) {
      const folder = folders.get(of ?? "");
      if (folder && existsSync(join(folder, "examples", `${name ?? ""}.tsx`)))
        continue;
      problems.push(
        `${say(page.file)} shows <Example of="${of ?? ""}" name="${name ?? ""}">, which doesn't exist. Fix: name a component and a file in its examples folder, without .tsx.`,
      );
    }
  }

  const bySection = new Map();
  for (const page of pages) {
    if (page.section === undefined || page.order === undefined) continue;
    const key = `${String(page.section)} ${String(page.order)}`;
    const other = bySection.get(key);
    if (other) {
      problems.push(
        `"${String(other.title)}" (${say(other.file)}) and "${String(page.title)}" (${say(page.file)}) share order ${String(page.order)} in ${String(page.section)}. Fix: give one of them an order no other page in its section has.`,
      );
    } else {
      bySection.set(key, page);
    }
  }

  const byRoute = new Map(pages.map((page) => [page.route, page]));
  for (const page of pages) {
    for (const href of page.links) {
      if (/^[a-z]+:/i.test(href) || href.startsWith("//")) continue;
      const [path = "", anchor] = href.split("#");
      const target =
        path === ""
          ? page
          : byRoute.get(path.replace(/^\/+|\/+$/g, "").split("?")[0] ?? "");
      const bare = path.replace(/^\/+|\/+$/g, "");
      const demo = demos.some(
        (name) => bare === `demos/${name}` || bare.startsWith(`demos/${name}/`),
      );
      if (!target && !demo && !bare.startsWith("lab/")) {
        problems.push(
          `${say(page.file)} links to ${href}, which isn't a page on the site. Fix: link to a page's path, such as /components/button.`,
        );
        continue;
      }
      if (anchor !== undefined && target && !target.headings.has(anchor)) {
        problems.push(
          `${say(page.file)} links to ${href}, but ${target.route} has no heading with the id ${anchor}. Fix: link to one of its headings: ${[...target.headings].join(", ") || "it has none"}.`,
        );
      }
    }
  }

  const homes = existsSync(docsSite) ? homesIn(docsSite) : new Set();
  for (const meta of metaFiles) {
    const name = basename(meta, ".meta.ts");
    if (!homes.has(name)) {
      problems.push(
        `${name} has no home in ${say(docsSite)}. Fix: add it to its section's row in "Where every export is documented".`,
      );
    }
  }
  return problems;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const problems = checkDocs();
  if (problems.length > 0) {
    process.stderr.write(
      `docs check found ${String(problems.length)} problems:\n`,
    );
    for (const problem of problems) process.stderr.write(`  ${problem}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(
      "docs check: every page has its metadata, its own order, live links and a home.\n",
    );
  }
}
