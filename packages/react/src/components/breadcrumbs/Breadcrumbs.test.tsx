import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Breadcrumbs } from "./Breadcrumbs.tsx";

afterEach(cleanup);

const TRAIL = [
  { label: "Settings", href: "#settings" },
  { label: "Plans and billing", href: "#settings/plans" },
] as const;

function trail(
  width = 600,
  onNavigate?: (href: string, event: { preventDefault: () => void }) => void,
): void {
  render(
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Breadcrumbs items={TRAIL} onNavigate={onNavigate} />
    </div>,
  );
}

describe("Breadcrumbs", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Breadcrumbs
        ref={ref}
        items={TRAIL}
        className="custom"
        data-testid="crumbs"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("Breadcrumbs");
    expect(ref.current?.dataset["testid"]).toBe("crumbs");
    expect(ref.current?.className).toBe("bt-breadcrumbs custom");
  });

  it("is a navigation named Breadcrumbs holding a list of links, a hidden chevron between them", () => {
    trail();
    const nav = screen.getByRole("navigation", { name: "Breadcrumbs" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Settings",
      "Plans and billing",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#settings",
      "#settings/plans",
    ]);
    expect(within(nav).getAllByRole("listitem")).toHaveLength(2);
    const separators = nav.querySelectorAll('[data-bt-part="separator"]');
    expect(separators).toHaveLength(1);
    expect(separators[0]?.getAttribute("aria-hidden")).toBe("true");
  });

  it("gives every link a target at least 24px tall", () => {
    trail();
    for (const hit of document.querySelectorAll('[data-bt-part="hit"]'))
      expect(hit.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  });

  it("shows only the page one level up after a back chevron under 480px", () => {
    trail(360);
    const [settings, plans] = screen.getAllByRole("link", { hidden: true });
    if (!settings || !plans) throw new Error("No links.");
    expect(settings.getClientRects()).toHaveLength(0);
    expect(plans.getClientRects().length).toBeGreaterThan(0);
    const back = plans.querySelector<HTMLElement>('[data-bt-part="back"]');
    expect(back?.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it("lets a router take over a link", async () => {
    const onNavigate = vi.fn(
      (_href: string, event: { preventDefault: () => void }) => {
        event.preventDefault();
      },
    );
    trail(600, onNavigate);
    await userEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(onNavigate).toHaveBeenCalledWith("#settings", expect.anything());
  });

  it("leaves a click for a new tab to the browser", async () => {
    const onNavigate = vi.fn();
    trail(600, onNavigate);
    const settings = screen.getByRole("link", { name: "Settings" });
    settings.addEventListener("click", (event) => {
      event.preventDefault();
    });
    await userEvent.keyboard("{Meta>}");
    await userEvent.click(settings);
    await userEvent.keyboard("{/Meta}");
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("points its chevrons the other way right to left", () => {
    render(
      <div dir="rtl" style={{ inlineSize: "360px" }}>
        <Breadcrumbs items={[...TRAIL, { label: "Invoices", href: "#i" }]} />
      </div>,
    );
    const icons = [
      ...document.querySelectorAll(
        ':is([data-bt-part="separator"], [data-bt-part="back"]) > .bt-icon',
      ),
    ];
    expect(icons.length).toBeGreaterThan(1);
    for (const icon of icons) expect(getComputedStyle(icon).scale).toBe("-1 1");
  });

  it("fades a link's color on hover", () => {
    trail();
    const link = screen.getByRole("link", { name: "Settings" });
    const style = getComputedStyle(link);
    expect(style.transitionProperty).toBe("color");
    expect(style.transitionDuration).not.toBe("0s");
  });
});
