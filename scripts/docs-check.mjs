#!/usr/bin/env node
import { existsSync, globSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  parseFrontmatter,
  splitFrontmatter,
} from "../apps/docs/vite/frontmatter.ts";
import { demoPages } from "../apps/docs/src/routes.ts";
import { COMPONENT_SECTIONS, exampleTitle } from "../apps/docs/src/anatomy.ts";
import { slugify } from "../apps/docs/src/slug.ts";
import { exportsOf, propsTablesIn } from "../apps/docs/vite/props.ts";
import {
  changelogFiles,
  changelogVersions,
  entryOf,
  newestFirst,
} from "../apps/docs/vite/whats-new.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

const SECTIONS = [
  "get-started",
  "foundations",
  "layout",
  "motion",
  "components",
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

/**
 * The ids of a component's headings: its sections and its examples', each after `prefix` on the written page
 * that shows it with `<ComponentDocs>`, where it has no Demo.
 */
function componentHeadings(folder, prefix = "") {
  const examples = existsSync(join(folder, "examples"))
    ? readdirSync(join(folder, "examples")).filter((file) =>
        file.endsWith(".tsx"),
      )
    : [];
  const id = (text) => slugify(prefix === "" ? text : `${prefix} ${text}`);
  return [
    ...COMPONENT_SECTIONS.filter(
      (section) => prefix === "" || section !== "Demo",
    ).map(id),
    ...examples.map((file) => id(`${exampleTitle(file)} example`)),
  ];
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
    since: field("since", /since:\s*"([^"]+)"/),
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
 * `docs/DOCS_SITE.md`, the examples its page asks for, a live demo on a page of its own, and the keyboard,
 * layout and reduced-motion notes its meta gives the page; and every other export of `@butteryui/react` is
 * described on a page that lists it in its `exports`; and every release a package's changelog lists, and every
 * release a page says it arrived in, has a What's new entry with two or three highlights. Returns the problems,
 * each saying how to fix it.
 */
export function checkDocs({
  contentDir = join(root, "apps/docs/content"),
  metaFiles = globSync("packages/*/src/**/*.meta.ts", { cwd: root }).map(
    (file) => join(root, file),
  ),
  docsSite = join(root, "docs/DOCS_SITE.md"),
  references = [],
  demos = demoPages.map((page) => page.route),
  examples = true,
  packageIndex = join(root, "packages/react/src/index.ts"),
  whatsNew = join(contentDir, "whats-new"),
  changelogs = changelogFiles(root),
} = {}) {
  const problems = [];
  const pages = [];
  const homed = [];
  const arrivals = [];
  const documents = new Map();
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
    if (data.since !== undefined)
      arrivals.push({ file, since: String(data.since) });
    const listed = data.exports ?? [];
    for (const name of Array.isArray(listed) ? listed : [listed])
      documents.set(String(name), { file, body });
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
    if (page.since !== undefined)
      arrivals.push({ file: playground, since: page.since });
    if (page.home !== undefined) {
      homed.push({ name, home: page.home, file: playground });
      continue;
    }
    if (!/^export const live\b/m.test(readFileSync(playground, "utf8"))) {
      problems.push(
        `${say(playground)} has no live demo. Fix: export const live: LiveDemo = { controls, render }, with a control for each prop a reader most wants to try.`,
      );
    }
    const route = `${(page.section ?? "").split("/")[0]}/${kebab(name)}`;
    pages.push({
      route,
      file: playground,
      headings: new Set(componentHeadings(dirname(meta))),
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
      continue;
    }
    for (const id of componentHeadings(dirname(file), name))
      written.headings.add(id);
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

  for (const meta of metaFiles) {
    const name = basename(meta, ".meta.ts");
    const source = join(dirname(meta), `${name}.tsx`);
    if (!existsSync(source)) continue;
    for (const table of propsTablesIn(name, source)) {
      for (const prop of table.props) {
        if (prop.description !== "") continue;
        const owner = table.part === "" ? name : `${name}.${table.part}`;
        problems.push(
          `${say(source)}: ${owner}'s prop ${prop.name} has no JSDoc, so its props table can't say what it does. Fix: add a /** … */ comment above it saying what it does and its default.`,
        );
      }
    }
  }

  if (examples) {
    for (const meta of metaFiles) {
      const name = basename(meta, ".meta.ts");
      const folder = dirname(meta);
      const source = join(folder, `${name}.tsx`);
      const props = existsSync(source)
        ? new Set(
            (
              propsTablesIn(name, source).find((table) => table.part === "")
                ?.props ?? []
            ).map((prop) => prop.name),
          )
        : new Set();
      const needed = [
        "basic",
        ...(["value", "checked", "open", "expanded"].some((prop) =>
          props.has(prop),
        )
          ? ["controlled"]
          : []),
        ...(props.has("variant") || props.has("size") ? ["variants"] : []),
        ...(["disabled", "loading", "error", "pending", "invalid"].some(
          (prop) => props.has(prop),
        )
          ? ["states"]
          : []),
        "composition",
      ];
      const files = existsSync(join(folder, "examples"))
        ? globSync("*.tsx", { cwd: join(folder, "examples") }).map((file) =>
            join(folder, "examples", file),
          )
        : [];
      const kinds = new Set();
      for (const file of files) {
        const text = readFileSync(file, "utf8");
        const kind = /export const kind: ExampleKind = "([a-z]+)"/.exec(
          text,
        )?.[1];
        if (kind === undefined) {
          problems.push(
            `${say(file)} doesn't say what kind of example it is. Fix: export const kind: ExampleKind = "basic" (or "controlled", "variants", "states", "composition").`,
          );
        } else kinds.add(kind);
        if (!/export const play\b/.test(text)) {
          problems.push(
            `${say(file)} has no play script. Fix: export const play: ExamplePlay that drives it, such as pressing a button and seeing what changes.`,
          );
        }
        if (!/\/\*\*[\s\S]*?\*\/\s*export function [A-Z]/.test(text)) {
          problems.push(
            `${say(file)} has no caption. Fix: put a one-line /** … */ saying what it shows above its exported component.`,
          );
        }
      }
      for (const kind of needed) {
        if (!kinds.has(kind)) {
          problems.push(
            `${name} has no ${kind} example. Fix: add one to ${say(join(folder, "examples"))} with export const kind: ExampleKind = "${kind}".`,
          );
        }
      }
    }
  }

  for (const meta of metaFiles) {
    const name = basename(meta, ".meta.ts");
    const text = readFileSync(meta, "utf8");
    if (!/^\s+keyboard:/m.test(text)) {
      problems.push(
        `${say(meta)} has no keyboard table. Fix: add keyboard: [{ keys: "Enter or Space", does: "Presses it" }], a row for each key it answers while it has focus, or keyboard: [] when it takes no keyboard input of its own.`,
      );
    }
    if (!/^\s+layout:/m.test(text)) {
      problems.push(
        `${say(meta)} doesn't say how ${name} lays out. Fix: add layout: "…", on how it sizes itself (its height token and width), what it truncates or wraps, and its hit areas.`,
      );
    }
    if (
      !/^\s+motion: "none"/m.test(text) &&
      !/^\s+reducedMotion:/m.test(text)
    ) {
      problems.push(
        `${say(meta)} doesn't say what ${name} does with reduced motion. Fix: add reducedMotion: "…", one sentence on how it moves when motion is reduced.`,
      );
    }
  }

  if (packageIndex !== null && existsSync(packageIndex)) {
    for (const { name, file } of exportsOf(packageIndex)) {
      const folder = dirname(file);
      const inComponent =
        existsSync(folder) &&
        readdirSync(folder).some((entry) => entry.endsWith(".meta.ts"));
      if (inComponent) continue;
      const page = documents.get(name);
      if (!page) {
        problems.push(
          `${name}, exported from ${say(packageIndex)}, has no docs page. Fix: add it to exports: [...] in the frontmatter of the page that documents it, and describe it there.`,
        );
      } else if (!new RegExp(`\`${name}[\`(]`).test(prose(page.body))) {
        problems.push(
          `${say(page.file)} lists ${name} in its exports but doesn't describe it. Fix: write about \`${name}\` on the page, with its name in backticks, alone or called, as in \`${name}()\`.`,
        );
      }
    }
  }

  const entries = existsSync(whatsNew)
    ? globSync("*.md", { cwd: whatsNew })
        .sort()
        .map((file) => ({
          file: join(whatsNew, file),
          ...entryOf(join(whatsNew, file)),
        }))
    : [];
  const exampleFile = (reference) => {
    const [name = "", file = ""] = reference.split("/");
    const meta = metaFiles.find((path) => basename(path, ".meta.ts") === name);
    return meta === undefined
      ? undefined
      : join(dirname(meta), "examples", `${file}.tsx`);
  };
  for (const entry of entries) {
    const missing = ["version", "date", "title", "summary"].filter(
      (key) => entry[key] === "",
    );
    if (missing.length > 0) {
      problems.push(
        `${say(entry.file)} has no ${missing.join(" or ")}. Fix: give its frontmatter version, date (YYYY-MM-DD), title and summary, a sentence on what the release is for.`,
      );
    }
    for (const reference of entry.examples) {
      const file = exampleFile(reference);
      if (file === undefined || !existsSync(file)) {
        problems.push(
          `${say(entry.file)} shows the example ${reference}, which doesn't exist. Fix: name a component and one of its examples' files, such as examples: [Slider/opacity-row].`,
        );
      }
    }
    if (entry.highlights.length < 2 || entry.highlights.length > 3) {
      problems.push(
        `${say(entry.file)} has ${String(entry.highlights.length)} highlight${entry.highlights.length === 1 ? "" : "s"}. Fix: list two or three, each a "- " line on what the release brought.`,
      );
    }
  }
  if (entries.length > 0) {
    const versions = entries.map((entry) => entry.version);
    for (const { file, since } of arrivals) {
      if (!versions.includes(since)) {
        problems.push(
          `${say(file)} says it arrived in ${since}, a release What's new has no entry for. Fix: set since to the release it arrived in, one of ${[...versions].sort(newestFirst).reverse().join(", ")}.`,
        );
      }
    }
  }
  for (const changelog of changelogs) {
    for (const version of changelogVersions(
      readFileSync(changelog, "utf8"),
    ).keys()) {
      if (!entries.some((entry) => entry.version === version)) {
        problems.push(
          `${say(changelog)} has ${version}, but What's new has no entry for it. Fix: add ${say(join(whatsNew, `${version}.md`))} with its version, date and title in the frontmatter and two or three highlights.`,
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
