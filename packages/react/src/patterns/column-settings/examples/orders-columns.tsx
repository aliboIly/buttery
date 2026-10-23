import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ColumnSettings } from "@butteryui/react";
import type { ColumnLayout } from "@butteryui/react";

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
  const shown = layout.order
    .filter((id) => layout.visible.has(id))
    .map((id) => COLUMNS.find((column) => column.id === id)?.label ?? id);
  return (
    <Inline gap={3} align="center">
      <ColumnSettings
        columns={COLUMNS}
        defaultLayout={DEFAULTS}
        layout={layout}
        onLayoutChange={setLayout}
      />
      <Text variant="body-sm">{shown.join(" · ")}</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Columns");
  await press("checkbox", "Placed");
  await see("Order · Customer · Status · Placed · Total");
  await press("button", "Reset");
  await see("Order · Customer · Status · Total");
};
