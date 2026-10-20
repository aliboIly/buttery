import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { NumberField } from "../number-field/NumberField.tsx";
import { Select } from "./Select.tsx";
import type { SelectOption } from "./Select.tsx";

type Shape = "match" | "16:9" | "4:3" | "1:1" | "3:2" | "9:16";

const SHAPES: readonly SelectOption<Shape>[] = [
  { value: "match", label: "Match card" },
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1", disabled: true },
  { value: "3:2", label: "3:2" },
  { value: "9:16", label: "9:16" },
];

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

function trigger(): HTMLElement {
  return screen.getByRole("button", { name: /^Canvas shape/ });
}

function option(name: string): HTMLElement {
  return screen.getByRole("option", { name });
}

function Shapes({
  onValueChange,
  footer,
}: {
  readonly onValueChange?: (value: Shape) => void;
  readonly footer?: ReactElement;
}): ReactElement {
  return (
    <Select
      label="Canvas shape"
      options={SHAPES}
      defaultValue="16:9"
      onValueChange={onValueChange}
      footer={footer}
      footerLabel="Custom size"
    />
  );
}

describe("Select", () => {
  it("stamps its class and data-bt on the trigger, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Select
        ref={ref}
        label="Canvas shape"
        options={SHAPES}
        className="custom"
        data-testid="shape"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("Select");
    expect(ref.current?.className).toContain("bt-select");
    expect(ref.current?.className).toContain("custom");
    expect(ref.current?.dataset["testid"]).toBe("shape");
  });

  it("is a button named by its label and value that opens a listbox", async () => {
    render(<Shapes />);
    await expect
      .element(page.getByRole("button", { name: "Canvas shape, 16:9" }))
      .toBeInTheDocument();
    expect(trigger().getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger());
    const list = screen.getByRole("listbox", { name: "Canvas shape" });
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-controls")).toBe(list.id);
    expect(option("16:9").getAttribute("aria-selected")).toBe("true");
    expect(option("1:1").getAttribute("aria-disabled")).toBe("true");
  });

  it("opens with focus on the chosen option and its check, lined up with the trigger's end", async () => {
    render(
      <div style={{ paddingInlineStart: "200px" }}>
        <Shapes />
      </div>,
    );
    await userEvent.click(trigger());
    await settled();
    expect(document.activeElement).toBe(option("16:9"));
    expect(option("16:9").querySelector("svg")).not.toBeNull();
    expect(option("4:3").querySelector("svg")).toBeNull();
    const panel = option("16:9").closest('[data-bt="Popover"]');
    expect(Math.round(panel?.getBoundingClientRect().right ?? 0)).toBe(
      Math.round(trigger().getBoundingClientRect().right),
    );
  });

  it("moves with the arrow keys, Home and End, skipping disabled options, and chooses with Enter", async () => {
    const onValueChange = vi.fn();
    render(<Shapes onValueChange={onValueChange} />);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await settled();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(option("3:2"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(option("9:16"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(option("9:16"));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(option("Match card"));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("4:3");
    expect(document.activeElement).toBe(trigger());
    expect(trigger().getAttribute("aria-label")).toBe("Canvas shape, 4:3");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  it("jumps to an option by typing the start of its label, letters typed together searching as one", async () => {
    render(<Shapes />);
    await userEvent.click(trigger());
    await settled();
    await userEvent.keyboard("9");
    expect(document.activeElement).toBe(option("9:16"));
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard("ma");
    expect(document.activeElement).toBe(option("Match card"));
  });

  it("chooses an option that's clicked, and closes on Escape without choosing", async () => {
    const onValueChange = vi.fn();
    render(<Shapes onValueChange={onValueChange} />);
    await userEvent.click(trigger());
    await userEvent.click(option("3:2"));
    expect(onValueChange).toHaveBeenCalledWith("3:2");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    await userEvent.click(trigger());
    await settled();
    await userEvent.keyboard("{ArrowDown}{Escape}");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(trigger());
  });

  it("ignores a press on a disabled option", async () => {
    const onValueChange = vi.fn();
    render(<Shapes onValueChange={onValueChange} />);
    await userEvent.click(trigger());
    await userEvent.click(option("1:1"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("keeps Tab on the list without a footer, and loops it through the footer's fields with one", async () => {
    const { rerender } = render(<Shapes />);
    await userEvent.click(trigger());
    await settled();
    await userEvent.tab();
    expect(document.activeElement).toBe(option("16:9"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    rerender(
      <Shapes
        footer={
          <>
            <NumberField
              label="Width"
              labelPosition="top"
              defaultValue={1600}
            />
            <NumberField
              label="Height"
              labelPosition="top"
              defaultValue={900}
            />
          </>
        }
      />,
    );
    await userEvent.click(trigger());
    await settled();
    expect(screen.getByRole("group", { name: "Custom size" })).toBeTruthy();
    const width = screen.getByRole("spinbutton", { name: "Width" });
    const height = screen.getByRole("spinbutton", { name: "Height" });
    await userEvent.tab();
    expect(document.activeElement).toBe(width);
    await userEvent.keyboard("{Control>}a{/Control}12{Enter}");
    expect(document.activeElement).toBe(width);
    expect((width as HTMLInputElement).value).toBe("12");
    await userEvent.tab();
    expect(document.activeElement).toBe(height);
    await userEvent.tab();
    expect(document.activeElement).toBe(option("16:9"));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(height);
  });

  it("shows a value label or a placeholder when no option says it", () => {
    const { rerender } = render(
      <Select label="Canvas shape" options={SHAPES} placeholder="Pick one" />,
    );
    expect(trigger().textContent).toBe("Pick one");
    rerender(
      <Select
        label="Canvas shape"
        options={SHAPES}
        value="16:9"
        valueLabel="1600 × 900"
      />,
    );
    expect(trigger().textContent).toBe("1600 × 900");
    expect(trigger().getAttribute("aria-label")).toBe(
      "Canvas shape, 1600 × 900",
    );
  });

  it("can be controlled", async () => {
    function Controlled(): ReactElement {
      const [shape, setShape] = useState<Shape>("match");
      return (
        <>
          <output>{shape}</output>
          <Select
            label="Canvas shape"
            options={SHAPES}
            value={shape}
            onValueChange={setShape}
          />
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(trigger());
    await userEvent.click(option("9:16"));
    expect(screen.getByText("9:16", { selector: "output" })).toBeTruthy();
  });
});
