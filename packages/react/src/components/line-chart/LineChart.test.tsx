import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { LineChart } from "./LineChart.tsx";

afterEach(cleanup);

const SERIES = [
  { key: "now", label: "This week", values: [42, 38, 51, 47] },
  {
    key: "before",
    label: "Last week",
    values: [40, 41, 45, 44],
    comparison: true,
  },
];

describe("LineChart", () => {
  it("stamps its class and data-bt on the frame, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <LineChart
        ref={ref}
        label="Orders"
        labels={["Mon", "Tue", "Wed", "Thu"]}
        series={SERIES}
        className="custom"
        id="orders"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("LineChart");
    expect(ref.current?.className).toBe("bt-chart-frame bt-line-chart custom");
    expect(ref.current?.id).toBe("orders");
  });

  it("draws a line per series, the comparison first so it sits beneath", () => {
    render(
      <LineChart
        label="Orders"
        labels={["Mon", "Tue", "Wed", "Thu"]}
        series={SERIES}
      />,
    );
    const marks = [
      ...document.querySelectorAll<HTMLElement>('[data-bt-part="mark"]'),
    ];
    expect(
      marks.map((mark) =>
        mark.style.getPropertyValue("--bt-chart-frame-series"),
      ),
    ).toEqual(["var(--bt-chart-muted)", "var(--bt-chart-1)"]);
    expect(document.querySelectorAll('[data-bt-part="area"]')).toHaveLength(0);
    expect(screen.getByRole("slider", { name: "Orders" })).toBeTruthy();
  });
});
