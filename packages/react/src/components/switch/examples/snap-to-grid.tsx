import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Switch } from "@buttery/react";

/** A setting kept in state: it takes effect the moment it's flipped, and Restore default sets it back from outside. */
export function SnapToGrid(): ReactElement {
  const [snap, setSnap] = useState(true);
  return (
    <Stack gap={3} align="start">
      <Switch
        label="Snap to the grid"
        checked={snap}
        onCheckedChange={setSnap}
      />
      <Text variant="body" tone="secondary">
        {snap ? "Cards snap to the 8px grid" : "Cards move freely"}
      </Text>
      <Button
        size="sm"
        variant="ghost"
        aria-disabled={snap}
        onClick={() => {
          setSnap(true);
        }}
      >
        Restore default
      </Button>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("switch", "Snap to the grid");
  await see("Cards move freely");
  await press("button", "Restore default");
  await see("Cards snap to the 8px grid");
};
