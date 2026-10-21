import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { ScopeBadge } from "./ScopeBadge.tsx";

const INFO = "Changes here apply to every Halfmoon shop.";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function badge(): HTMLElement {
  return screen.getByRole("button", { name: "All shops" });
}

describe("ScopeBadge", () => {
  it("is a button named by its label that takes the ref, class and other props", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ScopeBadge
        ref={ref}
        label="All shops"
        info={INFO}
        className="custom"
        data-testid="scope"
      />,
    );
    expect(ref.current).toBe(badge());
    expect(badge().dataset["bt"]).toBe("ScopeBadge");
    expect(badge().dataset["testid"]).toBe("scope");
    expect(badge().className).toBe("bt-scope-badge bt-focus custom");
  });

  it("is 20px tall with a target reaching 24, a control the height check sees", () => {
    render(<ScopeBadge label="All shops" info={INFO} />);
    expect(badge().getBoundingClientRect().height).toBe(20);
    expect(badge().hasAttribute("data-bt-control")).toBe(true);
    const hit = badge().querySelector('[data-bt-part="hit"]');
    expect(hit?.getBoundingClientRect().height).toBe(24);
  });

  it("fades its colors on hover", () => {
    render(<ScopeBadge label="All shops" info={INFO} />);
    const style = getComputedStyle(badge());
    expect(style.transitionProperty).toBe("background-color, color");
    expect(style.transitionDuration).not.toBe("0s");
  });

  it("keeps keyboard focus on itself as Enter opens the popover", async () => {
    render(<ScopeBadge label="All shops" info={INFO} />);
    await userEvent.keyboard("{Shift}");
    badge().focus();
    await userEvent.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "All shops" });
    expect(document.activeElement).toBe(badge());
  });

  it("describes itself with its info in a tooltip on keyboard focus", async () => {
    render(<ScopeBadge label="All shops" info={INFO} />);
    await userEvent.keyboard("{Shift}");
    badge().focus();
    await waitFor(() => {
      expect(document.querySelector('[data-bt="Tooltip"]')?.textContent).toBe(
        INFO,
      );
    });
    expect(badge()).toHaveAccessibleDescription(INFO);
  });

  it("opens its info in a popover on a press, with focus left where it was and its tooltip shut", async () => {
    render(<ScopeBadge label="All shops" info={INFO} />);
    await userEvent.click(badge());
    const popover = await screen.findByRole("dialog", { name: "All shops" });
    expect(popover.textContent).toBe(INFO);
    expect(badge().getAttribute("aria-expanded")).toBe("true");
    expect(popover.contains(document.activeElement)).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(document.querySelector('[data-bt="Tooltip"]')).toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
