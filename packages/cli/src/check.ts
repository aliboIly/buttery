import { spawn, spawnSync } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { stripVTControlCharacters } from "node:util";
import {
  CHECK_WIDTHS,
  merged,
  reportedViolations,
} from "../../mcp/src/check.ts";
import type { CheckWidth, ReportedViolation } from "../../mcp/src/check.ts";
import { runScript } from "./package-manager.ts";
import type { PackageManager } from "./package-manager.ts";
import { configuredPort, readJson } from "./project.ts";

/** A browser engine the check runs in. */
export type Engine = "chromium" | "webkit";

/** The conditions `buttery check` checks each page in. */
export interface CheckMatrix {
  readonly widths: readonly CheckWidth[];
  readonly themes: readonly ("light" | "dark")[];
  readonly densities: readonly ("comfortable" | "compact")[];
  readonly engines: readonly Engine[];
}

/** What `buttery check` runs by default: phone and laptop widths, both themes, comfortable density, in Chromium. */
export const QUICK_MATRIX: CheckMatrix = {
  widths: [390, 1280],
  themes: ["light", "dark"],
  densities: ["comfortable"],
  engines: ["chromium"],
};

/** What `buttery check --full` runs: every width, theme and density, in Chromium and WebKit. */
export const FULL_MATRIX: CheckMatrix = {
  widths: CHECK_WIDTHS,
  themes: ["light", "dark"],
  densities: ["comfortable", "compact"],
  engines: ["chromium", "webkit"],
};

/** A page to check: a whole address, or a path on the app's dev server, which `""` is the home page of. */
export type Target =
  | { readonly kind: "address"; readonly url: URL }
  | { readonly kind: "path"; readonly path: string };

/** The pages named on the command line, or the dev server's home page when none are. */
export function targetsFrom(args: readonly string[]): readonly Target[] {
  if (args.length === 0) return [{ kind: "path", path: "" }];
  return args.map((arg): Target => {
    if (arg.startsWith("/")) return { kind: "path", path: arg };
    const url = URL.canParse(arg) ? new URL(arg) : null;
    if (url?.protocol !== "http:" && url?.protocol !== "https:") {
      throw new Error(
        `"${arg}" isn't a page. Fix: pass a path on the dev server, such as /settings, or an address, such as http://localhost:5173/settings.`,
      );
    }
    return { kind: "address", url };
  });
}

const LOCAL_URL =
  /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):\d+(?:\/[^\s"'`]*)?/;

/** The first address on this machine in a dev server's output, such as Vite's `Local: http://localhost:5173/`. */
export function printedUrl(output: string): URL | null {
  const match = LOCAL_URL.exec(stripVTControlCharacters(output));
  return match ? new URL(match[0]) : null;
}

async function answers(url: URL): Promise<boolean> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    await response.body?.cancel();
    return true;
  } catch {
    return false;
  }
}

interface DevServer {
  readonly url: URL;
  /** Stops the server if the check started it. */
  readonly stop: () => void;
}

const START_LIMIT = 60_000;

function stopGroup(child: ChildProcess): void {
  const { pid } = child;
  if (pid === undefined || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

function lastLines(output: string): string {
  const lines = stripVTControlCharacters(output).trimEnd().split("\n");
  return lines
    .slice(-12)
    .map((line) => `  ${line}`)
    .join("\n");
}

async function startDevServer(
  run: CheckRun,
  configured: URL | null,
): Promise<DevServer> {
  const { root, manager } = run;
  const command = runScript(manager, "dev");
  const windows = process.platform === "win32";
  run.log(`Starting the app with ${command}…`);
  // Its own process group, so stopping it also stops the server the script starts.
  const child = spawn(manager, ["run", "dev"], {
    cwd: root,
    detached: !windows,
    shell: windows,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, BROWSER: "none", NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  let output = "";
  const collect = (chunk: Buffer): void => {
    output = (output + chunk.toString()).slice(-20_000);
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  const exited = new Promise<string>((resolve) => {
    child.once("error", (error) => {
      resolve(error.message);
    });
    child.once("exit", (code, signal) => {
      resolve(signal ?? `exit code ${String(code)}`);
    });
  });
  const onSignal = (signal: NodeJS.Signals): void => {
    stopGroup(child);
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  const stop = (): void => {
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
    stopGroup(child);
  };
  const deadline = Date.now() + START_LIMIT;
  while (Date.now() < deadline) {
    const url = printedUrl(output) ?? configured;
    if (url !== null && (await answers(url))) return { url, stop };
    const ended = await Promise.race([exited, delay(250, null)]);
    if (ended !== null) {
      stop();
      throw new Error(
        `${command} stopped (${ended}) before the app answered. It printed:\n\n${lastLines(output)}\n\nFix: make ${command} start the app, or start it yourself and pass its address, such as buttery check http://localhost:5173/.`,
      );
    }
  }
  stop();
  const waited = configured ? ` at ${configured.href}` : "";
  throw new Error(
    `${command} didn't answer${waited} within a minute. It printed:\n\n${lastLines(output)}\n\nFix: set "config": { "port": <port> } in package.json to the port it serves on, or start it yourself and pass its address.`,
  );
}

const TITLE = /<title>([^<]*)<\/title>/i;

async function servedTitle(url: URL): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return TITLE.exec(await response.text())?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

function ownTitle(root: string): string | null {
  const file = join(root, "index.html");
  return existsSync(file)
    ? (TITLE.exec(readFileSync(file, "utf8"))?.[1]?.trim() ?? null)
    : null;
}

async function devServer(run: CheckRun): Promise<DevServer> {
  const port = configuredPort(readJson(join(run.root, "package.json")));
  const configured =
    port === null ? null : new URL(`http://localhost:${String(port)}/`);
  if (configured === null || !(await answers(configured))) {
    return startDevServer(run, configured);
  }
  const served = await servedTitle(configured);
  const own = ownTitle(run.root);
  if (served !== null && own !== null && served !== own) {
    throw new Error(
      `Another app is running at ${configured.href} ("${served}", and this one is "${own}"). Fix: stop it, or give this app its own port in package.json's "config": { "port": <port> }.`,
    );
  }
  run.log(`Using the app already running at ${configured.href}.`);
  return { url: configured, stop: () => undefined };
}

/** What one `buttery check` run looks at, and in which conditions. */
export interface CheckRun {
  /** The app's folder, whose Playwright and `@butteryui/test` run the checks. */
  readonly root: string;
  readonly targets: readonly Target[];
  readonly matrix: CheckMatrix;
  /** Runs the dev server, when a target is a path and the app isn't running yet. */
  readonly manager: PackageManager;
  /** Where progress goes, a line at a time, away from the report. */
  readonly log: (line: string) => void;
}

/** What a check run found: the pages it opened, and each problem once per condition it showed in. */
export interface CheckResult {
  readonly pages: readonly string[];
  readonly violations: readonly ReportedViolation[];
}

/**
 * Opens each target in the app's own Playwright and runs `@butteryui/test`'s checks on it in every
 * condition of the matrix, starting the app's dev server first when a target is a path on it.
 */
export async function runCheck(run: CheckRun): Promise<CheckResult> {
  const server = run.targets.some((target) => target.kind === "path")
    ? await devServer(run)
    : null;
  try {
    const urls = run.targets.map((target) =>
      target.kind === "address"
        ? target.url
        : new URL(target.path, server?.url),
    );
    const violations: ReportedViolation[] = [];
    for (const url of urls) {
      for (const engine of run.matrix.engines) {
        run.log(`Checking ${url.href} in ${engine}…`);
        violations.push(
          ...(await reportedViolations(
            run.root,
            {
              url: url.href,
              viewports: run.matrix.widths,
              themes: run.matrix.themes,
              densities: run.matrix.densities,
              engine,
            },
            // Whoever runs the command picks the address, so any origin they name is open to it.
            [url.origin],
          )),
        );
      }
    }
    return { pages: urls.map((url) => url.pathname), violations };
  } finally {
    server?.stop();
  }
}

function listed(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1) ?? ""}`;
}

/** The report `buttery check` prints: each page's problems once, with the fix and the conditions they showed in. */
export function formatResult(result: CheckResult, matrix: CheckMatrix): string {
  const unique = [...new Set(result.pages)];
  const lines = [
    `Checked ${listed(unique)} at ${listed(matrix.widths.map(String))}, ${listed(matrix.themes)}, ${listed(matrix.densities)}, in ${listed(matrix.engines)}.`,
  ];
  let problems = 0;
  for (const page of unique) {
    const found = merged(
      result.violations.filter((violation) => violation.page === page),
    );
    if (found.length === 0) continue;
    problems += found.length;
    lines.push("", `✗ ${page}`);
    for (const item of found) {
      const target = item.b === null ? item.a : `${item.a} and ${item.b}`;
      const indent = " ".repeat(14);
      lines.push(`  ${item.rule.padEnd(14)}${target}: ${item.message}`);
      lines.push(`  ${indent}Fix: ${item.fix}`);
      lines.push(`  ${indent}In ${listed(item.conditions)}.`);
    }
  }
  const noun = problems === 1 ? "problem" : "problems";
  lines.push(
    "",
    problems === 0
      ? "buttery found no layout problems."
      : `buttery found ${String(problems)} layout ${noun}.`,
  );
  return lines.join("\n");
}
