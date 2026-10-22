import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Pages whose markup is all the site's own: none of their examples renders a whole page. */
const PAGES = [
  "/",
  "/search?q=button",
  "/foundations/colors",
  "/components/button",
  "/resources/whats-new",
  "/demos",
];

/** axe's best-practice rules for landmarks and headings, which the layout check's WCAG rules leave out. */
const RULES = [
  "landmark-one-main",
  "landmark-no-duplicate-main",
  "landmark-main-is-top-level",
  "landmark-unique",
  "page-has-heading-one",
  "heading-order",
  "region",
];

for (const path of PAGES) {
  test(`${path} has one main landmark, its headings in order and nothing outside a landmark`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "Landmarks and headings don't depend on the engine.",
    );
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withRules(RULES)
      .analyze();
    expect(
      violations.flatMap((violation) =>
        violation.nodes.map(
          (node) => `${violation.id}: ${node.target.join(" ")}`,
        ),
      ),
    ).toEqual([]);
  });
}
