# @butteryui/test

`expectButtery(page)` for Playwright: buttery's layout checks run against a page at the widths, themes and densities you ask for. It fails when things overlap, overflow, crowd the next line, sit off the spacing scale or miss their targets, and each problem comes with the element, the measurement and a fix.

## Install

```bash
npm install --save-dev @butteryui/test @playwright/test
```

## Use

```ts
import { test } from "@playwright/test";
import { expectButtery } from "@butteryui/test";

test("the settings page is buttery", async ({ page }) => {
  await page.goto("/settings");
  await expectButtery(page, {
    viewports: [
      { width: 390, height: 844 },
      { width: 1280, height: 800 },
    ],
    themes: ["light", "dark"],
  });
});
```

`checkButtery(page, options)` runs the same checks and returns the problems instead of failing, for scripts and tools that report them.

[Check your layout](https://aliboily.github.io/buttery/guides/check-your-layout) on the docs site covers the options, interactions and the JSON report.

## License

MIT
