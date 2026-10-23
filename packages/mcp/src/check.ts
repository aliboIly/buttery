import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** The widths `buttery_check_layout` takes, each at the height the layout matrix pairs it with. */
export const CHECK_WIDTHS = [390, 768, 960, 1280, 1440, 1728] as const;

/** One of {@link CHECK_WIDTHS}. */
export type CheckWidth = (typeof CHECK_WIDTHS)[number];

const HEIGHTS: Readonly<Record<CheckWidth, number>> = {
  390: 844,
  768: 1024,
  960: 640,
  1280: 800,
  1440: 900,
  1728: 1117,
};

/** The most violations one call returns, after merging the same one across conditions. */
export const VIOLATION_LIMIT = 30;

/** What to check: a page of a running app, at some widths and themes, in one engine. */
export interface CheckRequest {
  readonly url: string;
  readonly viewports?: readonly CheckWidth[] | undefined;
  readonly themes?: readonly ("light" | "dark")[] | undefined;
  readonly engine?: "chromium" | "webkit" | undefined;
}

/** One problem, with every condition it showed up in. */
export interface MergedViolation {
  readonly rule: string;
  readonly a: string;
  readonly b: string | null;
  readonly message: string;
  readonly fix: string;
  /** Each as viewport, theme, density and engine, such as `"390x844 light comfortable chromium"`. */
  readonly conditions: readonly string[];
}

/** What `buttery_check_layout` returns as structured content. */
export interface CheckReport {
  readonly summary: {
    readonly url: string;
    /** How many viewport, theme and density combinations were checked. */
    readonly conditions: number;
    readonly violations: number;
    readonly byRule: Readonly<Record<string, number>>;
  };
  readonly violations: readonly MergedViolation[];
  readonly truncated: boolean;
}

/** A check that can't run as asked, with what to do about it. */
export class CheckRequestError extends Error {}

interface Reported {
  readonly rule: string;
  readonly a: string;
  readonly b?: string;
  readonly message: string;
  readonly fix: string;
  readonly viewport: string;
  readonly theme: string;
  readonly density: string;
  readonly engine: string;
  readonly state?: string;
}

interface PlaywrightPage {
  goto(
    url: string,
    options: { waitUntil: "load"; timeout: number },
  ): Promise<unknown>;
}

interface PlaywrightContext {
  newPage(): Promise<PlaywrightPage>;
}

interface PlaywrightBrowser {
  newContext(options: {
    viewport: { width: number; height: number };
  }): Promise<PlaywrightContext>;
  close(): Promise<void>;
}

interface BrowserType {
  launch(): Promise<PlaywrightBrowser>;
}

type CheckButtery = (
  page: PlaywrightPage,
  options: {
    readonly name: string;
    readonly viewports: readonly { width: number; height: number }[];
    readonly themes: readonly ("light" | "dark")[];
  },
) => Promise<readonly Reported[]>;

const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * `text` as a URL the check may open: http or https, on this machine, or at an origin listed in
 * `allowedOrigins`, so the check can't be pointed at the network.
 */
export function checkedUrl(
  text: string,
  allowedOrigins: readonly string[],
): URL {
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new CheckRequestError(
      `"${text}" isn't a URL. Fix: pass the address the app's dev server prints, such as "http://localhost:5173/settings".`,
    );
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new CheckRequestError(
      `${url.protocol} URLs can't be checked. Fix: pass an http address, such as "http://localhost:5173/settings".`,
    );
  }
  const listed = allowedOrigins.some((origin) => {
    try {
      return new URL(origin).origin === url.origin;
    } catch {
      return false;
    }
  });
  if (!LOOPBACK.has(url.hostname) && !listed) {
    throw new CheckRequestError(
      `${url.origin} isn't on this machine, and the check only opens local apps. Fix: run the app locally and pass its localhost address, or list the origin in BUTTERY_MCP_ALLOW_URLS.`,
    );
  }
  return url;
}

async function load(root: string, name: string): Promise<unknown> {
  const path = createRequire(join(root, "package.json")).resolve(name);
  return import(pathToFileURL(path).href);
}

function own(value: unknown, name: string): unknown {
  return (typeof value === "object" && value !== null) ||
    typeof value === "function"
    ? Reflect.get(value, name)
    : undefined;
}

/** `name` from a module, which a CommonJS one such as Playwright's has on its default export. */
function member(module: unknown, name: string): unknown {
  return own(module, name) ?? own(own(module, "default"), name);
}

/** The same violation found in several conditions, as one entry listing them. */
export function merged(reported: readonly Reported[]): MergedViolation[] {
  const byKey = new Map<
    string,
    { entry: MergedViolation; conditions: string[] }
  >();
  for (const violation of reported) {
    const key = `${violation.rule}|${violation.a}|${violation.b ?? ""}|${violation.state ?? ""}`;
    const condition = [
      violation.viewport,
      violation.theme,
      violation.density,
      violation.engine,
      ...(violation.state === undefined ? [] : [violation.state]),
    ].join(" ");
    const found = byKey.get(key);
    if (found) {
      if (!found.conditions.includes(condition))
        found.conditions.push(condition);
      continue;
    }
    const conditions = [condition];
    byKey.set(key, {
      entry: {
        rule: violation.rule,
        a: violation.a,
        b: violation.b ?? null,
        message: violation.message,
        fix: violation.fix,
        conditions,
      },
      conditions,
    });
  }
  return [...byKey.values()].map(({ entry }) => entry);
}

/**
 * Opens `request.url` in the project's Playwright and runs `@butteryui/test`'s `checkButtery` on it at each
 * width and theme, in comfortable density, returning each problem once with the conditions it showed in.
 */
export async function checkLayout(
  root: string | null,
  request: CheckRequest,
  allowedOrigins: readonly string[],
): Promise<CheckReport> {
  const url = checkedUrl(request.url, allowedOrigins);
  if (root === null) {
    throw new CheckRequestError(
      "No project was found, so there's no Playwright to check with. Fix: start the server in the app's folder or pass --project <dir>.",
    );
  }
  const engineName = request.engine ?? "chromium";
  const widths = request.viewports ?? [390, 1280];
  const themes = request.themes ?? ["light"];
  let engine: unknown;
  let checkButtery: unknown;
  try {
    engine = member(await load(root, "@playwright/test"), engineName);
    checkButtery = member(await load(root, "@butteryui/test"), "checkButtery");
  } catch (error) {
    const reason =
      error instanceof Error
        ? (error.message.split("\n")[0] ?? "")
        : String(error);
    throw new CheckRequestError(
      `buttery_check_layout runs @butteryui/test's checks in the project's Playwright, and loading them failed (${reason}). Fix: npm install --save-dev @playwright/test @butteryui/test, then npx playwright install ${engineName}.`,
    );
  }
  if (typeof checkButtery !== "function") {
    throw new CheckRequestError(
      "The project's @butteryui/test has no checkButtery. Fix: update it to 0.9.0 or later.",
    );
  }
  if (typeof engine !== "object" || engine === null) {
    throw new CheckRequestError(
      `The project's Playwright has no ${engineName}. Fix: npm install --save-dev @playwright/test.`,
    );
  }
  let browser: PlaywrightBrowser;
  try {
    browser = await (engine as BrowserType).launch();
  } catch {
    throw new CheckRequestError(
      `Playwright's ${engineName} isn't installed. Fix: run npx playwright install ${engineName} in ${root}.`,
    );
  }
  try {
    const first = widths[0] ?? 1280;
    // A page from its own context, which axe's accessibility check asks for.
    const context = await browser.newContext({
      viewport: { width: first, height: HEIGHTS[first] },
    });
    const page = await context.newPage();
    try {
      await page.goto(url.href, { waitUntil: "load", timeout: 30_000 });
    } catch {
      throw new CheckRequestError(
        `No app answered at ${url.href}. Fix: start it (npm run dev) and pass the address it prints.`,
      );
    }
    const reported = await (checkButtery as CheckButtery)(page, {
      name: url.pathname,
      viewports: widths.map((width) => ({ width, height: HEIGHTS[width] })),
      themes,
    });
    const violations = merged(reported);
    const byRule: Record<string, number> = {};
    for (const violation of violations) {
      byRule[violation.rule] = (byRule[violation.rule] ?? 0) + 1;
    }
    return {
      summary: {
        url: url.href,
        conditions: widths.length * themes.length,
        violations: violations.length,
        byRule,
      },
      violations: violations.slice(0, VIOLATION_LIMIT),
      truncated: violations.length > VIOLATION_LIMIT,
    };
  } finally {
    await browser.close();
  }
}
