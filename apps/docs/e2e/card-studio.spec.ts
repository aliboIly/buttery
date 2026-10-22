import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/** The size the two images are compared at. */
const WIDTH = 640;
const HEIGHT = 360;
const CANVAS = '[data-bt="Stage"] > [data-bt-part="canvas"]';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

async function centerOf(
  locator: Locator,
): Promise<{ readonly x: number; readonly y: number }> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("It isn't on the page.");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Waits two frames, for what the last input started to register, then for buttery to report settled. */
async function settled(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let frame = 0; frame < 2; frame += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  });
  await page.waitForFunction(() =>
    document.documentElement.hasAttribute("data-bt-settled"),
  );
}

async function press(
  page: Page,
  name: string,
  key: string,
  times: number,
): Promise<void> {
  await page.getByRole("slider", { name, exact: true }).focus();
  for (let count = 0; count < times; count += 1) await page.keyboard.press(key);
}

/**
 * The dark pixels of each PNG at `WIDTH` × `HEIGHT`: how many of them the two share, over how many either
 * has, and the box around each one's, as shares of the image's width and height.
 */
async function silhouettes(
  page: Page,
  images: readonly Buffer[],
): Promise<{
  readonly shared: number;
  readonly area: number;
  readonly boxes: readonly Box[];
}> {
  return page.evaluate(
    async ({ encoded, width, height }) => {
      const masks = await Promise.all(
        encoded.map(async (base64) => {
          const response = await fetch(`data:image/png;base64,${base64}`);
          const bitmap = await createImageBitmap(await response.blob());
          const canvas = new OffscreenCanvas(width, height);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("No 2D context.");
          context.drawImage(bitmap, 0, 0, width, height);
          const { data } = context.getImageData(0, 0, width, height);
          return Array.from({ length: width * height }, (_, index) => {
            const [red = 0, green = 0, blue = 0] = data.subarray(
              index * 4,
              index * 4 + 3,
            );
            return 0.2126 * red + 0.7152 * green + 0.0722 * blue < 80;
          });
        }),
      );
      const boxes = masks.map((mask) => {
        const box = { left: width, top: height, right: 0, bottom: 0 };
        for (const [index, dark] of mask.entries()) {
          if (!dark) continue;
          const x = index % width;
          const y = Math.floor(index / width);
          box.left = Math.min(box.left, x);
          box.top = Math.min(box.top, y);
          box.right = Math.max(box.right, x + 1);
          box.bottom = Math.max(box.bottom, y + 1);
        }
        return {
          left: box.left / width,
          top: box.top / height,
          right: box.right / width,
          bottom: box.bottom / height,
        };
      });
      const [one = [], two = []] = masks;
      let both = 0;
      let either = 0;
      for (const [index, dark] of one.entries()) {
        const other = two[index] === true;
        if (dark && other) both += 1;
        if (dark || other) either += 1;
      }
      return {
        shared: either === 0 ? 0 : both / either,
        area: either,
        boxes,
      };
    },
    {
      encoded: images.map((image) => image.toString("base64")),
      width: WIDTH,
      height: HEIGHT,
    },
  );
}

test("the exported PNG draws the card where the stage shows it, tilted, turned, shrunk and anchored", async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/card-studio?chrome=0");
  await page.getByTestId("title-card").waitFor();

  await page.getByRole("textbox", { name: "Title" }).fill("");
  await page.getByRole("radio", { name: "Color" }).click();
  await press(page, "Scale", "ArrowLeft", 10);
  await press(page, "Turn", "ArrowRight", 12);
  await press(page, "Left and right", "Shift+ArrowRight", 1);
  await press(page, "Up and down", "Shift+ArrowUp", 1);
  await page.getByRole("radio", { name: "Bottom right", exact: true }).click();
  await settled(page);

  const drawn = await page.evaluate((selector) => {
    const canvas = document.querySelector(selector)?.getBoundingClientRect();
    const card = document
      .querySelector('[data-testid="title-card"]')
      ?.getBoundingClientRect();
    if (!canvas || !card) throw new Error("No canvas or card.");
    const share = (value: number, size: number): number =>
      Math.min(Math.max(value / size, 0), 1);
    return {
      left: share(card.left - canvas.left, canvas.width),
      top: share(card.top - canvas.top, canvas.height),
      right: share(card.right - canvas.left, canvas.width),
      bottom: share(card.bottom - canvas.top, canvas.height),
    };
  }, CANVAS);
  const preview = await page.locator(CANVAS).screenshot();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export PNG", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("card.png");
  const exported = readFileSync(await download.path());

  const { shared, area, boxes } = await silhouettes(page, [preview, exported]);
  const [, inFile] = boxes;
  if (!inFile) throw new Error("The export has no card.");
  for (const edge of ["left", "right"] as const) {
    expect(Math.abs(inFile[edge] - drawn[edge])).toBeLessThan(2 / WIDTH);
  }
  for (const edge of ["top", "bottom"] as const) {
    expect(Math.abs(inFile[edge] - drawn[edge])).toBeLessThan(2 / HEIGHT);
  }
  test.info().annotations.push({
    type: "export",
    description: `${(shared * 100).toFixed(1)}% of ${String(area)} dark pixels shared`,
  });
  // Playwright's WebKit paints perspective flat in screenshots, away from the box it reports, so only
  // Chromium's pixels are compared; the box check above holds in both.
  if (browserName === "chromium") {
    expect(area).toBeGreaterThan(20_000);
    expect(shared).toBeGreaterThan(0.98);
  }
});

/**
 * How far apart two PNGs are around the card, drawn at 320 × 180: the mean difference per color channel,
 * from 0 to 255, inside `box` (shares of the image) grown by a fifth of its width for the shadow.
 */
async function difference(
  page: Page,
  images: readonly Buffer[],
  box: Box,
): Promise<number> {
  return page.evaluate(
    async ({ encoded, area }) => {
      const width = 320;
      const height = 180;
      const pixels = await Promise.all(
        encoded.map(async (base64) => {
          const response = await fetch(`data:image/png;base64,${base64}`);
          const bitmap = await createImageBitmap(await response.blob());
          const canvas = new OffscreenCanvas(width, height);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("No 2D context.");
          context.drawImage(bitmap, 0, 0, width, height);
          return context.getImageData(0, 0, width, height).data;
        }),
      );
      const [one, two] = pixels;
      if (!one || !two) throw new Error("Two images are needed.");
      const grow = (area.right - area.left) / 5;
      const left = Math.floor(Math.max(0, area.left - grow) * width);
      const right = Math.ceil(Math.min(1, area.right + grow) * width);
      const top = Math.floor(Math.max(0, area.top - grow) * height);
      const bottom = Math.ceil(Math.min(1, area.bottom + grow) * height);
      let total = 0;
      let channels = 0;
      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          const index = (y * width + x) * 4;
          for (let channel = 0; channel < 3; channel += 1) {
            total += Math.abs(
              (one[index + channel] ?? 0) - (two[index + channel] ?? 0),
            );
            channels += 1;
          }
        }
      }
      return total / channels;
    },
    { encoded: images.map((image) => image.toString("base64")), area: box },
  );
}

/**
 * How much each PNG darkens the band just under the card, where its shadow falls: the mean luminance of a
 * band further down, past the shadow, minus that of the band under the card, both between the card's sides.
 */
async function shadowDarkening(
  page: Page,
  images: readonly Buffer[],
  box: Box,
): Promise<readonly number[]> {
  return page.evaluate(
    async ({ encoded, area }) => {
      const width = 320;
      const height = 180;
      return Promise.all(
        encoded.map(async (base64) => {
          const response = await fetch(`data:image/png;base64,${base64}`);
          const bitmap = await createImageBitmap(await response.blob());
          const canvas = new OffscreenCanvas(width, height);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("No 2D context.");
          context.drawImage(bitmap, 0, 0, width, height);
          const { data } = context.getImageData(0, 0, width, height);
          const inset = (area.right - area.left) / 10;
          const band = (from: number, to: number): number => {
            let total = 0;
            let count = 0;
            for (
              let y = Math.floor(from * height);
              y < Math.ceil(to * height);
              y += 1
            ) {
              for (
                let x = Math.floor((area.left + inset) * width);
                x < Math.ceil((area.right - inset) * width);
                x += 1
              ) {
                const index = (y * width + x) * 4;
                total +=
                  0.2126 * (data[index] ?? 0) +
                  0.7152 * (data[index + 1] ?? 0) +
                  0.0722 * (data[index + 2] ?? 0);
                count += 1;
              }
            }
            return total / count;
          };
          return (
            band(area.bottom + 0.16, area.bottom + 0.2) -
            band(area.bottom, area.bottom + 0.04)
          );
        }),
      );
    },
    { encoded: images.map((image) => image.toString("base64")), area: box },
  );
}

test("the exported PNG carries the title, the blend and the shadow as the stage shows them", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/card-studio?chrome=0");
  await page.getByTestId("title-card").waitFor();
  await page
    .getByRole("radiogroup", { name: "Finish" })
    .getByRole("radio", { name: "Paper" })
    .click();
  await press(page, "Depth", "ArrowRight", 40);
  await page.getByRole("radio", { name: "Top left", exact: true }).click();
  await settled(page);

  const drawn = await page.evaluate((selector) => {
    const canvas = document.querySelector(selector)?.getBoundingClientRect();
    const card = document
      .querySelector('[data-testid="title-card"]')
      ?.getBoundingClientRect();
    if (!canvas || !card) throw new Error("No canvas or card.");
    return {
      left: (card.left - canvas.left) / canvas.width,
      top: (card.top - canvas.top) / canvas.height,
      right: (card.right - canvas.left) / canvas.width,
      bottom: (card.bottom - canvas.top) / canvas.height,
    };
  }, CANVAS);
  const preview = await page.locator(CANVAS).screenshot();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export PNG", exact: true }).click(),
  ]);
  const exported = readFileSync(await download.path());
  const apart = await difference(page, [preview, exported], drawn);
  const [shown = 0, saved = 0] = await shadowDarkening(
    page,
    [preview, exported],
    drawn,
  );
  test.info().annotations.push({
    type: "export",
    description: `${apart.toFixed(2)} of 255 apart on average around the card; the shadow darkens ${shown.toFixed(1)} on the stage and ${saved.toFixed(1)} in the file`,
  });
  expect(apart).toBeLessThan(4);
  expect(shown).toBeGreaterThan(4);
  expect(Math.abs(saved - shown)).toBeLessThan(shown / 4);
});

test("discarding a resize puts the canvas back where resize mode found it, even after a revert and other changes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.addEventListener("error", (event) => {
      if (event.message.includes("ResizeObserver loop")) {
        document.documentElement.dataset["resizeLoop"] = "";
      }
    });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/card-studio?chrome=0");
  await page.getByTestId("title-card").waitFor();
  const shape = page.getByRole("combobox", { name: /^Canvas shape/ });
  await expect(shape).toHaveAccessibleName("Canvas shape, Wide · 16:9");
  await page.getByRole("button", { name: "Resize", exact: true }).click();
  const handle = page.locator(
    '[data-bt="Stage"] [data-handle="e"] [data-bt-part="hit"]',
  );
  const { x, y } = await centerOf(handle);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 120, y, { steps: 6 });
  await page.mouse.up();
  await expect(shape).not.toHaveAccessibleName("Canvas shape, Wide · 16:9");
  await page
    .getByRole("radiogroup", { name: "Finish" })
    .getByRole("radio", { name: "Paper" })
    .click();
  await page.getByRole("button", { name: "Revert", exact: true }).click();
  await page.getByRole("button", { name: "Discard", exact: true }).click();
  await expect(shape).toHaveAccessibleName("Canvas shape, Wide · 16:9");
  await expect(
    page
      .getByRole("radiogroup", { name: "Finish" })
      .getByRole("radio", { name: "Paper" }),
  ).toBeChecked();
  // The header's size label changes width on every frame of the drag; its OverflowCluster mustn't loop.
  await expect(page.locator("html")).not.toHaveAttribute("data-resize-loop");
});

test("deleting the card from the keyboard takes focus to New card, and the toast's Undo brings the card back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demos/card-studio?chrome=0");
  await page.getByTestId("title-card").waitFor();
  const remove = page.getByRole("button", { name: "Delete", exact: true });
  await remove.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "New card" })).toBeFocused();
  await expect(remove).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("button", { name: "Undo", exact: true }).last().click();
  await expect(page.getByTestId("title-card")).toBeVisible();
  const apple = await page.evaluate(() =>
    /Mac|iPhone|iPad/.test(navigator.userAgent),
  );
  await page.keyboard.press(apple ? "Meta+Shift+z" : "Control+Shift+z");
  await expect(page.getByTestId("title-card")).toBeHidden();
});

test("the tour opens by itself on the first visit, and not again once it's finished", async ({
  page,
}) => {
  await page.goto("/demos/card-studio?chrome=0&motion=reduced");
  await page.evaluate(() => {
    window.localStorage.removeItem("buttery:onboarding:card-studio");
  });
  await page.reload();
  const tour = page.getByRole("dialog", { name: "Name your card" });
  await expect(tour).toBeVisible();
  for (let step = 0; step < 3; step += 1) {
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await expect(
    page.getByRole("dialog", { name: "Take it with you" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: /^Canvas shape/ }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
