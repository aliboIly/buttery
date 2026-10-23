import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as keyboard } from "vitest/browser";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutGrid, List } from "lucide-react";
import { SegmentedControl } from "./SegmentedControl.tsx";

afterEach(cleanup);

function checked(): string | null {
  return (
    screen
      .getAllByRole("radio")
      .find((radio) => radio.getAttribute("aria-checked") === "true")
      ?.textContent ?? null
  );
}

describe("SegmentedControl", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SegmentedControl
        ref={ref}
        label="Fill"
        options={["Blend", "Color"]}
        className="custom"
        data-testid="fill"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("SegmentedControl");
    expect(ref.current?.dataset["testid"]).toBe("fill");
    expect(ref.current?.className).toBe("bt-segmented-control custom");
  });

  it("is a radio group named by its label, with the first option chosen", () => {
    render(<SegmentedControl label="Fill" options={["Blend", "Color"]} />);
    expect(screen.getByRole("radiogroup", { name: "Fill" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(checked()).toBe("Blend");
  });

  it("picks on click, reports the value and never deselects", async () => {
    const change = vi.fn();
    render(
      <SegmentedControl
        label="Fill"
        options={["Blend", "Color"]}
        onValueChange={change}
      />,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Color" }));
    expect(change).toHaveBeenLastCalledWith("Color");
    await userEvent.click(screen.getByRole("radio", { name: "Color" }));
    expect(checked()).toBe("Color");
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("follows value when controlled", () => {
    const { rerender } = render(
      <SegmentedControl
        label="Fill"
        options={["Blend", "Color"]}
        value="Blend"
      />,
    );
    rerender(
      <SegmentedControl
        label="Fill"
        options={["Blend", "Color"]}
        value="Color"
      />,
    );
    expect(checked()).toBe("Color");
  });

  it("moves the choice with arrow keys, skipping disabled options", async () => {
    render(
      <SegmentedControl
        label="Fit"
        options={[
          { value: "fit", label: "Fit" },
          { value: "fill", label: "Fill", disabled: true },
          { value: "crop", label: "Crop" },
        ]}
      />,
    );
    screen.getByRole("radio", { name: "Fit" }).focus();
    await keyboard.keyboard("{ArrowRight>}");
    await keyboard.keyboard("{/ArrowRight}");
    expect(checked()).toBe("Crop");
  });

  it("is a 34px track of 30px segments that share the widest label's width", () => {
    render(
      <SegmentedControl
        label="Fit"
        options={["Fit", "Fill the frame", "Crop"]}
        data-testid="fit"
      />,
    );
    expect(screen.getByTestId("fit").getBoundingClientRect().height).toBe(34);
    const segments = screen
      .getAllByRole("radio")
      .map((radio) => radio.getBoundingClientRect());
    expect(segments.map((rect) => rect.height)).toEqual([30, 30, 30]);
    const widths = new Set(segments.map((rect) => Math.round(rect.width)));
    expect(widths.size).toBe(1);
    const label = screen.getByText("Fill the frame");
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
  });

  it("truncates a label that doesn't fit its segment, keeping it whole in its title", () => {
    render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          inlineSize: "240px",
        }}
      >
        <SegmentedControl
          label="Accept"
          options={["image/*", ".png,.jpg", "application/pdf,image/*"]}
        />
      </div>,
    );
    const segment = screen.getByRole("radio", {
      name: "application/pdf,image/*",
    });
    const label = screen.getByText("application/pdf,image/*");
    expect(segment.scrollWidth).toBeLessThanOrEqual(segment.clientWidth);
    expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(
      segment.getBoundingClientRect().right,
    );
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    expect(label.getAttribute("title")).toBe("application/pdf,image/*");
  });

  it("draws the sliding selection inside the chosen segment", () => {
    render(<SegmentedControl label="Fill" options={["Blend", "Color"]} />);
    const indicator = document.querySelector('[data-bt-part="indicator"]');
    expect(indicator?.closest('[data-bt-part="segment"]')).toBe(
      screen.getByRole("radio", { name: "Blend" }),
    );
  });

  it("shows icons in place of labels with iconOnly, each segment named by its label and showing it as a tooltip", async () => {
    render(
      <SegmentedControl
        label="View"
        iconOnly
        options={[
          { value: "grid", label: "Grid", icon: LayoutGrid },
          { value: "list", label: "List", icon: List },
        ]}
      />,
    );
    const grid = screen.getByRole("radio", { name: "Grid" });
    expect(grid.querySelector("svg")).not.toBeNull();
    expect(grid.textContent).toBe("");
    await keyboard.keyboard("{Tab}");
    grid.focus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Grid");
    await userEvent.click(screen.getByRole("radio", { name: "List" }));
    expect(
      screen.getByRole("radio", { name: "List" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
});
