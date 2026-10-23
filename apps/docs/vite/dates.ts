import { execFileSync } from "node:child_process";
import type { Plugin } from "vite";

const DATES_MODULE = "virtual:buttery-dates";

/** When each file under `paths` last changed, from one pass over git's history: path to `YYYY-MM-DD`. */
export function lastChanged(
  root: string,
  paths: readonly string[],
): Record<string, string> {
  const log = execFileSync(
    "git",
    ["log", "--format=%x00%cs", "--name-only", "--", ...paths],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const dates: Record<string, string> = {};
  for (const entry of log.split("\0").slice(1)) {
    const [date = "", ...files] = entry.split("\n");
    for (const file of files) {
      if (file !== "" && !(file in dates)) dates[file] = date;
    }
  }
  return dates;
}

/** Serves `virtual:buttery-dates`: when each docs page's source file last changed, for its footer. */
export function butteryDates(root: string): Plugin {
  return {
    name: "buttery-docs-dates",
    resolveId(source) {
      return source === DATES_MODULE ? `\0${DATES_MODULE}` : undefined;
    },
    load(id) {
      if (id !== `\0${DATES_MODULE}`) return undefined;
      return `export const lastChanged = ${JSON.stringify(lastChanged(root, ["apps/docs/content", "packages"]))};`;
    },
  };
}
