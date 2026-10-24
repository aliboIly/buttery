import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** The object in a JSON file; throws, naming the file, when it holds anything else. */
export function readJson(path: string): Record<string, unknown> {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} isn't a JSON object.`);
  }
  return Object.fromEntries(Object.entries(value));
}

/** Writes `value` as JSON the way npm writes `package.json`: two spaces and a final newline. */
export function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** The nearest folder at or above `from` that has a `package.json`, or null when there's none. */
export function projectRoot(from: string): string | null {
  let folder = from;
  for (;;) {
    if (existsSync(join(folder, "package.json"))) return folder;
    const parent = dirname(folder);
    if (parent === folder) return null;
    folder = parent;
  }
}

/** The port in `package.json`'s `config.port`, which buttery's templates read for their dev server. */
export function configuredPort(
  manifest: Record<string, unknown>,
): number | null {
  const config = manifest["config"];
  const port: unknown =
    typeof config === "object" && config !== null
      ? Reflect.get(config, "port")
      : undefined;
  return typeof port === "number" && Number.isInteger(port) ? port : null;
}
