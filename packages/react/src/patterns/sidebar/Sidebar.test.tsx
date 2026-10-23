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
import { AccountMenu } from "../account-menu/AccountMenu.tsx";
import { AppShell } from "../app-shell/AppShell.tsx";
import { TopBar } from "../top-bar/TopBar.tsx";
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
      <AppShell layout="sidebar" sidebar={children} topBar={<TopBar />}>
        <p>Page</p>
      </AppShell>
    </div>,
  );
}

function Shop({
  width,
  current,
}: {
  readonly width: number;
  readonly current: string;
}): ReactElement {
  return (
    <div
      data-testid="frame"
      style={{ inlineSize: `${String(width)}px`, blockSize: "600px" }}
    >
      <AppShell
        layout="sidebar"
        sidebar={<Nav current={current} />}
        topBar={<TopBar />}
      >
        <p>Page</p>
      </AppShell>
    </div>
  );
}

function recentPages(): string[] {
  const recent = screen.queryByRole("group", { name: "Recent" });
  if (!recent) return [];
  return within(recent)
    .getAllByRole("link")
    .map((link) => link.textContent);
}

function background(color: string): string {
  const probe = document.createElement("div");
  probe.style.backgroundColor = color;
  document.body.append(probe);
  const computed = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return computed;
}

describe("Sidebar", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(<Sidebar ref={ref} className="custom" data-testid="sidebar" />);
    expect(ref.current?.dataset["bt"]).toBe("Sidebar");
    expect(ref.current?.dataset["testid"]).toBe("sidebar");
    expect(ref.current?.className).toBe("bt-sidebar custom");
  });

  it("keeps the wheel in its list only while the list scrolls, so a column that scrolls it still can", async () => {
    const list = (): HTMLElement => {
      const element = document.querySelector<HTMLElement>(
        '.bt-sidebar > [data-bt-part="nav"]',
      );
      if (!element) throw new Error("No list.");
      return element;
    };
    const { unmount } = render(
      <div style={{ blockSize: "120px" }}>
        <Nav />
      </div>,
    );
    await waitFor(() => {
      expect(getComputedStyle(list()).overscrollBehaviorY).toBe("contain");
    });
    unmount();
    render(
      <div style={{ blockSize: "120px", overflowY: "auto" }}>
        <div>
          <Nav />
        </div>
      </div>,
    );
    await waitFor(() => {
      expect(getComputedStyle(list()).overscrollBehaviorY).toBe("auto");
    });
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

  it("records the page shown inside a group someone closed", async () => {
    const { rerender } = render(<Nav current="/reports/revenue" />);
    await userEvent.click(screen.getByRole("button", { name: "Reports" }));
    await waitFor(() => {
      expect(screen.queryByRole("group", { name: "Reports" })).toBeNull();
    });
    rerender(<Nav current="/reports/beans" />);
    rerender(<Nav current="/orders" />);
    expect(recentPages()).toEqual(["Beans", "Revenue"]);
  });

  it("records pages opened from a rail's flyouts, and leaves Recent out of the rail", async () => {
    const { rerender } = render(
      <Shop width={1280} current="/reports/payouts" />,
    );
    expect(recentPages()).toEqual(["Payouts"]);
    expect(document.querySelector(".lucide-clock")).not.toBeNull();
    rerender(<Shop width={900} current="/reports/payouts" />);
    const frame = screen.getByTestId("frame");
    frame.style.inlineSize = "900px";
    const nav = screen.getByRole("navigation", { name: "Main" });
    await waitFor(() => {
      expect(nav.dataset["mode"]).toBe("rail");
    });
    expect(recentPages()).toEqual([]);
    expect(nav.querySelector(".lucide-clock")).toBeNull();
    rerender(<Shop width={900} current="/reports/revenue" />);
    rerender(<Shop width={900} current="/reports/beans" />);
    frame.style.inlineSize = "1280px";
    await waitFor(() => {
      expect(nav.dataset["mode"]).toBe("full");
    });
    expect(recentPages()).toEqual(["Beans", "Revenue", "Payouts"]);
  });

  it("records pages on a phone while its sheet is closed, and keeps its groups across the sheet without a storageKey", async () => {
    const { rerender } = render(<Shop width={500} current="/" />);
    rerender(<Shop width={500} current="/reports/revenue" />);
    rerender(<Shop width={500} current="/reports/beans" />);
    const open = screen.getByRole("button", { name: "Open navigation" });
    await userEvent.click(open);
    const sheet = await screen.findByRole("dialog", { name: "Navigation" });
    expect(recentPages()).toEqual(["Beans", "Revenue"]);
    const reports = within(sheet).getByRole("button", { name: "Reports" });
    expect(reports.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(reports);
    expect(reports.getAttribute("aria-expanded")).toBe("false");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await userEvent.click(open);
    const again = await screen.findByRole("dialog", { name: "Navigation" });
    expect(
      within(again)
        .getByRole("button", { name: "Reports" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("marks a rail's group with the current state while it holds the page shown", () => {
    shell(900, <Nav current="/reports/beans" />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const reports = within(nav).getByRole("button", { name: "Reports" });
    expect(reports.getAttribute("aria-current")).toBe("true");
    expect(getComputedStyle(reports).backgroundColor).toBe(
      background("var(--bt-bg-control)"),
    );
    expect(
      within(nav)
        .getByRole("link", { name: "Home" })
        .hasAttribute("aria-current"),
    ).toBe(false);
  });

  it("records an item wrapped in a component of the app's own once it's shown", () => {
    function NavItem({
      page,
      at,
    }: {
      readonly page: string;
      readonly at: string;
    }): ReactElement {
      return (
        <Sidebar.Item
          label={page}
          href={`/reports/${page.toLowerCase()}`}
          current={at === page}
        />
      );
    }
    const Wrapped = ({ at }: { readonly at: string }): ReactElement => (
      <Sidebar label="Main">
        <Sidebar.Recent />
        <Sidebar.Group label="Reports" defaultOpen>
          <NavItem page="Revenue" at={at} />
          <NavItem page="Beans" at={at} />
        </Sidebar.Group>
      </Sidebar>
    );
    const { rerender } = render(<Wrapped at="Revenue" />);
    rerender(<Wrapped at="Beans" />);
    expect(recentPages()).toEqual(["Beans", "Revenue"]);
  });

  it("draws nothing out of sight under 640px, so a menu open in the rail closes as the shell narrows", async () => {
    render(
      <div
        data-testid="frame"
        style={{ inlineSize: "900px", blockSize: "600px" }}
      >
        <AppShell
          layout="sidebar"
          topBar={<TopBar />}
          sidebar={
            <Sidebar
              label="Main"
              switcher={<AccountMenu workspace="Northside Roasters" />}
            >
              <Sidebar.Item icon={House} label="Home" href="/" current />
            </Sidebar>
          }
        >
          <p>Page</p>
        </AppShell>
      </div>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Workspace: Northside Roasters" }),
    );
    expect(await screen.findByRole("menu")).toBeTruthy();
    screen.getByTestId("frame").style.inlineSize = "500px";
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(document.querySelector('[data-bt="Sidebar"]')).toBeNull();
    expect(document.querySelector('[data-bt="AccountMenu"]')).toBeNull();
  });

  it("lines a group's items up with its header's label, with an icon or without", () => {
    render(
      <Sidebar label="Main">
        <Sidebar.Group icon={ChartLine} label="Reports" defaultOpen>
          <Sidebar.Item label="Revenue" href="/reports/revenue" />
        </Sidebar.Group>
        <Sidebar.Group label="More" defaultOpen>
          <Sidebar.Item label="Payouts" href="/payouts" />
        </Sidebar.Group>
      </Sidebar>,
    );
    for (const [group, item] of [
      ["Reports", "Revenue"],
      ["More", "Payouts"],
    ] as const) {
      const header = screen
        .getByRole("button", { name: group })
        .querySelector('[data-bt-part="label"]');
      const label = screen
        .getByRole("link", { name: item })
        .querySelector('[data-bt-part="label"]');
      expect(label?.getBoundingClientRect().left).toBe(
        header?.getBoundingClientRect().left,
      );
    }
  });

  it("lines its switcher up with the top bar's row and scrolls its nav under it", () => {
    render(
      <div style={{ inlineSize: "1280px", blockSize: "320px" }}>
        <AppShell
          layout="sidebar"
          topBar={<TopBar />}
          sidebar={
            <Sidebar
              label="Main"
              switcher={<AccountMenu workspace="Northside Roasters" />}
            >
              {Array.from({ length: 20 }, (_, index) => (
                <Sidebar.Item
                  key={index}
                  icon={House}
                  label={`Page ${String(index + 1)}`}
                  href={`/page-${String(index + 1)}`}
                />
              ))}
            </Sidebar>
          }
        >
          <p>Page</p>
        </AppShell>
      </div>,
    );
    const trigger = screen.getByRole("button", {
      name: "Workspace: Northside Roasters",
    });
    const before = trigger.getBoundingClientRect();
    const bar = document
      .querySelector('[data-bt="TopBar"]')
      ?.getBoundingClientRect();
    expect(before.top + before.height / 2).toBe(
      (bar?.top ?? 0) + (bar?.height ?? 0) / 2,
    );
    const first = screen.getByRole("link", { name: "Page 1" });
    expect(first.getBoundingClientRect().top - before.bottom).toBe(12);
    const nav = first.closest<HTMLElement>('[data-bt-part="nav"]');
    if (!nav) throw new Error("No nav.");
    expect(getComputedStyle(nav).getPropertyValue("scrollbar-gutter")).toBe(
      "stable",
    );
    nav.scrollTop = 200;
    expect(nav.scrollTop).toBe(200);
    expect(trigger.getBoundingClientRect().top).toBe(before.top);
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
    expect(
      nav.querySelector('[data-bt-part="sidebar-divider"]'),
    ).not.toBeNull();
    await userEvent.click(within(nav).getByRole("button", { name: "Reports" }));
    const flyout = await screen.findByRole("menu", { name: "Reports" });
    expect(
      within(flyout)
        .getByRole("menuitem", { name: "Revenue" })
        .getAttribute("href"),
    ).toBe("/reports/revenue");
  });
});
