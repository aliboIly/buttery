import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { releasesIn } from "../vite/whats-new.ts";

test.use({ viewport: { width: 1280, height: 720 } });

const root = fileURLToPath(new URL("../../..", import.meta.url));

/** Puts the pointer in the middle of the part of the sidebar that's on screen. */
async function pointAtSidebar(page: Page, sidebar: Locator): Promise<void> {
  const box = await sidebar.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error("the sidebar isn't on screen");
  const top = Math.max(box.y, 0);
  const bottom = Math.min(box.y + box.height, viewport.height);
  await page.mouse.move(box.x + box.width / 2, (top + bottom) / 2);
}

test("the sidebar's whole list can be scrolled to with the pointer over it", async ({
  page,
}) => {
  await page.goto("/foundations/colors");
  const sidebar = page.getByRole("navigation", { name: "Pages" });
  const links = sidebar.getByRole("link");
  await expect(links.first()).toBeVisible();
  await pointAtSidebar(page, sidebar);
  for (let turn = 0; turn < 20; turn += 1) await page.mouse.wheel(0, 400);
  await expect(async () => {
    const last = await links.last().boundingBox();
    const viewport = page.viewportSize();
    expect(last && viewport && last.y + last.height).toBeLessThanOrEqual(
      viewport?.height ?? 0,
    );
  }).toPass();
});

test("at the bottom of a long page, scrolling up over the sidebar reaches its first link", async ({
  page,
}) => {
  await page.goto("/foundations/colors");
  const sidebar = page.getByRole("navigation", { name: "Pages" });
  const links = sidebar.getByRole("link");
  await expect(links.first()).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await pointAtSidebar(page, sidebar);
  for (let turn = 0; turn < 30; turn += 1) await page.mouse.wheel(0, -400);
  const header = page.locator(".docs-top");
  await expect(async () => {
    const first = await links.first().boundingBox();
    const band = await header.boundingBox();
    expect(first && band && first.y).toBeGreaterThanOrEqual(
      band ? band.y + band.height : Number.POSITIVE_INFINITY,
    );
  }).toPass();
});

test("the sidebar keeps the current page in view", async ({ page }) => {
  await page.goto("/resources/contributing");
  const current = page
    .getByRole("navigation", { name: "Pages" })
    .getByRole("link", { name: "Contributing" });
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(current).toBeInViewport({ ratio: 1 });
});

test("the landing page shows the newest three releases and opens every one", async ({
  page,
}) => {
  await page.goto("/");
  const whatsNew = page.getByRole("region", { name: "What's new" });
  await expect(whatsNew.getByRole("heading", { level: 3 })).toHaveText(
    releasesIn(root)
      .slice(0, 3)
      .map((release) => release.title),
  );
  await whatsNew
    .getByRole("link", { name: "Every release and change" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "What's new" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(
    releasesIn(root)[0]?.title ?? "",
  );
});

test("the landing page's settings card changes its preview", async ({
  page,
}) => {
  await page.goto("/");
  const tryIt = page.getByRole("region", { name: "Try it" });
  await tryIt.getByRole("radio", { name: "Nothing" }).click();
  await expect(tryIt.getByText("Reminders are off")).toBeVisible();
  await tryIt.getByRole("radio", { name: "Everything" }).click();
  await expect(tryIt.getByText("Starts in 15 minutes")).toBeVisible();
  await tryIt.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("menuitem", { name: "Snooze for an hour" }).click();
  await expect(tryIt.getByText("Snoozed for an hour")).toBeVisible();
});

test("the docs search previews the highlighted result, with a component's import", async ({
  page,
}) => {
  await page.goto("/foundations/colors");
  await page.getByRole("combobox", { name: "Search the docs" }).click();
  await page.keyboard.type("dialog");
  const preview = page.locator('[data-bt-part="command-search-preview"]');
  await expect(
    preview.getByText('import { Dialog } from "@buttery/react";'),
  ).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(preview.getByText("Dialog", { exact: true })).toBeHidden();
});

test("the docs search offers a nearby word when nothing matches", async ({
  page,
}) => {
  await page.goto("/foundations/colors");
  await page.getByRole("combobox", { name: "Search the docs" }).click();
  await page.keyboard.type("dailog");
  await expect(page.getByText('No results for "dailog"')).toBeVisible();
  const correction = page
    .getByRole("group", { name: "Did you mean" })
    .getByRole("option");
  await expect(correction).toHaveText("dialog");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("combobox", { name: "Search the docs" }),
  ).toHaveValue("dialog");
  await expect(
    page.getByRole("group", { name: "Components" }).getByRole("option").first(),
  ).toContainText("Dialog");
});

test("the skip link takes Tab past the top bar and the sidebar to the page", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "WebKit leaves links out of the tab order unless the system's keyboard setting puts them in.",
  );
  await page.goto("/components/button");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("main").getByRole("link", { name: "Components" }).first(),
  ).toBeFocused();
});

test("a component's live demo starts in the site's theme and density, then keeps its own", async ({
  page,
}) => {
  await page.goto("/components/button?theme=dark&density=compact");
  const demo = page.getByRole("region", { name: "Button demo" });
  await expect(demo.getByRole("radio", { name: "Dark" })).toBeChecked();
  await expect(demo.getByRole("radio", { name: "Compact" })).toBeChecked();
  await demo.getByRole("radio", { name: "Light" }).click();
  await expect(
    demo
      .getByTestId("live-demo")
      .locator("xpath=ancestor::*[@data-bt-theme][1]"),
  ).toHaveAttribute("data-bt-theme", "light");
});

test("the results page offers a nearby word and a way to ask for docs when nothing matches", async ({
  page,
}) => {
  await page.goto("/search?q=dailog");
  await expect(
    page.getByRole("link", { name: "Ask for these docs" }),
  ).toHaveAttribute("href", /\/issues\/new\?title=Docs%3A%20dailog$/);
  await page.getByRole("link", { name: "dialog", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?q=dialog$/);
  await expect(
    page.getByRole("link", { name: /Dialog/ }).first(),
  ).toBeVisible();
});
