import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as browser } from "vitest/browser";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ColorDot } from "./ColorDot.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function dot(): HTMLElement {
  return screen.getByRole("button", { name: /^First hue/ });
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("ColorDot", () => {
  it("stamps its class and data-bt, and forwards its ref to the dot", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ColorDot ref={ref} label="First hue" className="custom" />);
    expect(ref.current?.dataset["bt"]).toBe("ColorDot");
    expect(ref.current?.className).toBe("bt-color-dot custom");
  });

  it("is a button named by its label and color, showing the color in a 24px dot with a 28px target", () => {
    render(<ColorDot label="First hue" defaultValue="#a5b4fc" />);
    expect(dot().getAttribute("aria-label")).toBe("First hue, #a5b4fc");
    const swatch = dot().querySelector<HTMLElement>('[data-bt-part="dot"]');
    expect(swatch && getComputedStyle(swatch).backgroundColor).toBe(
      "rgb(165, 180, 252)",
    );
    expect(dot().getBoundingClientRect().width).toBe(24);
    const hit = dot().querySelector("[data-bt-hit]");
    expect(hit?.getBoundingClientRect().width).toBe(28);
    expect(hit?.getBoundingClientRect().height).toBe(28);
    expect(document.querySelector('input[type="color"]')).toBeNull();
  });

  it("takes presses past the dot's edge, inside its 28px target", () => {
    render(
      <div style={{ padding: "var(--bt-space-4)" }}>
        <ColorDot label="First hue" />
      </div>,
    );
    const box = dot().getBoundingClientRect();
    const pressed = document.elementFromPoint(
      box.left - 1,
      box.top + box.height / 2,
    );
    expect(pressed?.closest("button")).toBe(dot());
  });

  it("opens buttery's picker in a popover, and Escape closes it with focus back on the dot", async () => {
    render(<ColorDot label="First hue" defaultValue="#a5b4fc" />);
    await userEvent.click(dot());
    await settled();
    const panel = screen.getByRole("dialog", { name: "First hue" });
    expect(
      panel
        .querySelector('[data-bt="ColorPicker"]')
        ?.getAttribute("aria-label"),
    ).toBe("First hue");
    expect(document.activeElement).toBe(
      screen.getByRole("slider", { name: "Saturation" }),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(dot());
  });

  it("reports each color while a drag runs and commits once when it ends", async () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(
      <ColorDot
        label="First hue"
        defaultValue="#ff0000"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    );
    await userEvent.click(dot());
    await settled();
    const area = document.querySelector<HTMLElement>('[data-bt-part="area"]');
    if (!area) throw new Error("no area");
    const { width, height } = area.getBoundingClientRect();
    await browser.dragAndDrop(area, area, {
      sourcePosition: { x: width * 0.9, y: height * 0.1 },
      targetPosition: { x: width / 2, y: height / 2 },
    });
    expect(onValueChange.mock.calls.length).toBeGreaterThan(1);
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenLastCalledWith("#804040");
    expect(dot().getAttribute("aria-label")).toBe("First hue, #804040");
  });

  it("puts back an unsaved code on the first Escape and closes on the second", async () => {
    const onValueCommit = vi.fn();
    render(
      <ColorDot
        label="First hue"
        defaultValue="#ff0000"
        onValueCommit={onValueCommit}
      />,
    );
    await userEvent.click(dot());
    await settled();
    const code = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Hex code",
    });
    await userEvent.clear(code);
    await userEvent.type(code, "123456");
    await userEvent.keyboard("{Escape}");
    expect(code.value).toBe("FF0000");
    expect(screen.getByRole("dialog", { name: "First hue" })).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onValueCommit).not.toHaveBeenCalled();
  });

  it("doesn't open while disabled", async () => {
    render(<ColorDot label="First hue" disabled />);
    await userEvent.click(dot());
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
