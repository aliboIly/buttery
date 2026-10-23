import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { TimeEstimate } from "./GuidanceParts.tsx";

afterEach(cleanup);

describe("TimeEstimate", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <TimeEstimate ref={ref} className="custom" data-testid="estimate">
        2 min
      </TimeEstimate>,
    );
    const estimate = screen.getByTestId("estimate");
    expect(ref.current).toBe(estimate);
    expect(estimate.dataset["bt"]).toBe("TimeEstimate");
    expect(estimate.className).toBe("bt-time-estimate bt-text custom");
  });

  it("reads as how long it takes after its clock", () => {
    render(<TimeEstimate>2 min</TimeEstimate>);
    expect(screen.getByText(/Takes about/).parentElement?.textContent).toBe(
      "Takes about 2 min",
    );
  });
});
