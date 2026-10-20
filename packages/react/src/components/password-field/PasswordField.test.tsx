import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { PasswordField } from "./PasswordField.tsx";

afterEach(cleanup);

function input(): HTMLInputElement {
  const field = document.querySelector('[data-bt-part="input"]');
  if (!(field instanceof HTMLInputElement)) throw new Error("No input.");
  return field;
}

describe("PasswordField", () => {
  it("stamps its class and data-bt on the field and its ref on the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordField ref={ref} label="Password" className="custom" />);
    const root = ref.current?.closest('[data-bt="PasswordField"]');
    expect(root?.className).toBe("bt-password-field bt-form-field custom");
    expect(ref.current).toBe(input());
  });

  it("hides what's typed until the reveal toggle is pressed, and keeps the toggle's name", async () => {
    render(<PasswordField label="Password" defaultValue="butter-2026" />);
    await expect
      .element(page.getByLabelText("Password", { exact: true }))
      .toBeInTheDocument();
    expect(input().type).toBe("password");
    const reveal = screen.getByRole("button", { name: "Show password" });
    expect(reveal.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(reveal);
    expect(input().type).toBe("text");
    expect(reveal.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Show password" })).toBe(reveal);
  });

  it("fills in a saved password by default, and asks for a new one when told", () => {
    const { rerender } = render(<PasswordField label="Password" />);
    expect(input().autocomplete).toBe("current-password");
    rerender(<PasswordField label="Password" autoComplete="new-password" />);
    expect(input().autocomplete).toBe("new-password");
  });

  it("lists its requirements as part of its description, with met ones named", () => {
    render(
      <PasswordField
        label="Choose a password"
        hint="Use a phrase you'll remember."
        requirements={[
          { label: "At least 8 characters", met: true },
          { label: "A number", met: false },
        ]}
      />,
    );
    const described = (input().getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id));
    expect(described.map((node) => node?.tagName)).toEqual(["P", "UL"]);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.hasAttribute("data-met"))).toEqual([
      true,
      false,
    ]);
    expect(screen.getByRole("img", { name: "Met" })).toBeTruthy();
  });
});
