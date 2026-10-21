import type { ReactElement } from "react";
import { DataTable } from "@buttery/react";

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

/** A short list in an overview: compact, with no selection or pagination. */
export function RecentActivity(): ReactElement {
  return (
    <DataTable
      label="Recent activity"
      size="compact"
      columns={[
        {
          id: "what",
          header: "Activity",
          minWidth: "lg",
          grow: 3,
          cell: (item) => item.what,
        },
        { id: "when", header: "When", align: "end", cell: (item) => item.when },
      ]}
      rows={ACTIVITY}
      rowKey={(item) => item.id}
    />
  );
}
