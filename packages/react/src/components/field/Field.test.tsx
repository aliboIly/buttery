import "@butteryui/core/styles.css";
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

  it("names a control a label can't, such as a slider of your own", async () => {
    render(
      <Field label="Card size">
        {(control) => (
          <span
            {...control}
            role="slider"
            tabIndex={0}
            aria-valuenow={4}
            aria-valuemin={0}
            aria-valuemax={10}
          />
        )}
      </Field>,
    );
    await expect
      .element(page.getByRole("slider", { name: "Card size", exact: true }))
      .toBeInTheDocument();
  });

  it("reads a new error out politely with the field's name, then empties the live region", async () => {
    const { rerender } = render(
      <Field label="Email">{(control) => <input {...control} />}</Field>,
    );
    const region = document.querySelector('[aria-live="polite"]');
    expect(region?.textContent).toBe("");
    rerender(
      <Field label="Email" error="Enter an email address">
        {(control) => <input {...control} />}
      </Field>,
    );
    await expect
      .poll(() => region?.textContent)
      .toBe("Email: Enter an email address");
    await expect
      .element(page.getByRole("textbox", { name: "Email", exact: true }))
      .toHaveAccessibleDescription("Enter an email address");
    await expect.poll(() => region?.textContent, { timeout: 3000 }).toBe("");
  });

  it("shows an error with a link in it once, where it can be reached", () => {
    render(
      <Field
        label="Email"
        error={
          <>
            That email has an account. <a href="/sign-in">Sign in</a>
          </>
        }
      >
        {(control) => <input {...control} />}
      </Field>,
    );
    const links = screen.getAllByRole("link", { name: "Sign in" });
    expect(links).toHaveLength(1);
    expect(links[0]?.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("leaves reading errors out to a summary when told", async () => {
    const { rerender } = render(
      <Field label="Email" announceError={false}>
        {(control) => <input {...control} />}
      </Field>,
    );
    rerender(
      <Field label="Email" error="Enter an email address" announceError={false}>
        {(control) => <input {...control} />}
      </Field>,
    );
    expect(document.querySelector("[aria-live]")).toBeNull();
    await expect
      .element(page.getByRole("textbox", { name: "Email", exact: true }))
      .toHaveAccessibleDescription("Enter an email address");
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
