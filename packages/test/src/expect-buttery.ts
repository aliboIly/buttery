import { writeFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { createLayoutToolkit, layoutCheckTokens } from "@buttery/core/layout";
import type {
  ButteryRule,
  LayoutCheckOptions,
  LayoutRule,
  LayoutViolation,
  MovedOptions,
} from "@buttery/core/layout";
import { formatViolations } from "./format.ts";
import type { ReportedViolation } from "./format.ts";
import type { ButteryMatrix, ButteryViewport } from "./matrix.ts";

const TOOLKIT = "__butteryLayoutToolkit";

const LAYOUT_RULES: readonly LayoutRule[] = [
  "overlap",
  "overflow",
  "clipping",
  "scale",
  "target-size",
  "viewport-fit",
  "layering",
];

/** A scripted interaction for the stability check. */
export interface ButteryInteraction {
  /** Shown in the report, such as "Open the export menu". */
  readonly name: string;
  readonly run: (page: Page) => Promise<void>;
  /** Selectors of elements that are meant to move: the target and whatever it animates. */
  readonly allowMove?: readonly string[] | undefined;
}

export interface ExpectButteryOptions extends Partial<ButteryMatrix> {
  /** Shown in reports, such as the route. Defaults to the page's path and hash. */
  readonly name?: string | undefined;
  /** Rules to run. Defaults to all of them. */
  readonly rules?: readonly ButteryRule[] | undefined;
  /** Interactions to run once, at the first viewport, theme and density, for the stability check. */
  readonly interactions?: readonly ButteryInteraction[] | undefined;
  /** How long to wait for buttery to report settled, in ms. Defaults to 5000. */
  readonly settleTimeout?: number | undefined;
}

function isViolation(value: unknown): value is LayoutViolation {
  return (
    typeof value === "object" &&
    value !== null &&
    "rule" in value &&
    typeof value.rule === "string" &&
    "a" in value &&
    typeof value.a === "string" &&
    "message" in value &&
    typeof value.message === "string" &&
    "fix" in value &&
    typeof value.fix === "string"
  );
}

function violationsFrom(value: unknown): LayoutViolation[] {
  if (!Array.isArray(value) || !value.every(isViolation)) {
    throw new Error(
      "[buttery:expectButtery] the layout checker returned something unexpected.",
    );
  }
  return value;
}

async function ensureToolkit(page: Page): Promise<void> {
  const installed: unknown = await page.evaluate(
    `typeof window.${TOOLKIT} === "object"`,
  );
  if (installed === true) return;
  await page.evaluate(
    `window.${TOOLKIT} = (${createLayoutToolkit.toString()})();`,
  );
}

async function check(
  page: Page,
  options: LayoutCheckOptions,
): Promise<LayoutViolation[]> {
  await ensureToolkit(page);
  return violationsFrom(
    await page.evaluate(`window.${TOOLKIT}.check(${JSON.stringify(options)})`),
  );
}

async function snapshot(page: Page): Promise<void> {
  await ensureToolkit(page);
  await page.evaluate(`window.${TOOLKIT}.snapshot()`);
}

async function moved(
  page: Page,
  options: MovedOptions,
): Promise<LayoutViolation[]> {
  await ensureToolkit(page);
  return violationsFrom(
    await page.evaluate(`window.${TOOLKIT}.moved(${JSON.stringify(options)})`),
  );
}

async function nextFrames(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      }),
  );
}

async function waitForSettled(page: Page, timeout: number): Promise<void> {
  // Style changes from setViewportSize and emulateMedia start their transitions a frame later.
  await nextFrames(page);
  try {
    await page.waitForFunction(
      () => {
        if (!document.documentElement.hasAttribute("data-bt-settled"))
          return false;
        return document.getAnimations().every((animation) => {
          if (animation.playState !== "running") return true;
          return (
            animation.effect?.getTiming().iterations ===
            Number.POSITIVE_INFINITY
          );
        });
      },
      undefined,
      { timeout, polling: "raf" },
    );
  } catch {
    throw new Error(
      `[buttery:expectButtery] buttery didn't report settled within ${String(timeout)}ms. Fix: wrap the app in <ButteryProvider>, and make sure every animation finishes (ambient loops belong in <Loop>).`,
    );
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
}

async function accessibility(page: Page): Promise<LayoutViolation[]> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude('[data-bt-layer="dev"]')
    .analyze();
  return results.violations
    .filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    )
    .flatMap((violation) =>
      violation.nodes.map((node) => ({
        rule: "accessibility" as const,
        a: node.target.map(String).join(" "),
        message: `${violation.help} (${violation.id})`,
        fix: `${node.failureSummary ?? violation.help} See ${violation.helpUrl}`,
      })),
    );
}

async function annotate(
  page: Page,
  violations: readonly LayoutViolation[],
): Promise<Buffer> {
  await page.evaluate(
    (marks) => {
      const overlay = document.createElement("div");
      overlay.setAttribute("data-bt-annotations", "");
      overlay.style.cssText =
        "position: absolute; inset: 0; pointer-events: none; z-index: var(--bt-z-dev);";
      for (const { a, rule } of marks) {
        const target = document.querySelector(a);
        if (!target) continue;
        const rect = target.getBoundingClientRect();
        const box = document.createElement("div");
        box.style.cssText = `position: absolute; left: ${String(rect.left + window.scrollX)}px; top: ${String(rect.top + window.scrollY)}px; width: ${String(rect.width)}px; height: ${String(rect.height)}px; outline: 2px solid var(--bt-traffic-red);`;
        const label = document.createElement("span");
        label.textContent = rule;
        label.style.cssText =
          "position: absolute; bottom: 100%; left: 0; padding: 1px 4px; background: var(--bt-traffic-red); color: var(--bt-on-primary); font: 11px/14px var(--bt-font-mono);";
        box.append(label);
        overlay.append(box);
      }
      document.body.append(overlay);
    },
    violations.map(({ a, rule }) => ({ a, rule })),
  );
  const image = await page.screenshot({ fullPage: true });
  await page.evaluate(() => {
    document.querySelector("[data-bt-annotations]")?.remove();
  });
  return image;
}

function currentTest(): ReturnType<typeof test.info> | undefined {
  try {
    return test.info();
  } catch {
    return undefined;
  }
}

function label(viewport: ButteryViewport): string {
  return `${String(viewport.width)}x${String(viewport.height)}`;
}

/**
 * Checks a page against buttery's layout rules (LAYOUT_RULES §5) in every requested viewport, theme and
 * density, and fails with a report of every problem and how to fix it. Static checks emulate reduced
 * motion and wait for buttery to report settled. Inside a Playwright test, the report is also attached
 * as JSON (`buttery-violations.json`) with annotated screenshots.
 *
 * @example
 * test("the settings page is buttery", async ({ page }) => {
 *   await page.goto("/settings");
 *   await expectButtery(page, { ...quickMatrix, name: "settings" });
 * });
 */
export async function expectButtery(
  page: Page,
  options: ExpectButteryOptions = {},
): Promise<readonly ReportedViolation[]> {
  const start = page.viewportSize() ?? { width: 1280, height: 800 };
  const viewports = options.viewports ?? [start];
  const themes = options.themes ?? ["light"];
  const densities = options.densities ?? ["comfortable"];
  const rules = new Set<ButteryRule>(
    options.rules ?? [...LAYOUT_RULES, "accessibility", "stability"],
  );
  const layoutRules = LAYOUT_RULES.filter((rule) => rules.has(rule));
  const timeout = options.settleTimeout ?? 5000;
  const url = new URL(page.url());
  const name = options.name ?? (`${url.pathname}${url.hash}` || "/");
  const engine = page.context().browser()?.browserType().name() ?? "unknown";
  const tokens = layoutCheckTokens();
  const info = currentTest();
  const reported: ReportedViolation[] = [];

  const setConditions = async (
    viewport: ButteryViewport,
    theme: (typeof themes)[number],
    density: (typeof densities)[number],
  ): Promise<void> => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.evaluate((value) => {
      document.documentElement.setAttribute("data-bt-density", value);
    }, density);
    await waitForSettled(page, timeout);
  };

  const record = async (
    found: readonly LayoutViolation[],
    conditions: { viewport: ButteryViewport; theme: string; density: string },
    suffix = "",
  ): Promise<void> => {
    if (found.length === 0) return;
    const context = {
      page: name,
      viewport: label(conditions.viewport),
      theme: conditions.theme,
      density: conditions.density,
      engine,
    };
    reported.push(...found.map((violation) => ({ ...violation, ...context })));
    if (info) {
      const file = `buttery-${context.viewport}-${context.theme}-${context.density}${suffix}.png`;
      const image = await annotate(page, found);
      writeFileSync(info.outputPath(file), image);
      await info.attach(file, { body: image, contentType: "image/png" });
    }
  };

  for (const viewport of viewports) {
    for (const theme of themes) {
      for (const density of densities) {
        await setConditions(viewport, theme, density);
        const found =
          layoutRules.length > 0
            ? await check(page, { tokens, rules: layoutRules })
            : [];
        if (rules.has("accessibility"))
          found.push(...(await accessibility(page)));
        await record(found, { viewport, theme, density });
      }
    }
  }

  const [firstViewport] = viewports;
  const [firstTheme] = themes;
  const [firstDensity] = densities;
  if (
    rules.has("stability") &&
    options.interactions?.length &&
    firstViewport &&
    firstTheme &&
    firstDensity
  ) {
    await setConditions(firstViewport, firstTheme, firstDensity);
    for (const interaction of options.interactions) {
      const allow = interaction.allowMove ?? [];
      await snapshot(page);
      await interaction.run(page);
      await waitForSettled(page, timeout);
      const shifted = await moved(page, {
        allow,
        during: `after ${interaction.name}`,
      });
      await snapshot(page);
      await page.waitForTimeout(150);
      shifted.push(
        ...(await moved(page, {
          allow,
          during: "after buttery reported settled",
        })),
      );
      await record(
        shifted,
        { viewport: firstViewport, theme: firstTheme, density: firstDensity },
        `-stability-${interaction.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      );
    }
  }

  await page.setViewportSize(start);
  await page.emulateMedia({ colorScheme: null, reducedMotion: null });

  if (info) {
    writeFileSync(
      info.outputPath("buttery-violations.json"),
      JSON.stringify(reported, null, 2),
    );
    if (reported.length > 0) {
      await info.attach("buttery-violations.json", {
        body: JSON.stringify(reported, null, 2),
        contentType: "application/json",
      });
    }
  }
  if (reported.length > 0) throw new Error(formatViolations(reported));
  return reported;
}
