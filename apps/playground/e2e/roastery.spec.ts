import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { expectButtery } from "@buttery/test";

const ANNOUNCEMENT = "buttery:announcement:roastery-roast-planning";
const NUDGE = "buttery:nudge:roastery-delivery-questions";

/** Marks the first-visit announcement and nudge as seen, as they are for anyone coming back. */
async function returningVisitor(page: Page): Promise<void> {
  await page.addInitScript(
    (keys) => {
      for (const key of keys) localStorage.setItem(key, "true");
    },
    [ANNOUNCEMENT, NUDGE],
  );
}

function pageRegion(page: Page): Locator {
  return page.locator(
    '[data-bt="AppShell"] > [data-bt-part="column"] > [data-bt-part="page"]',
  );
}

async function overlap(one: Locator, two: Locator): Promise<boolean> {
  const a = await one.boundingBox();
  const b = await two.boundingBox();
  if (!a || !b) throw new Error("Both have to be on the page.");
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

test("a first visit opens What's new by itself, then the delivery nudge once it's closed, and neither comes back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/roastery");
  const announcement = page.getByRole("dialog", {
    name: "Roasts plan themselves now",
  });
  await expect(announcement).toBeVisible();
  const nudge = page.getByRole("dialog", {
    name: "2 customers asked about delivery",
  });
  await expect(nudge).toBeHidden();
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await expect(announcement).toBeHidden();
  await expect(nudge).toBeVisible();
  await nudge.getByRole("button", { name: "Later", exact: true }).click();
  await expect(nudge).toBeHidden();
  await page.reload();
  await page.locator("h1").first().waitFor();
  await page.waitForTimeout(600);
  await expect(announcement).toBeHidden();
  await expect(nudge).toBeHidden();
});

test("the sidebar is a sheet on a phone, a rail on a small laptop and full on a wide screen", async ({
  page,
}) => {
  await returningVisitor(page);
  const shell = page.locator('[data-bt="AppShell"]');
  for (const [width, height, mode] of [
    [390, 844, "sheet"],
    [768, 1024, "rail"],
    [960, 640, "rail"],
    [1280, 800, "full"],
    [1728, 1117, "full"],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/#/roastery/orders");
    await expect(shell, `at ${String(width)}`).toHaveAttribute(
      "data-sidebar",
      mode,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  const sheet = page.getByRole("dialog", { name: "Halfmoon Roastery" });
  await sheet.getByRole("link", { name: "Customers", exact: true }).click();
  await expect(sheet).toBeHidden();
  await expect(page.locator("h1").first()).toHaveText(/^Customers/);
});

test("a customer's name in the list opens their page, and each page starts at the top", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/roastery");
  await page.locator("h1").first().waitFor();
  await pageRegion(page).evaluate((region) => {
    region.scrollTop = region.scrollHeight;
  });
  await page.getByRole("link", { name: "Customers", exact: true }).click();
  await expect(page.locator("h1").first()).toHaveText(/^Customers/);
  const first = page
    .locator('[data-bt="DataTable"] [data-bt-part="link"]')
    .first();
  const name = (await first.textContent()) ?? "";
  await first.click();
  await expect(page.locator("h1").first()).toHaveText(name);
  await expect(page.getByRole("tablist", { name: "Customer" })).toBeVisible();
  await page.getByRole("link", { name: "Payouts", exact: true }).click();
  await pageRegion(page).evaluate((region) => {
    region.scrollTop = region.scrollHeight;
  });
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page.locator("h1").first()).toHaveText("Overview");
  expect(await pageRegion(page).evaluate((region) => region.scrollTop)).toBe(0);
});

for (const [width, height] of [
  [390, 844],
  [1280, 800],
] as const) {
  test(`a toast and the setup guide share the bottom of the window at ${String(width)} without touching`, async ({
    page,
  }) => {
    await returningVisitor(page);
    await page.setViewportSize({ width, height });
    await page.goto("/#/roastery/orders");
    await page.locator("h1").first().waitFor();
    const more = page.getByRole("button", {
      name: "More actions",
      exact: true,
    });
    const exportButton = page.getByRole("button", {
      name: "Export",
      exact: true,
    });
    if (await exportButton.isVisible()) await exportButton.click();
    else {
      await more.first().click();
      await page.getByRole("menuitem", { name: "Export", exact: true }).click();
    }
    const toast = page.getByText(/^Exported \d+ orders to orders\.csv$/);
    await expect(toast).toBeVisible();
    await page.getByRole("region", { name: "Notifications (F8)" }).hover();
    const guide = page.locator('[data-bt="SetupGuide"]');
    await expect(guide).toBeVisible();
    expect(await overlap(toast, guide)).toBe(false);
    const pagination = page.locator('[data-bt-part="pagination"]');
    expect(await overlap(guide, pagination)).toBe(false);
    expect(await overlap(toast, pagination)).toBe(false);
    await expectButtery(page, {
      name: `roastery orders with a toast at ${String(width)}`,
      viewports: [{ width, height }],
      themes: ["light"],
      densities: ["comfortable"],
    });
  });
}
