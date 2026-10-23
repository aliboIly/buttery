/** Types an example imports only for its `kind` and `play` exports. */
const CHECK_TYPES: ReadonlySet<string> = new Set([
  "ExampleKind",
  "ExamplePlay",
]);

/**
 * An example's source as the docs show it and a reader copies it: without the `kind` and `play` exports,
 * which only the docs and their checks read, or the types they need.
 */
export function shownSource(source: string): string {
  const withoutChecks = source
    .replace(/^export const kind: ExampleKind = "[a-z]+";\n/m, "")
    .replace(/^export const play: ExamplePlay = [\s\S]*?^\};\n/m, "");
  const withoutTypes = withoutChecks.replace(
    /^import type \{([^}]*)\} from "@buttery\/core";\n/gm,
    (line, names: string) => {
      const listed = names
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name !== "");
      const kept = listed.filter((name) => !CHECK_TYPES.has(name));
      if (kept.length === listed.length) return line;
      return kept.length === 0
        ? ""
        : `import type { ${kept.join(", ")} } from "@buttery/core";\n`;
    },
  );
  return `${withoutTypes.replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}
