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

  it("ends the page with a footer under a hairline, and gives a section a description under its heading", () => {
    inShell(
      1280,
      <AppPage
        header={<h1>Pickup</h1>}
        footer={<a href="#feedback">Share feedback</a>}
      >
        <AppPage.Section
          title="Hours"
          description="When customers can collect."
          actions={<button type="button">Edit</button>}
        >
          <p>Weekdays 8–4</p>
        </AppPage.Section>
      </AppPage>,
    );
    const footer = box("footer");
    const main = box("main");
    expect(footer.top).toBeGreaterThanOrEqual(main.bottom);
    const part = document.querySelector<HTMLElement>('[data-bt-part="footer"]');
    expect(part?.tagName).toBe("FOOTER");
    if (!part) throw new Error("No footer.");
    expect(getComputedStyle(part).borderTopWidth).toBe("1px");
    expect(footer.width).toBe(box("frame").width - 64);
    const link = screen.getByRole("link", { name: "Share feedback" });
    expect(getComputedStyle(link).color).toBe(getComputedStyle(part).color);
    expect(link.getBoundingClientRect().height).toBe(24);
    const heading = screen
      .getByRole("heading", { level: 2, name: "Hours" })
      .getBoundingClientRect();
    const description = screen
      .getByText("When customers can collect.")
      .getBoundingClientRect();
    expect(description.top - heading.bottom).toBe(4);
    expect(
      screen.getByRole("button", { name: "Edit" }).getBoundingClientRect().top,
    ).toBe(heading.top);
  });

  it("keeps a settings page at most 960px and a dense form at most 820px, centered", () => {
    inShell(1728, <AppPage width="medium" header={<h1>Pickup</h1>} />);
    expect(box("frame").width).toBe(960);
    cleanup();
    inShell(1728, <AppPage width="narrow" header={<h1>Notifications</h1>} />);
    const frame = box("frame");
    const area = column();
    expect(frame.width).toBe(820);
    expect(
      Math.abs(frame.left - area.left - (area.right - frame.right)),
    ).toBeLessThan(1);
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

  it("sets its right rail beside the page from 1040px of column, and under it below that", () => {
    inShell(1280, <Orders aside={<p>Details</p>} />);
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

  it("starts each page at the top of the shell's page region", () => {
    const tall = (title: string): ReactElement => (
      <AppPage key={title} header={<h1>{title}</h1>}>
        <AppPage.Section>
          <div style={{ minBlockSize: "2000px" }}>Rows</div>
        </AppPage.Section>
      </AppPage>
    );
    const shell = (page: ReactNode): ReactElement => (
      <div style={{ inlineSize: "1440px", blockSize: "700px" }}>
        <AppShell layout="sidebar" sidebar={<nav aria-label="Main">Nav</nav>}>
          {page}
        </AppShell>
      </div>
    );
    const { rerender } = render(shell(tall("Orders")));
    const region = document.querySelector(
      '[data-bt="AppShell"] [data-bt-part="page"]',
    );
    if (!region) throw new Error("No page region.");
    region.scrollTop = 900;
    expect(region.scrollTop).toBe(900);
    rerender(shell(tall("Orders")));
    expect(region.scrollTop).toBe(900);
    rerender(shell(tall("Customers")));
    expect(region.scrollTop).toBe(0);
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
