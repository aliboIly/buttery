import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";

/** One prop as a props table shows it. */
export interface PropDoc {
  readonly name: string;
  /** Its type as written, with the `| undefined` optional props carry left out. */
  readonly type: string;
  readonly required: boolean;
  /** The value it takes when left out, read from "Defaults to `…`" in its JSDoc. */
  readonly defaultValue: string | null;
  /** Its JSDoc, as written; empty when it has none, which the docs check reports. */
  readonly description: string;
}

/** The props of a component or one of its parts. */
export interface PropsTable {
  /** `""` for the component itself, else the part's name, such as `"Item"` for `Menu.Item`. */
  readonly part: string;
  /** The interface the table comes from, such as `MenuItemProps`. */
  readonly interfaceName: string;
  readonly props: readonly PropDoc[];
  /** What else it takes, from what the interface extends, such as `a button element's props`. */
  readonly inherits: readonly string[];
}

function jsDocOf(node: ts.Node): string {
  return ts
    .getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? "")
    .join("\n")
    .trim();
}

/** A literal union a type alias in the file names, so a table shows the values, not just the alias. */
function aliasesIn(file: ts.SourceFile): Map<string, string> {
  const aliases = new Map<string, string>();
  for (const statement of file.statements) {
    if (
      ts.isTypeAliasDeclaration(statement) &&
      ts.isUnionTypeNode(statement.type) &&
      statement.type.types.every(ts.isLiteralTypeNode)
    ) {
      aliases.set(statement.name.text, statement.type.getText(file));
    }
  }
  return aliases;
}

function typeText(
  node: ts.TypeNode | undefined,
  file: ts.SourceFile,
  aliases: Map<string, string>,
): string {
  if (!node) return "unknown";
  const parts = ts.isUnionTypeNode(node)
    ? node.types.filter(
        (part) =>
          !(
            part.kind === ts.SyntaxKind.UndefinedKeyword ||
            (ts.isLiteralTypeNode(part) &&
              part.literal.kind === ts.SyntaxKind.UndefinedKeyword)
          ),
      )
    : [node];
  return parts
    .map((part) => {
      const text = part.getText(file).replace(/\s+/g, " ");
      return aliases.get(text) ?? text;
    })
    .join(" | ");
}

function inheritsOf(
  node: ts.InterfaceDeclaration,
  file: ts.SourceFile,
): string[] {
  return (node.heritageClauses ?? []).flatMap((clause) =>
    clause.types.map((type) => type.getText(file).replace(/\s+/g, " ")),
  );
}

/**
 * The props tables of the component `name`, read from its source file: its `<Name>Props` and every
 * `<Name><Part>Props` beside it, each prop it declares itself with its type, default and JSDoc.
 */
export function propsTablesOf(name: string, source: string): PropsTable[] {
  const file = ts.createSourceFile(
    `${name}.tsx`,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const aliases = aliasesIn(file);
  const tables: PropsTable[] = [];
  for (const statement of file.statements) {
    if (
      !ts.isInterfaceDeclaration(statement) ||
      !statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    )
      continue;
    const interfaceName = statement.name.text;
    const match = new RegExp(`^${name}([A-Z][A-Za-z]*)?Props$`).exec(
      interfaceName,
    );
    if (!match) continue;
    const props = statement.members.flatMap((member): PropDoc[] => {
      if (!ts.isPropertySignature(member)) return [];
      const propName = member.name.getText(file).replace(/^"|"$/g, "");
      const description = jsDocOf(member);
      const defaultValue =
        (/Defaults to `([^`]+)`/.exec(description) ??
          /`([^`]+)`\s*\((?:[^)]*,\s*)?the default\)/.exec(description))?.[1] ??
        null;
      return [
        {
          name: propName,
          type: typeText(member.type, file, aliases),
          required: member.questionToken === undefined,
          defaultValue,
          description,
        },
      ];
    });
    tables.push({
      part: match[1] ?? "",
      interfaceName,
      props,
      inherits: inheritsOf(statement, file),
    });
  }
  return tables.sort((a, b) =>
    a.part === "" ? -1 : b.part === "" ? 1 : a.part.localeCompare(b.part),
  );
}

/** The props tables of the component whose source is `file`. */
export function propsTablesIn(name: string, file: string): PropsTable[] {
  return propsTablesOf(name, readFileSync(file, "utf8"));
}

const PROPS_MODULE = "virtual:buttery-props";

/**
 * Serves `virtual:buttery-props`: every component's props tables by its name, read from the packages'
 * sources at build time and again when one changes in development.
 */
export function butteryProps(root: string): Plugin {
  return {
    name: "buttery-docs-props",
    resolveId(source) {
      return source === PROPS_MODULE ? `\0${PROPS_MODULE}` : undefined;
    },
    load(id) {
      if (id !== `\0${PROPS_MODULE}`) return undefined;
      const tables: Record<string, PropsTable[]> = {};
      for (const meta of globSync("packages/*/src/*/*/*.meta.ts", {
        cwd: root,
      })) {
        const name = basename(meta, ".meta.ts");
        const file = join(root, dirname(meta), `${name}.tsx`);
        if (!existsSync(file)) continue;
        this.addWatchFile(file);
        tables[name] = propsTablesIn(name, file);
      }
      return `export const propsTables = ${JSON.stringify(tables)};`;
    },
  };
}
