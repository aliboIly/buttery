import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ColumnSettings } from "@buttery/react";

const COLUMNS = [
  { id: "name", label: "Customer" },
  { id: "email", label: "Email" },
  { id: "orders", label: "Orders" },
  { id: "spent", label: "Spent" },
];

/** The columns alone: it keeps its own layout and reports each change, here as a count. */
export function ColumnsCount(): ReactElement {
  const [shown, setShown] = useState(COLUMNS.length);
  return (
    <Inline gap={3} align="center">
      <ColumnSettings
        columns={COLUMNS}
        onLayoutChange={(layout) => {
          setShown(layout.visible.size);
        }}
      />
      <Text variant="body-sm" tone="secondary">
        {`Showing ${String(shown)} of ${String(COLUMNS.length)} columns`}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Columns");
  await press("checkbox", "Spent");
  await see("Showing 3 of 4 columns");
};
