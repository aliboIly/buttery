import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ArticleLayout } from "./ArticleLayout.tsx";

afterEach(cleanup);

function layout(width: number): void {
  render(
    <div style={{ inlineSize: `${String(width)}px` }}>
      <ArticleLayout
        aside={<p>Sections</p>}
        asideLabel="On this page"
        data-testid="layout"
      >
        <article data-testid="article">
          <p>Words</p>
        </article>
      </ArticleLayout>
    </div>,
  );
}

function box(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

function parts(): { main: Element; aside: Element; sticky: Element } {
  const root = screen.getByTestId("layout");
  const main = root.querySelector('[data-bt-part="main"]');
  const aside = root.querySelector('[data-bt-part="aside"]');
  const sticky = root.querySelector('[data-bt-part="sticky"]');
  if (!main || !aside || !sticky) throw new Error("A part is missing.");
  return { main, aside, sticky };
}

describe("ArticleLayout", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ArticleLayout ref={ref} className="custom" data-testid="layout" />);
    expect(ref.current?.dataset["bt"]).toBe("ArticleLayout");
    expect(ref.current?.dataset["testid"]).toBe("layout");
    expect(ref.current?.className).toBe("bt-article-layout custom");
  });

  it("gives the article 8 of 12 columns and the aside the last 3, a column apart, from 1024px", () => {
    layout(1224);
    const { main, aside, sticky } = parts();
    const left = box(screen.getByTestId("layout")).left;
    expect(box(main).width).toBe(8 * 80 + 7 * 24);
    expect(box(aside).width).toBe(3 * 80 + 2 * 24);
    expect(box(aside).left - left).toBe(9 * 80 + 9 * 24);
    expect(getComputedStyle(sticky).position).toBe("sticky");
  });

  it("stacks the aside after the article, not sticky, under 1024px", () => {
    layout(800);
    const { main, aside, sticky } = parts();
    expect(box(main).width).toBe(800);
    expect(box(aside).width).toBe(800);
    expect(box(aside).top).toBeGreaterThanOrEqual(box(main).bottom);
    expect(getComputedStyle(sticky).position).toBe("static");
  });

  it("names the aside's landmark", () => {
    layout(1224);
    expect(
      screen.getByRole("complementary", { name: "On this page" }),
    ).toBeTruthy();
  });

  it("leaves the aside out when there's nothing to put in it", () => {
    render(
      <ArticleLayout>
        <article>Words</article>
      </ArticleLayout>,
    );
    expect(screen.queryByRole("complementary")).toBeNull();
  });
});
