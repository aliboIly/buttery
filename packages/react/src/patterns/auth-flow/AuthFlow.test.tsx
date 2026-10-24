import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Stack } from "@butteryui/core";
import { page, userEvent as browser } from "vitest/browser";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { AuthFlow } from "./AuthFlow.tsx";
import type { AuthFlowProps } from "./AuthFlow.tsx";
import type { RequestCodeResult, VerifyResult } from "./use-otp-flow.ts";

afterEach(cleanup);

type Props = Partial<AuthFlowProps<string>>;

function Flow(props: Props) {
  return (
    <ButteryProvider layoutGuard={false} reducedMotion="never">
      <AuthFlow<string>
        onRequestCode={() => ({ ok: true, expiresIn: 600 })}
        onVerify={(identifier, code) =>
          code === "246810"
            ? { ok: true, session: identifier }
            : { ok: false, reason: "wrong" }
        }
        {...props}
      />
    </ButteryProvider>
  );
}

function identifier(): HTMLInputElement {
  const field = screen.getByRole("textbox", { name: "Email or phone number" });
  if (!(field instanceof HTMLInputElement)) throw new Error("No field.");
  return field;
}

function code(): HTMLInputElement {
  const field = screen.getByRole("textbox", { name: "One-time code" });
  if (!(field instanceof HTMLInputElement)) throw new Error("No code field.");
  return field;
}

function continueButton(): HTMLElement {
  return screen.getByRole("button", { name: /Continue|Sending your code/ });
}

/** The box the words of `text` take up, without the line's leading. */
function wordsOf(text: string): DOMRect {
  const [element] = screen.getAllByText(text);
  if (!element) throw new Error(`No "${text}".`);
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect();
}

async function toCodeStep(value = "rosa@halfmoon.coffee"): Promise<void> {
  await browser.type(identifier(), value);
  await browser.click(continueButton());
  await screen.findByRole("heading", { name: /Check your/ });
}

describe("AuthFlow", () => {
  it("takes its ref and class on its root and draws the first step as a form with a heading", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Flow ref={ref} className="custom" />);
    expect(ref.current?.getAttribute("data-bt")).toBe("AuthFlow");
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Sign in or create an account",
      }),
    ).toBeTruthy();
    expect(identifier()).toBeTruthy();
  });

  it("holds its button back until the field is an email or a phone, and says why when it's pressed too soon", async () => {
    const onRequestCode = vi.fn<(value: string) => RequestCodeResult>(() => ({
      ok: true,
    }));
    render(<Flow onRequestCode={onRequestCode} />);
    expect(continueButton().getAttribute("aria-disabled")).toBe("true");
    identifier().focus();
    await browser.keyboard("{Enter}");
    expect(onRequestCode).not.toHaveBeenCalled();
    expect(
      screen.getAllByText("Enter your email address or phone number.").length,
    ).toBeGreaterThan(0);
    expect(document.activeElement).toBe(identifier());
    await browser.type(identifier(), "5035550142");
    expect(identifier().value).toBe("(503) 555-0142");
    expect(continueButton().getAttribute("aria-disabled")).toBeNull();
  });

  it("sends the code with the button saying so at its own width, then puts focus in the code field at once", async () => {
    let send: (result: RequestCodeResult) => void = () => undefined;
    const onRequestCode = vi.fn<(value: string) => Promise<RequestCodeResult>>(
      () =>
        new Promise((resolve) => {
          send = resolve;
        }),
    );
    render(<Flow onRequestCode={onRequestCode} />);
    await browser.type(identifier(), "rosa@halfmoon.coffee");
    const width = continueButton().getBoundingClientRect().width;
    await browser.click(continueButton());
    expect(onRequestCode).toHaveBeenCalledWith("rosa@halfmoon.coffee");
    await screen.findByText("Sending your code…");
    expect(continueButton().getBoundingClientRect().width).toBe(width);
    expect(continueButton().closest("form")?.getAttribute("aria-busy")).toBe(
      "true",
    );
    send({ ok: true, expiresIn: 600 });
    await screen.findByRole("heading", { name: "Check your email" });
    expect(document.activeElement).toBe(code());
    expect(
      screen.getByText("We sent a code to r•••@halfmoon.coffee."),
    ).toBeTruthy();
    expect(
      screen.getAllByText("The code works for 10 minutes.").length,
    ).toBeGreaterThan(0);
  });

  it("keeps the words where Continue's were while the code is on its way", async () => {
    render(<Flow onRequestCode={() => new Promise(() => undefined)} />);
    await browser.type(identifier(), "rosa@halfmoon.coffee");
    const resting = wordsOf("Continue");
    await browser.click(continueButton());
    await screen.findByText("Sending your code…");
    const sending = wordsOf("Sending your code…");
    expect(Math.abs(sending.top - resting.top)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(sending.bottom - resting.bottom)).toBeLessThanOrEqual(0.5);
  });

  it("rounds its button's corners as its field's are", () => {
    render(<Flow />);
    const box = identifier().closest('[data-bt-part="box"]');
    if (!box) throw new Error("No field box.");
    expect(getComputedStyle(continueButton()).borderRadius).toBe(
      getComputedStyle(box).borderRadius,
    );
  });

  it("spaces the lines under the code field evenly, and marks the way back with its arrow", async () => {
    render(<Flow hint={<span>Demo code: 246810</span>} />);
    await toCodeStep();
    const lines = [
      wordsOf("The code works for 10 minutes."),
      wordsOf("Demo code: 246810"),
      wordsOf("You can ask for a new code in 30s."),
      wordsOf("Change email or phone"),
    ];
    const gaps = lines
      .slice(1)
      .map((line, index) => line.top - (lines[index]?.bottom ?? 0));
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThanOrEqual(2);
    expect(
      screen
        .getByRole("button", { name: "Change email or phone" })
        .getAttribute("data-arrow"),
    ).toBe("back");
  });

  it("checks a full code, shows success and hands the session on after the hold", async () => {
    const onSuccess = vi.fn();
    const onVerify = vi.fn<(id: string, value: string) => VerifyResult<string>>(
      (id) => ({ ok: true, session: id }),
    );
    render(
      <Flow onVerify={onVerify} onSuccess={onSuccess} successHold={300} />,
    );
    await toCodeStep("(503) 555-0142");
    expect(
      screen.getByRole("heading", { name: "Check your texts" }),
    ).toBeTruthy();
    await browser.type(code(), "246810");
    expect(onVerify).toHaveBeenCalledExactlyOnceWith(
      "(503) 555-0142",
      "246810",
    );
    await screen.findAllByText("You're signed in");
    expect(onSuccess).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledExactlyOnceWith("(503) 555-0142");
    });
  });

  it("clears a wrong code, says what to do next and keeps focus in the field, until typing starts again", async () => {
    render(<Flow />);
    await toCodeStep();
    await browser.type(code(), "111111");
    await screen.findAllByText(
      "That code isn't right. Check it and try again.",
    );
    expect(code().value).toBe("");
    expect(document.activeElement).toBe(code());
    await browser.keyboard("2");
    expect(
      screen.queryAllByText("That code isn't right. Check it and try again."),
    ).toHaveLength(0);
    expect(
      screen.getAllByText("The code works for 10 minutes.").length,
    ).toBeGreaterThan(0);
  });

  it("counts down to a new code, then offers one and sends it", async () => {
    const onRequestCode = vi.fn<(value: string) => RequestCodeResult>(() => ({
      ok: true,
    }));
    render(<Flow onRequestCode={onRequestCode} resendAfter={1} />);
    await toCodeStep();
    expect(screen.getByText("You can ask for a new code in 1s.")).toBeTruthy();
    const again = await screen.findByRole(
      "button",
      { name: "Send a new code" },
      { timeout: 3000 },
    );
    await browser.click(again);
    expect(onRequestCode).toHaveBeenCalledTimes(2);
  });

  it("centers its hint under the code field, as it does the countdown", async () => {
    render(<Flow hint={<span>Demo code: 246810</span>} />);
    await toCodeStep();
    const hint = screen.getByText("Demo code: 246810");
    expect(getComputedStyle(hint).textAlign).toBe("center");
  });

  it("goes back with the field still filled in, by its button and by Escape", async () => {
    render(<Flow />);
    await toCodeStep();
    await browser.click(
      screen.getByRole("button", { name: "Change email or phone" }),
    );
    await screen.findByRole("heading", {
      name: "Sign in or create an account",
    });
    expect(identifier().value).toBe("rosa@halfmoon.coffee");
    expect(document.activeElement).toBe(identifier());
    await browser.click(continueButton());
    await screen.findByRole("heading", { name: "Check your email" });
    await browser.keyboard("{Escape}");
    await screen.findByRole("heading", {
      name: "Sign in or create an account",
    });
  });

  it("is driven from the keyboard alone", async () => {
    render(<Flow />);
    identifier().focus();
    await browser.keyboard("rosa@halfmoon.coffee");
    await browser.keyboard("{Enter}");
    await screen.findByRole("heading", { name: "Check your email" });
    await browser.keyboard("246810");
    await screen.findAllByText("You're signed in");
  });

  it("lets the page settle when reduced motion turns on while a step slides in", async () => {
    function Switchable({ reduced }: { readonly reduced: boolean }) {
      return (
        <ButteryProvider
          layoutGuard={false}
          reducedMotion={reduced ? "always" : "never"}
        >
          <AuthFlow<string>
            onRequestCode={() => ({ ok: true })}
            onVerify={() => ({ ok: false, reason: "wrong" })}
          />
        </ButteryProvider>
      );
    }
    const { rerender } = render(<Switchable reduced={false} />);
    await browser.type(identifier(), "rosa@halfmoon.coffee");
    await browser.click(continueButton());
    await screen.findByRole("heading", { name: "Check your email" });
    rerender(<Switchable reduced />);
    await waitFor(
      () => {
        expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
          true,
        );
      },
      { timeout: 2000 },
    );
  });

  it("swaps the steps without sliding them with reduced motion", async () => {
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="always">
        <AuthFlow<string>
          onRequestCode={() => ({ ok: true })}
          onVerify={() => ({ ok: false, reason: "wrong" })}
        />
      </ButteryProvider>,
    );
    await toCodeStep();
    const step = code().closest<HTMLElement>('[data-bt-part="step"]');
    expect(step && getComputedStyle(step).transform).toMatch(
      /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/,
    );
  });

  it("keeps its field and button above a phone's keyboard", async () => {
    await page.viewport(390, 508);
    render(<Flow />);
    const button = continueButton().getBoundingClientRect();
    expect(button.bottom).toBeLessThanOrEqual(508);
    expect(identifier().getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    await page.viewport(1280, 800);
  });

  it("keeps its full column when a parent centers it, as a centered Stack does", async () => {
    await page.viewport(1280, 800);
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="never">
        <Stack align="center" justify="center">
          <AuthFlow<string>
            onRequestCode={() => ({ ok: true })}
            onVerify={() => ({ ok: false, reason: "wrong" })}
          />
        </Stack>
      </ButteryProvider>,
    );
    const column = identifier().closest('[data-bt-part="column"]');
    if (!column) throw new Error("No column.");
    expect(column.getBoundingClientRect().width).toBe(360);
    const box = identifier().closest('[data-bt-part="box"]');
    if (!box) throw new Error("No field box.");
    expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
  });

  it("leaves a step more room above it from 640px wide, the same for both steps", async () => {
    const roomAbove = (title: string): number => {
      const heading = screen.getByRole("heading", { level: 1, name: title });
      const root = heading.closest(".bt-auth-flow");
      if (!root) throw new Error("No AuthFlow.");
      return (
        heading.getBoundingClientRect().top - root.getBoundingClientRect().top
      );
    };
    await page.viewport(390, 844);
    render(<Flow />);
    const phone = roomAbove("Sign in or create an account");
    await page.viewport(1280, 800);
    await waitFor(() => {
      expect(roomAbove("Sign in or create an account")).toBe(phone + 32);
    });
    await toCodeStep();
    await waitFor(() => {
      expect(roomAbove("Check your email")).toBe(phone + 32);
    });
  });
});
