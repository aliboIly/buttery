import { expect, test } from "@playwright/test";

test("the site sits on the surface color, as the landing's own sections do, so filled controls show on it", async ({
  page,
  browserName,
}) => {
  test.skip(browserName === "webkit", "Colors don't depend on the engine.");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const colors = await page.evaluate(() => {
    const background = (selector: string): string => {
      const element = document.querySelector(selector);
      return element ? getComputedStyle(element).backgroundColor : "";
    };
    return {
      shell: background(".docs-shell"),
      page: background('[data-bt="Page"]'),
    };
  });
  expect(colors.shell).toBe(colors.page);
});

test("the phone's menu sheet shows its tools as labelled rows that start where the menus start", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/foundations/colors");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const sheet = page.getByRole("dialog");
  const learn = sheet.getByRole("button", { name: "Learn", exact: true });
  await expect(learn).toBeVisible();
  const start = await learn.evaluate(
    (button) =>
      button.getBoundingClientRect().left +
      Number.parseFloat(getComputedStyle(button).paddingInlineStart),
  );
  for (const [role, name] of [
    ["button", "Use the dark theme"],
    ["button", "Display settings"],
    ["link", "Source on GitHub"],
  ] as const) {
    const tool = sheet.getByRole(role, { name, exact: true });
    await expect(tool).toBeVisible();
    const { label, icon } = await tool.evaluate((element) => ({
      label: element instanceof HTMLElement ? element.innerText.trim() : "",
      icon: element.querySelector("svg")?.getBoundingClientRect().left ?? 0,
    }));
    expect(label).toBe(name);
    expect(Math.abs(icon - start)).toBeLessThanOrEqual(1);
  }
});

test("the display settings say which row is the theme, the density and the motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/foundations/colors");
  await page
    .getByRole("button", { name: "Display settings", exact: true })
    .click();
  const settings = page.getByRole("dialog", { name: "Display settings" });
  for (const name of ["Theme", "Density", "Motion"]) {
    await expect(settings.getByText(name, { exact: true })).toBeVisible();
    await expect(settings.getByRole("radiogroup", { name })).toBeVisible();
  }
});

test("On this page follows a jump down the page and back, and a press on one of its links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/patterns/app-shell");
  const toc = page.getByRole("navigation", { name: "On this page" });
  const current = toc.locator('[aria-current="location"]');
  await expect(current).toHaveText("The dashboard");
  await page.evaluate(() => {
    document
      .getElementById("appshell-roastery-dashboard-example")
      ?.scrollIntoView();
  });
  await expect(current).toHaveText("AppShell");
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await expect(current).toHaveText("The dashboard");
  await toc.getByRole("link", { name: "AppPage", exact: true }).click();
  await expect(current).toHaveText("AppPage");
});
