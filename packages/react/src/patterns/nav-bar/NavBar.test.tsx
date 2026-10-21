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
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Button } from "../../components/button/Button.tsx";
import { MorphMenu } from "../morph-menu/MorphMenu.tsx";
import { NavBar } from "./NavBar.tsx";
import type { NavBarBehavior } from "./NavBar.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function page(behavior: NavBarBehavior = "static", width = 1100): HTMLElement {
  render(
    <div
      data-testid="scroller"
      style={{
        inlineSize: `${String(width)}px`,
        blockSize: "400px",
        overflowY: "auto",
      }}
    >
      <NavBar
        behavior={behavior}
        brand={<a href="#top">Card Studio</a>}
        actions={<Button variant="secondary">Sign in</Button>}
        data-testid="bar"
      >
        <MorphMenu.Item label="Product">
          <MorphMenu.Column title="Make">
            <MorphMenu.Entry
              href="#cards"
              title="Cards"
              caption="Titles and finishes"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
      </NavBar>
      <div style={{ blockSize: "2000px" }}>Page</div>
    </div>,
  );
  return screen.getByTestId("scroller");
}

function bar(): HTMLElement {
  return screen.getByTestId("bar");
}

describe("NavBar", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(<NavBar ref={ref} className="custom" data-testid="bar" />);
    expect(ref.current?.dataset["bt"]).toBe("NavBar");
    expect(ref.current?.dataset["testid"]).toBe("bar");
    expect(ref.current?.className).toContain("bt-nav-bar custom");
  });

  it("is a banner holding the Main navigation, with the brand, menus and actions in one 64px row", () => {
    page();
    const banner = screen.getByRole("banner");
    expect(
      within(banner).getByRole("navigation", { name: "Main" }),
    ).toBeTruthy();
    const row = bar().querySelector('[data-bt-part="bar"]');
    expect(row?.getBoundingClientRect().height).toBe(64);
    const top = row?.getBoundingClientRect().top ?? 0;
    for (const name of ["Product", "Sign in"]) {
      const box = screen.getByRole("button", { name }).getBoundingClientRect();
      expect(Math.round(box.top + box.height / 2 - top)).toBe(32);
    }
  });

  it("sits on the page container unless told not to", () => {
    const { rerender } = render(
      <div style={{ inlineSize: "1600px" }}>
        <NavBar brand={<a href="#top">Card Studio</a>} data-testid="bar" />
      </div>,
    );
    const row = (): Element | null =>
      bar().querySelector('[data-bt-part="bar"]');
    expect(row()?.getBoundingClientRect().width).toBe(1200);
    rerender(
      <div style={{ inlineSize: "1600px" }}>
        <NavBar
          brand={<a href="#top">Card Studio</a>}
          contained={false}
          data-testid="bar"
        />
      </div>,
    );
    expect(row()?.getBoundingClientRect().width).toBe(1600);
  });

  it("stacks at the sticky band whatever its behavior", () => {
    page("static");
    expect(getComputedStyle(bar()).zIndex).toBe("20");
    expect(getComputedStyle(bar()).position).toBe("relative");
  });

  it("stays pinned when sticky, publishing its height and taking a surface once the page scrolls", async () => {
    const scroller = page("sticky");
    expect(getComputedStyle(bar()).position).toBe("sticky");
    expect(scroller.style.getPropertyValue("--bt-sticky-top")).toBe("64px");
    scroller.scrollTop = 300;
    await waitFor(() => {
      expect(bar().hasAttribute("data-scrolled")).toBe(true);
    });
    expect(bar().getBoundingClientRect().top).toBe(
      scroller.getBoundingClientRect().top,
    );
  });

  it("slides away as the page scrolls down and back as it scrolls up when auto-hiding, publishing how far", async () => {
    const scroller = page("auto-hide");
    scroller.scrollTop = 200;
    await waitFor(() => {
      expect(scroller.style.getPropertyValue("--bt-sticky-shift")).toBe("64px");
    });
    scroller.scrollTop = 100;
    await waitFor(() => {
      expect(scroller.style.getPropertyValue("--bt-sticky-shift")).toBe("0px");
    });
    expect(scroller.style.getPropertyValue("--bt-sticky-top")).toBe("64px");
  });

  it("blurs the page behind an open menu, under the bar", async () => {
    page();
    await userEvent.click(screen.getByRole("button", { name: "Product" }));
    const scrim = await waitFor(() => {
      const element = document.querySelector('[data-bt="Scrim"]');
      if (!element) throw new Error("No scrim yet.");
      return element;
    });
    const layer = scrim.closest('[data-bt="Layer"]');
    expect(Number(getComputedStyle(layer ?? scrim).zIndex)).toBeLessThan(20);
  });

  it("folds the menus and actions into a menu button under 640px, which opens them in a sheet", async () => {
    page("static", 600);
    expect(screen.queryByRole("button", { name: "Product" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    const sheet = await screen.findByRole("dialog", { name: "Main" });
    const section = within(sheet).getByRole("button", { name: "Product" });
    await userEvent.click(section);
    expect(within(sheet).getByRole("link", { name: /Cards/ })).toBeTruthy();
    expect(within(sheet).getByRole("button", { name: "Sign in" })).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("folds when its menus don't fit beside the brand, even past 640px", () => {
    render(
      <div style={{ inlineSize: "700px" }}>
        <NavBar
          brand={<a href="#top">Card Studio</a>}
          actions={<Button>Start a long free trial now</Button>}
        >
          {["Product", "Templates", "Guides", "Company", "Community"].map(
            (label) => (
              <MorphMenu.Item key={label} label={label}>
                <MorphMenu.Column>
                  <MorphMenu.Entry href={`#${label}`} title={label} />
                </MorphMenu.Column>
              </MorphMenu.Item>
            ),
          )}
        </NavBar>
      </div>,
    );
    expect(screen.getByRole("button", { name: "Menu" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Templates" })).toBeNull();
  });
});
