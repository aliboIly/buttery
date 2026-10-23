import { readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));

/** Helpers that only compute an exported type from another, which no one writes themselves. */
const COMPUTED = new Set(["NumericStep"]);

/** The source entry points a package's `exports` map points at. */
function entriesOf(packageName) {
  const manifest = JSON.parse(
    readFileSync(join(root, "packages", packageName, "package.json"), "utf8"),
  );
  return Object.values(manifest.exports)
    .map((target) =>
      typeof target === "object" ? target["@butteryui/source"] : undefined,
    )
    .filter((source) => typeof source === "string" && source.endsWith(".ts"))
    .map((source) => join(root, "packages", packageName, source));
}

/**
 * Types from a package's own source that its exports name, through their props, signatures and the types
 * those name in turn, but that none of its entry points export.
 */
function unexportedTypes(packageName) {
  const folder = join(root, "packages", packageName);
  const config = ts.getParsedCommandLineOfConfigFile(
    join(folder, "tsconfig.json"),
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        );
      },
    },
  );
  if (!config) throw new Error(`No tsconfig for ${packageName}.`);
  const program = ts.createProgram({
    rootNames: config.fileNames,
    options: { ...config.options, noEmit: true, composite: false },
  });
  const checker = program.getTypeChecker();
  const resolve = (symbol) =>
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  const exported = new Set();
  for (const entry of entriesOf(packageName)) {
    const file = program.getSourceFile(entry);
    const module = file && checker.getSymbolAtLocation(file);
    if (!module) throw new Error(`No module for ${entry}.`);
    for (const symbol of checker.getExportsOfModule(module))
      exported.add(resolve(symbol));
  }
  const source = join(folder, "src") + sep;
  const local = (declaration) =>
    declaration.getSourceFile().fileName.startsWith(source);
  const visited = new Set();
  const missing = new Map();

  const visitNode = (node, from) => {
    const name = ts.isTypeReferenceNode(node)
      ? node.typeName
      : ts.isExpressionWithTypeArguments(node)
        ? node.expression
        : ts.isTypeQueryNode(node)
          ? node.exprName
          : undefined;
    const symbol = name && checker.getSymbolAtLocation(name);
    if (symbol) visitSymbol(resolve(symbol), from);
    ts.forEachChild(node, (child) => {
      visitNode(child, from);
    });
  };

  const visitDeclaration = (declaration, from) => {
    if (ts.isFunctionDeclaration(declaration)) {
      for (const parameter of declaration.typeParameters ?? [])
        visitNode(parameter, from);
      for (const parameter of declaration.parameters)
        if (parameter.type) visitNode(parameter.type, from);
      if (declaration.type) visitNode(declaration.type, from);
    } else if (ts.isVariableDeclaration(declaration)) {
      if (declaration.type) visitNode(declaration.type, from);
    } else if (
      ts.isInterfaceDeclaration(declaration) ||
      ts.isTypeAliasDeclaration(declaration) ||
      ts.isClassDeclaration(declaration)
    ) {
      visitNode(declaration, from);
    }
  };

  const visitSymbol = (symbol, from) => {
    const declarations = (symbol.declarations ?? []).filter(local);
    if (declarations.length === 0) return;
    const named = declarations.some(
      (declaration) =>
        ts.isInterfaceDeclaration(declaration) ||
        ts.isTypeAliasDeclaration(declaration) ||
        ts.isClassDeclaration(declaration),
    );
    if (named && !exported.has(symbol) && !COMPUTED.has(symbol.getName())) {
      const where = relative(root, declarations[0].getSourceFile().fileName);
      const key = `${symbol.getName()} (${where})`;
      missing.set(key, new Set([...(missing.get(key) ?? []), from]));
    }
    if (visited.has(symbol)) return;
    visited.add(symbol);
    for (const declaration of declarations)
      visitDeclaration(declaration, symbol.getName());
  };

  for (const symbol of exported) visitSymbol(symbol, "the entry point");
  return [...missing]
    .map(([type, users]) => `${type}, named by ${[...users].join(" and ")}`)
    .sort();
}

describe("public types", () => {
  for (const packageName of ["core", "react"]) {
    it(`@butteryui/${packageName} exports every type its exports name`, () => {
      expect(unexportedTypes(packageName)).toEqual([]);
    });
  }
});
