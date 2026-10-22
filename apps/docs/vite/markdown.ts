import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";
import { pathUnderBase, sitePath } from "../src/base.ts";
import { COLOR_GROUPS, isColorGroup } from "../src/foundations/color-groups.ts";
import { MOTION_TEXT, REDUCED_TEXT } from "../src/motion-text.ts";
import { TIMING_TEXT } from "../src/foundations/timing-text.ts";
import { slugify } from "../src/slug.ts";
import { captionOf } from "./code.ts";
import { shownSource } from "./example-source.ts";
import {
  parseFrontmatter,
  splitFrontmatter,
  withoutModuleBlocks,
} from "./frontmatter.ts";
import { listed, screensByDemo } from "../src/demo-sentence.ts";
import { SECTIONS } from "../src/nav.ts";
import { demoPages, templates } from "../src/routes.ts";
import { demoUsesIn } from "./demo-uses.ts";
import { exportDocsFor, propsTablesIn, typeTablesIn } from "./props.ts";
import type { PropDoc } from "./props.ts";
import { roadmapIn, roadmapMarkdown } from "./roadmap.ts";
import {
  latestReleaseMarkdown,
  releasesIn,
  releasesMarkdown,
} from "./whats-new.ts";

/** A value a meta file's object literal holds: a string, a list of strings, or a list of string records. */
type MetaValue =
  string | readonly string[] | readonly Readonly<Record<string, string>>[];

/** Everything the Markdown of a component's page is written from. */
export interface ComponentSource {
  readonly name: string;
  readonly folder: string;
  /** `@buttery/core` or `@buttery/react`. */
  readonly packageName: string;
  readonly section: string;
  /** Its place in its section, lowest first, and its title there, which the nav orders it by. */
  readonly order: number;
  readonly title: string;
  /** The line its page starts with. */
  readonly description: string;
  readonly home: string | undefined;
  readonly meta: Readonly<Record<string, MetaValue>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function isMotionClass(value: string): value is keyof typeof MOTION_TEXT {
  return value in MOTION_TEXT;
}

function stringsOf(value: MetaValue | undefined): readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function textOf(value: MetaValue | undefined): string {
  return typeof value === "string" ? value : "";
}

/**
 * The string, number, string-list and record-list fields of the object literal a meta or playground file
 * exports, a number as its digits.
 */
function literalFields(
  file: string,
  variable: string,
): Record<string, MetaValue> {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const fields: Record<string, MetaValue> = {};
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== variable
      )
        continue;
      const value = declaration.initializer;
      if (!value || !ts.isObjectLiteralExpression(value)) continue;
      for (const property of value.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const key = property.name.getText(source);
        const init = property.initializer;
        if (ts.isStringLiteralLike(init) || ts.isNumericLiteral(init))
          fields[key] = init.text;
        else if (ts.isArrayLiteralExpression(init)) {
          const records = init.elements.flatMap((element) => {
            if (!ts.isObjectLiteralExpression(element)) return [];
            const record: Record<string, string> = {};
            for (const entry of element.properties) {
              if (
                ts.isPropertyAssignment(entry) &&
                ts.isStringLiteralLike(entry.initializer)
              )
                record[entry.name.getText(source)] = entry.initializer.text;
            }
            return [record];
          });
          fields[key] =
            records.length > 0
              ? records
              : init.elements.flatMap((element) =>
                  ts.isStringLiteralLike(element) ? [element.text] : [],
                );
        }
      }
    }
  }
  return fields;
}

/** Every component with a page, read from the packages' meta and playground files. */
export function componentSources(root: string): ComponentSource[] {
  return globSync("packages/*/src/**/*.meta.ts", { cwd: root })
    .sort()
    .flatMap((meta) => {
      const name = basename(meta, ".meta.ts");
      const folder = join(root, dirname(meta));
      const playground = join(folder, `${name}.playground.tsx`);
      if (!existsSync(playground)) return [];
      const page = literalFields(playground, "page");
      const section = textOf(page["section"]);
      if (section === "") return [];
      const home = textOf(page["home"]);
      return [
        {
          name,
          folder,
          packageName: meta.startsWith("packages/core/")
            ? "@buttery/core"
            : "@buttery/react",
          section,
          order: Number(textOf(page["order"])),
          title: textOf(page["title"]) || name,
          description: textOf(page["description"]),
          home: home === "" ? undefined : home,
          meta: literalFields(join(root, meta), "meta"),
        },
      ];
    });
}

/** Where a component is documented on the site: its own page, or its section of a written page. */
export function componentHref(component: ComponentSource): string {
  return component.home === undefined
    ? `/${component.section.split("/")[0] ?? ""}/${kebab(component.name)}`
    : `/${component.home}#${slugify(component.name)}`;
}

function markdownHref(href: string): string {
  const [path = "", anchor] = href.split("#");
  return `${path}.md${anchor === undefined ? "" : `#${anchor}`}`;
}

/** Each Markdown link in `line` to a path written from the site's root, such as `](/foundations/colors)`, under `base`. */
function linksUnder(line: string, base: string): string {
  return line.replace(
    /\]\((\/(?!\/)[^)\s]*)\)/g,
    (_, href: string) => `](${sitePath(href, base)})`,
  );
}

function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();
}

function table(
  columns: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  return [
    `| ${columns.map(cell).join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

/** A props table, or a type's fields, as Markdown, then what else it takes. */
function propsBlock(
  column: "Prop" | "Field",
  {
    props,
    inherits,
  }: {
    readonly props: readonly PropDoc[];
    readonly inherits: readonly string[];
  },
): string[] {
  return [
    ...(props.length === 0
      ? []
      : [
          table(
            [column, "Type", "Default", "Description"],
            props.map((prop) => [
              `\`${prop.name}\`${prop.required ? " (required)" : ""}`,
              `\`${prop.type}\``,
              prop.defaultValue === null ? "" : `\`${prop.defaultValue}\``,
              prop.description,
            ]),
          ),
          "",
        ]),
    ...(inherits.length === 0
      ? []
      : [
          `It also takes ${inherits.map((type) => `\`${type}\``).join(", ")}.`,
          "",
        ]),
  ];
}

function heading(depth: number, text: string): string {
  return `${"#".repeat(Math.min(depth, 6))} ${text}`;
}

/** The sections a playground file's `demos` draw under "Variants and states": each one's title and description. */
function galleryOf(
  file: string,
): { readonly title: string; readonly description: string }[] {
  if (!existsSync(file)) return [];
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const value = declaration.initializer;
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== "demos" ||
        !value ||
        !ts.isArrayLiteralExpression(value)
      )
        continue;
      return value.elements.flatMap((element) => {
        if (!ts.isObjectLiteralExpression(element)) return [];
        const text = (key: string): string => {
          for (const property of element.properties) {
            if (
              ts.isPropertyAssignment(property) &&
              property.name.getText(source) === key &&
              ts.isStringLiteralLike(property.initializer)
            )
              return property.initializer.text;
          }
          return "";
        };
        const title = text("title");
        return title === ""
          ? []
          : [{ title, description: text("description") }];
      });
    }
  }
  return [];
}

/**
 * A component's documentation as Markdown, its parts in the order its page shows them: what it is and its
 * import, where its live demo is, when to use it, its examples as code, what its variants and states show,
 * its props, accessibility, motion, layout and related pages. `depth` is its title's heading level: 1 on a
 * page of its own, 3 inside a written page. Its links are under `base`, the path the site is served under.
 */
export function componentMarkdown(
  root: string,
  component: ComponentSource,
  components: readonly ComponentSource[],
  depth = 1,
  base = "/",
): string {
  const { name, meta, folder } = component;
  const part = depth + 1;
  const lines: string[] = [];
  if (depth === 1) lines.push(heading(1, name), "");
  lines.push(textOf(meta["purpose"]), "");
  lines.push(
    "```tsx",
    `import { ${name} } from "${component.packageName}";`,
    "```",
    "",
  );
  const live = (title: string): string =>
    `[${name} › ${title}](${sitePath(`${component.home === undefined ? componentHref(component) : `/${component.home}`}#${slugify(depth === 1 ? title : `${name} ${title}`)}`, base)})`;
  if (depth === 1)
    lines.push(
      heading(part, "Demo"),
      "",
      `The page has a live demo of ${name}, with controls for its props and the code for what it shows: ${live("Demo")}.`,
      "",
    );

  const useWhen = stringsOf(meta["useWhen"]);
  const avoidWhen = stringsOf(meta["avoidWhen"]);
  if (useWhen.length > 0 || avoidWhen.length > 0) {
    lines.push(heading(part, "When to use it"), "");
    for (const item of useWhen) lines.push(`- ${item}`);
    if (avoidWhen.length > 0) {
      lines.push("", "Not for:", "");
      for (const item of avoidWhen) lines.push(`- ${item}`);
    }
    lines.push("");
  }

  const examples = existsSync(join(folder, "examples"))
    ? globSync("*.tsx", { cwd: join(folder, "examples") }).sort()
    : [];
  if (examples.length > 0) {
    lines.push(heading(part, "Examples"), "");
    for (const file of examples) {
      const source = readFileSync(join(folder, "examples", file), "utf8");
      const words = file.replace(/\.tsx$/, "").replaceAll("-", " ");
      lines.push(
        heading(part + 1, words.charAt(0).toUpperCase() + words.slice(1)),
        "",
        captionOf(source),
        "",
        "```tsx",
        shownSource(source).trimEnd(),
        "```",
        "",
      );
    }
  }

  const gallery = galleryOf(join(folder, `${name}.playground.tsx`));
  if (gallery.length > 0)
    lines.push(
      heading(part, "Variants and states"),
      "",
      `The page draws each of these live: ${live("Variants and states")}.`,
      "",
      ...gallery.map(({ title, description }) =>
        description === "" ? `- ${title}` : `- ${title}: ${description}`,
      ),
      "",
    );

  const sourceFile = join(folder, `${name}.tsx`);
  const tables = existsSync(sourceFile) ? propsTablesIn(name, sourceFile) : [];
  const types = existsSync(sourceFile) ? typeTablesIn(name, sourceFile) : [];
  const exported = exportDocsFor(root, name, folder, tables);
  if (tables.length > 0 || types.length > 0 || exported.length > 0) {
    lines.push(heading(part, "Props"), "");
    for (const props of tables) {
      lines.push(
        heading(
          part + 1,
          props.component ??
            (props.part === "" ? name : `${name}.${props.part}`),
        ),
        "",
        ...propsBlock("Prop", props),
      );
    }
    for (const type of types) {
      lines.push(
        heading(part + 1, type.name),
        "",
        ...(type.description === "" ? [] : [type.description, ""]),
        ...propsBlock("Field", type),
      );
    }
    if (exported.length > 0)
      lines.push(
        heading(part + 1, "Also exported"),
        "",
        table(
          ["Export", "Description"],
          exported.map((doc) => [`\`${doc.signature}\``, doc.description]),
        ),
        "",
      );
  }

  lines.push(heading(part, "Accessibility"), "", textOf(meta["a11y"]), "");
  const keyboard = meta["keyboard"];
  if (Array.isArray(keyboard) && keyboard.length > 0) {
    lines.push(
      table(
        ["Keys", "What they do"],
        keyboard.flatMap((row) => {
          if (!isRecord(row)) return [];
          const { keys, does } = row;
          return typeof keys === "string" && typeof does === "string"
            ? [[keys, does]]
            : [];
        }),
      ),
      "",
    );
  } else if (Array.isArray(keyboard)) {
    lines.push("It takes no keyboard input of its own.", "");
  }

  const motion = textOf(meta["motion"]);
  const motionClass = isMotionClass(motion) ? motion : "none";
  lines.push(heading(part, "Motion"), "", MOTION_TEXT[motionClass], "");
  const reduced = textOf(meta["reducedMotion"]) || REDUCED_TEXT[motionClass];
  if (reduced !== "") lines.push(`With reduced motion: ${reduced}`, "");

  const layout = textOf(meta["layout"]);
  if (layout !== "") lines.push(heading(part, "Layout"), "", layout, "");

  const related = stringsOf(meta["related"]).flatMap((other) => {
    const found = components.find((candidate) => candidate.name === other);
    return found
      ? [`- [${other}](${sitePath(markdownHref(componentHref(found)), base)})`]
      : [];
  });
  const seen = folder.includes("/primitives/")
    ? []
    : (demoUsesIn(root)[name] ?? []);
  const seenLine =
    seen.length === 0
      ? []
      : [
          screensByDemo(seen)
            .map(
              (group) =>
                `See it in ${group.screens
                  .map((screen, index) =>
                    screen.page === undefined
                      ? `[${screen.demo}](${sitePath(screen.href, base)})`
                      : `${index === 0 ? `${group.demo}'s ` : listed(group.screens, index)}[${screen.page}](${sitePath(screen.href, base)})`,
                  )
                  .join("")}.`,
            )
            .join(" "),
          "",
        ];
  if (related.length > 0 || seenLine.length > 0)
    lines.push(heading(part, "Related"), "", ...related, "", ...seenLine);
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The components with a page in `section`, in the nav's order: by their `order`, then their titles. */
export function componentsIn(
  section: string,
  components: readonly ComponentSource[],
): ComponentSource[] {
  return components
    .filter((component) => component.section === section)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/** A `<ComponentList group="…" />`: the group's components, each linking to its Markdown, with its page's line. */
function componentListOf(
  jsx: string,
  components: readonly ComponentSource[],
  base: string,
): string {
  const group = /group="([^"]+)"/.exec(jsx)?.[1] ?? "";
  return table(
    ["Component", "What it's for"],
    componentsIn(`components/${group}`, components).map((component) => [
      `[${component.name}](${sitePath(markdownHref(componentHref(component)), base)})`,
      component.description || textOf(component.meta["purpose"]),
    ]),
  );
}

/** The `columns` and `rows` a `<DocsTable … />` was written with, read from its JSX. */
function docsTableOf(jsx: string): string {
  const source = ts.createSourceFile(
    "table.tsx",
    `const table = (${jsx});`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let columns: string[] = [];
  let rows: string[][] = [];
  const strings = (node: ts.Node): string[] =>
    ts.isArrayLiteralExpression(node)
      ? node.elements.flatMap((element) =>
          ts.isStringLiteralLike(element) ? [element.text] : [],
        )
      : [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isJsxAttribute(node) &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression
    ) {
      const expression = node.initializer.expression;
      const attribute = node.name.getText(source);
      if (attribute === "columns") columns = strings(expression);
      if (attribute === "rows" && ts.isArrayLiteralExpression(expression))
        rows = expression.elements.map(strings);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return table(columns, rows);
}

/** Token tables for the blocks the Foundations, Layout and Motion pages draw from the tokens. */
function tokenBlock(
  root: string,
  block: string,
  attributes: string,
): string | null {
  const tokens: unknown = JSON.parse(
    readFileSync(join(root, "packages/core/src/tokens/tokens.json"), "utf8"),
  );
  if (!isRecord(tokens)) return null;
  const group = (name: string): [string, Record<string, unknown>][] => {
    const entries = tokens[name];
    return isRecord(entries)
      ? Object.entries(entries).flatMap(([key, value]) =>
          isRecord(value) ? [[key, value]] : [],
        )
      : [];
  };
  const value = (token: Record<string, unknown>, key: string): string => {
    const found = token[key];
    return typeof found === "string" || typeof found === "number"
      ? String(found)
      : "";
  };
  switch (block) {
    case "ColorTable": {
      const name = /group="([a-z]+)"/.exec(attributes)?.[1] ?? "";
      const starts: readonly string[] = isColorGroup(name)
        ? COLOR_GROUPS[name]
        : [];
      return table(
        ["Token", "Light", "Dark", "Use"],
        group("color")
          .filter(([key]) => starts.some((start) => key.startsWith(start)))
          .map(([, token]) => [
            `\`${value(token, "cssVar")}\``,
            value(token, "light"),
            value(token, "dark"),
            value(token, "description"),
          ]),
      );
    }
    case "TextRoles":
      return table(
        ["Role", "Size", "Line height", "Weight", "Use"],
        group("text").map(([key, token]) => [
          `\`${key}\``,
          value(token, "size"),
          value(token, "lineHeight"),
          value(token, "weight"),
          value(token, "description"),
        ]),
      );
    case "DisplayRoles":
      return table(
        ["Role", "Steps"],
        group("display").map(([key, token]) => [
          `\`${key}\``,
          isRecord(token["steps"])
            ? Object.entries(token["steps"])
                .map(
                  ([step, size]) =>
                    `${step} ${isRecord(size) ? `${String(size["size"])}/${String(size["lineHeight"])}` : ""}`,
                )
                .join(", ")
            : "",
        ]),
      );
    case "SpacingScale":
      return table(
        ["Token", "Value"],
        group("space").map(([, token]) => [
          `\`${value(token, "cssVar")}\``,
          value(token, "value"),
        ]),
      );
    case "RadiusScale":
      return table(
        ["Token", "Value"],
        group("radius").map(([, token]) => [
          `\`${value(token, "cssVar")}\``,
          value(token, "value"),
        ]),
      );
    case "Shadows":
      return table(
        ["Token", "Light", "Dark"],
        group("shadow").map(([, token]) => [
          `\`${value(token, "cssVar")}\``,
          value(token, "light"),
          value(token, "dark"),
        ]),
      );
    case "HeightScale":
      return table(
        ["Token", "Comfortable", "Compact", "Use"],
        group("height").map(([, token]) => [
          `\`${value(token, "cssVar")}\``,
          value(token, "comfortable"),
          value(token, "compact"),
          value(token, "description"),
        ]),
      );
    case "WidthTokens":
      return table(
        ["Token", "Value", "Use"],
        group("width").map(([, token]) => [
          `\`${value(token, "cssVar")}\``,
          value(token, "value"),
          value(token, "description"),
        ]),
      );
    case "LayerTokens":
      return table(
        ["Token", "Value"],
        group("z").map(([, token]) => [
          `\`${value(token, "cssVar")}\``,
          value(token, "value"),
        ]),
      );
    case "MotionTokens":
      return table(
        ["Token", "Value"],
        [...group("duration"), ...group("easing")].map(([, token]) => [
          `\`${value(token, "cssVar")}\``,
          value(token, "value"),
        ]),
      );
    case "TimingTokens":
      return table(
        ["Token", "Value", "What it times"],
        group("timing").map(([name, token]) => [
          `\`${value(token, "cssVar")}\``,
          value(token, "value"),
          name in TIMING_TEXT
            ? TIMING_TEXT[name as keyof typeof TIMING_TEXT]
            : "",
        ]),
      );
    default:
      return null;
  }
}

/**
 * A written page's body as Markdown: its components written out as text, tables and code, and a block that
 * only draws, such as a gallery of surfaces, as a line pointing to it on the live page. Its links are under
 * `base`.
 */
function bodyMarkdown(
  root: string,
  page: { readonly route: string; readonly title: string },
  body: string,
  components: readonly ComponentSource[],
  base: string,
): string {
  const out: string[] = [];
  const lines = withoutModuleBlocks(body).split("\n");
  let fenced = false;
  let rule = 0;
  let place = { title: page.title, href: sitePath(`/${page.route}`, base) };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (line.startsWith("```")) fenced = !fenced;
    const titled = fenced ? null : /^#{2,3}\s+(.+)$/.exec(line)?.[1];
    if (titled !== undefined && titled !== null)
      place = {
        title: `${page.title} › ${titled.replace(/[`*_]/g, "")}`,
        href: sitePath(`/${page.route}#${slugify(titled)}`, base),
      };
    if (fenced || line.startsWith("```")) {
      out.push(line);
      continue;
    }
    if (/^<\/[A-Z][A-Za-z]*>\s*$/.test(line)) continue;
    if (!/^<[A-Z]/.test(line)) {
      out.push(linksUnder(line, base));
      continue;
    }
    let jsx = line;
    while (!/>\s*$/.test(jsx) && index + 1 < lines.length) {
      index += 1;
      jsx += `\n${lines[index] ?? ""}`;
    }
    if (!/\/>\s*$/.test(jsx)) {
      const wrapper = /^<([A-Z][A-Za-z]*)/.exec(jsx)?.[1];
      const title = /\btitle="([^"]+)"/.exec(jsx)?.[1];
      if (wrapper === "Rules") rule = 0;
      if (wrapper === "Rule") rule += 1;
      if (wrapper === "Do" || wrapper === "Dont")
        out.push(`**${wrapper === "Do" ? "Do" : "Don't"}:**`, "");
      if (title !== undefined)
        out.push(
          wrapper === "Rule" ? `**${String(rule)}. ${title}**` : `**${title}**`,
          "",
        );
      continue;
    }
    const name = /^<([A-Z][A-Za-z]*)/.exec(jsx)?.[1] ?? "";
    if (name === "ComponentDocs") {
      const of = /of="([^"]+)"/.exec(jsx)?.[1] ?? "";
      const component = components.find((candidate) => candidate.name === of);
      if (component)
        out.push(componentMarkdown(root, component, components, 3, base));
    } else if (name === "Example") {
      const of = /of="([^"]+)"/.exec(jsx)?.[1] ?? "";
      const file = /name="([^"]+)"/.exec(jsx)?.[1] ?? "";
      const component = components.find((candidate) => candidate.name === of);
      const path = component
        ? join(component.folder, "examples", `${file}.tsx`)
        : "";
      if (path !== "" && existsSync(path)) {
        const source = readFileSync(path, "utf8");
        out.push(
          captionOf(source),
          "",
          "```tsx",
          shownSource(source).trimEnd(),
          "```",
        );
      }
    } else if (name === "DocsTable") {
      out.push(docsTableOf(jsx));
    } else if (name === "ComponentList") {
      out.push(componentListOf(jsx, components, base));
    } else if (name === "WhatsNew") {
      out.push(releasesMarkdown(releasesIn(root)));
    } else if (name === "LatestRelease") {
      const latest = releasesIn(root)[0];
      if (latest) out.push(linksUnder(latestReleaseMarkdown(latest), base));
    } else if (name === "Roadmap") {
      out.push(
        linksUnder(roadmapMarkdown(roadmapIn(root), releasesIn(root)), base),
      );
    } else if (name === "QuickStartCode") {
      out.push(
        '```tsx title="src/App.tsx"',
        readFileSync(
          join(root, "apps/docs/src/blocks/quick-start/App.tsx"),
          "utf8",
        ).trimEnd(),
        "```",
      );
    } else if (name === "StarterEntry") {
      const entry = join(root, "apps/starter/src/main.tsx");
      out.push(
        '```tsx title="src/main.tsx"',
        readFileSync(entry, "utf8").trimEnd(),
        "```",
      );
    } else if (name === "TemplateCards") {
      out.push(templateCardsMarkdown(root, base));
    } else if (name === "NextSteps") {
      const after =
        /after="([^"]+)"/.exec(jsx)?.[1] ?? "get-started/introduction";
      out.push(nextStepsMarkdown(root, after, base));
    } else if (name === "TemplatePreview") {
      const template = /name="([^"]+)"/.exec(jsx)?.[1] ?? "";
      const preview = sitePath(`/templates/${template}/preview`, base);
      out.push(`The template runs live at [${preview}](${preview}).`);
    } else {
      out.push(
        tokenBlock(root, name, jsx) ??
          `The page draws this live: [${place.title}](${place.href}).`,
      );
    }
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Each template a new app can start from: its page, what it is, and its flag for `pnpm new-app`. */
function templateCardsMarkdown(root: string, base: string): string {
  return templates
    .map((template) => {
      const file = join(
        root,
        "apps/docs/content/templates",
        `${template.name}.mdx`,
      );
      const { block } = splitFrontmatter(
        existsSync(file) ? readFileSync(file, "utf8") : "",
      );
      const data = block === null ? {} : parseFrontmatter(block, file);
      const about =
        typeof data["description"] === "string" ? data["description"] : "";
      return `- [${template.title}](${sitePath(`/templates/${template.name}`, base)}), \`--template ${template.name}\`: ${about}`;
    })
    .join("\n");
}

/** The pages a written page names as related, under a heading, each a link with what the page covers. */
function relatedMarkdown(
  root: string,
  routes: readonly string[],
  components: readonly ComponentSource[],
  base: string,
): string {
  const lines = routes.flatMap((route) => {
    const file = join(root, "apps/docs/content", `${route}.mdx`);
    if (existsSync(file)) {
      const { block } = splitFrontmatter(readFileSync(file, "utf8"));
      const data = block === null ? {} : parseFrontmatter(block, route);
      const title = typeof data["title"] === "string" ? data["title"] : route;
      const about =
        typeof data["description"] === "string" ? data["description"] : "";
      return [`- [${title}](${sitePath(`/${route}`, base)}): ${about}`];
    }
    const component = components.find(
      (candidate) => componentHref(candidate) === `/${route}`,
    );
    return component
      ? [
          `- [${component.title}](${sitePath(`/${route}`, base)}): ${component.description}`,
        ]
      : [];
  });
  return lines.length === 0 ? "" : ["## Related", "", ...lines].join("\n");
}

/**
 * The pages of Get started after `after`, in the sidebar's order, as a numbered list of links with each
 * page's description, under `base`.
 */
function nextStepsMarkdown(root: string, after: string, base: string): string {
  return globSync("get-started/*.mdx", { cwd: join(root, "apps/docs/content") })
    .map((file) => {
      const route = file.replace(/\.mdx$/, "");
      const { block } = splitFrontmatter(
        readFileSync(join(root, "apps/docs/content", file), "utf8"),
      );
      const data = block === null ? {} : parseFrontmatter(block, route);
      return {
        route,
        title: typeof data["title"] === "string" ? data["title"] : route,
        description:
          typeof data["description"] === "string" ? data["description"] : "",
        order: typeof data["order"] === "number" ? data["order"] : 0,
      };
    })
    .filter((page) => page.route !== after)
    .sort((a, b) => a.order - b.order)
    .map(
      (page, index) =>
        `${String(index + 1)}. [${page.title}](${sitePath(`/${page.route}`, base)}): ${page.description}`,
    )
    .join("\n");
}

/** Every written page's route, read from `apps/docs/content`. */
export function contentRoutesIn(root: string): string[] {
  return globSync("**/*.mdx", { cwd: join(root, "apps/docs/content") })
    .map((file) => file.replace(/\.mdx$/, ""))
    .sort();
}

/**
 * The Markdown of the page at `route`, a written page or a component's own page, or `null` without one, its
 * links under `base`, the path the site is served under.
 */
export function pageMarkdown(
  root: string,
  route: string,
  components: readonly ComponentSource[] = componentSources(root),
  base = "/",
): string | null {
  const file = join(root, "apps/docs/content", `${route}.mdx`);
  if (existsSync(file)) {
    const { block, body } = splitFrontmatter(readFileSync(file, "utf8"));
    const data = block === null ? {} : parseFrontmatter(block, route);
    const title = typeof data["title"] === "string" ? data["title"] : route;
    const description =
      typeof data["description"] === "string" ? data["description"] : "";
    const related = data["related"];
    return `${[heading(1, title), "", description, "", bodyMarkdown(root, { route, title }, body, components, base), "", relatedMarkdown(root, Array.isArray(related) ? related : [], components, base)].join("\n").trim()}\n`;
  }
  const component = components.find(
    (candidate) => componentHref(candidate) === `/${route}`,
  );
  return component
    ? `${componentMarkdown(root, component, components, 1, base)}\n`
    : null;
}

/** A page as `llms.txt` lists it: where it sits in the nav, and its link line. */
interface ListedPage {
  readonly section: string;
  readonly order: number;
  readonly title: string;
  readonly line: string;
}

/**
 * `llms.txt`: what buttery is, and every page of the site with a link to its Markdown, under the nav's
 * sections in the nav's order, and the components under their groups' names, such as "Components › Actions";
 * then the demos, which are apps, by their own addresses. Its links are under `base`, the path the site is
 * served under.
 */
export function llmsText(
  root: string,
  components: readonly ComponentSource[] = componentSources(root),
  base = "/",
): string {
  const pages: ListedPage[] = [
    ...contentRoutesIn(root).map((route) => {
      const { block } = splitFrontmatter(
        readFileSync(join(root, "apps/docs/content", `${route}.mdx`), "utf8"),
      );
      const data = block === null ? {} : parseFrontmatter(block, route);
      const title = typeof data["title"] === "string" ? data["title"] : route;
      const description =
        typeof data["description"] === "string" ? data["description"] : "";
      return {
        section: typeof data["section"] === "string" ? data["section"] : "",
        order: typeof data["order"] === "number" ? data["order"] : 0,
        title,
        line: `- [${title}](${sitePath(`/${route}.md`, base)}): ${description}`,
      };
    }),
    ...components
      .filter((component) => component.home === undefined)
      .map((component) => ({
        section: component.section,
        order: component.order,
        title: component.title,
        line: `- [${component.name}](${sitePath(markdownHref(componentHref(component)), base)}): ${textOf(component.meta["purpose"])}`,
      })),
  ];
  const listing = (heading: string, section: string): string[] => {
    const listed = pages
      .filter((page) => page.section === section)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    return listed.length === 0
      ? []
      : [`## ${heading}`, "", ...listed.map((page) => page.line), ""];
  };
  return `${[
    "# buttery",
    "",
    "> A React design system and layout and motion framework for web and desktop apps: tokens, components, patterns and checks that keep an app buttery.",
    "",
    ...SECTIONS.flatMap((section) => [
      ...listing(section.title, section.root),
      ...(section.groups ?? []).flatMap((group) =>
        listing(`${section.title} › ${group.title}`, group.section),
      ),
    ]),
    "## Demos",
    "",
    `- [Demos](${sitePath("/demos", base)}): Small apps made only from buttery's components, each one a template with its own content, that open as sites of their own.`,
    ...demoPages.map(
      (demo) =>
        `- [${demo.title}](${sitePath(`/demos/${demo.route}`, base)}): ${demo.description} It's built on the ${demo.template} template, and its source is in \`apps/demos/${demo.route}\`.`,
    ),
  ]
    .join("\n")
    .trim()}\n`;
}

/** The parts of a request the Markdown middlewares read. */
export interface MarkdownRequest {
  readonly url?: string | undefined;
}

/** The parts of a response the Markdown middlewares write. */
export interface MarkdownResponse {
  statusCode: number;
  setHeader: (name: string, value: string) => unknown;
  end: (body: string) => unknown;
}

/** A middleware that answers a request or hands it to `next`. */
export type MarkdownMiddleware = (
  request: MarkdownRequest,
  response: MarkdownResponse,
  next: () => void,
) => void;

/** The path a request asks for, from the site's root, or `null` for an address outside `base`. */
function pathOf(request: MarkdownRequest, base: string): string | null {
  return pathUnderBase(
    decodeURIComponent((request.url ?? "").split("?")[0] ?? ""),
    base,
  );
}

function notFound(
  response: MarkdownResponse,
  path: string,
  base: string,
): void {
  response.statusCode = 404;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end(
    `No page has its Markdown at ${sitePath(path, base)}. ${sitePath("/llms.txt", base)} links to every page's.\n`,
  );
}

/**
 * Answers `llms.txt` and each page's Markdown at its path plus `.md`, under `base`, written from the
 * repository on each request, and 404 for a `.md` address that's no page's and isn't a file `served` says
 * the server has, given its path from the site's root. Anything else, and any address outside the base,
 * goes on to `next`.
 */
export function markdownRequests(
  root: string,
  served: (path: string) => boolean,
  base = "/",
): MarkdownMiddleware {
  return (request, response, next) => {
    const path = pathOf(request, base);
    if (path === null) {
      next();
      return;
    }
    const markdown =
      path === "/llms.txt"
        ? llmsText(root, componentSources(root), base)
        : path.endsWith(".md")
          ? pageMarkdown(root, path.slice(1, -3), componentSources(root), base)
          : null;
    if (markdown !== null) {
      response.setHeader(
        "Content-Type",
        path === "/llms.txt"
          ? "text/plain; charset=utf-8"
          : "text/markdown; charset=utf-8",
      );
      response.end(markdown);
      return;
    }
    if (path.endsWith(".md") && !served(path)) {
      notFound(response, path, base);
      return;
    }
    next();
  };
}

/**
 * Answers 404 for a `.md` address under `base` with no file in `out`, the static build, rather than the
 * app's HTML.
 */
export function missingMarkdown(out: string, base = "/"): MarkdownMiddleware {
  return (request, response, next) => {
    const path = pathOf(request, base);
    if (path?.endsWith(".md") === true && !existsSync(join(out, path))) {
      notFound(response, path, base);
      return;
    }
    next();
  };
}

/**
 * Serves every page as Markdown at its path plus `.md`, and `llms.txt`, from the dev server under its base,
 * written from the repository on each request so they follow the pages as they change; the static build
 * writes the same files. Both answer 404 for a `.md` address no page has, the static build when
 * `vite preview` serves it.
 */
export function butteryMarkdown(root: string): Plugin {
  return {
    name: "buttery-docs-markdown",
    configureServer(server) {
      const { root: app, publicDir, base } = server.config;
      server.middlewares.use(
        markdownRequests(
          root,
          (path) =>
            path.startsWith("/@") ||
            existsSync(join(app, path)) ||
            (publicDir !== "" && existsSync(join(publicDir, path))),
          base,
        ),
      );
    },
    configurePreviewServer(server) {
      server.middlewares.use(
        missingMarkdown(
          resolve(server.config.root, server.config.build.outDir),
          server.config.base,
        ),
      );
    },
  };
}
