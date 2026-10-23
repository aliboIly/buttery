import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Switch } from "@butteryui/react";

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
        {snap
          ? "Text on the gift card snaps to the 8px grid"
          : "Text on the gift card moves freely"}
      </Text>
      <Button
        size="sm"
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
  await see("Text on the gift card moves freely");
  await press("button", "Restore default");
  await see("Text on the gift card snaps to the 8px grid");
};
