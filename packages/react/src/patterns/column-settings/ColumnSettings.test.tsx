import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
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
  it("is its button, which takes the ref, class, style and other props, closed or open", async () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ColumnSettings
        ref={ref}
        columns={COLUMNS}
        className="custom"
        style={{ opacity: 0.5 }}
        data-testid="columns"
      />,
    );
    const button = screen.getByTestId("columns");
    expect(ref.current).toBe(button);
    expect(button.dataset["bt"]).toBe("ColumnSettings");
    expect(button.className).toContain("bt-column-settings custom");
    expect(button.style.opacity).toBe("0.5");
    expect(button.getAttribute("aria-label")).toBe("Columns");
    await open();
    expect(ref.current?.dataset["bt"]).toBe("ColumnSettings");
    expect(
      document
        .querySelector('[data-bt-part="panel"]')
        ?.classList.contains("bt-column-settings-panel"),
    ).toBe(true);
  });

  it("starts on defaultLayout when uncontrolled, and Reset puts that back rather than every column", async () => {
    const changes: string[] = [];
    render(
      <ColumnSettings
        columns={COLUMNS}
        defaultLayout={{
          order: COLUMNS.map((column) => column.id),
          visible: new Set(["order", "customer", "status"]),
        }}
        onLayoutChange={(layout) => {
          changes.push([...layout.visible].sort().join(","));
        }}
      />,
    );
    const list = await open();
    const total = within(list).getByRole("checkbox", { name: "Total" });
    expect(total.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(total);
    expect(total.getAttribute("aria-checked")).toBe("true");
    await userEvent.click(within(list).getByRole("button", { name: "Reset" }));
    expect(total.getAttribute("aria-checked")).toBe("false");
    expect(changes).toEqual([
      "customer,order,status,total",
      "customer,order,status",
    ]);
  });

  it("opens with defaultOpen, and stays as a controlled open says", async () => {
    render(<ColumnSettings columns={COLUMNS} defaultOpen />);
    expect(screen.getByRole("dialog", { name: "Columns" })).toBeTruthy();
    cleanup();
    render(<ColumnSettings columns={COLUMNS} open={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a 240px list of the columns from its Columns button, the first always shown", async () => {
    render(<Settings />);
    const list = await open();
    const settings = list.querySelector<HTMLElement>('[data-bt-part="panel"]');
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
