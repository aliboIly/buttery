import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import type { ReactElement } from "react";
import { FloatingLanes, Menu } from "@butteryui/core";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import { userEvent as browser, page } from "vitest/browser";
import { HeaderBar } from "../header-bar/HeaderBar.tsx";
import { Inspector } from "../inspector/Inspector.tsx";
import { Sidebar } from "../sidebar/Sidebar.tsx";
import { TopBar } from "../top-bar/TopBar.tsx";
import { AppShell } from "./AppShell.tsx";
import { useAppShell } from "./app-shell-context.ts";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Editor({
  width,
  open,
  onOpenChange,
}: {
  readonly width: string;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: width, blockSize: "600px" }}>
      <AppShell
        open={open}
        onOpenChange={onOpenChange}
        header={<HeaderBar title="Launch card" />}
        inspector={
          <Inspector label="Card settings">
            <Inspector.Section title="Card">
              <Inspector.Row label="Edge">
                <button type="button">Plain</button>
              </Inspector.Row>
            </Inspector.Section>
          </Inspector>
        }
        inspectorLabel="Card settings"
      >
        <div data-testid="stage">Stage</div>
      </AppShell>
    </div>
  );
}

describe("AppShell", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AppShell
        ref={ref}
        header={null}
        inspector={null}
        inspectorLabel="Settings"
        className="custom"
        data-testid="shell"
      >
        <p>Stage</p>
      </AppShell>,
    );
    expect(ref.current?.dataset["bt"]).toBe("AppShell");
    expect(ref.current?.className).toBe("bt-app-shell custom");
    expect(ref.current?.dataset["testid"]).toBe("shell");
  });

  it("puts the header over the stage, with the inspector full height beside them", () => {
    render(<Editor width="1100px" />);
    const header = document
      .querySelector<HTMLElement>('[data-bt="HeaderBar"]')
      ?.getBoundingClientRect();
    const stage = screen.getByTestId("stage").getBoundingClientRect();
    const inspector = screen
      .getByRole("region", { name: "Card settings" })
      .getBoundingClientRect();
    expect(Math.round(stage.top - (header?.bottom ?? 0))).toBe(8);
    expect(Math.round(inspector.left - stage.right)).toBe(8);
    expect(inspector.width).toBe(340);
    expect(Math.round(inspector.top)).toBe(Math.round(header?.top ?? 0));
    expect(Math.round(inspector.bottom)).toBe(Math.round(stage.bottom));
  });

  it("makes the stage the page's main landmark, with the header and the inspector beside it", () => {
    render(<Editor width="1100px" />);
    const main = screen.getByRole("main");
    expect(main.contains(screen.getByTestId("stage"))).toBe(true);
    expect(within(main).queryByText("Launch card")).toBeNull();
    expect(
      within(main).queryByRole("region", { name: "Card settings" }),
    ).toBeNull();
  });

  it("keeps its work at most 1380px wide, centered", () => {
    render(<Editor width="1700px" />);
    const header = document
      .querySelector<HTMLElement>('[data-bt="HeaderBar"]')
      ?.getBoundingClientRect();
    const inspector = screen
      .getByRole("region", { name: "Card settings" })
      .getBoundingClientRect();
    expect(Math.round(inspector.right - (header?.left ?? 0))).toBe(1380);
    expect(Math.round(header?.left ?? 0)).toBe(Math.round((1700 - 1380) / 2));
  });

  it("moves the inspector into a sheet on a narrow screen, opened from a button under the stage", async () => {
    render(<Editor width="390px" />);
    expect(screen.queryByRole("region", { name: "Card settings" })).toBeNull();
    const edit = screen.getByRole("button", { name: "Edit" });
    expect(edit.getBoundingClientRect().top).toBeGreaterThan(
      screen.getByTestId("stage").getBoundingClientRect().bottom,
    );
    await userEvent.click(edit);
    const sheet = await screen.findByRole("dialog", { name: "Card settings" });
    expect(sheet.querySelector('[data-bt="Inspector"]')).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(edit);
  });

  it("rises its sheet at the window's end, no wider than a dialog, when the shell is narrow in a wide window", async () => {
    const { innerWidth, innerHeight } = window;
    await page.viewport(1280, 800);
    onTestFinished(async () => {
      await page.viewport(innerWidth, innerHeight);
    });
    render(<Editor width="600px" />);
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    const sheet = await screen.findByRole("dialog", { name: "Card settings" });
    const box = sheet.getBoundingClientRect();
    expect(box.width).toBeLessThanOrEqual(400);
    expect(Math.round(document.documentElement.clientWidth - box.right)).toBe(
      8,
    );
  });

  it("closes the sheet when the screen widens, takes focus along to the inspector beside the stage, and leaves it closed when it narrows again", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Editor width="390px" onOpenChange={onOpenChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    const sheet = await screen.findByRole("dialog", { name: "Card settings" });
    expect(sheet.contains(document.activeElement)).toBe(true);
    rerender(<Editor width="1100px" onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    const inline = document.querySelector('[data-bt-part="inspector"]');
    expect(inline?.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(inline);
    rerender(<Editor width="390px" onOpenChange={onOpenChange} />);
    await screen.findByRole("button", { name: "Edit" });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the floating lanes clear of the inspector beside the stage, and of the button under it when narrow", async () => {
    const [width, height] = [window.innerWidth, window.innerHeight];
    onTestFinished(async () => {
      await page.viewport(width, height);
    });
    const { rerender } = render(
      <>
        <FloatingLanes />
        <div style={{ inlineSize: "1200px", blockSize: "100vh" }}>
          <Editor width="1200px" />
        </div>
        <FloatingLanes.Item lane="bottom-end">
          <div style={{ inlineSize: "120px", blockSize: "36px" }}>Guide</div>
        </FloatingLanes.Item>
      </>,
    );
    await page.viewport(1200, 700);
    const inspector = document.querySelector('[data-bt-part="inspector"]');
    await waitFor(() => {
      const guide = screen.getByText("Guide").getBoundingClientRect();
      expect(guide.right).toBeLessThanOrEqual(
        inspector?.getBoundingClientRect().left ?? 0,
      );
    });
    await page.viewport(600, 700);
    rerender(
      <>
        <FloatingLanes />
        <div style={{ inlineSize: "600px", blockSize: "100vh" }}>
          <Editor width="600px" />
        </div>
        <FloatingLanes.Item lane="bottom-end">
          <div style={{ inlineSize: "120px", blockSize: "36px" }}>Guide</div>
        </FloatingLanes.Item>
      </>,
    );
    await waitFor(() => {
      const bar = document
        .querySelector('[data-bt-part="sheet-bar"]')
        ?.getBoundingClientRect();
      const guide = screen.getByText("Guide").getBoundingClientRect();
      expect(guide.bottom).toBeLessThanOrEqual(bar?.top ?? 0);
    });
  });

  it("can be controlled", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Editor width="390px" open onOpenChange={onOpenChange} />,
    );
    expect(
      await screen.findByRole("dialog", { name: "Card settings" }),
    ).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Card settings" })).toBeTruthy();
    rerender(<Editor width="390px" open={false} onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});

function OpenNavigation(): ReactElement | null {
  const shell = useAppShell();
  if (shell.sidebar !== "sheet") return null;
  return (
    <button type="button" onClick={shell.openSidebar}>
      Open navigation
    </button>
  );
}

function Dashboard({ width }: { readonly width: number }): ReactElement {
  return (
    <div
      data-testid="frame"
      style={{ inlineSize: `${String(width)}px`, blockSize: "600px" }}
    >
      <AppShell
        layout="sidebar"
        data-testid="shell"
        sidebar={
          <nav aria-label="Main" style={{ blockSize: "1200px" }}>
            <a href="#orders">Orders</a>
          </nav>
        }
        topBar={
          <div style={{ blockSize: "56px" }}>
            <OpenNavigation />
            <Menu>
              <Menu.Trigger>Account</Menu.Trigger>
              <Menu.Content>
                <Menu.Item>Sign out</Menu.Item>
              </Menu.Content>
            </Menu>
          </div>
        }
      >
        <div data-testid="page" style={{ blockSize: "2000px" }}>
          Page
        </div>
      </AppShell>
    </div>
  );
}

function Shop({ width }: { readonly width: number }): ReactElement {
  return (
    <div
      data-testid="frame"
      style={{ inlineSize: `${String(width)}px`, blockSize: "600px" }}
    >
      <AppShell
        layout="sidebar"
        sidebar={
          <Sidebar label="Main">
            <Sidebar.Item label="Home" href="#home" />
            <Sidebar.Item label="Orders" href="#orders" current />
          </Sidebar>
        }
        topBar={<TopBar />}
      >
        Page
      </AppShell>
    </div>
  );
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-bt="AppShell"] > [data-bt-part="${name}"], [data-bt="AppShell"] > [data-bt-part="column"] > [data-bt-part="${name}"]`,
  );
  if (!element) throw new Error(`No ${name}.`);
  return element;
}

describe("AppShell layout=sidebar", () => {
  it("starts with a skip button, out of sight until it has focus, that moves focus past the sidebar to the page", async () => {
    render(<Dashboard width={1280} />);
    const skip = screen.getByRole("button", { name: "Skip to content" });
    const shell = screen.getByTestId("shell");
    expect(shell.firstElementChild).toBe(skip);
    expect(skip.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    skip.focus();
    expect(skip.getBoundingClientRect().width).toBeGreaterThan(48);
    expect(skip.getBoundingClientRect().left).toBeLessThan(
      shell.getBoundingClientRect().left + 16,
    );
    await userEvent.click(skip);
    const page = shell.querySelector('[data-bt-part="page"]');
    expect(document.activeElement).toBe(page);
    expect(skip.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });

  it("lays the sidebar beside the top bar and the page, each scrolling on its own while the shell doesn't", () => {
    render(<Dashboard width={1280} />);
    expect(part("sidebar").getBoundingClientRect().width).toBe(240);
    expect(part("top").getBoundingClientRect().left).toBe(240);
    const page = part("page");
    expect(page.getBoundingClientRect().top).toBe(56);
    page.scrollTop = 300;
    expect(page.scrollTop).toBe(300);
    part("sidebar").scrollTop = 200;
    expect(part("sidebar").scrollTop).toBe(200);
    const shell = screen.getByTestId("shell");
    expect(shell.scrollHeight).toBe(shell.clientHeight);
  });

  it("keeps the top bar and the page to the shell's width when the top bar's content is wider", () => {
    render(
      <div style={{ inlineSize: "390px", blockSize: "600px" }}>
        <AppShell
          layout="sidebar"
          sidebar={<nav aria-label="Main">Nav</nav>}
          topBar={<input aria-label="Search" size={80} />}
        >
          Page
        </AppShell>
      </div>,
    );
    expect(part("top").getBoundingClientRect().width).toBe(390);
    expect(part("page").getBoundingClientRect().width).toBe(390);
  });

  it("turns the sidebar into a 56px rail under 1100px of shell", () => {
    render(<Dashboard width={900} />);
    expect(screen.getByTestId("shell").dataset["sidebar"]).toBe("rail");
    expect(part("sidebar").getBoundingClientRect().width).toBe(56);
  });

  it("opens the sidebar as a sheet under 640px, closing it on a link and when the shell widens", async () => {
    render(<Dashboard width={500} />);
    expect(screen.queryByRole("navigation", { name: "Main" })).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Open navigation" }),
    );
    const sheet = await screen.findByRole("dialog", { name: "Navigation" });
    await userEvent.click(within(sheet).getByRole("link", { name: "Orders" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Open navigation" }),
    );
    await screen.findByRole("dialog", { name: "Navigation" });
    screen.getByTestId("frame").style.inlineSize = "1280px";
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
  });

  it("hands focus back to its menu button when the sheet closes, the button saying whether it's open", async () => {
    render(<Shop width={500} />);
    const button = screen.getByRole("button", { name: "Open navigation" });
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    button.focus();
    await browser.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "Navigation" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.activeElement).toBe(button);
    });
  });

  it("takes focus to the sidebar's current page when it widens with the sheet open", async () => {
    render(<Shop width={500} />);
    screen.getByRole("button", { name: "Open navigation" }).focus();
    await browser.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "Navigation" });
    screen.getByTestId("frame").style.inlineSize = "1280px";
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("link", { name: "Orders" }),
      );
    });
  });

  it("paints a new sidebar mode in the frame the shell resized in", async () => {
    render(<Dashboard width={1200} />);
    const shell = screen.getByTestId("shell");
    const seen: (string | undefined)[] = [];
    const observer = new ResizeObserver(() => {
      seen.push(shell.dataset["sidebar"]);
    });
    observer.observe(shell);
    onTestFinished(() => {
      observer.disconnect();
    });
    await waitFor(() => {
      expect(seen).toHaveLength(1);
    });
    screen.getByTestId("frame").style.inlineSize = "1000px";
    await waitFor(() => {
      expect(seen).toHaveLength(2);
    });
    expect(seen[1]).toBe("rail");
  });

  it("keeps the page's scrollbar gutter, and a rail's nav without a scrollbar", async () => {
    render(<Shop width={1280} />);
    expect(
      getComputedStyle(part("page")).getPropertyValue("scrollbar-gutter"),
    ).toBe("stable");
    const nav = screen
      .getByRole("navigation", { name: "Main" })
      .querySelector<HTMLElement>('[data-bt-part="nav"]');
    if (!nav) throw new Error("No nav.");
    expect(getComputedStyle(nav).getPropertyValue("scrollbar-width")).toBe(
      "thin",
    );
    screen.getByTestId("frame").style.inlineSize = "900px";
    await waitFor(() => {
      expect(getComputedStyle(nav).getPropertyValue("scrollbar-width")).toBe(
        "none",
      );
    });
  });

  it("warns, with the fix, when nothing can open its sidebar on a phone", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    onTestFinished(() => {
      warn.mockRestore();
    });
    render(<Shop width={1280} />);
    expect(warn).not.toHaveBeenCalled();
    cleanup();
    render(
      <AppShell layout="sidebar" sidebar={<Sidebar label="Main" />}>
        Page
      </AppShell>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toMatch(
      /^\[buttery:AppShell\] .*topBar.*Fix: /,
    );
  });

  it("makes the menus inside it arrive at once, as app chrome does", async () => {
    render(<Dashboard width={1280} />);
    await userEvent.click(screen.getByRole("button", { name: "Account" }));
    const menu = screen.getByRole("menu");
    expect(getComputedStyle(menu).opacity).toBe("1");
    expect(new DOMMatrix(getComputedStyle(menu).transform).a).toBe(1);
  });
});
