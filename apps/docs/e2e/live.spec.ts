import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { componentRoutes } from "./routes.ts";

/**
 * What the live demo shows: its frame's markup, then the layers at the end of `<body>` that its dialogs,
 * popovers, menus and tooltips portal to, leaving out the development tooling's.
 */
async function shown(page: Page): Promise<string> {
  return page.evaluate(() =>
    [
      document.querySelector('[data-testid="live-demo"]')?.innerHTML ?? "",
      ...[
        ...document.querySelectorAll(
          'body > [data-bt-layer]:not([data-bt-layer="dev"])',
        ),
      ].map((layer) => layer.outerHTML),
    ].join("\n"),
  );
}

/** Waits two frames, for what the last input started, then for buttery to report its motion settled. */
async function settled(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let frame = 0; frame < 2; frame += 1)
      await new Promise((resolve) => requestAnimationFrame(resolve));
  });
  await page.waitForFunction(() =>
    document.documentElement.hasAttribute("data-bt-settled"),
  );
}

/**
 * Changes one control to a value it doesn't have: another option, the other side of a switch, new text.
 * A choice with more options than fit side by side is a select, found by the prop its caption names, so
 * its trigger's role doesn't matter; its list has closed before this returns.
 */
async function change(control: Locator): Promise<void> {
  const unchecked = control.getByRole("radio", { checked: false });
  if ((await unchecked.count()) > 0) {
    await unchecked.first().click();
    return;
  }
  const toggle = control.getByRole("switch");
  if ((await toggle.count()) > 0) {
    await toggle.click();
    return;
  }
  const text = control.getByRole("textbox");
  if ((await text.count()) > 0) {
    await text.fill("Something else");
    return;
  }
  const slider = control.getByRole("slider");
  if ((await slider.count()) > 0) {
    await slider.focus();
    await slider.press("End");
    return;
  }
  const name = (await control.getByText(/./).first().textContent()) ?? "";
  const list = control.page().getByRole("listbox", { name, exact: true });
  await control.getByLabel(name).click();
  await list.getByRole("option", { selected: false }).first().click();
  await expect(list).toHaveCount(0);
}

for (const { name, route } of componentRoutes) {
  test(`${name}'s live demo changes with each of its controls`, async ({
    page,
  }) => {
    await page.goto(`/${route}`);
    const controls = page.locator(".docs-controls > *");
    const count = await controls.count();
    test.skip(count === 0, `${name} has no live demo controls yet`);
    for (let index = 0; index < count; index += 1) {
      await settled(page);
      const before = await shown(page);
      await change(controls.nth(index));
      await expect
        .poll(() => shown(page), {
          message: `${name}'s control ${String(index + 1)} didn't change the demo`,
        })
        .not.toBe(before);
    }
  });
}
