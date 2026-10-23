import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaChart } from "./AreaChart.tsx";

afterEach(cleanup);

const SERIES = [
  { key: "now", label: "This year", values: [8200, 8650, 9100, 8900] },
  {
    key: "before",
    label: "Last year",
    values: [6100, 6300, 6800, 6700],
    comparison: true,
  },
];

describe("AreaChart", () => {
  it("stamps its class and data-bt on the frame, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AreaChart
        ref={ref}
        label="Revenue"
        labels={["Jul", "Aug", "Sep", "Oct"]}
        series={SERIES}
        className="custom"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("AreaChart");
    expect(ref.current?.className).toBe("bt-chart-frame bt-area-chart custom");
  });

  it("fills the area under each series but the comparison, closed along zero", () => {
    render(
      <AreaChart
        label="Revenue"
        labels={["Jul", "Aug", "Sep", "Oct"]}
        series={SERIES}
      />,
    );
    const areas = document.querySelectorAll<SVGPathElement>(
      '[data-bt-part="chart-frame-area"]',
    );
    expect(areas).toHaveLength(1);
    expect(areas[0]?.getAttribute("d")).toMatch(/L100 100L0 100Z$/);
    expect(document.querySelectorAll('[data-bt-part="line"]')).toHaveLength(2);
    const plot = document
      .querySelector('[data-bt-part="plot"]')
      ?.getBoundingClientRect();
    const area = areas[0]?.getBoundingClientRect();
    expect(area?.bottom).toBeCloseTo(plot?.bottom ?? 0, 0);
  });
});
