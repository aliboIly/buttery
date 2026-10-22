import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/** The stage of the example whose heading has `id`, on a component's page or a written page. */
function exampleStage(page: Page, id: string): Locator {
  return page.locator(`#${id}`).locator("xpath=../..").locator(".pg-stage");
}

test("a page-scale component's examples lay out at a desktop's width, scaled down to fit, and stay live", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/patterns/app-shell");
  const editor = exampleStage(page, "appshell-editor-screen-example");
  const shell = editor.locator('[data-bt="AppShell"]');
  await expect(shell.locator('> [data-bt-part="inspector"]')).toBeVisible();
  await expect(editor.getByRole("button", { name: "Edit" })).toHaveCount(0);
  const { laidOut, drawn, stage } = await shell.evaluate((element) => ({
    laidOut: element instanceof HTMLElement ? element.offsetWidth : 0,
    drawn: element.getBoundingClientRect().width,
    stage: element.closest(".pg-stage")?.getBoundingClientRect().width ?? 0,
  }));
  expect(laidOut).toBeGreaterThanOrEqual(1200);
  expect(drawn).toBeLessThanOrEqual(stage);

  const dashboard = exampleStage(page, "appshell-roastery-dashboard-example");
  await expect(dashboard.locator('[data-bt="AppShell"]')).toHaveAttribute(
    "data-sidebar",
    "full",
  );
  await dashboard.getByRole("button", { name: "New order" }).click();
  await expect(dashboard.getByText("Order 1054 · Corner Café")).toBeVisible();
});

test("in a narrow frame a page-scale component's examples lay out at its width, at full size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/patterns/app-shell");
  const editor = exampleStage(page, "appshell-editor-screen-example");
  await expect(editor.getByRole("button", { name: "Edit" })).toBeVisible();
  const dashboard = exampleStage(page, "appshell-roastery-dashboard-example");
  await expect(dashboard.locator('[data-bt="AppShell"]')).toHaveAttribute(
    "data-sidebar",
    "sheet",
  );
  await expect(page.locator("[data-bt-preview]")).toHaveCount(0);
});

test("an example that keeps itself narrower than its frame isn't drawn smaller", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/patterns/app-shell");
  const phone = exampleStage(page, "appshell-phone-sheet-example");
  await expect(phone.locator("[data-bt-preview]")).toHaveCount(0);
  const open = phone.getByRole("button", { name: "Adjust card" });
  await expect(open).toBeVisible();
  expect((await open.boundingBox())?.height).toBeGreaterThanOrEqual(28);
});
