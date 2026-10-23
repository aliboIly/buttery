import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Bento } from "./Bento.tsx";

afterEach(cleanup);

function grid(width: number): void {
  render(
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Bento>
        <Bento.Card title="Wide" span={8} data-testid="wide" />
        <Bento.Card title="Narrow" span={4} data-testid="narrow" />
        <Bento.Card title="Tall" span={4} rows={2} data-testid="tall" />
      </Bento>
    </div>,
  );
}

function width(id: string): number {
  return screen.getByTestId(id).getBoundingClientRect().width;
}

describe("Bento", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Bento ref={ref} className="custom" data-testid="bento" />);
    expect(ref.current?.dataset["bt"]).toBe("Bento");
    expect(ref.current?.dataset["testid"]).toBe("bento");
    expect(ref.current?.className).toBe("bt-bento custom");
  });

  it("spans 8 and 4 of 12 columns past 1024px, 16px apart, in 320px rows", () => {
    grid(1232);
    expect(width("wide")).toBe(8 * 88 + 7 * 16);
    expect(width("narrow")).toBe(4 * 88 + 3 * 16);
    expect(screen.getByTestId("narrow").getBoundingClientRect().height).toBe(
      320,
    );
    expect(screen.getByTestId("tall").getBoundingClientRect().height).toBe(
      2 * 320 + 16,
    );
  });

  it("takes the whole width for wide cards and half for the rest from 640px", () => {
    grid(800);
    expect(width("wide")).toBe(800);
    expect(width("narrow")).toBe((800 - 16) / 2);
  });

  it("stacks every card below 640px", () => {
    grid(400);
    expect(width("wide")).toBe(400);
    expect(width("narrow")).toBe(400);
  });

  it("names each card by its title, an h3", () => {
    grid(1232);
    const card = screen.getByRole("article", { name: "Wide" });
    expect(card.querySelector("h3")?.textContent).toBe("Wide");
  });
});
