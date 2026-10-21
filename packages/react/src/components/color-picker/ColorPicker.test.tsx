import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as browser } from "vitest/browser";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColorPicker } from "./ColorPicker.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function slider(name: string): HTMLElement {
  return screen.getByRole("slider", { name });
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-bt-part="${name}"]`,
  );
  if (!element) throw new Error(`no ${name}`);
  return element;
}

function center(element: HTMLElement): { x: number; y: number } {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

describe("ColorPicker", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ColorPicker
        ref={ref}
        label="Backdrop"
        className="custom"
        data-testid="picker"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("ColorPicker");
    expect(ref.current?.dataset["testid"]).toBe("picker");
    expect(ref.current?.className).toBe("bt-color-picker custom");
  });

  it("is a group named by its label, with saturation, brightness and hue sliders and a code field", () => {
    render(<ColorPicker label="Backdrop" defaultValue="#ff0000" />);
    expect(screen.getByRole("group", { name: "Backdrop" })).toBeTruthy();
    expect(slider("Saturation").getAttribute("aria-valuetext")).toBe("100%");
    expect(slider("Brightness").getAttribute("aria-valuetext")).toBe("100%");
    expect(slider("Hue").getAttribute("aria-valuetext")).toBe("0°");
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "Hex code" }).value,
    ).toBe("FF0000");
  });

  it("steps the area with the arrow keys, ten times as far with Shift, committing each step", async () => {
    const change = vi.fn();
    const commit = vi.fn();
    render(
      <ColorPicker
        label="Backdrop"
        defaultValue="#808080"
        onValueChange={change}
        onValueCommit={commit}
      />,
    );
    slider("Saturation").focus();
    await browser.keyboard("{ArrowRight}");
    expect(slider("Saturation").getAttribute("aria-valuetext")).toBe("1%");
    await browser.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(slider("Brightness").getAttribute("aria-valuetext")).toBe("60%");
    expect(document.activeElement).toBe(slider("Brightness"));
    expect(commit).toHaveBeenCalledTimes(2);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it("gives the area one Tab stop, on the axis last moved", async () => {
    render(<ColorPicker label="Backdrop" defaultValue="#808080" />);
    slider("Saturation").focus();
    await browser.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(slider("Brightness"));
    await userEvent.tab();
    expect(document.activeElement).toBe(slider("Hue"));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(slider("Brightness"));
  });

  it("turns the hue with the arrow keys, Home and End", async () => {
    const change = vi.fn();
    render(
      <ColorPicker
        label="Backdrop"
        defaultValue="#ff0000"
        onValueChange={change}
      />,
    );
    slider("Hue").focus();
    await browser.keyboard("{Shift>}{ArrowRight}{/Shift}");
    expect(slider("Hue").getAttribute("aria-valuetext")).toBe("10°");
    expect(change).toHaveBeenLastCalledWith("#ff2a00");
    await browser.keyboard("{End}");
    expect(slider("Hue").getAttribute("aria-valuetext")).toBe("360°");
    await browser.keyboard("{Home}");
    expect(slider("Hue").getAttribute("aria-valuetext")).toBe("0°");
  });

  it("keeps the hue of a color taken to gray", async () => {
    render(<ColorPicker label="Backdrop" defaultValue="#2862e0" />);
    const hue = slider("Hue").getAttribute("aria-valuetext");
    slider("Saturation").focus();
    await browser.keyboard("{Home}");
    expect(slider("Saturation").getAttribute("aria-valuetext")).toBe("0%");
    expect(slider("Hue").getAttribute("aria-valuetext")).toBe(hue);
  });

  it("follows a drag across the area and commits once, where it ends", async () => {
    const change = vi.fn();
    const commit = vi.fn();
    render(
      <ColorPicker
        label="Backdrop"
        defaultValue="#ff0000"
        onValueChange={change}
        onValueCommit={commit}
      />,
    );
    const area = part("area");
    const { width, height } = area.getBoundingClientRect();
    await browser.dragAndDrop(area, area, {
      sourcePosition: { x: width * 0.2, y: height * 0.2 },
      targetPosition: { x: width / 2, y: height / 2 },
    });
    expect(change.mock.calls.length).toBeGreaterThan(1);
    expect(commit).toHaveBeenCalledTimes(1);
    expect(slider("Saturation").getAttribute("aria-valuetext")).toBe("50%");
    expect(slider("Brightness").getAttribute("aria-valuetext")).toBe("50%");
    expect(commit).toHaveBeenLastCalledWith("#804040");
    const thumb = center(part("area-thumb"));
    const middle = center(area);
    expect(thumb.x).toBeCloseTo(middle.x, 0);
    expect(thumb.y).toBeCloseTo(middle.y, 0);
  });

  it("follows a drag along the hue track, its thumb staying inside the track", async () => {
    const commit = vi.fn();
    render(
      <ColorPicker
        label="Backdrop"
        defaultValue="#ff0000"
        onValueCommit={commit}
      />,
    );
    const hue = part("hue");
    const { width, height } = hue.getBoundingClientRect();
    await browser.dragAndDrop(hue, hue, {
      sourcePosition: { x: 10, y: height / 2 },
      targetPosition: { x: width / 2, y: height / 2 },
    });
    expect(slider("Hue").getAttribute("aria-valuetext")).toBe("180°");
    expect(commit).toHaveBeenLastCalledWith("#00ffff");
    const thumb = part("hue-thumb").getBoundingClientRect();
    expect(thumb.left).toBeGreaterThanOrEqual(hue.getBoundingClientRect().left);
    expect(center(part("hue-thumb")).x).toBeCloseTo(center(hue).x, 0);
  });

  it("takes a typed code on Enter, puts back a wrong one, and reverts a draft on Escape", async () => {
    const commit = vi.fn();
    render(
      <ColorPicker
        label="Backdrop"
        defaultValue="#ff0000"
        onValueCommit={commit}
      />,
    );
    const code = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Hex code",
    });
    await userEvent.clear(code);
    await userEvent.type(code, "0af{Enter}");
    expect(commit).toHaveBeenLastCalledWith("#00aaff");
    expect(code.value).toBe("00AAFF");
    await userEvent.clear(code);
    await userEvent.type(code, "nope{Enter}");
    expect(code.value).toBe("00AAFF");
    await userEvent.clear(code);
    await userEvent.type(code, "123456");
    expect(code.hasAttribute("data-bt-draft")).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(code.value).toBe("00AAFF");
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it("picks a preset in one press, and checks the preset the color matches", async () => {
    const commit = vi.fn();
    render(
      <ColorPicker
        label="Backdrop"
        defaultValue="#f5d06f"
        presets={["#f5d06f", "#2862e0", "#177245"]}
        onValueCommit={commit}
      />,
    );
    const presets = screen.getByRole("radiogroup", { name: "Presets" });
    expect(
      presets
        .querySelector('[aria-checked="true"]')
        ?.getAttribute("aria-label"),
    ).toBe("#f5d06f");
    await userEvent.click(screen.getByRole("radio", { name: "#2862e0" }));
    expect(commit).toHaveBeenLastCalledWith("#2862e0");
    expect(
      screen
        .getByRole("radio", { name: "#2862e0" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("lays its presets out as a swatch grid's, each filling its column", () => {
    render(
      <ColorPicker
        label="Backdrop"
        presets={["#f5d06f", "#2862e0", "#177245"]}
      />,
    );
    const grid = screen
      .getByRole("radiogroup", { name: "Presets" })
      .getBoundingClientRect();
    const preset = screen
      .getByRole("radio", { name: "#2862e0" })
      .getBoundingClientRect();
    expect(Math.abs(preset.width - (grid.width - 5 * 8) / 6)).toBeLessThan(0.5);
    expect(preset.height).toBe(preset.width);
  });

  it("can be controlled, and glides back when its owner keeps the old color", async () => {
    function Controlled(): ReactElement {
      const [color, setColor] = useState("#ff0000");
      return (
        <>
          <output>{color}</output>
          <ColorPicker
            label="Backdrop"
            value={color}
            onValueChange={setColor}
          />
        </>
      );
    }
    render(<Controlled />);
    slider("Hue").focus();
    await browser.keyboard("{ArrowRight}");
    expect(screen.getByText("#ff0400", { selector: "output" })).toBeTruthy();
    cleanup();

    render(
      <ColorPicker
        label="Backdrop"
        value="#ff0000"
        onValueChange={() => undefined}
      />,
    );
    slider("Hue").focus();
    await browser.keyboard("{ArrowRight}");
    expect(slider("Hue").getAttribute("aria-valuetext")).toBe("0°");
  });

  it("changes nothing while disabled", async () => {
    const change = vi.fn();
    render(
      <ColorPicker
        label="Backdrop"
        defaultValue="#ff0000"
        disabled
        onValueChange={change}
      />,
    );
    const area = part("area");
    await browser.click(area, { force: true });
    expect(change).not.toHaveBeenCalled();
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "Hex code" })
        .disabled,
    ).toBe(true);
  });
});
