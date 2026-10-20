import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignUpForm } from "./SignUpForm.tsx";

afterEach(cleanup);

function field(name: string): HTMLInputElement {
  const input = screen.getByLabelText(name, { selector: "input" });
  if (!(input instanceof HTMLInputElement)) throw new Error("No input.");
  return input;
}

describe("SignUpForm", () => {
  it("stamps its class and data-bt on the form and forwards its ref", () => {
    const ref = createRef<HTMLFormElement>();
    render(
      <SignUpForm ref={ref} className="custom" onSubmit={() => undefined} />,
    );
    expect(ref.current?.dataset["bt"]).toBe("SignUpForm");
    expect(ref.current?.className).toBe("bt-sign-up-form bt-auth-form custom");
  });

  it("asks for a new password and ticks its rules off as they're met", async () => {
    render(<SignUpForm onSubmit={() => undefined} />);
    expect(field("Name").autocomplete).toBe("name");
    expect(field("Email").autocomplete).toBe("username");
    expect(field("Email").type).toBe("email");
    expect(field("Password").autocomplete).toBe("new-password");
    const met = (): boolean[] =>
      screen
        .getAllByRole("listitem")
        .map((item) => item.hasAttribute("data-met"));
    expect(met()).toEqual([false, false]);
    await userEvent.type(field("Password"), "butter-2026");
    expect(met()).toEqual([true, true]);
  });

  it("sums up everything to fix, the terms included, and hands over the values once it's all done", async () => {
    const submit = vi.fn();
    render(<SignUpForm termsHref="/terms" onSubmit={submit} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );
    expect(
      within(screen.getByRole("alert"))
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual([
      "Enter your name",
      "Enter your email address",
      "Choose a password that meets every rule",
      "Agree to the terms to create an account",
    ]);
    expect(document.activeElement).toBe(screen.getByRole("alert"));
    await userEvent.type(field("Name"), "Sam Rivera");
    await userEvent.type(field("Email"), "sam@example.com");
    await userEvent.type(field("Password"), "butter-2026");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );
    expect(submit).toHaveBeenCalledWith({
      name: "Sam Rivera",
      email: "sam@example.com",
      password: "butter-2026",
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("checks a password against the rules it's given", async () => {
    const submit = vi.fn();
    render(
      <SignUpForm
        passwordRules={[
          { label: "A capital letter", test: (value) => /[A-Z]/.test(value) },
        ]}
        onSubmit={submit}
      />,
    );
    await userEvent.type(field("Name"), "Sam");
    await userEvent.type(field("Email"), "sam@example.com");
    await userEvent.type(field("Password"), "butter");
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );
    expect(submit).not.toHaveBeenCalled();
    await userEvent.type(field("Password"), "B");
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
