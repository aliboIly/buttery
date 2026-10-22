import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";
import { COLOR_GROUPS, isColorGroup } from "../src/foundations/color-groups.ts";
import { MOTION_TEXT, REDUCED_TEXT } from "../src/motion-text.ts";
import { slugify } from "../src/slug.ts";
import { captionOf } from "./code.ts";
import { shownSource } from "./example-source.ts";
import { parseFrontmatter, splitFrontmatter } from "./frontmatter.ts";
import { propsTablesIn } from "./props.ts";
import { releasesIn, releasesMarkdown } from "./whats-new.ts";

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

/** The string, string-list and record-list fields of the object literal a meta or playground file exports. */
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
        if (ts.isStringLiteralLike(init)) fields[key] = init.text;
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

function heading(depth: number, text: string): string {
  return `${"#".repeat(Math.min(depth, 6))} ${text}`;
}

/**
 * A component's documentation as Markdown, its parts in the order its page shows them: what it is and its
 * import, when to use it, its examples as code, its props, accessibility, motion, layout and related pages.
 * `depth` is its title's heading level: 1 on a page of its own, 3 inside a written page.
 */
export function componentMarkdown(
  root: string,
  component: ComponentSource,
  components: readonly ComponentSource[],
  depth = 1,
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

  const sourceFile = join(folder, `${name}.tsx`);
  const tables = existsSync(sourceFile) ? propsTablesIn(name, sourceFile) : [];
  if (tables.length > 0) {
    lines.push(heading(part, "Props"), "");
    for (const props of tables) {
      lines.push(
        heading(part + 1, props.part === "" ? name : `${name}.${props.part}`),
        "",
      );
      if (props.props.length > 0) {
        lines.push(
          table(
            ["Prop", "Type", "Default", "Description"],
            props.props.map((prop) => [
              `\`${prop.name}\`${prop.required ? " (required)" : ""}`,
              `\`${prop.type}\``,
              prop.defaultValue === null ? "" : `\`${prop.defaultValue}\``,
              prop.description,
            ]),
          ),
          "",
        );
      }
      if (props.inherits.length > 0) {
        lines.push(
          `It also takes ${props.inherits.map((type) => `\`${type}\``).join(", ")}.`,
          "",
        );
      }
    }
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
    return found ? [`- [${other}](${markdownHref(componentHref(found))})`] : [];
  });
  if (related.length > 0)
    lines.push(heading(part, "Related"), "", ...related, "");
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
        [...group("duration"), ...group("easing"), ...group("timing")].map(
          ([, token]) => [
            `\`${value(token, "cssVar")}\``,
            value(token, "value"),
          ],
        ),
      );
    default:
      return null;
  }
}

/** A written page's body as Markdown: its components written out as text, tables and code. */
function bodyMarkdown(
  root: string,
  body: string,
  components: readonly ComponentSource[],
): string {
  const out: string[] = [];
  const lines = body.split("\n");
  let fenced = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (line.startsWith("```")) fenced = !fenced;
    if (fenced || line.startsWith("```") || !/^<[A-Z]/.test(line)) {
      if (!(!fenced && /^(?:import|export)\s/.test(line))) out.push(line);
      continue;
    }
    let jsx = line;
    while (!/\/>\s*$/.test(jsx) && index + 1 < lines.length) {
      index += 1;
      jsx += `\n${lines[index] ?? ""}`;
    }
    const name = /^<([A-Z][A-Za-z]*)/.exec(jsx)?.[1] ?? "";
    if (name === "ComponentDocs") {
      const of = /of="([^"]+)"/.exec(jsx)?.[1] ?? "";
      const component = components.find((candidate) => candidate.name === of);
      if (component)
        out.push(componentMarkdown(root, component, components, 3));
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
    } else if (name === "WhatsNew") {
      out.push(releasesMarkdown(releasesIn(root)));
    } else {
      const block = tokenBlock(root, name, jsx);
      if (block !== null) out.push(block);
    }
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Every written page's route, read from `apps/docs/content`. */
export function contentRoutesIn(root: string): string[] {
  return globSync("**/*.mdx", { cwd: join(root, "apps/docs/content") })
    .map((file) => file.replace(/\.mdx$/, ""))
    .sort();
}

/** The Markdown of the page at `route`, a written page or a component's own page, or `null` without one. */
export function pageMarkdown(
  root: string,
  route: string,
  components: readonly ComponentSource[] = componentSources(root),
): string | null {
  const file = join(root, "apps/docs/content", `${route}.mdx`);
  if (existsSync(file)) {
    const { block, body } = splitFrontmatter(readFileSync(file, "utf8"));
    const data = block === null ? {} : parseFrontmatter(block, route);
    const title = typeof data["title"] === "string" ? data["title"] : route;
    const description =
      typeof data["description"] === "string" ? data["description"] : "";
    return `${[heading(1, title), "", description, "", bodyMarkdown(root, body, components)].join("\n").trim()}\n`;
  }
  const component = components.find(
    (candidate) => componentHref(candidate) === `/${route}`,
  );
  return component
    ? `${componentMarkdown(root, component, components)}\n`
    : null;
}

/** The site's sections in its nav's order. */
const SECTION_ORDER = [
  "get-started",
  "foundations",
  "layout",
  "motion",
  "components",
  "patterns",
  "templates",
  "guides",
  "tools",
  "resources",
] as const;

/** `llms.txt`: what buttery is, and every page of the site with a link to its Markdown, by section. */
export function llmsText(
  root: string,
  components: readonly ComponentSource[] = componentSources(root),
): string {
  const pages = contentRoutesIn(root).map((route) => {
    const { block } = splitFrontmatter(
      readFileSync(join(root, "apps/docs/content", `${route}.mdx`), "utf8"),
    );
    const data = block === null ? {} : parseFrontmatter(block, route);
    return {
      route,
      title: typeof data["title"] === "string" ? data["title"] : route,
      description:
        typeof data["description"] === "string" ? data["description"] : "",
    };
  });
  const own = components.filter((component) => component.home === undefined);
  const sections = SECTION_ORDER.filter(
    (section) =>
      section === "components" ||
      pages.some(({ route }) => route.startsWith(`${section}/`)),
  );
  const lines = [
    "# buttery",
    "",
    "> A React design system and layout and motion framework for web and desktop apps: tokens, components, patterns and checks that keep an app buttery.",
    "",
  ];
  for (const section of sections) {
    lines.push(
      `## ${section.charAt(0).toUpperCase()}${section.slice(1).replaceAll("-", " ")}`,
      "",
    );
    for (const page of pages.filter(({ route }) =>
      route.startsWith(`${section}/`),
    ))
      lines.push(`- [${page.title}](/${page.route}.md): ${page.description}`);
    if (section === "components") {
      for (const component of own)
        lines.push(
          `- [${component.name}](${markdownHref(componentHref(component))}): ${textOf(component.meta["purpose"])}`,
        );
    }
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

/**
 * Serves every page as Markdown at its path plus `.md`, and `llms.txt`, from the dev server, written from
 * the repository on each request so they follow the pages as they change. The static build writes the same
 * files.
 */
export function butteryMarkdown(root: string): Plugin {
  return {
    name: "buttery-docs-markdown",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = (request.url ?? "").split("?")[0] ?? "";
        const markdown =
          path === "/llms.txt"
            ? llmsText(root)
            : path.endsWith(".md")
              ? pageMarkdown(root, decodeURIComponent(path.slice(1, -3)))
              : null;
        if (markdown === null) {
          next();
          return;
        }
        response.setHeader(
          "Content-Type",
          path === "/llms.txt"
            ? "text/plain; charset=utf-8"
            : "text/markdown; charset=utf-8",
        );
        response.end(markdown);
      });
    },
  };
}
