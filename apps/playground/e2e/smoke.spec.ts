import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { componentRoutes } from "./routes.ts";

const foundations = [
  { route: "tokens", landmark: "Text roles" },
  { route: "surfaces", landmark: "Inspector" },
  { route: "levels", landmark: "dark surfaces" },
  { route: "palettes", landmark: "Gradients" },
  { route: "text-stacks", landmark: "Make it yours" },
] as const;

/**
 * Collects console errors, page errors, buttery's development warnings and ResizeObserver loops, which
 * browsers report as an error event rather than an exception.
 */
async function watchConsole(page: Page): Promise<string[]> {
  const problems: string[] = [];
  await page.addInitScript(() => {
    window.addEventListener("error", (event) => {
      if (event.message.includes("ResizeObserver loop")) {
        console.error(event.message);
      }
    });
  });
  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error" || text.startsWith("[buttery:"))
      problems.push(text);
  });
  page.on("pageerror", (error) => problems.push(error.message));
  return problems;
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(1200);
}

for (const { route, landmark } of foundations) {
  test(`renders the ${route} page with the bundled font and no console problems`, async ({
    page,
  }) => {
    const problems = await watchConsole(page);
    await page.goto(`/?theme=light#/${route}`);
    await expect(
      page.getByText(landmark).or(page.getByLabel(landmark)).first(),
    ).toBeVisible();
    const interLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('16px "Inter Variable"');
    });
    expect(interLoaded).toBe(true);
    await settle(page);
    expect(problems).toEqual([]);
  });
}

for (const { route, name } of componentRoutes) {
  test(`renders the ${name} page with no console problems`, async ({
    page,
  }) => {
    const problems = await watchConsole(page);
    await page.goto(`/#/${route}`);
    await expect(
      page.getByRole("heading", { level: 1, name, exact: true }),
    ).toBeVisible();
    await settle(page);
    expect(problems).toEqual([]);
  });
}

const demos = [
  { route: "card-studio", ready: '[data-testid="card-studio"]' },
  { route: "card-studio-site", ready: '[data-bt="NavBar"]' },
  ...[
    "roastery",
    "roastery/orders",
    "roastery/customers",
    "roastery/subscriptions",
    "roastery/payouts",
    "roastery/roasts",
    "roastery/stock",
    "roastery/wholesale",
    "roastery/wholesale/prices",
    "roastery/settings",
    "roastery/settings/pickup",
    "roastery/settings/team",
    "roastery/settings/profile",
    "roastery/settings/notifications",
    "roastery/settings/team-notifications",
    "roastery/settings/plans",
    "roastery/search?q=decaf",
  ].map((route) => ({ route, ready: '[data-testid="roastery"] h1' })),
] as const;

for (const { route, ready } of demos) {
  test(`renders the ${route} demo with no console problems`, async ({
    page,
  }) => {
    const problems = await watchConsole(page);
    await page.goto(`/#/${route}`);
    await expect(page.locator(ready).first()).toBeVisible();
    await settle(page);
    expect(problems).toEqual([]);
  });
}
