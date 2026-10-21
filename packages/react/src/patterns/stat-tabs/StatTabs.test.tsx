import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatTabs } from "./StatTabs.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const TABS = [
  { value: "all", label: "All", count: 1284 },
  { value: "unpaid", label: "Unpaid", count: 12 },
  { value: "shipping", label: "Shipping", count: 48 },
];

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("StatTabs", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <StatTabs
        ref={ref}
        label="Orders"
        tabs={TABS}
        className="custom"
        data-testid="tabs"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("StatTabs");
    expect(ref.current?.dataset["testid"]).toBe("tabs");
    expect(ref.current?.className).toBe("bt-stat-tabs custom");
  });

  it("is a radio group of equal tabs in a 48px track, each with its name and count", async () => {
    render(
      <div style={{ inlineSize: "900px" }}>
        <StatTabs label="Orders by state" tabs={TABS} />
      </div>,
    );
    expect(
      screen.getByRole("radiogroup", { name: "Orders by state" }),
    ).toBeTruthy();
    const track = document.querySelector('[data-bt-part="track"]');
    expect(track?.getBoundingClientRect().height).toBe(48);
    const [all, unpaid] = screen.getAllByRole("radio");
    expect(all?.getBoundingClientRect().width).toBe(
      unpaid?.getBoundingClientRect().width,
    );
    expect(all?.textContent).toBe("All1,284");
    await settled();
    expect(all?.querySelector('[data-bt-part="indicator"]')).not.toBeNull();
  });

  it("chooses a tab, moving the panel to it", async () => {
    const onValueChange = vi.fn();
    render(
      <div style={{ inlineSize: "900px" }}>
        <StatTabs
          label="Orders by state"
          tabs={TABS}
          onValueChange={onValueChange}
        />
      </div>,
    );
    await userEvent.click(screen.getByRole("radio", { name: /Unpaid/ }));
    expect(onValueChange).toHaveBeenCalledWith("unpaid");
  });

  it("becomes a select under 640px", async () => {
    const onValueChange = vi.fn();
    render(
      <div style={{ inlineSize: "400px" }}>
        <StatTabs
          label="Orders by state"
          tabs={TABS}
          onValueChange={onValueChange}
        />
      </div>,
    );
    expect(screen.queryByRole("radiogroup")).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: /^Orders by state/ }),
    );
    await userEvent.click(
      await screen.findByRole("option", { name: "Shipping · 48" }),
    );
    expect(onValueChange).toHaveBeenCalledWith("shipping");
  });
});
