import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignInForm } from "./SignInForm.tsx";

afterEach(cleanup);

function field(name: string): HTMLInputElement {
  const input = screen.getByLabelText(name, { selector: "input" });
  if (!(input instanceof HTMLInputElement)) throw new Error("No input.");
  return input;
}

describe("SignInForm", () => {
  it("stamps its class and data-bt on the form, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLFormElement>();
    render(
      <SignInForm
        ref={ref}
        className="custom"
        id="sign-in"
        onSubmit={() => undefined}
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("SignInForm");
    expect(ref.current?.className).toBe("bt-sign-in-form bt-auth-form custom");
    expect(ref.current?.id).toBe("sign-in");
  });

  it("is a named form with a heading, and fields the password manager can fill", () => {
    render(<SignInForm onSubmit={() => undefined} />);
    expect(screen.getByRole("form", { name: "Sign in" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 1, name: "Sign in" }),
    ).toBeTruthy();
    expect(field("Email").autocomplete).toBe("username");
    expect(field("Email").type).toBe("email");
    expect(field("Password").autocomplete).toBe("current-password");
    expect(field("Password").name).toBe("password");
  });

  it("takes its words from labels, the password's show button included", () => {
    render(
      <SignInForm
        labels={{ password: "Passwort", showPassword: "Passwort anzeigen" }}
        onSubmit={() => undefined}
      />,
    );
    expect(field("Passwort").type).toBe("password");
    expect(
      screen.getByRole("button", { name: "Passwort anzeigen" }),
    ).toBeTruthy();
  });

  it("shows what to fix beside each field and in a summary that takes focus, without submitting", async () => {
    const submit = vi.fn();
    render(<SignInForm onSubmit={submit} />);
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    const summary = screen.getByRole("alert");
    expect(document.activeElement).toBe(summary);
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(
      ["Enter your email address", "Enter your password"],
    );
    expect(field("Email").getAttribute("aria-invalid")).toBe("true");
    expect(submit).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole("link", { name: "Enter your password" }),
    );
    expect(document.activeElement).toBe(field("Password"));
  });

  it("asks for an email address that looks like one, and clears errors as they're fixed", async () => {
    render(<SignInForm onSubmit={() => undefined} />);
    await userEvent.type(field("Email"), "sam@");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      screen.getByRole("link", {
        name: "Enter an email address like name@example.com",
      }),
    ).toBeTruthy();
    const summary = screen.getByRole("alert");
    const before = field("Email").getBoundingClientRect().top;
    await userEvent.type(field("Email"), "example.com");
    expect(field("Email").hasAttribute("aria-invalid")).toBe(false);
    expect(screen.getByRole("alert")).toBe(summary);
    expect(field("Email").getBoundingClientRect().top).toBe(before);
  });

  it("hands over trimmed values, shows a message it returns, and stays busy until it settles", async () => {
    let finish: (message: string | undefined) => void = () => undefined;
    const submit = vi.fn(
      () =>
        new Promise<string | undefined>((resolve) => {
          finish = resolve;
        }),
    );
    render(<SignInForm onSubmit={submit} />);
    await userEvent.type(field("Email"), "  sam@example.com ");
    await userEvent.type(field("Password"), "butter-2026");
    await userEvent.click(screen.getByText("Keep me signed in"));
    const button = screen.getByRole("button", { name: "Sign in" });
    await userEvent.click(button);
    expect(submit).toHaveBeenCalledWith({
      email: "sam@example.com",
      password: "butter-2026",
      remember: true,
    });
    expect(button.getAttribute("aria-busy")).toBe("true");
    finish("That email and password don't match.");
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain(
        "That email and password don't match.",
      );
    });
    expect(document.activeElement).toBe(screen.getByRole("alert"));
    expect(button.hasAttribute("aria-busy")).toBe(false);
  });

  it("submits with Enter from a field", async () => {
    const submit = vi.fn();
    render(<SignInForm onSubmit={submit} />);
    await userEvent.type(field("Email"), "sam@example.com");
    await userEvent.type(field("Password"), "butter-2026{Enter}");
    expect(submit).toHaveBeenCalledWith({
      email: "sam@example.com",
      password: "butter-2026",
      remember: false,
    });
  });

  it("takes a keyboard from the summary to the field to fix", async () => {
    render(<SignInForm onSubmit={() => undefined} />);
    field("Email").focus();
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(screen.getByRole("alert"));
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "Enter your email address" }),
    );
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(field("Email"));
  });

  it("says so in the summary when onSubmit fails, and reports the error", async () => {
    const reported = vi
      .spyOn(window, "reportError")
      .mockImplementation(() => undefined);
    const offline = new Error("Offline");
    render(<SignInForm onSubmit={() => Promise.reject(offline)} />);
    await userEvent.type(field("Email"), "sam@example.com");
    await userEvent.type(field("Password"), "butter-2026");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain(
        "Couldn't sign in. Check your connection and try again.",
      );
    });
    expect(document.activeElement).toBe(screen.getByRole("alert"));
    expect(reported).toHaveBeenCalledWith(offline);
    reported.mockRestore();
  });

  it("shows other ways to sign in as buttons named by their text, and links only when given", async () => {
    const passkey = vi.fn();
    const { rerender } = render(
      <SignInForm
        onSubmit={() => undefined}
        providers={[
          {
            id: "passkey",
            label: "Continue with a passkey",
            onSelect: passkey,
          },
        ]}
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Continue with a passkey" }),
    );
    expect(passkey).toHaveBeenCalledTimes(1);
    rerender(
      <SignInForm
        onSubmit={() => undefined}
        forgotPasswordHref="/forgot"
        signUpHref="/sign-up"
      />,
    );
    expect(
      screen
        .getByRole("link", { name: "Forgot your password?" })
        .getAttribute("href"),
    ).toBe("/forgot");
    expect(
      screen
        .getByRole("link", { name: "Create an account" })
        .getAttribute("href"),
    ).toBe("/sign-up");
  });
});
