import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ChartLine, House, Receipt, Settings } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../app-shell/AppShell.tsx";
import { Sidebar } from "./Sidebar.tsx";

beforeEach(() => {
  publishSettled();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function Nav({
  current = "/",
  storageKey,
  onNavigate,
}: {
  readonly current?: string;
  readonly storageKey?: string;
  readonly onNavigate?: (href: string) => void;
}): ReactElement {
  return (
    <Sidebar
      label="Main"
      storageKey={storageKey}
      onNavigate={(href, event) => {
        event.preventDefault();
        onNavigate?.(href);
      }}
    >
      <Sidebar.Item
        icon={House}
        label="Home"
        href="/"
        current={current === "/"}
      />
      <Sidebar.Item
        icon={Receipt}
        label="Orders"
        href="/orders"
        current={current === "/orders"}
      />
      <Sidebar.Recent />
      <Sidebar.Section title="Shop">
        <Sidebar.Item
          icon={Settings}
          label="Settings"
          href="/settings"
          current={current === "/settings"}
        />
      </Sidebar.Section>
      <Sidebar.Group icon={ChartLine} label="Reports">
        <Sidebar.Item
          label="Revenue"
          href="/reports/revenue"
          current={current === "/reports/revenue"}
        />
        <Sidebar.Item
          label="Customers"
          href="/reports/customers"
          current={current === "/reports/customers"}
        />
        <Sidebar.Item
          label="Beans"
          href="/reports/beans"
          current={current === "/reports/beans"}
        />
        <Sidebar.Item
          label="Payouts"
          href="/reports/payouts"
          current={current === "/reports/payouts"}
        />
        <Sidebar.Item
          label="Refunds"
          href="/reports/refunds"
          current={current === "/reports/refunds"}
        />
      </Sidebar.Group>
    </Sidebar>
  );
}

function shell(width: number, children: ReactElement): void {
  render(
    <div style={{ inlineSize: `${String(width)}px`, blockSize: "600px" }}>
      <AppShell layout="sidebar" sidebar={children}>
        <p>Page</p>
      </AppShell>
    </div>,
  );
}

describe("Sidebar", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(<Sidebar ref={ref} className="custom" data-testid="sidebar" />);
    expect(ref.current?.dataset["bt"]).toBe("Sidebar");
    expect(ref.current?.dataset["testid"]).toBe("sidebar");
    expect(ref.current?.className).toBe("bt-sidebar custom");
  });

  it("is a navigation named Main whose items are 28px links, the current page marked", () => {
    render(<Nav current="/orders" />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const orders = within(nav).getByRole("link", { name: "Orders" });
    expect(orders.getAttribute("aria-current")).toBe("page");
    expect(orders.getBoundingClientRect().height).toBe(28);
    expect(
      within(nav)
        .getByRole("link", { name: "Home" })
        .hasAttribute("aria-current"),
    ).toBe(false);
    expect(screen.getByRole("group", { name: "Shop" })).toBeTruthy();
  });

  it("folds a group from its header, open at first when it holds the page shown, and remembers", async () => {
    const { unmount } = render(
      <Nav current="/reports/beans" storageKey="studio" />,
    );
    const header = screen.getByRole("button", { name: "Reports" });
    expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(
      within(screen.getByRole("group", { name: "Reports" }))
        .getByRole("link", { name: "Beans" })
        .getAttribute("aria-current"),
    ).toBe("page");
    await userEvent.click(header);
    expect(header.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "Revenue" })).toBeNull();
    });
    unmount();
    render(<Nav current="/reports/beans" storageKey="studio" />);
    expect(
      screen
        .getByRole("button", { name: "Reports" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("lists the pages visited inside groups under Recent, newest first, four at most, and remembers them", () => {
    const pages = [
      "/reports/revenue",
      "/reports/customers",
      "/reports/beans",
      "/reports/payouts",
      "/reports/refunds",
    ];
    const { rerender, unmount } = render(
      <Nav current="/" storageKey="studio" />,
    );
    expect(screen.queryByRole("group", { name: "Recent" })).toBeNull();
    for (const page of pages)
      rerender(<Nav current={page} storageKey="studio" />);
    rerender(<Nav current="/orders" storageKey="studio" />);
    const recent = screen.getByRole("group", { name: "Recent" });
    expect(
      within(recent)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Refunds", "Payouts", "Beans", "Customers"]);
    unmount();
    render(<Nav current="/" storageKey="studio" />);
    expect(
      within(screen.getByRole("group", { name: "Recent" })).getAllByRole(
        "link",
      ),
    ).toHaveLength(4);
  });

  it("hands a chosen item's href to onNavigate, and leaves a click for a new tab alone", async () => {
    const onNavigate = vi.fn();
    render(<Nav onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("link", { name: "Orders" }));
    expect(onNavigate).toHaveBeenCalledWith("/orders");
    const settings = screen.getByRole("link", { name: "Settings" });
    settings.addEventListener("click", (event) => {
      event.preventDefault();
    });
    await userEvent.keyboard("{Meta>}");
    await userEvent.click(settings);
    await userEvent.keyboard("{/Meta}");
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("becomes an icon rail in a narrower shell: tooltips for names, dividers for headings, groups in flyouts", async () => {
    shell(900, <Nav current="/orders" />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.dataset["mode"]).toBe("rail");
    const orders = within(nav).getByRole("link", { name: "Orders" });
    expect(orders.querySelector('[data-bt-part="label"]')).toBeNull();
    expect(
      nav.closest('[data-bt-part="sidebar"]')?.getBoundingClientRect().width,
    ).toBe(56);
    const icon = orders.querySelector("svg")?.getBoundingClientRect();
    const box = orders.getBoundingClientRect();
    expect(
      Math.abs((icon?.left ?? 0) + 8 - (box.left + box.width / 2)),
    ).toBeLessThan(1);
    expect(nav.querySelector('[data-bt-part="divider"]')).not.toBeNull();
    await userEvent.click(within(nav).getByRole("button", { name: "Reports" }));
    const flyout = await screen.findByRole("menu", { name: "Reports" });
    expect(
      within(flyout)
        .getByRole("menuitem", { name: "Revenue" })
        .getAttribute("href"),
    ).toBe("/reports/revenue");
  });
});
