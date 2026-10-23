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

/** The space between two boxes, along whichever axis they're apart on; negative when they overlap. */
async function gap(one: Locator, two: Locator): Promise<number> {
  const a = await one.boundingBox();
  const b = await two.boundingBox();
  if (!a || !b) throw new Error("Both have to be on the page.");
  return Math.max(
    b.y - (a.y + a.height),
    a.y - (b.y + b.height),
    b.x - (a.x + a.width),
    a.x - (b.x + b.width),
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
  await page.goto("/demos/roastery");
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

test("the delivery nudge waits for the overview to open by itself, so it never covers the orders page's New order", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, "true");
  }, ANNOUNCEMENT);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos/roastery/orders");
  const nudge = page.getByRole("dialog", {
    name: "2 customers asked about delivery",
  });
  const newOrder = pageRegion(page).getByRole("button", {
    name: "New order",
  });
  await expect(newOrder).toBeVisible();
  await page.waitForTimeout(600);
  await expect(nudge).toBeHidden();
  await page
    .getByRole("navigation", { name: "Halfmoon Roastery" })
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await expect(nudge).toBeVisible();
  for (const text of [
    page.getByRole("heading", { level: 1, name: "Overview" }),
    page.getByText("How the roastery is doing, and what needs you today."),
    page.getByRole("button", { name: "New order", exact: true }),
  ]) {
    expect(await overlap(nudge, text)).toBe(false);
  }
});

test("at 1280 the orders table shows every column, its row actions too, without scrolling sideways", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos/roastery/orders");
  const table = page.locator('[data-bt="DataTable"]');
  const actions = table
    .getByRole("button", { name: /^Actions for ord_/ })
    .first();
  await expect(actions).toBeVisible();
  const scroll = table.locator('> [data-bt-part="scroll"]');
  const box = await actions.boundingBox();
  const area = await scroll.boundingBox();
  if (!box || !area)
    throw new Error("The table and its actions are on the page.");
  expect(box.x + box.width).toBeLessThanOrEqual(area.x + area.width + 0.5);
  expect(
    await scroll.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeLessThanOrEqual(0);
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
    await page.goto("/demos/roastery/orders");
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
  await page.setViewportSize({ width: 1440, height: 640 });
  await page.goto("/demos/roastery");
  await page.locator("h1").first().waitFor();
  const scrolled = async (): Promise<void> => {
    await pageRegion(page).evaluate((region) => {
      region.scrollTop = region.scrollHeight;
    });
    expect(
      await pageRegion(page).evaluate((region) => region.scrollTop),
    ).toBeGreaterThan(0);
  };
  const atTop = async (title: RegExp | string): Promise<void> => {
    await expect(page.locator("h1").first()).toHaveText(title);
    expect(await pageRegion(page).evaluate((region) => region.scrollTop)).toBe(
      0,
    );
  };
  await scrolled();
  await page.getByRole("link", { name: "Customers", exact: true }).click();
  await atTop(/^Customers/);
  const first = page
    .locator('[data-bt="DataTable"] [data-bt-part="data-table-link"]')
    .first();
  const name = (await first.textContent()) ?? "";
  await first.click();
  await atTop(name);
  await expect(page.getByRole("tablist", { name: "Customer" })).toBeVisible();
  await scrolled();
  await page.getByRole("link", { name: "Payouts", exact: true }).click();
  await atTop(/^Payouts/);
  await scrolled();
  await page.getByRole("link", { name: "Roast plan", exact: true }).click();
  await atTop(/^Roast plan/);
  await scrolled();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await atTop("Overview");
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
    await page.goto("/demos/roastery/orders");
    await page.locator("h1").first().waitFor();
    const more = page.getByRole("button", {
      name: "More page actions",
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
    const toast = page.locator('[data-bt-part="toast"]').filter({
      hasText: /^Exported \d+ orders to orders\.csv/,
    });
    await expect(toast).toBeVisible();
    await page.getByRole("region", { name: "Notifications (F8)" }).hover();
    const guide = page.locator('[data-bt="SetupGuide"]');
    await expect(guide).toBeVisible();
    expect(await gap(toast, guide)).toBeGreaterThanOrEqual(7.5);
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

test("a view saved from another view keeps that view's orders and adds its filters", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery/orders");
  await page.locator("h1").first().waitFor();
  const views = page.getByRole("radiogroup", { name: "Order views" });
  await views.getByRole("radio", { name: "Unpaid", exact: true }).click();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: /^Channel/ }).click();
  await page
    .getByRole("radiogroup", { name: "Channel" })
    .getByRole("radio", { name: "Web", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "More views" }).click();
  await page.getByRole("menuitem", { name: "Save as a new view" }).click();
  await expect(
    views.getByRole("radio", { name: "Web", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  const statuses = await page
    .locator('[data-bt="DataTable"] [data-bt="StatusBadge"]')
    .allTextContents();
  expect(statuses.length).toBeGreaterThan(0);
  expect(new Set(statuses)).toEqual(new Set(["Unpaid"]));
});

test("an export of one order says one order", async ({ page }) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery/orders");
  await page.locator("h1").first().waitFor();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  const id =
    (await page
      .locator('[data-bt="DataTable"] [data-bt-part="id"]')
      .first()
      .textContent()) ?? "";
  await page.getByRole("searchbox", { name: "Search orders" }).fill(id);
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await expect(
    page.locator('[data-bt-part="toast"]').filter({
      hasText: "Exported 1 order to orders.csv",
    }),
  ).toBeVisible();
});

test("inviting someone twice lists them once", async ({ page }) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery/settings/team");
  await page.locator("h1").first().waitFor();
  for (const address of ["june@example.com", "June@example.com"]) {
    await page.getByRole("button", { name: "Invite someone" }).click();
    await page.getByLabel("Email address").fill(address);
    await page.getByRole("button", { name: "Send the invite" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await expect(page.getByText(/^june@example\.com$/i)).toHaveCount(1);
  await expect(
    page.locator('[data-bt-part="toast"]').filter({
      hasText: "is already invited",
    }),
  ).toBeVisible();
});

test("switching workspace says what happened", async ({ page }) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery");
  await page.locator("h1").first().waitFor();
  await page
    .getByRole("button", { name: /^Workspace: Halfmoon Roastery/ })
    .click();
  await page.getByRole("menuitem", { name: "Switch workspace" }).click();
  await page.getByRole("menuitemradio", { name: /Halfmoon Café/ }).click();
  await expect(
    page.locator('[data-bt-part="toast"]').filter({
      hasText: "Halfmoon Café has no orders of its own in this demo.",
    }),
  ).toBeVisible();
});

test("the search finds a customer by name and opens their page", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery");
  await page.locator("h1").first().waitFor();
  await page.keyboard.press("/");
  const search = page.getByRole("combobox", { name: "Search", exact: true });
  await expect(search).toBeFocused();
  await expect(
    search.locator("xpath=ancestor::*[@data-bt='CommandSearch']"),
  ).toHaveAttribute("data-focused", "");
  const name = "The Reading Room";
  await page.keyboard.type("reading room");
  const option = page.getByRole("option", { name: new RegExp(`^${name}`) });
  await expect(option).toBeVisible();
  const rows = await page.getByRole("option").count();
  for (let step = 0; step < rows; step += 1) {
    await page.keyboard.press("ArrowDown");
    if ((await option.getAttribute("aria-selected")) === "true") break;
  }
  await expect(option).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Enter");
  await expect(page.locator("h1").first()).toHaveText(name);
  await expect(search).toHaveValue("");
});

test("a finished filter becomes a chip, and Enter shows every result for it", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery");
  await page.locator("h1").first().waitFor();
  await page.getByRole("combobox", { name: "Search", exact: true }).click();
  await page.keyboard.type("stat");
  await page.keyboard.press("Tab");
  await page.keyboard.type("shipped ");
  await expect(page.locator('[data-bt-part="chip"]')).toHaveText(
    "status:shipped",
  );
  await expect(
    page.getByRole("group", { name: "Orders" }).getByRole("option").first(),
  ).toContainText("shipped");
  await page.keyboard.press("Enter");
  await expect(page.locator("h1").first()).toHaveText(
    'Results for "status:shipped"',
  );
  await expect(page.getByRole("region", { name: "Orders" })).toBeVisible();
});

test("a results page reads a filter typed last, and pages its rows", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery/search?q=status%3Arefunded");
  await expect(page.locator("h1").first()).toHaveText(
    'Results for "status:refunded"',
  );
  const orders = page.getByRole("region", { name: "Orders" });
  await expect(orders.getByRole("link")).toHaveCount(50);
  await orders.getByRole("button", { name: "Show 50 more" }).click();
  await expect(orders.getByRole("link")).toHaveCount(100);
  await expect(orders.getByRole("link").nth(50)).toBeFocused();
});

test("help docks beside the page on a wide screen, and covers it as a sheet on a narrow one", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery");
  await page.locator("h1").first().waitFor();
  const column = page.locator('[data-bt="AppShell"] > [data-bt-part="column"]');
  const before = await column.boundingBox();
  await page.getByRole("button", { name: "Help", exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Help" });
  await expect(panel).toBeVisible();
  const after = await column.boundingBox();
  expect((before?.width ?? 0) - (after?.width ?? 0)).toBe(360);
  const panelBox = await panel.boundingBox();
  await expect(async () => {
    const guide = await page.locator('[data-bt="SetupGuide"]').boundingBox();
    expect((guide?.x ?? 0) + (guide?.width ?? 0)).toBeLessThanOrEqual(
      (panelBox?.x ?? 0) - 24,
    );
  }).toPass();
  await expect(
    page.getByRole("textbox", { name: "Ask support" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.getByRole("button", { name: "Help", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Help" })).toBeVisible();
});

test("Turn on alerts leads to the notifications setting", async ({ page }) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery");
  await page.locator("h1").first().waitFor();
  await page.getByRole("link", { name: "Turn on alerts" }).click();
  await expect(page.locator("h1").first()).toHaveText("Notifications");
  await page
    .getByRole("button", { name: "Turn on: Green coffee running low" })
    .click();
  await expect(
    page.getByText("On. Emailed when a lot drops under 200 kg."),
  ).toBeVisible();
});

test("trying a plan spells out the trial, then moves the shop onto it", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/roastery/settings/plans");
  await page.locator("h1").first().waitFor();
  await page.getByRole("button", { name: "Try Roaster" }).click();
  const dialog = page.getByRole("dialog", { name: "Try Roaster" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Start the trial" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(/^You're on Roaster\./)).toBeVisible();
});
