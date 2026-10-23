import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { DataTable, SegmentedControl } from "@butteryui/react";

interface Activity {
  readonly id: string;
  readonly what: string;
  readonly when: string;
}

const ACTIVITY: readonly Activity[] = [
  { id: "a1", what: "Ines Vale paid ORD-2041", when: "2 min ago" },
  { id: "a2", what: "Guji came back in stock", when: "1 hr ago" },
  { id: "a3", what: "Tomas Reyes paused his plan", when: "Yesterday" },
];

type Size = "compact" | "default";

/** Both sizes: compact for a short list in an overview, with 32px rows and no selection or pagination, and the default with them. */
export function RecentActivity(): ReactElement {
  const [size, setSize] = useState<Size>("compact");
  return (
    <Stack gap={3}>
      <SegmentedControl<Size>
        label="Table size"
        options={[
          { value: "compact", label: "Compact" },
          { value: "default", label: "Default" },
        ]}
        value={size}
        onValueChange={setSize}
      />
      <DataTable
        label="Recent activity"
        size={size}
        {...(size === "default"
          ? {
              selectable: true,
              pagination: {
                page: 1,
                pageSize: 10,
                total: ACTIVITY.length,
                onPageChange: () => undefined,
              },
            }
          : {})}
        columns={[
          {
            id: "what",
            header: "Activity",
            minWidth: "lg",
            grow: 3,
            cell: (item) => item.what,
          },
          {
            id: "when",
            header: "When",
            align: "end",
            cell: (item) => item.when,
          },
        ]}
        rows={ACTIVITY}
        rowKey={(item) => item.id}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Guji came back in stock");
  await press("radio", "Default");
  await see("1–3 of 3");
};
