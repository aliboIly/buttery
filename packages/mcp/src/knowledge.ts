import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The shape of `knowledge.json`; it changes when a field is renamed or removed. */
export const KNOWLEDGE_FORMAT = 1;

/** One prop as the docs' props tables show it. */
export interface PropEntry {
  readonly name: string;
  /** Its type as written, without the `| undefined` an optional prop carries. */
  readonly type: string;
  readonly required: boolean;
  /** The value it takes when left out, or `null` when its docs don't say. */
  readonly defaultValue: string | null;
  readonly description: string;
}

/** The props of a component or one of its parts, such as `Menu.Item`. */
export interface PropsEntry {
  /** `""` for the component itself, else the part's name, such as `"Item"`. */
  readonly part: string;
  /** Another component its file exports beside it, such as `FilterPill`, when the table is that one's. */
  readonly component: string | null;
  readonly props: readonly PropEntry[];
  /** The DOM or library props it builds on, such as `ComponentPropsWithRef<"button">`. */
  readonly inherits: readonly string[];
}

/** A canonical example, as its page shows it and an app copies it. */
export interface ExampleEntry {
  /** Its file name without `.tsx`, such as `"text-toolbar"`. */
  readonly name: string;
  readonly title: string;
  /** What it shows: `basic` use, `controlled` state, `variants`, `states` or a `composition` with others. */
  readonly kind: string;
  readonly caption: string;
  readonly code: string;
}

/** One row of a component's keyboard table. */
export interface KeyboardEntry {
  readonly keys: string;
  readonly does: string;
}

/** Everything the docs say about one component, primitive, layer or pattern. */
export interface ComponentEntry {
  readonly name: string;
  readonly kind: "primitive" | "layer" | "component" | "pattern";
  readonly packageName: string;
  /** Its page on the docs site, such as `/components/dialog`. */
  readonly href: string;
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
  readonly examples: readonly ExampleEntry[];
  /** Its whole page as Markdown. */
  readonly markdown: string;
}

/** A written page of the docs site. */
export interface PageEntry {
  /** Its path on the site without the leading slash, such as `"layout/the-layout-contract"`. */
  readonly route: string;
  readonly title: string;
  readonly description: string;
  readonly markdown: string;
}

/** One design token. */
export interface TokenEntry {
  /** Its key in its group, such as `"4"` in `space` or `"bg-app"` in `color`. */
  readonly name: string;
  readonly cssVar: string;
  /** Its values by theme or density where they differ, else under `value`. */
  readonly values: Readonly<Record<string, string>>;
  readonly description: string;
}

/** A group of tokens, such as `space` or `color`. */
export interface TokenGroup {
  readonly name: string;
  /** The page that explains the group, such as `/foundations/spacing-and-sizing`. */
  readonly href: string;
  readonly tokens: readonly TokenEntry[];
}

/** A layout rule, or one of the checks `expectButtery` and `LayoutGuard` run. */
export interface RuleEntry {
  /** `rule/<slug>` for the 13 rules, `check/<name>` for a check, matching a violation's `rule`. */
  readonly id: string;
  readonly title: string;
  readonly text: string;
}

/** A token type props take, such as `SpaceValue`, and the values it allows. */
export interface TypeEntry {
  readonly name: string;
  /** Each value as it's written in a prop, such as `4` or `"md"`. */
  readonly values: readonly string[];
  readonly note: string;
}

/** What the server knows: the docs of one buttery version, written from the docs site's own sources. */
export interface Knowledge {
  readonly format: number;
  /** The buttery version the docs describe, such as `"0.9.0"`. */
  readonly version: string;
  /** The docs site's address, which links point at. */
  readonly site: string;
  readonly components: readonly ComponentEntry[];
  readonly pages: readonly PageEntry[];
  readonly tokens: readonly TokenGroup[];
  readonly types: readonly TypeEntry[];
  readonly rules: readonly RuleEntry[];
  /** The docs search's titles and full-text indexes, as MiniSearch JSON built with the site's options. */
  readonly search: { readonly titles: string; readonly text: string };
  /** `llms.txt`: every page of the site with a link to its Markdown. */
  readonly llms: string;
  /** The make-it-buttery skill: the steps for building or converting UI with buttery. */
  readonly skill: string;
}

/** The knowledge the server answers from, where it came from, and the buttery version the project has. */
export interface LoadedKnowledge {
  readonly knowledge: Knowledge;
  /** `"project"` when read from the project's `@butteryui/react`, `"bundled"` for the server's own copy. */
  readonly source: "project" | "bundled";
  /** The `@butteryui/react` version installed in the project, or `null` when it has none. */
  readonly installed: string | null;
}

function isKnowledge(value: unknown): value is Knowledge {
  return (
    typeof value === "object" &&
    value !== null &&
    "format" in value &&
    value.format === KNOWLEDGE_FORMAT &&
    "version" in value &&
    typeof value.version === "string"
  );
}

function readJson(file: string): unknown {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

function installedVersion(projectRoot: string | null): string | null {
  if (projectRoot === null) return null;
  const manifest = readJson(
    join(projectRoot, "node_modules/@butteryui/react/package.json"),
  );
  return typeof manifest === "object" &&
    manifest !== null &&
    "version" in manifest &&
    typeof manifest.version === "string"
    ? manifest.version
    : null;
}

/**
 * The knowledge for the project at `projectRoot`: the copy its installed `@butteryui/react` ships, so answers
 * match the version it imports, or else the copy bundled at `bundledFile`.
 */
export function loadKnowledge(
  projectRoot: string | null,
  bundledFile: string,
): LoadedKnowledge {
  const installed = installedVersion(projectRoot);
  if (projectRoot !== null) {
    const shipped = readJson(
      join(projectRoot, "node_modules/@butteryui/react/knowledge.json"),
    );
    if (isKnowledge(shipped)) {
      return { knowledge: shipped, source: "project", installed };
    }
  }
  const bundled = readJson(bundledFile);
  if (!isKnowledge(bundled)) {
    throw new Error(
      `No buttery knowledge at ${bundledFile}. Fix: build the server with \`pnpm --filter @butteryui/mcp build\`.`,
    );
  }
  return { knowledge: bundled, source: "bundled", installed };
}
