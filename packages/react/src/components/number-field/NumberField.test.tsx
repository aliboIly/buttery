import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { page, userEvent as browser } from "vitest/browser";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NumberField } from "./NumberField.tsx";

afterEach(cleanup);

function colorOf(variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function field(): HTMLInputElement {
  const input = screen.getByRole("spinbutton");
  if (!(input instanceof HTMLInputElement)) throw new Error("no input");
  return input;
}

describe("NumberField", () => {
  it("stamps its class and data-bt, forwards its ref to the input and spreads props", () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberField ref={ref} label="W" className="custom" name="width" />);
    const root = ref.current?.closest('[data-bt="NumberField"]');
    expect(root?.className).toBe("bt-number-field custom");
    expect(ref.current?.getAttribute("name")).toBe("width");
  });

  it("is a spinbutton named by its label, with its value and unit for screen readers", () => {
    render(
      <NumberField
        label="W"
        defaultValue={1080}
        unit="px"
        min={1}
        max={8000}
      />,
    );
    expect(screen.getByRole("spinbutton", { name: "W" })).toBe(field());
    expect(field().value).toBe("1080");
    expect(field().getAttribute("aria-valuenow")).toBe("1080");
    expect(field().getAttribute("aria-valuetext")).toBe("1080 px");
  });

  it("is named by its label alone in the browser, its stepper buttons outside the label", async () => {
    render(<NumberField label="W" defaultValue={1080} unit="px" />);
    await expect
      .element(page.getByRole("spinbutton", { name: "W", exact: true }))
      .toBeInTheDocument();
    expect(field().labels?.[0]?.textContent).toBe("W");
    expect(field().labels?.[0]?.querySelector("button")).toBeNull();
  });

  it("focuses the input from a press anywhere in the field but the stepper", async () => {
    render(<NumberField label="W" defaultValue={1080} unit="px" />);
    const box = field().closest('[data-bt-part="field"]');
    if (!box) throw new Error("No field.");
    await browser.click(box, { position: { x: 4, y: 17 } });
    expect(document.activeElement).toBe(field());
  });

  it("steps from what's typed when it's a number", async () => {
    const change = vi.fn();
    render(<NumberField label="W" defaultValue={128} onValueChange={change} />);
    await userEvent.clear(field());
    await userEvent.type(field(), "300{ArrowUp}");
    expect(change).toHaveBeenLastCalledWith(301);
    expect(field().value).toBe("301");
  });

  it("commits typing on Enter, clamped to its range, and puts the old value back on Escape", async () => {
    const change = vi.fn();
    render(
      <NumberField
        label="W"
        defaultValue={100}
        max={500}
        onValueChange={change}
      />,
    );
    await userEvent.clear(field());
    await userEvent.type(field(), "900{Enter}");
    expect(change).toHaveBeenLastCalledWith(500);
    expect(field().value).toBe("500");
    await userEvent.clear(field());
    await userEvent.type(field(), "42{Escape}");
    expect(field().value).toBe("500");
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("commits on leaving the field and ignores text that isn't a number", async () => {
    const change = vi.fn();
    render(
      <>
        <NumberField label="W" defaultValue={100} onValueChange={change} />
        <button type="button">Elsewhere</button>
      </>,
    );
    await userEvent.clear(field());
    await userEvent.type(field(), "wide");
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(change).not.toHaveBeenCalled();
    expect(field().value).toBe("100");
    await userEvent.clear(field());
    await userEvent.type(field(), "240");
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(change).toHaveBeenLastCalledWith(240);
  });

  it("steps with the arrow keys, ten at a time with Shift, and from the stepper", async () => {
    const change = vi.fn();
    render(<NumberField label="W" defaultValue={10} onValueChange={change} />);
    field().focus();
    await browser.keyboard("{ArrowUp}");
    expect(change).toHaveBeenLastCalledWith(11);
    await browser.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(change).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole("button", { name: "Increase W" }));
    expect(change).toHaveBeenLastCalledWith(2);
  });

  it("scrubs when its label is dragged sideways", async () => {
    const change = vi.fn<(value: number) => void>();
    render(
      <NumberField label="Width" defaultValue={100} onValueChange={change} />,
    );
    const label = screen.getByText("Width");
    const { width, height } = label.getBoundingClientRect();
    await browser.dragAndDrop(label, field(), {
      sourcePosition: { x: width / 2, y: height / 2 },
      targetPosition: { x: 4, y: 4 },
    });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(change.mock.lastCall?.[0]).toBeGreaterThan(100);
  });

  it("puts its label above a field that fills its column when asked", () => {
    render(
      <div style={{ inlineSize: "240px" }}>
        <NumberField label="Width" labelPosition="top" defaultValue={1600} />
      </div>,
    );
    const label = screen.getByText("Width");
    const field = document.querySelector('[data-bt-part="field"]');
    expect(field).not.toBeNull();
    const box = field?.getBoundingClientRect();
    expect(box?.top ?? 0).toBeGreaterThan(label.getBoundingClientRect().bottom);
    expect(Math.round(box?.width ?? 0)).toBe(240);
  });

  it("drops its stepper when the field is too narrow to show the number beside it", () => {
    render(
      <>
        <div style={{ inlineSize: "86px" }}>
          <NumberField label="Width" labelPosition="top" defaultValue={1600} />
        </div>
        <NumberField label="Height" defaultValue={900} />
      </>,
    );
    const [narrow, roomy] = [
      ...document.querySelectorAll<HTMLElement>('[data-bt-part="stepper"]'),
    ];
    expect(narrow && getComputedStyle(narrow).display).toBe("none");
    expect(roomy && getComputedStyle(roomy).display).not.toBe("none");
  });

  it("is 34px tall", () => {
    render(<NumberField label="W" />);
    const box = field().closest('[data-bt-part="field"]');
    expect(box?.getBoundingClientRect().height).toBe(34);
  });

  it("takes its height from the height tokens at each size, 16px digits at lg", () => {
    render(
      <>
        <NumberField label="Small" size="sm" defaultValue={4} />
        <NumberField label="Medium" defaultValue={4} />
        <NumberField label="Large" size="lg" defaultValue={4} />
      </>,
    );
    const box = (label: string): HTMLElement => {
      const part = screen
        .getByRole("spinbutton", { name: label })
        .closest<HTMLElement>('[data-bt-part="field"]');
      if (!part) throw new Error(`No field for ${label}.`);
      return part;
    };
    expect(box("Small").getBoundingClientRect().height).toBe(28);
    expect(box("Medium").getBoundingClientRect().height).toBe(34);
    expect(box("Large").getBoundingClientRect().height).toBe(48);
    expect(
      getComputedStyle(screen.getByRole("spinbutton", { name: "Large" }))
        .fontSize,
    ).toBe("16px");
    const step = box("Small").querySelector<HTMLElement>(
      '[data-bt-part="step"]',
    );
    expect(step?.getBoundingClientRect().height).toBe(24);
  });

  it("draws soft on bg-control, its edge on hover, and a step's hover a shade deeper than the fill", async () => {
    render(<NumberField label="W" variant="soft" defaultValue={12} />);
    const part = field().closest<HTMLElement>('[data-bt-part="field"]');
    if (!part) throw new Error("No field.");
    const edge = colorOf("--bt-control-border");
    const deeper = colorOf("--bt-border");
    expect(getComputedStyle(part).backgroundColor).toBe(
      colorOf("--bt-bg-control"),
    );
    expect(getComputedStyle(part).borderTopColor).toBe("rgba(0, 0, 0, 0)");
    await browser.hover(part);
    expect(getComputedStyle(part).borderTopColor).toBe(edge);
    const increase = screen.getByRole("button", { name: "Increase W" });
    await browser.hover(increase);
    await expect
      .poll(() => getComputedStyle(increase).backgroundColor)
      .toBe(deeper);
  });
});
