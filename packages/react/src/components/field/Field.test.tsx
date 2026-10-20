import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Field } from "./Field.tsx";

afterEach(cleanup);

describe("Field", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Field ref={ref} label="Width" className="custom" data-testid="field">
        {(control) => <input {...control} />}
      </Field>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Field");
    expect(ref.current?.className).toBe("bt-field bt-form-field custom");
  });

  it("names the control by its label and describes it with the hint and the error", async () => {
    render(
      <Field
        label="Card width"
        hint="In pixels"
        error="Too wide for a story"
        required
      >
        {(control) => <input {...control} />}
      </Field>,
    );
    await expect
      .element(page.getByRole("textbox", { name: "Card width", exact: true }))
      .toBeInTheDocument();
    const input = screen.getByRole("textbox");
    const described = (input.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual(["In pixels", "Too wide for a story"]);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-required")).toBe("true");
  });

  it("leaves the error and its description out while there's nothing wrong", () => {
    render(
      <Field label="Card width">{(control) => <input {...control} />}</Field>,
    );
    const input = screen.getByRole("textbox");
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });
});
