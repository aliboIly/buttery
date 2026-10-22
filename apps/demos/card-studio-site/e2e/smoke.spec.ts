import { expect, test } from "@playwright/test";

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
    "Cards for launch days.",
  );
  const interLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px "Inter Variable"');
  });
  expect(interLoaded).toBe(true);
  expect(errors).toEqual([]);
});

test("Pricing in the bar scrolls to the plans, leaving the address alone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Pricing", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "One price for the rest" }),
  ).toBeInViewport();
  expect(new URL(page.url()).hash).toBe("");
});
