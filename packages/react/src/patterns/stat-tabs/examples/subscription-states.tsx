import type { ReactElement } from "react";
import { StatTabs } from "@buttery/react";

/** Subscriptions by state, uncontrolled, starting on Active. */
export function SubscriptionStates(): ReactElement {
  return (
    <StatTabs
      label="Subscriptions by state"
      defaultValue="active"
      tabs={[
        { value: "active", label: "Active", count: 312 },
        { value: "paused", label: "Paused", count: 27 },
        { value: "cancelled", label: "Cancelled", count: 54 },
      ]}
    />
  );
}
