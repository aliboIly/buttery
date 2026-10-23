import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { releasesIn } from "../vite/whats-new.ts";
import { demoPages } from "../src/routes.ts";
import { componentRoutes } from "./routes.ts";

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

test("the landing page says under its command where the command runs, linking Installation", async ({
  page,
}) => {
  await page.goto("/");
  const command = page.locator(".docs-copy-line", {
    hasText: "pnpm new-app my-app",
  });
  const note = page.getByText(/^Run it in a clone of the buttery repository/);
  await expect(note).toBeVisible();
  const [above, below] = await Promise.all([
    command.boundingBox(),
    note.boundingBox(),
  ]);
  expect(below && above && below.y).toBeGreaterThanOrEqual(
    above ? above.y + above.height : Number.POSITIVE_INFINITY,
  );
  await note.getByRole("link", { name: "Installation" }).click();
  await expect(page).toHaveURL(/\/get-started\/installation$/);
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

test("the docs search opens on the group with the best result, an exact title at its top", async ({
  page,
}) => {
  await page.goto("/foundations/colors");
  const field = page.getByRole("combobox", { name: "Search the docs" });
  const first = page
    .getByRole("listbox", { name: "Results" })
    .getByRole("group")
    .first();
  for (const [query, group, title] of [
    ["theme", "Foundations", "Theming"],
    ["colors", "Foundations", "Colors"],
    ["Bring your brand", "Guides", "Bring your brand"],
  ] as const) {
    await field.fill(query);
    await expect(first).toHaveAttribute("aria-label", group);
    await expect(
      first
        .getByRole("option")
        .first()
        .locator('[data-bt-part="command-search-label"]'),
    ).toHaveText(title);
  }
});

test("the docs search shows its / hint only where a keyboard is likely", async ({
  page,
  browser,
  baseURL,
}) => {
  const hint = (on: Page): Locator =>
    on.locator('[data-bt="CommandSearch"] [data-bt-part="shortcut"]');
  await page.goto("/foundations/colors");
  await expect(hint(page)).toBeVisible();
  const phone = await browser.newContext({
    ...(baseURL === undefined ? {} : { baseURL }),
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const touch = await phone.newPage();
  await touch.goto("/foundations/colors");
  await expect(
    touch.getByRole("combobox", { name: "Search the docs" }),
  ).toBeVisible();
  await expect(hint(touch)).toBeHidden();
  await phone.close();
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
  await expect(
    page.getByRole("heading", { level: 1, name: "Button" }),
  ).toBeVisible();
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

test("the component: filter keeps components from every section, under their sections", async ({
  page,
}) => {
  await page.goto("/search?q=component%3Astack");
  await expect(
    page
      .getByRole("region", { name: "Layout" })
      .getByRole("link", { name: /^Stack/ }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Props" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Examples" })).toHaveCount(0);
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

test("an address with no page says so, with a search holding its words and a link to each section", async ({
  page,
}) => {
  await page.goto("/get-started/instalation");
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Page not found · buttery");
  const main = page.getByRole("main");
  await expect(
    main.getByRole("combobox", { name: "Search the docs" }),
  ).toHaveValue("instalation");
  const sections = main.getByRole("region", { name: "Sections" });
  await expect(sections.getByRole("link", { name: "Demos" })).toHaveAttribute(
    "href",
    "/demos",
  );
  await sections.getByRole("link", { name: "Get started" }).click();
  await expect(page).toHaveURL(/\/get-started\/introduction$/);
});

test("a section's own address opens the section's first page", async ({
  page,
}) => {
  await page.goto("/foundations?theme=dark");
  await expect(page).toHaveURL(/\/foundations\/colors\?theme=dark$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Colors" }),
  ).toBeVisible();
  await page.goto("/get-started/");
  await expect(page).toHaveURL(/\/get-started\/introduction$/);
  await page.goto("/components");
  await expect(page).toHaveURL(/\/components\/overview$/);
});

test("the components overview lists every component by group, and the site's ways to it open it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page
      .getByRole("region", { name: "Explore" })
      .getByText(
        `${String(componentRoutes.filter(({ route }) => route.startsWith("components/")).length)} components`,
      ),
  ).toBeVisible();
  await page.getByRole("link", { name: "Browse components" }).click();
  await expect(page).toHaveURL(/\/components\/overview$/);
  const main = page.getByRole("main");
  await expect(
    main.getByRole("heading", { level: 1, name: "All components" }),
  ).toBeVisible();
  const tables = main.getByRole("table");
  for (const { name, route } of componentRoutes.filter((entry) =>
    entry.route.startsWith("components/"),
  ))
    await expect(
      tables.getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", `/${route}`);
  await page.getByRole("button", { name: "Components", exact: true }).click();
  const menu = page.locator('[data-bt-part="panel"]');
  await expect(
    menu.getByRole("link", { name: "Every component" }),
  ).toHaveAttribute("href", "/components/overview");
  await menu.getByRole("link", { name: /^Inputs/ }).click();
  await expect(page).toHaveURL(/\/components\/overview#inputs$/);
  await expect(
    main.getByRole("heading", { level: 2, name: "Inputs" }),
  ).toBeInViewport();
});

test("the demos have a tile among the landing page's Explore tiles and a column in the Resources menu", async ({
  page,
}) => {
  await page.goto("/");
  const explore = page.getByRole("region", { name: "Explore" });
  await expect(
    explore.getByRole("heading", { level: 3, name: "Templates" }),
  ).toBeVisible();
  await expect(
    explore.getByText(`${String(demoPages.length)} demos`),
  ).toBeVisible();
  await expect(
    explore.getByRole("link", { name: "Open Demos" }),
  ).toHaveAttribute("href", "/demos");
  await page.getByRole("button", { name: "Resources", exact: true }).click();
  const menu = page.locator('[data-bt-part="panel"]');
  await expect(menu.getByRole("link", { name: "All demos" })).toHaveAttribute(
    "href",
    "/demos",
  );
  for (const demo of demoPages)
    await expect(
      menu.getByRole("link", { name: demo.title, exact: true }),
    ).toHaveAttribute("href", `/demos/${demo.route}`);
});

test("a Markdown address with no page answers 404", async ({ request }) => {
  const missing = await request.get("/get-started/instalation.md");
  expect(missing.status()).toBe(404);
  expect(missing.headers()["content-type"]).toContain("text/plain");
  const found = await request.get("/get-started/installation.md");
  expect(found.status()).toBe(200);
  expect(await found.text()).toMatch(/^# Installation\n/);
});
