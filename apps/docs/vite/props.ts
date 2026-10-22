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
  /** The interface or type alias the table comes from, such as `MenuItemProps`. */
  readonly interfaceName: string;
  readonly props: readonly PropDoc[];
  /**
   * What else it takes: the DOM or library props it builds on, left as one type each, such as
   * `Omit<ComponentPropsWithRef<"button">, "type">`.
   */
  readonly inherits: readonly string[];
}

/** An exported type that a component's props use, such as `DataTableColumn`, with its fields. */
export interface TypeTable {
  /** Its name, such as `DataTableColumn`. */
  readonly name: string;
  /** Its JSDoc, as written. */
  readonly description: string;
  /** Its fields, as a props table shows props. */
  readonly props: readonly PropDoc[];
  /** The DOM and library types it builds on, one each. */
  readonly inherits: readonly string[];
}

/** Reads a source file, or gives `undefined` when there's none. */
export type ReadSource = (file: string) => string | undefined;

function readFromDisk(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, "utf8") : undefined;
}

type Declaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;

/** Where a type is written: its file, and what that file's type parameters stand for there. */
interface Scope {
  readonly file: ts.SourceFile;
  readonly params: ReadonlyMap<string, Bound>;
  readonly read: ReadSource;
  /** Every declaration followed so far, so a props union's members aren't listed again as parts. */
  readonly visited: Set<Declaration>;
}

/** A type argument, with the scope it was written in. */
interface Bound {
  readonly node: ts.TypeNode;
  readonly scope: Scope;
}

/** A prop as the reader collects it: its type as the parts of a union, and where it was written. */
interface Field {
  readonly name: string;
  readonly types: readonly string[];
  readonly required: boolean;
  readonly description: string;
  readonly sources: readonly Bound[];
}

/** A DOM or library type a shape builds on, less the keys taken out of it. */
interface Summary {
  readonly base: string;
  readonly omitted: readonly string[];
}

/** What a type takes: buttery's own props, and the DOM or library types it leaves as they are. */
interface Shape {
  readonly fields: readonly Field[];
  readonly inherits: readonly Summary[];
}

const EMPTY: Shape = { fields: [], inherits: [] };

/** Buttery's own types for a DOM element's props, summarized as DOM props are rather than followed. */
const SUMMARIZED = new Set(["MotionElementProps"]);

/** The interface a component's props table reads when it isn't `<Name>Props`: the factory's recipe. */
const PROPS_INTERFACES: Readonly<Record<string, string>> = {
  buttery: "ButteryRecipe",
};

const parsed = new Map<string, { text: string; file: ts.SourceFile }>();

function parse(path: string, read: ReadSource): ts.SourceFile | undefined {
  const text = read(path);
  if (text === undefined) return undefined;
  const cached = parsed.get(path);
  if (cached?.text === text) return cached.file;
  const file = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  parsed.set(path, { text, file });
  return file;
}

function jsDocOf(node: ts.Node): string {
  return ts
    .getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? "")
    .join("\n")
    .trim();
}

function flat(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/([<([]) /g, "$1")
    .replace(/,? ([>)\]])/g, "$1");
}

function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

function isDeclaration(node: ts.Node): node is Declaration {
  return ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
}

function isExported(declaration: Declaration): boolean {
  return (
    declaration.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    ) === true
  );
}

function isUndefined(node: ts.TypeNode): boolean {
  return (
    node.kind === ts.SyntaxKind.UndefinedKeyword ||
    (ts.isLiteralTypeNode(node) &&
      node.literal.kind === ts.SyntaxKind.UndefinedKeyword)
  );
}

/** The file a module specifier names: a relative path, or the source of a `@buttery/*` package. */
function moduleFile(
  specifier: string,
  from: ts.SourceFile,
  read: ReadSource,
): ts.SourceFile | undefined {
  const packages = from.fileName.lastIndexOf("/packages/");
  const name = /^@buttery\/([\w-]+)$/.exec(specifier)?.[1];
  const path = specifier.startsWith(".")
    ? join(dirname(from.fileName), specifier)
    : name !== undefined && packages !== -1
      ? join(from.fileName.slice(0, packages), "packages", name, "src/index.ts")
      : undefined;
  if (path === undefined) return undefined;
  for (const candidate of [path, `${path}.ts`, `${path}.tsx`]) {
    const file = parse(candidate, read);
    if (file) return file;
  }
  return undefined;
}

interface Found {
  readonly declaration: Declaration;
  readonly file: ts.SourceFile;
}

function declaredIn(
  name: string,
  file: ts.SourceFile,
): Declaration | undefined {
  return file.statements.find(
    (statement): statement is Declaration =>
      isDeclaration(statement) && statement.name.text === name,
  );
}

/** Where the export `name` of `file` is declared, through its re-exports. */
function exportedFrom(
  name: string,
  file: ts.SourceFile,
  read: ReadSource,
  depth: number,
): Found | undefined {
  const local = declaredIn(name, file);
  if (local && isExported(local)) return { declaration: local, file };
  if (depth > 8) return undefined;
  for (const statement of file.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    const { exportClause, moduleSpecifier } = statement;
    const target =
      moduleSpecifier && ts.isStringLiteral(moduleSpecifier)
        ? moduleFile(moduleSpecifier.text, file, read)
        : file;
    if (!target) continue;
    if (exportClause === undefined) {
      const found = exportedFrom(name, target, read, depth + 1);
      if (found) return found;
      continue;
    }
    if (!ts.isNamedExports(exportClause)) continue;
    const element = exportClause.elements.find(
      (candidate) => candidate.name.text === name,
    );
    if (!element) continue;
    const original = (element.propertyName ?? element.name).text;
    return target === file
      ? declarationOf(original, file, read, depth + 1)
      : exportedFrom(original, target, read, depth + 1);
  }
  return undefined;
}

/** Where `name`, as `file` uses it, is declared in buttery's sources, through imports and re-exports. */
function declarationOf(
  name: string,
  file: ts.SourceFile,
  read: ReadSource,
  depth = 0,
): Found | undefined {
  const local = declaredIn(name, file);
  if (local) return { declaration: local, file };
  for (const statement of file.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    const element = bindings.elements.find(
      (candidate) => candidate.name.text === name,
    );
    if (!element) continue;
    const target = moduleFile(statement.moduleSpecifier.text, file, read);
    return target
      ? exportedFrom(
          (element.propertyName ?? element.name).text,
          target,
          read,
          depth + 1,
        )
      : undefined;
  }
  return undefined;
}

function find(name: string, scope: Scope): Found | undefined {
  return declarationOf(name, scope.file, scope.read);
}

/** A type node's text with the type parameters in scope written out as what they stand for. */
function textOf(node: ts.Node, scope: Scope): string {
  const { file, params } = scope;
  if (params.size === 0) return flat(node.getText(file));
  const pieces: string[] = [];
  let at = node.getStart(file);
  const visit = (child: ts.Node): void => {
    const bound =
      ts.isTypeReferenceNode(child) && ts.isIdentifier(child.typeName)
        ? params.get(child.typeName.text)
        : undefined;
    if (bound) {
      pieces.push(
        file.text.slice(at, child.getStart(file)),
        textOf(bound.node, bound.scope),
      );
      at = child.getEnd();
    } else ts.forEachChild(child, visit);
  };
  visit(node);
  pieces.push(file.text.slice(at, node.getEnd()));
  return flat(pieces.join(""));
}

/** The values of a buttery type alias that's a union of literals, so a table shows them, not the alias. */
function literalsOf(name: string, scope: Scope): string[] | undefined {
  const found = find(name, scope);
  if (!found || !ts.isTypeAliasDeclaration(found.declaration)) return undefined;
  const { type } = found.declaration;
  return ts.isUnionTypeNode(type) && type.types.every(ts.isLiteralTypeNode)
    ? type.types.map((part) => part.getText(found.file))
    : undefined;
}

/** A type as the parts of a union, without `undefined`, its literal aliases written out. */
function partsOf(node: ts.TypeNode | undefined, scope: Scope): string[] {
  if (!node) return ["unknown"];
  if (ts.isUnionTypeNode(node))
    return unique(node.types.flatMap((part) => partsOf(part, scope)));
  if (isUndefined(node)) return [];
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    node.typeArguments === undefined
  ) {
    const bound = scope.params.get(node.typeName.text);
    if (bound) return partsOf(bound.node, bound.scope);
    const literals = literalsOf(node.typeName.text, scope);
    if (literals) return literals;
  }
  return [textOf(node, scope)];
}

function membersShape(
  members: ts.NodeArray<ts.TypeElement>,
  scope: Scope,
): Shape {
  return {
    fields: members.flatMap((member): Field[] => {
      if (!ts.isPropertySignature(member)) return [];
      return [
        {
          name: member.name.getText(scope.file).replace(/^["']|["']$/g, ""),
          types: partsOf(member.type, scope),
          required: member.questionToken === undefined,
          description: jsDocOf(member),
          sources: member.type ? [{ node: member.type, scope }] : [],
        },
      ];
    }),
    inherits: [],
  };
}

function summaryText({ base, omitted }: Summary): string {
  return omitted.length === 0
    ? base
    : `Omit<${base}, ${omitted.map((key) => `"${key}"`).join(" | ")}>`;
}

function mergeSummaries(summaries: readonly Summary[]): Summary[] {
  const seen = new Set<string>();
  return summaries.filter((summary) => {
    const text = summaryText(summary);
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  });
}

/** Every field of the shapes, the first of each name kept, as an intersection of them takes. */
function intersect(shapes: readonly Shape[]): Shape {
  const fields = new Map<string, Field>();
  for (const field of shapes.flatMap((shape) => shape.fields)) {
    const first = fields.get(field.name);
    fields.set(
      field.name,
      first === undefined
        ? field
        : {
            ...first,
            description: first.description || field.description,
            required: first.required || field.required,
          },
    );
  }
  return {
    fields: [...fields.values()],
    inherits: mergeSummaries(shapes.flatMap((shape) => shape.inherits)),
  };
}

/** An interface's own fields, then the ones it inherits and doesn't redeclare. */
function extend(own: Shape, inherited: Shape): Shape {
  const names = new Set(own.fields.map((field) => field.name));
  return {
    fields: [
      ...own.fields,
      ...inherited.fields.filter((field) => !names.has(field.name)),
    ],
    inherits: inherited.inherits,
  };
}

function omit(shape: Shape, keys: readonly string[]): Shape {
  const names = new Set(shape.fields.map((field) => field.name));
  const rest = keys.filter((key) => !names.has(key));
  return {
    fields: shape.fields.filter((field) => !keys.includes(field.name)),
    inherits: shape.inherits.map((summary) => ({
      ...summary,
      omitted: unique([...summary.omitted, ...rest]),
    })),
  };
}

function pick(shape: Shape, keys: readonly string[]): Shape {
  const names = new Set(shape.fields.map((field) => field.name));
  const rest = keys.filter((key) => !names.has(key));
  return {
    fields: shape.fields.filter((field) => keys.includes(field.name)),
    inherits:
      rest.length === 0
        ? []
        : shape.inherits.map((summary) => ({
            base: `Pick<${summaryText(summary)}, ${rest.map((key) => `"${key}"`).join(" | ")}>`,
            omitted: [],
          })),
  };
}

const LITERAL = /^(?:"[^"]*"|'[^']*'|true|false|-?\d+(?:\.\d+)?)$/;

/**
 * The prop that tells a union's members apart, such as `layout`, with how each member sets it, such as
 * `` `layout="sidebar"` ``: present in every member as literals no other member uses.
 */
function discriminantOf(
  shapes: readonly Shape[],
): { readonly name: string; readonly labels: readonly string[] } | undefined {
  for (const { name } of shapes[0]?.fields ?? []) {
    const values = shapes.map(
      (shape) => shape.fields.find((field) => field.name === name)?.types ?? [],
    );
    const all = values.flat();
    if (
      values.some((types) => types.length === 0) ||
      !all.every((value) => LITERAL.test(value)) ||
      new Set(all).size !== all.length
    )
      continue;
    return {
      name,
      labels: values.map((types) =>
        types
          .map((value) =>
            /^["']/.test(value)
              ? `\`${name}=${value}\``
              : `\`${name}={${value}}\``,
          )
          .join(" or "),
      ),
    };
  }
  return undefined;
}

function booleans(types: readonly string[]): string[] {
  return types.includes("true") && types.includes("false")
    ? unique(
        types.map((type) =>
          type === "true" || type === "false" ? "boolean" : type,
        ),
      )
    : [...types];
}

/**
 * The props of a union's members as one table. A prop only some members have, or that they describe
 * differently, says which member each description is for, by the prop that tells them apart.
 */
function union(shapes: readonly Shape[]): Shape {
  const [only] = shapes;
  if (shapes.length === 1 && only) return only;
  const discriminant = discriminantOf(shapes);
  const names = unique(
    shapes.flatMap((shape) => shape.fields.map((field) => field.name)),
  );
  const fields = names.map((name): Field => {
    const present = shapes.flatMap((shape, index) => {
      const field = shape.fields.find((candidate) => candidate.name === name);
      return field ? [{ field, index }] : [];
    });
    const everywhere = present.length === shapes.length;
    const descriptions = unique(
      present
        .map(({ field }) => field.description)
        .filter((text) => text !== ""),
    );
    const labelled =
      discriminant !== undefined &&
      name !== discriminant.name &&
      (!everywhere ||
        descriptions.length > 1 ||
        present.some(({ field }) => field.description === ""));
    return {
      name,
      types: booleans(unique(present.flatMap(({ field }) => field.types))),
      required:
        (everywhere || discriminant !== undefined) &&
        present.every(({ field }) => field.required),
      description: labelled
        ? present
            .filter(({ field }) => field.description !== "")
            .map(
              ({ field, index }) =>
                `With ${discriminant.labels[index] ?? ""}: ${field.description}`,
            )
            .join(" ")
        : descriptions.join(" "),
      sources: present.flatMap(({ field }) => field.sources),
    };
  });
  return {
    fields,
    inherits: mergeSummaries(shapes.flatMap((shape) => shape.inherits)),
  };
}

/** The keys an `Omit` or `Pick` names, or `null` when they aren't string literals. */
function keysOf(node: ts.TypeNode, scope: Scope): string[] | null {
  const parts = partsOf(node, scope);
  return parts.every((part) => /^["'][^"']*["']$/.test(part))
    ? parts.map((part) => part.slice(1, -1))
    : null;
}

function referenceShape(
  name: string,
  args: readonly ts.TypeNode[],
  node: ts.Node,
  scope: Scope,
  depth: number,
): Shape {
  if (depth > 24) return EMPTY;
  const bound = args.length === 0 ? scope.params.get(name) : undefined;
  if (bound) return shapeOf(bound.node, bound.scope, depth + 1);
  const [base, keys] = args;
  if ((name === "Omit" || name === "Pick") && base && keys) {
    const shape = shapeOf(base, scope, depth + 1);
    const names = keysOf(keys, scope);
    if (names === null) return shape;
    return name === "Omit" ? omit(shape, names) : pick(shape, names);
  }
  const found = SUMMARIZED.has(name) ? undefined : find(name, scope);
  return found
    ? declarationShape(found, args, scope, depth + 1)
    : { fields: [], inherits: [{ base: textOf(node, scope), omitted: [] }] };
}

function shapeOf(node: ts.TypeNode, scope: Scope, depth: number): Shape {
  if (ts.isParenthesizedTypeNode(node)) return shapeOf(node.type, scope, depth);
  if (ts.isTypeLiteralNode(node)) return membersShape(node.members, scope);
  if (ts.isIntersectionTypeNode(node))
    return intersect(node.types.map((part) => shapeOf(part, scope, depth)));
  if (ts.isUnionTypeNode(node))
    return union(
      node.types
        .filter((part) => !isUndefined(part))
        .map((part) => shapeOf(part, scope, depth)),
    );
  if (ts.isTypeReferenceNode(node))
    return referenceShape(
      node.typeName.getText(scope.file),
      node.typeArguments ?? [],
      node,
      scope,
      depth,
    );
  return EMPTY;
}

/**
 * What a declaration takes. Followed from a reference, its type parameters stand for the reference's type
 * arguments, or their defaults; read for its own table (`args` left out), they stay as written.
 */
function declarationShape(
  { declaration, file }: Found,
  args: readonly ts.TypeNode[] | undefined,
  caller: Scope,
  depth: number,
): Shape {
  caller.visited.add(declaration);
  const own: Scope = { ...caller, file, params: new Map() };
  const params = new Map<string, Bound>();
  if (args !== undefined) {
    for (const [index, parameter] of (
      declaration.typeParameters ?? []
    ).entries()) {
      const arg = args[index];
      if (arg) params.set(parameter.name.text, { node: arg, scope: caller });
      else if (parameter.default)
        params.set(parameter.name.text, {
          node: parameter.default,
          scope: own,
        });
    }
  }
  const scope: Scope = { ...own, params };
  if (ts.isTypeAliasDeclaration(declaration))
    return shapeOf(declaration.type, scope, depth + 1);
  const inherited = intersect(
    (declaration.heritageClauses ?? []).flatMap((clause) =>
      clause.types.map((type) =>
        referenceShape(
          type.expression.getText(file),
          type.typeArguments ?? [],
          type,
          scope,
          depth + 1,
        ),
      ),
    ),
  );
  return extend(membersShape(declaration.members, scope), inherited);
}

function propDocOf(field: Field): PropDoc {
  return {
    name: field.name,
    type: field.types.length === 0 ? "undefined" : field.types.join(" | "),
    required: field.required,
    defaultValue: defaultIn(field.description),
    description: field.description,
  };
}

/** The default a JSDoc states, as "Defaults to `…`", "Defaults to 1" or "`…` (the default)". */
function defaultIn(description: string): string | null {
  const stated = /Defaults to (?:`([^`]+)`|(-?\d+(?:\.\d+)?)\b)/.exec(
    description,
  );
  if (stated) return stated[1] ?? stated[2] ?? null;
  return (
    /`([^`]+)`\s*\((?:[^)]*,\s*)?the default\)/.exec(description)?.[1] ?? null
  );
}

/** Whether `file` declares a function or a constant called `name`, such as the part `MenuItem`. */
function declares(file: ts.SourceFile, name: string): boolean {
  return file.statements.some(
    (statement) =>
      (ts.isFunctionDeclaration(statement) && statement.name?.text === name) ||
      (ts.isVariableStatement(statement) &&
        statement.declarationList.declarations.some(
          (declaration) =>
            ts.isIdentifier(declaration.name) && declaration.name.text === name,
        )),
  );
}

/** A component's props tables, with the fields they list and the declarations they come from. */
interface ComponentProps {
  readonly tables: readonly PropsTable[];
  readonly fields: readonly Field[];
  readonly shown: ReadonlySet<Declaration>;
}

function componentProps(
  name: string,
  file: string,
  read: ReadSource,
): ComponentProps {
  const source = parse(file, read);
  const shown = new Set<Declaration>();
  if (!source) return { tables: [], fields: [], shown };
  const pattern = new RegExp(`^${name}([A-Z][A-Za-z]*)?Props$`);
  const declared = source.statements
    .filter(isDeclaration)
    .filter(isExported)
    .flatMap((declaration) => {
      const interfaceName = declaration.name.text;
      const match = pattern.exec(interfaceName);
      const part =
        PROPS_INTERFACES[name] === interfaceName
          ? ""
          : match && (match[1] ?? "");
      if (part === null) return [];
      return part === "" || declares(source, `${name}${part}`)
        ? [{ declaration, part }]
        : [];
    })
    .sort((a, b) =>
      a.part === "" ? -1 : b.part === "" ? 1 : a.part.localeCompare(b.part),
    );
  const consumed = new Set<Declaration>();
  const tables: PropsTable[] = [];
  const fields: Field[] = [];
  for (const { declaration, part } of declared) {
    if (consumed.has(declaration)) continue;
    const visited = new Set<Declaration>();
    const shape = declarationShape(
      { declaration, file: source },
      undefined,
      { file: source, params: new Map(), read, visited },
      0,
    );
    for (const followed of visited) {
      shown.add(followed);
      if (part === "") consumed.add(followed);
    }
    fields.push(...shape.fields);
    tables.push({
      part,
      interfaceName: declaration.name.text,
      props: shape.fields.map(propDocOf),
      inherits: shape.inherits.map(summaryText),
    });
  }
  return { tables, fields, shown };
}

/**
 * The props tables of the component `name`, whose source is `file`: its `<Name>Props` and, for each part
 * the file declares, such as `MenuItem`, its `<Name><Part>Props`, interfaces or type aliases. Each lists
 * the props it declares and the ones it takes from buttery's own types, followed through aliases, `Omit`
 * and `Pick`, intersections, unions and the interfaces it extends, in any file; DOM and library props are
 * left as one type each, under `inherits`. A union's members read as one table, so they aren't listed
 * again as parts.
 */
export function propsTablesIn(
  name: string,
  file: string,
  read: ReadSource = readFromDisk,
): PropsTable[] {
  return [...componentProps(name, file, read).tables];
}

/** The type references in `node`, a type parameter's in what it stands for. */
function referencesIn(
  node: ts.Node,
  scope: Scope,
): { readonly name: string; readonly scope: Scope }[] {
  const found: { readonly name: string; readonly scope: Scope }[] = [];
  const visit = (child: ts.Node): void => {
    if (ts.isTypeReferenceNode(child) && ts.isIdentifier(child.typeName)) {
      const bound = scope.params.get(child.typeName.text);
      if (bound) found.push(...referencesIn(bound.node, bound.scope));
      else found.push({ name: child.typeName.text, scope });
    }
    ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
}

/**
 * The exported types the props of the component `name` use, such as `DataTableColumn` for its `columns`,
 * each with its fields, and then the types those fields use: every buttery interface or object type the
 * props tables name and don't already show, in the order they're first named. A union of literals is
 * written out where it's used instead.
 */
export function typeTablesIn(
  name: string,
  file: string,
  read: ReadSource = readFromDisk,
): TypeTable[] {
  const { fields, shown } = componentProps(name, file, read);
  const seen = new Set(shown);
  const queue = fields.flatMap((field) => field.sources);
  const types: TypeTable[] = [];
  // The queue grows as it's walked, so the types a new table's fields use are walked too.
  for (const { node, scope } of queue) {
    for (const reference of referencesIn(node, scope)) {
      const found = find(reference.name, reference.scope);
      if (
        !found ||
        seen.has(found.declaration) ||
        !isExported(found.declaration) ||
        SUMMARIZED.has(found.declaration.name.text)
      )
        continue;
      seen.add(found.declaration);
      const shape = declarationShape(
        found,
        undefined,
        { file: found.file, params: new Map(), read, visited: new Set() },
        0,
      );
      if (shape.fields.length === 0) continue;
      types.push({
        name: found.declaration.name.text,
        description: jsDocOf(found.declaration),
        props: shape.fields.map(propDocOf),
        inherits: shape.inherits.map(summaryText),
      });
      queue.push(...shape.fields.flatMap((field) => field.sources));
    }
  }
  return types;
}

/** A runtime export of a package's index and the file it comes from. */
export interface IndexExport {
  readonly name: string;
  readonly file: string;
}

/** The runtime exports a package's `index.ts` names, each with the file it comes from. */
export function exportsOf(index: string): IndexExport[] {
  const text = readFileSync(index, "utf8");
  return [...text.matchAll(/^export \{([^}]*)\} from "([^"]+)";/gm)].flatMap(
    ([, names = "", from = ""]) =>
      names
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part !== "" && !part.startsWith("type "))
        .map((part) => ({
          name: part.split(/\s+as\s+/).at(-1) ?? part,
          file: join(dirname(index), from),
        })),
  );
}

/** Something a component's folder exports beside the component and its parts, such as a hook or a helper. */
export interface ExportDoc {
  readonly name: string;
  /** How it's declared, such as `parseSearch(text: string): ParsedSearch`. */
  readonly signature: string;
  /** Its JSDoc, as written. */
  readonly description: string;
}

/** How `source` declares the export `name`, with its JSDoc, or `null` when it doesn't declare it itself. */
export function exportDocOf(name: string, source: string): ExportDoc | null {
  const file = ts.createSourceFile(
    "export.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) {
      const parameters = statement.parameters
        .map((parameter) => parameter.getText(file))
        .join(", ");
      const returns = statement.type ? `: ${statement.type.getText(file)}` : "";
      return {
        name,
        signature: flat(`${name}(${parameters})${returns}`),
        description: jsDocOf(statement),
      };
    }
    if (ts.isVariableStatement(statement)) {
      const declaration = statement.declarationList.declarations.find(
        (candidate) =>
          ts.isIdentifier(candidate.name) && candidate.name.text === name,
      );
      if (!declaration) continue;
      return {
        name,
        signature: flat(
          declaration.type
            ? `${name}: ${declaration.type.getText(file)}`
            : name,
        ),
        description: jsDocOf(statement),
      };
    }
  }
  return null;
}

/**
 * What each component's folder exports beside the component and the parts its props tables show, read from
 * the packages' indexes: its hooks, helpers and constants, by the component's name.
 */
export function exportDocsIn(
  root: string,
  tables: Readonly<Record<string, readonly PropsTable[]>>,
): Record<string, ExportDoc[]> {
  const docs: Record<string, ExportDoc[]> = {};
  for (const index of globSync("packages/*/src/index.ts", { cwd: root })) {
    for (const { name, file } of exportsOf(join(root, index))) {
      const folder = dirname(file);
      const meta = globSync("*.meta.ts", { cwd: folder })[0];
      if (meta === undefined) continue;
      const owner = basename(meta, ".meta.ts");
      if (name === owner) continue;
      const parts = (tables[owner] ?? []).map((table) => table.interfaceName);
      if (parts.includes(`${name}Props`)) continue;
      const doc = existsSync(file)
        ? exportDocOf(name, readFileSync(file, "utf8"))
        : null;
      if (doc) (docs[owner] ??= []).push(doc);
    }
  }
  return docs;
}

const PROPS_MODULE = "virtual:buttery-props";

/**
 * Serves `virtual:buttery-props`: every component's props tables and the types its props use, by its name,
 * read from the packages' sources at build time and again in development when any file they're read from
 * changes.
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
      const types: Record<string, TypeTable[]> = {};
      const read: ReadSource = (file) => {
        const text = readFromDisk(file);
        if (text !== undefined) this.addWatchFile(file);
        return text;
      };
      for (const index of globSync("packages/*/src/index.ts", { cwd: root }))
        this.addWatchFile(join(root, index));
      for (const meta of globSync("packages/*/src/**/*.meta.ts", {
        cwd: root,
      })) {
        const name = basename(meta, ".meta.ts");
        const file = join(root, dirname(meta), `${name}.tsx`);
        if (!existsSync(file)) continue;
        tables[name] = propsTablesIn(name, file, read);
        types[name] = typeTablesIn(name, file, read);
      }
      return [
        `export const propsTables = ${JSON.stringify(tables)};`,
        `export const typeTables = ${JSON.stringify(types)};`,
        `export const exportDocs = ${JSON.stringify(exportDocsIn(root, tables))};`,
      ].join("\n");
    },
  };
}
