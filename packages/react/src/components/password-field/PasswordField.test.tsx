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

  it("shrinks with a box that fits its content, reveal toggle and all", () => {
    render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          inlineSize: "120px",
        }}
      >
        <PasswordField label="Password" />
      </div>,
    );
    const box = input().closest('[data-bt-part="box"]');
    expect(box?.getBoundingClientRect().width).toBe(120);
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
    expect(screen.getByRole("img", { name: "Not met" })).toBeTruthy();
  });

  it("toggles from the keyboard", async () => {
    render(<PasswordField label="Password" defaultValue="butter-2026" />);
    await userEvent.tab();
    await userEvent.tab();
    const reveal = screen.getByRole("button", { name: "Show password" });
    expect(document.activeElement).toBe(reveal);
    await userEvent.keyboard("{Enter}");
    expect(input().type).toBe("text");
    await userEvent.keyboard(" ");
    expect(input().type).toBe("password");
  });

  it("never corrects or capitalizes a shown password, and hides it when its form is submitted", async () => {
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <PasswordField label="Password" defaultValue="butter-2026" />
        <button type="submit">Save</button>
      </form>,
    );
    expect(input().getAttribute("spellcheck")).toBe("false");
    expect(input().getAttribute("autocapitalize")).toBe("none");
    expect(input().getAttribute("autocorrect")).toBe("off");
    await userEvent.click(
      screen.getByRole("button", { name: "Show password" }),
    );
    expect(input().type).toBe("text");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(input().type).toBe("password");
  });
});
