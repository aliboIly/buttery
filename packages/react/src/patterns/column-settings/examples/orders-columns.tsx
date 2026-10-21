import { useState } from "react";
import type { ReactElement } from "react";
import { ColumnSettings } from "@buttery/react";
import type { ColumnLayout } from "@buttery/react";

const COLUMNS = [
  { id: "order", label: "Order" },
  { id: "customer", label: "Customer" },
  { id: "status", label: "Status" },
  { id: "placed", label: "Placed" },
  { id: "total", label: "Total" },
];

const DEFAULTS: ColumnLayout = {
  order: COLUMNS.map((column) => column.id),
  visible: new Set(["order", "customer", "status", "total"]),
};

/** Columns for an orders table, Placed hidden at first: hide some, drag the rest, and Reset hides Placed again. */
export function OrdersColumns(): ReactElement {
  const [layout, setLayout] = useState(DEFAULTS);
  return (
    <ColumnSettings
      columns={COLUMNS}
      defaultLayout={DEFAULTS}
      layout={layout}
      onLayoutChange={setLayout}
    />
  );
}
