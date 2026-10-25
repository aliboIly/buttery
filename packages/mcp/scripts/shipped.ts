import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import {
  componentSources,
  listedRoutesIn,
  llmsFullText,
  llmsText,
  pageMarkdown,
} from "../../../apps/docs/vite/markdown.ts";
import type {
  ComponentEntry,
  ExampleEntry,
  Knowledge,
  KeyboardEntry,
  PropsEntry,
  TypeEntry,
} from "../src/knowledge.ts";
import { SITE } from "./knowledge.ts";

/** The shape of `manifest.json`; it changes when a field is renamed or removed. */
export const MANIFEST_FORMAT = 1;

/** An example as `manifest.json` lists it, its code in a file of its own. */
export interface ManifestExample {
  readonly name: string;
  readonly title: string;
  /** What it shows: `basic` use, `controlled` state, `variants`, `states` or a `composition` with others. */
  readonly kind: string;
  readonly caption: string;
  /** Its code's file, from the manifest's folder, such as `examples/Button/primary-action.tsx`. */
  readonly file: string;
}

/** A component, primitive, layer or pattern as `manifest.json` describes it. */
export interface ManifestComponent {
  readonly name: string;
  readonly kind: ComponentEntry["kind"];
  readonly package: string;
  /** The line that imports it, such as `import { Button } from "@butteryui/react";`. */
  readonly import: string;
  /** Its page on the docs site. */
  readonly docs: string;
  /** Its page as Markdown, in `@butteryui/core`, such as `@butteryui/core/dist/docs/components/button.md`. */
  readonly markdown: string;
  readonly purpose: string;
  readonly useWhen: readonly string[];
  readonly avoidWhen: readonly string[];
  readonly related: readonly string[];
  readonly a11y: string;
  readonly keyboard: readonly KeyboardEntry[];
  readonly motion: string;
  readonly reducedMotion: string;
  readonly layout: string;
  readonly props: readonly PropsEntry[];
  readonly examples: readonly ManifestExample[];
}

/** `manifest.json`: every component, primitive, layer and pattern of one buttery version, for tools and agents. */
export interface Manifest {
  readonly format: number;
  readonly version: string;
  readonly site: string;
  readonly components: readonly ManifestComponent[];
  /** The token and literal-union types props take, such as `SpaceValue`, each with its values. */
  readonly types: readonly TypeEntry[];
}

/**
 * `markdown`, written with links from the site's root, with each link to a page in `shipped` pointing at
 * that page's file under `docs/`, relative to `from`, the folder the Markdown is written in, and every
 * other link from the site's root, such as a demo's, at the docs site.
 */
export function shippedLinks(
  markdown: string,
  from: string,
  shipped: ReadonlySet<string>,
): string {
  return markdown.replace(/\]\((\/(?!\/)[^)\s]*)\)/g, (_, href: string) => {
    const [path = "", anchor] = href.split("#");
    const route = path.slice(1).replace(/\.md$/, "");
    if (!shipped.has(route)) return `](${SITE}${href})`;
    const file = posix.relative(from, `docs/${route}.md`);
    return `](${file}${anchor === undefined ? "" : `#${anchor}`})`;
  });
}

/**
 * What `@butteryui/core` ships for coding agents, by path under its `dist`: every page `llms.txt` lists, as
 * Markdown under `docs/` at its route, and `llms.txt` and `llms-full.txt`. Links between pages reach their
 * files, so the docs read offline; any other link, such as a demo's, goes to the docs site.
 */
export function coreFiles(root: string, version: string): Map<string, string> {
  const components = componentSources(root);
  const routes = listedRoutesIn(root, components);
  const shipped = new Set(routes);
  const files = new Map<string, string>();
  for (const route of routes) {
    const file = `docs/${route}.md`;
    const markdown = pageMarkdown(root, route, components, "/");
    if (markdown === null) {
      throw new Error(
        `llms.txt lists /${route}, which has no Markdown. Fix: give the page an .mdx file or a component's playground.`,
      );
    }
    files.set(file, shippedLinks(markdown, posix.dirname(file), shipped));
  }
  files.set(
    "llms.txt",
    shippedLinks(
      llmsText(
        root,
        components,
        "/",
        `These are the docs of buttery ${version}, the version installed here: each page is a Markdown file under \`docs/\` beside this file, and on ${SITE}.`,
      ),
      ".",
      shipped,
    ),
  );
  files.set(
    "llms-full.txt",
    shippedLinks(
      llmsFullText(
        root,
        components,
        "/",
        `These are the docs of buttery ${version}, the version installed here, every page in one file. \`llms.txt\` beside it lists them, and each is a Markdown file under \`docs/\`.`,
      ),
      ".",
      shipped,
    ),
  );
  return files;
}

function exampleFile(component: ComponentEntry, example: ExampleEntry): string {
  return `examples/${component.name}/${example.name}.tsx`;
}

/** Where a component's docs are as Markdown in `@butteryui/core`, from its page on the site. */
function markdownOf(href: string): string {
  const [path = "", anchor] = href.split("#");
  return `@butteryui/core/dist/docs${path}.md${anchor === undefined ? "" : `#${anchor}`}`;
}

/** `knowledge`'s components and the types their props take, as `manifest.json` lists them. */
export function manifestOf(knowledge: Knowledge): Manifest {
  return {
    format: MANIFEST_FORMAT,
    version: knowledge.version,
    site: knowledge.site,
    components: knowledge.components.map((component) => ({
      name: component.name,
      kind: component.kind,
      package: component.packageName,
      import: `import { ${component.name} } from "${component.packageName}";`,
      docs: `${knowledge.site}${component.href}`,
      markdown: markdownOf(component.href),
      purpose: component.purpose,
      useWhen: component.useWhen,
      avoidWhen: component.avoidWhen,
      related: component.related,
      a11y: component.a11y,
      keyboard: component.keyboard,
      motion: component.motion,
      reducedMotion: component.reducedMotion,
      layout: component.layout,
      props: component.props,
      examples: component.examples.map((example) => ({
        name: example.name,
        title: example.title,
        kind: example.kind,
        caption: example.caption,
        file: exampleFile(component, example),
      })),
    })),
    types: knowledge.types,
  };
}

/**
 * What `@butteryui/react` ships for coding agents, by path under its `dist`: `manifest.json`, each
 * component's examples under `examples/<Component>/`, and `knowledge.json`, which the MCP server answers
 * from for the version installed.
 */
export function reactFiles(knowledge: Knowledge): Map<string, string> {
  const files = new Map<string, string>();
  for (const component of knowledge.components) {
    for (const example of component.examples) {
      files.set(exampleFile(component, example), `${example.code.trimEnd()}\n`);
    }
  }
  files.set(
    "manifest.json",
    `${JSON.stringify(manifestOf(knowledge), null, 2)}\n`,
  );
  files.set("knowledge.json", JSON.stringify(knowledge));
  return files;
}

/** Writes `files` into `out` by their paths, after removing `folders`, which only hold files the last build wrote. */
export function writeShipped(
  out: string,
  files: ReadonlyMap<string, string>,
  folders: readonly string[],
): void {
  for (const folder of folders) {
    rmSync(join(out, folder), { recursive: true, force: true });
  }
  for (const [path, contents] of files) {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), contents);
  }
}
