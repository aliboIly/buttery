import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { expectButtery, fullMatrix, quickMatrix } from "@buttery/test";

const matrix =
  process.env["BUTTERY_MATRIX"] === "full" ? fullMatrix : quickMatrix;

test.describe.configure({ timeout: 300_000 });

test("the marketing site is buttery", async ({ page }) => {
  await page.goto("/");
  await expectButtery(page, {
    ...matrix,
    name: "marketing",
    interactions: [
      {
        name: "open the bar's sheet when it's folded",
        run: async (target: Page) => {
          const sheet = target.getByRole("button", {
            name: "Menu",
            exact: true,
          });
          if (await sheet.isVisible()) {
            await sheet.click();
            await target.getByRole("dialog").waitFor();
          }
        },
        acrossMatrix: true,
      },
      {
        name: "press Escape",
        run: async (target: Page) => {
          await target.keyboard.press("Escape");
        },
      },
      {
        name: "show a plan's toast",
        run: async (target: Page) => {
          await target
            .getByRole("button", { name: "Start for free", exact: true })
            .click();
          await target
            .getByText("Solo goes to the sign-up page once there is one.", {
              exact: true,
            })
            .waitFor();
        },
      },
    ],
  });
});
