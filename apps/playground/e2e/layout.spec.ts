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
  "number-field": [
    {
      name: "focus a field, which shows its stepper",
      run: async (page: Page) => {
        await page
          .getByRole("spinbutton", { name: "W", exact: true })
          .first()
          .focus();
      },
    },
  ],
  "sign-in-form": [
    {
      name: "submit it empty, showing the errors",
      run: press("Sign in"),
      allowMove: ["main"],
    },
    { name: "show the password", run: press("Show password") },
  ],
  "sign-up-form": [
    {
      name: "submit it empty, showing the errors",
      run: press("Create account"),
      allowMove: ["main"],
    },
    {
      name: "type a long name",
      allowMove: ["main"],
      run: async (page: Page) => {
        await page
          .getByLabel("Name", { exact: true })
          .first()
          .fill("Alexandria Constance Montgomery-Wellington of the Studio");
      },
    },
  ],
  "split-button": [
    { name: "open the export menu", run: press("More export options") },
  ],
  surfaces: [
    {
      name: "open the header's More menu",
      run: pressIfShown("button", "More actions"),
    },
  ],
  tooltip: [
    {
      name: "show a tooltip from the keyboard",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Export", exact: true })
          .first()
          .focus();
        await page.getByRole("tooltip").first().waitFor();
      },
    },
  ],
  toaster: [
    {
      name: "show four toasts and hold them under the pointer",
      run: async (page: Page) => {
        const show = page.getByRole("button", {
          name: "Show a toast",
          exact: true,
        });
        for (let count = 0; count < 4; count += 1) await show.click();
        await page.getByRole("region", { name: "Notifications (F8)" }).hover();
      },
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
