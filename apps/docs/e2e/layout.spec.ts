import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
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

/**
 * Scrolls a target to the middle of the window before pressing it, so the floating lanes at the window's
 * foot (the docs pill, a toast) never sit over what it opens from.
 */
async function pressInMiddle(target: Locator): Promise<void> {
  await target.evaluate((element) => {
    element.scrollIntoView({ block: "center" });
  });
  await target.click();
}

/** The Halfmoon shop's bag: a link among the bar's actions, or a button beside its brand once it folds. */
function shopBag(page: Page): Locator {
  return page
    .getByRole("link", { name: /^Bag, / })
    .or(page.getByRole("button", { name: /^Bag, / }));
}

/** What a change to the Halfmoon shop's coffees moves: the cards, everything after them and the pill. */
const SHOP_BELOW_COFFEES = [
  "#coffees",
  "#coffees ~ *",
  '[data-bt="Footer"]',
  PILL,
];

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
    { name: "open the actions menu", run: press("Manage card") },
    escape,
    { name: "open the view menu", run: press("View") },
  ],
  deckhand: [
    {
      name: "open the slide size list or the More menu",
      run: async (page: Page) => {
        const select = page
          .getByRole("combobox", { name: /^Slide size/ })
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
    { name: "open the new slide menu", run: press("New slide") },
    escape,
    {
      name: "arrange the words, the docs pill rising above the toolbar",
      run: headerAction("Arrange"),
      allowMove: [PILL],
      acrossMatrix: true,
    },
    {
      name: "finish arranging",
      run: press("Done"),
      allowMove: [PILL],
    },
    {
      name: "present the deck",
      run: async (page: Page) => {
        await headerAction("Present")(page);
        await page.getByRole("dialog", { name: /^Presenting/ }).waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "move on a slide in the presentation",
      run: async (page: Page) => {
        await page.keyboard.press("ArrowRight");
      },
      acrossMatrix: true,
    },
    escape,
    {
      name: "delete every slide, showing the empty state (its toast is checked at the first condition, before it leaves)",
      run: async (page: Page) => {
        for (let count = 0; count < 6; count += 1)
          await headerAction("Delete slide")(page);
      },
      allowMove: ['[data-testid="slide-strip"]', PILL],
      acrossMatrix: true,
    },
    {
      name: "add a slide from the empty state",
      run: press("New slide"),
      allowMove: ['[data-testid="slide-strip"]', PILL],
    },
    {
      name: "open the inspector sheet when it's narrow",
      run: pressIfShown("button", "Edit slide"),
    },
    escape,
    {
      name: "rename the deck",
      run: async (page: Page) => {
        await headerAction("Rename deck")(page);
        await page.getByRole("dialog", { name: "Rename deck" }).waitFor();
      },
    },
    escape,
    {
      name: "open the tour from Help",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Help", exact: true })
          .first()
          .click();
        await page
          .getByRole("dialog", { name: "Write in the inspector" })
          .waitFor();
      },
    },
  ],
  "roastery-shop": [
    {
      name: "open the bar's sheet",
      run: async (page: Page) => {
        await page.getByRole("button", { name: "Menu", exact: true }).click();
        await page.getByRole("dialog", { name: "Main" }).waitFor();
      },
    },
    {
      name: "open the Shop menu in the sheet",
      allowMove: ['[data-bt-part="sheet"]'],
      run: async (page: Page) => {
        await page
          .getByRole("dialog", { name: "Main" })
          .getByRole("button", { name: "Shop", exact: true })
          .click();
      },
    },
    {
      name: "open the Learn menu in the sheet",
      allowMove: ['[data-bt-part="sheet"]'],
      run: async (page: Page) => {
        await page
          .getByRole("dialog", { name: "Main" })
          .getByRole("button", { name: "Learn", exact: true })
          .click();
      },
    },
    escape,
    {
      name: "add this week's coffee, which shows a toast",
      allowMove: [PILL],
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Add to bag · $19.00", exact: true })
          .click();
        await page
          .getByText("Guji, 12 oz, is in your bag.", { exact: true })
          .first()
          .waitFor();
      },
    },
    {
      name: "open the bag with the coffee in it, from the top of the page",
      run: async (page: Page) => {
        await page.evaluate(() => {
          window.scrollTo(0, 0);
        });
        await shopBag(page).click();
        await page.getByRole("dialog", { name: "Your bag" }).waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "check out with the shipping form empty, which says what it needs",
      allowMove: ['[role="dialog"]'],
      run: async (page: Page) => {
        await page.getByRole("button", { name: "Check out" }).click();
        await page.getByRole("button", { name: "Payment" }).click();
        await page
          .getByText("Enter your email address, so we can send your receipt.", {
            exact: true,
          })
          .first()
          .waitFor();
      },
      acrossMatrix: true,
    },
    escape,
    {
      name: "show only the dark roasts",
      allowMove: SHOP_BELOW_COFFEES,
      run: async (page: Page) => {
        await pressInMiddle(
          page.getByRole("radio", { name: "Dark", exact: true }),
        );
      },
    },
    {
      name: "open the coffee that's left",
      run: async (page: Page) => {
        await pressInMiddle(
          page.locator('[data-bt="ExpandableCard"]').filter({
            hasText: "Halfmoon House",
          }),
        );
        await page.getByRole("dialog", { name: "Halfmoon House" }).waitFor();
      },
      acrossMatrix: true,
    },
    escape,
    {
      name: "build a gift subscription",
      allowMove: ["#subscribe", "#subscribe ~ *", '[data-bt="Footer"]', PILL],
      run: async (page: Page) => {
        await pressInMiddle(
          page.getByRole("radio", { name: "As a gift", exact: true }),
        );
      },
    },
    {
      name: "add the gift with nobody to send it to, which asks who it's for",
      allowMove: ["#subscribe", "#subscribe ~ *", '[data-bt="Footer"]', PILL],
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Add the gift to your bag" })
          .click();
        await page
          .getByText("Enter the name of the person it's for.", { exact: true })
          .first()
          .waitFor();
      },
    },
    {
      name: "open a question",
      allowMove: ["#questions", "#questions ~ *", '[data-bt="Footer"]', PILL],
      run: async (page: Page) => {
        await pressInMiddle(
          page.getByRole("button", { name: "How much is shipping?" }),
        );
      },
    },
    {
      name: "send the letter's form empty, which shows its error",
      allowMove: ["#letter", '[data-bt="Footer"]', PILL],
      run: async (page: Page) => {
        await pressInMiddle(
          page.getByRole("button", { name: "Send me the letter" }),
        );
        await page
          .getByText("Enter your email address to get the letter.", {
            exact: true,
          })
          .first()
          .waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "sign up for the letter, which shows a toast",
      allowMove: ["#letter", '[data-bt="Footer"]', PILL],
      run: async (page: Page) => {
        await page
          .getByRole("textbox", { name: "Email address" })
          .fill("ines@example.com");
        await page.getByRole("button", { name: "Send me the letter" }).click();
        await page
          .getByText("You're on the list for the next letter.", { exact: true })
          .first()
          .waitFor();
      },
    },
    {
      name: "sign in from the bar's sheet",
      run: async (page: Page) => {
        await page.getByRole("button", { name: "Menu", exact: true }).click();
        await page
          .getByRole("dialog", { name: "Main" })
          .getByRole("link", { name: "Sign in", exact: true })
          .click();
        await page.getByRole("dialog", { name: "Sign in" }).waitFor();
      },
    },
    {
      name: "ask to create an account instead",
      allowMove: ['[role="dialog"]'],
      run: async (page: Page) => {
        await page
          .getByRole("dialog", { name: "Sign in" })
          .getByRole("link", { name: "Create an account" })
          .click();
        await page.getByRole("dialog", { name: "Create an account" }).waitFor();
      },
      acrossMatrix: true,
    },
    {
      name: "go back to sign in and ask to reset the password",
      allowMove: ['[role="dialog"]'],
      run: async (page: Page) => {
        await page
          .getByRole("dialog", { name: "Create an account" })
          .getByRole("link", { name: "Sign in", exact: true })
          .click();
        await page
          .getByRole("dialog", { name: "Sign in" })
          .getByRole("link", { name: "Forgot your password?" })
          .click();
        await page
          .getByRole("dialog", { name: "Reset your password" })
          .waitFor();
      },
      acrossMatrix: true,
    },
    escape,
  ],
  "app-shell": [
    {
      name: "open the inspector sheet on the narrow example",
      run: async (page: Page) => {
        await page
          .getByRole("button", { name: "Edit gift card", exact: true })
          .first()
          .click();
        await page
          .getByRole("dialog", { name: "Gift card settings" })
          .waitFor();
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
          .getByRole("button", { name: "Delete price list", exact: true })
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
          .getByRole("region", { name: "CommandSearch variants and states" })
          .getByRole("combobox", { name: "Search", exact: true })
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
          .getByRole("button", { name: "Open Tilt it in 3D", exact: true })
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
    {
      name: "open the menu with a story, whose card opens over the example after it",
      run: async (page: Page) => {
        const stage = page
          .locator("#menus-with-a-story-example")
          .locator("xpath=../..")
          .locator(".pg-stage");
        const product = stage.getByRole("button", {
          name: "Product",
          exact: true,
        });
        await product.evaluate((element) => {
          element.scrollIntoView({ block: "center" });
        });
        await product.click();
        await stage
          .locator('[data-bt-part="panel"] > [data-bt-part="body"]')
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
          .first()
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
  "page-dots": [
    {
      name: "move on a step",
      run: async (page: Page) => {
        await page
          .getByRole("region", { name: "PageDots variants and states" })
          .getByRole("button", { name: "Next", exact: true })
          .click();
      },
    },
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

test("the not-found page is buttery, its search open", async ({ page }) => {
  await page.goto("/get-started/instalation");
  await expectButtery(page, {
    ...matrix,
    name: "not-found",
    interactions: [
      {
        name: "open the page's search on what the address asked for",
        run: async () => {
          await page
            .getByRole("main")
            .getByRole("combobox", { name: "Search the docs" })
            .click();
          await page
            .getByRole("option", { name: /Installation/ })
            .first()
            .waitFor();
        },
        acrossMatrix: true,
      },
    ],
  });
});

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
  await page.goto("/foundations/colors");
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
        name: "open the Resources menu with its demos, where the bar isn't folded",
        run: async (page: Page) => {
          const resources = page
            .getByRole("button", { name: "Resources", exact: true })
            .first();
          if (!(await resources.isVisible())) return;
          await resources.click();
          await page
            .locator('[data-bt-part="panel"]')
            .getByRole("link", { name: "All demos" })
            .waitFor();
        },
      },
      escape,
      {
        name: "open the display settings",
        run: pressIfShown("button", "Display settings"),
      },
      { name: "switch to dark", run: pressIfShown("radio", "Dark") },
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

test("demos/roastery-shop is buttery on a wide window, through its menus, sign-in, bag and checkout", async ({
  page,
}) => {
  const wide = { width: 1280, height: 800 };
  await page.setViewportSize(wide);
  await page.goto("/demos/roastery-shop");
  await expectButtery(page, {
    ...matrix,
    viewports: [wide],
    name: "demos/roastery-shop on a wide window",
    interactions: [
      {
        name: "open the Shop menu",
        run: async (target: Page) => {
          await target
            .getByRole("button", { name: "Shop", exact: true })
            .click();
          await target.locator('[data-bt-part="panel"]').first().waitFor();
        },
      },
      {
        name: "move to the Learn menu",
        run: async (target: Page) => {
          await target
            .getByRole("button", { name: "Learn", exact: true })
            .hover();
          await target
            .getByRole("button", { name: "Learn", expanded: true })
            .waitFor();
        },
      },
      escape,
      {
        name: "open the sign-in dialog",
        run: async (target: Page) => {
          await target
            .getByRole("link", { name: "Sign in", exact: true })
            .click();
          await target.getByRole("dialog", { name: "Sign in" }).waitFor();
        },
      },
      {
        name: "ask to create an account instead",
        allowMove: ['[role="dialog"]'],
        run: async (target: Page) => {
          await target
            .getByRole("dialog", { name: "Sign in" })
            .getByRole("link", { name: "Create an account" })
            .click();
          await target
            .getByRole("dialog", { name: "Create an account" })
            .waitFor();
        },
      },
      {
        name: "create an account with nothing filled in, which lists what's missing",
        allowMove: ['[role="dialog"]'],
        run: async (target: Page) => {
          await target
            .getByRole("dialog", { name: "Create an account" })
            .getByRole("button", { name: "Create account", exact: true })
            .click();
          await target.getByText("There's a problem").waitFor();
        },
      },
      {
        name: "go back to sign in",
        allowMove: ['[role="dialog"]'],
        run: async (target: Page) => {
          await target
            .getByRole("dialog", { name: "Create an account" })
            .getByRole("link", { name: "Sign in", exact: true })
            .click();
          await target.getByRole("dialog", { name: "Sign in" }).waitFor();
        },
      },
      {
        name: "sign in with nothing filled in, which lists what's missing",
        allowMove: ['[role="dialog"]'],
        run: async (target: Page) => {
          await target
            .getByRole("dialog", { name: "Sign in" })
            .getByRole("button", { name: "Sign in", exact: true })
            .click();
          await target.getByText("There's a problem").waitFor();
        },
      },
      {
        name: "sign in, which shows a toast and puts Account in the bar",
        allowMove: ['[data-bt-part="nav-bar-actions"]', PILL],
        run: async (target: Page) => {
          const dialog = target.getByRole("dialog", { name: "Sign in" });
          await dialog
            .getByRole("textbox", { name: "Email" })
            .fill("ines@example.com");
          await dialog.getByLabel("Password", { exact: true }).fill("halfmoon");
          await dialog
            .getByRole("button", { name: "Sign in", exact: true })
            .click();
          await target
            .getByRole("button", { name: "Account", exact: true })
            .waitFor();
        },
      },
      {
        name: "open the account menu",
        run: async (target: Page) => {
          await target
            .getByRole("button", { name: "Account", exact: true })
            .click();
          await target.getByRole("menu", { name: "Account" }).waitFor();
        },
      },
      escape,
      {
        name: "open the empty bag",
        run: async (target: Page) => {
          await shopBag(target).click();
          await target
            .getByRole("dialog", { name: "Your bag is empty" })
            .waitFor();
        },
      },
      escape,
      {
        name: "list the origins",
        run: async (target: Page) => {
          await pressInMiddle(
            target.getByRole("combobox", { name: /^Origin/ }),
          );
          await target.getByRole("listbox").waitFor();
        },
      },
      escape,
      {
        name: "put a gift subscription in the bag and open it",
        allowMove: ["#subscribe", "#subscribe ~ *", '[data-bt="Footer"]', PILL],
        run: async (target: Page) => {
          await pressInMiddle(
            target.getByRole("radio", { name: "As a gift", exact: true }),
          );
          await target.getByLabel("Their name").fill("Sam Okafor");
          await target.getByLabel("Their email").fill("sam@example.com");
          await target
            .getByRole("button", { name: "Add the gift to your bag" })
            .click();
          await shopBag(target).click();
          await target.getByRole("dialog", { name: "Your bag" }).waitFor();
        },
      },
      {
        name: "go on to the shipping form",
        allowMove: ['[role="dialog"]'],
        run: async (target: Page) => {
          await target.getByRole("button", { name: "Check out" }).click();
          await target.getByRole("dialog", { name: "Shipping" }).waitFor();
        },
      },
      {
        name: "fill in the shipping form and go on to payment",
        allowMove: ['[role="dialog"]'],
        run: async (target: Page) => {
          const form = target.getByRole("dialog", { name: "Shipping" });
          await form.getByLabel("Full name").fill("Ines Vale");
          await form.getByLabel("Street address").fill("2210 SE Ankeny St");
          await form.getByLabel("City").fill("Portland");
          await form.getByLabel("State").fill("OR");
          await form.getByLabel("ZIP code").fill("97214");
          await form.getByRole("button", { name: "Payment" }).click();
          await target.getByRole("dialog", { name: "Payment" }).waitFor();
        },
      },
      {
        name: "pay, which places the order",
        allowMove: ['[role="dialog"]'],
        run: async (target: Page) => {
          const form = target.getByRole("dialog", { name: "Payment" });
          await form.getByLabel("Card number").fill("4111 1111 1111 1111");
          await form.getByLabel("Expiry").fill("08/28");
          await form.getByLabel("Security code").fill("123");
          await form.getByRole("button", { name: /^Pay / }).click();
          await target
            .getByRole("dialog", { name: "Thanks, your order is in" })
            .waitFor();
        },
      },
      escape,
    ],
  });
});

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

test("Deckhand resizes from 1728 to 390 without an overlap or overflow, folding its header and inspector", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1728, height: 1117 });
  await page.goto("/demos/deckhand?chrome=0");
  const more = page.getByRole("button", { name: "More actions", exact: true });
  const sheet = page.getByRole("button", { name: "Edit slide", exact: true });
  const arrange = page.getByRole("button", { name: "Arrange", exact: true });
  const inspector = page.locator(
    '[data-bt="AppShell"] > [data-bt-part="inspector"]',
  );
  await expectButtery(page, {
    name: "deckhand at 1728 with its slide size list open",
    viewports: [{ width: 1728, height: 1117 }],
    interactions: [
      {
        name: "open the slide size list",
        run: async (target: Page) => {
          await target.getByRole("combobox", { name: /^Slide size/ }).click();
          await target.getByRole("listbox", { name: "Slide size" }).waitFor();
        },
      },
      escape,
    ],
  });
  for (const viewport of resizeSteps()) {
    await page.setViewportSize(viewport);
    await expectButtery(page, {
      name: `deckhand resized to ${String(viewport.width)}`,
      viewports: [viewport],
      densities: ["comfortable", "compact"],
    });
    const narrow = viewport.width < 840;
    const at = `at ${String(viewport.width)} × ${String(viewport.height)}`;
    await expect(sheet, at).toBeVisible({ visible: narrow });
    await expect(inspector, at).toHaveCount(narrow ? 0 : 1);
  }
  await expect(more).toBeVisible();
  await expect(arrange).toBeHidden();

  await page.setViewportSize({ width: 1728, height: 1117 });
  await expect(more).toBeHidden();
  await expect(arrange).toBeVisible();
  await expect(inspector).toHaveCount(1);
});
