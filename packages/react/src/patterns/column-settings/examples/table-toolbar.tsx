import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { ColumnSettings, SearchField } from "@buttery/react";
import type { ColumnLayout } from "@buttery/react";

const COLUMNS = [
  { id: "name", label: "Customer" },
  { id: "email", label: "Email" },
  { id: "orders", label: "Orders" },
  { id: "spent", label: "Spent" },
];

/** A table's toolbar: search on one side, the column settings on the other. */
export function TableToolbar(): ReactElement {
  const [layout, setLayout] = useState<ColumnLayout>({
    order: COLUMNS.map((column) => column.id),
    visible: new Set(COLUMNS.map((column) => column.id)),
  });
  return (
    <Inline gap={3} align="center">
      <SearchField label="Search customers" />
      <ColumnSettings
        columns={COLUMNS}
        layout={layout}
        onLayoutChange={setLayout}
      />
    </Inline>
  );
}
