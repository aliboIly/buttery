import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/** Collects console errors and page errors from here on. */
function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

for (const [path, title] of [
  ["/", "Overview"],
  ["/orders", "Orders"],
  ["/settings", "Settings"],
  ["/sign-in", "Sign in or create an account"],
] as const) {
  test(`renders ${path} with the bundled font and no console errors`, async ({
    page,
  }) => {
    const errors = watchConsole(page);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    const interLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('16px "Inter Variable"');
    });
    expect(interLoaded).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("the sidebar moves between pages without reloading, and back goes back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.dataset["visit"] = "first";
  });
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Orders");
  await expect(
    page.getByRole("link", { name: "Orders", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
  await expect(page.locator("html")).toHaveAttribute("data-visit", "first");
});

test("an address with no page shows a way back to the overview", async ({
  page,
}) => {
  await page.goto("/nowhere");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
  await page.getByRole("link", { name: "Go to the overview" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
});

test("New order adds an order to the top of the table", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "New order", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "New order" });
  await dialog.getByRole("textbox", { name: "Customer" }).fill("Noor Haddad");
  await dialog.getByRole("textbox", { name: "Item" }).fill("Linen tote");
  await dialog.getByRole("spinbutton", { name: "Amount" }).fill("38");
  await dialog.getByRole("spinbutton", { name: "Amount" }).press("Tab");
  await dialog.getByRole("button", { name: "Add order" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/orders$/);
  const rows = page
    .getByRole("table", { name: "Orders" })
    .getByRole("rowgroup")
    .nth(1)
    .getByRole("row");
  await expect(rows.first()).toContainText("1049");
  await expect(rows.first()).toContainText("Noor Haddad");
});

test("the status filter and the search narrow the orders", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/orders");
  const rows = page
    .getByRole("table", { name: "Orders" })
    .getByRole("rowgroup")
    .nth(1)
    .getByRole("row");
  await expect(rows).toHaveCount(10);
  await page.getByRole("button", { name: /^Status/ }).click();
  await page.getByRole("radio", { name: "Shipped", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(rows).toHaveCount(6);
  await page.getByRole("searchbox", { name: "Search orders" }).fill("throw");
  await expect(rows).toHaveCount(2);
});

test("signs out from the workspace menu and back in with the demo code", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Workspace: buttery dashboard" })
    .click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page
    .getByRole("textbox", { name: "Email or phone number" })
    .fill("sam@example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("textbox", { name: "One-time code" }),
  ).toBeFocused();
  await page.keyboard.type("123456");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
  await expect(page).toHaveURL(/\/$/);
});
