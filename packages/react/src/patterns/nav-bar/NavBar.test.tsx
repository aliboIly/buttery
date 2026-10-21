import "@buttery/core/styles.css";
import "../../styles.css";
import { Sticky, publishSettled, scrollToSection } from "@buttery/core";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
} from "vitest";
import { userEvent as browser, page as screenPage } from "vitest/browser";
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

  it("opens a menu's card 8px under the bar, leaving the brand, menus and actions uncovered", async () => {
    const { innerWidth, innerHeight } = window;
    await screenPage.viewport(1200, 800);
    onTestFinished(async () => {
      await screenPage.viewport(innerWidth, innerHeight);
    });
    page("static", 1100);
    await userEvent.click(screen.getByRole("button", { name: "Product" }));
    const card = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        '[data-bt-part="panel"] > [data-bt-part="body"]',
      );
      if (!element || element.getBoundingClientRect().height < 40)
        throw new Error("The card hasn't unfolded yet.");
      return element;
    });
    const row = bar().querySelector('[data-bt-part="bar"]');
    if (!row) throw new Error("No bar row.");
    expect(card.getBoundingClientRect().top).toBe(
      row.getBoundingClientRect().bottom + 8,
    );
    for (const element of [
      screen.getByRole("link", { name: "Card Studio" }),
      screen.getByRole("button", { name: "Product" }),
      screen.getByRole("link", { name: "Pricing" }),
      screen.getByRole("button", { name: "Sign in" }),
    ]) {
      const { left, top, width, height } = element.getBoundingClientRect();
      expect(
        element.contains(
          document.elementFromPoint(left + width / 2, top + height / 2),
        ),
        element.textContent,
      ).toBe(true);
    }
  });

  it("keeps the pointer inside the menu all the way from a trigger down past the bar to its card", async () => {
    const { innerWidth, innerHeight } = window;
    await screenPage.viewport(1200, 800);
    onTestFinished(async () => {
      await screenPage.viewport(innerWidth, innerHeight);
    });
    page("static", 1100);
    const product = screen.getByRole("button", { name: "Product" });
    await userEvent.click(product);
    const card = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        '[data-bt-part="panel"] > [data-bt-part="body"]',
      );
      if (!element || element.getBoundingClientRect().height < 40)
        throw new Error("The card hasn't unfolded yet.");
      return element;
    });
    const menu = card.closest('[data-bt-part="panel"]');
    const target = product.getBoundingClientRect();
    const x = target.left + target.width / 2;
    const top = card.getBoundingClientRect().top;
    for (let y = target.top + 1; y < top + 4; y += 2) {
      const hit = document.elementFromPoint(x, y);
      expect(
        product.contains(hit) || (menu?.contains(hit) ?? false),
        `at ${String(y)}`,
      ).toBe(true);
    }
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

  it("closes its sheet once a link in it is chosen", async () => {
    page("static", 600);
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    let sheet = await screen.findByRole("dialog", { name: "Main" });
    await userEvent.click(
      within(sheet).getByRole("button", { name: "Product" }),
    );
    await userEvent.click(within(sheet).getByRole("link", { name: /Cards/ }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    sheet = await screen.findByRole("dialog", { name: "Main" });
    await userEvent.click(within(sheet).getByRole("link", { name: "Pricing" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("closes its sheet for any link in it, but not for one opening in a new tab", async () => {
    render(
      <div style={{ inlineSize: "600px" }}>
        <NavBar
          brand={<a href="#top">Card Studio</a>}
          actions={<a href="#start">Start free</a>}
        >
          <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
        </NavBar>
      </div>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    let sheet = await screen.findByRole("dialog", { name: "Main" });
    const pricing = within(sheet).getByRole("link", { name: "Pricing" });
    pricing.addEventListener("click", (event) => {
      event.preventDefault();
    });
    fireEvent.click(pricing, { metaKey: true });
    expect(screen.getByRole("dialog", { name: "Main" })).toBe(sheet);
    await userEvent.click(
      within(sheet).getByRole("link", { name: "Start free" }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    sheet = await screen.findByRole("dialog", { name: "Main" });
    await userEvent.click(
      within(sheet).getByRole("link", { name: "Card Studio" }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("leaves focus where a link chosen in its sheet moves it", async () => {
    render(
      <div style={{ inlineSize: "600px" }}>
        <NavBar brand={<a href="#top">Card Studio</a>}>
          <MorphMenu.Link
            href="#features"
            onClick={(event) => {
              if (scrollToSection("features")) event.preventDefault();
            }}
          >
            Features
          </MorphMenu.Link>
        </NavBar>
        <section id="features">
          <h2>Features</h2>
        </section>
      </div>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    const sheet = await screen.findByRole("dialog", { name: "Main" });
    await userEvent.click(
      within(sheet).getByRole("link", { name: "Features" }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(document.getElementById("features"));
  });

  it("takes Tab past its last menu to what follows the bar, not to its hidden menu button", async () => {
    render(
      <div style={{ inlineSize: "1100px" }}>
        <NavBar brand={<a href="#top">Card Studio</a>}>
          <MorphMenu.Item label="Guides">
            <MorphMenu.Column>
              <MorphMenu.Entry href="#first" title="Your first card" />
            </MorphMenu.Column>
          </MorphMenu.Item>
        </NavBar>
        <button type="button">After the bar</button>
      </div>,
    );
    const guides = screen.getByRole("button", { name: "Guides" });
    await userEvent.click(guides);
    await screen.findByRole("link", { name: /Your first card/ });
    guides.focus();
    await browser.keyboard("{Tab}");
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: /Your first card/ }),
    );
    await browser.keyboard("{Tab}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After the bar" }),
    );
  });

  it("closes its sheet when the bar widens past its fold, with focus back in the row", async () => {
    const scroller = page("static", 600);
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    await screen.findByRole("dialog", { name: "Main" });
    scroller.style.inlineSize = "1100px";
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("link", { name: "Card Studio" }),
      );
    });
  });

  it("stays out while keyboard focus is in an auto-hiding bar, and slides away once it leaves", async () => {
    const scroller = page("auto-hide");
    const brand = screen.getByRole("link", { name: "Card Studio" });
    // A key press first makes the focus that follows keyboard focus; WebKit's Tab skips links, as Safari's does.
    await browser.keyboard("{Shift}");
    brand.focus();
    expect(brand.matches(":focus-visible")).toBe(true);
    scroller.scrollTop = 300;
    await waitFor(() => {
      expect(bar().hasAttribute("data-scrolled")).toBe(true);
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(bar().getBoundingClientRect().top).toBe(
      scroller.getBoundingClientRect().top,
    );
    brand.blur();
    await waitFor(() => {
      expect(scroller.style.getPropertyValue("--bt-sticky-shift")).toBe("64px");
    });
  });

  it("slides away after a click in it, which isn't keyboard focus", async () => {
    const scroller = page("auto-hide");
    await browser.click(screen.getByRole("button", { name: "Sign in" }));
    scroller.scrollTop = 300;
    await waitFor(() => {
      expect(scroller.style.getPropertyValue("--bt-sticky-shift")).toBe("64px");
    });
  });

  it("takes a sticky that has stuck under it along as it slides away", async () => {
    render(
      <div
        data-testid="scroller"
        style={{ inlineSize: "1100px", blockSize: "400px", overflowY: "auto" }}
      >
        <NavBar behavior="auto-hide" brand={<a href="#top">Card Studio</a>}>
          <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
        </NavBar>
        <Sticky data-testid="follower">
          <div style={{ blockSize: "48px" }}>Sections</div>
        </Sticky>
        <div style={{ blockSize: "2000px" }}>Page</div>
      </div>,
    );
    const scroller = screen.getByTestId("scroller");
    scroller.scrollTop = 300;
    await waitFor(() => {
      expect(screen.getByTestId("follower").getBoundingClientRect().top).toBe(
        scroller.getBoundingClientRect().top,
      );
    });
  });

  it("comes back on a slow scroll up, a few pixels a frame", async () => {
    const scroller = page("auto-hide");
    scroller.scrollTop = 400;
    await waitFor(() => {
      expect(scroller.style.getPropertyValue("--bt-sticky-shift")).toBe("64px");
    });
    for (const top of [398, 396, 394, 392]) {
      scroller.scrollTop = top;
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
    }
    await waitFor(() => {
      expect(scroller.style.getPropertyValue("--bt-sticky-shift")).toBe("0px");
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

  it("stays folded when it widens past 640px from a narrow start, if its menus still don't fit", async () => {
    render(
      <div data-testid="frame" style={{ inlineSize: "390px" }}>
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
    screen.getByTestId("frame").style.inlineSize = "700px";
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
    expect(screen.getByRole("button", { name: "Menu" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Templates" })).toBeNull();
    screen.getByTestId("frame").style.inlineSize = "1400px";
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Templates" })).toBeTruthy();
    });
  });
});
