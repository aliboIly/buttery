import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { BarChart } from "./BarChart.tsx";

afterEach(cleanup);

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];

describe("BarChart", () => {
  it("stamps its class and data-bt on the frame, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <BarChart
        ref={ref}
        label="Bags"
        labels={WEEK}
        series={[{ key: "bags", label: "Bags", values: [48, 40, 55, 52, 60] }]}
        className="custom"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("BarChart");
    expect(ref.current?.dataset["layout"]).toBe("band");
    expect(ref.current?.className).toBe("bt-chart-frame bt-bar-chart custom");
  });

  it("puts the series side by side in each slot, 4px between neighboring slots' bars", () => {
    render(
      <div style={{ inlineSize: "500px" }}>
        <BarChart
          label="Bags"
          labels={WEEK}
          series={[
            { key: "now", label: "This week", values: [48, 40, 55, 52, 60] },
            {
              key: "before",
              label: "Last week",
              values: [44, 42, 50, 49, 58],
              comparison: true,
            },
          ]}
        />
      </div>,
    );
    const bars = [
      ...document.querySelectorAll<HTMLElement>('[data-bt-part="bar"]'),
    ];
    expect(bars).toHaveLength(10);
    const [mondayNow, mondayBefore, tuesdayNow] = bars.map((bar) =>
      bar.getBoundingClientRect(),
    );
    expect((mondayBefore?.left ?? 0) - (mondayNow?.right ?? 0)).toBeCloseTo(
      2,
      0,
    );
    expect((tuesdayNow?.left ?? 0) - (mondayBefore?.right ?? 0)).toBeCloseTo(
      4,
      0,
    );
    expect(mondayNow?.height).toBeGreaterThan(mondayBefore?.height ?? 0);
  });

  it("rounds a bar below zero at its bottom end and grows it down from the baseline", () => {
    render(
      <div style={{ inlineSize: "500px" }}>
        <BarChart
          label="Change"
          labels={["Mon", "Tue"]}
          series={[{ key: "change", label: "Change", values: [120, -80] }]}
        />
      </div>,
    );
    const [gain, loss] = [
      ...document.querySelectorAll<HTMLElement>('[data-bt-part="bar"]'),
    ];
    expect(loss?.hasAttribute("data-negative")).toBe(true);
    const corners = (bar: HTMLElement | undefined): string[] => {
      const style = getComputedStyle(bar ?? document.body);
      return [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomLeftRadius,
        style.borderBottomRightRadius,
      ];
    };
    const [gainTop, , gainBottom] = corners(gain);
    const [lossTop, , lossBottom] = corners(loss);
    expect(gainTop).not.toBe("0px");
    expect(gainBottom).toBe("0px");
    expect(lossTop).toBe("0px");
    expect(lossBottom).not.toBe("0px");
    expect(loss?.getBoundingClientRect().top).toBeCloseTo(
      gain?.getBoundingClientRect().bottom ?? 0,
      0,
    );
  });

  it("steps through its slots from the keyboard", async () => {
    render(
      <BarChart
        label="Bags"
        labels={WEEK}
        series={[{ key: "bags", label: "Bags", values: [48, 40, 55, 52, 60] }]}
      />,
    );
    const plot = screen.getByRole("slider", { name: "Bags" });
    await userEvent.keyboard("{Shift}");
    plot.focus();
    await userEvent.keyboard("{Home}");
    expect(plot.getAttribute("aria-valuetext")).toBe("Mon: Bags 48");
    const column = document.querySelector<HTMLElement>(
      '[data-bt-part="column"]',
    );
    expect(column?.hidden).toBe(false);
  });
});
