import { expect, test } from "@playwright/test";

test("renders with the bundled font and no console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Plan the week in ten minutes.",
  );
  const interLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px "Inter Variable"');
  });
  expect(interLoaded).toBe(true);
  expect(errors).toEqual([]);
});

test("the bar's links scroll to their sections below the bar, leaving the address alone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Pricing", exact: true })
    .click();
  const heading = page.getByRole("heading", {
    name: "Free for one, simple for a team",
  });
  await expect(heading).toBeInViewport();
  const bar = await page.locator('[data-bt="NavBar"]').boundingBox();
  const top = await heading.boundingBox();
  expect(bar && top && top.y >= bar.y + bar.height).toBe(true);
  expect(new URL(page.url()).hash).toBe("");
});

test("a plan's button says where it goes", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Try it with your team", exact: true })
    .click();
  await expect(
    page.getByText("Team goes to the sign-up page once there is one.", {
      exact: true,
    }),
  ).toBeVisible();
});

test("puts the page between the bar and the footer in a main landmark, which the bar's skip link reaches", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "WebKit leaves links out of the tab order unless the system's keyboard setting puts them in.",
  );
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(
    "Plan the week in ten minutes.",
  );
  await expect(main.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    main.getByRole("link", { name: "Start planning" }).first(),
  ).toBeFocused();
});
