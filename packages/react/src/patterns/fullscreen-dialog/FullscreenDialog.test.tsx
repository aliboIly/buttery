import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { FullscreenDialog } from "./FullscreenDialog.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

async function opened(): Promise<HTMLElement> {
  const dialog = await screen.findByRole("dialog");
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
  return dialog;
}

describe("FullscreenDialog", () => {
  it("stamps its class and data-bt on its content, forwards its ref to the dialog", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FullscreenDialog
        ref={ref}
        defaultOpen
        title="What do you need?"
        className="custom"
      />,
    );
    await screen.findByRole("dialog");
    expect(
      document.querySelector("[data-bt='FullscreenDialog']")?.className,
    ).toBe("bt-fullscreen-dialog custom");
    expect(ref.current?.dataset["size"]).toBe("full");
  });

  it("fills the window less 16px on every side, named by its whole headline", async () => {
    render(
      <FullscreenDialog
        defaultOpen
        title="What do you need to get started?"
        note="You can change this later."
      />,
    );
    const dialog = await screen.findByRole("dialog", {
      name: "What do you need to get started? You can change this later.",
    });
    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
        true,
      );
    });
    const box = dialog.getBoundingClientRect();
    expect(box.left).toBe(16);
    expect(box.top).toBe(16);
    expect(window.innerWidth - box.right).toBe(16);
    expect(window.innerHeight - box.bottom).toBe(16);
  });

  it("fades in without growing", async () => {
    render(
      <FullscreenDialog
        trigger={<Button>Set up</Button>}
        title="What do you need?"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Set up" }));
    const first = getComputedStyle(await screen.findByRole("dialog"));
    expect(Number(first.opacity)).toBeLessThan(1);
    expect(new DOMMatrixReadOnly(first.transform).isIdentity).toBe(true);
  });

  it("sets its mark 32px in, centered on the close button's line, and 24px in under 640px of width", async () => {
    for (const [width, inset, center] of [
      [1200, 32, 46],
      [390, 24, 24],
    ] as const) {
      await page.viewport(width, 800);
      render(
        <FullscreenDialog
          defaultOpen
          title="What do you need?"
          logo={<span>Pier Street Roasters</span>}
        />,
      );
      const dialog = await opened();
      const box = dialog.getBoundingClientRect();
      const mark = within(dialog)
        .getByText("Pier Street Roasters")
        .getBoundingClientRect();
      const close = within(dialog)
        .getByRole("button", { name: "Close" })
        .getBoundingClientRect();
      expect(mark.left - box.left).toBe(inset);
      expect(mark.top + mark.height / 2 - box.top).toBe(center);
      expect(close.top + close.height / 2 - box.top).toBe(center);
      cleanup();
    }
  });

  it("puts its actions at the bottom end, 32px in from 640px of width, and its answer under the headline", async () => {
    for (const [width, inset] of [
      [1200, 32],
      [390, 24],
    ] as const) {
      await page.viewport(width, 800);
      render(
        <FullscreenDialog
          defaultOpen
          title="What do you need?"
          actions={<Button variant="primary">Save</Button>}
        >
          <p>Sell online</p>
        </FullscreenDialog>,
      );
      const dialog = await opened();
      const save = within(dialog)
        .getByRole("button", { name: "Save" })
        .getBoundingClientRect();
      const box = dialog.getBoundingClientRect();
      expect(box.right - save.right).toBe(inset);
      expect(box.bottom - save.bottom).toBe(inset);
      expect(
        within(dialog).getByText("Sell online").getBoundingClientRect().top,
      ).toBeGreaterThan(
        within(dialog).getByRole("heading").getBoundingClientRect().bottom,
      );
      cleanup();
    }
  });
});
