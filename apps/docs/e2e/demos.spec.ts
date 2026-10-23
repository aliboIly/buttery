import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { expectButtery, fullMatrix, quickMatrix } from "@butteryui/test";
import { demoPages } from "../src/routes.ts";

const matrix =
  process.env["BUTTERY_MATRIX"] === "full" ? fullMatrix : quickMatrix;

/** Marks the first-visit tour, announcement and nudge as seen, as they are for anyone coming back. */
async function returningVisitor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      "buttery:announcement:roastery-roast-planning",
      "true",
    );
    localStorage.setItem("buttery:nudge:roastery-delivery-questions", "true");
  });
}

function pill(page: Page): Locator {
  return page.getByRole("group", { name: "Demo controls" });
}

/** Whether two boxes share more than a pixel each way. */
async function overlap(one: Locator, two: Locator): Promise<boolean> {
  const a = await one.boundingBox();
  const b = await two.boundingBox();
  if (!a || !b) return false;
  return (
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 &&
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1
  );
}

test("the demos page shows each demo with its picture, what it uses and the command for its template", async ({
  page,
}) => {
  await page.goto("/demos");
  await expect(
    page.getByRole("heading", { level: 1, name: "Demos" }),
  ).toBeVisible();
  for (const demo of demoPages) {
    const card = page.getByRole("region", { name: demo.title, exact: true });
    await expect(card.getByText(demo.description)).toBeVisible();
    const picture = card.getByRole("img", {
      name: `${demo.title} as it opens`,
    });
    await picture.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        picture.evaluate((image) =>
          image instanceof HTMLImageElement ? image.naturalWidth : 0,
        ),
      )
      .toBe(960);
    await expect(card.getByRole("link", { name: demo.uses[0] })).toBeVisible();
    await expect(
      card.getByRole("link", { name: "Open demo", exact: true }),
    ).toHaveAttribute("href", `/demos/${demo.route}`);
    await expect(
      card.getByRole("link", { name: "View source", exact: true }),
    ).toHaveAttribute("href", new RegExp(`/apps/demos/${demo.route}$`));
    await expect(
      card.getByText(`pnpm new-app my-app --template ${demo.template}`),
    ).toBeVisible();
  }
});

test("Open demo shows the demo without the docs' chrome, and the pill's Docs comes back", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos");
  await page
    .getByRole("region", { name: "Halfmoon Roastery", exact: true })
    .getByRole("link", { name: "Open demo", exact: true })
    .click();
  await expect(page).toHaveURL(/\/demos\/roastery$/);
  await expect(page.locator("h1").first()).toHaveText("Overview");
  await expect(page.locator(".docs-shell")).toHaveCount(0);
  await pill(page).getByRole("link", { name: "Docs" }).click();
  await expect(page).toHaveURL(/\/demos$/);
  await expect(page.locator(".docs-shell")).toHaveCount(1);
});

test("a deep link opens the demo's own page, and its links stay under /demos", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos/roastery/settings/notifications");
  await expect(page.locator("h1").first()).toHaveText("Notifications");
  await expect(
    page.getByRole("link", { name: "Orders", exact: true }),
  ).toHaveAttribute("href", "/demos/roastery/orders");
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page).toHaveURL(/\/demos\/roastery\/orders$/);
  await expect(page.locator("h1").first()).toHaveText(/^Orders/);
});

test("the pill's theme stays on as the demo moves between its pages, a menu's navigation included", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos/roastery/orders");
  await pill(page)
    .getByRole("button", { name: "Use the dark theme", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-bt-theme", "dark");
  await page.getByRole("link", { name: "Customers", exact: true }).click();
  await expect(page).toHaveURL(/\/demos\/roastery\/customers\?theme=dark$/);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page).toHaveURL(/\/demos\/roastery\/settings\?theme=dark$/);
  await expect(page.locator("html")).toHaveAttribute("data-bt-theme", "dark");
});

test("the pill folds away to one button and stays folded, and its source link names the demo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos/deckhand");
  await expect(
    pill(page).getByRole("link", { name: "View source", exact: true }),
  ).toHaveAttribute("href", /\/apps\/demos\/deckhand$/);
  await pill(page)
    .getByRole("button", { name: "Hide the demo controls", exact: true })
    .click();
  const show = pill(page).getByRole("button", {
    name: "Show the demo controls",
    exact: true,
  });
  await expect(show).toBeVisible();
  await expect(pill(page).getByRole("link")).toHaveCount(0);
  await page.reload();
  await expect(show).toBeVisible();
  await show.click();
  await expect(pill(page).getByRole("link", { name: "Docs" })).toBeVisible();
});

test("on a phone the pill starts folded, and stays unfolded once someone unfolds it", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demos/roastery/orders");
  const show = pill(page).getByRole("button", {
    name: "Show the demo controls",
    exact: true,
  });
  await expect(show).toBeVisible();
  await expect(pill(page).getByRole("link")).toHaveCount(0);
  await show.click();
  await expect(pill(page).getByRole("link", { name: "Docs" })).toBeVisible();
  await page.reload();
  await expect(pill(page).getByRole("link", { name: "Docs" })).toBeVisible();
});

test("Reset demo forgets what the demo saved and nothing else, and it opens as on a first visit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos/roastery/settings/pickup");
  await page.evaluate(() => {
    localStorage.setItem("roastery:pickup", "true");
    localStorage.setItem(
      "buttery:announcement:roastery-roast-planning",
      "true",
    );
    localStorage.setItem("buttery:nudge:roastery-delivery-questions", "true");
    localStorage.setItem("someone-else", "kept");
  });
  await page.reload();
  await expect(page.locator("h1").first()).toHaveText("Pickup");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await pill(page)
    .getByRole("button", { name: "Reset demo", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Roasts plan themselves now" }),
  ).toBeVisible();
  const stored = await page.evaluate(() => ({
    pickup: localStorage.getItem("roastery:pickup"),
    other: localStorage.getItem("someone-else"),
    tour: localStorage.getItem("buttery:onboarding:deckhand"),
  }));
  expect(stored).toEqual({ pickup: null, other: "kept", tour: "done" });
});

/** Where each demo's own controls are that never scroll, which the pill must keep clear of. */
const CHROME: Readonly<Record<(typeof demoPages)[number]["route"], string>> = {
  roastery: '[data-bt="Sidebar"], [data-bt="TopBar"], [data-bt="SetupGuide"]',
  "roastery-shop": '[data-bt="NavBar"], [data-bt="SubNav"]',
  deckhand: [
    '[data-bt="HeaderBar"]',
    '[data-bt="AppShell"] > [data-bt-part="inspector"]',
    '[data-bt="AppShell"] > [data-bt-part="sheet-bar"]',
    '[data-testid="slide-strip"]',
  ].join(", "),
};

for (const demo of demoPages) {
  for (const [width, height] of [
    [390, 844],
    [960, 640],
    [1440, 900],
  ] as const) {
    test(`the pill keeps clear of ${demo.route}'s own controls at ${String(width)}`, async ({
      page,
    }) => {
      await returningVisitor(page);
      await page.setViewportSize({ width, height });
      await page.goto(`/demos/${demo.route}`);
      await expect(pill(page)).toBeVisible();
      await page.waitForTimeout(400);
      const controls = page
        .locator(CHROME[demo.route])
        .locator('a[href], button, input, [role="combobox"]');
      for (const control of await controls.all()) {
        if (!(await control.isVisible())) continue;
        expect(
          await overlap(pill(page), control),
          await control.evaluate((element) => element.outerHTML.slice(0, 80)),
        ).toBe(false);
      }
    });
  }
}

test("the marketing demo's last line scrolls clear of the pill", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demos/roastery-shop");
  await expect(pill(page)).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  const legal = page.getByText("© 2026 Halfmoon Roastery. A buttery demo.");
  await expect(legal).toBeInViewport();
  expect(await overlap(pill(page), legal)).toBe(false);
});

test("the demos page and a demo with its pill folded are buttery", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await returningVisitor(page);
  const [first] = matrix.viewports;
  if (first) await page.setViewportSize(first);
  await page.goto("/demos");
  await expectButtery(page, { ...matrix, name: "demos page" });
  await page.goto("/demos/roastery");
  await expectButtery(page, {
    ...matrix,
    name: "roastery with the pill",
    interactions: [
      {
        name: "fold the pill away, unless it starts folded on a phone",
        allowMove: ['[data-testid="demo-pill"]'],
        run: async (target: Page) => {
          const hide = pill(target).getByRole("button", {
            name: "Hide the demo controls",
          });
          if (await hide.isVisible()) await hide.click();
        },
      },
    ],
  });
});
