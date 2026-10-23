import {
  existsSync,
  globSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import type { Knowledge } from "./knowledge.ts";
import { checkProps } from "./props-check.ts";
import type { Diagnostic } from "./props-check.ts";

/** The most diagnostics one call returns. */
export const DIAGNOSTIC_LIMIT = 50;
const FILE_LIMIT = 50;
const SIZE_LIMIT = 1_000_000;

/** What to lint: files in the project, or a snippet of code. */
export interface LintRequest {
  readonly files?: readonly string[] | undefined;
  readonly code?: string | undefined;
  readonly language?: "tsx" | "css" | undefined;
}

/** What `buttery_lint` returns as structured content. */
export interface LintReport {
  readonly summary: {
    readonly files: number;
    readonly errors: number;
    readonly warnings: number;
    /** What couldn't run and how to set it up, such as ESLint missing from the project. */
    readonly notes: readonly string[];
  };
  readonly diagnostics: readonly Diagnostic[];
  readonly truncated: boolean;
}

/** A request this tool can't carry out as asked, with how to ask instead. */
export class LintRequestError extends Error {}

interface EslintMessage {
  readonly ruleId: string | null;
  readonly severity: number;
  readonly message: string;
  readonly line?: number;
  readonly column?: number;
}

interface EslintResult {
  readonly filePath: string;
  readonly messages: readonly EslintMessage[];
}

interface EslintInstance {
  lintFiles(patterns: string[]): Promise<EslintResult[]>;
  lintText(
    code: string,
    options: { filePath: string },
  ): Promise<EslintResult[]>;
}

interface StylelintWarning {
  readonly line?: number;
  readonly column?: number;
  readonly rule: string;
  readonly severity: string;
  readonly text: string;
}

interface StylelintResult {
  readonly source?: string;
  readonly warnings: readonly StylelintWarning[];
}

interface Stylelint {
  lint(options: {
    files?: string[];
    code?: string;
    codeFilename?: string;
    cwd: string;
  }): Promise<{ results: StylelintResult[] }>;
}

const SCRIPT = new Set([".tsx", ".ts", ".jsx", ".js"]);
const STYLE = new Set([".css"]);

/** The files `patterns` name, resolved inside `root`; a path outside it is refused, symlinks included. */
export function filesIn(root: string, patterns: readonly string[]): string[] {
  const rootReal = realpathSync(root);
  const found = new Set<string>();
  for (const pattern of patterns) {
    const matches = /[*?[{]/.test(pattern)
      ? globSync(pattern, { cwd: root }).filter(
          (match) => !match.split(/[\\/]/).includes("node_modules"),
        )
      : [pattern];
    if (matches.length === 0) {
      throw new LintRequestError(
        `Nothing matches ${pattern} in ${root}. Fix: give paths or globs from the project's root, such as "src/App.tsx" or "src/**/*.tsx".`,
      );
    }
    for (const match of matches) {
      const absolute = resolve(root, match);
      if (!existsSync(absolute)) {
        throw new LintRequestError(
          `No file at ${match} in ${root}. Fix: give paths from the project's root, such as "src/App.tsx".`,
        );
      }
      const real = realpathSync(absolute);
      if (real !== rootReal && !real.startsWith(`${rootReal}${sep}`)) {
        throw new LintRequestError(
          `${match} is outside the project at ${root}. Fix: lint files inside it.`,
        );
      }
      if (statSync(real).isFile()) found.add(real);
    }
  }
  if (found.size > FILE_LIMIT) {
    throw new LintRequestError(
      `${String(found.size)} files match; one call lints ${String(FILE_LIMIT)} at most. Fix: narrow it, such as "src/pages/*.tsx".`,
    );
  }
  return [...found];
}

function exportedEntry(exports: unknown): string | null {
  if (typeof exports === "string") return exports;
  if (typeof exports !== "object" || exports === null) return null;
  const root: unknown = Reflect.get(exports, ".") ?? exports;
  if (typeof root === "string") return root;
  if (typeof root !== "object" || root === null) return null;
  for (const condition of ["import", "node", "default"]) {
    const entry = exportedEntry(Reflect.get(root, condition));
    if (entry !== null) return entry;
  }
  return null;
}

/**
 * Where `name` resolves from the project at `root`, ESM-only packages such as stylelint included, whose
 * exports CommonJS resolution can't see.
 */
export function resolveFrom(root: string, name: string): string {
  try {
    return createRequire(join(root, "package.json")).resolve(name);
  } catch (error) {
    for (let folder = resolve(root); ; folder = dirname(folder)) {
      const manifest = join(folder, "node_modules", name, "package.json");
      if (existsSync(manifest)) {
        const data: unknown = JSON.parse(readFileSync(manifest, "utf8"));
        const entry: unknown =
          typeof data === "object" && data !== null
            ? (exportedEntry(Reflect.get(data, "exports")) ??
              Reflect.get(data, "module") ??
              Reflect.get(data, "main"))
            : null;
        return join(
          dirname(manifest),
          typeof entry === "string" ? entry : "index.js",
        );
      }
      if (dirname(folder) === folder) throw error;
    }
  }
}

async function load(root: string, name: string): Promise<unknown> {
  return import(pathToFileURL(resolveFrom(root, name)).href);
}

async function eslintIn(root: string): Promise<EslintInstance | null> {
  try {
    const module = await load(root, "eslint");
    const constructor: unknown =
      typeof module === "object" && module !== null
        ? Reflect.get(module, "ESLint")
        : undefined;
    if (typeof constructor !== "function") return null;
    const instance: unknown = Reflect.construct(constructor, [{ cwd: root }]);
    return instance as EslintInstance;
  } catch {
    return null;
  }
}

async function stylelintIn(root: string): Promise<Stylelint | null> {
  try {
    const module = await load(root, "stylelint");
    const api: unknown =
      typeof module === "object" && module !== null
        ? (Reflect.get(module, "default") ?? module)
        : undefined;
    // stylelint's default export is a function that carries lint() as a property.
    const lintable =
      ((typeof api === "object" && api !== null) ||
        typeof api === "function") &&
      typeof Reflect.get(api, "lint") === "function";
    return lintable ? (api as Stylelint) : null;
  } catch {
    return null;
  }
}

/**
 * A rule's text as the problem and its fix: after "Fix:" where it says so, or, for buttery's rules, which say
 * what's wrong and then what to do, after the first sentence.
 */
function split(text: string, rule: string): { message: string; fix: string } {
  const marked = text.indexOf(" Fix: ");
  if (marked !== -1) {
    return { message: text.slice(0, marked), fix: text.slice(marked + 6) };
  }
  const sentence = rule.startsWith("buttery/") ? text.indexOf(". ") : -1;
  return sentence === -1
    ? { message: text, fix: "" }
    : { message: text.slice(0, sentence + 1), fix: text.slice(sentence + 2) };
}

function lintDocs(
  knowledge: Knowledge,
  rule: string,
  kind: "eslint" | "stylelint",
): string {
  return rule.startsWith("buttery/")
    ? `${knowledge.site}/tools/lint-configs#${kind === "eslint" ? "eslint" : "stylelint"}`
    : "";
}

function fromEslint(
  knowledge: Knowledge,
  root: string,
  results: readonly EslintResult[],
  file?: string,
): Diagnostic[] {
  return results.flatMap((result) =>
    result.messages.map((entry) => {
      const rule = entry.ruleId ?? "parse";
      const { message, fix } = split(entry.message, rule);
      return {
        file: file ?? relative(root, result.filePath),
        line: entry.line ?? 1,
        column: entry.column ?? 1,
        rule,
        severity: entry.severity >= 2 ? "error" : "warning",
        message,
        fix,
        docs: lintDocs(knowledge, rule, "eslint"),
      } satisfies Diagnostic;
    }),
  );
}

function fromStylelint(
  knowledge: Knowledge,
  root: string,
  results: readonly StylelintResult[],
  file?: string,
): Diagnostic[] {
  return results.flatMap((result) =>
    result.warnings.map((warning) => {
      const { message, fix } = split(
        warning.text.replace(` (${warning.rule})`, ""),
        warning.rule,
      );
      return {
        file: file ?? relative(root, result.source ?? ""),
        line: warning.line ?? 1,
        column: warning.column ?? 1,
        rule: warning.rule,
        severity: warning.severity === "error" ? "error" : "warning",
        message,
        fix,
        docs: lintDocs(knowledge, warning.rule, "stylelint"),
      } satisfies Diagnostic;
    }),
  );
}

function reasonOf(error: unknown): string {
  return error instanceof Error
    ? (error.message.split("\n")[0] ?? "")
    : String(error);
}

function setupNote(
  knowledge: Knowledge,
  tool: "ESLint" | "stylelint",
  reason: string,
): string {
  const page = tool === "ESLint" ? "eslint" : "stylelint";
  return `${tool} didn't run: ${reason}. Fix: add buttery's ${tool} config to the project, as ${knowledge.site}/tools/lint-configs#${page} shows.`;
}

/**
 * Lints `request`'s files or snippet with the project's own ESLint and stylelint, which carry buttery's
 * configs, and checks the literal values given to buttery components' props, which needs nothing installed.
 */
export async function lint(
  knowledge: Knowledge,
  root: string | null,
  request: LintRequest,
): Promise<LintReport> {
  const notes: string[] = [];
  const diagnostics: Diagnostic[] = [];
  let count: number;
  if (request.code !== undefined) {
    count = 1;
    const css = request.language === "css";
    const file = css ? "snippet.css" : "snippet.tsx";
    if (!css) diagnostics.push(...checkProps(knowledge, request.code, file));
    if (root === null) {
      notes.push(
        "ESLint and stylelint didn't run: no project was found. Fix: start the server in the app's folder or pass --project <dir>.",
      );
    } else if (css) {
      const stylelint = await stylelintIn(root);
      if (stylelint === null)
        notes.push(
          setupNote(
            knowledge,
            "stylelint",
            "it isn't installed in the project",
          ),
        );
      else {
        try {
          const { results } = await stylelint.lint({
            code: request.code,
            codeFilename: join(root, "src", file),
            cwd: root,
          });
          diagnostics.push(...fromStylelint(knowledge, root, results, file));
        } catch (error) {
          notes.push(setupNote(knowledge, "stylelint", reasonOf(error)));
        }
      }
    } else {
      const eslint = await eslintIn(root);
      if (eslint === null)
        notes.push(
          setupNote(knowledge, "ESLint", "it isn't installed in the project"),
        );
      else {
        try {
          const results = await eslint.lintText(request.code, {
            filePath: join(root, "src", file),
          });
          // A config with type information can't lint text that isn't a file in its TypeScript project.
          const untyped = results.every((result) =>
            result.messages.some(
              (entry) =>
                entry.ruleId === null &&
                /project service|parserOptions/.test(entry.message),
            ),
          );
          if (untyped) {
            notes.push(
              "ESLint didn't run on the snippet: the project's config reads type information, which only files in its TypeScript project have. Fix: save it to a file and lint that with files.",
            );
          } else {
            diagnostics.push(...fromEslint(knowledge, root, results, file));
          }
        } catch (error) {
          notes.push(setupNote(knowledge, "ESLint", reasonOf(error)));
        }
      }
    }
  } else {
    if (root === null) {
      throw new LintRequestError(
        "No project was found to lint files in. Fix: start the server in the app's folder or pass --project <dir>, or lint a snippet with code.",
      );
    }
    const files = filesIn(root, request.files ?? []);
    count = files.length;
    const scripts = files.filter((file) => SCRIPT.has(extname(file)));
    const styles = files.filter((file) => STYLE.has(extname(file)));
    for (const file of scripts) {
      if (statSync(file).size > SIZE_LIMIT) {
        notes.push(
          `${relative(root, file)} is over 1 MB, so its props weren't checked.`,
        );
        continue;
      }
      diagnostics.push(
        ...checkProps(
          knowledge,
          readFileSync(file, "utf8"),
          relative(root, file),
        ),
      );
    }
    if (scripts.length > 0) {
      const eslint = await eslintIn(root);
      if (eslint === null)
        notes.push(
          setupNote(knowledge, "ESLint", "it isn't installed in the project"),
        );
      else {
        try {
          diagnostics.push(
            ...fromEslint(knowledge, root, await eslint.lintFiles(scripts)),
          );
        } catch (error) {
          notes.push(setupNote(knowledge, "ESLint", reasonOf(error)));
        }
      }
    }
    if (styles.length > 0) {
      const stylelint = await stylelintIn(root);
      if (stylelint === null)
        notes.push(
          setupNote(
            knowledge,
            "stylelint",
            "it isn't installed in the project",
          ),
        );
      else {
        try {
          const { results } = await stylelint.lint({
            files: styles,
            cwd: root,
          });
          diagnostics.push(...fromStylelint(knowledge, root, results));
        } catch (error) {
          notes.push(setupNote(knowledge, "stylelint", reasonOf(error)));
        }
      }
    }
  }
  diagnostics.sort(
    (a, b) =>
      a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column,
  );
  return {
    summary: {
      files: count,
      errors: diagnostics.filter((entry) => entry.severity === "error").length,
      warnings: diagnostics.filter((entry) => entry.severity === "warning")
        .length,
      notes,
    },
    diagnostics: diagnostics.slice(0, DIAGNOSTIC_LIMIT),
    truncated: diagnostics.length > DIAGNOSTIC_LIMIT,
  };
}
