import type { ComponentEntry, Knowledge, PropEntry } from "./knowledge.ts";

/** One problem found in a file, in the shape every buttery check reports. */
export interface Diagnostic {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly rule: string;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly fix: string;
  readonly docs: string;
}

interface Attribute {
  readonly name: string;
  /** The literal's text without quotes, or `null` for an expression this check can't read. */
  readonly value: string | null;
  /** How it was written, for the message: `"16px"` or `4`. */
  readonly written: string;
  readonly offset: number;
}

const TAG = /<([A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)?)(?=[\s/>])/g;

function attributesAt(source: string, start: number): Attribute[] {
  const attributes: Attribute[] = [];
  let index = start;
  while (index < source.length) {
    const char = source[index] ?? "";
    if (char === ">" || (char === "/" && source[index + 1] === ">")) break;
    const name = /^[A-Za-z_][\w-]*/.exec(source.slice(index))?.[0];
    if (name === undefined) {
      index += 1;
      continue;
    }
    const offset = index;
    index += name.length;
    if (source[index] !== "=") {
      attributes.push({ name, value: "true", written: "true", offset });
      continue;
    }
    index += 1;
    const open = source[index];
    if (open === '"' || open === "'") {
      const close = source.indexOf(open, index + 1);
      if (close === -1) break;
      const value = source.slice(index + 1, close);
      attributes.push({ name, value, written: JSON.stringify(value), offset });
      index = close + 1;
    } else if (open === "{") {
      let depth = 0;
      let end = index;
      for (; end < source.length; end += 1) {
        if (source[end] === "{") depth += 1;
        if (source[end] === "}") depth -= 1;
        if (depth === 0) break;
      }
      const expression = source.slice(index + 1, end).trim();
      const quoted = /^(["'`])([^"'`$]*)\1$/.exec(expression)?.[2];
      const literal = /^(?:-?\d+(?:\.\d+)?|true|false)$/.test(expression)
        ? expression
        : (quoted ?? null);
      attributes.push({
        name,
        value: literal,
        written: quoted === undefined ? expression : JSON.stringify(quoted),
        offset,
      });
      index = end + 1;
    }
  }
  return attributes;
}

function literalsIn(
  type: string,
  knowledge: Knowledge,
): readonly string[] | null {
  const parts = type.split("|").map((part) => part.trim());
  const values: string[] = [];
  for (const part of parts) {
    const token = knowledge.types.find((entry) => entry.name === part);
    if (token) {
      values.push(...token.values);
    } else if (/^"[^"]*"$/.test(part) || /^-?\d+(?:\.\d+)?$/.test(part)) {
      values.push(part);
    } else if (part === "boolean") {
      values.push("true", "false");
    } else {
      return null;
    }
  }
  return values;
}

function lineAndColumn(
  source: string,
  offset: number,
): { line: number; column: number } {
  const before = source.slice(0, offset).split("\n");
  return { line: before.length, column: (before.at(-1)?.length ?? 0) + 1 };
}

function propsOf(
  component: ComponentEntry,
  part: string,
): readonly PropEntry[] {
  return component.props
    .filter((table) => table.part === part && table.component === null)
    .flatMap((table) => table.props);
}

function fixFor(
  name: string,
  value: string,
  allowed: readonly string[],
  type: string,
): string {
  if (/\bSpace(?:Value|Step)\b/.test(type)) {
    const pixels = /^(\d+(?:\.\d+)?)px$/.exec(value)?.[1];
    const step = pixels === undefined ? undefined : String(Number(pixels) / 4);
    return step !== undefined && allowed.includes(step)
      ? `Write ${name}={${step}}: spacing step ${step} is ${value}.`
      : `Use a spacing step, where 1 is 4px and 4 is 16px: ${allowed.join(" | ")}.`;
  }
  return `Use one of ${allowed.join(" | ")}.`;
}

/**
 * Props given a literal value their type doesn't allow, such as `gap="16px"` on a `Stack` or
 * `variant="primay"` on a `Button`, for the components a file imports from buttery, with the values it takes.
 */
export function checkProps(
  knowledge: Knowledge,
  source: string,
  file: string,
): Diagnostic[] {
  const imported = new Set(
    [
      ...source.matchAll(
        /import\s*\{([^}]*)\}\s*from\s*["']@butteryui\/(?:core|react)["']/g,
      ),
    ].flatMap((match) =>
      (match[1] ?? "")
        .split(",")
        .map(
          (name) =>
            name
              .replace(/^\s*type\s+/, "")
              .split(/\s+as\s+/)[0]
              ?.trim() ?? "",
        )
        .filter((name) => name !== ""),
    ),
  );
  const diagnostics: Diagnostic[] = [];
  for (const match of source.matchAll(TAG)) {
    const [name = "", part = ""] = (match[1] ?? "").split(".");
    if (!imported.has(name)) continue;
    const component = knowledge.components.find((entry) => entry.name === name);
    if (!component) continue;
    const props = propsOf(component, part);
    for (const attribute of attributesAt(
      source,
      match.index + match[0].length,
    )) {
      if (attribute.value === null) continue;
      const prop = props.find((entry) => entry.name === attribute.name);
      if (!prop) continue;
      const allowed = literalsIn(prop.type, knowledge);
      if (allowed === null) continue;
      // A token type keyed by numbers takes 4 and "4" alike, so values compare without their quotes.
      const raw = allowed.map((value) => value.replace(/^"|"$/g, ""));
      if (raw.includes(attribute.value)) continue;
      const owner = part === "" ? name : `${name}.${part}`;
      const where = lineAndColumn(source, attribute.offset);
      diagnostics.push({
        file,
        ...where,
        rule: "buttery/prop-values",
        severity: "error",
        message: `${owner}'s ${attribute.name} doesn't take ${attribute.written}.`,
        fix: fixFor(attribute.name, attribute.value, allowed, prop.type),
        docs: `${knowledge.site}${component.href}`,
      });
    }
  }
  return diagnostics;
}
