import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";
import { buildSearchIndexes } from "../src/search/search.ts";
import type { SearchDoc } from "../src/search/search.ts";
import { releaseId } from "../src/release-id.ts";
import { slugify } from "../src/slug.ts";
import { captionOf } from "./code.ts";
import { parseFrontmatter, splitFrontmatter } from "./frontmatter.ts";
import { propsTablesIn } from "./props.ts";
import { changelogFiles, releasesIn } from "./whats-new.ts";

/** Each section's name in a result's path, by the first part of a page's section. */
const SECTION_TITLES: Readonly<Record<string, string>> = {
  "get-started": "Get started",
  foundations: "Foundations",
  layout: "Layout",
  motion: "Motion",
  components: "Components",
  patterns: "Patterns",
  templates: "Templates",
  guides: "Guides",
  tools: "Tools",
  resources: "Resources",
};

/** Each component group's name, by its section. */
const GROUP_TITLES: Readonly<Record<string, string>> = {
  "components/actions": "Actions",
  "components/inputs": "Inputs",
  "components/selection": "Selection",
  "components/navigation": "Navigation",
  "components/overlays": "Overlays",
  "components/data-display": "Data display",
  "components/feedback": "Feedback and status",
};

/** The page each group of tokens is documented on. */
const TOKEN_PAGES: Readonly<Record<string, string>> = {
  color: "foundations/colors",
  shadow: "foundations/elevation",
  space: "foundations/spacing-and-sizing",
  height: "foundations/spacing-and-sizing",
  width: "layout/page-grid-and-containers",
  radius: "foundations/radius",
  z: "foundations/layers",
  duration: "motion/tokens",
  easing: "motion/tokens",
  timing: "motion/tokens",
  font: "foundations/typography",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function sectionTitle(section: string): string {
  return SECTION_TITLES[section.split("/")[0] ?? ""] ?? section;
}

/** A page's prose as plain words: no code blocks, components, imports or Markdown marks. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/^```[\s\S]*?^```/gm, " ")
    .replace(/^(?:import|export)\s.*$/gm, " ")
    .replace(/<[A-Z][\s\S]*?\/>/g, " ")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/\{[^{}]*\}/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A page's `##` and `###` sections: each heading with the text under it. */
function sectionsOf(
  body: string,
): { readonly heading: string; readonly text: string }[] {
  const sections: { heading: string; lines: string[] }[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    const heading = fenced ? null : /^#{2,3}\s+(.+)$/.exec(line);
    if (heading?.[1] !== undefined)
      sections.push({ heading: heading[1], lines: [] });
    else sections.at(-1)?.lines.push(line);
  }
  return sections.map(({ heading, lines }) => ({
    heading: heading.replace(/[`*_]/g, ""),
    text: plainText(lines.join("\n")),
  }));
}

/** The string and string-list fields of a meta file's `meta` object. */
function metaFields(file: string): Record<string, string | readonly string[]> {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const fields: Record<string, string | readonly string[]> = {};
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const value = declaration.initializer;
      if (!value || !ts.isObjectLiteralExpression(value)) continue;
      for (const property of value.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const key = property.name.getText(source);
        const init = property.initializer;
        if (ts.isStringLiteralLike(init)) fields[key] = init.text;
        else if (ts.isArrayLiteralExpression(init)) {
          fields[key] = init.elements.flatMap((element) =>
            ts.isStringLiteralLike(element) ? [element.text] : [],
          );
        }
      }
    }
  }
  return fields;
}

function stringField(
  fields: Record<string, string | readonly string[]>,
  key: string,
): string {
  const value = fields[key];
  return typeof value === "string" ? value : (value ?? []).join(" ");
}

/** A component page's `page` export, read from its `*.playground.tsx`. */
function componentPage(
  file: string,
): { readonly section: string; readonly home: string | undefined } | null {
  if (!existsSync(file)) return null;
  const block = /export const page: DocsPage = \{([\s\S]*?)\n\};/.exec(
    readFileSync(file, "utf8"),
  )?.[1];
  const section = block ? /section:\s*"([^"]+)"/.exec(block)?.[1] : undefined;
  if (block === undefined || section === undefined) return null;
  return { section, home: /home:\s*"([^"]+)"/.exec(block)?.[1] };
}

/**
 * Everything the docs search finds, read from the repository: each written page and its headings, each
 * component with its props and examples, each token and each release, with the path and link each result
 * shows.
 */
export function searchDocsIn(root: string): SearchDoc[] {
  const docs: SearchDoc[] = [];
  const contentDir = join(root, "apps/docs/content");
  for (const file of globSync("**/*.mdx", { cwd: contentDir }).sort()) {
    const route = file.replace(/\.mdx$/, "");
    const { block, body } = splitFrontmatter(
      readFileSync(join(contentDir, file), "utf8"),
    );
    if (block === null) continue;
    const data = parseFrontmatter(block, file);
    const title = typeof data["title"] === "string" ? data["title"] : route;
    const section =
      typeof data["section"] === "string" ? data["section"] : route;
    const group = sectionTitle(section);
    const intro = plainText(body.split(/^#{2}\s/m)[0] ?? "");
    docs.push({
      id: `page:${route}`,
      kind: "page",
      group,
      title,
      path: [group],
      href: `/${route}`,
      keywords:
        typeof data["description"] === "string" ? data["description"] : "",
      text: intro,
    });
    for (const { heading, text } of sectionsOf(body)) {
      docs.push({
        id: `heading:${route}#${slugify(heading)}`,
        kind: "heading",
        group,
        title: heading,
        path: [group, title],
        href: `/${route}#${slugify(heading)}`,
        keywords: title,
        text,
      });
    }
  }

  for (const meta of globSync("packages/*/src/**/*.meta.ts", {
    cwd: root,
  }).sort()) {
    const name = basename(meta, ".meta.ts");
    const folder = join(root, dirname(meta));
    const page = componentPage(join(folder, `${name}.playground.tsx`));
    if (!page) continue;
    const fields = metaFields(join(root, meta));
    const onOwnPage = page.home === undefined;
    const href = onOwnPage
      ? `/${page.section.split("/")[0] ?? ""}/${kebab(name)}`
      : `/${page.home}#${slugify(name)}`;
    const anchor = (part: string): string =>
      onOwnPage
        ? `${href}#${slugify(part)}`
        : `/${page.home}#${slugify(`${name} ${part}`)}`;
    const path = onOwnPage
      ? [
          sectionTitle(page.section),
          ...(GROUP_TITLES[page.section]
            ? [GROUP_TITLES[page.section] ?? ""]
            : []),
        ]
      : [sectionTitle(page.section)];
    docs.push({
      id: `component:${name}`,
      kind: "component",
      group: sectionTitle(page.section),
      title: name,
      path,
      href,
      keywords: stringField(fields, "useWhen"),
      text: stringField(fields, "purpose"),
    });
    const source = join(folder, `${name}.tsx`);
    if (existsSync(source)) {
      for (const table of propsTablesIn(name, source)) {
        const owner = table.part === "" ? name : `${name}.${table.part}`;
        for (const prop of table.props) {
          docs.push({
            id: `prop:${owner}.${prop.name}`,
            kind: "prop",
            group: "Props",
            title: prop.name,
            path: [...path, owner],
            href: anchor("Props"),
            keywords: `${owner} ${prop.type}`,
            text: prop.description,
          });
        }
      }
    }
    for (const example of globSync("*.tsx", {
      cwd: join(folder, "examples"),
    }).sort()) {
      const title = example.replace(/\.tsx$/, "").replaceAll("-", " ");
      docs.push({
        id: `example:${name}/${example}`,
        kind: "example",
        group: "Examples",
        title: title.charAt(0).toUpperCase() + title.slice(1),
        path: [...path, name],
        href: anchor("Examples"),
        keywords: name,
        text: captionOf(
          readFileSync(join(folder, "examples", example), "utf8"),
        ),
      });
    }
  }

  const tokens: unknown = JSON.parse(
    readFileSync(join(root, "packages/core/src/tokens/tokens.json"), "utf8"),
  );
  for (const [group, entries] of isRecord(tokens)
    ? Object.entries(tokens)
    : []) {
    const pageRoute = TOKEN_PAGES[group];
    if (pageRoute === undefined || !isRecord(entries)) continue;
    for (const [key, token] of Object.entries(entries)) {
      if (!isRecord(token) || typeof token["cssVar"] !== "string") continue;
      const cssVar = token["cssVar"];
      const values = ["value", "light", "dark", "comfortable", "compact"]
        .flatMap((field) => {
          const value = token[field];
          return typeof value === "string" || typeof value === "number"
            ? [`${field} ${String(value)}`]
            : [];
        })
        .join(", ");
      const description = token["description"];
      docs.push({
        id: `token:${cssVar}`,
        kind: "token",
        group: "Tokens",
        title: cssVar,
        path: [sectionTitle(pageRoute), key],
        href: `/${pageRoute}`,
        keywords: `${group} ${values}`,
        text: typeof description === "string" ? description : "",
      });
    }
  }

  for (const release of releasesIn(root)) {
    docs.push({
      id: `release:${release.version}`,
      kind: "release",
      group: "Changelog",
      title: `${release.version}: ${release.title}`,
      path: ["Resources", "What's new"],
      href: `/resources/whats-new#${releaseId(release.version)}`,
      keywords: `${release.title} release`,
      text: plainText(
        [
          ...release.highlights,
          ...release.changes.flatMap((change) => change.lines),
        ].join("\n"),
      ),
    });
  }
  return docs;
}

const TITLES_MODULE = "virtual:buttery-search/titles";
const TEXT_MODULE = "virtual:buttery-search/text";

/**
 * Serves the docs search's two indexes as JSON, `virtual:buttery-search/titles` (titles, keywords and each
 * result's place) and `virtual:buttery-search/text` (the full text), built from the repository when the
 * site builds and again in development when a page, component or token changes.
 */
export function butterySearch(root: string): Plugin {
  let built: { readonly titles: string; readonly text: string } | null = null;
  return {
    name: "buttery-docs-search",
    resolveId(source) {
      return source === TITLES_MODULE || source === TEXT_MODULE
        ? `\0${source}`
        : undefined;
    },
    watchChange() {
      built = null;
    },
    load(id) {
      if (id !== `\0${TITLES_MODULE}` && id !== `\0${TEXT_MODULE}`)
        return undefined;
      for (const file of globSync(
        [
          "apps/docs/content/**/*.mdx",
          "packages/*/src/**/*.{ts,tsx}",
          "packages/*/src/*/*/examples/*.tsx",
          "packages/core/src/tokens/tokens.json",
          "apps/docs/content/whats-new/*.md",
        ],
        { cwd: root },
      )) {
        this.addWatchFile(join(root, file));
      }
      for (const file of changelogFiles(root)) this.addWatchFile(file);
      if (!built) {
        const { titles, text } = buildSearchIndexes(searchDocsIn(root));
        built = { titles: JSON.stringify(titles), text: JSON.stringify(text) };
      }
      const json = id === `\0${TITLES_MODULE}` ? built.titles : built.text;
      return `export default ${JSON.stringify(json)};`;
    },
  };
}
