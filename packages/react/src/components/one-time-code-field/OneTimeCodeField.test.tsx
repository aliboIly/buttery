import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { OneTimeCodeField } from "./OneTimeCodeField.tsx";
import type {
  OneTimeCodeFieldProps,
  OneTimeCodeStatus,
} from "./OneTimeCodeField.tsx";

afterEach(cleanup);

function input(): HTMLInputElement {
  const field = screen.getByRole("textbox", { name: /code/i });
  if (!(field instanceof HTMLInputElement)) throw new Error("No input.");
  return field;
}

function slots(): string[] {
  return [...document.querySelectorAll('[data-bt-part="slot"]')].map(
    (slot) => slot.textContent,
  );
}

function Controlled(props: Partial<OneTimeCodeFieldProps>): ReactElement {
  const [code, setCode] = useState("");
  return <OneTimeCodeField {...props} value={code} onValueChange={setCode} />;
}

describe("OneTimeCodeField", () => {
  it("is one numeric input marked for one-time codes, named by its label, with its ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<OneTimeCodeField ref={ref} name="code" />);
    const field = input();
    expect(ref.current).toBe(field);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(field.getAttribute("inputmode")).toBe("numeric");
    expect(field.getAttribute("autocomplete")).toBe("one-time-code");
    expect(field.maxLength).toBe(6);
    expect(field.getAttribute("name")).toBe("code");
    expect(field.closest('[data-bt="OneTimeCodeField"]')).not.toBeNull();
  });

  it("fills a slot per digit as it's typed and leaves out anything that isn't one", async () => {
    const onValueChange = vi.fn();
    render(<OneTimeCodeField onValueChange={onValueChange} />);
    await browser.type(input(), "61a3");
    expect(input().value).toBe("613");
    expect(onValueChange).toHaveBeenLastCalledWith("613");
    expect(slots().slice(0, 3)).toEqual(["6", "1", "3"]);
    expect(slots()[3]).toBe("");
  });

  it("keeps the digits of a pasted code with a dash", async () => {
    const onComplete = vi.fn();
    render(<Controlled onComplete={onComplete} />);
    const user = userEvent.setup();
    await user.click(input());
    await user.paste("480-517");
    expect(input().value).toBe("480517");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("480517");
  });

  it("takes a code filled in all at once, as autofill does, and completes once however often it's filled", async () => {
    const onComplete = vi.fn();
    render(<Controlled onComplete={onComplete} />);
    await browser.fill(input(), "480517");
    await browser.fill(input(), "480517");
    expect(input().value).toBe("480517");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("480517");
  });

  it("clears with Backspace like any input and completes again once refilled", async () => {
    const onComplete = vi.fn();
    render(<Controlled onComplete={onComplete} />);
    await browser.type(input(), "480517");
    await browser.keyboard("{Backspace}");
    expect(input().value).toBe("48051");
    await browser.keyboard("2");
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("is reached and filled from the keyboard alone", async () => {
    render(
      <>
        <button type="button">Before</button>
        <Controlled />
      </>,
    );
    await browser.click(screen.getByRole("button", { name: "Before" }));
    await browser.keyboard("{Tab}");
    expect(document.activeElement).toBe(input());
    await browser.keyboard("246810");
    expect(input().value).toBe("246810");
  });

  it("reads out checking, success and an error, takes focus back on an error, and keeps the line under it", async () => {
    function Checked({
      status,
    }: {
      readonly status: OneTimeCodeStatus;
    }): ReactElement {
      return (
        <>
          <button type="button">Elsewhere</button>
          <OneTimeCodeField
            status={status}
            message={
              status === "error"
                ? "That code isn't right. Type it again."
                : "The code works for 10 minutes."
            }
          />
        </>
      );
    }
    const { rerender } = render(<Checked status="idle" />);
    const status = input()
      .closest('[data-bt="OneTimeCodeField"]')
      ?.querySelector('[data-bt-part="status"]');
    const idle = status?.getBoundingClientRect().height ?? 0;
    expect(input().getAttribute("aria-describedby")).toContain(
      status?.id ?? "-",
    );
    rerender(<Checked status="verifying" />);
    expect(screen.getAllByText("Verifying…").length).toBeGreaterThan(0);
    expect(input().readOnly).toBe(true);
    rerender(<Checked status="success" />);
    expect(screen.getAllByText("Signed in").length).toBe(2);
    screen.getByRole("button", { name: "Elsewhere" }).focus();
    rerender(<Checked status="error" />);
    await waitFor(() => {
      expect(document.activeElement).toBe(input());
    });
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(
      screen.getAllByText("That code isn't right. Type it again."),
    ).toHaveLength(2);
    expect(status?.getBoundingClientRect().height).toBe(idle);
  });

  it("centers a message long enough to wrap, as it does a short one", () => {
    render(
      <div style={{ inlineSize: "var(--bt-w-menu-min)" }}>
        <OneTimeCodeField
          status="error"
          message="That code isn't right. Check it and try again."
        />
      </div>,
    );
    const words = screen.getAllByText(
      "That code isn't right. Check it and try again.",
    )[0];
    if (!words) throw new Error("No message.");
    const range = document.createRange();
    range.selectNodeContents(words);
    const lines = new Set(
      [...range.getClientRects()].map((line) => Math.round(line.top)),
    );
    expect(lines.size).toBeGreaterThan(1);
    expect(getComputedStyle(words).textAlign).toBe("center");
  });

  it("draws success in the success color and an error in the danger color", async () => {
    const { rerender } = render(
      <OneTimeCodeField status="success" defaultValue="480517" />,
    );
    const box = input().closest<HTMLElement>('[data-bt-part="box"]');
    if (!box) throw new Error("No box.");
    const color = (name: string): string => {
      const probe = document.createElement("span");
      probe.style.color = `var(${name})`;
      box.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    // Read once, outside waitFor, which reruns its callback on every change to the page.
    const success = color("--bt-success");
    const danger = color("--bt-danger");
    await waitFor(() => {
      expect(getComputedStyle(box).borderTopColor).toBe(success);
    });
    rerender(<OneTimeCodeField status="error" message="Wrong code." />);
    await waitFor(() => {
      expect(getComputedStyle(box).borderTopColor).toBe(danger);
    });
  });
});
