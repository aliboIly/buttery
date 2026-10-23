import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Footer } from "./Footer.tsx";

afterEach(cleanup);

function footer(width: number, layout?: "centered" | "simple"): void {
  render(
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Footer
        layout={layout}
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

  it("centers the brand, the columns and their links, and the small print when centered", () => {
    footer(1256, "centered");
    const content = screen
      .getByRole("contentinfo")
      .querySelector('[data-bt-part="footer-body"]')
      ?.getBoundingClientRect();
    if (!content) throw new Error("no footer body");
    const middle = content.left + content.width / 2;
    const centerOf = (box: DOMRect): number => box.left + box.width / 2;
    const brand = screen.getByTestId("brand");
    const range = document.createRange();
    range.selectNodeContents(brand);
    expect(
      Math.abs(centerOf(range.getBoundingClientRect()) - middle),
    ).toBeLessThan(1);
    const product = screen.getByTestId("product").getBoundingClientRect();
    const help = screen.getByTestId("help").getBoundingClientRect();
    expect(product.top).toBe(help.top);
    expect(
      Math.abs(middle - product.left - (help.right - middle)),
    ).toBeLessThan(1);
    const features = screen
      .getByRole("link", { name: "Features" })
      .getBoundingClientRect();
    expect(Math.abs(centerOf(features) - centerOf(product))).toBeLessThan(1);
    const terms = screen
      .getByRole("link", { name: "Terms" })
      .closest('[data-bt-part="legal"]');
    if (!terms) throw new Error("no small print");
    expect(terms.getBoundingClientRect().width).toBe(content.width);
    const print = terms.firstElementChild?.getBoundingClientRect();
    expect(Math.abs(centerOf(print ?? content) - middle)).toBeLessThan(1);
  });

  it("runs every column's links in one row with the small print at its end when simple, the headings for screen readers only", () => {
    footer(1256, "simple");
    const landmark = screen.getByRole("contentinfo");
    expect(
      within(landmark).getByRole("list", { name: "Product" }),
    ).toBeTruthy();
    const heading = within(landmark).getByRole("heading", {
      level: 2,
      name: "Help",
    });
    expect(heading.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    const links = ["Features", "Export", "Guides"].map((name) =>
      screen.getByRole("link", { name }).getBoundingClientRect(),
    );
    for (const link of links) expect(link.top).toBe(links[0]?.top);
    const legal = landmark
      .querySelector('[data-bt-part="legal"]')
      ?.getBoundingClientRect();
    const body = landmark
      .querySelector('[data-bt-part="footer-body"]')
      ?.getBoundingClientRect();
    expect(legal?.right).toBe(body?.right);
    expect(Math.abs((legal?.top ?? 0) - (links[0]?.top ?? 0))).toBeLessThan(
      Math.max(legal?.height ?? 0, links[0]?.height ?? 0),
    );
    expect(getComputedStyle(landmark).paddingTop).toBe("32px");
  });

  it("keeps a simple footer's links in a row and puts its small print under them under 640px", () => {
    footer(400, "simple");
    const landmark = screen.getByRole("contentinfo");
    const legal = landmark
      .querySelector('[data-bt-part="legal"]')
      ?.getBoundingClientRect();
    const links = ["Features", "Export", "Guides"].map((name) =>
      screen.getByRole("link", { name }).getBoundingClientRect(),
    );
    for (const link of links) expect(link.top).toBe(links[0]?.top);
    expect(legal?.top).toBeGreaterThan(links[0]?.bottom ?? 0);
  });

  it("makes every link at least 24px tall", () => {
    footer(1256);
    for (const link of screen.getAllByRole("link")) {
      expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    }
  });
});
