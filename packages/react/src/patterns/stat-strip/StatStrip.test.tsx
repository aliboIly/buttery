import "@butteryui/core/styles.css";
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

  it("shows a new number straight away after it has counted", async () => {
    const strip = (value: number): ReactElement => (
      <ButteryProvider reducedMotion="never" layoutGuard={false}>
        <StatStrip columns={2}>
          <Stat value={value} label="cards" />
        </StatStrip>
      </ButteryProvider>
    );
    const { rerender } = render(strip(1200));
    const count = document.querySelector<HTMLElement>('[data-bt-part="count"]');
    await waitFor(
      () => {
        expect(count?.textContent).toBe("1,200");
      },
      { timeout: 2000 },
    );
    rerender(strip(1300));
    await waitFor(() => {
      expect(count?.textContent).toBe("1,300");
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(count?.textContent).toBe("1,300");
  });

  it("lands on the new number when it changes while counting", async () => {
    const strip = (value: number): ReactElement => (
      <ButteryProvider reducedMotion="never" layoutGuard={false}>
        <StatStrip columns={2}>
          <Stat value={value} label="cards" />
        </StatStrip>
      </ButteryProvider>
    );
    const { rerender } = render(strip(1200));
    const count = document.querySelector<HTMLElement>('[data-bt-part="count"]');
    await waitFor(() => {
      const shown = Number((count?.textContent ?? "").replaceAll(",", ""));
      expect(shown).toBeGreaterThan(0);
      expect(shown).toBeLessThan(1200);
    });
    rerender(strip(1300));
    expect(count?.textContent).toBe("1,300");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(count?.textContent).toBe("1,300");
  });

  it("puts each stat on a card of its own in the cards layout, 16px apart in equal columns", () => {
    render(
      <div style={{ inlineSize: "1000px" }}>
        <StatStrip layout="cards">
          <Stat value={1} label="a" />
          <Stat value={2} label="b" />
          <Stat value={3} label="c" />
          <Stat value={4} label="d" />
        </StatStrip>
      </div>,
    );
    const [first, second] = screen.getAllByRole("listitem");
    if (!first || !second) throw new Error("no stats");
    const card = getComputedStyle(first);
    expect(card.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(card.boxShadow).toContain("0px 0px 0px 1px");
    expect(card.borderTopLeftRadius).toBe("16px");
    expect(card.borderLeftWidth).toBe("0px");
    expect(card.paddingLeft).toBe("24px");
    const a = first.getBoundingClientRect();
    const b = second.getBoundingClientRect();
    expect(b.left - a.right).toBe(16);
    expect(a.width).toBe((1000 - 3 * 16) / 4);
  });

  it("stacks every stat in one column with a hairline between each and the next, whatever its columns", () => {
    render(
      <div style={{ inlineSize: "800px" }}>
        <StatStrip layout="stacked" columns={2} data-testid="strip">
          <Stat value={1} label="a" />
          <Stat value={2} label="b" />
          <Stat value={3} label="c" />
        </StatStrip>
      </div>,
    );
    const strip = screen.getByTestId("strip").getBoundingClientRect();
    const items = screen.getAllByRole("listitem");
    const [first, second, third] = items;
    if (!first || !second || !third) throw new Error("no stats");
    for (const item of items) {
      expect(item.getBoundingClientRect().left).toBe(strip.left);
      expect(item.getBoundingClientRect().width).toBe(strip.width);
      expect(getComputedStyle(item).borderLeftWidth).toBe("0px");
    }
    expect(getComputedStyle(first).borderTopWidth).toBe("0px");
    expect(getComputedStyle(second).borderTopWidth).toBe("1px");
    expect(third.getBoundingClientRect().top).toBeGreaterThan(
      second.getBoundingClientRect().bottom,
    );
    expect(
      first.querySelector('[data-bt-part="number"]')?.getAttribute("data-role"),
    ).toBe("heading-1");
  });

  it("sets display numbers over body-lg labels at size lg, in four columns too", () => {
    render(
      <>
        <StatStrip size="lg" data-testid="large">
          <Stat value={48} label="countries" />
        </StatStrip>
        <StatStrip data-testid="medium">
          <Stat value={48} label="countries" />
        </StatStrip>
      </>,
    );
    const roleOf = (strip: string, part: string): string | null =>
      screen
        .getByTestId(strip)
        .querySelector(`[data-bt-part="${part}"]`)
        ?.getAttribute("data-role") ?? null;
    expect(roleOf("large", "number")).toBe("display");
    expect(roleOf("large", "label")).toBe("body-lg");
    expect(roleOf("medium", "number")).toBe("heading-1");
    expect(roleOf("medium", "label")).toBe("body");
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
