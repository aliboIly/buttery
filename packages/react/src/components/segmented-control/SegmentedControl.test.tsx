import "@butteryui/core/styles.css";
import "../../styles.css";
import { Inline, Stack } from "@butteryui/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as keyboard } from "vitest/browser";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutGrid, List } from "lucide-react";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { Button } from "../button/Button.tsx";
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

  it("hugs its segments in a Stack or a grid cell that stretches its children, as it does in a plain block", () => {
    render(
      <>
        <div style={{ inlineSize: "600px" }}>
          <SegmentedControl
            label="Plain"
            options={["Blend", "Color"]}
            data-testid="block"
          />
        </div>
        <Stack style={{ inlineSize: "600px" }}>
          <SegmentedControl
            label="In a stack"
            options={["Blend", "Color"]}
            data-testid="stack"
          />
        </Stack>
        <div style={{ display: "grid", inlineSize: "600px" }}>
          <SegmentedControl
            label="In a grid"
            options={["Blend", "Color"]}
            data-testid="grid"
          />
        </div>
      </>,
    );
    const width = (id: string): number =>
      screen.getByTestId(id).getBoundingClientRect().width;
    expect(screen.getByTestId("stack").dataset["layout"]).toBe("hug");
    expect(width("block")).toBeLessThan(600);
    expect(width("stack")).toBe(width("block"));
    expect(width("grid")).toBe(width("block"));
  });

  it("spans the width it's given with layout fill, its segments sharing it equally, and takes the room an Inline leaves", () => {
    render(
      <>
        <div style={{ inlineSize: "600px" }}>
          <SegmentedControl
            label="Fill"
            layout="fill"
            options={["Blend", "Color", "Image"]}
            data-testid="fill"
          />
        </div>
        <Inline gap={2} style={{ inlineSize: "600px" }} data-testid="row">
          <SegmentedControl
            label="Row"
            layout="fill"
            options={["Blend", "Color"]}
            data-testid="row-fill"
          />
          <Button size="sm">Reset</Button>
        </Inline>
      </>,
    );
    const fill = screen.getByTestId("fill");
    expect(fill.getBoundingClientRect().width).toBe(600);
    const widths = within(fill)
      .getAllByRole("radio")
      .map((radio) => radio.getBoundingClientRect().width);
    expect(new Set(widths.map((width) => Math.round(width))).size).toBe(1);
    expect(widths[0]).toBeCloseTo((600 - 4) / 3, 0);
    const reset = screen
      .getByRole("button", { name: "Reset" })
      .getBoundingClientRect();
    const rowFill = screen.getByTestId("row-fill").getBoundingClientRect();
    expect(Math.round(reset.left - rowFill.right)).toBe(8);
    expect(Math.round(reset.right)).toBe(
      Math.round(screen.getByTestId("row").getBoundingClientRect().right),
    );
  });

  it("is 28 tall at sm and 48 at lg, 40 in compact, its segments inside a 2 or 4px inset, its selection sliding inside the inset", async () => {
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="never">
        <SegmentedControl
          label="Small"
          size="sm"
          options={["Blend", "Color"]}
          data-testid="sm"
        />
        <SegmentedControl
          label="Large"
          size="lg"
          options={["Blend", "Color", "Image"]}
          data-testid="lg"
        />
        <div data-bt-density="compact">
          <SegmentedControl
            label="Compact"
            size="lg"
            options={["Blend", "Color"]}
            data-testid="compact"
          />
        </div>
      </ButteryProvider>,
    );
    const track = (id: string): HTMLElement => screen.getByTestId(id);
    const segment = (id: string): HTMLElement =>
      within(track(id)).getAllByRole("radio")[0] ?? track(id);
    expect(track("sm").getBoundingClientRect().height).toBe(28);
    expect(segment("sm").getBoundingClientRect().height).toBe(24);
    expect(track("lg").getBoundingClientRect().height).toBe(48);
    expect(segment("lg").getBoundingClientRect().height).toBe(40);
    expect(track("compact").getBoundingClientRect().height).toBe(40);
    expect(segment("compact").getBoundingClientRect().height).toBe(32);
    expect(getComputedStyle(segment("lg")).fontSize).toBe("14px");
    expect(getComputedStyle(segment("sm")).fontSize).toBe("13px");
    const indicator = (): DOMRect => {
      const element = track("lg").querySelector('[data-bt-part="indicator"]');
      if (!element) throw new Error("No indicator.");
      return element.getBoundingClientRect();
    };
    const rest = segment("lg").getBoundingClientRect();
    expect([indicator().top, indicator().height, indicator().width]).toEqual([
      rest.top,
      rest.height,
      rest.width,
    ]);
    const image = within(track("lg")).getByRole("radio", { name: "Image" });
    await userEvent.click(image);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const moving = indicator();
    expect(moving.left).toBeGreaterThan(rest.left);
    expect(moving.left).toBeLessThan(image.getBoundingClientRect().left);
    expect(Math.abs(moving.top - rest.top)).toBeLessThan(0.5);
    expect(Math.abs(moving.height - rest.height)).toBeLessThan(0.5);
    segment("sm").focus();
    await keyboard.keyboard("{ArrowRight>}");
    await keyboard.keyboard("{/ArrowRight}");
    expect(
      within(track("sm"))
        .getByRole("radio", { name: "Color" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });
});
