import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { expectButtery, fullMatrix, quickMatrix } from "@butteryui/test";

const matrix =
  process.env["BUTTERY_MATRIX"] === "full" ? fullMatrix : quickMatrix;

test.describe.configure({ timeout: 300_000 });

test("the editor is buttery", async ({ page }) => {
  await page.goto("/");
  await expectButtery(page, {
    ...matrix,
    name: "editor",
    interactions: [
      {
        name: "open the inspector sheet when it's narrow",
        run: async (target: Page) => {
          const sheet = target.getByRole("button", {
            name: "Edit design",
            exact: true,
          });
          if (await sheet.isVisible()) await sheet.click();
        },
      },
      {
        name: "make the design square",
        run: async (target: Page) => {
          await target
            .getByRole("radio", { name: "Square", exact: true })
            .click();
        },
      },
      {
        name: "type a long title, which the header shows too",
        allowMove: ['[data-bt="HeaderBar"]'],
        run: async (target: Page) => {
          await target
            .getByRole("textbox", { name: "Title" })
            .fill("A long title for the opening night of the spring fair");
        },
      },
      {
        name: "close the sheet where it opened",
        run: async (target: Page) => {
          const sheet = target.getByRole("dialog", { name: "Design settings" });
          if (await sheet.isVisible()) await target.keyboard.press("Escape");
        },
      },
    ],
  });
});
