import { expect, test } from "@playwright/test";

const pages = [
  { route: "tokens", landmark: "Text roles" },
  { route: "surfaces", landmark: "Inspector" },
  { route: "levels", landmark: "dark surfaces" },
  { route: "palettes", landmark: "Gradients" },
  { route: "text-stacks", landmark: "Make it yours" },
] as const;

for (const { route, landmark } of pages) {
  test(`renders the ${route} page with the bundled font and no console errors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`/?theme=light#/${route}`);

    await expect(
      page.getByText(landmark).or(page.getByLabel(landmark)).first(),
    ).toBeVisible();
    const interLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('16px "Inter Variable"');
    });
    expect(interLoaded).toBe(true);
    expect(errors).toEqual([]);
  });
}
