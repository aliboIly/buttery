import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { PreferencesMatrix } from "./PreferencesMatrix.tsx";
import type { PreferenceTab } from "./PreferencesMatrix.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const CHANNELS = [
  { id: "email", label: "Email" },
  { id: "text", label: "Text" },
  { id: "push", label: "Push" },
];

const TABS: readonly PreferenceTab[] = [
  {
    id: "shop",
    label: "Shop",
    groups: [
      {
        id: "money",
        title: "Money",
        rows: [
          { id: "payouts", label: "Payouts", description: "When one is sent" },
          {
            id: "disputes",
            label: "Disputes",
            locked: { email: true, text: false },
          },
        ],
      },
      {
        id: "stock",
        title: "Stock",
        rows: [{ id: "low", label: "Low green coffee" }],
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    groups: [
      {
        id: "people",
        title: "People",
        rows: [{ id: "joined", label: "Someone joins" }],
      },
    ],
  },
];

function Matrix(props: {
  readonly onValueChange?: (
    value: Readonly<Record<string, readonly string[]>>,
  ) => void;
  readonly tabs?: readonly PreferenceTab[];
  readonly defaultValue?: Readonly<Record<string, readonly string[]>>;
}): ReactElement {
  return (
    <div style={{ inlineSize: "720px" }}>
      <PreferencesMatrix
        label="Notifications"
        channels={CHANNELS}
        tabs={props.tabs ?? TABS}
        defaultValue={props.defaultValue ?? { payouts: ["email"] }}
        onValueChange={props.onValueChange}
      />
    </div>
  );
}

describe("PreferencesMatrix", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PreferencesMatrix
        ref={ref}
        label="Notifications"
        channels={CHANNELS}
        tabs={TABS}
        className="custom"
        data-testid="matrix"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("PreferencesMatrix");
    expect(ref.current?.dataset["testid"]).toBe("matrix");
    expect(ref.current?.className).toBe("bt-preferences-matrix custom");
    expect(screen.getByRole("group", { name: "Notifications" })).toBe(
      ref.current,
    );
  });

  it("makes each group a table whose heading row repeats the channels", () => {
    render(<Matrix />);
    const money = screen.getByRole("table", { name: "Money" });
    const stock = screen.getByRole("table", { name: "Stock" });
    for (const table of [money, stock])
      expect(
        within(table)
          .getAllByRole("columnheader")
          .map((cell) => cell.textContent)
          .slice(1),
      ).toEqual(["Email", "Text", "Push"]);
    expect(
      within(money).getByRole("rowheader", { name: /Payouts/ }),
    ).toBeTruthy();
  });

  it("names each box for its channel and row, ticks it from the value and reports the whole value", async () => {
    const onValueChange = vi.fn();
    render(<Matrix onValueChange={onValueChange} />);
    const email = screen.getByRole("checkbox", { name: "Email for Payouts" });
    expect(email.getAttribute("aria-checked")).toBe("true");
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Push for Payouts" }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith({
      payouts: ["email", "push"],
      disputes: ["email"],
    });
    await userEvent.click(email);
    expect(onValueChange).toHaveBeenLastCalledWith({
      payouts: ["push"],
      disputes: ["email"],
    });
  });

  it("reports a locked channel as it's held, whatever the value said", async () => {
    const onValueChange = vi.fn();
    render(
      <Matrix
        onValueChange={onValueChange}
        defaultValue={{ disputes: ["text"] }}
      />,
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Push for Disputes" }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith({
      disputes: ["push", "email"],
    });
  });

  it("holds a locked cell at its value, greyed and disabled", () => {
    render(<Matrix />);
    const on = screen.getByRole("checkbox", { name: "Email for Disputes" });
    const off = screen.getByRole("checkbox", { name: "Text for Disputes" });
    expect(on.getAttribute("aria-checked")).toBe("true");
    expect(off.getAttribute("aria-checked")).toBe("false");
    expect(on.hasAttribute("disabled")).toBe(true);
    expect(off.hasAttribute("disabled")).toBe(true);
    expect(
      screen
        .getByRole("checkbox", { name: "Push for Disputes" })
        .hasAttribute("disabled"),
    ).toBe(false);
  });

  it("switches tabs with more than one, and shows no tab row with one", async () => {
    render(<Matrix />);
    expect(screen.getByRole("tablist", { name: "Notifications" })).toBeTruthy();
    await userEvent.click(screen.getByRole("tab", { name: "Team" }));
    expect(screen.getByRole("table", { name: "People" })).toBeTruthy();
    expect(screen.queryByRole("table", { name: "Money" })).toBeNull();
    cleanup();
    render(<Matrix tabs={TABS.slice(0, 1)} />);
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getByRole("table", { name: "Money" })).toBeTruthy();
  });

  it("puts its first group the tabs' gap under the tab row, and at its top with no tab row", () => {
    render(<Matrix />);
    const row = screen
      .getByRole("tablist")
      .closest(".bt-tabs-row")
      ?.getBoundingClientRect();
    if (!row) throw new Error("No tab row.");
    expect(
      screen.getByRole("table", { name: "Money" }).getBoundingClientRect().top -
        row.bottom,
    ).toBe(24);
    cleanup();
    render(<Matrix tabs={TABS.slice(0, 1)} />);
    expect(
      screen.getByRole("table", { name: "Money" }).getBoundingClientRect().top,
    ).toBe(
      screen
        .getByRole("group", { name: "Notifications" })
        .getBoundingClientRect().top,
    );
  });

  it("draws its row lines between its own rows, not inside the checkboxes", () => {
    render(<Matrix />);
    const row = screen
      .getByRole("rowheader", { name: /Payouts/ })
      .closest("tr");
    if (!row) throw new Error("No row.");
    expect(getComputedStyle(row).borderTopWidth).toBe("1px");
    const inside = screen
      .getByRole("checkbox", { name: "Email for Payouts" })
      .closest('[data-bt="Checkbox"]')
      ?.querySelector('[data-bt-part="row"]');
    if (!inside) throw new Error("No checkbox row.");
    expect(getComputedStyle(inside).borderTopWidth).toBe("0px");
  });

  it("centers each box in a channel column 64 wide", () => {
    render(<Matrix />);
    const header = screen
      .getByRole("table", { name: "Money" })
      .querySelector('[data-bt-part="channel"]');
    if (!header) throw new Error("No channel header.");
    const column = header.getBoundingClientRect();
    expect(column.width).toBe(64);
    const box = screen
      .getByRole("checkbox", { name: "Email for Payouts" })
      .getBoundingClientRect();
    expect(
      Math.abs(box.left + box.width / 2 - (column.left + column.width / 2)),
    ).toBeLessThanOrEqual(0.5);
  });

  it("sets a row's line 4px under its label", () => {
    render(<Matrix />);
    const label = screen.getByText("Payouts", {
      selector: '[data-bt-part="topic-text"] > span',
    });
    const line = screen.getByText("When one is sent");
    expect(
      line.getBoundingClientRect().top - label.getBoundingClientRect().bottom,
    ).toBe(4);
  });
});
