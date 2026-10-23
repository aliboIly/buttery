import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { ArrowUpRight } from "lucide-react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge.tsx";
import type { StatusTone } from "./StatusBadge.tsx";

afterEach(cleanup);

describe("StatusBadge", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <StatusBadge ref={ref} className="custom" data-testid="badge">
        Paid
      </StatusBadge>,
    );
    expect(ref.current?.dataset["bt"]).toBe("StatusBadge");
    expect(ref.current?.dataset["testid"]).toBe("badge");
    expect(ref.current?.className).toBe("bt-status-badge custom");
  });

  it("is 20px tall with its label in the badge role, neutral unless told", () => {
    render(<StatusBadge data-testid="badge">Draft</StatusBadge>);
    const badge = screen.getByTestId("badge");
    expect(badge.getBoundingClientRect().height).toBe(20);
    expect(badge.dataset["tone"]).toBe("neutral");
    expect(getComputedStyle(badge).fontSize).toBe("12px");
    expect(getComputedStyle(badge).borderRadius).toBe("6px");
  });

  it("colors each tone from its own subtle background and text", () => {
    const tones: readonly (readonly [StatusTone, string, string])[] = [
      ["neutral", "--bt-bg-control", "--bt-text-secondary"],
      ["info", "--bt-accent-subtle", "--bt-accent-text"],
      ["success", "--bt-success-subtle", "--bt-success"],
      ["warning", "--bt-warning-subtle", "--bt-warning"],
      ["danger", "--bt-danger-subtle", "--bt-danger"],
    ];
    const root = getComputedStyle(document.documentElement);
    const rgb = (variable: string): string => {
      const probe = document.createElement("span");
      probe.style.color = root.getPropertyValue(variable);
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    for (const [tone, background, text] of tones) {
      render(
        <StatusBadge tone={tone} data-testid={tone}>
          {tone}
        </StatusBadge>,
      );
      const style = getComputedStyle(screen.getByTestId(tone));
      expect(style.backgroundColor, tone).toBe(rgb(background));
      expect(style.color, tone).toBe(rgb(text));
    }
  });

  it("truncates a long label inside a narrow cell, with its full text as its title", () => {
    render(
      <div style={{ inlineSize: "60px" }}>
        <StatusBadge data-testid="badge">Waiting on the roaster</StatusBadge>
      </div>,
    );
    const badge = screen.getByTestId("badge");
    expect(badge.getBoundingClientRect().width).toBeLessThanOrEqual(60);
    const label = badge.querySelector<HTMLElement>('[data-bt-part="label"]');
    expect(label?.scrollWidth).toBeGreaterThan(label?.clientWidth ?? 0);
    expect(getComputedStyle(label ?? badge).textOverflow).toBe("ellipsis");
    expect(label?.title).toBe("Waiting on the roaster");
  });

  it("puts a 12px icon before the label", () => {
    render(
      <StatusBadge tone="success" icon={ArrowUpRight} data-testid="badge">
        12%
      </StatusBadge>,
    );
    const icon = screen.getByTestId("badge").querySelector("svg");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(icon?.getBoundingClientRect().width).toBe(12);
    expect(screen.getByTestId("badge").textContent).toBe("12%");
  });
});
