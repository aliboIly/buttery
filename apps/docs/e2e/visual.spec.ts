import { expect, test } from "@playwright/test";

/**
 * Pages whose look is pinned: a change to any of them fails here until its new screenshot is approved with
 * `--update-snapshots`. One of each kind of page, in both themes, both densities and at a phone's width.
 */
const SHOTS = [
  { name: "landing", route: "/", width: 1280, height: 900 },
  {
    name: "landing-dark-phone",
    route: "/?theme=dark",
    width: 390,
    height: 844,
  },
  { name: "component", route: "/components/button", width: 1280, height: 900 },
  {
    name: "component-dark",
    route: "/components/segmented-control?theme=dark",
    width: 1280,
    height: 900,
  },
  {
    name: "component-compact-phone",
    route: "/components/data-table?density=compact",
    width: 390,
    height: 844,
  },
  { name: "written", route: "/foundations/colors", width: 1280, height: 900 },
  {
    name: "written-dark-compact",
    route: "/layout/the-layout-contract?theme=dark&density=compact",
    width: 1280,
    height: 900,
  },
  { name: "patterns", route: "/patterns/overview", width: 1280, height: 900 },
  { name: "search", route: "/search?q=dialog", width: 1280, height: 900 },
  { name: "demos", route: "/demos", width: 1280, height: 900 },
  {
    name: "whats-new",
    route: "/resources/whats-new",
    width: 1280,
    height: 900,
  },
] as const;

for (const shot of SHOTS) {
  test(`the ${shot.name} screenshot hasn't changed`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium" || process.platform !== "darwin",
      "The baselines are Chromium's on macOS; text renders differently elsewhere.",
    );
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(shot.route);
    await expect(page.locator("html")).toHaveAttribute("data-bt-settled", "");
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await expect(page).toHaveScreenshot(`${shot.name}.png`, {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.002,
    });
  });
}
