import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent as browser } from "vitest/browser";
import { Button } from "../button/Button.tsx";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { Sheet } from "./Sheet.tsx";
import type { ResponsiveSheetSide, SheetSide, SheetSize } from "./Sheet.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Bag({
  side,
  size,
  children,
}: {
  readonly side?: SheetSide | ResponsiveSheetSide;
  readonly size?: SheetSize;
  readonly children?: ReactNode;
}): ReactElement {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>Bag</Button>
      </Sheet.Trigger>
      <Sheet.Content side={side} size={size}>
        {children ?? (
          <>
            <Sheet.Header
              title="Your bag"
              description="2 bags of coffee, roasted the morning after you order."
            />
            <Sheet.Body>
              <p>Guji, 12 oz</p>
              <Button variant="ghost">Remove Guji</Button>
            </Sheet.Body>
            <Sheet.Footer>
              <Sheet.Close asChild>
                <Button variant="soft" size="cta" shape="rounded">
                  Keep shopping
                </Button>
              </Sheet.Close>
            </Sheet.Footer>
          </>
        )}
      </Sheet.Content>
    </Sheet>
  );
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

async function openBag(): Promise<HTMLElement> {
  await browser.click(screen.getByRole("button", { name: "Bag" }));
  const sheet = await screen.findByRole("dialog");
  await settled();
  return sheet;
}

function partOf(sheet: HTMLElement, part: string): HTMLElement {
  const found = sheet.querySelector<HTMLElement>(`[data-bt-part="${part}"]`);
  if (!found) throw new Error(`no ${part}`);
  return found;
}

describe("Sheet", () => {
  it("stamps its class and data-bt on the sheet, forwards its ref and spreads props", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Sheet defaultOpen>
        <Sheet.Content
          ref={ref}
          label="Filters"
          className="custom"
          data-testid="filters"
        />
      </Sheet>,
    );
    await screen.findByRole("dialog");
    expect(ref.current?.dataset["bt"]).toBe("Sheet");
    expect(ref.current?.dataset["testid"]).toBe("filters");
    expect(ref.current?.className).toBe("bt-sheet bt-surface custom");
  });

  it("opens from its trigger, named by its title and described by its description, with focus waiting on it", async () => {
    render(<Bag />);
    await browser.click(screen.getByRole("button", { name: "Bag" }));
    const sheet = await screen.findByRole("dialog");
    expect(document.activeElement).toBe(sheet);
    await settled();
    expect(sheet).toHaveAccessibleName("Your bag");
    expect(sheet).toHaveAccessibleDescription(
      "2 bags of coffee, roasted the morning after you order.",
    );
    expect(sheet.getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement).toBe(sheet);
  });

  // WebKit leaves buttons out of the tab order unless the system's keyboard setting puts them in.
  it.skipIf(!navigator.userAgent.includes("Chrome/"))(
    "starts Tab at its first control once it has slid in",
    async () => {
      render(<Bag />);
      await openBag();
      await browser.tab();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Remove Guji" }),
      );
    },
  );

  it("moves focus to its first field to type in once it has slid in", async () => {
    render(
      <Bag>
        <Sheet.Header title="Gift note" />
        <Sheet.Body>
          <a href="#why">Why a note?</a>
          <label>
            Note
            <input />
          </label>
        </Sheet.Body>
      </Bag>,
    );
    await browser.click(screen.getByRole("button", { name: "Bag" }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByLabelText("Note"));
    });
  });

  it("closes on Escape and hands focus back to its trigger", async () => {
    render(<Bag />);
    await openBag();
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Bag" }),
    );
  });

  it("closes from its close button, a Sheet.Close and a press on the dimmed page", async () => {
    render(<Bag />);
    await openBag();
    await browser.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await openBag();
    await browser.click(screen.getByRole("button", { name: "Keep shopping" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await page.viewport(1200, 800);
    await openBag();
    const frame = document.querySelector<HTMLElement>('[data-bt-part="frame"]');
    if (!frame) throw new Error("no frame");
    await page.elementLocator(frame).click({ position: { x: 40, y: 40 } });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps focus inside while it's open", async () => {
    render(<Bag />);
    const sheet = await openBag();
    for (let step = 0; step < 6; step += 1) {
      await browser.tab();
      expect(sheet.contains(document.activeElement)).toBe(true);
    }
  });

  it("takes its name from label without a header, isn't described without a description, and logs nothing", async () => {
    const error = vi.spyOn(console, "error");
    const warn = vi.spyOn(console, "warn");
    render(
      <Sheet defaultOpen>
        <Sheet.Content label="Filters">
          <Sheet.Body>
            <Button>Light roasts</Button>
          </Sheet.Body>
        </Sheet.Content>
      </Sheet>,
    );
    const sheet = await screen.findByRole("dialog", { name: "Filters" });
    expect(sheet.hasAttribute("aria-describedby")).toBe(false);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns, with the fix, when it has no name", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <Sheet defaultOpen>
        <Sheet.Content />
      </Sheet>,
    );
    await screen.findByRole("dialog");
    expect(warn).toHaveBeenCalledWith(
      '[buttery:Sheet] A sheet has no name, so screen readers announce it as just "dialog". Fix: put a <Sheet.Header title="…" /> in it, or pass label="…" to Sheet.Content.',
    );
  });

  it("sits 8px inside the window's end, as tall as the window, 400, 560 or 880 wide by size, and never wider than the window less 16", async () => {
    await page.viewport(1200, 800);
    for (const [size, width] of [
      ["sm", 400],
      ["md", 560],
      ["lg", 880],
    ] as const) {
      render(<Bag size={size} />);
      const box = (await openBag()).getBoundingClientRect();
      expect(box.width).toBe(width);
      expect(box.right).toBe(1192);
      expect(box.top).toBe(8);
      expect(box.bottom).toBe(792);
      cleanup();
    }
    await page.viewport(360, 640);
    render(<Bag />);
    const box = (await openBag()).getBoundingClientRect();
    expect(box.left).toBe(8);
    expect(box.right).toBe(352);
  });

  it("sits 8px inside the window's start with side start", async () => {
    await page.viewport(1200, 800);
    render(<Bag side="start" />);
    const box = (await openBag()).getBoundingClientRect();
    expect(box.left).toBe(8);
    expect(box.width).toBe(400);
    expect(box.top).toBe(8);
    expect(box.bottom).toBe(792);
  });

  it("keeps its header and footer in view while its body scrolls", async () => {
    await page.viewport(1200, 500);
    render(
      <Bag>
        <Sheet.Header title="Delivery terms" />
        <Sheet.Body>
          <p>
            {"Every order ships the morning after it's roasted. ".repeat(60)}
          </p>
        </Sheet.Body>
        <Sheet.Footer>
          <Button variant="primary" size="cta" shape="rounded">
            Agree
          </Button>
        </Sheet.Footer>
      </Bag>,
    );
    const sheet = await openBag();
    const box = sheet.getBoundingClientRect();
    const body = partOf(sheet, "sheet-body");
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    expect(partOf(sheet, "sheet-header").getBoundingClientRect().top).toBe(
      box.top,
    );
    expect(partOf(sheet, "sheet-footer").getBoundingClientRect().bottom).toBe(
      box.bottom,
    );
    expect(screen.getByRole("button", { name: "Agree" })).toBeVisible();
  });

  it("rises from the bottom as wide as the window and as tall as its content, under a handle", async () => {
    await page.viewport(390, 844);
    render(<Bag side="bottom" size="lg" />);
    const sheet = await openBag();
    const box = sheet.getBoundingClientRect();
    expect(box.left).toBe(8);
    expect(box.right).toBe(382);
    expect(box.bottom).toBe(836);
    expect(box.height).toBeLessThan(400);
    const handle = partOf(sheet, "sheet-handle").getBoundingClientRect();
    expect(handle.top).toBe(box.top);
    expect(handle.height).toBe(24);
    const close = screen
      .getByRole("button", { name: "Close" })
      .getBoundingClientRect();
    expect(close.top + close.height / 2 - box.top).toBe(24);
    expect(box.right - (close.left + close.width / 2)).toBe(24);
  });

  it("stops a drawer 64px short of the window's top and scrolls its body", async () => {
    await page.viewport(390, 640);
    render(
      <Bag side="bottom">
        <Sheet.Header title="Delivery terms" />
        <Sheet.Body>
          <p>
            {"Every order ships the morning after it's roasted. ".repeat(60)}
          </p>
        </Sheet.Body>
      </Bag>,
    );
    const sheet = await openBag();
    const box = sheet.getBoundingClientRect();
    expect(box.top).toBe(56);
    expect(box.bottom).toBe(632);
    const body = partOf(sheet, "sheet-body");
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  });

  it("shows no handle at the end or start", async () => {
    await page.viewport(1200, 800);
    render(<Bag />);
    const sheet = await openBag();
    expect(partOf(sheet, "sheet-handle").getClientRects()).toHaveLength(0);
    const close = screen
      .getByRole("button", { name: "Close" })
      .getBoundingClientRect();
    const box = sheet.getBoundingClientRect();
    expect(close.top + close.height / 2 - box.top).toBe(24);
  });

  it("takes a side for each width: a drawer under 640px and a side panel at the end from 640", async () => {
    const side = { base: "bottom", md: "end" } as const;
    await page.viewport(390, 844);
    render(<Bag side={side} />);
    let box = (await openBag()).getBoundingClientRect();
    expect(box.left).toBe(8);
    expect(box.right).toBe(382);
    expect(box.bottom).toBe(836);
    expect(box.top).toBeGreaterThan(400);
    cleanup();
    await page.viewport(1024, 768);
    render(<Bag side={side} />);
    box = (await openBag()).getBoundingClientRect();
    expect(box.width).toBe(400);
    expect(box.right).toBe(1016);
    expect(box.top).toBe(8);
    expect(box.bottom).toBe(760);
  });

  it("keeps the side below a width it isn't given: the start from 1024 with { md: 'bottom', lg: 'start' }", async () => {
    const side = { md: "bottom", lg: "start" } as const;
    await page.viewport(600, 800);
    render(<Bag side={side} />);
    let box = (await openBag()).getBoundingClientRect();
    expect(box.right).toBe(592);
    expect(box.top).toBe(8);
    cleanup();
    await page.viewport(800, 800);
    render(<Bag side={side} />);
    box = (await openBag()).getBoundingClientRect();
    expect(box.width).toBe(784);
    expect(box.bottom).toBe(792);
    expect(box.top).toBeGreaterThan(300);
    cleanup();
    await page.viewport(1200, 800);
    render(<Bag side={side} />);
    box = (await openBag()).getBoundingClientRect();
    expect(box.left).toBe(8);
    expect(box.width).toBe(400);
  });

  it("slides in from beyond its edge without fading", async () => {
    await page.viewport(1200, 800);
    render(<Bag />);
    const first: { left: number; opacity: string }[] = [];
    const watch = new MutationObserver(() => {
      const arriving = document.querySelector('[data-bt="Sheet"]');
      if (!arriving || first.length > 0) return;
      first.push({
        left: arriving.getBoundingClientRect().left,
        opacity: getComputedStyle(arriving).opacity,
      });
    });
    watch.observe(document.body, { childList: true, subtree: true });
    await browser.click(screen.getByRole("button", { name: "Bag" }));
    const sheet = await screen.findByRole("dialog");
    watch.disconnect();
    expect(first).toEqual([{ left: 1200, opacity: "1" }]);
    await settled();
    expect(sheet.getBoundingClientRect().left).toBe(792);
  });

  it("fades in where it rests with reduced motion", async () => {
    await page.viewport(1200, 800);
    render(
      <ButteryProvider reducedMotion="always" layoutGuard={false}>
        <Bag />
      </ButteryProvider>,
    );
    await browser.click(screen.getByRole("button", { name: "Bag" }));
    const sheet = await screen.findByRole("dialog");
    expect(Number(getComputedStyle(sheet).opacity)).toBeLessThan(1);
    expect(sheet.getBoundingClientRect().left).toBe(792);
    await settled();
    expect(getComputedStyle(sheet).opacity).toBe("1");
  });

  it("springs a drawer back when it's dragged a little, and closes it when it's dragged down past a quarter of its height", async () => {
    await page.viewport(390, 844);
    render(<Bag side="bottom" />);
    let sheet = await openBag();
    const rest = sheet.getBoundingClientRect();
    const handle = partOf(sheet, "sheet-handle");
    await browser.dragAndDrop(handle, sheet, {
      sourcePosition: { x: rest.width / 2, y: 12 },
      targetPosition: { x: rest.width / 2, y: 22 },
      steps: 5,
    });
    await settled();
    expect(screen.getByRole("dialog")).toBe(sheet);
    expect(sheet.getBoundingClientRect().top).toBe(rest.top);
    await browser.dragAndDrop(partOf(sheet, "sheet-header"), sheet, {
      sourcePosition: { x: 40, y: 10 },
      targetPosition: { x: 40, y: 34 + rest.height / 2 },
      steps: 5,
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Bag" }),
    );
    sheet = await openBag();
    expect(sheet.getBoundingClientRect().top).toBe(rest.top);
  });

  it("drags only as a drawer, never at the end or start", async () => {
    await page.viewport(1200, 800);
    render(<Bag />);
    const sheet = await openBag();
    const rest = sheet.getBoundingClientRect();
    await browser.dragAndDrop(partOf(sheet, "sheet-header"), sheet, {
      sourcePosition: { x: 40, y: 10 },
      targetPosition: { x: 40, y: 400 },
      steps: 5,
    });
    await settled();
    expect(screen.getByRole("dialog")).toBe(sheet);
    expect(sheet.getBoundingClientRect().top).toBe(rest.top);
  });

  it("can be controlled", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <output>{open ? "open" : "closed"}</output>
          <Sheet open={open} onOpenChange={setOpen}>
            <Sheet.Trigger asChild>
              <Button>Filters</Button>
            </Sheet.Trigger>
            <Sheet.Content label="Filters" />
          </Sheet>
        </>
      );
    }
    render(<Controlled />);
    await browser.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByText("open", { selector: "output" })).toBeTruthy();
    await screen.findByRole("dialog");
    await settled();
    await browser.keyboard("{Escape}");
    expect(screen.getByText("closed", { selector: "output" })).toBeTruthy();
  });

  it("shows its close button disabled with closeDisabled, and pressing it leaves the sheet open", async () => {
    render(
      <Sheet defaultOpen>
        <Sheet.Content closeDisabled>
          <Sheet.Header title="Saving your settings" />
        </Sheet.Content>
      </Sheet>,
    );
    await screen.findByRole("dialog");
    await settled();
    const close = screen.getByRole("button", { name: "Close" });
    expect(close.getAttribute("aria-disabled")).toBe("true");
    await browser.click(close, { force: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("tells the floating lanes where it rests, so a toast keeps to the page beside it", async () => {
    await page.viewport(1024, 768);
    render(
      <ButteryProvider layoutGuard={false}>
        <Bag />
      </ButteryProvider>,
    );
    await openBag();
    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue("--bt-lane-inset-end"),
      ).toBe("416px");
    });
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue("--bt-lane-inset-end"),
      ).toBe("0px");
    });
  });
});
