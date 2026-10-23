import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { IdentifierField } from "./IdentifierField.tsx";

afterEach(cleanup);

function input(name = "Email or phone number"): HTMLInputElement {
  const field = screen.getByRole("textbox", { name });
  if (!(field instanceof HTMLInputElement)) throw new Error("No input.");
  return field;
}

function Controlled(): ReactElement {
  const [value, setValue] = useState("");
  return <IdentifierField value={value} onValueChange={setValue} />;
}

describe("IdentifierField", () => {
  it("is a labelled text input on the field with its own data-bt, and takes its ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<IdentifierField ref={ref} name="identifier" />);
    expect(ref.current).toBe(input());
    expect(input().closest('[data-bt="IdentifierField"]')).not.toBeNull();
    expect(input().getAttribute("name")).toBe("identifier");
    expect(input().getAttribute("autocomplete")).toBe("username");
  });

  it("asks for the phone keyboard and autofill once digits are typed, and the email ones for an address", async () => {
    render(<Controlled />);
    await browser.type(input(), "2");
    expect(input().getAttribute("inputmode")).toBe("tel");
    expect(input().getAttribute("autocomplete")).toBe("tel");
    await browser.clear(input());
    await browser.type(input(), "rosa@");
    expect(input().getAttribute("inputmode")).toBe("email");
    expect(input().getAttribute("autocomplete")).toBe("email");
  });

  it("offers passkeys with username webauthn", () => {
    render(<IdentifierField passkey />);
    expect(input().getAttribute("autocomplete")).toBe("username webauthn");
  });

  it("formats a phone number as it's typed, and keeps the caret beside the digit it followed", async () => {
    const onValueChange = vi.fn();
    function Spy(): ReactElement {
      const [value, setValue] = useState("");
      return (
        <IdentifierField
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Spy />);
    await browser.type(input(), "5035550142");
    expect(input().value).toBe("(503) 555-0142");
    expect(onValueChange).toHaveBeenLastCalledWith("(503) 555-0142");
    await browser.clear(input());
    await browser.type(input(), "503555");
    expect(input().value).toBe("(503) 555");
    input().setSelectionRange(2, 2);
    await browser.keyboard("9");
    expect(input().value).toBe("(590) 355-5");
    expect(input().selectionStart).toBe(3);
  });

  it("says nothing while it's typed in, and what it needs once it's left unfinished", async () => {
    render(
      <>
        <Controlled />
        <button type="button">Next</button>
      </>,
    );
    await browser.type(input(), "rosa@halfmoon");
    expect(screen.queryByText(/Enter an email address/)).toBeNull();
    await browser.keyboard("{Tab}");
    expect(
      screen.getAllByText(/Enter an email address or a phone number/).length,
    ).toBeGreaterThan(0);
    expect(input().getAttribute("aria-invalid")).toBe("true");
    await browser.click(input());
    await browser.keyboard(".coffee");
    expect(screen.queryByText(/Enter an email address/)).toBeNull();
  });

  it("shows an error from outside in place of its own", () => {
    render(
      <IdentifierField
        defaultValue="rosa@halfmoon.coffee"
        error="Too many codes sent."
      />,
    );
    expect(screen.getAllByText("Too many codes sent.").length).toBeGreaterThan(
      0,
    );
  });
});
