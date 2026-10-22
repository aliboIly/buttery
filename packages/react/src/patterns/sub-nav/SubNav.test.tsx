import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { SubNav } from "./SubNav.tsx";
import type { SubNavItem } from "./SubNav.tsx";

afterEach(cleanup);

const ITEMS: readonly SubNavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "export", label: "Export" },
];

function page(width = 900): HTMLElement {
  render(
    <div
      data-testid="scroller"
      style={{
        inlineSize: `${String(width)}px`,
        blockSize: "300px",
        overflowY: "auto",
      }}
    >
      <SubNav title="Deckhand" items={ITEMS} />
      {ITEMS.map((item) => (
        <section key={item.id} id={item.id} style={{ blockSize: "400px" }}>
          <h2>{item.label}</h2>
        </section>
      ))}
    </div>,
  );
  return screen.getByTestId("scroller");
}

function link(name: string): HTMLElement {
  return screen.getByRole("link", { name });
}

describe("SubNav", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <SubNav ref={ref} items={ITEMS} className="custom" data-testid="nav" />,
    );
    expect(ref.current?.dataset["bt"]).toBe("SubNav");
    expect(ref.current?.dataset["testid"]).toBe("nav");
    expect(ref.current?.className).toContain("bt-sub-nav custom");
  });

  it("is a navigation named Sections, 48px tall, with a link to each section", () => {
    page();
    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(
      nav.querySelector('[data-bt-part="sub-nav-bar"]')?.getBoundingClientRect()
        .height,
    ).toBe(48);
    expect(link("Features").getAttribute("href")).toBe("#features");
  });

  it("ends a long title with an ellipsis and keeps its full text", () => {
    render(
      <div style={{ inlineSize: "390px" }}>
        <SubNav
          title="Deckhand for teams who present a fresh deck to the whole company every single week"
          items={ITEMS}
        />
      </div>,
    );
    const title = screen.getByText(/Deckhand for teams/);
    expect(title.hasAttribute("data-bt-truncate")).toBe(true);
    expect(title.getAttribute("title")).toBe(
      "Deckhand for teams who present a fresh deck to the whole company every single week",
    );
    expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
  });

  it("marks the section under the bar as the reader scrolls", async () => {
    const scroller = page();
    await waitFor(() => {
      expect(link("Overview").getAttribute("aria-current")).toBe("location");
    });
    const features = document.getElementById("features");
    if (!features) throw new Error("No features section.");
    scroller.scrollTop = features.offsetTop - 49;
    await waitFor(() => {
      expect(link("Features").getAttribute("aria-current")).toBe("location");
    });
    expect(link("Overview").hasAttribute("aria-current")).toBe(false);
  });

  it("marks the last section once the page is scrolled to its end", async () => {
    const scroller = page();
    scroller.scrollTop = scroller.scrollHeight;
    await waitFor(() => {
      expect(link("Export").getAttribute("aria-current")).toBe("location");
    });
  });

  it("scrolls to a section under the bar when its link is pressed, moving focus there and keeping the URL", async () => {
    const scroller = page();
    const hash = window.location.hash;
    await userEvent.click(link("Export"));
    const section = document.getElementById("export");
    if (!section) throw new Error("No export section.");
    const bar = screen.getByRole("navigation").getBoundingClientRect();
    expect(Math.round(section.getBoundingClientRect().top - bar.bottom)).toBe(
      0,
    );
    expect(document.activeElement).toBe(section);
    expect(window.location.hash).toBe(hash);
    expect(scroller.scrollTop).toBeGreaterThan(0);
  });

  it("follows current when it's given", () => {
    render(<SubNav items={ITEMS} current="export" />);
    expect(link("Export").getAttribute("aria-current")).toBe("location");
    expect(link("Overview").hasAttribute("aria-current")).toBe(false);
  });

  it("underlines the current link along the bar's bottom edge", async () => {
    page();
    await waitFor(() => {
      expect(link("Overview").getAttribute("aria-current")).toBe("location");
    });
    const underline = link("Overview").querySelector(
      '[data-bt-part="indicator"]',
    );
    if (!underline) throw new Error("No underline.");
    const bar = screen.getByRole("navigation").getBoundingClientRect();
    expect(underline.getBoundingClientRect().height).toBe(2);
    expect(underline.getBoundingClientRect().bottom).toBe(bar.bottom);
  });
});
