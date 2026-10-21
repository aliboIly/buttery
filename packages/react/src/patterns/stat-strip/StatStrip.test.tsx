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
import { afterEach, describe, expect, it } from "vitest";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { Stat, StatStrip } from "./StatStrip.tsx";

afterEach(cleanup);

describe("StatStrip", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<StatStrip ref={ref} className="custom" data-testid="stats" />);
    expect(ref.current?.dataset["bt"]).toBe("StatStrip");
    expect(ref.current?.dataset["testid"]).toBe("stats");
    expect(ref.current?.className).toBe("bt-stat-strip custom");
  });

  it("is a list of stats, each read as its final number and label", () => {
    render(
      <StatStrip>
        <Stat value={48} label="countries" />
        <Stat value={99.9} suffix="%" label="under a second" />
      </StatStrip>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    const spoken = { ignore: '[aria-hidden="true"]' };
    const [first, second] = items;
    if (!first || !second) throw new Error("no stats");
    expect(within(first).getByText("48", spoken)).toBeTruthy();
    expect(within(second).getByText("99.9%", spoken)).toBeTruthy();
    expect(within(second).getByText("under a second", spoken)).toBeTruthy();
  });

  it("isn't a list item on its own", () => {
    render(<Stat value={6} label="shapes" />);
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("counts up to its number with full motion and keeps the final number's room", async () => {
    render(
      <ButteryProvider reducedMotion="never" layoutGuard={false}>
        <StatStrip columns={2}>
          <Stat value={1200} label="cards" />
        </StatStrip>
      </ButteryProvider>,
    );
    const count = document.querySelector<HTMLElement>('[data-bt-part="count"]');
    const room = document.querySelector<HTMLElement>('[data-bt-part="room"]');
    if (!count || !room) throw new Error("no number");
    const width = room.getBoundingClientRect().width;
    await waitFor(() => {
      expect(count.textContent).not.toBe("1,200");
    });
    expect(count.parentElement?.getBoundingClientRect().width).toBe(width);
    await waitFor(
      () => {
        expect(count.textContent).toBe("1,200");
      },
      { timeout: 2000 },
    );
  });

  it("puts four stats in two rows of two on a phone", () => {
    render(
      <div
        style={{
          inlineSize: "400px",
          containerType: "inline-size",
          containerName: "bt-page",
        }}
      >
        <StatStrip>
          <Stat value={1} label="a" />
          <Stat value={2} label="b" />
          <Stat value={3} label="c" />
          <Stat value={4} label="d" />
        </StatStrip>
      </div>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[2]?.getBoundingClientRect().top).toBeGreaterThan(
      items[0]?.getBoundingClientRect().bottom ?? 0,
    );
  });
});
