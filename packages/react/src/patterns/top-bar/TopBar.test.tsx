import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Bell, CircleHelp, Settings } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchField } from "../../components/search-field/SearchField.tsx";
import { CommandSearch } from "../command-search/CommandSearch.tsx";
import { pageSource } from "../command-search/search.ts";
import { AppShell } from "../app-shell/AppShell.tsx";
import { TopBar } from "./TopBar.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Bar({
  onCreate = () => undefined,
}: {
  readonly onCreate?: () => void;
}): ReactElement {
  return (
    <TopBar
      data-testid="bar"
      search={<SearchField variant="soft" label="Search" />}
      actions={
        <>
          <TopBar.Action
            icon={CircleHelp}
            label="Help"
            onSelect={() => undefined}
          />
          <TopBar.Action
            icon={Bell}
            label="Notifications"
            dot
            priority={1}
            onSelect={() => undefined}
          />
          <TopBar.Action
            icon={Settings}
            label="Settings"
            onSelect={() => undefined}
          />
        </>
      }
      create={{ label: "New order", onSelect: onCreate }}
    />
  );
}

function inShell(width: number): void {
  render(
    <div style={{ inlineSize: `${String(width)}px`, blockSize: "600px" }}>
      <AppShell
        layout="sidebar"
        sidebar={<nav aria-label="Main">Nav</nav>}
        topBar={<Bar />}
      >
        <p>Page</p>
      </AppShell>
    </div>,
  );
}

describe("TopBar", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<TopBar ref={ref} className="custom" data-testid="bar" />);
    expect(ref.current?.dataset["bt"]).toBe("TopBar");
    expect(ref.current?.dataset["testid"]).toBe("bar");
    expect(ref.current?.className).toBe("bt-top-bar custom");
  });

  it("is 56px tall with the search at its start, icon actions 4px apart and the round create button at its end", async () => {
    const onCreate = vi.fn();
    render(
      <div style={{ inlineSize: "1000px" }}>
        <Bar onCreate={onCreate} />
      </div>,
    );
    const bar = screen.getByTestId("bar");
    expect(bar.getBoundingClientRect().height).toBe(56);
    expect(
      screen
        .getByRole("searchbox")
        .closest('[data-bt="SearchField"]')
        ?.getBoundingClientRect().width,
    ).toBe(360);
    const help = screen.getByRole("button", { name: "Help" });
    const notifications = screen.getByRole("button", {
      name: "Notifications, new",
    });
    expect(
      notifications.getBoundingClientRect().left -
        help.getBoundingClientRect().right,
    ).toBe(4);
    const create = screen.getByRole("button", { name: "New order" });
    expect(create.dataset["variant"]).toBe("primary");
    expect(create.getBoundingClientRect().height).toBe(28);
    expect(Math.round(create.getBoundingClientRect().right)).toBe(
      Math.round(bar.getBoundingClientRect().right - 16),
    );
    await userEvent.click(create);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("lets a CommandSearch widen from 360 to 600 as it takes focus, keeping its actions in view", async () => {
    render(
      <div style={{ inlineSize: "1000px" }}>
        <TopBar
          search={
            <CommandSearch
              sources={[
                pageSource({ pages: [{ label: "Orders", href: "#orders" }] }),
              ]}
            />
          }
          actions={
            <TopBar.Action
              icon={CircleHelp}
              label="Help"
              onSelect={() => undefined}
            />
          }
        />
      </div>,
    );
    const search = screen.getByRole("combobox", { name: "Search" });
    const field = search.closest('[data-bt="CommandSearch"]');
    if (!field) throw new Error("No field.");
    expect(field.getBoundingClientRect().width).toBe(360);
    await userEvent.click(search);
    await waitFor(() => {
      expect(field.getBoundingClientRect().width).toBe(600);
    });
    expect(screen.getByRole("button", { name: "Help" })).toBeTruthy();
  });

  it("folds its actions into a menu when they don't fit", async () => {
    render(
      <div style={{ inlineSize: "420px" }}>
        <Bar />
      </div>,
    );
    expect(
      await screen.findByRole("button", { name: /^More app actions/ }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "New order" })).toBeTruthy();
  });

  it("keeps a folded action's dot in the menu, and its name saying so", async () => {
    render(
      <div style={{ inlineSize: "140px" }}>
        <TopBar
          actions={
            <>
              <TopBar.Action
                icon={Bell}
                label="Notifications"
                dot
                onSelect={() => undefined}
              />
              <TopBar.Action
                icon={Settings}
                label="Settings"
                priority={1}
                onSelect={() => undefined}
              />
            </>
          }
          create={{ label: "New order", onSelect: () => undefined }}
        />
      </div>,
    );
    const more = await screen.findByRole("button", {
      name: "More app actions, new",
    });
    expect(more.querySelector('[data-bt-part="dot"]')).not.toBeNull();
    await userEvent.click(more);
    const item = await screen.findByRole("menuitem", {
      name: "Notifications, new",
    });
    expect(item.querySelector('[data-bt-part="dot"]')).not.toBeNull();
  });

  it("pads like the page under it in a shell, and opens the sidebar from a menu button on a phone", async () => {
    inShell(1280);
    const bar = screen.getByTestId("bar");
    const field = screen
      .getByRole("searchbox")
      .closest('[data-bt="SearchField"]');
    expect(
      (field?.getBoundingClientRect().left ?? 0) -
        bar.getBoundingClientRect().left,
    ).toBe(32);
    expect(
      screen.queryByRole("button", { name: "Open navigation" }),
    ).toBeNull();
    cleanup();
    inShell(500);
    await userEvent.click(
      screen.getByRole("button", { name: "Open navigation" }),
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Navigation" })).toBeTruthy();
    });
  });
});
