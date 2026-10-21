import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Text } from "../text/Text.tsx";
import { Skeleton } from "./Skeleton.tsx";

afterEach(cleanup);

describe("Skeleton", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Skeleton ref={ref} className="custom" data-testid="skeleton" />);
    expect(ref.current?.dataset["bt"]).toBe("Skeleton");
    expect(ref.current?.className).toBe("bt-skeleton custom");
    expect(screen.getByTestId("skeleton")).toBe(ref.current);
  });

  it("is hidden from screen readers and its placeholder text doesn't show", () => {
    render(<Skeleton variant="label" text="Total sales" />);
    const skeleton = screen.getByText("Total sales");
    expect(skeleton.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(skeleton).color).toBe("rgba(0, 0, 0, 0)");
  });

  it("takes the height of the text it stands in for, trimmed the same way", () => {
    render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          inlineSize: "320px",
        }}
      >
        <Skeleton variant="title-lg" text="$12,480.00" data-testid="skeleton" />
        <Text variant="title-lg" data-testid="text">
          $12,480.00
        </Text>
      </div>,
    );
    const skeleton = screen.getByTestId("skeleton").getBoundingClientRect();
    const text = screen.getByTestId("text").getBoundingClientRect();
    expect(skeleton.height).toBeCloseTo(text.height, 0);
    expect(skeleton.width).toBeLessThan(320);
  });

  it("fills its row without placeholder text", () => {
    render(
      <div style={{ inlineSize: "320px" }}>
        <Skeleton variant="body" data-testid="skeleton" />
      </div>,
    );
    const skeleton = screen.getByTestId("skeleton").getBoundingClientRect();
    expect(skeleton.width).toBe(320);
    expect(skeleton.height).toBeGreaterThan(0);
  });

  it("holds still with reduced motion", () => {
    document.documentElement.dataset["btMotion"] = "reduced";
    render(<Skeleton data-testid="skeleton" />);
    expect(getComputedStyle(screen.getByTestId("skeleton")).animationName).toBe(
      "none",
    );
    delete document.documentElement.dataset["btMotion"];
  });
});
