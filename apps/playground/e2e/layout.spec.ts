import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { expectButtery, fullMatrix, quickMatrix } from "@buttery/test";
import type { ButteryInteraction } from "@buttery/test";
import { routes } from "./routes.ts";

const matrix =
  process.env["BUTTERY_MATRIX"] === "full" ? fullMatrix : quickMatrix;

const interactions: Readonly<Record<string, readonly ButteryInteraction[]>> = {
  popover: [
    {
      name: "open a popover",
      run: async (page: Page) => {
        await page.getByRole("button", { name: "bottom" }).click();
      },
    },
  ],
  "floating-lanes": [
    {
      name: "add a message to the bottom-center lane",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Add to bottom-center" })
          .click();
      },
    },
  ],
};

test.describe.configure({ timeout: 300_000 });

for (const route of routes) {
  test(`${route} is buttery`, async ({ page }) => {
    await page.goto(`/?chrome=0#/${route}`);
    await expectButtery(page, {
      ...matrix,
      name: route,
      interactions: interactions[route],
    });
  });
}

test("the playground chrome is buttery", async ({ page }) => {
  await page.goto("/#/tokens");
  await expectButtery(page, {
    ...matrix,
    name: "chrome",
    interactions: [
      {
        name: "switch to dark",
        run: async (target: Page) => {
          const dark = target.getByRole("radio", { name: "dark" });
          if (await dark.isVisible()) await dark.click();
        },
      },
    ],
  });
});
