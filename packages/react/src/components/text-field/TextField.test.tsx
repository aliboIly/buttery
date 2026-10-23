import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Mail } from "lucide-react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent as browser } from "vitest/browser";
import { TextField } from "./TextField.tsx";

afterEach(cleanup);

function input(): HTMLInputElement {
  const field = screen.getByRole("textbox");
  if (!(field instanceof HTMLInputElement)) throw new Error("No input.");
  return field;
}

function box(): HTMLElement {
  const part = input().closest<HTMLElement>('[data-bt-part="box"]');
  if (!part) throw new Error("No box.");
  return part;
}

describe("TextField", () => {
  it("stamps its class and data-bt on the field, and its ref and input props on the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <TextField
        ref={ref}
        label="Name"
        className="custom"
        name="name"
        autoComplete="name"
      />,
    );
    const root = ref.current?.closest('[data-bt="TextField"]');
    expect(root?.className).toBe("bt-text-field bt-form-field custom");
    expect(ref.current?.getAttribute("name")).toBe("name");
    expect(ref.current?.getAttribute("autocomplete")).toBe("name");
  });

  it("is named by its label and described by its own description, the hint and the error", async () => {
    render(
      <>
        <p id="note">Used on receipts.</p>
        <TextField
          label="Email"
          hint="We never share it."
          error="Enter an email address."
          aria-describedby="note"
        />
      </>,
    );
    await expect
      .element(page.getByRole("textbox", { name: "Email", exact: true }))
      .toBeInTheDocument();
    const described = (input().getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual([
      "Used on receipts.",
      "We never share it.",
      "Enter an email address.",
    ]);
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(getComputedStyle(box()).borderTopColor).toBe("rgb(199, 42, 28)");
  });

  it("calls onValueChange and onChange as you type, controlled or not", async () => {
    const valueChange = vi.fn();
    const change = vi.fn();
    render(
      <TextField label="Title" onValueChange={valueChange} onChange={change} />,
    );
    await userEvent.type(input(), "Hi");
    expect(valueChange).toHaveBeenLastCalledWith("Hi");
    expect(change).toHaveBeenCalledTimes(2);
    expect(input().value).toBe("Hi");
  });

  it("is 34px tall, or 48px with 16px text at size lg", () => {
    const { rerender } = render(<TextField label="Email" />);
    expect(box().getBoundingClientRect().height).toBe(34);
    rerender(<TextField label="Email" size="lg" />);
    expect(box().getBoundingClientRect().height).toBe(48);
    expect(getComputedStyle(input()).fontSize).toBe("16px");
  });

  it("focuses the input from a press anywhere in its box, icon included", async () => {
    render(<TextField label="Email" iconStart={Mail} />);
    await browser.click(box(), { position: { x: 6, y: 17 } });
    expect(document.activeElement).toBe(input());
  });

  it("shrinks with a box that fits its content, and asks for 20 characters where there's room", () => {
    const { rerender } = render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          inlineSize: "120px",
        }}
      >
        <TextField label="Email" />
      </div>,
    );
    expect(box().getBoundingClientRect().width).toBe(120);
    rerender(
      <div style={{ display: "flex", inlineSize: "600px" }}>
        <TextField label="Email" />
      </div>,
    );
    expect(box().getBoundingClientRect().width).toBeGreaterThan(160);
  });

  it("shows nothing under the box while there's no error", () => {
    render(<TextField label="Email" />);
    expect(input().hasAttribute("aria-invalid")).toBe(false);
    expect(input().hasAttribute("aria-describedby")).toBe(false);
  });
});
