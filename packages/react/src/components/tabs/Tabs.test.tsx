import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { Tabs } from "./Tabs.tsx";

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

function Customer({ width = 800 }: { readonly width?: number }): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Tabs defaultValue="Overview" data-testid="tabs">
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

  it("draws the chosen tab's 2px underline on the row's line, as wide as the tab", async () => {
    render(<Customer />);
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
});
