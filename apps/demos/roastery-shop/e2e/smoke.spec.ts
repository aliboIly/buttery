import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/** The bar's bag button: beside the actions, or beside the brand once the bar folds. */
function bagButton(page: Page): Locator {
  return page.getByRole("link", { name: /^Bag, / });
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

  await page
    .getByRole("button", { name: "Add to bag · $19.00", exact: true })
    .click();
  await expect(bag).toHaveAccessibleName("Bag, 1 bag");
  await expect(
    page.getByText("Added a 12 oz bag of Guji.", { exact: true }),
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

test("the bag checks out in place, through shipping and payment, and starts again empty", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page
    .getByRole("button", { name: /^Add to bag/ })
    .first()
    .click();
  await bagButton(page).click();
  await page.getByRole("button", { name: "Check out" }).click();

  const shipping = page.getByRole("dialog", { name: "Shipping" });
  await shipping.getByRole("button", { name: "Payment" }).click();
  await expect(
    shipping.getByText("Enter a 5-digit ZIP code.", { exact: true }),
  ).toBeVisible();
  await expect(shipping.getByLabel("Email")).toBeFocused();
  await shipping.getByLabel("Email").fill("ines@example.com");
  await shipping.getByLabel("Full name").fill("Ines Vale");
  await shipping.getByLabel("Street address").fill("2210 SE Ankeny St");
  await shipping.getByLabel("Apartment, suite (optional)").fill("Apt 4");
  await shipping.getByLabel("City").fill("Portland");
  await shipping.getByLabel("State").fill("OR");
  await shipping.getByLabel("ZIP code").fill("97214");
  await shipping.getByRole("radio", { name: /^Next day/ }).click();
  await shipping.getByRole("button", { name: "Payment" }).click();

  const payment = page.getByRole("dialog", { name: "Payment" });
  await payment.getByLabel("Card number").fill("4111 1111 1111 1111");
  await payment.getByLabel("Expiry").fill("09/26");
  await payment.getByLabel("Security code").fill("123");
  await payment.getByRole("button", { name: "Pay $33.00" }).click();
  await expect(
    payment.getByText("This card has expired.", { exact: true }),
  ).toBeVisible();
  await payment.getByLabel("Expiry").fill("08/28");
  await payment.getByRole("button", { name: "Pay $33.00" }).click();

  await expect(
    page.getByRole("dialog", { name: "Thanks, your order is in" }),
  ).toContainText("Order HM-10482 goes into tomorrow morning's roast");
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

test("a gift asks for who it's for, taking focus to what's missing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const builder = page.locator("#subscribe");
  await builder.getByRole("radio", { name: "As a gift" }).click();
  const add = builder.getByRole("button", { name: "Add the gift to your bag" });

  await add.click();
  await expect(builder.getByLabel("Their name")).toBeFocused();
  await expect(builder.getByLabel("Their name")).toBeInViewport();
  await expect(
    builder.getByText("Enter the name of the person it's for.", {
      exact: true,
    }),
  ).toBeVisible();

  await builder.getByLabel("Their name").fill("Sam Okafor");
  await add.click();
  await expect(builder.getByLabel("Their email")).toBeFocused();

  await builder.getByLabel("Their email").fill("sam@example.com");
  await add.click();
  await expect(
    page.getByText("The gift for Sam is in the bag.", { exact: true }),
  ).toBeVisible();
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
