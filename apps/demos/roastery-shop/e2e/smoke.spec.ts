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
  await expect(bag).toHaveAccessibleName("Bag, 0 items");

  await page
    .getByRole("button", { name: "Add to bag · $19.00", exact: true })
    .click();
  await expect(bag).toHaveAccessibleName("Bag, 1 item");
  await expect(
    page.getByText("Guji, 12 oz, is in your bag.", { exact: true }),
  ).toBeVisible();

  await bag.click();
  const dialog = page.getByRole("dialog", { name: "Your bag" });
  await expect(dialog.getByText("Guji, 12 oz", { exact: true })).toBeVisible();
  await dialog
    .getByRole("button", { name: "One bag more of Guji, 12 oz" })
    .click();
  await expect(
    dialog.getByText("2 bags of coffee, roasted the morning after you order.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Add $2.00 more for free shipping.", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(bag).toHaveAccessibleName("Bag, 2 items");

  await page.reload();
  await expect(bag).toHaveAccessibleName("Bag, 2 items");
});

test("the bag is a side panel at the window's end on a laptop and a drawer from the bottom on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await bagButton(page).focus();
  await page.keyboard.press("Enter");
  let sheet = page.getByRole("dialog", { name: "Your bag is empty" });
  await expect(sheet).toBeVisible();
  await expect
    .poll(async () => {
      const box = await sheet.boundingBox();
      return box && [box.x + box.width, box.y, box.y + box.height];
    })
    .toEqual([1272, 8, 792]);
  expect((await sheet.boundingBox())?.width).toBe(400);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(bagButton(page)).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await bagButton(page).click();
  sheet = page.getByRole("dialog", { name: "Your bag is empty" });
  await expect
    .poll(async () => {
      const box = await sheet.boundingBox();
      return box && [box.x, box.x + box.width, box.y + box.height];
    })
    .toEqual([8, 382, 836]);
  expect((await sheet.boundingBox())?.y).toBeGreaterThan(422);
});

test("the bar's bag links to the bag's page, opening it in a new tab with ⌘ or Ctrl and the sheet without", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const bag = bagButton(page);
  await expect(bag).toHaveAttribute("href", "/bag");
  const [tab] = await Promise.all([
    context.waitForEvent("page"),
    bag.click({ modifiers: ["ControlOrMeta"] }),
  ]);
  await tab.waitForLoadState();
  await expect(
    tab.getByRole("heading", { level: 1, name: "Your bag is empty" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
  await bag.click();
  await expect(
    page.getByRole("dialog", { name: "Your bag is empty" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("a middle click on the bar's bag opens the bag's page in a new tab, leaving the sheet shut", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "WebKit's automation opens no tab for a middle click on a link.",
  );
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const [tab] = await Promise.all([
    context.waitForEvent("page"),
    bagButton(page).click({ button: "middle" }),
  ]);
  await tab.waitForLoadState();
  await expect(tab).toHaveURL(/\/bag$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the bag's page changes what's in it and goes on to checkout, and the sheet's View bag opens it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Add to bag · $19.00", exact: true })
    .click();
  await bagButton(page).click();
  await page
    .getByRole("dialog", { name: "Your bag" })
    .getByRole("link", { name: "View bag" })
    .click();
  await expect(page).toHaveURL(/\/bag$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const main = page.getByRole("main");
  await expect(
    main.getByRole("heading", { level: 1, name: "Your bag" }),
  ).toBeVisible();
  await main
    .getByRole("button", { name: "One bag more of Guji, 12 oz" })
    .click();
  await expect(
    main.getByText("2 bags of coffee, roasted the morning after you order.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    main.getByText("Add $2.00 more for free shipping.", { exact: true }),
  ).toBeVisible();
  await expect(bagButton(page)).toHaveAccessibleName("Bag, 2 items");
  await main.getByRole("link", { name: "Check out" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(
    page.getByRole("form", { name: "Shipping" }).getByLabel("Email"),
  ).toBeFocused();
  await page.goto("/bag");
  await main.getByRole("button", { name: "Remove Guji, 12 oz" }).click();
  await expect(
    main.getByRole("heading", { level: 1, name: "Your bag is empty" }),
  ).toBeVisible();
  await main.getByRole("link", { name: "Shop the coffees" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#coffees")).toBeInViewport();
});

test("checkout continues on its own page, through shipping and payment, and the bag starts again empty", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page
    .getByRole("button", { name: /^Add to bag/ })
    .first()
    .click();
  await bagButton(page).click();
  await page
    .getByRole("dialog", { name: "Your bag" })
    .getByRole("link", { name: "Check out" })
    .click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 1, name: "Check out" }),
  ).toBeVisible();

  const shipping = page.getByRole("form", { name: "Shipping" });
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
  await expect(
    page.getByRole("list", { name: "What you're ordering" }),
  ).toContainText("Guji, 12 oz × 1");
  await shipping.getByRole("button", { name: "Payment" }).click();

  const payment = page.getByRole("form", { name: "Payment" });
  await expect(payment.getByLabel("Card number")).toBeFocused();
  await payment.getByRole("button", { name: "Shipping" }).click();
  await expect(shipping.getByLabel("ZIP code")).toHaveValue("97214");
  await shipping.getByRole("button", { name: "Payment" }).click();
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
    page.getByRole("heading", { level: 1, name: "Thanks, your order is in" }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText(
    "Order HM-10482 goes into tomorrow morning's roast",
  );
  await expect(bagButton(page)).toHaveAccessibleName("Bag, 0 items");
  const back = page.getByRole("link", { name: "Back to the shop" });
  await expect(back).toBeFocused();
  await back.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Coffee roasted the morning it ships.",
  );
});

test("the bar and footer reach the front page's sections from the bag's page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/bag");
  const brewing = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Brew guides" });
  await expect(brewing).toHaveAttribute("href", "/#brewing");
  await brewing.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#brewing")).toBeInViewport();
  await expect(page.locator("#brewing")).toBeFocused();
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
    page.getByText("The gift for Sam is in your bag.", { exact: true }),
  ).toBeVisible();
});

test("sign-in changes in place to creating an account or resetting a password", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("link", { name: "Sign in", exact: true }).click();

  await page
    .getByRole("dialog", { name: "Sign in" })
    .getByRole("link", { name: "Forgot your password?" })
    .click();
  const reset = page.getByRole("form", { name: "Reset your password" });
  await expect(reset.getByLabel("Email")).toBeFocused();
  await reset.getByLabel("Email").fill("ines@example.com");
  await reset.getByRole("button", { name: "Email me a link" }).click();
  await expect(
    page.getByText("We sent a link to ines@example.com.", { exact: true }),
  ).toBeVisible();
  await expect(reset).toBeHidden();

  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Sign in" })
    .getByRole("link", { name: "Create an account" })
    .click();
  const signUp = page.getByRole("form", {
    name: "Create your Halfmoon account",
  });
  await expect(signUp.getByLabel("Name")).toBeFocused();
  await signUp.getByLabel("Name").fill("Ines Vale");
  await signUp.getByLabel("Email").fill("ines@example.com");
  await signUp.getByLabel("Password", { exact: true }).fill("halfmoon7");
  await signUp.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByText("Welcome to Halfmoon, Ines.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Account", exact: true }),
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

test("a question opened from the bar shows in its topic, the search finds answers in every topic, and a link to one opens it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByRole("link", { name: /^Storing coffee/ }).click();
  const questions = page.locator("#questions");
  await expect(
    questions.getByRole("tab", { name: "Coffee and brewing" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    questions.getByRole("button", { name: "How should I store my coffee?" }),
  ).toHaveAttribute("aria-expanded", "true");

  await questions
    .getByRole("searchbox", { name: "Search questions" })
    .fill("refund");
  await expect(questions.getByRole("tablist")).toHaveCount(0);
  await expect(
    questions.getByRole("button", {
      name: "What if I don't like a coffee? Orders and shipping",
    }),
  ).toBeVisible();

  await page.goto("/#gift-subscriptions");
  const gift = questions.getByRole("button", {
    name: "How do gift subscriptions work?",
  });
  await expect(gift).toHaveAttribute("aria-expanded", "true");
  await expect(
    questions.getByRole("searchbox", { name: "Search questions" }),
  ).toHaveValue("");
  await expect(gift).toBeInViewport();
});
