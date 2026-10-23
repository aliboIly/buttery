import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { Tabs } from "./Tabs.tsx";
import type { TabsVariant } from "./Tabs.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const SECTIONS = [
  "Overview",
  "Orders",
  "Subscriptions",
  "Payments",
  "Notes",
  "Activity",
];

function Customer({
  width = 800,
  variant,
}: {
  readonly width?: number;
  readonly variant?: TabsVariant;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Tabs
        defaultValue="Overview"
        data-testid="tabs"
        {...(variant === undefined ? {} : { variant })}
      >
        <Tabs.List label="Customer">
          {SECTIONS.map((section) => (
            <Tabs.Tab key={section} value={section}>
              {section}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {SECTIONS.map((section) => (
          <Tabs.Panel key={section} value={section}>
            {`${section} panel`}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

function colorOf(variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function indicatorIn(tab: HTMLElement): HTMLElement {
  const indicator = tab.querySelector<HTMLElement>(
    '[data-bt-part="indicator"]',
  );
  if (!indicator) throw new Error("No indicator in the chosen tab.");
  return indicator;
}

function sameBox(a: DOMRect, b: DOMRect): readonly number[] {
  return [
    a.left - b.left,
    a.top - b.top,
    a.width - b.width,
    a.height - b.height,
  ].map((difference) => Math.round(Math.abs(difference)));
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("Tabs", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs ref={ref} defaultValue="a" className="custom" data-testid="tabs">
        <Tabs.List label="Sections">
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
      </Tabs>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Tabs");
    expect(ref.current?.dataset["testid"]).toBe("tabs");
    expect(ref.current?.className).toBe("bt-tabs custom");
  });

  it("is a tablist named by its label whose tabs show their panels, by press or arrow key", async () => {
    render(<Customer />);
    expect(screen.getByRole("tablist", { name: "Customer" })).toBeTruthy();
    expect(screen.getByRole("tabpanel").textContent).toBe("Overview panel");
    await userEvent.click(screen.getByRole("tab", { name: "Orders" }));
    expect(
      screen.getByRole("tab", { name: "Orders" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByRole("tabpanel", { name: "Orders" }).textContent).toBe(
      "Orders panel",
    );
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tabpanel").textContent).toBe(
      "Subscriptions panel",
    );
  });

  it("draws the chosen tab's 2px underline on the row's line, as wide as the tab, underlined unless told", async () => {
    render(<Customer />);
    expect(screen.getByTestId("tabs").dataset["variant"]).toBe("underline");
    await userEvent.click(screen.getByRole("tab", { name: "Payments" }));
    await settled();
    const tab = screen.getByRole("tab", { name: "Payments" });
    const underline = tab.querySelector('[data-bt-part="indicator"]');
    const row = document.querySelector('[data-bt-part="row"]');
    if (!underline || !row) throw new Error("No underline or row.");
    const line = underline.getBoundingClientRect();
    expect(line.height).toBe(2);
    expect(line.width).toBe(tab.getBoundingClientRect().width);
    expect(line.bottom).toBe(row.getBoundingClientRect().bottom);
    expect(tab.getBoundingClientRect().height).toBe(36);
  });

  it("folds the tabs that don't fit into a menu that still chooses them", async () => {
    render(<Customer width={300} />);
    const more = await screen.findByRole("button", { name: "More tabs" });
    expect(screen.queryByRole("tab", { name: "Activity" })).toBeNull();
    await userEvent.click(more);
    await userEvent.click(
      await screen.findByRole("menuitemradio", { name: "Activity" }),
    );
    expect(screen.getByRole("tabpanel").textContent).toBe("Activity panel");
  });

  it("keeps the chosen tab in the row once it's chosen from the menu, so Tab never changes the choice", async () => {
    render(<Customer width={300} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "More tabs" }),
    );
    await userEvent.click(
      await screen.findByRole("menuitemradio", { name: "Activity" }),
    );
    await waitFor(() => {
      expect(
        screen
          .getByRole("tab", { name: "Activity" })
          .getAttribute("aria-selected"),
      ).toBe("true");
    });
  });

  it("rings a panel for its own keyboard focus, and not for a control's focus inside it", async () => {
    render(
      <Tabs defaultValue="Overview">
        <Tabs.List label="Customer">
          <Tabs.Tab value="Overview">Overview</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="Overview">
          <button type="button">Edit</button>
        </Tabs.Panel>
      </Tabs>,
    );
    const panel = screen.getByRole("tabpanel");
    await browser.keyboard("{Shift}");
    panel.focus();
    expect(getComputedStyle(panel).outlineStyle).toBe("solid");
    await browser.keyboard("{Shift}");
    screen.getByRole("button", { name: "Edit" }).focus();
    expect(getComputedStyle(panel).outlineStyle).toBe("none");
  });

  it("can be controlled", async () => {
    function Controlled(): ReactElement {
      const [value, setValue] = useState("Notes");
      return (
        <Tabs value={value} onValueChange={setValue}>
          <Tabs.List label="Customer">
            <Tabs.Tab value="Overview">Overview</Tabs.Tab>
            <Tabs.Tab value="Notes">Notes</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="Overview">Overview panel</Tabs.Panel>
          <Tabs.Panel value="Notes">Notes panel</Tabs.Panel>
          <output>{value}</output>
        </Tabs>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("tabpanel").textContent).toBe("Notes panel");
    await userEvent.click(screen.getByRole("tab", { name: "Overview" }));
    expect(screen.getByRole("status").textContent).toBe("Overview");
  });

  it("slides a bg-control pill behind the chosen tab with variant pills, with no line under the row, and moves by arrow key", async () => {
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="never">
        <Customer variant="pills" />
      </ButteryProvider>,
    );
    const row = document.querySelector<HTMLElement>('[data-bt-part="row"]');
    const list = screen.getByRole("tablist", { name: "Customer" });
    if (!row) throw new Error("No row.");
    expect(getComputedStyle(row).borderBottomWidth).toBe("0px");
    expect(getComputedStyle(list).columnGap).toBe("4px");
    const overview = screen.getByRole("tab", { name: "Overview" });
    expect(getComputedStyle(overview).borderTopLeftRadius).toBe("9999px");
    const pill = indicatorIn(overview);
    expect(getComputedStyle(pill).backgroundColor).toBe(
      colorOf("--bt-bg-control"),
    );
    expect(getComputedStyle(pill).boxShadow).toBe("none");
    const rest = overview.getBoundingClientRect();
    expect(sameBox(pill.getBoundingClientRect(), rest)).toEqual([0, 0, 0, 0]);
    overview.focus();
    await browser.keyboard("{ArrowRight}");
    const orders = screen.getByRole("tab", { name: "Orders" });
    expect(orders.getAttribute("aria-selected")).toBe("true");
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const moving = indicatorIn(orders).getBoundingClientRect();
    expect(moving.left).toBeGreaterThan(rest.left);
    expect(moving.left).toBeLessThan(orders.getBoundingClientRect().left);
    expect(Math.round(moving.top - rest.top)).toBe(0);
    expect(Math.round(moving.height - rest.height)).toBe(0);
    await settled();
    expect(
      sameBox(
        indicatorIn(orders).getBoundingClientRect(),
        orders.getBoundingClientRect(),
      ),
    ).toEqual([0, 0, 0, 0]);
  });

  it("raises the chosen tab on a bg-control track with variant boxed, its corners concentric with the track's", async () => {
    render(<Customer variant="boxed" />);
    const row = document.querySelector<HTMLElement>('[data-bt-part="row"]');
    const list = screen.getByRole("tablist", { name: "Customer" });
    if (!row) throw new Error("No row.");
    const track = getComputedStyle(list);
    expect(getComputedStyle(row).borderBottomWidth).toBe("0px");
    expect(track.backgroundColor).toBe(colorOf("--bt-bg-control"));
    expect(track.paddingTop).toBe("2px");
    expect(track.borderTopLeftRadius).toBe("12px");
    expect(list.getBoundingClientRect().height).toBe(36);
    await userEvent.click(screen.getByRole("tab", { name: "Payments" }));
    await settled();
    const payments = screen.getByRole("tab", { name: "Payments" });
    expect(payments.getBoundingClientRect().height).toBe(32);
    expect(getComputedStyle(payments).borderTopLeftRadius).toBe("10px");
    const raised = indicatorIn(payments);
    expect(getComputedStyle(raised).backgroundColor).toBe(
      colorOf("--bt-bg-raised"),
    );
    expect(getComputedStyle(raised).boxShadow).not.toBe("none");
    expect(
      sameBox(raised.getBoundingClientRect(), payments.getBoundingClientRect()),
    ).toEqual([0, 0, 0, 0]);
    expect(screen.getByRole("tabpanel").textContent).toBe("Payments panel");
  });
});
