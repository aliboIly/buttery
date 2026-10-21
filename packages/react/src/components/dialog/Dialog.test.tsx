import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Button } from "../button/Button.tsx";
import { Dialog } from "./Dialog.tsx";
import type { DialogSize } from "./Dialog.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Confirm({
  size,
  children,
}: {
  readonly size?: DialogSize;
  readonly children?: ReactNode;
}): ReactElement {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Delete card</Button>
      </Dialog.Trigger>
      <Dialog.Content size={size}>
        {children ?? (
          <>
            <Dialog.Text
              title="Delete this card?"
              body="It stays in the trash for 30 days."
            />
            <Dialog.Actions>
              <Dialog.Close asChild>
                <Button variant="soft" size="cta" shape="rounded">
                  Keep it
                </Button>
              </Dialog.Close>
              <Button variant="primary" size="cta" shape="rounded">
                Delete
              </Button>
            </Dialog.Actions>
          </>
        )}
      </Dialog.Content>
    </Dialog>
  );
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

async function openConfirm(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole("button", { name: "Delete card" }));
  const dialog = await screen.findByRole("dialog");
  await settled();
  return dialog;
}

describe("Dialog", () => {
  it("stamps its class and data-bt on the dialog, forwards its ref and spreads props", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog defaultOpen>
        <Dialog.Content
          ref={ref}
          label="Card details"
          className="custom"
          data-testid="details"
        />
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expect(ref.current?.dataset["bt"]).toBe("Dialog");
    expect(ref.current?.dataset["testid"]).toBe("details");
    expect(ref.current?.className).toBe("bt-dialog bt-surface custom");
  });

  it("opens from its trigger, named by its title and described by its body, with focus inside", async () => {
    render(<Confirm />);
    const dialog = await openConfirm();
    expect(dialog).toHaveAccessibleName("Delete this card?");
    expect(dialog).toHaveAccessibleDescription(
      "It stays in the trash for 30 days.",
    );
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Keep it" }),
    );
  });

  it("closes on Escape and hands focus back to its trigger", async () => {
    render(<Confirm />);
    await openConfirm();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete card" }),
    );
  });

  it("closes from its close button, a Dialog.Close and a press outside", async () => {
    render(<Confirm />);
    await openConfirm();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await openConfirm();
    await userEvent.click(screen.getByRole("button", { name: "Keep it" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await openConfirm();
    const frame = document.querySelector<HTMLElement>('[data-bt-part="frame"]');
    if (!frame) throw new Error("no frame");
    await page.elementLocator(frame).click({ position: { x: 4, y: 4 } });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps focus inside while it's open", async () => {
    render(<Confirm />);
    const dialog = await openConfirm();
    for (let step = 0; step < 6; step += 1) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("takes its name from label without Dialog.Text, and isn't described without a body, with nothing logged", async () => {
    const error = vi.spyOn(console, "error");
    const warn = vi.spyOn(console, "warn");
    render(
      <Dialog defaultOpen>
        <Dialog.Content label="Share the card">
          <Dialog.Actions>
            <Button>Copy link</Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Share the card",
    });
    expect(dialog.hasAttribute("aria-describedby")).toBe(false);
    cleanup();
    render(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Text title="Saved" />
        </Dialog.Content>
      </Dialog>,
    );
    expect(await screen.findByRole("dialog", { name: "Saved" })).toBeTruthy();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns, with the fix, when it has no name", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <Dialog defaultOpen>
        <Dialog.Content />
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expect(warn).toHaveBeenCalledWith(
      '[buttery:Dialog] A dialog has no name, so screen readers announce it as just "dialog". Fix: put a <Dialog.Text title="…" /> in it, or pass label="…" to Dialog.Content.',
    );
  });

  it("is 400, 560 or 880 wide by size, and stays 16px inside a narrow window", async () => {
    await page.viewport(1200, 800);
    for (const [size, width] of [
      ["sm", 400],
      ["md", 560],
      ["lg", 880],
    ] as const) {
      render(<Confirm size={size} />);
      const dialog = await openConfirm();
      expect(dialog.getBoundingClientRect().width).toBe(width);
      cleanup();
    }
    await page.viewport(360, 640);
    render(<Confirm />);
    const dialog = await openConfirm();
    const box = dialog.getBoundingClientRect();
    expect(box.left).toBe(16);
    expect(window.innerWidth - box.right).toBe(16);
  });

  it("centers its close button 24px from the top and end edges, with the title clear of it", async () => {
    await page.viewport(1200, 800);
    render(<Confirm />);
    const dialog = await openConfirm();
    const box = dialog.getBoundingClientRect();
    const close = screen
      .getByRole("button", { name: "Close" })
      .getBoundingClientRect();
    expect(close.top + close.height / 2 - box.top).toBe(24);
    expect(box.right - (close.left + close.width / 2)).toBe(24);
    const title = screen.getByText("Delete this card?").getBoundingClientRect();
    expect(title.right).toBeLessThanOrEqual(close.left);
  });

  it("can be controlled", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <output>{open ? "open" : "closed"}</output>
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button>Rename</Button>
            </Dialog.Trigger>
            <Dialog.Content label="Rename the card" />
          </Dialog>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Rename" }));
    expect(screen.getByText("open", { selector: "output" })).toBeTruthy();
    await screen.findByRole("dialog");
    await settled();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByText("closed", { selector: "output" })).toBeTruthy();
  });

  it("fades in over dur-fast, growing from 97%", async () => {
    render(<Confirm />);
    await userEvent.click(screen.getByRole("button", { name: "Delete card" }));
    const dialog = await screen.findByRole("dialog");
    const first = getComputedStyle(dialog);
    expect(Number(first.opacity)).toBeLessThan(1);
    expect(new DOMMatrixReadOnly(first.transform).a).toBeLessThan(1);
    expect(new DOMMatrixReadOnly(first.transform).a).toBeGreaterThanOrEqual(
      0.97,
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(getComputedStyle(dialog).opacity).toBe("1");
  });
});
