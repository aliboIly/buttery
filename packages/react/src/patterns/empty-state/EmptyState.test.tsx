import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { Receipt } from "lucide-react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "../../components/button/Button.tsx";
import { EmptyState } from "./EmptyState.tsx";

afterEach(cleanup);

describe("EmptyState", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <EmptyState
        ref={ref}
        title="An empty canvas"
        className="custom"
        data-testid="empty"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("EmptyState");
    expect(ref.current?.className).toBe("bt-empty-state custom");
    expect(ref.current?.dataset["testid"]).toBe("empty");
  });

  it("centers a heading and its line, with the actions 24px under the text", () => {
    render(
      <EmptyState
        title="An empty canvas"
        description="Start a fresh card, or open one from your library."
        actions={
          <>
            <Button variant="primary">New card</Button>
            <Button variant="secondary">Open library</Button>
          </>
        }
      />,
    );
    expect(
      screen.getByRole("heading", { name: "An empty canvas", level: 2 }),
    ).toBeTruthy();
    const text = document
      .querySelector<HTMLElement>('[data-bt="TextStack"]')
      ?.getBoundingClientRect();
    const actions = document
      .querySelector<HTMLElement>('[data-bt-part="actions"]')
      ?.getBoundingClientRect();
    expect(Math.round((actions?.top ?? 0) - (text?.bottom ?? 0))).toBe(24);
    const primary = screen
      .getByRole("button", { name: "New card" })
      .getBoundingClientRect();
    const secondary = screen
      .getByRole("button", { name: "Open library" })
      .getBoundingClientRect();
    expect(Math.round(secondary.left - primary.right)).toBe(8);
  });

  it("balances its centered description's lines, so none is left with one word", async () => {
    render(
      <div style={{ inlineSize: "480px" }}>
        <EmptyState
          title="No orders yet"
          description="Orders show up here once a customer checks out, or when you add one by hand."
        />
      </div>,
    );
    await document.fonts.ready;
    const words = document.createRange();
    words.selectNodeContents(screen.getByText(/^Orders show up here/));
    const lines = new Map<number, number>();
    for (const box of words.getClientRects()) {
      const top = Math.round(box.top);
      lines.set(top, (lines.get(top) ?? 0) + box.width);
    }
    const widths = [...lines.values()];
    expect(widths).toHaveLength(2);
    expect(Math.min(...widths)).toBeGreaterThan(Math.max(...widths) / 2);
  });

  it("sizes its tile, gaps and heading for a panel at sm and for a page at lg", () => {
    const measure = (size: "sm" | "lg") => {
      render(
        <EmptyState
          size={size}
          icon={Receipt}
          title="No orders yet"
          description="Orders show up here once a customer checks out."
          actions={<Button variant="primary">Add an order</Button>}
          data-testid={size}
        />,
      );
      const root = screen.getByTestId(size);
      const tile = root.querySelector('[data-bt-part="empty-state-icon"]');
      const stack = root.querySelector('[data-bt="TextStack"]');
      const actions = root.querySelector('[data-bt-part="actions"]');
      const title = root.querySelector("h2");
      const line = stack?.querySelector("p");
      if (!tile || !stack || !actions || !title || !line)
        throw new Error("A part is missing.");
      return {
        tile: tile.getBoundingClientRect(),
        radius: getComputedStyle(tile).borderTopLeftRadius,
        icon: tile.querySelector("svg")?.getBoundingClientRect().width,
        aboveTitle:
          stack.getBoundingClientRect().top -
          tile.getBoundingClientRect().bottom,
        underTitle:
          line.getBoundingClientRect().top -
          title.getBoundingClientRect().bottom,
        aboveActions:
          actions.getBoundingClientRect().top -
          stack.getBoundingClientRect().bottom,
        title: getComputedStyle(title).fontSize,
        line: getComputedStyle(line).fontSize,
      };
    };
    const small = measure("sm");
    expect([small.tile.width, small.tile.height]).toEqual([40, 40]);
    expect(small.radius).toBe("10px");
    expect(small.icon).toBe(20);
    expect(small.aboveTitle).toBe(12);
    expect(Math.round(small.underTitle)).toBe(8);
    expect(Math.round(small.aboveActions)).toBe(16);
    cleanup();
    const large = measure("lg");
    expect([large.tile.width, large.tile.height]).toEqual([56, 56]);
    expect(large.radius).toBe("14px");
    expect(large.icon).toBe(20);
    expect(large.aboveTitle).toBe(20);
    expect(Math.round(large.underTitle)).toBe(12);
    expect(Math.round(large.aboveActions)).toBe(32);
    expect(large.title).toBe("24px");
    expect(large.line).toBe("14px");
  });

  it("draws a dashed edge with 16px corners when dashed, padded by its size", () => {
    render(
      <>
        <EmptyState
          title="Drop photos here"
          variant="dashed"
          data-testid="md"
        />
        <EmptyState
          title="Drop photos here"
          variant="dashed"
          size="sm"
          data-testid="sm"
        />
        <EmptyState
          title="Drop photos here"
          variant="dashed"
          size="lg"
          data-testid="lg"
        />
        <EmptyState title="Nothing here yet" data-testid="plain" />
      </>,
    );
    const edge = getComputedStyle(screen.getByTestId("md"));
    expect(edge.borderTopStyle).toBe("dashed");
    expect(edge.borderTopWidth).toBe("2px");
    expect(edge.borderTopColor).toBe("rgb(202, 202, 202)");
    expect(edge.borderTopLeftRadius).toBe("16px");
    expect(edge.paddingTop).toBe("32px");
    expect(getComputedStyle(screen.getByTestId("sm")).paddingTop).toBe("24px");
    expect(getComputedStyle(screen.getByTestId("lg")).paddingTop).toBe("48px");
    const plain = getComputedStyle(screen.getByTestId("plain"));
    expect(plain.borderTopStyle).toBe("none");
    expect(plain.paddingTop).toBe("0px");
  });

  it("leaves out the actions row when there are none", () => {
    render(<EmptyState title="Nothing here yet" />);
    expect(document.querySelector('[data-bt-part="actions"]')).toBeNull();
  });

  it("puts an icon tile 16px over the title and a docs link 16px under the text", () => {
    render(
      <EmptyState
        icon={Receipt}
        title="No orders yet"
        description="Orders show up here once a customer checks out."
        docs={<a href="#guide">How orders work</a>}
      />,
    );
    const tile = document.querySelector<HTMLElement>(
      '[data-bt-part="empty-state-icon"]',
    );
    const stack = document.querySelector<HTMLElement>('[data-bt="TextStack"]');
    const docs = document.querySelector<HTMLElement>('[data-bt-part="docs"]');
    if (!tile || !stack || !docs) throw new Error("A part is missing.");
    const box = tile.getBoundingClientRect();
    expect([box.width, box.height]).toEqual([48, 48]);
    expect(tile.querySelector("svg")?.getBoundingClientRect().width).toBe(20);
    expect(getComputedStyle(tile).borderRadius).toBe("12px");
    expect(stack.getBoundingClientRect().top - box.bottom).toBe(16);
    expect(
      docs.getBoundingClientRect().top - stack.getBoundingClientRect().bottom,
    ).toBe(16);
    expect(screen.getByRole("link", { name: "How orders work" })).toBeTruthy();
  });
});
