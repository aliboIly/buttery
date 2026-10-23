import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Footer } from "./Footer.tsx";

afterEach(cleanup);

function footer(width: number): void {
  render(
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Footer
        brand={<p data-testid="brand">Deckhand</p>}
        legal={
          <p>
            © 2026 <Footer.Link href="#terms">Terms</Footer.Link>
          </p>
        }
      >
        <Footer.Column title="Product" data-testid="product">
          <Footer.Link href="#features">Features</Footer.Link>
          <Footer.Link href="#export">Export</Footer.Link>
        </Footer.Column>
        <Footer.Column title="Help" data-testid="help">
          <Footer.Link href="#guides">Guides</Footer.Link>
        </Footer.Column>
      </Footer>
    </div>,
  );
}

function width(id: string): number {
  return screen.getByTestId(id).getBoundingClientRect().width;
}

function brandBox(): Element {
  const cell = screen
    .getByTestId("brand")
    .closest('[data-bt-part="footer-brand"]');
  if (!cell) throw new Error("No brand cell.");
  return cell;
}

describe("Footer", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(<Footer ref={ref} className="custom" data-testid="footer" />);
    expect(ref.current?.dataset["bt"]).toBe("Footer");
    expect(ref.current?.dataset["testid"]).toBe("footer");
    expect(ref.current?.className).toBe("bt-footer custom");
  });

  it("is the page's contentinfo, with a list of links per column named by its heading", () => {
    footer(1256);
    const landmark = screen.getByRole("contentinfo");
    const list = within(landmark).getByRole("list", { name: "Product" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(landmark).getByRole("heading", { level: 2, name: "Help" }),
    ).toBeTruthy();
  });

  it("puts a link in the small print without a list item around it", () => {
    footer(1256);
    const terms = screen.getByRole("link", { name: "Terms" });
    expect(terms.closest("li")).toBeNull();
  });

  it("gives the brand 4 of 12 columns and each column 2, 24px apart, from 1024px, in the 1200px page width", () => {
    footer(1256);
    expect(brandBox().getBoundingClientRect().width).toBe(4 * 78 + 3 * 24);
    expect(width("product")).toBe(2 * 78 + 24);
  });

  it("gives the brand a row and pairs columns on 8 columns from 640px", () => {
    footer(800);
    expect(brandBox().getBoundingClientRect().width).toBe(768);
    expect(width("product")).toBe(2 * 75 + 24);
  });

  it("puts two columns to a row under 640px", () => {
    footer(400);
    expect(brandBox().getBoundingClientRect().width).toBe(368);
    expect(width("product")).toBe(2 * 80 + 16);
    expect(screen.getByTestId("help").getBoundingClientRect().top).toBe(
      screen.getByTestId("product").getBoundingClientRect().top,
    );
  });

  it("makes every link at least 24px tall", () => {
    footer(1256);
    for (const link of screen.getAllByRole("link")) {
      expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    }
  });
});
