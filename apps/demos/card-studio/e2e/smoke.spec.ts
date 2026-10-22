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

  await expect(page.getByTestId("title-card")).toBeVisible();
  await expect(
    page.locator('[data-bt="HeaderBar"] [data-bt-part="title"]'),
  ).toHaveText("Launch card");
  const interLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px "Inter Variable"');
  });
  expect(interLoaded).toBe(true);
  expect(errors).toEqual([]);
});

test("the title typed in the inspector lands on the card and in the header", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("textbox", { name: "Title" }).fill("Spring sale");
  await expect(page.getByTestId("title-card")).toHaveText("Spring sale");
  await expect(
    page.locator('[data-bt="HeaderBar"] [data-bt-part="title"]'),
  ).toHaveText("Spring sale");
});
