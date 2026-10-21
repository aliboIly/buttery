import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "../app-shell/AppShell.tsx";
import { AppPage } from "./AppPage.tsx";

afterEach(cleanup);

function inShell(width: number, page: ReactNode): void {
  render(
    <div style={{ inlineSize: `${String(width)}px`, blockSize: "700px" }}>
      <AppShell layout="sidebar" sidebar={<nav aria-label="Main">Nav</nav>}>
        {page}
      </AppShell>
    </div>,
  );
}

function box(part: string): DOMRect {
  const element = document.querySelector(
    `[data-bt="AppPage"] [data-bt-part="${part}"]`,
  );
  if (!element) throw new Error(`No ${part}.`);
  return element.getBoundingClientRect();
}

function column(): DOMRect {
  const element = document.querySelector(
    '[data-bt="AppShell"] [data-bt-part="column"]',
  );
  if (!element) throw new Error("No column.");
  return element.getBoundingClientRect();
}

function Orders({
  aside,
  fill = false,
}: {
  readonly aside?: ReactNode;
  readonly fill?: boolean;
}): ReactElement {
  return (
    <AppPage
      header={<h1>Orders</h1>}
      aside={aside}
      asideLabel="Order details"
      fill={fill}
    >
      <AppPage.Section
        title="Today"
        actions={<button type="button">See all</button>}
      >
        <p>Rows</p>
      </AppPage.Section>
      <AppPage.Section title="This week">
        <div data-testid="last" style={{ minBlockSize: "40px" }}>
          Rows
        </div>
      </AppPage.Section>
    </AppPage>
  );
}

describe("AppPage", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(<AppPage ref={ref} className="custom" data-testid="page" />);
    expect(ref.current?.tagName).toBe("MAIN");
    expect(ref.current?.dataset["bt"]).toBe("AppPage");
    expect(ref.current?.dataset["testid"]).toBe("page");
    expect(ref.current?.className).toBe("bt-app-page custom");
  });

  it("keeps a contained page at most 1280px with its padding, centered in the column, padded 32", () => {
    inShell(1728, <Orders />);
    const frame = box("frame");
    const area = column();
    expect(frame.width).toBe(1280);
    expect(
      Math.abs(frame.left - area.left - (area.right - frame.right)),
    ).toBeLessThan(1);
    expect(box("header").left - frame.left).toBe(32);
  });

  it("fills the column when full, padded 24 in a narrower column and 16 on a phone", () => {
    inShell(1100, <AppPage width="full" header={<h1>Orders</h1>} />);
    expect(box("frame").width).toBe(column().width);
    cleanup();
    inShell(900, <AppPage header={<h1>Orders</h1>} />);
    expect(box("header").left - box("frame").left).toBe(24);
    cleanup();
    inShell(500, <AppPage header={<h1>Orders</h1>} />);
    expect(box("header").left - box("frame").left).toBe(16);
  });

  it("puts its sections 24px under the header and 32px apart, each named by its title-md heading", () => {
    inShell(1440, <Orders />);
    const sections = screen.getAllByRole("region");
    const [today, week] = sections;
    if (!today || !week) throw new Error("No sections.");
    expect(screen.getByRole("region", { name: "Today" })).toBe(today);
    expect(
      getComputedStyle(screen.getByRole("heading", { level: 2, name: "Today" }))
        .fontSize,
    ).toBe("18px");
    expect(today.getBoundingClientRect().top - box("header").bottom).toBe(24);
    expect(
      week.getBoundingClientRect().top - today.getBoundingClientRect().bottom,
    ).toBe(32);
  });

  it("sets its right rail beside the page from 1280px of shell, and under it below that", () => {
    inShell(1440, <Orders aside={<p>Details</p>} />);
    const rail = screen.getByRole("complementary", { name: "Order details" });
    expect(rail.getBoundingClientRect().width).toBe(320);
    expect(rail.getBoundingClientRect().left - box("main").right).toBe(32);
    cleanup();
    inShell(1100, <Orders aside={<p>Details</p>} />);
    expect(
      screen
        .getByRole("complementary", { name: "Order details" })
        .getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(box("main").bottom);
  });

  it("gives its last block the rest of the height when filled", () => {
    inShell(1440, <Orders fill />);
    const page = document.querySelector(
      '[data-bt="AppShell"] [data-bt-part="page"]',
    );
    const last = screen.getByTestId("last").closest("section");
    if (!page || !last) throw new Error("No page or section.");
    expect(Math.round(last.getBoundingClientRect().bottom)).toBe(
      Math.round(page.getBoundingClientRect().bottom - 24),
    );
    expect(page.scrollHeight).toBe(page.clientHeight);
  });

  it("styles only its own parts, not parts with the same names inside its blocks", () => {
    render(
      <AppPage fill>
        <AppPage.Section>
          <div data-bt-part="body" data-testid="inner-body">
            <div data-bt-part="main" data-testid="inner-main" />
          </div>
        </AppPage.Section>
      </AppPage>,
    );
    expect(getComputedStyle(screen.getByTestId("inner-body")).display).toBe(
      "block",
    );
    expect(getComputedStyle(screen.getByTestId("inner-main")).display).toBe(
      "block",
    );
  });
});
