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

const searchTote: ButteryInteraction = {
  name: "search for tote in the top bar",
  run: async (page: Page) => {
    const field = page.getByRole("combobox", {
      name: "Search orders and products",
    });
    await field.fill("tote");
    await page.getByRole("listbox").waitFor();
  },
};

const screens: readonly {
  readonly path: string;
  readonly interactions: readonly ButteryInteraction[];
}[] = [
  {
    path: "/",
    interactions: [
      openWorkspaceMenu,
      escape,
      closeSheet,
      newOrder,
      escape,
      searchTote,
      escape,
    ],
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
    path: "/orders/1048",
    interactions: [
      {
        name: "mark the order as shipped",
        run: async (page: Page) => {
          await page.getByRole("button", { name: "Mark as shipped" }).click();
          await page
            .getByRole("button", { name: "Send a return label" })
            .waitFor();
        },
      },
    ],
  },
  {
    path: "/products",
    interactions: [
      {
        name: "show the kitchen's products",
        run: async (page: Page) => {
          await page
            .getByRole("link", { name: "Kitchen", exact: true })
            .click();
          await page
            .getByRole("link", { name: "Walnut serving board" })
            .waitFor();
        },
      },
    ],
  },
  { path: "/subscriptions", interactions: [] },
  { path: "/returns", interactions: [] },
  { path: "/search?q=tote", interactions: [] },
  { path: "/settings", interactions: [] },
  {
    path: "/settings/plan",
    interactions: [
      {
        name: "show the yearly prices",
        run: async (page: Page) => {
          await page.getByRole("radio", { name: "Yearly" }).click();
        },
      },
    ],
  },
  {
    path: "/settings/shop",
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
  {
    path: "/sign-in",
    interactions: [
      {
        name: "send a code to an email address",
        run: async (page: Page) => {
          await page
            .getByRole("textbox", { name: "Email or phone number" })
            .fill("sam@example.com");
          await page.getByRole("button", { name: "Continue" }).click();
          await page
            .getByRole("heading", { name: "Check your email" })
            .waitFor();
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
