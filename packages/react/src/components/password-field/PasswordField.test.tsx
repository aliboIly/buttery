import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent as browser } from "vitest/browser";
import { PasswordField } from "./PasswordField.tsx";

afterEach(cleanup);

function colorOf(variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

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

  it("fits its reveal toggle inside a small box, drawn at the badge height with a 28px target, still toggling", async () => {
    render(<PasswordField label="Password" size="sm" defaultValue="butter" />);
    const box = input().closest<HTMLElement>('[data-bt-part="box"]');
    const reveal = screen.getByRole("button", { name: "Show password" });
    const hit = reveal.querySelector("[data-bt-hit]");
    if (!box || !hit) throw new Error("No box or hit area.");
    const outer = box.getBoundingClientRect();
    const button = reveal.getBoundingClientRect();
    expect(outer.height).toBe(28);
    expect([button.width, button.height]).toEqual([20, 20]);
    expect(button.top).toBeGreaterThan(outer.top);
    expect(button.bottom).toBeLessThan(outer.bottom);
    expect(button.right).toBeLessThan(outer.right);
    const target = hit.getBoundingClientRect();
    expect([target.width, target.height]).toEqual([28, 28]);
    expect(target.top).toBeGreaterThanOrEqual(outer.top);
    expect(target.bottom).toBeLessThanOrEqual(outer.bottom);
    await userEvent.click(reveal);
    expect(input().type).toBe("text");
  });

  it("gives its reveal toggle the next shades in a soft box, so its hover and pressed fills show on bg-control", async () => {
    render(
      <PasswordField label="Password" variant="soft" defaultValue="butter" />,
    );
    const reveal = screen.getByRole("button", { name: "Show password" });
    const hover = colorOf("--bt-border");
    const pressed = colorOf("--bt-border-strong");
    await browser.hover(reveal);
    await expect
      .poll(() => getComputedStyle(reveal).backgroundColor)
      .toBe(hover);
    await browser.click(reveal);
    await browser.hover(document.body, { position: { x: 1, y: 1 } });
    expect(reveal.getAttribute("aria-pressed")).toBe("true");
    await expect
      .poll(() => getComputedStyle(reveal).backgroundColor)
      .toBe(pressed);
  });
});
