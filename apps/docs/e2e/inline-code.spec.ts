import { expect, test } from "@playwright/test";

test("a code chip leaves the punctuation after it well inside a space's width", async ({
  page,
}) => {
  await page.goto("/layout/the-layout-contract");
  const chip = page.locator("code.docs-code", { hasText: /^Stack$/ }).first();
  await expect(chip).toBeVisible();
  const { room, space } = await chip.evaluate((code) => {
    const words = code.parentElement;
    const after = code.nextSibling;
    if (!words || !(after instanceof Text) || !after.data.startsWith(",")) {
      throw new Error("The chip should be followed by a comma.");
    }
    const text = document.createRange();
    text.selectNodeContents(code);
    const comma = document.createRange();
    comma.setStart(after, 0);
    comma.setEnd(after, 1);
    const gap = document.createRange();
    const spaced = after.data.indexOf(" ");
    gap.setStart(after, spaced);
    gap.setEnd(after, spaced + 1);
    return {
      room:
        comma.getBoundingClientRect().left - text.getBoundingClientRect().right,
      space: gap.getBoundingClientRect().width,
    };
  });
  expect(room).toBeLessThan(space * 0.75);
});
