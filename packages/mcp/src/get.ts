import { slugify } from "../../../apps/docs/src/slug.ts";
import type {
  ComponentEntry,
  ExampleEntry,
  Knowledge,
  PageEntry,
  PropsEntry,
  RuleEntry,
  TokenGroup,
} from "./knowledge.ts";

/** How much `buttery_get` says about each entry. */
export type Detail = "summary" | "full";

/** What an id names. */
export type Entry =
  | { readonly type: "component"; readonly component: ComponentEntry }
  | {
      readonly type: "example";
      readonly component: ComponentEntry;
      readonly example: ExampleEntry;
    }
  | {
      readonly type: "page";
      readonly page: PageEntry;
      readonly anchor: string | null;
    }
  | { readonly type: "tokens"; readonly group: TokenGroup }
  | { readonly type: "rule"; readonly rule: RuleEntry };

/** Characters a whole call may return, about 6,000 tokens. */
export const CALL_BUDGET = 24_000;
const PROP_LINE = 110;

function lower(text: string): string {
  return text.toLowerCase().replace(/[-_\s]/g, "");
}

function componentNamed(
  knowledge: Knowledge,
  name: string,
): ComponentEntry | undefined {
  const root = name.split(".")[0] ?? name;
  return (
    knowledge.components.find((component) => component.name === root) ??
    knowledge.components.find(
      (component) => lower(component.name) === lower(root),
    )
  );
}

function pageAt(knowledge: Knowledge, path: string): Entry | null {
  const [route = "", anchor] = path
    .replace(/^https?:\/\/[^/]+\/buttery\//, "")
    .replace(/^\//, "")
    .replace(/\.md(?=#|$)/, "")
    .split("#");
  const page = knowledge.pages.find((candidate) => candidate.route === route);
  if (page) return { type: "page", page, anchor: anchor ?? null };
  const component = knowledge.components.find(
    (candidate) => candidate.href === `/${route}`,
  );
  return component ? { type: "component", component } : null;
}

function tokenGroupFor(
  knowledge: Knowledge,
  name: string,
): TokenGroup | undefined {
  return (
    knowledge.tokens.find((group) => group.name === name) ??
    knowledge.tokens.find((group) =>
      group.tokens.some((token) => token.cssVar === name),
    )
  );
}

/** What `id` names, from the ids `buttery_search` gives and the looser forms people and agents write. */
export function resolve(knowledge: Knowledge, id: string): Entry | null {
  const text = id.trim();
  const slash = text.indexOf("/");
  const prefix = slash === -1 ? "" : text.slice(0, slash).toLowerCase();
  const rest = slash === -1 ? text : text.slice(slash + 1);
  switch (prefix) {
    case "component":
    case "pattern":
    case "primitive":
    case "layer": {
      const component = componentNamed(knowledge, rest);
      return component ? { type: "component", component } : null;
    }
    case "example": {
      const [name = "", file = ""] = rest.split("/");
      const component = componentNamed(knowledge, name);
      const example = component?.examples.find(
        (candidate) => candidate.name === file.replace(/\.tsx$/, ""),
      );
      return component && example
        ? { type: "example", component, example }
        : null;
    }
    case "page":
      return pageAt(knowledge, rest);
    case "tokens":
    case "token": {
      const group = tokenGroupFor(knowledge, rest);
      return group ? { type: "tokens", group } : null;
    }
    case "rule":
    case "check": {
      const rule =
        knowledge.rules.find(
          (candidate) => candidate.id === `${prefix}/${rest}`,
        ) ??
        knowledge.rules.find((candidate) => candidate.id === `check/${rest}`) ??
        knowledge.rules.find((candidate) => candidate.id === `rule/${rest}`);
      return rule ? { type: "rule", rule } : null;
    }
    default: {
      if (text.startsWith("--bt-")) {
        const group = tokenGroupFor(knowledge, text);
        return group ? { type: "tokens", group } : null;
      }
      if (/^https?:\/\//.test(text) || text.startsWith("/")) {
        return pageAt(knowledge, text);
      }
      const component = componentNamed(knowledge, text);
      if (component) return { type: "component", component };
      const group = tokenGroupFor(knowledge, text);
      return group ? { type: "tokens", group } : pageAt(knowledge, text);
    }
  }
}

/** The id `buttery_get` would print for an entry. */
export function idOf(entry: Entry): string {
  switch (entry.type) {
    case "component":
      return `component/${entry.component.name}`;
    case "example":
      return `example/${entry.component.name}/${entry.example.name}`;
    case "page":
      return `page/${entry.page.route}${entry.anchor === null ? "" : `#${entry.anchor}`}`;
    case "tokens":
      return `tokens/${entry.group.name}`;
    case "rule":
      return entry.rule.id;
    default: {
      const unknownEntry: never = entry;
      return unknownEntry;
    }
  }
}

function clip(text: string, length: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= length
    ? flat
    : `${flat.slice(0, length - 1).replace(/[\s.,;:]+$/, "")}…`;
}

function propLines(table: PropsEntry, detail: Detail): string[] {
  return table.props.map((prop) => {
    const signature = `${prop.name}${prop.required ? "" : "?"}: ${prop.type}${prop.defaultValue === null ? "" : ` = ${prop.defaultValue}`}`;
    const description =
      detail === "full" ? prop.description : clip(prop.description, PROP_LINE);
    return description === ""
      ? `- \`${signature}\``
      : `- \`${signature}\`: ${description}`;
  });
}

function ownerOf(component: ComponentEntry, table: PropsEntry): string {
  if (table.component !== null) return table.component;
  return table.part === "" ? component.name : `${component.name}.${table.part}`;
}

function typeNotes(
  knowledge: Knowledge,
  tables: readonly PropsEntry[],
): string[] {
  const used = new Set(
    tables.flatMap((table) =>
      table.props.flatMap(
        (prop) => prop.type.match(/\b[A-Z][A-Za-z]+\b/g) ?? [],
      ),
    ),
  );
  return knowledge.types
    .filter((type) => used.has(type.name))
    .map(
      (type) =>
        `- \`${type.name}\` (${type.note}): ${clip(type.values.join(" | "), 400)}`,
    );
}

/** How long an example a summary shows in full; past it, the shortest of a component's examples. */
const SUMMARY_EXAMPLE = 2_000;

function chosenExample(component: ComponentEntry): ExampleEntry | undefined {
  const basic =
    component.examples.find((example) => example.kind === "basic") ??
    component.examples[0];
  if (basic === undefined || basic.code.length <= SUMMARY_EXAMPLE) return basic;
  return [...component.examples].sort(
    (a, b) => a.code.length - b.code.length,
  )[0];
}

function componentText(
  knowledge: Knowledge,
  component: ComponentEntry,
  detail: Detail,
): string {
  const exportName = component.name;
  const roots = component.props.filter((table) => table.part === "");
  const parts = component.props.filter((table) => table.part !== "");
  const shownTables = detail === "full" ? component.props : roots;
  const lines = [
    `## ${component.name} (${component.kind}, ${component.packageName} ${knowledge.version})`,
    "",
    "```tsx",
    `import { ${exportName} } from "${component.packageName}";`,
    "```",
    "",
    component.purpose,
    "",
    ...(component.useWhen.length === 0
      ? []
      : [`Use for: ${component.useWhen.join("; ")}.`]),
    ...(component.avoidWhen.length === 0
      ? []
      : [`Not for: ${component.avoidWhen.join("; ")}.`]),
    "",
    ...shownTables.flatMap((table) => [
      `Props of \`${ownerOf(component, table)}\`${table.inherits.length === 0 ? "" : `, plus ${table.inherits.map((type) => `\`${type}\``).join(", ")}`}:`,
      ...propLines(table, detail),
      "",
    ]),
    ...(detail === "summary" && parts.length > 0
      ? [
          `Parts: ${parts
            .map(
              (table) =>
                `\`${ownerOf(component, table)}\` (${table.props.map((prop) => prop.name).join(", ") || "no props of its own"})`,
            )
            .join("; ")}.`,
          "",
        ]
      : []),
  ];
  const types = typeNotes(knowledge, shownTables);
  if (types.length > 0) lines.push("Token types:", ...types, "");
  if (detail === "full") {
    lines.push(
      `Accessibility: ${component.a11y}`,
      ...(component.keyboard.length === 0
        ? []
        : [
            "",
            "Keyboard:",
            ...component.keyboard.map((row) => `- ${row.keys}: ${row.does}`),
          ]),
      "",
      `Motion: ${component.motion}${component.reducedMotion === "" ? "" : `. With reduced motion: ${component.reducedMotion}`}`,
      ...(component.layout === "" ? [] : ["", `Layout: ${component.layout}`]),
      ...(component.related.length === 0
        ? []
        : [
            "",
            `Related: ${component.related.map((name) => `component/${name}`).join(", ")}`,
          ]),
      "",
      "Examples (get their code with these ids):",
      ...component.examples.map(
        (example) =>
          `- example/${component.name}/${example.name}: ${clip(example.caption, 140)}`,
      ),
      "",
    );
  }
  const example = chosenExample(component);
  if (example) {
    lines.push(
      `Example, ${example.title.toLowerCase()}:`,
      "```tsx",
      example.code.trimEnd(),
      "```",
      "",
    );
    const others = component.examples.filter((other) => other !== example);
    if (detail === "summary" && others.length > 0) {
      lines.push(
        `More examples: ${others.map((other) => `example/${component.name}/${other.name}`).join(", ")}`,
        "",
      );
    }
  }
  lines.push(
    `Docs: ${knowledge.site}${component.href}${detail === "summary" ? ` · More: buttery_get({"ids":["component/${component.name}"],"detail":"full"})` : ""}`,
  );
  return lines.join("\n");
}

/** The part of `markdown` under the heading whose anchor is `anchor`, down to the next heading as high. */
export function sectionOf(markdown: string, anchor: string): string | null {
  const lines = markdown.split("\n");
  let start = -1;
  let level = 0;
  let fenced = false;
  for (const [index, line] of lines.entries()) {
    if (line.startsWith("```")) fenced = !fenced;
    if (fenced) continue;
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!heading) continue;
    const depth = heading[1]?.length ?? 0;
    if (start === -1) {
      if (slugify(heading[2] ?? "") === anchor) {
        start = index;
        level = depth;
      }
    } else if (depth <= level) {
      return lines.slice(start, index).join("\n").trim();
    }
  }
  return start === -1 ? null : lines.slice(start).join("\n").trim();
}

function headingsOf(markdown: string): string[] {
  let fenced = false;
  return markdown.split("\n").flatMap((line) => {
    if (line.startsWith("```")) fenced = !fenced;
    const heading = fenced ? null : /^##\s+(.+)$/.exec(line);
    return heading?.[1] === undefined ? [] : [heading[1]];
  });
}

function pageText(
  knowledge: Knowledge,
  page: PageEntry,
  anchor: string | null,
): string {
  if (anchor !== null) {
    const section = sectionOf(page.markdown, anchor);
    if (section !== null) {
      return `${section}\n\nFrom ${knowledge.site}/${page.route}#${anchor}`;
    }
  }
  return `${page.markdown.trim()}\n\nFrom ${knowledge.site}/${page.route}`;
}

function tokensText(knowledge: Knowledge, group: TokenGroup): string {
  return [
    `## Tokens: ${group.name} (buttery ${knowledge.version})`,
    "",
    ...group.tokens.map((token) => {
      const values = Object.entries(token.values)
        .map(([field, value]) =>
          field === "value" ? value : `${field} ${value}`,
        )
        .join(", ");
      const name =
        token.cssVar === ""
          ? token.name
          : `${token.name} (\`${token.cssVar}\`)`;
      return `- ${name}: ${values}${token.description === "" ? "" : `. ${token.description}`}`;
    }),
    "",
    `Docs: ${knowledge.site}${group.href}`,
  ].join("\n");
}

function ruleText(knowledge: Knowledge, rule: RuleEntry): string {
  const check = rule.id.startsWith("check/");
  return [
    `## ${check ? "Check" : "Rule"}: ${rule.title}`,
    "",
    rule.text,
    "",
    `Docs: ${knowledge.site}/${check ? "tools/testing#what-it-checks" : "layout/the-layout-contract#the-13-rules"}`,
  ].join("\n");
}

/** An entry as `buttery_get` returns it. */
export function entryText(
  knowledge: Knowledge,
  entry: Entry,
  detail: Detail,
): string {
  switch (entry.type) {
    case "component":
      return componentText(knowledge, entry.component, detail);
    case "example":
      return [
        `## ${entry.component.name}: ${entry.example.title}`,
        "",
        entry.example.caption,
        "",
        "```tsx",
        entry.example.code.trimEnd(),
        "```",
        "",
        `Docs: ${knowledge.site}${entry.component.href}#examples`,
      ].join("\n");
    case "page":
      return pageText(knowledge, entry.page, entry.anchor);
    case "tokens":
      return tokensText(knowledge, entry.group);
    case "rule":
      return ruleText(knowledge, entry.rule);
    default: {
      const unknownEntry: never = entry;
      return unknownEntry;
    }
  }
}

/**
 * `text` cut so that it and a note on what was left out, and how to get it, fit in `room` characters: for a
 * page, its sections by id.
 */
export function fitted(text: string, room: number, entry: Entry): string {
  if (text.length <= room) return text;
  const more =
    entry.type === "page"
      ? `Get one section at a time: ${headingsOf(entry.page.markdown)
          .map((heading) => `page/${entry.page.route}#${slugify(heading)}`)
          .join(", ")}.`
      : entry.type === "component"
        ? `Get its examples one at a time with example/${entry.component.name}/<name>, or its page at ${entry.component.href}.`
        : "Ask for less at once.";
  const note = `\n\n[Cut at ${String(room)} characters. ${more}]`;
  const space = Math.max(0, room - note.length);
  const cut = text.lastIndexOf("\n", space);
  return `${text.slice(0, cut > 0 ? cut : space).trimEnd()}${note}`;
}
