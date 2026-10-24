/**
 * How an example becomes a page: `"whole"` when it is one already; `"app-page"` inside an `AppPage` under
 * the example's own title; `"titled"` inside an `AppPage` with a `PageHeader`; `"screen"` centered in a
 * section of a `Page`, the main landmark, on the app's background; and `"reading"` in such a section.
 */
export type PageFrame = "whole" | "app-page" | "titled" | "screen" | "reading";

/** A page's names: its component, the file it's in, its path, and its title or label. */
export interface PageNames {
  readonly component: string;
  readonly file: string;
  readonly route: string;
  readonly label: string;
}

function words(text: string): string[] {
  return text
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word !== "");
}

/**
 * The names for a page called `name`, such as `"Customers"` or `"order-detail"`: a component ending in
 * `Page`, a file in `src/pages`, a path and a label in sentence case.
 */
export function pageNames(name: string): PageNames {
  const parts = words(name);
  if (parts.at(-1)?.toLowerCase() === "page") parts.pop();
  const [first] = parts;
  if (first === undefined || !/^[A-Za-z]/.test(first)) {
    throw new Error(
      `"${name}" can't name a page. Fix: start it with a letter, such as --name Customers.`,
    );
  }
  const component = `${parts.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join("")}Page`;
  const lower = parts.map((part) => part.toLowerCase());
  const label = lower.join(" ");
  return {
    component,
    file: `src/pages/${component}.tsx`,
    route: `/${lower.join("-")}`,
    label: `${label.charAt(0).toUpperCase()}${label.slice(1)}`,
  };
}

/** The name an example exports its component as. */
export function exportedName(code: string): string {
  const name = /^export function (\w+)\(/m.exec(code)?.[1];
  if (name === undefined) {
    throw new Error("The page's example exports no function.");
  }
  return name;
}

/** The packages a file imports, such as `@butteryui/react` and `lucide-react`, each once. */
export function importedPackages(code: string): readonly string[] {
  return [
    ...new Set(
      [...code.matchAll(/^import[\s\S]*?from\s+"([^"]+)";$/gm)].map(
        (match) => match[1] ?? "",
      ),
    ),
  ].filter((name) => name !== "" && !name.startsWith("."));
}

interface Specifier {
  readonly imported: string;
  local: string;
  readonly type: boolean;
}

interface Statement {
  readonly start: number;
  readonly end: number;
  readonly typeOnly: boolean;
  readonly from: string;
  readonly specifiers: Specifier[];
  changed: boolean;
}

const NAMED_IMPORT = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+"([^"]+)";$/gm;

function statementsIn(code: string): Statement[] {
  return [...code.matchAll(NAMED_IMPORT)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
    typeOnly: match[1] !== undefined,
    from: match[3] ?? "",
    specifiers: (match[2] ?? "")
      .split(",")
      .map((text) => text.trim())
      .filter((text) => text !== "")
      .map((text) => {
        const type = text.startsWith("type ");
        const [imported = "", local] = text
          .slice(type ? "type ".length : 0)
          .split(/\s+as\s+/);
        return { imported, local: local ?? imported, type };
      }),
    changed: false,
  }));
}

function statementText(statement: Statement): string {
  const names = statement.specifiers.map(
    (specifier) =>
      `${specifier.type ? "type " : ""}${specifier.imported}${specifier.local === specifier.imported ? "" : ` as ${specifier.local}`}`,
  );
  const head = statement.typeOnly ? "import type" : "import";
  const line = `${head} { ${names.join(", ")} } from "${statement.from}";`;
  return line.length <= 80
    ? line
    : `${head} {\n${names.map((name) => `  ${name},`).join("\n")}\n} from "${statement.from}";`;
}

const FRAME_PARTS: Readonly<
  Record<PageFrame, Readonly<Record<string, readonly string[]>>>
> = {
  whole: {},
  "app-page": { "@butteryui/react": ["AppPage"] },
  titled: { "@butteryui/react": ["AppPage", "PageHeader"] },
  screen: {
    "@butteryui/core": ["Center"],
    "@butteryui/react": ["Page", "Section"],
  },
  reading: { "@butteryui/react": ["Page", "Section"] },
};

function frameJsx(
  frame: Exclude<PageFrame, "whole">,
  part: (name: string) => string,
  inner: string,
  title: string,
): string {
  switch (frame) {
    case "app-page":
      return `<${part("AppPage")}>\n      <${inner} />\n    </${part("AppPage")}>`;
    case "titled":
      return `<${part("AppPage")} header={<${part("PageHeader")} title="${title}" />}>\n      <${inner} />\n    </${part("AppPage")}>`;
    case "screen":
      return `<${part("Page")} asChild>\n      <main>\n        <${part("Section")} size="sm" tone="muted">\n          <${part("Center")}>\n            <${inner} />\n          </${part("Center")}>\n        </${part("Section")}>\n      </main>\n    </${part("Page")}>`;
    case "reading":
      return `<${part("Page")} asChild>\n      <main>\n        <${part("Section")} size="sm" tone="muted">\n          <${inner} />\n        </${part("Section")}>\n      </main>\n    </${part("Page")}>`;
    default: {
      const unknown: never = frame;
      throw new Error(`No frame called ${String(unknown)}.`);
    }
  }
}

/** How to turn an example into a page. */
export interface PageFraming {
  readonly frame: PageFrame;
  /** The page's component, such as `"SalesPage"`. */
  readonly component: string;
  /** The page's title, such as `"Sales"`, for a frame that shows one. */
  readonly title: string;
  /** What the page is for, such as "a dashboard's numbers for a period", for its JSDoc. */
  readonly what: string;
}

/**
 * `code`, an example, as a page whose component is `framing.component`. A whole page is renamed; any other
 * keeps its component as a part of the file and exports the page around it. A component of buttery's that
 * has the page's name is imported under another, as `SettingsPage as SettingsLayout`.
 */
export function pageCode(code: string, framing: PageFraming): string {
  const { frame, component } = framing;
  const exported = exportedName(code);
  const statements = statementsIn(code);
  const bodyStart = statements.reduce(
    (end, statement) => Math.max(end, statement.end),
    0,
  );
  const added: Statement[] = [];
  for (const [from, parts] of Object.entries(FRAME_PARTS[frame])) {
    for (const part of parts) {
      const present = statements.some(
        (statement) =>
          statement.from === from &&
          statement.specifiers.some(
            (specifier) => specifier.imported === part && !specifier.type,
          ),
      );
      if (present) continue;
      const target =
        statements.find(
          (statement) => statement.from === from && !statement.typeOnly,
        ) ?? added.find((statement) => statement.from === from);
      if (target) {
        target.specifiers.push({ imported: part, local: part, type: false });
        target.specifiers.sort((a, b) => a.imported.localeCompare(b.imported));
        target.changed = true;
        continue;
      }
      added.push({
        start: bodyStart,
        end: bodyStart,
        typeOnly: false,
        from,
        specifiers: [{ imported: part, local: part, type: false }],
        changed: true,
      });
    }
  }
  const all = [...statements, ...added];
  const hasReactElement = all.some((statement) =>
    statement.specifiers.some(
      (specifier) => specifier.local === "ReactElement",
    ),
  );
  if (frame !== "whole" && !hasReactElement) {
    added.push({
      start: bodyStart,
      end: bodyStart,
      typeOnly: true,
      from: "react",
      specifiers: [
        { imported: "ReactElement", local: "ReactElement", type: false },
      ],
      changed: true,
    });
  }
  let body = code.slice(bodyStart);
  const alias = `${component.replace(/Page$/, "")}Layout`;
  for (const statement of all) {
    for (const specifier of statement.specifiers) {
      if (specifier.local !== component || component === exported) continue;
      specifier.local = alias;
      statement.changed = true;
      body = body.replaceAll(
        new RegExp(`(?<![.\\w$])${component}\\b`, "g"),
        alias,
      );
    }
  }
  const part = (name: string): string =>
    all
      .flatMap((statement) => statement.specifiers)
      .find((specifier) => specifier.imported === name && !specifier.type)
      ?.local ?? name;
  const declaration = new RegExp(`^export function ${exported}\\(`, "m");
  if (frame === "whole") {
    body = body.replace(declaration, `export function ${component}(`);
  } else {
    const inner =
      exported === component
        ? `${component.replace(/Page$/, "")}Content`
        : exported;
    body = body.replace(declaration, `function ${inner}(`);
    const what = `${framing.what.charAt(0).toUpperCase()}${framing.what.slice(1)}`;
    body = `${body.trimEnd()}\n\n/** ${what}. */\nexport function ${component}(): ReactElement {\n  return (\n    ${frameJsx(frame, part, inner, framing.title)}\n  );\n}\n`;
  }
  let head = "";
  let cursor = 0;
  for (const statement of statements) {
    head += code.slice(cursor, statement.start);
    head += statement.changed
      ? statementText(statement)
      : code.slice(statement.start, statement.end);
    cursor = statement.end;
  }
  head += code.slice(cursor, bodyStart);
  const extra = added
    .map((statement) => `\n${statementText(statement)}`)
    .join("");
  return `${head}${extra}${body}`;
}
