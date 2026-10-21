import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { expectButtery, fullMatrix, quickMatrix } from "@buttery/test";
import type { ButteryInteraction, ButteryViewport } from "@buttery/test";
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

/** Presses a header action, from the More menu when it has folded away. */
function headerAction(name: string): ButteryInteraction["run"] {
  return async (page: Page) => {
    const direct = page.getByRole("button", { name, exact: true }).first();
    if (await direct.isVisible()) {
      await direct.click();
      return;
    }
    await page
      .getByRole("button", { name: "More actions", exact: true })
      .first()
      .click();
    await page.getByRole("menuitem", { name, exact: true }).click();
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
  menu: [
    { name: "open the actions menu", run: press("Card actions") },
    escape,
    { name: "open the view menu", run: press("View") },
  ],
  "card-studio": [
    {
      name: "enter resize mode",
      run: headerAction("Resize"),
      acrossMatrix: true,
    },
    {
      name: "discard the resize",
      run: press("Discard"),
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
          .getByRole("button", { name: /^Canvas shape/ })
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
      run: press("Canvas shape, Wide · 16:9"),
    },
    escape,
    {
      name: "open the list with width and height fields",
      run: async (page: Page) => {
        await page
          .getByRole("button", {
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
        const show = page.getByRole("button", {
          name: "Show a toast",
          exact: true,
        });
        for (let count = 0; count < 4; count += 1) await show.click();
        await page.getByRole("region", { name: "Notifications (F8)" }).hover();
      },
    },
    {
      name: "show a success, a warning and a danger toast (the centered stack widens to the widest one)",
      allowMove: ['[data-bt="Toaster"]'],
      run: async (page: Page) => {
        for (const tone of ["Success", "Warning", "Danger"]) {
          await page.getByRole("button", { name: tone, exact: true }).click();
        }
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
  await page.goto("/?chrome=0#/card-studio");
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
          await target.getByRole("button", { name: /^Canvas shape/ }).click();
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
