import "@buttery/core/styles.css";
import "../../styles.css";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetricCard } from "./MetricCard.tsx";
import type { MetricCardProps } from "./MetricCard.tsx";

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

function Card(props: Partial<MetricCardProps>): ReactElement {
  return (
    <div style={{ inlineSize: "360px" }}>
      <MetricCard
        title="Sales"
        info="Every sale, before refunds and fees."
        value="$12,405.00"
        delta={0.124}
        labels={DAYS}
        series={[
          {
            key: "now",
            label: "This week",
            values: [1420, 1560, 1490, 1710, 1880, 2240, 2105],
          },
          {
            key: "before",
            label: "Last week",
            values: [1350, 1410, 1380, 1550, 1700, 1960, 1890],
            comparison: true,
          },
        ]}
        updated="Updated 4 min ago"
        href="#sales"
        {...props}
      />
    </div>
  );
}

function rectOf(element: Element | null): DOMRect {
  if (element === null) throw new Error("missing element");
  return element.getBoundingClientRect();
}

describe("MetricCard", () => {
  it("opens what the metric means on a press or a tap, where no tooltip shows", async () => {
    render(<Card />);
    const user = userEvent.setup();
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", {
        name: "Every sale, before refunds and fees.",
      }),
    });
    expect(
      await screen.findByRole("dialog", {
        name: "Every sale, before refunds and fees.",
      }),
    ).toBeTruthy();
  });

  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref} className="custom" id="volume" />);
    expect(ref.current?.dataset["bt"]).toBe("MetricCard");
    expect(ref.current?.className).toBe("bt-metric-card custom");
    expect(ref.current?.id).toBe("volume");
  });

  it("is a group named by its h3 title, with an info button named by the explanation", () => {
    render(<Card />);
    const card = screen.getByRole("group", { name: "Sales" });
    expect(
      within(card).getByRole("heading", { level: 3, name: "Sales" }),
    ).toBeTruthy();
    expect(
      within(card).getByRole("button", {
        name: "Every sale, before refunds and fees.",
      }),
    ).toBeTruthy();
    cleanup();
    render(<Card titleAs="h2" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Sales" }),
    ).toBeTruthy();
  });

  it("shows the value with its change as a badge, good news in success", () => {
    render(<Card />);
    expect(screen.getByText("$12,405.00").dataset["role"]).toBe("title-lg");
    const badge = screen
      .getByText("+12.4%")
      .closest<HTMLElement>("[data-bt='StatusBadge']");
    expect(badge?.dataset["tone"]).toBe("success");
    expect(screen.getByText("vs previous period")).toBeTruthy();
    cleanup();
    render(<Card title="Refund rate" delta={0.05} lowerIsBetter />);
    expect(
      screen.getByText("+5%").closest<HTMLElement>("[data-bt='StatusBadge']")
        ?.dataset["tone"],
    ).toBe("danger");
  });

  it("charts the period against the last one, described by the change", () => {
    render(<Card />);
    const plot = screen.getByRole("slider", { name: "Sales" });
    const summary = document.getElementById(
      plot.getAttribute("aria-describedby") ?? "",
    );
    expect(summary?.textContent).toBe("+12.4% vs previous period");
    expect(rectOf(document.querySelector(".bt-chart-frame")).height).toBe(160);
  });

  it("links to its details once for keyboards and screen readers, and again for the pointer", async () => {
    const onNavigate = vi.fn(
      (_: string, event: { preventDefault: () => void }) => {
        event.preventDefault();
      },
    );
    render(<Card onNavigate={onNavigate} />);
    const details = screen.getByRole("link", {
      name: "Details for Sales",
    });
    expect(details.getAttribute("href")).toBe("#sales");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    const expand = document.querySelector<HTMLAnchorElement>(
      "a[aria-hidden='true']",
    );
    expect(expand?.getAttribute("href")).toBe("#sales");
    expect(expand?.tabIndex).toBe(-1);
    await userEvent.click(details);
    expect(onNavigate).toHaveBeenCalledWith("#sales", expect.anything());
    expect(screen.getByText("Updated 4 min ago")).toBeTruthy();
  });

  it("holds every part in its place while loading, so nothing moves when the numbers arrive", () => {
    const { rerender } = render(
      <Card loading value={undefined} delta={undefined} />,
    );
    const card = screen.getByRole("group", { name: "Sales" });
    expect(card.getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByRole("status")).toBeNull();
    expect(
      screen.getByText("$00,000.00").classList.contains("bt-skeleton"),
    ).toBe(true);
    expect(screen.queryByText("+12.4%")).toBeNull();
    expect(
      document.querySelector("[data-bt-part='delta-skeleton']"),
    ).not.toBeNull();
    const chart = document.querySelector(".bt-chart-frame");
    const before = {
      chart: rectOf(chart).top,
      link: rectOf(screen.getByRole("link")).top,
      height: rectOf(card).height,
    };
    rerender(
      <div style={{ inlineSize: "360px" }}>
        <MetricCard
          title="Sales"
          info="Every sale, before refunds and fees."
          value="$12,405.00"
          delta={0.124}
          labels={DAYS}
          series={[
            { key: "now", label: "This week", values: [1, 2, 3, 4, 5, 6, 7] },
          ]}
          updated="Updated 4 min ago"
          href="#sales"
        />
      </div>,
    );
    expect(
      Math.abs(
        rectOf(document.querySelector(".bt-chart-frame")).top - before.chart,
      ),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(rectOf(screen.getByRole("link")).top - before.link),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(rectOf(screen.getByRole("group")).height - before.height),
    ).toBeLessThanOrEqual(1);
  });

  it("keeps the change line's place through loading only when it compares, with — when there's no change to show", () => {
    const now = {
      key: "now",
      label: "This week",
      values: [1, 2, 3, 4, 5, 6, 7],
    };
    const before = {
      ...now,
      key: "before",
      label: "Last week",
      comparison: true,
    };
    const height = (): number => rectOf(screen.getByRole("group")).height;
    const { rerender } = render(
      <Card loading value={undefined} delta={undefined} series={[now]} />,
    );
    expect(
      document.querySelector("[data-bt-part='delta-skeleton']"),
    ).toBeNull();
    const plain = height();
    rerender(<Card delta={undefined} series={[now]} />);
    expect(document.querySelector("[data-bt-part='delta']")).toBeNull();
    expect(Math.abs(height() - plain)).toBeLessThanOrEqual(1);
    cleanup();
    const second = render(
      <Card
        loading
        value={undefined}
        delta={undefined}
        series={[now, before]}
      />,
    );
    expect(
      document.querySelector("[data-bt-part='delta-skeleton']"),
    ).not.toBeNull();
    const comparing = height();
    second.rerender(<Card delta={undefined} series={[now, before]} />);
    const line = document.querySelector("[data-bt-part='delta']");
    expect(line?.textContent).toContain("—");
    expect(line?.textContent).toContain("No change to show");
    expect(Math.abs(height() - comparing)).toBeLessThanOrEqual(1);
  });

  it("leaves out the chart and the change when it has neither", () => {
    render(<MetricCard title="Wholesale accounts" value="38" />);
    expect(screen.queryByRole("slider")).toBeNull();
    expect(document.querySelector("[data-bt-part='delta']")).toBeNull();
    expect(document.querySelector("[data-bt-part='foot']")).toBeNull();
  });

  it("crossfades each skeleton into its content in place, and titles its name with its full text", async () => {
    const { rerender } = render(
      <Card loading value={undefined} delta={undefined} />,
    );
    expect(
      screen
        .getByRole("heading", { level: 3, name: "Sales" })
        .getAttribute("title"),
    ).toBe("Sales");
    rerender(<Card />);
    const views = (): number =>
      document.querySelectorAll(
        '.bt-metric-card [data-bt="Morph"] [data-bt-part="view"]',
      ).length;
    const morphs = document.querySelectorAll(
      '.bt-metric-card [data-bt="Morph"]',
    ).length;
    expect(morphs).toBeGreaterThan(0);
    expect(views()).toBeGreaterThan(morphs);
    await waitFor(() => {
      expect(views()).toBe(morphs);
    });
    expect(document.querySelector(".bt-metric-card .bt-skeleton")).toBeNull();
  });
});
