import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { NumberField } from "@butteryui/react";

/** A scale factor in tenths, from 0.1 to 4, saved once each change is final rather than on every keystroke. */
export function ScaleFactor(): ReactElement {
  const [saved, setSaved] = useState<number | undefined>(undefined);
  return (
    <Stack gap={2} align="start">
      <NumberField
        label="Scale"
        step={0.1}
        min={0.1}
        max={4}
        defaultValue={1}
        onValueCommit={setSaved}
      />
      <Text variant="caption" tone="secondary">
        {saved === undefined
          ? "No changes yet"
          : `Saved at ${saved.toFixed(1)}×`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("spinbutton", "Scale");
  await key("ArrowUp");
  await see("Saved at 1.1×");
};
