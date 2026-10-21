import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { ColumnSettings } from "@buttery/react";
import type { ColumnLayout } from "@buttery/react";

const COLUMNS = [
  { id: "order", label: "Order" },
  { id: "customer", label: "Customer" },
  { id: "status", label: "Status" },
  { id: "placed", label: "Placed" },
  { id: "total", label: "Total" },
];

function Columns(): ReactElement {
  const [layout, setLayout] = useState<ColumnLayout>({
    order: COLUMNS.map((column) => column.id),
    visible: new Set(COLUMNS.map((column) => column.id)),
  });
  return (
    <Inline gap={3} align="center">
      <ColumnSettings
        columns={COLUMNS}
        layout={layout}
        onLayoutChange={setLayout}
      />
      <Text variant="body-sm">
        {layout.order.filter((id) => layout.visible.has(id)).join(" · ")}
      </Text>
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Show, hide and reorder",
    description:
      "Drag a column by its grip, or press Alt and Up or Down on it; Reset puts them back.",
    render: () => <Columns />,
  },
];
