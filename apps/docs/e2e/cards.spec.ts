import { expect, test } from "@playwright/test";

const CARD_PAGES = [
  "/patterns/plans",
  "/patterns/forms",
  "/layout/the-layout-contract",
  "/get-started/using-coding-agents",
];

for (const width of [768, 960, 1280]) {
  test(`a written page's cards keep their code inside them at ${String(width)}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of CARD_PAGES) {
      await page.goto(path);
      await expect(page.locator(".docs-card").first()).toBeVisible();
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const outside = await page.locator(".docs-card").evaluateAll((cards) =>
        cards.flatMap((card) => {
          const end =
            card.getBoundingClientRect().right -
            Number.parseFloat(getComputedStyle(card).paddingRight);
          return [...card.querySelectorAll("code")]
            .filter((code) => code.getBoundingClientRect().right > end + 0.5)
            .map((code) => code.textContent);
        }),
      );
      expect(outside, path).toEqual([]);
    }
  });
}

test("a long type in a props table's inherited line wraps inside its paragraph", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  for (const path of ["/components/context-menu", "/components/tabs"]) {
    await page.goto(path);
    const line = page.getByText(/^It also takes/).first();
    await expect(line).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const past = await line.evaluate((paragraph) => {
      const end = paragraph.getBoundingClientRect().right;
      const range = document.createRange();
      range.selectNodeContents(paragraph);
      return Math.max(
        0,
        ...[...range.getClientRects()].map((rect) => rect.right - end),
      );
    });
    expect(past, path).toBeLessThanOrEqual(0.5);
  }
});
