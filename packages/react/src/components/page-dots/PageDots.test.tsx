import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { PageDots } from "./PageDots.tsx";

afterEach(cleanup);

function dots(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-bt-part="dot"]')];
}

describe("PageDots", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PageDots
        ref={ref}
        count={3}
        value={0}
        className="custom"
        data-testid="dots"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("PageDots");
    expect(ref.current?.dataset["testid"]).toBe("dots");
    expect(ref.current?.className).toBe("bt-page-dots custom");
  });

  it("is one image named by the current step, in the words given", () => {
    render(<PageDots count={4} value={1} />);
    expect(screen.getByRole("img", { name: "Step 2 of 4" })).toBeTruthy();
    cleanup();
    render(
      <PageDots
        count={3}
        value={2}
        label={(step, count) =>
          `Schritt ${String(step + 1)} von ${String(count)}`
        }
      />,
    );
    expect(screen.getByRole("img", { name: "Schritt 3 von 3" })).toBeTruthy();
  });

  it("draws 6px dots 6px apart, the current one an 18px pill", () => {
    render(<PageDots count={4} value={1} />);
    const boxes = dots().map((dot) => dot.getBoundingClientRect());
    expect(boxes.map((box) => box.width)).toEqual([6, 18, 6, 6]);
    expect(boxes.every((box) => box.height === 6)).toBe(true);
    expect((boxes[1]?.left ?? 0) - (boxes[0]?.right ?? 0)).toBe(6);
    expect(dots()[1]?.hasAttribute("data-active")).toBe(true);
  });

  it("keeps the current step inside the dots", () => {
    render(<PageDots count={3} value={7} />);
    expect(screen.getByRole("img", { name: "Step 3 of 3" })).toBeTruthy();
    expect(dots()[2]?.hasAttribute("data-active")).toBe(true);
  });

  it("takes no presses or focus", () => {
    render(<PageDots count={3} value={0} />);
    expect(document.querySelector("button, [tabindex]")).toBeNull();
  });
});
