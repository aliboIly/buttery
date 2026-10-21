import "@buttery/core/styles.css";
import "../../styles.css";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { ChartFrame } from "./ChartFrame.tsx";
import type { ChartFrameProps, ChartSeries } from "./ChartFrame.tsx";

afterEach(cleanup);

const DAYS = [
  "Oct 8",
  "Oct 9",
  "Oct 10",
  "Oct 11",
  "Oct 12",
  "Oct 13",
  "Oct 14",
];

const THIS_WEEK: ChartSeries = {
  key: "now",
  label: "This week",
  values: [42, 38, 51, 47, 63, 71, 58],
};

const LAST_WEEK: ChartSeries = {
  key: "before",
  label: "Last week",
  values: [40, 41, 45, 44, 50, 70, 50],
  comparison: true,
};

function Chart(
  props: Partial<ChartFrameProps> & { readonly width?: number },
): ReactElement {
  const { width = 600, ...rest } = props;
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <ChartFrame
        label="Orders"
        labels={DAYS}
        series={[THIS_WEEK, LAST_WEEK]}
        {...rest}
      >
        <ChartFrame.Line series="before" />
        <ChartFrame.Line series="now" />
      </ChartFrame>
    </div>
  );
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-bt-part="${name}"]`,
  );
  if (element === null) throw new Error(`no ${name}`);
  return element;
}

/** Points the mouse at the label at `index`, the way a person would. */
async function pointAt(index: number, count = DAYS.length): Promise<void> {
  const plot = screen.getByRole("slider");
  const box = plot.getBoundingClientRect();
  await userEvent.hover(plot, {
    position: { x: (index / (count - 1)) * (box.width - 1), y: box.height / 2 },
  });
}

describe("ChartFrame", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Chart ref={ref} className="custom" id="orders-chart" />);
    expect(ref.current?.dataset["bt"]).toBe("ChartFrame");
    expect(ref.current?.className).toBe("bt-chart-frame custom");
    expect(ref.current?.id).toBe("orders-chart");
  });

  it("draws gridlines at round values, labelled at the end edge, with the first and last labels under the plot", () => {
    render(<Chart />);
    expect(
      within(part("y-axis"))
        .getAllByText(/\d/)
        .map((tick) => tick.textContent),
    ).toEqual(["80", "60", "40", "20", "0"]);
    expect(part("grid").children).toHaveLength(5);
    expect(part("x-axis").textContent).toBe("Oct 8Oct 14");
    const frame = document
      .querySelector(".bt-chart-frame")
      ?.getBoundingClientRect();
    const plot = screen.getByRole("slider").getBoundingClientRect();
    const axis = part("y-axis").getBoundingClientRect();
    expect(frame?.height).toBe(220);
    expect(axis.left).toBeGreaterThan(plot.right);
  });

  it("is one Tab stop, a slider over the points named by its label and described by its summary", () => {
    render(<Chart summary="Up 16% on last week." />);
    const plot = screen.getByRole("slider", { name: "Orders" });
    expect(plot.tabIndex).toBe(0);
    expect(plot.getAttribute("aria-valuenow")).toBe("6");
    expect(plot.getAttribute("aria-valuetext")).toBe(
      "Oct 14: This week 58, Last week 50, +16%",
    );
    const summary = document.getElementById(
      plot.getAttribute("aria-describedby") ?? "",
    );
    expect(summary?.textContent).toBe("Up 16% on last week.");
  });

  it("snaps a crosshair, a dot per series and the tooltip to the nearest point as the pointer moves", async () => {
    render(<Chart />);
    await pointAt(4);
    const plot = screen.getByRole("slider").getBoundingClientRect();
    const crosshair = part("crosshair");
    expect(crosshair.hidden).toBe(false);
    const line = crosshair.getBoundingClientRect();
    expect(line.left + line.width / 2).toBeCloseTo(
      plot.left + (4 / 6) * plot.width,
      0,
    );
    const tooltip = part("tooltip");
    expect(tooltip.hidden).toBe(false);
    expect(part("tooltip-date").textContent).toBe("Oct 12");
    expect(
      [...tooltip.querySelectorAll('[data-bt-part="tooltip-value"]')].map(
        (value) => value.textContent,
      ),
    ).toEqual(["63", "50"]);
    const rise = tooltip.querySelector<HTMLElement>('[data-trend="rise"]');
    expect(rise?.hidden).toBe(false);
    expect(rise?.textContent).toBe("+26%");
    const dots = document.querySelectorAll<HTMLElement>(
      '[data-bt-part="point"]',
    );
    const dot = dots[0]?.getBoundingClientRect();
    expect((dot?.left ?? 0) + (dot?.width ?? 0) / 2).toBeCloseTo(
      line.left + line.width / 2,
      0,
    );
    await userEvent.unhover(screen.getByRole("slider"));
    expect(part("tooltip").hidden).toBe(true);
    expect(part("crosshair").hidden).toBe(true);
  });

  it("keeps the tooltip inside the chart's box, flipping beside the crosshair at the end", async () => {
    render(<Chart />);
    const frame = document
      .querySelector(".bt-chart-frame")
      ?.getBoundingClientRect();
    for (const index of [0, 6]) {
      await pointAt(index);
      const tooltip = part("tooltip").getBoundingClientRect();
      const crosshair = part("crosshair").getBoundingClientRect();
      expect(tooltip.left).toBeGreaterThanOrEqual(frame?.left ?? 0);
      expect(tooltip.right).toBeLessThanOrEqual((frame?.right ?? 0) + 0.5);
      if (index === 0) expect(tooltip.left).toBeGreaterThan(crosshair.right);
      else expect(tooltip.right).toBeLessThan(crosshair.left);
    }
  });

  it("steps through the points with the arrow keys, Home and End, and hides the tooltip on Escape", async () => {
    render(<Chart />);
    const plot = screen.getByRole("slider");
    await userEvent.keyboard("{Shift}");
    plot.focus();
    expect(part("tooltip").hidden).toBe(false);
    expect(part("tooltip-date").textContent).toBe("Oct 14");
    await userEvent.keyboard("{ArrowLeft}");
    expect(plot.getAttribute("aria-valuenow")).toBe("5");
    expect(plot.getAttribute("aria-valuetext")).toBe(
      "Oct 13: This week 71, Last week 70, +1.4%",
    );
    expect(part("tooltip-date").textContent).toBe("Oct 13");
    await userEvent.keyboard("{Home}");
    expect(plot.getAttribute("aria-valuenow")).toBe("0");
    await userEvent.keyboard("{ArrowLeft}");
    expect(plot.getAttribute("aria-valuenow")).toBe("0");
    await userEvent.keyboard("{End}");
    expect(part("tooltip-date").textContent).toBe("Oct 14");
    await userEvent.keyboard("{Escape}");
    expect(part("tooltip").hidden).toBe(true);
  });

  it("holds every value in a visually hidden table", () => {
    render(<Chart formatValue={(value) => `${String(value)} orders`} />);
    const table = screen.getByRole("table", { name: "Orders" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Date", "This week", "Last week"]);
    const row = within(table).getByRole("row", { name: /Oct 12/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["63 orders", "50 orders"]);
  });

  it("colors series in order and the comparison in chart-muted", () => {
    render(<Chart />);
    const dots = [
      ...document.querySelectorAll<HTMLElement>('[data-bt-part="point"]'),
    ];
    expect(
      dots.map((dot) => dot.style.getPropertyValue("--bt-chart-frame-series")),
    ).toEqual(["var(--bt-chart-1)", "var(--bt-chart-muted)"]);
  });

  it("leaves a gap for a missing value and says so in the tooltip", async () => {
    render(
      <Chart
        series={[
          { ...THIS_WEEK, values: [42, 38, null, 47, 63, 71, 58] },
          LAST_WEEK,
        ]}
      />,
    );
    const path = document.querySelectorAll('[data-bt-part="line"]')[1];
    expect(path?.getAttribute("d")?.match(/M/g)).toHaveLength(2);
    await pointAt(2);
    expect(
      part("tooltip").querySelector('[data-bt-part="tooltip-value"]')
        ?.textContent,
    ).toBe("—");
    expect(
      document.querySelector<HTMLElement>('[data-bt-part="point"]')?.hidden,
    ).toBe(true);
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe(
      "Oct 14: This week 58, Last week 50, +16%",
    );
  });

  it("highlights a band's column instead of a crosshair", async () => {
    render(
      <div style={{ inlineSize: "600px" }}>
        <ChartFrame
          label="Orders"
          labels={DAYS}
          series={[THIS_WEEK]}
          layout="band"
        >
          <ChartFrame.Bars />
        </ChartFrame>
      </div>,
    );
    const plot = screen.getByRole("slider");
    const box = plot.getBoundingClientRect();
    await userEvent.hover(plot, {
      position: { x: box.width * (3.5 / 7), y: 10 },
    });
    const column = part("column").getBoundingClientRect();
    expect(column.left).toBeCloseTo(box.left + (3 / 7) * box.width, 0);
    expect(column.width).toBeCloseTo(box.width / 7, 0);
    expect(document.querySelectorAll('[data-bt-part="point"]')).toHaveLength(0);
    expect(document.querySelectorAll('[data-bt-part="bar"]')).toHaveLength(7);
  });

  it("says when there's nothing to draw, with no plot to step through", () => {
    render(
      <Chart
        series={[
          { key: "now", label: "This week", values: DAYS.map(() => null) },
        ]}
      />,
    );
    expect(screen.queryByRole("slider")).toBeNull();
    expect(
      screen.getByRole("img", { name: "Orders: No data for this period" }),
    ).toBeTruthy();
    const frame = document
      .querySelector(".bt-chart-frame")
      ?.getBoundingClientRect();
    expect(frame?.height).toBe(220);
  });

  it("shows a loading pill over the same box, its words in a status no busy region holds back", async () => {
    render(<Chart loading size="sm" />);
    const frame = document.querySelector<HTMLElement>(".bt-chart-frame");
    expect(frame?.getBoundingClientRect().height).toBe(160);
    expect(screen.queryByRole("slider")).toBeNull();
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toBe("Loading data");
    });
    expect(screen.getByRole("status").closest('[aria-busy="true"]')).toBeNull();
  });

  it("loads without a status when what holds it says it's loading", async () => {
    render(<Chart loading size="sm" announceLoading={false} />);
    await waitFor(() => {
      expect(document.querySelector('[data-bt="LoadingPill"]')).not.toBeNull();
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("warns, with the fix, when a series has a value count that doesn't match its labels", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Chart label="Uneven" series={[{ ...THIS_WEEK, values: [1, 2, 3] }]} />,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('series "now" has 3 values for 7 labels. Fix:'),
    );
    warn.mockRestore();
  });

  it("keeps the point it shows, and its slider value, true to the data when the data changes", async () => {
    const { rerender } = render(<Chart />);
    const plot = screen.getByRole("slider");
    plot.focus();
    await userEvent.keyboard("{Home}");
    expect(plot.getAttribute("aria-valuenow")).toBe("0");
    rerender(
      <Chart
        series={[
          { ...THIS_WEEK, values: [70, 38, 51, 47, 63, 71, 58] },
          LAST_WEEK,
        ]}
      />,
    );
    expect(plot.getAttribute("aria-valuenow")).toBe("0");
    expect(plot.getAttribute("aria-valuetext")).toContain(
      "Oct 8: This week 70",
    );
    expect(
      [...document.querySelectorAll('[data-bt-part="tooltip-value"]')].map(
        (value) => value.textContent,
      ),
    ).toContain("70");
  });

  it("puts a lone zero tick on the plot's bottom edge", () => {
    render(
      <Chart
        series={[
          { key: "now", label: "Refunds", values: [0, 0, 0, 0, 0, 0, 0] },
        ]}
      >
        <ChartFrame.Line series="now" />
      </Chart>,
    );
    const plot = screen.getByRole("slider").getBoundingClientRect();
    const [line] = part("grid").children;
    const [label] = part("y-axis").children;
    if (!line || !label) throw new Error("No tick.");
    expect(
      Math.abs(line.getBoundingClientRect().bottom - plot.bottom),
    ).toBeLessThanOrEqual(1);
    const box = label.getBoundingClientRect();
    expect(
      Math.abs(box.top + box.height / 2 - plot.bottom),
    ).toBeLessThanOrEqual(1);
  });

  it("labels fractional ticks with the decimals they need", () => {
    render(
      <Chart
        series={[
          {
            key: "now",
            label: "Rate",
            values: [0.2, 0.4, 0.9, 1, 0.6, 0.3, 0.5],
          },
        ]}
      >
        <ChartFrame.Line series="now" />
      </Chart>,
    );
    expect(
      [...part("y-axis").children].map((label) => label.textContent),
    ).toEqual(["1", "0.75", "0.5", "0.25", "0"]);
  });

  it("leaves out values that aren't finite numbers, as gaps, instead of breaking its axis, line or tooltip", async () => {
    render(
      <Chart
        series={[
          {
            key: "now",
            label: "Orders",
            values: [4, Number.NaN, 9, 6, 2, Number.POSITIVE_INFINITY, 5],
          },
        ]}
      >
        <ChartFrame.Line series="now" />
      </Chart>,
    );
    expect(part("y-axis").children.length).toBeGreaterThan(1);
    expect(part("y-axis").textContent).not.toContain("NaN");
    const path = document.querySelector('[data-bt-part="line"]');
    expect(path?.getAttribute("d")).not.toContain("NaN");
    expect(path?.getAttribute("d")?.match(/M/g)).toHaveLength(3);
    await pointAt(1);
    expect(
      part("tooltip").querySelector('[data-bt-part="tooltip-value"]')
        ?.textContent,
    ).toBe("—");
    const table = screen.getByRole("table", { name: "Orders" });
    expect(table.textContent).not.toMatch(/NaN|∞/);
  });

  it("labels compact ticks with the decimals their unit needs", () => {
    render(
      <Chart
        size="lg"
        series={[
          {
            key: "now",
            label: "Sales",
            values: [400.5, 900.25, 1200, 1100.75, 700, 300.5, 1000],
          },
        ]}
      >
        <ChartFrame.Line series="now" />
      </Chart>,
    );
    expect(
      [...part("y-axis").children].map((label) => label.textContent),
    ).toEqual(["1.25K", "1K", "750", "500", "250", "0"]);
  });

  it("fades in where its loading pill was as the pill fades away", async () => {
    const { rerender } = render(<Chart loading />);
    await waitFor(() => {
      expect(document.querySelector('[data-bt="LoadingPill"]')).not.toBeNull();
    });
    rerender(<Chart />);
    const frame = document.querySelector<HTMLElement>(".bt-chart-frame");
    expect(frame?.hasAttribute("data-arrived")).toBe(true);
    expect(getComputedStyle(part("plot")).animationName).toBe(
      "bt-chart-frame-arrive",
    );
    expect(document.querySelector('[data-bt="LoadingPill"]')).not.toBeNull();
    await waitFor(() => {
      expect(document.querySelector('[data-bt="LoadingPill"]')).toBeNull();
      expect(frame?.hasAttribute("data-arrived")).toBe(false);
    });
  });
});
