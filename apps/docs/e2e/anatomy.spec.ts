import { expect, test } from "@playwright/test";
import { componentRoutes, url } from "./routes.ts";

test.use({ viewport: { width: 1280, height: 900 } });

/** A component page's sections, in the order `docs/DOCS_SITE.md` gives them. */
const PARTS = [
  "Demo",
  "When to use it",
  "Examples",
  "Variants and states",
  "Props",
  "Accessibility",
  "Motion",
  "Layout",
  "Related",
];

for (const { route, name } of componentRoutes) {
  test(`the ${name} page has every part of a component page, in order`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "The page's structure doesn't depend on the engine.",
    );
    await page.goto(url(route));
    const article = page.getByRole("main").getByRole("article");
    await expect(
      article.getByRole("heading", { level: 1, name, exact: true }),
    ).toBeVisible();
    await expect(
      article.getByRole("navigation", { name: "Breadcrumbs" }).first(),
    ).toBeVisible();
    await expect(
      article.getByText(new RegExp(`^import \\{ ${name} \\} from "@buttery/`)),
    ).toBeVisible();
    await expect(
      article.getByRole("button", { name: "Copy the import" }),
    ).toBeVisible();

    const headings = await article
      .locator(":scope > section > h2, :scope > div > section > h2")
      .allTextContents();
    expect(headings.map((text) => text.trim())).toEqual(PARTS);

    const demo = article.getByRole("region", { name: `${name} demo` });
    await expect(
      demo.getByRole("radiogroup", { name: "Demo color scheme" }),
    ).toBeVisible();
    await expect(
      demo.getByRole("radiogroup", { name: "Demo density" }),
    ).toBeVisible();
    await expect(
      demo.getByRole("button", { name: `Show code for the ${name} demo` }),
    ).toBeVisible();

    const examples = article.getByRole("region", { name: `${name} examples` });
    await expect(examples.getByRole("heading", { level: 3 })).not.toHaveCount(
      0,
    );

    const accessibility = article.getByRole("region", {
      name: `${name} accessibility`,
    });
    await expect(
      accessibility
        .getByRole("table")
        .or(accessibility.getByText("It takes no keyboard input of its own.")),
    ).toBeVisible();

    const footer = article.locator(":scope > footer");
    await expect(
      footer.getByRole("link", { name: "Edit this page" }),
    ).toBeVisible();
    await expect(
      footer.getByText(/^Last updated \d{4}-\d{2}-\d{2}$/),
    ).toBeVisible();
  });
}
