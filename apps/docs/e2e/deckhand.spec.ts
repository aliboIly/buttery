import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/** The size the two images are compared at. */
const WIDTH = 640;
const HEIGHT = 360;
const CANVAS = '[data-bt="Stage"] > [data-bt-part="canvas"]';
const BOX = '[data-testid="stage-slide"] [data-dh-box]';

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

async function open(page: Page, query = ""): Promise<void> {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/demos/deckhand?chrome=0${query}`);
  await page.getByTestId("stage-slide").waitFor();
}

function slide(page: Page, number: number): Locator {
  return page.getByRole("option", {
    name: new RegExp(`^Slide ${String(number)}:`),
  });
}

function position(page: Page, name: string): Locator {
  return page
    .getByRole("radiogroup", { name: "Position" })
    .getByRole("radio", { name, exact: true });
}

function strip(page: Page): Locator {
  return page.getByRole("listbox", { name: "Slides" });
}

async function slideNames(page: Page): Promise<readonly string[]> {
  return page
    .getByRole("option")
    .evaluateAll((options) =>
      options.map((option) => option.getAttribute("aria-label") ?? ""),
    );
}

/** Where the words sit on the canvas, as shares of its width and height. */
async function boxOnCanvas(page: Page): Promise<Box> {
  return page.evaluate(
    ({ canvasSelector, boxSelector }) => {
      const canvas = document
        .querySelector(canvasSelector)
        ?.getBoundingClientRect();
      const box = document.querySelector(boxSelector)?.getBoundingClientRect();
      if (!canvas || !box) throw new Error("No canvas or box.");
      return {
        left: (box.left - canvas.left) / canvas.width,
        top: (box.top - canvas.top) / canvas.height,
        right: (box.right - canvas.left) / canvas.width,
        bottom: (box.bottom - canvas.top) / canvas.height,
      };
    },
    { canvasSelector: CANVAS, boxSelector: BOX },
  );
}

async function exportPng(page: Page, name: string): Promise<Buffer> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export PNG", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(name);
  return readFileSync(await download.path());
}

/**
 * The dark pixels of each PNG at `WIDTH` × `HEIGHT`: how many of either one's have a dark pixel of the
 * other within a pixel, over how many both have, so antialiasing that shifts a stroke by a pixel doesn't
 * count against them; and the box around each one's, as shares of the image's width and height.
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
      const near = (mask: readonly boolean[], index: number): boolean => {
        const x = index % width;
        const y = Math.floor(index / width);
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (mask[ny * width + nx] === true) return true;
          }
        }
        return false;
      };
      const [one = [], two = []] = masks;
      let matched = 0;
      let total = 0;
      for (const [mask, other] of [
        [one, two],
        [two, one],
      ] as const) {
        for (const [index, dark] of mask.entries()) {
          if (!dark) continue;
          total += 1;
          if (near(other, index)) matched += 1;
        }
      }
      return {
        shared: total === 0 ? 0 : matched / total,
        area: total,
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

/**
 * How far apart two PNGs are around the words' box, drawn at 320 × 180: the mean difference per color
 * channel, from 0 to 255, inside `box` (shares of the image) grown by a fifth of its width for the shadow.
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
 * How much each PNG darkens the band just under the box, where its shadow falls: the mean luminance of a
 * band further down, past the shadow, minus that of the band under the box, both between the box's sides.
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
            band(area.bottom + 0.1, area.bottom + 0.13) -
            band(area.bottom, area.bottom + 0.03)
          );
        }),
      );
    },
    { encoded: images.map((image) => image.toString("base64")), area: box },
  );
}

test("the exported PNG draws the words where the stage shows them, at their size and place", async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await slide(page, 2).click();
  await page.getByRole("slider", { name: "Size", exact: true }).focus();
  for (let step = 0; step < 4; step += 1)
    await page.keyboard.press("ArrowRight");
  await position(page, "Top right").click();
  await settled(page);

  const drawn = await boxOnCanvas(page);
  const preview = await page.locator(CANVAS).screenshot();
  const exported = await exportPng(page, "halfmoon-for-cafes-2.png");

  const { shared, area, boxes } = await silhouettes(page, [preview, exported]);
  const [onStage, inFile] = boxes;
  if (!onStage || !inFile) throw new Error("An image has no words.");
  for (const edge of ["left", "right", "top", "bottom"] as const) {
    expect(Math.abs(inFile[edge] - onStage[edge])).toBeLessThan(
      3 / (edge === "left" || edge === "right" ? WIDTH : HEIGHT),
    );
  }
  expect(inFile.right).toBeLessThanOrEqual(drawn.right);
  expect(inFile.top).toBeGreaterThanOrEqual(drawn.top);
  test.info().annotations.push({
    type: "export",
    description: `${(shared * 100).toFixed(1)}% of ${String(area)} dark pixels have one of the other's within a pixel`,
  });
  expect(area).toBeGreaterThan(4000);
  expect(shared).toBeGreaterThan(browserName === "chromium" ? 0.97 : 0.94);
});

test("the exported PNG carries the fill, the box and its shadow as the stage shows them", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await slide(page, 5).click();
  await page.getByRole("slider", { name: "Depth", exact: true }).focus();
  await page.keyboard.press("End");
  await settled(page);

  const drawn = await boxOnCanvas(page);
  const preview = await page.locator(CANVAS).screenshot();
  const exported = await exportPng(page, "halfmoon-for-cafes-5.png");
  const apart = await difference(page, [preview, exported], drawn);
  const [shown = 0, saved = 0] = await shadowDarkening(
    page,
    [preview, exported],
    drawn,
  );
  test.info().annotations.push({
    type: "export",
    description: `${apart.toFixed(2)} of 255 apart on average around the box; the shadow darkens ${shown.toFixed(1)} on the stage and ${saved.toFixed(1)} in the file`,
  });
  expect(apart).toBeLessThan(6);
  expect(shown).toBeGreaterThan(4);
  expect(Math.abs(saved - shown)).toBeLessThan(shown / 3);
});

test("undo and redo walk changes back and forth, each typed word and each pick one step", async ({
  page,
}) => {
  await open(page);
  const title = page.getByRole("textbox", { name: "Title", exact: true });
  const stage = page.getByTestId("stage-slide");
  await title.fill("Halfmoon for your counter");
  await title.blur();
  await position(page, "Center").click();
  await expect(position(page, "Center")).toBeChecked();

  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });
  await undo.click();
  await expect(position(page, "Bottom left")).toBeChecked();
  await expect(stage).toContainText("Halfmoon for your counter");
  await undo.click();
  await expect(stage).toContainText("Halfmoon Roastery for your café");
  await expect(undo).toHaveAttribute("aria-disabled", "true");
  await redo.click();
  await expect(stage).toContainText("Halfmoon for your counter");
  const apple = await page.evaluate(() =>
    /Mac|iPhone|iPad/.test(navigator.userAgent),
  );
  await page.getByRole("heading", { name: "Slide", exact: true }).click();
  await page.keyboard.press(apple ? "Meta+Shift+z" : "Control+Shift+z");
  await expect(position(page, "Center")).toBeChecked();
  await expect(redo).toHaveAttribute("aria-disabled", "true");
});

test("deleting a slide from the strip's keyboard keeps focus there, and the toast's Undo brings it back", async ({
  page,
}) => {
  await open(page);
  await slide(page, 3).click();
  await expect(strip(page)).toBeFocused();
  await page.keyboard.press("Delete");
  await expect(page.getByRole("option")).toHaveCount(5);
  await expect(strip(page)).toBeFocused();
  await expect(slide(page, 3)).toHaveAttribute("aria-selected", "true");
  await expect(slide(page, 3)).toHaveAccessibleName(
    "Slide 3: The coffees on offer",
  );
  await page
    .getByRole("region", { name: "Notifications (F8)" })
    .getByRole("button", { name: "Undo", exact: true })
    .click();
  await expect(page.getByRole("option")).toHaveCount(6);
  await expect(slide(page, 3)).toHaveAccessibleName(
    "Slide 3: A week with Halfmoon",
  );
  await expect(slide(page, 3)).toHaveAttribute("aria-selected", "true");
});

test("deleting the last slide from the keyboard swaps in the empty state and focuses New slide", async ({
  page,
}) => {
  await open(page);
  const remove = page.getByRole("button", {
    name: "Delete slide",
    exact: true,
  });
  for (let count = 6; count > 1; count -= 1) {
    await remove.click();
    await expect(page.getByRole("option")).toHaveCount(count - 1);
  }
  await remove.focus();
  await page.keyboard.press("Enter");
  const empty = page.getByRole("main").locator('[data-bt="EmptyState"]');
  await expect(empty).toBeVisible();
  await expect(page.locator('[data-bt="Stage"]')).toHaveCount(0);
  const add = empty.getByRole("button", { name: "New slide", exact: true });
  await expect(add).toBeFocused();
  await expect(remove).toHaveAttribute("aria-disabled", "true");
  await add.click();
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByTestId("stage-slide")).toContainText(
    "A new title slide",
  );
});

test("the strip moves the picked slide with Alt and an arrow, and a drag moves it in one step", async ({
  page,
}) => {
  await open(page);
  await slide(page, 1).click();
  await page.keyboard.press("Alt+ArrowRight");
  expect((await slideNames(page)).slice(0, 2)).toEqual([
    "Slide 1: Roasted Monday, poured by Friday",
    "Slide 2: Halfmoon Roastery for your café",
  ]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await slideNames(page))[0]).toBe(
    "Slide 1: Halfmoon Roastery for your café",
  );
  await settled(page);

  const first = await centerOf(slide(page, 1));
  const third = await centerOf(slide(page, 3));
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  await page.mouse.move(third.x + 8, first.y, { steps: 12 });
  await page.mouse.up();
  await expect(slide(page, 3)).toHaveAccessibleName(
    "Slide 3: Halfmoon Roastery for your café",
  );
  await expect(slide(page, 3)).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await slideNames(page))[0]).toBe(
    "Slide 1: Halfmoon Roastery for your café",
  );
});

test("on a phone the slides fill a grid under the slide, where Up and Down move a row and a drag crosses rows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demos/deckhand?chrome=0");
  await page.getByTestId("stage-slide").waitFor();
  await settled(page);
  const canvas = await page.locator(CANVAS).boundingBox();
  const grid = await page.getByTestId("slide-strip").boundingBox();
  const first = await slide(page, 1).boundingBox();
  const second = await slide(page, 2).boundingBox();
  const third = await slide(page, 3).boundingBox();
  if (!canvas || !grid || !first || !second || !third)
    throw new Error("The editor isn't on the page.");
  expect(grid.y - (canvas.y + canvas.height)).toBeGreaterThan(0);
  expect(grid.y - (canvas.y + canvas.height)).toBeLessThanOrEqual(48);
  expect(second.y).toBeCloseTo(first.y, 0);
  expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
  expect(third.x).toBeCloseTo(first.x, 0);
  expect(third.y).toBeGreaterThanOrEqual(first.y + first.height);

  await slide(page, 1).click();
  await page.keyboard.press("ArrowDown");
  await expect(slide(page, 3)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(slide(page, 4)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp");
  await expect(slide(page, 2)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Alt+ArrowDown");
  await expect(slide(page, 4)).toHaveAccessibleName(
    "Slide 4: Roasted Monday, poured by Friday",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(slide(page, 2)).toHaveAccessibleName(
    "Slide 2: Roasted Monday, poured by Friday",
  );
  await settled(page);

  const from = await centerOf(slide(page, 1));
  const to = await centerOf(slide(page, 4));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
  await expect(slide(page, 4)).toHaveAccessibleName(
    "Slide 4: Halfmoon Roastery for your café",
  );
  await expect(slide(page, 4)).toHaveAttribute("aria-selected", "true");
});

test("with no slides, the phone's Edit slide sheet offers New slide, which adds one and selects its title", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demos/deckhand?chrome=0");
  await page.getByTestId("stage-slide").waitFor();
  await slide(page, 1).click();
  for (let count = 6; count > 0; count -= 1) {
    await page.keyboard.press("Delete");
    await expect(page.getByRole("option")).toHaveCount(count - 1);
  }
  await page.getByRole("button", { name: "Edit slide", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Slide settings" });
  await expect(sheet.getByText("No slide to style")).toBeVisible();
  await sheet.getByRole("button", { name: "New slide", exact: true }).click();
  const title = sheet.getByRole("textbox", { name: "Title", exact: true });
  await expect(title).toBeFocused();
  await page.keyboard.type("Opening hours");
  await expect(title).toHaveValue("Opening hours");
  await page.keyboard.press("Escape");
  await expect(slide(page, 1)).toHaveAccessibleName("Slide 1: Opening hours");
});

test("dragging the words lands them on the nearest place, and Cancel puts them back", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const box = page.locator(BOX);
  const canvas = await page.locator(CANVAS).boundingBox();
  if (!canvas) throw new Error("No canvas.");
  const from = await centerOf(box);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width * 0.8, canvas.y + 40, {
    steps: 10,
  });
  await page.mouse.up();
  const toolbar = page.getByRole("toolbar", { name: "Arrange the words" });
  await expect(toolbar).toBeVisible();
  await expect(toolbar).toContainText("Top right");
  await expect(position(page, "Top right")).toBeChecked();
  await toolbar.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(toolbar).toBeHidden();
  await expect(position(page, "Bottom left")).toBeChecked();
});

test("double-clicking words on the stage puts the cursor in the field that writes them", async ({
  page,
}) => {
  await open(page);
  await page
    .locator('[data-testid="stage-slide"] [data-dh-field="subtitle"]')
    .dblclick();
  await expect(
    page.getByRole("textbox", { name: "Subtitle", exact: true }),
  ).toBeFocused();
});

test("the deck keeps its changes across a reload", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Rename deck", exact: true }).click();
  const name = page.getByRole("textbox", { name: "Deck name", exact: true });
  await name.fill("Fall wholesale pitch");
  await page.getByRole("button", { name: "Rename", exact: true }).click();
  await slide(page, 4).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).click();
  await page.getByRole("combobox", { name: /^Slide size/ }).click();
  await page.getByRole("option", { name: "Square · 1:1" }).click();
  await page.reload();
  await page.getByTestId("stage-slide").waitFor();
  await expect(
    page.locator('[data-bt="HeaderBar"] [data-bt-part="title"]'),
  ).toHaveText("Fall wholesale pitch");
  await expect(slide(page, 4)).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("radio", { name: "Dark", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("combobox", { name: /^Slide size/ }),
  ).toHaveAccessibleName("Slide size, Square · 1:1");
});

test("a slide's big numbers each stay on one line inside their column, at every slide size", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "New slide", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Big numbers", exact: true })
    .click();
  await settled(page);
  for (const size of [
    "Wide · 16:9",
    "Standard · 4:3",
    "Square · 1:1",
    "Portrait · 4:5",
  ]) {
    await page.getByRole("combobox", { name: /^Slide size/ }).click();
    await page.getByRole("option", { name: size }).click();
    await settled(page);
    const numbers = page.getByTestId("stage-slide").locator(".dh-stat-value");
    await expect(numbers).toHaveCount(3);
    for (const number of await numbers.all()) {
      const fit = await number.evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const tops = new Set(
          [...range.getClientRects()].map((rect) => Math.round(rect.top)),
        );
        return {
          lines: tops.size,
          overflow: Math.max(0, element.scrollWidth - element.clientWidth),
        };
      });
      expect(fit, `${size}, ${(await number.textContent()) ?? ""}`).toEqual({
        lines: 1,
        overflow: 0,
      });
    }
  }
});

test("present plays the deck full-window, moving with the keyboard and leaving with Escape", async ({
  page,
}) => {
  await open(page, "&motion=reduced");
  await slide(page, 2).click();
  const present = page.getByRole("button", { name: "Present", exact: true });
  await present.click();
  const show = page.getByRole("dialog", {
    name: "Presenting Halfmoon for cafés",
  });
  await expect(show).toBeFocused();
  const count = show.getByRole("status");
  await expect(count).toHaveText("2 of 6");
  await page.keyboard.press("ArrowRight");
  await expect(count).toHaveText("3 of 6");
  await expect(show).toContainText("A week with Halfmoon");
  await page.keyboard.press("End");
  await expect(count).toHaveText("6 of 6");
  await page.keyboard.press("ArrowRight");
  await expect(count).toHaveText("6 of 6");
  await page.keyboard.press("Home");
  await expect(count).toHaveText("1 of 6");
  await page.keyboard.press("PageDown");
  await expect(count).toHaveText("2 of 6");
  await page.keyboard.press("Tab");
  await expect(
    show.getByRole("button", { name: "Previous slide", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(show).toBeHidden();
  await expect(present).toBeFocused();
});

test("right-clicking a thumbnail picks it and opens its menu, whose Duplicate copies it after itself", async ({
  page,
}) => {
  await open(page);
  await slide(page, 3).click({ button: "right" });
  await expect(slide(page, 3)).toHaveAttribute("aria-selected", "true");
  const menu = page.getByRole("menu", {
    name: "Slide 3: A week with Halfmoon",
  });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem")).toHaveText([
    "New slide after",
    /^Duplicate/,
    "Copy as image",
    /^Move left/,
    /^Move right/,
    /^Delete/,
  ]);
  await menu.getByRole("menuitem", { name: "Duplicate" }).click();
  await expect(page.getByRole("option")).toHaveCount(7);
  await expect(slide(page, 4)).toHaveAccessibleName(
    "Slide 4: A week with Halfmoon",
  );
  await expect(slide(page, 4)).toHaveAttribute("aria-selected", "true");
  await expect(menu).toBeHidden();
});

test("the strip's menu opens with Shift+F10 at the picked thumbnail, and adds a slide of a layout after it", async ({
  page,
}) => {
  await open(page);
  await slide(page, 2).click();
  await expect(strip(page)).toBeFocused();
  await page.keyboard.press("Shift+F10");
  const menu = page.getByRole("menu", {
    name: "Slide 2: Roasted Monday, poured by Friday",
  });
  await expect(menu).toBeVisible();
  const thumb = await slide(page, 2).boundingBox();
  const box = await menu.boundingBox();
  if (!thumb || !box) throw new Error("The menu or the thumbnail is missing.");
  expect(Math.abs(box.x - (thumb.x + thumb.width / 2))).toBeLessThanOrEqual(4);
  const add = menu.getByRole("menuitem", { name: "New slide after" });
  await expect(add).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const layouts = page.getByRole("menu", { name: "New slide after" });
  await expect(
    layouts.getByRole("menuitem", { name: "Title", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(layouts.getByRole("menuitem", { name: "Quote" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option")).toHaveCount(7);
  await expect(slide(page, 3)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("stage-slide")).toHaveAttribute(
    "data-layout",
    "quote",
  );
  await expect(strip(page)).toBeFocused();
});

test("the shortcuts the strip's menu shows work on the focused strip", async ({
  page,
}) => {
  await open(page);
  await slide(page, 2).click();
  await page.keyboard.press("ContextMenu");
  const menu = page.getByRole("menu", { name: /^Slide 2:/ });
  const duplicate = menu.getByRole("menuitem", { name: "Duplicate" });
  const right = menu.getByRole("menuitem", { name: "Move right" });
  const remove = menu.getByRole("menuitem", { name: "Delete" });
  const apple = await page.evaluate(() =>
    /Mac|iPhone|iPad/.test(navigator.userAgent),
  );
  await expect(duplicate).toHaveAttribute(
    "aria-keyshortcuts",
    apple ? "Meta+D" : "Control+D",
  );
  await expect(right).toHaveAttribute("aria-keyshortcuts", "Alt+ArrowRight");
  await expect(remove).toHaveAttribute(
    "aria-keyshortcuts",
    apple ? "Backspace" : "Delete",
  );
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(strip(page)).toBeFocused();
  await page.keyboard.press(apple ? "Meta+d" : "Control+d");
  await expect(page.getByRole("option")).toHaveCount(7);
  await expect(slide(page, 3)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Alt+ArrowRight");
  await expect(slide(page, 4)).toHaveAccessibleName(
    "Slide 4: Roasted Monday, poured by Friday",
  );
  await page.keyboard.press(apple ? "Backspace" : "Delete");
  await expect(page.getByRole("option")).toHaveCount(6);
});

test("Move right and Delete from a thumbnail's menu move and delete it", async ({
  page,
}) => {
  await open(page);
  await slide(page, 1).click({ button: "right" });
  await page.getByRole("menuitem", { name: "Move right" }).click();
  expect((await slideNames(page)).slice(0, 2)).toEqual([
    "Slide 1: Roasted Monday, poured by Friday",
    "Slide 2: Halfmoon Roastery for your café",
  ]);
  await slide(page, 1).click({ button: "right" });
  await expect(
    page.getByRole("menuitem", { name: "Move left" }),
  ).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByRole("option")).toHaveCount(5);
  await expect(slide(page, 1)).toHaveAccessibleName(
    "Slide 1: Halfmoon Roastery for your café",
  );
});

test("on a phone a thumbnail's menu moves the slide up and down a row of the grid", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demos/deckhand?chrome=0");
  await page.getByTestId("stage-slide").waitFor();
  await slide(page, 1).click({ button: "right" });
  const menu = page.getByRole("menu", { name: /^Slide 1:/ });
  await expect(menu.getByRole("menuitem", { name: "Move up" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  const box = await menu.boundingBox();
  if (!box) throw new Error("No menu.");
  expect(box.x).toBeGreaterThanOrEqual(8);
  expect(box.x + box.width).toBeLessThanOrEqual(390 - 8);
  await menu.getByRole("menuitem", { name: "Move down" }).click();
  await expect(slide(page, 3)).toHaveAccessibleName(
    "Slide 3: Halfmoon Roastery for your café",
  );
  await expect(slide(page, 3)).toHaveAttribute("aria-selected", "true");
});

test("the stage's menu opens with the context-menu key on the focused stage and picks a layout", async ({
  page,
}) => {
  await open(page);
  const stage = page.getByRole("region", { name: "Current slide" });
  await stage.focus();
  await page.keyboard.press("ContextMenu");
  const menu = page.getByRole("menu", { name: "Current slide" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem").first()).toBeFocused();
  const area = await stage.boundingBox();
  const box = await menu.boundingBox();
  if (!area || !box) throw new Error("The stage or its menu is missing.");
  expect(Math.abs(box.y - (area.y + area.height / 2))).toBeLessThanOrEqual(4);
  await menu.getByRole("menuitem", { name: "Layout" }).focus();
  await page.keyboard.press("ArrowRight");
  const layouts = page.getByRole("menu", { name: "Layout" });
  await expect(
    layouts.getByRole("menuitemradio", { name: "Title", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await layouts.getByRole("menuitemradio", { name: "Big numbers" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("stage-slide")).toHaveAttribute(
    "data-layout",
    "numbers",
  );
  await expect(
    page.getByRole("combobox", { name: /^Layout/ }),
  ).toHaveAccessibleName("Layout, Big numbers");
  await expect(stage).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("stage-slide")).toHaveAttribute(
    "data-layout",
    "numbers",
  );
});

test("right-clicking words on the stage and choosing Edit text puts the cursor in their field", async ({
  page,
}) => {
  await open(page);
  await page
    .locator('[data-testid="stage-slide"] [data-dh-field="subtitle"]')
    .click({ button: "right" });
  await page
    .getByRole("menu", { name: "Current slide" })
    .getByRole("menuitem", { name: "Edit text" })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Subtitle", exact: true }),
  ).toBeFocused();
});

test("the stage's menu arranges the words, sets the look and resets their place", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const canvas = await page.locator(CANVAS).boundingBox();
  if (!canvas) throw new Error("No canvas.");
  const at = { x: canvas.x + canvas.width * 0.8, y: canvas.y + 40 };
  await page.mouse.click(at.x, at.y, { button: "right" });
  const menu = page.getByRole("menu", { name: "Current slide" });
  await expect(
    menu.getByRole("menuitem", { name: "Reset position" }),
  ).toHaveAttribute("aria-disabled", "true");
  await menu.getByRole("menuitemcheckbox", { name: "Arrange" }).click();
  const toolbar = page.getByRole("toolbar", { name: "Arrange the words" });
  await expect(toolbar).toBeVisible();
  await position(page, "Top right").click();
  await toolbar.getByRole("button", { name: "Done", exact: true }).click();
  await expect(toolbar).toBeHidden();

  await page.mouse.click(at.x, at.y, { button: "right" });
  await menu.getByRole("menuitem", { name: "Look" }).click();
  const look = page.getByRole("menu", { name: "Look" });
  await look.getByRole("menuitemradio", { name: "Dark box" }).click();
  await expect(
    page.getByRole("radio", { name: "Dark", exact: true }),
  ).toBeChecked();

  await page.mouse.click(at.x, at.y, { button: "right" });
  await menu.getByRole("menuitem", { name: "Reset position" }).click();
  await expect(position(page, "Bottom left")).toBeChecked();
});

test("the tour opens by itself on the first visit, and not again once it's finished", async ({
  page,
}) => {
  await page.goto("/demos/deckhand?chrome=0&motion=reduced");
  await page.evaluate(() => {
    window.localStorage.removeItem("buttery:onboarding:deckhand");
  });
  await page.reload();
  const tour = page.getByRole("dialog", { name: "Write in the inspector" });
  await expect(tour).toBeVisible();
  for (let step = 0; step < 3; step += 1) {
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await expect(page.getByRole("dialog", { name: "Present" })).toBeVisible();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("stage-slide")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
