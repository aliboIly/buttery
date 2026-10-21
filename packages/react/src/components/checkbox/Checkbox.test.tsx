import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Checkbox } from "./Checkbox.tsx";

afterEach(cleanup);

describe("Checkbox", () => {
  it("stamps its class and data-bt on the field, and its ref on the box", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} label="Keep me signed in" className="custom" />);
    const root = ref.current?.closest('[data-bt="Checkbox"]');
    expect(root?.className).toBe("bt-checkbox bt-form-field custom");
    expect(ref.current?.getAttribute("role")).toBe("checkbox");
  });

  it("is a checkbox named by its label, ticked by a press on the label or Space", async () => {
    const change = vi.fn();
    render(<Checkbox label="Keep me signed in" onCheckedChange={change} />);
    await expect
      .element(
        page.getByRole("checkbox", { name: "Keep me signed in", exact: true }),
      )
      .toBeInTheDocument();
    const box = screen.getByRole("checkbox");
    await userEvent.click(screen.getByText("Keep me signed in"));
    expect(change).toHaveBeenLastCalledWith(true);
    expect(box.getAttribute("aria-checked")).toBe("true");
    box.focus();
    await userEvent.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith(false);
  });

  it("reads as mixed when indeterminate", () => {
    render(<Checkbox label="All cards" checked="indeterminate" />);
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "mixed",
    );
  });

  it("has an 18px box with a 3:1 edge and a 24px target", () => {
    render(<Checkbox label="Keep me signed in" />);
    const box = screen.getByRole("checkbox");
    expect(box.getBoundingClientRect().height).toBe(18);
    expect(getComputedStyle(box).borderTopColor).toBe("rgb(133, 133, 133)");
    const hit = box.querySelector("[data-bt-hit]");
    expect(hit?.getBoundingClientRect().height).toBe(24);
    expect(hit?.getBoundingClientRect().width).toBe(24);
  });

  it("centers its error's icon on the error's first line", () => {
    render(
      <Checkbox
        label="I agree to the terms"
        error="Agree to the terms to make an account."
      />,
    );
    const error = document.querySelector('[data-bt-part="error"]');
    const icon = error?.querySelector("svg")?.getBoundingClientRect();
    const text = error?.querySelector(".bt-text")?.getBoundingClientRect();
    if (!icon || !text) throw new Error("no error icon or text");
    expect(text.height).toBe(16);
    expect(icon.top + icon.height / 2).toBeCloseTo(
      text.top + text.height / 2,
      0,
    );
  });

  it("describes the box with its hint and error, and marks it invalid", () => {
    render(
      <Checkbox
        label="I agree to the terms"
        hint="You can read them first."
        error="Agree to the terms to make an account."
      />,
    );
    const box = screen.getByRole("checkbox");
    expect(box.getAttribute("aria-invalid")).toBe("true");
    const described = (box.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual([
      "You can read them first.",
      "Agree to the terms to make an account.",
    ]);
  });

  it("keeps a hidden label for screen readers without showing it", () => {
    render(<Checkbox label="Select order 1042" hideLabel />);
    expect(
      screen.getByRole("checkbox", { name: "Select order 1042" }),
    ).toBeTruthy();
    const label = document.querySelector("label");
    expect(label?.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });
});
