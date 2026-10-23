import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

function dependsOnButtery(folder: string): boolean {
  const file = join(folder, "package.json");
  if (!existsSync(file)) return false;
  const manifest: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (typeof manifest !== "object" || manifest === null) return false;
  return ["dependencies", "devDependencies"].some((field) => {
    const listed: unknown = Reflect.get(manifest, field);
    return (
      typeof listed === "object" &&
      listed !== null &&
      ("@butteryui/react" in listed || "@butteryui/core" in listed)
    );
  });
}

function folders(from: string): string[] {
  const chain: string[] = [];
  for (let folder = resolve(from); ; folder = dirname(folder)) {
    chain.push(folder);
    if (dirname(folder) === folder) return chain;
  }
}

/**
 * The app the server answers for: `--project <dir>`, else `CLAUDE_PROJECT_DIR`, which Claude Code sets, else
 * the nearest folder up from `cwd` whose `package.json` depends on buttery, else the nearest with a
 * `package.json`, else `null`.
 */
export function projectRootFrom(
  args: readonly string[],
  env: Readonly<Record<string, string | undefined>>,
  cwd: string,
): string | null {
  const flag = args.findIndex(
    (arg) => arg === "--project" || arg.startsWith("--project="),
  );
  const named =
    flag === -1 ? undefined : (args[flag]?.split("=")[1] ?? args[flag + 1]);
  if (named !== undefined && named !== "") return resolve(cwd, named);
  const fromClient = env["CLAUDE_PROJECT_DIR"];
  if (fromClient !== undefined && fromClient !== "") return resolve(fromClient);
  const chain = folders(cwd);
  return (
    chain.find(dependsOnButtery) ??
    chain.find((folder) => existsSync(join(folder, "package.json"))) ??
    null
  );
}
