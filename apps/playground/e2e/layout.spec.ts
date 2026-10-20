import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { expectButtery, fullMatrix, quickMatrix } from "@buttery/test";
import type { ButteryInteraction } from "@buttery/test";
import { routes } from "./routes.ts";

const matrix =
  process.env["BUTTERY_MATRIX"] === "full" ? fullMatrix : quickMatrix;

function press(name: string): ButteryInteraction["run"] {
  return async (page: Page) => {
    await page.getByRole("button", { name, exact: true }).first().click();
  };
}

function pressIfShown(
  role: "button" | "radio",
  name: string,
): ButteryInteraction["run"] {
  return async (page: Page) => {
    const target = page.getByRole(role, { name, exact: true }).first();
    if (await target.isVisible()) await target.click();
  };
}

const escape: ButteryInteraction = {
  name: "press Escape",
  run: async (page: Page) => {
    await page.keyboard.press("Escape");
  },
};

const interactions: Readonly<Record<string, readonly ButteryInteraction[]>> = {
  "floating-lanes": [
    {
      name: "add a message to the bottom-center lane",
      run: press("Add to bottom-center"),
    },
    { name: "add a notice to the top-end lane", run: press("Add to top-end") },
  ],
  layer: [
    { name: "open the modal", run: press("Open a modal with a menu inside") },
    { name: "open the menu inside it", run: press("Open the menu") },
  ],
  "overflow-cluster": [
    { name: "open the More menu", run: pressIfShown("button", "More actions") },
  ],
  popover: [
    { name: "open a popover", run: press("bottom") },
    escape,
    { name: "open the menu with a scrim", run: press("Products") },
  ],
  scrim: [
    { name: "show the dim scrim", run: press("Show dim") },
    escape,
    { name: "show the blur scrim", run: press("Show blur") },
  ],
  surfaces: [
    {
      name: "open the header's More menu",
      run: pressIfShown("button", "More actions"),
    },
  ],
};

test.describe.configure({ timeout: 300_000 });

for (const route of routes) {
  test(`${route} is buttery`, async ({ page }) => {
    await page.goto(`/#/${route}`);
    await expectButtery(page, {
      ...matrix,
      name: route,
      interactions: interactions[route],
    });
  });
}

test("the playground chrome is buttery with its menus open", async ({
  page,
}) => {
  await page.goto("/#/tokens");
  await expectButtery(page, {
    ...matrix,
    name: "chrome",
    interactions: [
      { name: "open the page list", run: pressIfShown("button", "Tokens") },
      escape,
      {
        name: "open the display settings",
        run: pressIfShown("button", "Display settings"),
      },
      { name: "switch to dark", run: pressIfShown("radio", "dark") },
    ],
  });
});
