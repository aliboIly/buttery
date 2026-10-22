import { expect, test } from "@playwright/test";

test("the site sits on the surface color, as the landing's own sections do, so filled controls show on it", async ({
  page,
  browserName,
}) => {
  test.skip(browserName === "webkit", "Colors don't depend on the engine.");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const colors = await page.evaluate(() => {
    const background = (selector: string): string => {
      const element = document.querySelector(selector);
      return element ? getComputedStyle(element).backgroundColor : "";
    };
    return {
      shell: background(".docs-shell"),
      page: background('[data-bt="Page"]'),
    };
  });
  expect(colors.shell).toBe(colors.page);
});
