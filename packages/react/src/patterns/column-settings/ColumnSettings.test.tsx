import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ColumnSettings } from "./ColumnSettings.tsx";
import type { ColumnLayout } from "./ColumnSettings.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const COLUMNS = [
  { id: "order", label: "Order" },
  { id: "customer", label: "Customer" },
  { id: "status", label: "Status" },
  { id: "total", label: "Total" },
];

function Settings(): ReactElement {
  const [layout, setLayout] = useState<ColumnLayout>({
    order: COLUMNS.map((column) => column.id),
    visible: new Set(COLUMNS.map((column) => column.id)),
  });
  return (
    <>
      <ColumnSettings
        columns={COLUMNS}
        layout={layout}
        onLayoutChange={setLayout}
      />
      <output>{`${layout.order.join(",")} | ${[...layout.visible].sort().join(",")}`}</output>
    </>
  );
}

async function open(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole("button", { name: "Columns" }));
  return screen.findByRole("dialog", { name: "Columns" });
}

describe("ColumnSettings", () => {
  it("opens a 240px list of the columns from its Columns button, the first always shown", async () => {
    render(<Settings />);
    const list = await open();
    const settings = list.querySelector<HTMLElement>(
      '[data-bt="ColumnSettings"]',
    );
    expect(settings?.offsetWidth).toBe(240);
    const order = within(list).getByRole("checkbox", { name: "Order" });
    expect(order.getAttribute("aria-checked")).toBe("true");
    expect(order.hasAttribute("disabled")).toBe(true);
  });

  it("hides and shows columns with their checkboxes", async () => {
    render(<Settings />);
    const list = await open();
    await userEvent.click(
      within(list).getByRole("checkbox", { name: "Status" }),
    );
    expect(screen.getByRole("status").textContent).toBe(
      "order,customer,status,total | customer,order,total",
    );
  });

  it("moves a column with Alt and the arrow keys, and Reset puts the defaults back", async () => {
    render(<Settings />);
    const list = await open();
    within(list).getByRole("button", { name: "Move Status" }).focus();
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(screen.getByRole("status").textContent).toBe(
      "order,status,customer,total | customer,order,status,total",
    );
    await userEvent.click(within(list).getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("status").textContent).toBe(
      "order,customer,status,total | customer,order,status,total",
    );
  });
});
