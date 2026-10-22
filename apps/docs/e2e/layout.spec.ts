import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  expectButtery,
  fullMatrix,
  quickMatrix,
  watchResizeLoops,
} from "@buttery/test";
import type { ButteryInteraction, ButteryViewport } from "@buttery/test";
import { routes, url } from "./routes.ts";

const matrix =
  process.env["BUTTERY_MATRIX"] === "full" ? fullMatrix : quickMatrix;

function press(
  name: string,
  role: "button" | "combobox" = "button",
): ButteryInteraction["run"] {
  return async (page: Page) => {
    await page.getByRole(role, { name, exact: true }).first().click();
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

/** Presses a header action, from the More menu when it has folded away: a page header's or a header bar's. */
function headerAction(name: string): ButteryInteraction["run"] {
  return async (page: Page) => {
    const direct = page.getByRole("button", { name, exact: true }).first();
    if (await direct.isVisible()) {
      await direct.click();
      return;
    }
    await page
      .getByRole("button", { name: /^More (page )?actions/ })
      .first()
      .click();
    await page.getByRole("menuitem", { name, exact: true }).click();
  };
}

/** The docs site's pill over a demo, a lane item that moves clear of what the lanes avoid. */
const PILL = '[data-testid="demo-pill"]';

const escape: ButteryInteraction = {
  name: "press Escape",
  run: async (page: Page) => {
    await page.keyboard.press("Escape");
  },
};

function opensDialog(trigger: string): ButteryInteraction {
  return {
    name: `open the dialog from ${trigger}`,
    run: async (page: Page) => {
      await page
        .getByRole("button", { name: trigger, exact: true })
        .first()
        .click();
      await page.getByRole("dialog").waitFor();
    },
    acrossMatrix: true,
  };
}

const interactions: Readonly<Record<string, readonly ButteryInteraction[]>> = {
  "data-table": [
    { name: "reload, showing skeleton rows", run: press("Reload") },
  ],
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
  menu: [
    { name: "open the actions menu", run: press("Card actions") },
    escape,
    { name: "open the view menu", run: press("View") },
  ],
  "card-studio": [
    {
      name: "enter resize mode, the docs pill rising above its toolbar",
      run: headerAction("Resize"),
      allowMove: [PILL],
      acrossMatrix: true,
    },
    {
      name: "discard the resize",
      run: press("Discard"),
      allowMove: [PILL],
    },
    {
      name: "delete the card, showing the empty state (its toast is checked at the first condition, before it leaves)",
      run: headerAction("Delete"),
      allowMove: ['[data-bt="HeaderBar"]'],
      acrossMatrix: true,
    },
    {
      name: "add a new card",
      run: press("New card"),
      allowMove: ['[data-bt="HeaderBar"]'],
    },
    {
      name: "open the canvas shape list or the More menu",
      run: async (page: Page) => {
        const select = page
          .getByRole("combobox", { name: /^Canvas shape/ })
          .first();
        if (await select.isVisible()) await select.click();
        else
          await page
            .getByRole("button", { name: "More actions", exact: true })
            .first()
            .click();
      },
    },
    escape,
    {
      name: "open the inspector sheet when it's narrow",
      run: pressIfShown("button", "Edit card"),
    },
    escape,
    {
      name: "open the tour from Help",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Help", exact: true })
          .first()
          .click();
        await page.getByRole("dialog", { name: "Name your card" }).waitFor();
      },
    },
  ],
  "app-shell": [
    {
      name: "open the inspector sheet on the narrow example",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Adjust card", exact: true })
          .first()
          .click();
        await page.getByRole("dialog", { name: "Card settings" }).waitFor();
      },
    },
  ],
  "color-dot": [
    {
      name: "open the first color's picker",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: /^First hue/ })
          .first()
          .click();
        await page.getByRole("dialog", { name: "First hue" }).waitFor();
      },
      acrossMatrix: true,
    },
  ],
  dialog: [
    {
      name: "open the confirm dialog",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Delete card", exact: true })
          .first()
          .click();
        await page.getByRole("dialog").waitFor();
      },
      acrossMatrix: true,
    },
    escape,
    {
      name: "open the dialog with media",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Share", exact: true })
          .first()
          .click();
        await page.getByRole("dialog").waitFor();
      },
      acrossMatrix: true,
    },
    escape,
    {
      name: "open the large dialog",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Large", exact: true })
          .first()
          .click();
        await page.getByRole("dialog").waitFor();
      },
      acrossMatrix: true,
    },
  ],
  "form-dialog": [opensDialog("Add a backup email")],
  "consequence-dialog": [opensDialog("Try Roaster")],
  "fullscreen-dialog": [opensDialog("Set up the roastery")],
  "command-search": [
    {
      name: "open the search's suggestions",
      run: async (page: Page) => {
        await page
          .getByRole("combobox", { name: "Search", exact: true })
          .first()
          .click();
        await page.getByRole("listbox").first().waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "search for a customer",
      run: async (page: Page) => {
        await page.keyboard.type("ines");
        await page
          .getByRole("option", { name: /Ines Vale/ })
          .first()
          .waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "search for something nothing matches",
      run: async (page: Page) => {
        await page.keyboard.type("zzz");
        await page
          .locator(".bt-command-search-panel")
          .getByText('No results for "ineszzz"')
          .waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "finish a filter into a chip",
      run: async (page: Page) => {
        await page.keyboard.press("Escape");
        await page.keyboard.type("status:shipped ");
        await page.locator('[data-bt-part="chip"]').first().waitFor();
      },
      acrossMatrix: true,
    },
  ],
  "side-panel": [
    {
      name: "open the panel's overflow menu",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "More actions", exact: true })
          .first()
          .click();
        await page.getByRole("menu").waitFor();
      },
      acrossMatrix: true,
    },
    escape,
    {
      name: "open help from the shell's top bar",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Help", exact: true })
          .first()
          .click();
        await page
          .getByRole("dialog", { name: "Help", exact: true })
          .or(page.getByRole("complementary", { name: "Help", exact: true }))
          .first()
          .waitFor();
      },
      acrossMatrix: true,
    },
  ],
  "expandable-card": [
    {
      name: "open the card",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Open Lean it in 3D", exact: true })
          .first()
          .click();
        await page.getByRole("dialog").waitFor();
      },
      acrossMatrix: true,
    },
  ],
  "morph-menu": [
    {
      name: "open the Product menu",
      run: async (page: Page) => {
        const product = page
          .getByRole("button", { name: "Product", exact: true })
          .first();
        // A menu row lives near the top of its page, with room below; the demo sits low on its docs page.
        await product.evaluate((element) => {
          element.scrollIntoView({ block: "center" });
        });
        await product.click();
        await page.locator('[data-bt-part="panel"]').first().waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "move to the Guides menu",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Guides", exact: true })
          .first()
          .hover();
        await page
          .getByRole("button", { name: "Guides", expanded: true })
          .first()
          .waitFor();
      },
      acrossMatrix: true,
    },
  ],
  "nav-bar": [
    {
      name: "open the first menu, or the sheet when the bar is folded",
      run: async (page: Page) => {
        const sheet = page
          .getByRole("button", { name: "Menu", exact: true })
          .first();
        if (await sheet.isVisible()) {
          await sheet.click();
          await page.getByRole("dialog").waitFor();
          return;
        }
        await page
          .getByRole("button", { name: "Product", exact: true })
          .first()
          .click();
        await page.locator('[data-bt-part="panel"]').first().waitFor();
      },
      acrossMatrix: true,
    },
  ],
  onboarding: [
    {
      name: "open the tour",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Take the tour", exact: true })
          .click();
        await page.getByRole("dialog").waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "go to the last step",
      run: async (page: Page) => {
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
      },
      acrossMatrix: true,
    },
  ],
  "page-dots": [{ name: "move on a step", run: press("Next") }],
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
  select: [
    {
      name: "open the canvas shape list",
      run: press("Canvas shape, Wide · 16:9", "combobox"),
    },
    escape,
    {
      name: "open the list with width and height fields",
      run: async (page: Page) => {
        await page
          .getByRole("combobox", {
            name: "Canvas shape, Wide · 16:9",
            exact: true,
          })
          .nth(1)
          .click();
      },
    },
  ],
  "sign-in-form": [
    {
      name: "submit it empty, showing the errors",
      run: press("Sign in"),
      allowMove: ["main"],
      acrossMatrix: true,
    },
    {
      name: "show the password",
      run: press("Show password"),
      acrossMatrix: true,
    },
  ],
  "sign-up-form": [
    {
      name: "submit it empty, showing the errors",
      run: press("Create account"),
      allowMove: ["main"],
      acrossMatrix: true,
    },
    {
      name: "show the password",
      run: press("Show password"),
      acrossMatrix: true,
    },
    {
      name: "type a long name",
      allowMove: ["main"],
      acrossMatrix: true,
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
        const show = page
          .getByRole("region", { name: "Toaster variants and states" })
          .getByRole("button", { name: "Show a toast", exact: true });
        for (let count = 0; count < 4; count += 1) await show.click();
        await page.getByRole("region", { name: "Notifications (F8)" }).hover();
      },
    },
    {
      name: "show a success, a warning and a danger toast (the centered stack widens to the widest one)",
      allowMove: ['[data-bt="Toaster"]'],
      run: async (page: Page) => {
        const section = page.getByRole("region", {
          name: "Toaster variants and states",
        });
        for (const tone of ["Success", "Warning", "Danger"]) {
          await section
            .getByRole("button", { name: tone, exact: true })
            .click();
        }
        await page.getByRole("region", { name: "Notifications (F8)" }).hover();
      },
    },
  ],
};

test.describe.configure({ timeout: 300_000 });

// Pages load at the matrix's first size, as on a phone, with ResizeObserver loops counted from the start.
test.beforeEach(async ({ page }) => {
  await watchResizeLoops(page);
  const [first] = matrix.viewports;
  if (first) await page.setViewportSize(first);
});

for (const route of routes) {
  test(`${route} is buttery`, async ({ page }) => {
    const short = route.slice(route.indexOf("/") + 1);
    await page.goto(url(route));
    await expectButtery(page, {
      ...matrix,
      name: route,
      interactions: interactions[short] ?? roasteryInteractions[short],
    });
  });
}

test("the landing page is buttery with its menu and a toast open", async ({
  page,
}) => {
  await page.goto("/");
  const tryIt = page.getByRole("region", { name: "Try it" });
  await expectButtery(page, {
    ...matrix,
    name: "landing",
    interactions: [
      {
        name: "open the More menu",
        run: async () => {
          await tryIt
            .getByRole("button", { name: "More", exact: true })
            .click();
          await page.getByRole("menu").waitFor();
        },
      },
      escape,
      {
        name: "save, which shows a toast",
        run: async () => {
          await tryIt
            .getByRole("button", { name: "Save", exact: true })
            .click();
          await page
            .getByText("Reminder settings saved", { exact: true })
            .waitFor();
        },
      },
    ],
  });
});

test("the playground chrome is buttery with its menus open", async ({
  page,
}) => {
  await page.goto("/foundations/tokens");
  await expectButtery(page, {
    ...matrix,
    name: "chrome",
    interactions: [
      {
        name: "open a page menu, or the sheet when the bar is folded",
        run: async (page: Page) => {
          const sheet = page
            .getByRole("button", { name: "Menu", exact: true })
            .first();
          if (await sheet.isVisible()) {
            await sheet.click();
            await page.getByRole("dialog").waitFor();
            return;
          }
          await page
            .getByRole("button", { name: "Components", exact: true })
            .first()
            .click();
          await page.locator('[data-bt-part="panel"]').first().waitFor();
        },
      },
      escape,
      {
        name: "open the display settings",
        run: pressIfShown("button", "Display settings"),
      },
      { name: "switch to dark", run: pressIfShown("radio", "dark") },
    ],
  });
});

/** Marks the roastery's first-visit announcement and nudge as seen, as they are for anyone coming back. */
async function returningVisitor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      "buttery:announcement:roastery-roast-planning",
      "true",
    );
    localStorage.setItem("buttery:nudge:roastery-delivery-questions", "true");
  });
}

/** Opens a list's filters: the folded Filters button on a phone, the named pill otherwise. */
function openFilter(name: string): ButteryInteraction["run"] {
  return async (page: Page) => {
    const folded = page.getByRole("button", { name: /^Filters/ }).first();
    if (await folded.isVisible()) {
      await folded.click();
      return;
    }
    await page.getByRole("button", { name, exact: true }).first().click();
  };
}

/** Waits for the roastery's pretend fetch to end, so the page is checked with its numbers in. */
async function loaded(page: Page): Promise<void> {
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
}

/** Chooses `option` from the select whose name starts with `select`. */
async function choose(
  page: Page,
  select: string,
  option: string,
): Promise<void> {
  await page
    .getByRole("combobox", { name: new RegExp(`^${select}`) })
    .first()
    .click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

const roasteryInteractions: Readonly<
  Record<string, readonly ButteryInteraction[]>
> = {
  roastery: [
    {
      name: "close the first-visit announcement",
      run: pressIfShown("button", "Got it"),
    },
    {
      name: "open the workspace menu, from the navigation sheet on a phone",
      run: async (page: Page) => {
        const sheet = page.getByRole("button", {
          name: "Open navigation",
          exact: true,
        });
        if (await sheet.isVisible()) await sheet.click();
        await page
          .getByRole("button", { name: "Workspace: Halfmoon Roastery" })
          .click();
      },
    },
    escape,
    {
      name: "close the navigation sheet where it opened",
      run: async (page: Page) => {
        const sheet = page.getByRole("dialog", { name: "Halfmoon Roastery" });
        if (await sheet.isVisible()) await page.keyboard.press("Escape");
      },
    },
    { name: "start a new order", run: press("New order") },
    escape,
    {
      name: "open help, docked or as a sheet",
      run: async (page: Page) => {
        const help = page.getByRole("button", { name: "Help", exact: true });
        if (await help.isVisible()) await help.click();
        else {
          await page.getByRole("button", { name: /^More app actions/ }).click();
          await page.getByRole("menuitem", { name: "Help" }).click();
        }
        await page
          .getByRole("dialog", { name: "Help" })
          .or(page.getByRole("complementary", { name: "Help" }))
          .first()
          .waitFor();
      },
    },
    escape,
    {
      name: "search for orders",
      run: async (page: Page) => {
        await page
          .getByRole("combobox", { name: "Search", exact: true })
          .click();
        await page.keyboard.type("reading");
        await page.getByRole("listbox").waitFor();
      },
    },
    escape,
    escape,
    {
      name: "show the last 12 months by month against the year before",
      run: async (page: Page) => {
        await choose(page, "Date range", "Last 12 months");
        await choose(page, "Interval", "Monthly");
        await choose(page, "Comparison", "Previous year");
        await loaded(page);
      },
    },
  ],
  "roastery/orders": [
    {
      name: "switch to another saved view, its rows loading first",
      run: async (page: Page) => {
        const view = page.getByRole("radio", { name: "Unpaid", exact: true });
        if (await view.isVisible()) await view.click();
        else {
          await page.getByRole("button", { name: "More views" }).click();
          await page
            .getByRole("menuitemradio", { name: "Unpaid", exact: true })
            .click();
        }
        await loaded(page);
      },
    },
    {
      name: "open the dialog that renames the view",
      run: async (page: Page) => {
        await page.getByRole("button", { name: "More views" }).click();
        await page
          .getByRole("menuitem", { name: "Rename view", exact: true })
          .click();
      },
    },
    escape,
    { name: "open the filters", run: openFilter("Channel") },
    escape,
    {
      name: "select an order",
      run: async (page: Page) => {
        await page
          .getByRole("checkbox", { name: /^Select ord_/ })
          .first()
          .check();
      },
    },
    {
      name: "export, showing a toast while the setup guide is open",
      run: async (page: Page) => {
        await headerAction("Export")(page);
        await page.getByRole("region", { name: "Notifications (F8)" }).hover();
      },
    },
  ],
  "roastery/customers": [{ name: "open the filters", run: openFilter("City") }],
  "roastery/wholesale": [
    {
      name: "show the accounts as a list",
      allowMove: ['[data-bt="AppPage"]'],
      run: async (page: Page) => {
        await page.getByRole("radio", { name: "List", exact: true }).click();
      },
    },
  ],
  "roastery/settings/team": [
    { name: "invite someone", run: press("Invite someone") },
  ],
  "roastery/settings/profile": [
    { name: "change the password", run: press("Change") },
  ],
  "roastery/settings/plans": [
    { name: "try a plan", run: press("Try Roaster") },
  ],
};

const roasteryPages = [
  "roastery/orders",
  "roastery/customers",
  "roastery/subscriptions",
  "roastery/payouts",
  "roastery/roasts",
  "roastery/stock",
  "roastery/wholesale",
  "roastery/wholesale/prices",
  "roastery/settings",
  "roastery/settings/pickup",
  "roastery/settings/team",
  "roastery/settings/fraud",
  "roastery/settings/profile",
  "roastery/settings/notifications",
  "roastery/settings/team-notifications",
  "roastery/settings/plans",
  "roastery/search?q=decaf",
  "roastery/search?q=status%3Arefunded",
];

for (const route of roasteryPages) {
  test(`${route} is buttery`, async ({ page }) => {
    await returningVisitor(page);
    await page.goto(url(route));
    await expectButtery(page, {
      ...matrix,
      name: route,
      interactions: roasteryInteractions[route],
    });
  });
}

test("a roastery customer's page is buttery", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/demos/roastery/customers");
  await page
    .locator('[data-bt="DataTable"] [data-bt-part="data-table-link"]')
    .first()
    .click();
  await page.getByRole("tablist", { name: "Customer" }).waitFor();
  await expectButtery(page, {
    ...matrix,
    name: "roastery customer",
    interactions: [
      {
        name: "show their orders",
        allowMove: [
          '[data-bt="AppPage"] [data-bt-part="aside"]',
          '[data-bt="AppPage"] [data-bt-part="footer"]',
        ],
        run: async (target: Page) => {
          await target
            .getByRole("tab", { name: "Orders", exact: true })
            .click();
        },
      },
    ],
  });
});

test("the roastery's delivery nudge is buttery open beside its bell", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "buttery:announcement:roastery-roast-planning",
      "true",
    );
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos/roastery");
  await page
    .getByRole("dialog", { name: "2 customers asked about delivery" })
    .waitFor();
  await expectButtery(page, {
    name: "roastery with its nudge open",
    viewports: [{ width: 1280, height: 800 }],
    themes: ["light", "dark"],
  });
});

test("the roastery's sidebar, menus and guide are buttery with the sidebar full and as a rail", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/demos/roastery");
  await expectButtery(page, {
    name: "roastery with its sidebar full",
    viewports: [{ width: 1280, height: 800 }],
    interactions: [
      {
        name: "open the workspace menu",
        run: async (target: Page) => {
          await target
            .getByRole("button", { name: "Workspace: Halfmoon Roastery" })
            .click();
        },
      },
      escape,
      {
        name: "open the Wholesale group",
        allowMove: ['[data-bt="Sidebar"]'],
        run: press("Wholesale"),
      },
      {
        name: "open the setup guide",
        allowMove: ['[data-bt="SetupGuide"]'],
        run: press("Show all steps"),
      },
      { name: "open What's new", run: press("What's new") },
      escape,
    ],
  });
  await page.setViewportSize({ width: 960, height: 640 });
  await page.goto("/demos/roastery/orders");
  await expectButtery(page, {
    name: "roastery with its sidebar as a rail",
    viewports: [{ width: 960, height: 640 }],
    interactions: [
      {
        name: "open the Wholesale group's flyout",
        run: press("Wholesale"),
      },
      escape,
      {
        name: "scroll the orders table sideways",
        allowMove: ['[data-bt="DataTable"]'],
        run: async (target: Page) => {
          await target
            .locator('[data-bt="DataTable"] > [data-bt-part="scroll"]')
            .evaluate((scroller) => {
              scroller.scrollLeft = scroller.scrollWidth;
            });
        },
      },
    ],
  });
});

/** Window sizes from 1728 × 1117 through 960 × 640 to 390 × 844, about 96px apart, both sides changing together. */
function resizeSteps(): readonly ButteryViewport[] {
  const stops: readonly ButteryViewport[] = [
    { width: 1728, height: 1117 },
    { width: 960, height: 640 },
    { width: 390, height: 844 },
  ];
  return stops.flatMap((from, index) => {
    const to = stops[index + 1];
    if (!to) return [from];
    const count = Math.ceil((from.width - to.width) / 96);
    return Array.from({ length: count }, (_, step) => ({
      width: Math.round(from.width + ((to.width - from.width) * step) / count),
      height: Math.round(
        from.height + ((to.height - from.height) * step) / count,
      ),
    }));
  });
}

test("Card Studio resizes from 1728 to 390 without an overlap or overflow, folding its header and inspector", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1728, height: 1117 });
  await page.goto("/demos/card-studio?chrome=0");
  const more = page.getByRole("button", { name: "More actions", exact: true });
  const sheet = page.getByRole("button", { name: "Edit card", exact: true });
  const inspector = page.locator(
    '[data-bt="AppShell"] > [data-bt-part="inspector"]',
  );
  await expectButtery(page, {
    name: "card-studio at 1728 with its canvas shape list open",
    viewports: [{ width: 1728, height: 1117 }],
    interactions: [
      {
        name: "open the canvas shape list",
        run: async (target: Page) => {
          await target.getByRole("combobox", { name: /^Canvas shape/ }).click();
          await target.getByRole("listbox", { name: "Canvas shape" }).waitFor();
        },
      },
      escape,
    ],
  });
  for (const viewport of resizeSteps()) {
    await page.setViewportSize(viewport);
    await expectButtery(page, {
      name: `card-studio resized to ${String(viewport.width)}`,
      viewports: [viewport],
      densities: ["comfortable", "compact"],
    });
    const narrow = viewport.width < 840;
    const at = `at ${String(viewport.width)} × ${String(viewport.height)}`;
    await expect(sheet, at).toBeVisible({ visible: narrow });
    await expect(inspector, at).toHaveCount(narrow ? 0 : 1);
  }
  await expect(more).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Resize", exact: true }),
  ).toBeHidden();

  await page.setViewportSize({ width: 1728, height: 1117 });
  await expect(more).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Resize", exact: true }),
  ).toBeVisible();
  await expect(inspector).toHaveCount(1);
});
