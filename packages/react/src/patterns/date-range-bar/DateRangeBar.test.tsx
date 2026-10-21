import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateRangeBar } from "./DateRangeBar.tsx";

afterEach(cleanup);

function isoDate(date: Date): string {
  return `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

describe("DateRangeBar", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DateRangeBar ref={ref} className="custom" id="period" />);
    expect(ref.current?.dataset["bt"]).toBe("DateRangeBar");
    expect(ref.current?.className).toBe("bt-date-range-bar custom");
    expect(ref.current?.id).toBe("period");
  });

  it("is a group of three selects, each named by what it sets and its choice", () => {
    render(<DateRangeBar />);
    expect(screen.getByRole("group", { name: "Period" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Date range, Last 7 days" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Interval, Daily" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Comparison, Previous period" }),
    ).toBeTruthy();
    expect(screen.getByText("compared to").getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("hands back everything it's set to when one part changes", async () => {
    const onValueChange = vi.fn();
    render(<DateRangeBar onValueChange={onValueChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Date range, Last 7 days" }),
    );
    await userEvent.click(
      screen.getByRole("option", { name: "Last 3 months" }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith({
      range: "last-3-months",
      interval: "daily",
      comparison: "previous-period",
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Comparison, Previous period" }),
    );
    await userEvent.click(
      screen.getByRole("option", { name: "No comparison" }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith({
      range: "last-3-months",
      interval: "daily",
      comparison: "none",
    });
  });

  it("takes a custom range from the two date fields under the range list", async () => {
    const onValueChange = vi.fn();
    render(<DateRangeBar onValueChange={onValueChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Date range, Last 7 days" }),
    );
    fireEvent.change(screen.getByLabelText("Start"), {
      target: { value: "2026-10-01" },
    });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("End"), {
      target: { value: "2026-10-14" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith({
      range: "custom",
      custom: { start: "2026-10-01", end: "2026-10-14" },
      interval: "daily",
      comparison: "previous-period",
    });
    expect(screen.getByLabelText("End").getAttribute("min")).toBe("2026-10-01");
    expect(
      screen.getByRole("button", { name: /^Date range, Oct 1\s–\s14$/ }),
    ).toBeTruthy();
  });

  it("applies dates typed end first in order, leaving the fields as typed", async () => {
    const onValueChange = vi.fn();
    render(<DateRangeBar onValueChange={onValueChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Date range, Last 7 days" }),
    );
    fireEvent.change(screen.getByLabelText("Start"), {
      target: { value: "2026-10-20" },
    });
    fireEvent.change(screen.getByLabelText("End"), {
      target: { value: "2026-10-01" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        range: "custom",
        custom: { start: "2026-10-01", end: "2026-10-20" },
      }),
    );
    expect(screen.getByLabelText<HTMLInputElement>("Start").value).toBe(
      "2026-10-20",
    );
    expect(
      screen.getByRole("button", { name: /^Date range, Oct 1\s–\s20$/ }),
    ).toBeTruthy();
  });

  it("applies a date typed before the start while Custom is already chosen", async () => {
    const onValueChange = vi.fn();
    render(
      <DateRangeBar
        defaultValue={{
          range: "custom",
          custom: { start: "2026-10-01", end: "2026-10-14" },
          interval: "daily",
          comparison: "none",
        }}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /^Date range, Oct 1\s–\s14$/ }),
    );
    fireEvent.change(screen.getByLabelText("End"), {
      target: { value: "2026-09-20" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        range: "custom",
        custom: { start: "2026-09-20", end: "2026-10-01" },
      }),
    );
  });

  it("stays inside a column that sizes it to its content", () => {
    render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          inlineSize: "360px",
        }}
      >
        <DateRangeBar data-testid="bar" />
      </div>,
    );
    expect(
      screen.getByTestId("bar").getBoundingClientRect().width,
    ).toBeLessThanOrEqual(360);
  });

  it("asks for its one-row width beside a heading in a row, leaving the heading whole", () => {
    render(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          inlineSize: "1000px",
        }}
      >
        <h2 style={{ margin: 0, lineHeight: "24px" }}>
          Your numbers this week
        </h2>
        <DateRangeBar data-testid="bar" />
      </div>,
    );
    expect(screen.getByTestId("bar").getBoundingClientRect().width).toBe(640);
    expect(
      screen.getByRole("heading", { level: 2 }).getBoundingClientRect().height,
    ).toBe(24);
    const top = (name: RegExp): number =>
      screen.getByRole("button", { name }).getBoundingClientRect().top;
    expect(top(/^Comparison/)).toBe(top(/^Date range/));
  });

  it("keeps the range and the interval in equal halves under 640px, so a new choice doesn't shift its neighbor", async () => {
    render(
      <div style={{ inlineSize: "360px" }}>
        <DateRangeBar />
      </div>,
    );
    const edge = (): number =>
      screen
        .getByRole("button", { name: /^Date range/ })
        .getBoundingClientRect().right;
    const before = edge();
    await userEvent.click(
      screen.getByRole("button", { name: "Interval, Daily" }),
    );
    await userEvent.click(screen.getByRole("option", { name: "Monthly" }));
    expect(
      screen.getByRole("button", { name: "Interval, Monthly" }),
    ).toBeTruthy();
    expect(edge()).toBe(before);
  });

  it("starts a custom range on the last seven days when Custom is chosen with no dates", async () => {
    const onValueChange = vi.fn();
    render(<DateRangeBar onValueChange={onValueChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Date range, Last 7 days" }),
    );
    await userEvent.click(screen.getByRole("option", { name: "Custom" }));
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        range: "custom",
        custom: { start: isoDate(start), end: isoDate(end) },
      }),
    );
  });

  it("shows a controlled custom range and refills its fields when the range changes", async () => {
    const { rerender } = render(
      <DateRangeBar
        value={{
          range: "custom",
          custom: { start: "2025-12-20", end: "2026-01-05" },
          interval: "weekly",
          comparison: "previous-year",
        }}
      />,
    );
    const trigger = screen.getByRole("button", {
      name: /^Date range, Dec 20, 2025\s–\sJan 5, 2026$/,
    });
    rerender(
      <DateRangeBar
        value={{
          range: "custom",
          custom: { start: "2026-03-01", end: "2026-03-31" },
          interval: "weekly",
          comparison: "previous-year",
        }}
      />,
    );
    await userEvent.click(trigger);
    expect(screen.getByLabelText<HTMLInputElement>("Start").value).toBe(
      "2026-03-01",
    );
    expect(screen.getByLabelText<HTMLInputElement>("End").value).toBe(
      "2026-03-31",
    );
  });

  it("keeps one row with room, and moves the comparison to its own row under 640px", () => {
    const { rerender } = render(
      <div style={{ inlineSize: "800px" }}>
        <DateRangeBar />
      </div>,
    );
    const top = (name: RegExp): number =>
      screen.getByRole("button", { name }).getBoundingClientRect().top;
    expect(top(/^Comparison/)).toBe(top(/^Date range/));
    rerender(
      <div style={{ inlineSize: "360px" }}>
        <DateRangeBar />
      </div>,
    );
    expect(top(/^Interval/)).toBe(top(/^Date range/));
    expect(top(/^Comparison/)).toBeGreaterThan(top(/^Date range/));
    const range = screen
      .getByRole("button", { name: /^Date range/ })
      .getBoundingClientRect();
    const interval = screen
      .getByRole("button", { name: /^Interval/ })
      .getBoundingClientRect();
    expect(interval.left - range.right).toBeCloseTo(8, 0);
  });
});
