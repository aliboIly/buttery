import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, within } from "@testing-library/react";
import { Download, Plus, Upload } from "lucide-react";
import { createRef } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { TagChip } from "../../components/tag-chip/TagChip.tsx";
import { AppShell } from "../app-shell/AppShell.tsx";
import { PageHeader } from "../page-header/PageHeader.tsx";
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
          onNavigate={onNavigate}
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

  it("keeps its filters above the catalog beside a narrow shell's icon rail, however wide the column", () => {
    inShell(1099, <AddOns />);
    expect(
      box(screen.getByRole("region", { name: "Featured" })).top,
    ).toBeGreaterThan(
      box(screen.getByRole("complementary", { name: "Filters" })).bottom,
    );
    cleanup();
    inShell(1140, <AddOns />);
    expect(box(screen.getByRole("region", { name: "Featured" })).left).toBe(
      box(screen.getByRole("complementary", { name: "Filters" })).right + 32,
    );
  });

  it("folds its header's actions on a phone without running them over its title, and shows only the crumb one level up", async () => {
    inShell(
      390,
      <CatalogPage
        title="Add-ons"
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Settings", href: "#settings" },
              { label: "Roastery", href: "#roastery" },
            ]}
          />
        }
        actions={
          <>
            <PageHeader.Action
              icon={Upload}
              label="Import"
              onSelect={() => undefined}
            />
            <PageHeader.Action
              icon={Download}
              label="Export"
              onSelect={() => undefined}
            />
            <PageHeader.Action
              variant="primary"
              icon={Plus}
              label="Request an add-on"
              priority={1}
              onSelect={() => undefined}
            />
          </>
        }
      />,
    );
    await screen.findByRole("button", { name: "More page actions" });
    const title = box(screen.getByRole("heading", { level: 1 }));
    for (const name of ["Import", "Export"])
      expect(screen.queryByRole("button", { name })).toBeNull();
    for (const button of screen.getAllByRole("button")) {
      const shown = button.getBoundingClientRect();
      if (shown.width === 0 || shown.top >= title.bottom) continue;
      expect(shown.left).toBeGreaterThanOrEqual(title.right);
    }
    const folded = document.querySelectorAll(
      '.bt-page-header [data-bt-part="item"][hidden]',
    );
    expect(folded.length).toBeGreaterThan(0);
    for (const item of folded) expect(item.getClientRects()).toHaveLength(0);
    const [settings, roastery] = screen.getAllByRole("link", { hidden: true });
    expect(settings?.getClientRects()).toHaveLength(0);
    expect(roastery?.getClientRects().length).toBeGreaterThan(0);
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
    await userEvent.click(screen.getByRole("link", { name: "Label printing" }));
    expect(onNavigate).toHaveBeenLastCalledWith("#labels", expect.anything());
  });

  it("leaves a click for a new tab to the browser", async () => {
    const onNavigate = vi.fn();
    inShell(1440, <AddOns onNavigate={onNavigate} />);
    for (const name of ["Shipping", "Label printing"]) {
      const link = screen.getByRole("link", { name });
      link.addEventListener("click", (event) => {
        event.preventDefault();
      });
      await userEvent.keyboard("{Meta>}");
      await userEvent.click(link);
      await userEvent.keyboard("{/Meta}");
    }
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("passes each part its ref, class and other props", () => {
    const refs = {
      categories: createRef<HTMLElement>(),
      group: createRef<HTMLElement>(),
      featured: createRef<HTMLElement>(),
      section: createRef<HTMLElement>(),
      item: createRef<HTMLElement>(),
    };
    render(
      <>
        <CatalogPage.Categories
          ref={refs.categories}
          categories={[]}
          className="custom"
          data-testid="categories"
        />
        <CatalogPage.Group
          ref={refs.group}
          title="Filter"
          className="custom"
          data-testid="group"
        />
        <CatalogPage.Featured
          ref={refs.featured}
          title="Featured"
          className="custom"
          data-testid="featured"
        />
        <CatalogPage.Section
          ref={refs.section}
          title="Shipping"
          className="custom"
          data-testid="section"
        />
        <CatalogPage.Item
          ref={refs.item}
          title="Rates by region"
          href="#rates"
          className="custom"
          data-testid="item"
        />
      </>,
    );
    for (const [name, ref] of Object.entries(refs)) {
      expect(ref.current).toBe(screen.getByTestId(name));
      expect(ref.current?.className).toBe("custom");
    }
  });
});
