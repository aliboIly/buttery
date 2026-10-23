import "@butteryui/core/styles.css";
import "../../styles.css";
import { Stack, publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent as browser } from "vitest/browser";
import { Field } from "../field/Field.tsx";
import { NumberField } from "../number-field/NumberField.tsx";
import { Select } from "./Select.tsx";
import type { SelectOption } from "./Select.tsx";

type Shape = "match" | "16:9" | "4:3" | "1:1" | "3:2" | "9:16";

const SHAPES: readonly SelectOption<Shape>[] = [
  { value: "match", label: "Fit to card" },
  { value: "16:9", label: "Wide · 16:9" },
  { value: "4:3", label: "Classic · 4:3" },
  { value: "1:1", label: "Square · 1:1", disabled: true },
  { value: "3:2", label: "Photo · 3:2" },
  { value: "9:16", label: "Tall · 9:16" },
];

type Format = "png" | "jpg" | "jpeg" | "webp";

const FORMATS: readonly SelectOption<Format>[] = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
];

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function colorOf(variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

function trigger(): HTMLElement {
  return screen.getByRole("combobox", { name: /^Canvas shape/ });
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

  it("is a select-only combobox named by its label and value that opens a listbox", async () => {
    render(<Shapes />);
    await expect
      .element(
        page.getByRole("combobox", { name: "Canvas shape, Wide · 16:9" }),
      )
      .toBeInTheDocument();
    expect(trigger().getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger());
    const list = screen.getByRole("listbox", { name: "Canvas shape" });
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-controls")).toBe(list.id);
    expect(option("Wide · 16:9").getAttribute("aria-selected")).toBe("true");
    expect(option("Square · 1:1").getAttribute("aria-disabled")).toBe("true");
  });

  it("opens with focus on the chosen option and its check, lined up with the trigger's end", async () => {
    render(
      <div style={{ paddingInlineStart: "200px" }}>
        <Shapes />
      </div>,
    );
    await userEvent.click(trigger());
    await settled();
    expect(document.activeElement).toBe(option("Wide · 16:9"));
    expect(option("Wide · 16:9").querySelector("svg")).not.toBeNull();
    expect(option("Classic · 4:3").querySelector("svg")).toBeNull();
    const panel = option("Wide · 16:9").closest('[data-bt="Popover"]');
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
    expect(document.activeElement).toBe(option("Photo · 3:2"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(option("Tall · 9:16"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(option("Tall · 9:16"));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(option("Fit to card"));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("4:3");
    expect(document.activeElement).toBe(trigger());
    expect(trigger().getAttribute("aria-label")).toBe(
      "Canvas shape, Classic · 4:3",
    );
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  it("jumps to an option by typing the start of its label, letters typed together searching as one", async () => {
    render(<Shapes />);
    await userEvent.click(trigger());
    await settled();
    await userEvent.keyboard("t");
    expect(document.activeElement).toBe(option("Tall · 9:16"));
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard("fi");
    expect(document.activeElement).toBe(option("Fit to card"));
  });

  it("keeps a typed match while more letters still fit it, and cycles on one letter typed again", async () => {
    render(<Select label="Format" options={FORMATS} defaultValue="png" />);
    await userEvent.click(screen.getByRole("combobox", { name: /^Format/ }));
    await settled();
    await userEvent.keyboard("jp");
    expect(document.activeElement).toBe(option("JPG"));
    await userEvent.keyboard("e");
    expect(document.activeElement).toBe(option("JPEG"));
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard("j");
    expect(document.activeElement).toBe(option("JPG"));
    await userEvent.keyboard("j");
    expect(document.activeElement).toBe(option("JPEG"));
  });

  it("types a space into a search instead of choosing", async () => {
    const onValueChange = vi.fn();
    render(<Shapes onValueChange={onValueChange} />);
    await userEvent.click(trigger());
    await settled();
    await userEvent.keyboard("fit to");
    expect(document.activeElement).toBe(option("Fit to card"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("opens from the trigger with the arrow keys", async () => {
    render(<Shapes />);
    trigger().focus();
    await userEvent.keyboard("{ArrowDown}");
    await settled();
    expect(document.activeElement).toBe(option("Wide · 16:9"));
  });

  it("chooses an option that's clicked, and closes on Escape without choosing", async () => {
    const onValueChange = vi.fn();
    render(<Shapes onValueChange={onValueChange} />);
    await userEvent.click(trigger());
    await userEvent.click(option("Photo · 3:2"));
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
    await userEvent.click(option("Square · 1:1"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("keeps Tab on the list without a footer, and loops it through the footer's fields with one", async () => {
    const { rerender } = render(<Shapes />);
    await userEvent.click(trigger());
    await settled();
    await userEvent.tab();
    expect(document.activeElement).toBe(option("Wide · 16:9"));
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
    expect(document.activeElement).toBe(option("Wide · 16:9"));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(height);
  });

  it("puts a footer field back on the first Escape, without saving it or closing, and closes on the second", async () => {
    const onWidth = vi.fn();
    render(
      <Shapes
        footer={
          <NumberField
            label="Width"
            labelPosition="top"
            defaultValue={1600}
            onValueChange={onWidth}
          />
        }
      />,
    );
    await userEvent.click(trigger());
    await settled();
    const width = screen.getByRole("spinbutton", { name: "Width" });
    await userEvent.tab();
    await userEvent.keyboard("{Control>}a{/Control}1200");
    await userEvent.keyboard("{Escape}");
    expect((width as HTMLInputElement).value).toBe("1600");
    expect(document.activeElement).toBe(width);
    expect(screen.getByRole("listbox")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    expect(onWidth).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger());
  });

  it("leaves focus in the footer while the pointer moves over the options", async () => {
    render(
      <Shapes
        footer={
          <NumberField label="Width" labelPosition="top" defaultValue={1600} />
        }
      />,
    );
    await userEvent.click(trigger());
    await settled();
    const width = screen.getByRole("spinbutton", { name: "Width" });
    width.focus();
    await userEvent.hover(option("Photo · 3:2"));
    expect(document.activeElement).toBe(width);
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
    await userEvent.click(option("Tall · 9:16"));
    expect(screen.getByText("9:16", { selector: "output" })).toBeTruthy();
  });

  it("as an outline box in a Field, is named by the field's label and its value, and described by the hint and the error", async () => {
    render(
      <Stack pad={8}>
        <Field
          label="Export as"
          hint="PNG keeps transparent corners."
          error="JPG fills them with white."
        >
          {(control) => (
            <Select
              {...control}
              label="Export as"
              variant="outline"
              options={FORMATS}
              defaultValue="jpg"
            />
          )}
        </Field>
      </Stack>,
    );
    const box = screen.getByRole("combobox", { name: "Export as JPG" });
    expect(box.dataset["variant"]).toBe("outline");
    expect(box.getAttribute("aria-invalid")).toBe("true");
    expect(box.getAttribute("aria-describedby")).not.toBeNull();
    expect(box.hasAttribute("data-bt-control")).toBe(true);
    expect(box.getBoundingClientRect().height).toBe(34);
    await userEvent.click(screen.getByText("Export as", { selector: "label" }));
    await settled();
    const list = screen.getByRole("listbox", { name: "Export as" });
    const panel = list.parentElement;
    if (!panel) throw new Error("no panel");
    expect(panel.getBoundingClientRect().left).toBeCloseTo(
      box.getBoundingClientRect().left,
      0,
    );
    expect(panel.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      box.getBoundingClientRect().width - 1,
    );
    await userEvent.click(option("WebP"));
    expect(
      screen.getByRole("combobox", { name: "Export as WebP" }),
    ).toBeTruthy();
  });

  it("in a required Field, is a select-only combobox that says it needs an answer", async () => {
    render(
      <Field label="Export as" required>
        {(control) => (
          <Select
            {...control}
            label="Export as"
            variant="outline"
            options={FORMATS}
          />
        )}
      </Field>,
    );
    const box = screen.getByRole("combobox", { name: "Export as Choose" });
    expect(box.getAttribute("aria-required")).toBe("true");
    expect(box.getAttribute("aria-haspopup")).toBe("listbox");
    expect(box.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(box);
    await settled();
    expect(box.getAttribute("aria-expanded")).toBe("true");
    expect(box.getAttribute("aria-controls")).toBe(
      screen.getByRole("listbox", { name: "Export as" }).id,
    );
  });

  it("draws a soft box on bg-control that fills its column, its edge on hover, for keys and while its list is open", async () => {
    render(
      <div style={{ inlineSize: "320px" }}>
        <Select
          label="Export format"
          variant="soft"
          options={FORMATS}
          defaultValue="png"
        />
      </div>,
    );
    const trigger = screen.getByRole("combobox", {
      name: "Export format, PNG",
    });
    const edge = colorOf("--bt-control-border");
    expect(trigger.getBoundingClientRect().width).toBe(320);
    expect(trigger.getBoundingClientRect().height).toBe(34);
    expect(getComputedStyle(trigger).backgroundColor).toBe(
      colorOf("--bt-bg-control"),
    );
    expect(getComputedStyle(trigger).borderTopColor).toBe("rgba(0, 0, 0, 0)");
    expect(trigger.querySelector('[data-bt-part="chevron"]')).not.toBeNull();
    await browser.hover(trigger);
    expect(getComputedStyle(trigger).borderTopColor).toBe(edge);
    await browser.hover(document.body, { position: { x: 1, y: 1 } });
    await browser.keyboard("{Shift}");
    trigger.focus();
    expect(getComputedStyle(trigger).outlineStyle).toBe("solid");
    expect(getComputedStyle(trigger).borderTopColor).toBe(edge);
    await browser.keyboard("{ArrowDown}");
    const list = await screen.findByRole("listbox", { name: "Export format" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(getComputedStyle(trigger).borderTopColor).toBe(edge);
    const panel = list.closest<HTMLElement>(".bt-select-panel");
    expect(panel?.offsetWidth).toBeGreaterThanOrEqual(320);
  });
});
