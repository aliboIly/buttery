import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/** The bar's bag button: beside the actions, or beside the brand once the bar folds. */
function bagButton(page: Page): Locator {
  return page.getByRole("button", { name: /^Bag, / });
}

test("opens on its own with the bundled font and no console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Coffee roasted the morning it ships.",
  );
  const interLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px "Inter Variable"');
  });
  expect(interLoaded).toBe(true);
  expect(errors).toEqual([]);
});

test("adding a coffee updates the bag's count and the bag, which a reload keeps", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const bag = bagButton(page);
  await expect(bag).toHaveAccessibleName("Bag, 0 bags");

  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(bag).toHaveAccessibleName("Bag, 1 bag");
  await expect(
    page.getByText("Added Guji, 12 oz.", { exact: true }),
  ).toBeVisible();

  await bag.click();
  const dialog = page.getByRole("dialog", { name: "Your bag" });
  await expect(dialog.getByText("Guji, 12 oz", { exact: true })).toBeVisible();
  await dialog
    .getByRole("button", { name: "One bag more of Guji, 12 oz" })
    .click();
  await expect(
    dialog.getByText("2 bags, roasted the morning after you order.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Add $2.00 more for free shipping.", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(bag).toHaveAccessibleName("Bag, 2 bags");

  await page.reload();
  await expect(bag).toHaveAccessibleName("Bag, 2 bags");
});

test("the bag checks out in place and starts again empty", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await bagButton(page).click();
  await page.getByRole("button", { name: "Check out" }).click();
  const checkout = page.getByRole("dialog", { name: "Check out" });
  await checkout.getByRole("button", { name: "Place order" }).click();
  await expect(
    checkout.getByText(
      "Enter your email address, so we can send your receipt.",
      { exact: true },
    ),
  ).toBeVisible();
  await checkout
    .getByRole("textbox", { name: "Email" })
    .fill("ines@example.com");
  await checkout.getByRole("radio", { name: /^Next day/ }).click();
  await expect(checkout.getByText("$33.00")).toBeVisible();
  await checkout.getByRole("button", { name: "Place order" }).click();
  await expect(
    page.getByRole("dialog", { name: "Thanks, your order is in" }),
  ).toContainText("Order HM-10482");
  await page.getByRole("button", { name: "Done" }).click();
  await expect(bagButton(page)).toHaveAccessibleName("Bag, 0 bags");
});

test("a subscription's price follows how many bags and which coffee", async ({
  page,
}) => {
  await page.goto("/");
  const builder = page.locator("#subscribe");
  await expect(builder.getByText("$16.20", { exact: true })).toBeVisible();
  await builder.getByRole("radio", { name: "2 bags" }).click();
  await builder.getByRole("combobox", { name: /^Coffee/ }).click();
  await page.getByRole("option", { name: "Huila", exact: true }).click();
  await expect(builder.getByText("$30.60", { exact: true })).toBeVisible();
  await builder.getByRole("radio", { name: "As a gift" }).click();
  await builder.getByRole("radio", { name: "6", exact: true }).click();
  await expect(builder.getByText("$183.60", { exact: true })).toBeVisible();
});

test("puts the page between the bars and the footer in a main landmark, which the bar's skip link reaches", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "WebKit leaves links out of the tab order unless the system's keyboard setting puts them in.",
  );
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1 })).toContainText(
    "Coffee roasted the morning it ships.",
  );
  await expect(main.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toContainText(
    "© 2026 Halfmoon Roastery. A buttery demo.",
  );
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    main.getByRole("link", { name: "Shop the coffees" }),
  ).toBeFocused();
});
