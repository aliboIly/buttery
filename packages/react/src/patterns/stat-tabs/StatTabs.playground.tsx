import type { DemoSection } from "@buttery/core";
import { StatTabs } from "@buttery/react";

export const demos: readonly DemoSection[] = [
  {
    title: "Counts per state",
    description:
      "The panel slides to the tab chosen; under 640px of room it becomes a select.",
    render: () => (
      <StatTabs
        label="Orders by state"
        tabs={[
          { value: "all", label: "All", count: 1284 },
          { value: "unpaid", label: "Unpaid", count: 12 },
          { value: "roasting", label: "Roasting", count: 31 },
          { value: "shipped", label: "Shipped", count: 1241 },
        ]}
      />
    ),
  },
];
