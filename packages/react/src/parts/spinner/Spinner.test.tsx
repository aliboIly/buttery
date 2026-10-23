import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { Spinner } from "./Spinner.tsx";

afterEach(cleanup);

function turns(): readonly CSSAnimation[] {
  return document
    .getAnimations()
    .filter(
      (animation): animation is CSSAnimation =>
        animation instanceof CSSAnimation &&
        animation.animationName === "bt-spinner-turn",
    );
}

function Boxed({
  reducedMotion,
}: {
  readonly reducedMotion: "never" | "always";
}) {
  return (
    <ButteryProvider layoutGuard={false} reducedMotion={reducedMotion}>
      <span
        data-testid="box"
        style={{
          position: "relative",
          display: "block",
          inlineSize: "var(--bt-icon-sm)",
          blockSize: "var(--bt-icon-sm)",
        }}
      >
        <Spinner />
      </span>
    </ButteryProvider>
  );
}

describe("Spinner", () => {
  it("turns inside its box, so nothing in it reaches past the box mid-turn", () => {
    render(<Boxed reducedMotion="never" />);
    const running = turns();
    expect(running).toHaveLength(1);
    for (const turn of running) {
      turn.pause();
      turn.currentTime = 100;
    }
    const box = screen.getByTestId("box");
    const edges = box.getBoundingClientRect();
    for (const element of box.querySelectorAll("*")) {
      const rect = element.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(edges.left - 0.5);
      expect(rect.top).toBeGreaterThanOrEqual(edges.top - 0.5);
      expect(rect.right).toBeLessThanOrEqual(edges.right + 0.5);
      expect(rect.bottom).toBeLessThanOrEqual(edges.bottom + 0.5);
    }
  });

  it("holds still with reduced motion", () => {
    render(<Boxed reducedMotion="always" />);
    expect(turns()).toHaveLength(0);
  });
});
