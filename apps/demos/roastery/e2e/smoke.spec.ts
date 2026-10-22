import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/** Marks the first-visit announcement and nudge as seen, as they are for anyone coming back. */
async function returningVisitor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      "buttery:announcement:roastery-roast-planning",
      "true",
    );
    localStorage.setItem("buttery:nudge:roastery-delivery-questions", "true");
  });
}

for (const [path, title] of [
  ["/", "Overview"],
  ["/orders", /^Orders/],
  ["/wholesale/prices", /^Wholesale/],
  ["/settings/notifications", "Notifications"],
  ["/search?q=decaf", 'Results for "decaf"'],
] as const) {
  test(`opens ${path} on its own with no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await returningVisitor(page);
    await page.goto(path);
    await expect(page.locator("h1").first()).toHaveText(title);
    expect(errors).toEqual([]);
  });
}

test("links go to the demo's own paths, served from the root", async ({
  page,
}) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const team = page.getByRole("link", { name: "Team", exact: true });
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(team).toHaveAttribute("href", "/settings/team");
  await team.click();
  await expect(page).toHaveURL(/\/settings\/team$/);
  await expect(page.locator("h1").first()).toHaveText("Team");
  await page.goBack();
  await expect(page.locator("h1").first()).toHaveText("Overview");
});
