import "@buttery/core/styles.css";
import "../../styles.css";
import { Menu, publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { LogOut, Settings } from "lucide-react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("AccountMenu", () => {
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
