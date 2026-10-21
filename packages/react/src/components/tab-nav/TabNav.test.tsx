import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import type { MouseEvent, ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TabNav } from "./TabNav.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const VIEWS = ["All", "Open", "Shipped", "Refunded", "Disputed", "Archived"];

function Views({
  current = "All",
  width = 800,
  onFollow = () => undefined,
}: {
  readonly current?: string;
  readonly width?: number;
  readonly onFollow?: (view: string) => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <TabNav label="Order views">
        {VIEWS.map((view) => (
          <TabNav.Link
            key={view}
            href={`#${view.toLowerCase()}`}
            current={view === current}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault();
              onFollow(view);
            }}
          >
            {view}
          </TabNav.Link>
        ))}
      </TabNav>
    </div>
  );
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("TabNav", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <TabNav ref={ref} label="Views" className="custom" data-testid="nav">
        <TabNav.Link href="#a">A</TabNav.Link>
      </TabNav>,
    );
    expect(ref.current?.dataset["bt"]).toBe("TabNav");
    expect(ref.current?.dataset["testid"]).toBe("nav");
    expect(ref.current?.className).toBe("bt-tab-nav custom");
  });

  it("is a navigation named by its label that marks the page shown, underlined", async () => {
    render(<Views current="Shipped" />);
    expect(
      screen.getByRole("navigation", { name: "Order views" }),
    ).toBeTruthy();
    const shipped = screen.getByRole("link", { name: "Shipped" });
    expect(shipped.getAttribute("aria-current")).toBe("page");
    expect(
      screen.getByRole("link", { name: "All" }).hasAttribute("aria-current"),
    ).toBe(false);
    await settled();
    const underline = shipped.querySelector('[data-bt-part="indicator"]');
    expect(underline?.getBoundingClientRect().width).toBe(
      shipped.getBoundingClientRect().width,
    );
  });

  it("moves the underline when another page becomes current", async () => {
    const { rerender } = render(<Views current="All" />);
    await settled();
    rerender(<Views current="Refunded" />);
    await settled();
    const refunded = screen.getByRole("link", { name: "Refunded" });
    expect(refunded.querySelector('[data-bt-part="indicator"]')).not.toBeNull();
    expect(
      screen
        .getByRole("link", { name: "All" })
        .querySelector('[data-bt-part="indicator"]'),
    ).toBeNull();
  });

  it("folds the links that don't fit into a menu that follows them", async () => {
    const onFollow = vi.fn();
    render(<Views width={300} onFollow={onFollow} />);
    const more = await screen.findByRole("button", { name: "More pages" });
    await userEvent.click(more);
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Archived" }),
    );
    expect(onFollow).toHaveBeenCalledWith("Archived");
  });

  it("puts its look on a router's own link with asChild", () => {
    render(
      <TabNav label="Views">
        <TabNav.Link asChild current label="Mine">
          <a href="#mine" data-router="">
            Mine
          </a>
        </TabNav.Link>
      </TabNav>,
    );
    const link = screen.getByRole("link", { name: "Mine" });
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.className).toContain("bt-tab");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("keeps the current page's link in a narrow row", async () => {
    render(<Views width={300} current="Archived" />);
    await screen.findByRole("button", { name: "More pages" });
    expect(
      screen
        .getByRole("link", { name: "Archived" })
        .getAttribute("aria-current"),
    ).toBe("page");
  });
});
