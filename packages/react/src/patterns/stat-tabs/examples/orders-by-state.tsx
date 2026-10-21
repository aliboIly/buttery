import { useState } from "react";
import type { ReactElement } from "react";
import { StatTabs } from "@buttery/react";

/** Orders by state over a table: each tab says how many orders it holds. */
export function OrdersByState(): ReactElement {
  const [state, setState] = useState("all");
  return (
    <StatTabs
      label="Orders by state"
      tabs={[
        { value: "all", label: "All", count: 1284 },
        { value: "unpaid", label: "Unpaid", count: 12 },
        { value: "roasting", label: "Roasting", count: 31 },
        { value: "shipped", label: "Shipped", count: 1241 },
      ]}
      value={state}
      onValueChange={setState}
    />
  );
}
