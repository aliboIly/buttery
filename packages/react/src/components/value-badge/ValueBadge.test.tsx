import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ValueBadge } from "./ValueBadge.tsx";

afterEach(cleanup);

describe("ValueBadge", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <ValueBadge ref={ref} className="custom" title="Rotation">
        12°
      </ValueBadge>,
    );
    expect(ref.current?.dataset["bt"]).toBe("ValueBadge");
    expect(ref.current?.getAttribute("title")).toBe("Rotation");
    expect(ref.current?.className).toBe("bt-value-badge custom");
  });

  it("keeps the same width whatever value it shows", async () => {
    const { rerender } = render(
      <ValueBadge reserve={["-180°", "180°"]} data-testid="badge">
        0°
      </ValueBadge>,
    );
    await document.fonts.ready;
    const badge = screen.getByTestId("badge");
    const width = badge.getBoundingClientRect().width;
    rerender(
      <ValueBadge reserve={["-180°", "180°"]} data-testid="badge">
        -180°
      </ValueBadge>,
    );
    expect(badge.getBoundingClientRect().width).toBe(width);
    expect(badge.getBoundingClientRect().height).toBe(20);
  });

  it("reads as its value alone", () => {
    render(
      <ValueBadge reserve={["0%", "100%"]} data-testid="badge">
        80%
      </ValueBadge>,
    );
    const hidden = screen
      .getByTestId("badge")
      .querySelectorAll('[aria-hidden="true"]');
    expect(hidden).toHaveLength(2);
  });
});
