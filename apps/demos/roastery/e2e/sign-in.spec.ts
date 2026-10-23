import { expect, test } from "@playwright/test";
import { expectButtery, quickMatrix } from "@butteryui/test";

test("asks someone signed out to sign in with a code, the demo's in its hint, then opens the dashboard", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("roastery:session");
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sign in or create an account" }),
  ).toBeVisible();
  await expectButtery(page, { ...quickMatrix, name: "roastery sign-in" });

  await page
    .getByRole("textbox", { name: "Email or phone number" })
    .fill("rosa@halfmoon.coffee");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your email" }),
  ).toBeVisible();
  await expect(page.getByText("Demo code: 123456")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "One-time code" }),
  ).toBeFocused();
  await expectButtery(page, { ...quickMatrix, name: "roastery sign-in code" });

  await page.getByRole("textbox", { name: "One-time code" }).fill("123456");
  await expect(page.getByText("You're signed in").first()).toBeVisible();
  await expect(page.locator("h1").first()).toHaveText("Overview");
  expect(
    await page.evaluate(() => localStorage.getItem("roastery:session")),
  ).toBe('"rosa@halfmoon.coffee"');
});

test("signs out from the account menu, back to the sign-in screen", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "buttery:announcement:roastery-roast-planning",
      "true",
    );
  });
  await page.goto("/");
  await expect(page.locator("h1").first()).toHaveText("Overview");
  await page
    .getByRole("button", { name: "Workspace: Halfmoon Roastery" })
    .click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(
    page.getByRole("heading", { name: "Sign in or create an account" }),
  ).toBeVisible();
});
