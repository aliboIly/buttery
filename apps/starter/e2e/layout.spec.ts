import { test } from "@playwright/test";
import { expectButtery, fullMatrix, quickMatrix } from "@butteryui/test";

const matrix =
  process.env["BUTTERY_MATRIX"] === "full" ? fullMatrix : quickMatrix;

test.describe.configure({ timeout: 300_000 });

test("the starter is buttery", async ({ page }) => {
  await page.goto("/");
  await expectButtery(page, { ...matrix, name: "starter" });
});
