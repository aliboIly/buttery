import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { expectButtery, fullMatrix, quickMatrix } from "@butteryui/test";
import type { ButteryInteraction } from "@butteryui/test";

const matrix =
  process.env["BUTTERY_MATRIX"] === "full" ? fullMatrix : quickMatrix;

test.describe.configure({ timeout: 300_000 });

const escape: ButteryInteraction = {
  name: "press Escape",
  run: async (page: Page) => {
    await page.keyboard.press("Escape");
  },
};

const openWorkspaceMenu: ButteryInteraction = {
  name: "open the workspace menu, from the navigation sheet on a phone",
  run: async (page: Page) => {
    const sheet = page.getByRole("button", {
      name: "Open navigation",
      exact: true,
    });
    if (await sheet.isVisible()) await sheet.click();
    await page
      .getByRole("button", { name: "Workspace: buttery dashboard" })
      .click();
    await page.getByRole("menu").waitFor();
  },
};

const closeSheet: ButteryInteraction = {
  name: "close the navigation sheet where it opened",
  run: async (page: Page) => {
    const sheet = page.getByRole("dialog", { name: "buttery dashboard" });
    if (await sheet.isVisible()) await page.keyboard.press("Escape");
  },
};

const newOrder: ButteryInteraction = {
  name: "open the new order dialog",
  run: async (page: Page) => {
    await page.getByRole("button", { name: "New order", exact: true }).click();
    await page.getByRole("dialog", { name: "New order" }).waitFor();
  },
  acrossMatrix: true,
};

const screens: readonly {
  readonly path: string;
  readonly interactions: readonly ButteryInteraction[];
}[] = [
  {
    path: "/",
    interactions: [openWorkspaceMenu, escape, closeSheet, newOrder, escape],
  },
  {
    path: "/orders",
    interactions: [
      {
        name: "open the status filter",
        run: async (page: Page) => {
          const folded = page.getByRole("button", { name: /^Filters/ });
          if (await folded.isVisible()) await folded.click();
          else await page.getByRole("button", { name: /^Status/ }).click();
        },
      },
      escape,
      {
        name: "search for something nothing matches",
        run: async (page: Page) => {
          await page
            .getByRole("searchbox", { name: "Search orders" })
            .fill("zzz");
        },
      },
    ],
  },
  {
    path: "/settings",
    interactions: [
      {
        name: "change the shop's name, showing Save and Cancel",
        run: async (page: Page) => {
          await page
            .getByRole("textbox", { name: "Shop name" })
            .fill("Corner shop");
        },
      },
    ],
  },
];

for (const { path, interactions } of screens) {
  test(`the dashboard's ${path} is buttery`, async ({ page }) => {
    await page.goto(path);
    await expectButtery(page, {
      ...matrix,
      name: `dashboard ${path}`,
      interactions,
    });
  });
}
