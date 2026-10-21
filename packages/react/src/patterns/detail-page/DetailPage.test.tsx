import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { AppShell } from "../app-shell/AppShell.tsx";
import { DetailPage } from "./DetailPage.tsx";

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

function PriceList({
  onNavigate,
}: {
  readonly onNavigate?: (
    href: string,
    event: { preventDefault: () => void },
  ) => void;
}): ReactNode {
  return (
    <DetailPage
      title="Café price list"
      description="Wholesale, by the 5 kg bag"
      action={<Button variant="primary">Send to cafés</Button>}
      aside={
        <>
          <DetailPage.Links
            title="In this list"
            links={[
              { label: "Single origins", href: "#origins" },
              { label: "Blends", href: "#blends" },
            ]}
            onNavigate={onNavigate}
          />
          <DetailPage.Links
            title="Resources"
            links={[{ label: "How prices are set", href: "#prices" }]}
          />
        </>
      }
    >
      <p data-testid="main">Nyeri AA, $18.40 a kilo.</p>
    </DetailPage>
  );
}

function box(element: Element | null): DOMRect {
  if (!element) throw new Error("Not there.");
  return element.getBoundingClientRect();
}

describe("DetailPage", () => {
  it("is the page's main landmark, stamped DetailPage, taking the ref, class and other props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <DetailPage
        ref={ref}
        title="Café price list"
        className="custom"
        data-testid="detail"
      />,
    );
    const main = screen.getByRole("main");
    expect(ref.current).toBe(main);
    expect(main.dataset["bt"]).toBe("DetailPage");
    expect(main.dataset["testid"]).toBe("detail");
    expect(main.className).toBe("bt-app-page bt-detail-page custom");
  });

  it("puts the aside 320 wide beside the main column from 1100px of column, its action full width", () => {
    inShell(1440, <PriceList />);
    const aside = screen.getByRole("complementary", { name: "Details" });
    const main = box(screen.getByTestId("main"));
    expect(box(aside).width).toBe(320);
    expect(box(aside).left - main.right).toBe(32);
    expect(
      box(screen.getByRole("button", { name: "Send to cafés" })).width,
    ).toBe(320);
  });

  it("puts the aside under the main column below 1100px of column", () => {
    inShell(1000, <PriceList />);
    const aside = box(screen.getByRole("complementary", { name: "Details" }));
    expect(aside.top).toBeGreaterThan(box(screen.getByTestId("main")).bottom);
  });

  it("draws a hairline under its header and titles each list of links", () => {
    inShell(1440, <PriceList />);
    const header = document.querySelector<HTMLElement>(
      '[data-bt="DetailPage"] [data-bt-part="header"]',
    );
    if (!header) throw new Error("No header.");
    expect(getComputedStyle(header).borderBottomWidth).toBe("1px");
    const list = screen.getByRole("region", { name: "In this list" });
    expect(
      within(list)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Single origins", "Blends"]);
    for (const link of within(list).getAllByRole("link"))
      expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  });

  it("lets a router take over a link", async () => {
    const onNavigate = vi.fn(
      (_href: string, event: { preventDefault: () => void }) => {
        event.preventDefault();
      },
    );
    inShell(1440, <PriceList onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("link", { name: "Blends" }));
    expect(onNavigate).toHaveBeenCalledWith("#blends", expect.anything());
  });
});
