import "@butteryui/core/styles.css";
import "../../styles.css";
import { contrastRatio, formatHex } from "@butteryui/core";
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

function hexOf(color: string): string {
  const [r = 0, g = 0, b = 0] = (color.match(/\d+/g) ?? []).map(Number);
  return formatHex({ r: r / 255, g: g / 255, b: b / 255 });
}

function looks(): void {
  render(
    <div style={{ inlineSize: "1232px" }}>
      <Bento>
        <Bento.Card title="Elevated" span={4} data-testid="elevated" />
        <Bento.Card
          title="Outline"
          span={4}
          variant="outline"
          data-testid="outline"
        />
        <Bento.Card title="Soft" span={4} variant="soft" data-testid="soft" />
        <Bento.Card
          title="Tinted"
          span={6}
          variant="tinted"
          data-testid="tinted"
        />
        <Bento.Card title="Plain" span={6} variant="plain" data-testid="plain">
          <div>Picture</div>
        </Bento.Card>
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

  it("draws each variant's surface: elevated by default, an outline, the control fill, the palette tint or none", () => {
    looks();
    const style = (id: string): CSSStyleDeclaration =>
      getComputedStyle(screen.getByTestId(id));
    expect(style("elevated").backgroundColor).toBe("rgb(255, 255, 255)");
    expect(style("elevated").boxShadow).toContain("0px 0px 0px 1px");
    expect(style("outline").backgroundColor).toBe("rgb(255, 255, 255)");
    expect(style("outline").outlineStyle).toBe("solid");
    expect(style("outline").outlineWidth).toBe("1px");
    expect(style("outline").outlineOffset).toBe("-1px");
    expect(style("outline").outlineColor).toBe("rgb(235, 235, 235)");
    expect(
      screen.getByRole("heading", { name: "Outline" }).getBoundingClientRect()
        .top,
    ).toBe(
      screen.getByRole("heading", { name: "Elevated" }).getBoundingClientRect()
        .top,
    );
    expect(style("outline").boxShadow).toBe("none");
    expect(style("soft").backgroundColor).toBe("rgb(241, 241, 241)");
    expect(style("soft").boxShadow).toBe("none");
    expect(style("tinted").backgroundColor).toBe("rgb(251, 244, 218)");
    expect(style("tinted").boxShadow).toBe("none");
    expect(style("plain").backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(style("plain").boxShadow).toBe("none");
    const title = screen.getByRole("heading", { name: "Tinted" });
    expect(
      contrastRatio(
        hexOf(getComputedStyle(title).color),
        hexOf(style("tinted").backgroundColor),
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("puts a plain card's title on the grid's edge, level with the title beside it, 16px over a visual that carries the shape", () => {
    looks();
    const card = screen.getByTestId("plain");
    const title = screen.getByRole("heading", { name: "Plain" });
    const beside = screen.getByRole("heading", { name: "Tinted" });
    const visual = card.querySelector('[data-bt-part="visual"]');
    const head = card.querySelector('[data-bt-part="head"]');
    if (!visual || !head) throw new Error("no visual or head");
    const cardBox = card.getBoundingClientRect();
    expect(title.getBoundingClientRect().left).toBe(cardBox.left);
    expect(title.getBoundingClientRect().bottom).toBe(
      beside.getBoundingClientRect().bottom,
    );
    expect(visual.getBoundingClientRect().left).toBe(cardBox.left);
    expect(visual.getBoundingClientRect().width).toBe(cardBox.width);
    expect(visual.getBoundingClientRect().top).toBe(
      head.getBoundingClientRect().bottom,
    );
    expect(getComputedStyle(head).paddingBottom).toBe("16px");
    expect(getComputedStyle(visual).borderTopLeftRadius).toBe("16px");
    expect(getComputedStyle(visual).backgroundColor).toBe("rgb(247, 247, 247)");
    expect(getComputedStyle(visual).borderTopWidth).toBe("1px");
    expect(getComputedStyle(card).overflow).toBe("visible");
  });

  it("names each card by its title, an h3", () => {
    grid(1232);
    const card = screen.getByRole("article", { name: "Wide" });
    expect(card.querySelector("h3")?.textContent).toBe("Wide");
  });
});
