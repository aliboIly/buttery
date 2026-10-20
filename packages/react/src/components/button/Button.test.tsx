import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent as user } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "./Button.tsx";

afterEach(cleanup);

function arrowOf(button: HTMLElement): {
  readonly tip: Element;
  readonly stem: Element;
} {
  const tip = button.querySelector('[data-bt-part="arrow-tip"]');
  const stem = button.querySelector('[data-bt-part="arrow-stem"]');
  if (!tip || !stem) throw new Error("The button has no arrow.");
  return { tip, stem };
}

/** The arrow's stem scale along X and its tip's offset in px. */
function arrowState(button: HTMLElement): readonly [number, number] {
  const { tip, stem } = arrowOf(button);
  const scale = Number.parseFloat(getComputedStyle(stem).scale);
  const offset = Number.parseFloat(getComputedStyle(tip).translate) || 0;
  return [scale, offset];
}

async function afterTransitions(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 250));
}

describe("Button", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} aria-describedby="hint" className="custom">
        Save
      </Button>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Button");
    expect(ref.current?.getAttribute("aria-describedby")).toBe("hint");
    expect(ref.current?.className).toBe("bt-button bt-press bt-focus custom");
  });

  it("never submits a form by accident", async () => {
    const submit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Button>Preview</Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Preview" }));
    expect(submit).not.toHaveBeenCalled();
  });

  it("is 28, 36 or 48px tall by size", () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="cta">Large</Button>
      </>,
    );
    const heights = ["Small", "Medium", "Large"].map(
      (name) =>
        screen.getByRole("button", { name }).getBoundingClientRect().height,
    );
    expect(heights).toEqual([28, 36, 48]);
  });

  it("shows a spinner while loading, keeps its size and ignores presses", async () => {
    const press = vi.fn();
    const { rerender } = render(<Button onClick={press}>Export</Button>);
    await document.fonts.ready;
    const button = screen.getByRole("button", { name: "Export" });
    const width = button.getBoundingClientRect().width;
    rerender(
      <Button loading onClick={press}>
        Export
      </Button>,
    );
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.querySelector('[data-bt-part="spinner"]')).not.toBeNull();
    expect(button.getBoundingClientRect().width).toBe(width);
    await user.click(button);
    expect(press).not.toHaveBeenCalled();
  });

  it("dresses a link with asChild, arrow included, and blocks it when disabled", async () => {
    const press = vi.fn();
    const { rerender } = render(
      <Button asChild arrow="forward" onClick={press}>
        <a href="#next">Get started</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Get started" });
    expect(link.dataset["bt"]).toBe("Button");
    expect(link.classList).toContain("bt-button");
    expect(link.lastElementChild?.getAttribute("data-bt-part")).toBe("arrow");
    rerender(
      <Button asChild arrow="forward" disabled onClick={press}>
        <a href="#next">Get started</a>
      </Button>,
    );
    expect(link.getAttribute("aria-disabled")).toBe("true");
    await user.click(link);
    expect(press).not.toHaveBeenCalled();
    expect(window.location.hash).not.toBe("#next");
  });

  it("puts a forward arrow after the label and a back arrow before it, hidden from screen readers", () => {
    render(
      <>
        <Button arrow="forward">Next</Button>
        <Button arrow="back">Back</Button>
      </>,
    );
    const next = screen.getByRole("button", { name: "Next" });
    const back = screen.getByRole("button", { name: "Back" });
    expect(next.lastElementChild?.getAttribute("data-direction")).toBe(
      "forward",
    );
    expect(back.firstElementChild?.getAttribute("data-direction")).toBe("back");
    expect(next.lastElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("grows the arrow's stem on hover without changing its width", async () => {
    render(
      <Button variant="primary" arrow="forward">
        Continue
      </Button>,
    );
    await document.fonts.ready;
    const button = screen.getByRole("button", { name: "Continue" });
    const width = button.getBoundingClientRect().width;
    expect(arrowState(button)).toEqual([0, -3]);
    await userEvent.hover(button);
    await afterTransitions();
    expect(arrowState(button)).toEqual([1, 0]);
    expect(button.getBoundingClientRect().width).toBe(width);
    await userEvent.unhover(button);
    await afterTransitions();
    expect(arrowState(button)).toEqual([0, -3]);
  });

  it("grows the arrow on keyboard focus too", async () => {
    render(<Button arrow="forward">Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });
    await userEvent.keyboard("{Shift}");
    button.focus();
    expect(button.matches(":focus-visible")).toBe(true);
    await afterTransitions();
    expect(arrowState(button)).toEqual([1, 0]);
  });

  it("turns the chevron into an arrow at once, without the nudge, with reduced motion", async () => {
    render(
      <div data-bt-motion="reduced">
        <Button arrow="forward">Continue</Button>
      </div>,
    );
    const button = screen.getByRole("button", { name: "Continue" });
    const { stem } = arrowOf(button);
    expect(getComputedStyle(stem).transitionDuration).toBe("0s");
    await userEvent.hover(button);
    const [scale, offset] = arrowState(button);
    expect(scale).toBeCloseTo(4 / 7, 3);
    expect(offset).toBe(-3);
  });

  it("keeps the chevron on touchscreens: only a real pointer's hover grows it", () => {
    const hoverRules = [...document.styleSheets].flatMap((sheet) =>
      [...sheet.cssRules].flatMap(function rulesIn(rule): CSSRule[] {
        return rule instanceof CSSGroupingRule
          ? [rule, ...[...rule.cssRules].flatMap(rulesIn)]
          : [rule];
      }),
    );
    const arrowHovers = hoverRules.filter(
      (rule): rule is CSSStyleRule =>
        rule instanceof CSSStyleRule &&
        rule.selectorText.includes(":hover") &&
        rule.selectorText.includes("arrow"),
    );
    expect(arrowHovers.length).toBeGreaterThan(0);
    for (const { parentRule } of arrowHovers) {
      expect(
        parentRule instanceof CSSMediaRule && parentRule.media.mediaText,
      ).toBe("(hover: hover)");
    }
  });

  it("stays focusable but ignores presses and looks disabled with aria-disabled", async () => {
    const press = vi.fn();
    const { rerender } = render(<Button onClick={press}>Back</Button>);
    const button = screen.getByRole("button", { name: "Back" });
    const enabled = getComputedStyle(button).backgroundColor;
    rerender(
      <Button aria-disabled onClick={press}>
        Back
      </Button>,
    );
    button.focus();
    await user.click(button);
    await user.keyboard("{Enter}");
    expect(press).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button);
    await afterTransitions();
    expect(getComputedStyle(button).backgroundColor).not.toBe(enabled);
    rerender(
      <Button aria-disabled loading onClick={press}>
        Back
      </Button>,
    );
    await afterTransitions();
    expect(getComputedStyle(button).backgroundColor).toBe(enabled);
  });

  it("leaves the arrow alone on a disabled button", async () => {
    render(
      <Button arrow="forward" disabled>
        Continue
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Continue" });
    await userEvent.hover(button, { force: true });
    await afterTransitions();
    expect(arrowState(button)).toEqual([0, -3]);
  });
});
