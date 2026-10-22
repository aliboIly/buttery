import { expect, test } from "@playwright/test";
import type { FrameLocator, Locator, Page } from "@playwright/test";
import { templates } from "../src/routes.ts";

/** What each template's preview shows as it opens, which says it's that template running. */
const OPENS_WITH: Readonly<
  Record<(typeof templates)[number]["name"], (frame: FrameLocator) => Locator>
> = {
  blank: (frame) =>
    frame.getByRole("heading", { level: 1, name: "🧈 buttery starter" }),
  dashboard: (frame) =>
    frame.getByRole("heading", { level: 1, name: "Overview" }),
  editor: (frame) =>
    frame.locator('[data-bt="HeaderBar"] [data-bt-part="title"]'),
  marketing: (frame) =>
    frame.getByRole("heading", {
      level: 1,
      name: "Plan the week in ten minutes.",
    }),
};

function preview(page: Page, title: string): FrameLocator {
  return page.frameLocator(`iframe[title="${title} template, live"]`);
}

for (const template of templates) {
  test(`the ${template.name} template's page runs the template live and gives both commands`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/templates/${template.name}`);
    await expect(
      page.getByRole("heading", { level: 1, name: template.title }),
    ).toBeVisible();
    await expect(
      OPENS_WITH[template.name](preview(page, template.title)),
    ).toBeVisible();
    await expect(
      page.getByText(`pnpm new-app my-app --template ${template.name}`),
    ).toBeVisible();
    await expect(
      page.getByText(`npx create-buttery my-app --template ${template.name}`),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open the preview on its own" }),
    ).toHaveAttribute("href", `/templates/${template.name}/preview`);
  });
}

test("a template's preview takes the site's theme", async ({ page }) => {
  await page.goto("/templates/editor?theme=dark");
  await expect(
    page.locator('iframe[title="Editor template, live"]'),
  ).toHaveAttribute("src", "/templates/editor/preview?theme=dark");
  const frame = preview(page, "Editor");
  await expect(frame.locator("html")).toHaveAttribute("data-bt-theme", "dark");
});

test("a preview opens on its own at a deep link, its links staying under its path", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/templates/dashboard/preview/orders");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Orders");
  await expect(page.locator(".docs-shell")).toHaveCount(0);
  const settings = page.getByRole("link", { name: "Settings", exact: true });
  await expect(settings).toHaveAttribute(
    "href",
    "/templates/dashboard/preview/settings",
  );
  await settings.click();
  await expect(page).toHaveURL(/\/templates\/dashboard\/preview\/settings$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Settings");
});
