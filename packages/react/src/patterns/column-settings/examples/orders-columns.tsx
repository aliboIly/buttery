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

/** Columns for an orders table: hide some, drag the rest into the order you like. */
export function OrdersColumns(): ReactElement {
  const [layout, setLayout] = useState<ColumnLayout>({
    order: COLUMNS.map((column) => column.id),
    visible: new Set(["order", "customer", "status", "total"]),
  });
  return (
    <ColumnSettings
      columns={COLUMNS}
      layout={layout}
      onLayoutChange={setLayout}
    />
  );
}
