import { globSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { buildSearchIndexes } from "../../../apps/docs/src/search/search.ts";
import {
  colors,
  displayRoles,
  durations,
  easingCurves,
  heights,
  layerBands,
  radii,
  shadows,
  space,
  spring,
  surfaceLevels,
  textRoles,
  tracking,
  zIndex,
} from "../../core/src/tokens/index.ts";
import { captionOf } from "../../../apps/docs/vite/code.ts";
import { shownSource } from "../../../apps/docs/vite/example-source.ts";
import {
  parseFrontmatter,
  splitFrontmatter,
} from "../../../apps/docs/vite/frontmatter.ts";
import {
  componentHref,
  componentMarkdown,
  componentSources,
  contentRoutesIn,
  llmsText,
  pageMarkdown,
} from "../../../apps/docs/vite/markdown.ts";
import type { ComponentSource } from "../../../apps/docs/vite/markdown.ts";
import { propsTablesIn } from "../../../apps/docs/vite/props.ts";
import { searchDocsIn, TOKEN_PAGES } from "../../../apps/docs/vite/search.ts";
import { KNOWLEDGE_FORMAT } from "../src/knowledge.ts";
import type {
  ComponentEntry,
  ExampleEntry,
  Knowledge,
  KeyboardEntry,
  PageEntry,
  RuleEntry,
  TokenGroup,
  TypeEntry,
} from "../src/knowledge.ts";

/** The docs site's address, which every link in the knowledge points at. */
export const SITE = "https://aliboily.github.io/buttery";

const KINDS = ["primitive", "layer", "component", "pattern"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `markdown` with its site-relative links, such as `](/components/dialog)`, pointing at the site. */
export function absoluteLinks(markdown: string): string {
  return markdown.replace(/\]\(\/(?!\/)/g, `](${SITE}/`);
}

function textOf(value: ComponentSource["meta"][string] | undefined): string {
  return typeof value === "string" ? value : "";
}

function listOf(value: ComponentSource["meta"][string] | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function keyboardOf(
  value: ComponentSource["meta"][string] | undefined,
): KeyboardEntry[] {
  return Array.isArray(value)
    ? value.flatMap((row) =>
        isRecord(row) &&
        typeof row["keys"] === "string" &&
        typeof row["does"] === "string"
          ? [{ keys: row["keys"], does: row["does"] }]
          : [],
      )
    : [];
}

function kindOf(component: ComponentSource): ComponentEntry["kind"] {
  const kind = textOf(component.meta["kind"]);
  const known = KINDS.find((candidate) => candidate === kind);
  if (known === undefined) {
    throw new Error(
      `${component.name}'s meta has kind "${kind}". Fix: set it to one of ${KINDS.join(", ")}.`,
    );
  }
  return known;
}

function examplesOf(folder: string): ExampleEntry[] {
  return globSync("*.tsx", { cwd: join(folder, "examples") })
    .sort()
    .map((file) => {
      const source = readFileSync(join(folder, "examples", file), "utf8");
      const name = basename(file, ".tsx");
      const words = name.replaceAll("-", " ");
      return {
        name,
        title: words.charAt(0).toUpperCase() + words.slice(1),
        kind:
          /^export const kind: ExampleKind = "([a-z]+)";$/m.exec(source)?.[1] ??
          "basic",
        caption: captionOf(source),
        code: shownSource(source),
      };
    });
}

function componentEntry(
  root: string,
  component: ComponentSource,
  components: readonly ComponentSource[],
): ComponentEntry {
  const { name, meta, folder } = component;
  return {
    name,
    kind: kindOf(component),
    packageName: component.packageName,
    href: componentHref(component),
    purpose: textOf(meta["purpose"]),
    useWhen: listOf(meta["useWhen"]),
    avoidWhen: listOf(meta["avoidWhen"]),
    related: listOf(meta["related"]),
    a11y: textOf(meta["a11y"]),
    keyboard: keyboardOf(meta["keyboard"]),
    motion: textOf(meta["motion"]),
    reducedMotion: textOf(meta["reducedMotion"]),
    layout: textOf(meta["layout"]),
    props: propsTablesIn(name, join(folder, `${name}.tsx`)).map((table) => ({
      part: table.part,
      component: table.component ?? null,
      props: table.props,
      inherits: table.inherits,
    })),
    examples: examplesOf(folder),
    markdown: absoluteLinks(
      componentMarkdown(root, component, components, 1, "/"),
    ),
  };
}

function pageEntry(
  root: string,
  route: string,
  components: readonly ComponentSource[],
): PageEntry {
  const { block } = splitFrontmatter(
    readFileSync(join(root, "apps/docs/content", `${route}.mdx`), "utf8"),
  );
  const data = block === null ? {} : parseFrontmatter(block, route);
  const markdown = pageMarkdown(root, route, components, "/");
  if (markdown === null) {
    throw new Error(`The page at /${route} has no Markdown.`);
  }
  return {
    route,
    title: typeof data["title"] === "string" ? data["title"] : route,
    description:
      typeof data["description"] === "string" ? data["description"] : "",
    markdown: absoluteLinks(markdown),
  };
}

function valueText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : JSON.stringify(value);
}

/** Every group of `tokens.json` but the contrast pairs, which are the contrast test's, not tokens. */
function tokenGroups(root: string): TokenGroup[] {
  const source: unknown = JSON.parse(
    readFileSync(join(root, "packages/core/src/tokens/tokens.json"), "utf8"),
  );
  if (!isRecord(source)) throw new Error("tokens.json isn't an object.");
  return Object.entries(source).flatMap(([group, entries]) => {
    if (!isRecord(entries)) return [];
    return [
      {
        name: group,
        href: `/${TOKEN_PAGES[group] ?? "foundations/tokens"}`,
        tokens: Object.entries(entries).flatMap(([name, token]) => {
          if (!isRecord(token)) return [];
          const values = Object.fromEntries(
            Object.entries(token)
              .filter(
                ([field]) => field !== "cssVar" && field !== "description",
              )
              .map(([field, value]) => [field, valueText(value)]),
          );
          return [
            {
              name,
              cssVar:
                typeof token["cssVar"] === "string" ? token["cssVar"] : "",
              values,
              description:
                typeof token["description"] === "string"
                  ? token["description"]
                  : "",
            },
          ];
        }),
      },
    ];
  });
}

function literalsOf(keys: readonly string[]): string[] {
  const numeric = keys.every((key) => /^\d+(?:\.\d+)?$/.test(key));
  return numeric
    ? [...keys].sort((a, b) => Number(a) - Number(b))
    : keys.map((key) => JSON.stringify(key));
}

/** The token types props are typed with, each with the values it allows, read from the token sources. */
export function tokenTypes(): TypeEntry[] {
  const types: readonly (readonly [string, readonly string[], string])[] = [
    ["SpaceValue", Object.keys(space), "a spacing step: 1 is 4px, 4 is 16px"],
    ["SpaceStep", Object.keys(space), "a spacing step: 1 is 4px, 4 is 16px"],
    ["HeightToken", Object.keys(heights), "a control height"],
    ["RadiusToken", Object.keys(radii), "a corner radius"],
    ["ColorToken", Object.keys(colors), "a color role"],
    ["ShadowToken", Object.keys(shadows), "a shadow"],
    ["ZToken", Object.keys(zIndex), "a layer"],
    ["LayerBand", layerBands, "a layer things float in"],
    ["DurationToken", Object.keys(durations), "a duration"],
    ["EasingToken", Object.keys(easingCurves), "an easing curve"],
    ["SpringToken", Object.keys(spring), "a spring"],
    ["TextRole", Object.keys(textRoles), "a text role, for Text's variant"],
    ["DisplayRole", Object.keys(displayRoles), "a display size, for headlines"],
    ["TrackingToken", Object.keys(tracking), "letter-spacing"],
    ["SurfaceLevel", surfaceLevels, "a surface level"],
  ];
  return types.map(([name, keys, note]) => ({
    name,
    values: literalsOf(keys),
    note,
  }));
}

/**
 * Every exported type in the packages that is a union of literals or of such types, such as `FlowAlign` or
 * `TextVariant` (`TextRole | DisplayRole`), with its values, after the token types it may name.
 */
export function literalTypes(
  root: string,
  known: readonly TypeEntry[],
): TypeEntry[] {
  const written = new Map<string, readonly string[]>();
  for (const file of globSync("packages/{core,react}/src/**/*.{ts,tsx}", {
    cwd: root,
  })) {
    if (/\.test\.tsx?$/.test(file)) continue;
    const source = readFileSync(join(root, file), "utf8");
    for (const match of source.matchAll(
      /^export type (\w+)\s*=\s*([^;]+);/gm,
    )) {
      const parts = (match[2] ?? "")
        .replace(/\s+/g, " ")
        .split("|")
        .map((part) => part.trim())
        .filter((part) => part !== "");
      if (
        parts.length > 0 &&
        parts.every((part) =>
          /^(?:"[^"]*"|-?\d+(?:\.\d+)?|[A-Z]\w*)$/.test(part),
        )
      ) {
        written.set(match[1] ?? "", parts);
      }
    }
  }
  const types = new Map(known.map((type) => [type.name, type]));
  const resolve = (
    name: string,
    seen: ReadonlySet<string>,
  ): readonly string[] | null => {
    const token = types.get(name);
    if (token) return token.values;
    const parts = written.get(name);
    if (parts === undefined || seen.has(name)) return null;
    const values: string[] = [];
    for (const part of parts) {
      if (/^[A-Z]/.test(part)) {
        const inner = resolve(part, new Set([...seen, name]));
        if (inner === null) return null;
        values.push(...inner);
      } else {
        values.push(part);
      }
    }
    return values;
  };
  return [...written.keys()]
    .filter((name) => !types.has(name))
    .sort()
    .flatMap((name) => {
      const values = resolve(name, new Set());
      return values === null
        ? []
        : [{ name, values: [...new Set(values)], note: "" }];
    });
}

function slugOf(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * The 13 rules from `docs/LAYOUT_RULES.md` §1, each named by its first sentence, and the checks from its §5
 * table, each named as a violation's `rule` names it.
 */
export function rulesIn(markdown: string): RuleEntry[] {
  const rules = (
    /^## 1\.[^\n]*\n([\s\S]*?)^(?:---|## 2\.)/m.exec(markdown)?.[1] ?? ""
  )
    .split("\n")
    .flatMap((line) => {
      const item = /^\d+\.\s+(.+)$/.exec(line)?.[1];
      if (item === undefined) return [];
      const title = (/^(.+?\.)(?:\s|$)/.exec(item)?.[1] ?? item).replace(
        /\.$/,
        "",
      );
      return [{ id: `rule/${slugOf(title)}`, title, text: item }];
    });
  const checks = (
    /^## 5\.[^\n]*\n([\s\S]*?)^### `LayoutGuard`/m.exec(markdown)?.[1] ?? ""
  )
    .split("\n")
    .flatMap((line) => {
      const cells = /^\| \*\*(.+?)\*\* \| (.+) \|$/.exec(line);
      const title = cells?.[1];
      const text = cells?.[2];
      return title === undefined || text === undefined
        ? []
        : [{ id: `check/${slugOf(title)}`, title, text }];
    });
  return [...rules, ...checks];
}

function withoutFrontmatter(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n+/, "");
}

/** Everything the server answers from, read from the repository at `root` the way the docs site reads it. */
export function buildKnowledge(root: string): Knowledge {
  const components = componentSources(root);
  const tokens = tokenTypes();
  const { titles, text } = buildSearchIndexes(searchDocsIn(root));
  const version: unknown = JSON.parse(
    readFileSync(join(root, "packages/react/package.json"), "utf8"),
  );
  return {
    format: KNOWLEDGE_FORMAT,
    version:
      isRecord(version) && typeof version["version"] === "string"
        ? version["version"]
        : "0.0.0",
    site: SITE,
    components: components
      .map((component) => componentEntry(root, component, components))
      .sort((a, b) => a.name.localeCompare(b.name)),
    pages: contentRoutesIn(root).map((route) =>
      pageEntry(root, route, components),
    ),
    tokens: tokenGroups(root),
    types: [...tokens, ...literalTypes(root, tokens)],
    rules: rulesIn(readFileSync(join(root, "docs/LAYOUT_RULES.md"), "utf8")),
    search: { titles: JSON.stringify(titles), text: JSON.stringify(text) },
    llms: absoluteLinks(llmsText(root, components, "/")),
    skill: withoutFrontmatter(
      readFileSync(
        join(root, ".claude/skills/make-it-buttery/SKILL.md"),
        "utf8",
      ),
    ),
  };
}
