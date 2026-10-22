import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", /^Subscriptions by state/);
  await press("option", "Paused · 27");
  await see("Paused · 27");
};
