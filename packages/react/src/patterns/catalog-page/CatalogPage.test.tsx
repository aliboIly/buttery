import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { TagChip } from "../../components/tag-chip/TagChip.tsx";
import { AppShell } from "../app-shell/AppShell.tsx";
import { CatalogPage } from "./CatalogPage.tsx";

afterEach(cleanup);

function inShell(width: number, page: ReactNode): void {
  render(
    <div style={{ inlineSize: `${String(width)}px`, blockSize: "800px" }}>
      <AppShell layout="sidebar" sidebar={<nav aria-label="Main" />}>
        {page}
      </AppShell>
    </div>,
  );
}

function AddOns({
  onNavigate,
}: {
  readonly onNavigate?: (
    href: string,
    event: { preventDefault: () => void },
  ) => void;
}): ReactNode {
  return (
    <CatalogPage
      title="Add-ons"
      description="Tools that work with the roastery."
      filters={
        <>
          <CatalogPage.Categories
            categories={[
              { label: "Featured", href: "#featured" },
              { label: "Shipping", href: "#shipping" },
            ]}
            current="#featured"
            onNavigate={onNavigate}
          />
          <CatalogPage.Group title="Filter">
            <p>Free trial</p>
          </CatalogPage.Group>
        </>
      }
    >
      <CatalogPage.Featured title="Featured">
        <CatalogPage.Item
          title="Label printing"
          href="#labels"
          description="Print shipping labels at the counter."
          note="First month free"
          tags={<TagChip tone="info">New</TagChip>}
        />
        <CatalogPage.Item
          title="Bookkeeping"
          href="#books"
          description="Sales and payouts in your books every night."
        />
      </CatalogPage.Featured>
      <CatalogPage.Section title="Shipping">
        <CatalogPage.Item title="Rates by region" href="#rates" />
      </CatalogPage.Section>
    </CatalogPage>
  );
}

function box(element: Element | null): DOMRect {
  if (!element) throw new Error("Not there.");
  return element.getBoundingClientRect();
}

describe("CatalogPage", () => {
  it("is the page's main landmark, stamped CatalogPage, taking the ref, class and other props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <CatalogPage
        ref={ref}
        title="Add-ons"
        className="custom"
        data-testid="catalog"
      />,
    );
    const main = screen.getByRole("main");
    expect(ref.current).toBe(main);
    expect(main.dataset["bt"]).toBe("CatalogPage");
    expect(main.dataset["testid"]).toBe("catalog");
    expect(main.className).toBe("bt-app-page bt-catalog-page custom");
  });

  it("puts a filter column 220 wide beside the catalog from 900px of column, and above it below that", () => {
    inShell(1440, <AddOns />);
    const filters = box(screen.getByRole("complementary", { name: "Filters" }));
    const featured = box(screen.getByRole("region", { name: "Featured" }));
    expect(filters.width).toBe(220);
    expect(featured.left - filters.right).toBe(32);
    cleanup();
    inShell(800, <AddOns />);
    expect(
      box(screen.getByRole("region", { name: "Featured" })).top,
    ).toBeGreaterThan(
      box(screen.getByRole("complementary", { name: "Filters" })).bottom,
    );
  });

  it("marks the category shown as the current page", () => {
    inShell(1440, <AddOns />);
    const nav = screen.getByRole("navigation", { name: "Categories" });
    expect(
      within(nav)
        .getByRole("link", { name: "Featured" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      within(nav)
        .getByRole("link", { name: "Shipping" })
        .hasAttribute("aria-current"),
    ).toBe(false);
  });

  it("tints the featured block and lays its items in two columns with room", () => {
    inShell(1440, <AddOns />);
    const featured = screen.getByRole("region", { name: "Featured" });
    const tint = document.createElement("span");
    tint.style.backgroundColor = "var(--bt-bg-section)";
    document.body.append(tint);
    expect(getComputedStyle(featured).backgroundColor).toBe(
      getComputedStyle(tint).backgroundColor,
    );
    tint.remove();
    const [labels, books] = within(featured).getAllByRole("article");
    if (!labels || !books) throw new Error("No items.");
    expect(box(books).top).toBe(box(labels).top);
    expect(box(books).left).toBeGreaterThan(box(labels).right);
  });

  it("links each item's title to its page, its offer in italics and its tags under it", async () => {
    const onNavigate = vi.fn(
      (_href: string, event: { preventDefault: () => void }) => {
        event.preventDefault();
      },
    );
    inShell(1440, <AddOns onNavigate={onNavigate} />);
    const item = screen.getAllByRole("article")[0];
    if (!item) throw new Error("No item.");
    expect(
      getComputedStyle(within(item).getByText("First month free")).fontStyle,
    ).toBe("italic");
    expect(box(within(item).getByText("New")).top).toBeGreaterThan(
      box(within(item).getByText("First month free")).bottom,
    );
    await userEvent.click(screen.getByRole("link", { name: "Shipping" }));
    expect(onNavigate).toHaveBeenCalledWith("#shipping", expect.anything());
  });
});
