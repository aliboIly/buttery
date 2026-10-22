import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { componentRoutes } from "./routes.ts";

/** Changes one control to a value it doesn't have: another option, the other side of a switch, new text. */
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
  const select = control.getByRole("combobox");
  await select.click();
  await control.page().getByRole("option", { selected: false }).first().click();
}

for (const { name, route } of componentRoutes) {
  test(`${name}'s live demo changes with each of its controls`, async ({
    page,
  }) => {
    await page.goto(`/${route}`);
    const controls = page.locator(".docs-controls > *");
    const demo = page.getByTestId("live-demo");
    const count = await controls.count();
    test.skip(count === 0, `${name} has no live demo controls yet`);
    for (let index = 0; index < count; index += 1) {
      const before = await demo.innerHTML();
      await change(controls.nth(index));
      await expect
        .poll(() => demo.innerHTML(), {
          message: `${name}'s control ${String(index + 1)} didn't change the demo`,
        })
        .not.toBe(before);
    }
  });
}
