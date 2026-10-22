import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ColumnSettings } from "@buttery/react";
import type { ColumnLayout } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "ColumnSettings",
  description:
    "A button that opens a list of a table's columns to show, hide and reorder by dragging or with Alt and the arrow keys.",
  order: 50,
  status: "new",
  since: "0.7.0",
};

const COLUMNS = [
  { id: "order", label: "Order" },
  { id: "customer", label: "Customer" },
  { id: "status", label: "Status" },
  { id: "placed", label: "Placed" },
  { id: "total", label: "Total" },
];

function Columns({
  count = COLUMNS.length,
}: {
  readonly count?: number;
}): ReactElement {
  const columns = COLUMNS.slice(0, count);
  const [layout, setLayout] = useState<ColumnLayout>({
    order: columns.map((column) => column.id),
    visible: new Set(columns.map((column) => column.id)),
  });
  return (
    <Inline gap={3} align="center">
      <ColumnSettings
        columns={columns}
        layout={layout}
        onLayoutChange={setLayout}
      />
      <Text variant="body-sm">
        {layout.order
          .filter((id) => layout.visible.has(id))
          .map((id) => columns.find((column) => column.id === id)?.label ?? id)
          .join(" · ")}
      </Text>
    </Inline>
  );
}

export const live: LiveDemo = {
  controls: {
    columns: { kind: "number", initial: 4, min: 2, max: 5, step: 1 },
  },
  render: ({ columns }) => (
    <Columns
      key={String(columns)}
      count={typeof columns === "number" ? columns : COLUMNS.length}
    />
  ),
  code: ({ columns }) =>
    [
      "<ColumnSettings",
      "  columns={[",
      ...COLUMNS.slice(
        0,
        typeof columns === "number" ? columns : COLUMNS.length,
      ).map(
        (column) => `    { id: "${column.id}", label: "${column.label}" },`,
      ),
      "  ]}",
      "  layout={layout}",
      "  onLayoutChange={setLayout}",
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Show, hide and reorder",
    description:
      "Drag a column by its grip, or press Alt and Up or Down on it; Reset puts them back.",
    render: () => <Columns />,
  },
];
