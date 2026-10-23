import "@butteryui/core/styles.css";
import "../../styles.css";
import { Menu, publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { LogOut, Settings } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { AppShell } from "../app-shell/AppShell.tsx";
import { Sidebar } from "../sidebar/Sidebar.tsx";
import { AccountMenu } from "./AccountMenu.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const WORKSPACES = [
  { id: "northside", name: "Northside Roasters" },
  { id: "harbor", name: "Harbor Beans" },
];

function Account({
  onSwitch = () => undefined,
  onSignOut = () => undefined,
}: {
  readonly onSwitch?: (id: string) => void;
  readonly onSignOut?: () => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: "216px" }}>
      <AccountMenu workspace="Northside Roasters" caption="Roastery · 6 people">
        <Menu.Item icon={Settings}>Settings</Menu.Item>
        <AccountMenu.Workspaces
          workspaces={WORKSPACES}
          current="northside"
          onSwitch={onSwitch}
          onCreate={() => undefined}
        />
        <Menu.Separator />
        <AccountMenu.User name="Mira Okafor" icon={Settings} />
        <Menu.Item icon={LogOut} onSelect={onSignOut}>
          Sign out
        </Menu.Item>
      </AccountMenu>
    </div>
  );
}

function RailFrame({ width }: { readonly width: number }): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px`, blockSize: "600px" }}>
      <AppShell
        layout="sidebar"
        sidebar={
          <Sidebar switcher={<AccountMenu workspace="Northside Roasters" />}>
            <Sidebar.Item label="Orders" href="#orders" />
          </Sidebar>
        }
      >
        Page
      </AppShell>
    </div>
  );
}

describe("AccountMenu", () => {
  it("puts its ref, class, style and other props on its trigger", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <AccountMenu
        ref={ref}
        workspace="Northside Roasters"
        className="custom"
        style={{ inlineSize: "200px" }}
        data-testid="switcher"
      />,
    );
    const trigger = screen.getByTestId("switcher");
    expect(ref.current).toBe(trigger);
    expect(trigger.dataset["bt"]).toBe("AccountMenu");
    expect(trigger.className).toBe("bt-account-menu-trigger bt-focus custom");
    expect(trigger.getBoundingClientRect().width).toBe(200);
  });

  it("starts open with defaultOpen and closes on Escape", async () => {
    render(
      <AccountMenu workspace="Northside Roasters" defaultOpen>
        <Menu.Item>Settings</Menu.Item>
      </AccountMenu>,
    );
    expect(await screen.findByRole("menu")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("is a 36px trigger named for its workspace, with a 20px tile, the name and a chevron", () => {
    render(<Account />);
    const trigger = screen.getByRole("button", {
      name: "Workspace: Northside Roasters",
    });
    expect(trigger.dataset["bt"]).toBe("AccountMenu");
    expect(trigger.getBoundingClientRect().height).toBe(36);
    const tile = trigger.querySelector('[data-bt="InitialsTile"]');
    expect(tile?.getBoundingClientRect().width).toBe(20);
    expect(tile?.textContent).toBe("NR");
  });

  it("shows its tile alone, centered, in a sidebar's rail, still named for its workspace", () => {
    render(
      <div style={{ inlineSize: "900px", blockSize: "600px" }}>
        <AppShell
          layout="sidebar"
          sidebar={
            <Sidebar switcher={<AccountMenu workspace="Northside Roasters" />}>
              <Sidebar.Item label="Orders" href="#orders" />
            </Sidebar>
          }
        >
          Page
        </AppShell>
      </div>,
    );
    const trigger = screen.getByRole("button", {
      name: "Workspace: Northside Roasters",
    });
    expect(trigger.scrollWidth).toBeLessThanOrEqual(trigger.clientWidth);
    const tile = trigger.querySelector('[data-bt="InitialsTile"]');
    if (!tile) throw new Error("No tile.");
    const box = trigger.getBoundingClientRect();
    const tileBox = tile.getBoundingClientRect();
    expect(
      Math.abs(tileBox.left + tileBox.width / 2 - (box.left + box.width / 2)),
    ).toBeLessThanOrEqual(0.5);
  });

  it("names its workspace in a tooltip in a sidebar's rail, and only there", async () => {
    const { rerender } = render(<RailFrame width={900} />);
    const trigger = screen.getByRole("button", {
      name: "Workspace: Northside Roasters",
    });
    await browser.keyboard("{Shift}");
    trigger.focus();
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe("Northside Roasters");
    trigger.blur();
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
    rerender(<RailFrame width={1280} />);
    await waitFor(() => {
      expect(
        screen.getByRole("navigation", { name: "Main" }).dataset["mode"],
      ).toBe("full");
    });
    await browser.keyboard("{Shift}");
    screen
      .getByRole("button", { name: "Workspace: Northside Roasters" })
      .focus();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows its trigger as open while its menu is open, in a sidebar's rail too", async () => {
    render(<RailFrame width={900} />);
    const trigger = screen.getByRole("button", {
      name: "Workspace: Northside Roasters",
    });
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--bt-bg-item-hover)";
    document.body.append(probe);
    const open = getComputedStyle(probe).backgroundColor;
    probe.remove();
    await browser.keyboard("{Shift}");
    trigger.focus();
    await browser.keyboard("{Enter}");
    await screen.findByRole("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(getComputedStyle(trigger).backgroundColor).toBe(open);
  });

  it("opens a 280px menu with the workspace at the top and its items under it", async () => {
    const onSignOut = vi.fn();
    render(<Account onSignOut={onSignOut} />);
    await userEvent.click(screen.getByRole("button", { name: /Workspace/ }));
    const menu = screen.getByRole("menu");
    expect(menu.offsetWidth).toBe(280);
    expect(menu.textContent).toContain("Roastery · 6 people");
    expect(
      screen
        .getByRole("menuitem", { name: /Mira Okafor/ })
        .querySelector('[data-bt="Avatar"]'),
    ).not.toBeNull();
    await userEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("switches workspace from its submenu, the current one checked", async () => {
    const onSwitch = vi.fn();
    render(<Account onSwitch={onSwitch} />);
    await userEvent.click(screen.getByRole("button", { name: /Workspace/ }));
    const item = screen.getByRole("menuitem", { name: "Switch workspace" });
    item.focus();
    await userEvent.keyboard("{ArrowRight}");
    const current = await screen.findByRole("menuitemradio", {
      name: "Northside Roasters",
    });
    expect(current.getAttribute("aria-checked")).toBe("true");
    expect(
      screen.getByRole("menuitem", { name: "New workspace" }),
    ).toBeTruthy();
    await userEvent.click(
      screen.getByRole("menuitemradio", { name: "Harbor Beans" }),
    );
    expect(onSwitch).toHaveBeenCalledWith("harbor");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});
