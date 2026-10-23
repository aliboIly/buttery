import "@butteryui/core/styles.css";
import "../../styles.css";
import { FloatingLanes, Menu, publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { TextField } from "../../components/text-field/TextField.tsx";
import { AppPage } from "../app-page/AppPage.tsx";
import { AppShell } from "../app-shell/AppShell.tsx";
import { SidePanel } from "./SidePanel.tsx";

beforeEach(async () => {
  publishSettled();
  await page.viewport(1440, 800);
});

afterEach(cleanup);

function Help({
  width,
  withField = true,
  startOpen = false,
  children,
}: {
  readonly width: number;
  readonly withField?: boolean;
  readonly startOpen?: boolean;
  readonly children?: ReactNode;
}): ReactElement {
  const [open, setOpen] = useState(startOpen);
  return (
    <div style={{ inlineSize: `${String(width)}px`, blockSize: "700px" }}>
      <AppShell
        layout="sidebar"
        sidebar={<nav aria-label="Main">Nav</nav>}
        topBar={
          <button
            type="button"
            aria-expanded={open}
            onClick={() => {
              setOpen(!open);
            }}
          >
            Help
          </button>
        }
        panel={
          <SidePanel
            title="Help"
            open={open}
            onOpenChange={setOpen}
            menu={
              <>
                <Menu.Item>Open the guide</Menu.Item>
                <Menu.Item tone="danger">Clear the history</Menu.Item>
              </>
            }
            footer={withField ? <TextField label="Ask a question" /> : null}
          >
            <p>Roast profiles, orders and payouts.</p>
          </SidePanel>
        }
      >
        {children ?? <p>Orders</p>}
      </AppShell>
    </div>
  );
}

function column(): DOMRect {
  const element = document.querySelector(
    '[data-bt="AppShell"] > [data-bt-part="column"]',
  );
  if (!element) throw new Error("No column.");
  return element.getBoundingClientRect();
}

function helpButton(): HTMLElement {
  return screen.getByRole("button", { name: "Help" });
}

async function openWithKeyboard(): Promise<void> {
  await userEvent.keyboard("{Shift}");
  helpButton().focus();
  await userEvent.keyboard("{Enter}");
}

describe("SidePanel", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props, docking where it's placed outside a shell", () => {
    const ref = createRef<HTMLElement>();
    render(
      <SidePanel
        ref={ref}
        title="Help"
        defaultOpen
        className="custom"
        data-testid="help"
      >
        <p>Roast profiles</p>
      </SidePanel>,
    );
    const panel = screen.getByRole("complementary", { name: "Help" });
    expect(ref.current).toBe(panel);
    expect(panel.dataset["bt"]).toBe("SidePanel");
    expect(panel.dataset["testid"]).toBe("help");
    expect(panel.dataset["mode"]).toBe("docked");
    expect(panel.className).toBe("bt-side-panel custom");
  });

  it("docks beside the column from 1280px of shell, 360 wide and full height, the column narrowing as it opens", async () => {
    render(<Help width={1440} />);
    const before = column();
    expect(before.width).toBe(1440 - 240);
    await userEvent.click(helpButton());
    const panel = screen.getByRole("complementary", { name: "Help" });
    const box = panel.getBoundingClientRect();
    expect(box.width).toBe(360);
    expect(box.height).toBe(700);
    expect(column().width).toBe(before.width - 360);
    expect(column().right).toBe(box.left);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps a floating lane's item on the page's side of it while docked", async () => {
    render(
      <>
        <FloatingLanes />
        <Help width={1440} />
        <FloatingLanes.Item lane="bottom-end">
          <div style={{ inlineSize: "240px", blockSize: "80px" }}>
            Setup guide
          </div>
        </FloatingLanes.Item>
      </>,
    );
    const guide = (): DOMRect =>
      screen.getByText("Setup guide").getBoundingClientRect();
    expect(window.innerWidth - guide().right).toBe(24);
    await userEvent.click(helpButton());
    const panel = screen
      .getByRole("complementary", { name: "Help" })
      .getBoundingClientRect();
    await waitFor(() => {
      expect(panel.left - guide().right).toBe(24);
    });
  });

  it("takes its new width at once, and fades only its content in over dur-fast, 100ms with reduced motion", async () => {
    render(
      <>
        <Help width={1440} />
        <div data-bt-motion="reduced">
          <SidePanel title="Notes" defaultOpen>
            <p>Roast notes</p>
          </SidePanel>
        </div>
      </>,
    );
    await userEvent.click(helpButton());
    const panel = screen.getByRole("complementary", { name: "Help" });
    const part = (root: HTMLElement, name: string): HTMLElement => {
      const element = root.querySelector<HTMLElement>(
        `:scope > [data-bt-part="${name}"]`,
      );
      if (!element) throw new Error(`No ${name}.`);
      return element;
    };
    expect(getComputedStyle(panel).animationName).toBe("none");
    expect(getComputedStyle(part(panel, "header")).animationName).toBe("none");
    const content = getComputedStyle(part(panel, "content"));
    expect(content.animationName).toBe("bt-side-panel-in");
    expect(content.animationDuration).toBe("0.12s");
    const notes = screen.getByRole("complementary", { name: "Notes" });
    expect(getComputedStyle(part(notes, "content")).animationDuration).toBe(
      "0.1s",
    );
  });

  it("opens on its first field to type in, and Escape closes it, handing focus back to what opened it", async () => {
    render(<Help width={1440} />);
    await openWithKeyboard();
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: "Ask a question" }),
      );
    });
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("complementary", { name: "Help" })).toBeNull();
    expect(document.activeElement).toBe(helpButton());
  });

  it("takes focus itself when it has no field, and its close button closes it", async () => {
    render(<Help width={1440} withField={false} />);
    await openWithKeyboard();
    const panel = screen.getByRole("complementary", { name: "Help" });
    expect(document.activeElement).toBe(panel);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("complementary", { name: "Help" })).toBeNull();
    expect(helpButton().getAttribute("aria-expanded")).toBe("false");
  });

  it("widens to 560 from its expand button, a toggle pressed while it's wide", async () => {
    render(<Help width={1440} />);
    await userEvent.click(helpButton());
    const expand = screen.getByRole("button", { name: "Expand" });
    expect(expand.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(expand);
    expect(expand.getAttribute("aria-pressed")).toBe("true");
    const panel = screen.getByRole("complementary", { name: "Help" });
    expect(panel.getBoundingClientRect().width).toBe(560);
    expect(column().width).toBe(1440 - 240 - 560);
    await userEvent.click(expand);
    expect(panel.getBoundingClientRect().width).toBe(360);
  });

  it("opens its overflow menu, where Escape closes the menu and leaves the panel open", async () => {
    render(<Help width={1440} />);
    await userEvent.click(helpButton());
    await userEvent.click(screen.getByRole("button", { name: "More actions" }));
    expect(
      await screen.findByRole("menuitem", { name: "Clear the history" }),
    ).toHaveProperty("dataset.tone", "danger");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(screen.getByRole("complementary", { name: "Help" })).toBeTruthy();
  });

  it("docks with focus in its field as the shell widens with its sheet open, rather than handing focus back", async () => {
    const { rerender } = render(<Help width={1100} />);
    await openWithKeyboard();
    const field = await screen.findByLabelText("Ask a question");
    await waitFor(() => {
      expect(document.activeElement).toBe(field);
    });
    rerender(<Help width={1440} />);
    await waitFor(() => {
      expect(
        screen.getByRole("complementary", { name: "Help" }).dataset["mode"],
      ).toBe("docked");
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(document.activeElement).toBe(
      screen.getByLabelText("Ask a question"),
    );
  });

  it("closes when the shell narrows under it while docked, handing focus back to what opened it", async () => {
    const { rerender } = render(<Help width={1440} />);
    await openWithKeyboard();
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByLabelText("Ask a question"),
      );
    });
    rerender(<Help width={1100} />);
    await waitFor(() => {
      expect(helpButton().getAttribute("aria-expanded")).toBe("false");
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("complementary", { name: "Help" })).toBeNull();
    expect(document.activeElement).toBe(helpButton());
  });

  it("becomes the sheet as the shell narrows when its owner keeps it open", async () => {
    function Kept({ width }: { readonly width: number }): ReactElement {
      return (
        <div style={{ inlineSize: `${String(width)}px`, blockSize: "700px" }}>
          <AppShell
            layout="sidebar"
            sidebar={<nav aria-label="Main">Nav</nav>}
            panel={
              <SidePanel title="Help" open>
                <p>Roast profiles</p>
              </SidePanel>
            }
          >
            <p>Orders</p>
          </AppShell>
        </div>
      );
    }
    const { rerender } = render(<Kept width={1440} />);
    expect(
      screen.getByRole("complementary", { name: "Help" }).dataset["mode"],
    ).toBe("docked");
    rerender(<Kept width={1100} />);
    expect(await screen.findByRole("dialog", { name: "Help" })).toBeTruthy();
  });

  it("leaves focus where it is when it's open from the start, and opens as a sheet in a narrow shell", async () => {
    render(<Help width={1440} startOpen />);
    expect(
      screen.getByRole("complementary", { name: "Help" }).dataset["mode"],
    ).toBe("docked");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.activeElement).toBe(document.body);
    cleanup();
    render(<Help width={1100} startOpen />);
    expect(await screen.findByRole("dialog", { name: "Help" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Help", hidden: true })
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("opens as a sheet under 1280px of shell, 8px in at the window's end, without the expand button or narrowing the page", async () => {
    await page.viewport(1100, 800);
    render(<Help width={1100} />);
    const before = column();
    await userEvent.click(helpButton());
    const sheet = await screen.findByRole("dialog", { name: "Help" });
    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
        true,
      );
    });
    const box = sheet.getBoundingClientRect();
    expect(box.width).toBe(360);
    expect(window.innerWidth - box.right).toBe(8);
    expect(box.top).toBe(8);
    expect(window.innerHeight - box.bottom).toBe(8);
    const header = sheet.querySelector(':scope > [data-bt-part="header"]');
    expect(header?.getBoundingClientRect().width).toBe(box.width);
    expect(column().width).toBe(before.width);
    expect(screen.queryByRole("button", { name: "Expand" })).toBeNull();
    expect(sheet.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps a page's right rail under the page while it's docked, until the column has 1040px", async () => {
    render(
      <Help width={1440}>
        <AppPage aside={<p>Order details</p>} asideLabel="Order details">
          <AppPage.Section title="Orders">Rows</AppPage.Section>
        </AppPage>
      </Help>,
    );
    const rail = (): DOMRect =>
      screen
        .getByRole("complementary", { name: "Order details" })
        .getBoundingClientRect();
    const main = (): DOMRect => {
      const element = document.querySelector(
        '[data-bt="AppPage"] [data-bt-part="main"]',
      );
      if (!element) throw new Error("No main column.");
      return element.getBoundingClientRect();
    };
    expect(rail().top).toBe(main().top);
    await userEvent.click(helpButton());
    expect(rail().top).toBeGreaterThanOrEqual(main().bottom);
  });
});
