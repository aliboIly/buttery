import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { PageHeader, ScopeBadge, Switch } from "@buttery/react";

/** A settings page's header with the badge after its title, through PageHeader's badge, over a setting it governs. */
export function PickupHoursPage(): ReactElement {
  const [sundays, setSundays] = useState(false);
  return (
    <Stack gap={6}>
      <PageHeader
        title="Pickup hours"
        badge={
          <ScopeBadge
            label="All shops"
            info="Changes here apply to every shop, not just this one."
          />
        }
        description="When cafés and customers can collect their orders."
      />
      <Stack gap={3}>
        <Switch
          label="Open for pickup on Sundays"
          checked={sundays}
          onCheckedChange={setSundays}
        />
        <Text variant="caption" tone="secondary">
          {sundays
            ? "Every shop opens for pickup on Sundays"
            : "Every shop is closed for pickup on Sundays"}
        </Text>
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "All shops");
  await see("Changes here apply to every shop, not just this one.");
  await press("switch", "Open for pickup on Sundays");
  await see("Every shop opens for pickup on Sundays");
};
