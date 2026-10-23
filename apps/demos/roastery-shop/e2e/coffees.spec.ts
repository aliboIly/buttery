import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
});

test("the coffees filter by roast and origin, say how many match and offer them all back when none do", async ({
  page,
}) => {
  const coffees = page.locator("#coffees");
  await expect(coffees.getByText("6 coffees", { exact: true })).toBeVisible();
  await coffees.getByRole("radio", { name: "Light", exact: true }).click();
  await expect(coffees.getByText("2 coffees", { exact: true })).toBeVisible();
  await expect(coffees.getByRole("article")).toHaveCount(2);
  await coffees.getByRole("combobox", { name: /^Origin/ }).click();
  await page.getByRole("option", { name: "Kenya", exact: true }).click();
  await expect(coffees.getByText("1 coffee", { exact: true })).toBeVisible();
  await coffees.getByRole("radio", { name: "Dark", exact: true }).click();
  await expect(
    coffees.getByRole("heading", { name: "No coffee matches both" }),
  ).toBeVisible();
  await coffees.getByRole("button", { name: "Show all six coffees" }).click();
  await expect(coffees.getByRole("article")).toHaveCount(6);
  await expect(
    coffees.getByRole("radio", { name: "All", exact: true }),
  ).toBeFocused();
});

test("the coffees sort by price and show as a list, each bag a tile at the start of its row", async ({
  page,
}) => {
  const coffees = page.locator("#coffees");
  await coffees.getByRole("combobox", { name: "Sort by Featured" }).click();
  await page
    .getByRole("option", { name: "Price, low to high", exact: true })
    .click();
  await expect(coffees.getByRole("article").first()).toHaveAccessibleName(
    "Halfmoon House",
  );
  await expect(coffees.getByRole("article").last()).toHaveAccessibleName(
    "Nyeri",
  );
  await coffees.getByRole("radio", { name: "List", exact: true }).click();
  const [first, second] = await coffees.getByRole("article").all();
  if (!first || !second) throw new Error("The coffees aren't there.");
  const above = await first.boundingBox();
  const below = await second.boundingBox();
  expect(below?.y ?? 0).toBeGreaterThan((above?.y ?? 0) + (above?.height ?? 0));
  const tile = await first
    .locator('[data-bt-part="catalog-card-media"]')
    .boundingBox();
  expect(tile?.width).toBe(64);
  expect(tile?.height).toBe(64);
});

test("a coffee opens into its details from its card, back to its title on Escape, and its quick add puts a 12 oz bag in the bag", async ({
  page,
}) => {
  const coffees = page.locator("#coffees");
  await coffees
    .getByRole("button", { name: "Add to bag: Huila, 12 oz, whole bean" })
    .click();
  await expect(page.getByRole("link", { name: /^Bag, / })).toHaveAccessibleName(
    "Bag, 1 item",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const title = coffees.getByRole("button", { name: "Huila", exact: true });
  await title.click();
  const dialog = page.getByRole("dialog", { name: "Huila" });
  await expect(dialog).toContainText("Red apple, caramel, cocoa");
  await expect(
    dialog.getByRole("button", { name: "Add to bag · $17.00" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(title).toBeFocused();
});

test("a brew guide's coffee opens its card's details, whatever the filters were", async ({
  page,
}) => {
  const coffees = page.locator("#coffees");
  await coffees.getByRole("radio", { name: "Dark", exact: true }).click();
  await expect(coffees.getByRole("article")).toHaveCount(1);
  await page.getByRole("link", { name: "Brew it with Guji" }).click();
  await expect(page.getByRole("dialog", { name: "Guji" })).toContainText(
    "Peach, jasmine, bergamot",
  );
  await page.keyboard.press("Escape");
  await expect(coffees.getByRole("article")).toHaveCount(6);
  await expect(
    coffees.getByRole("button", { name: "Guji", exact: true }),
  ).toBeFocused();
});
