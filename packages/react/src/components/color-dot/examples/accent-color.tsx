import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ColorDot } from "@buttery/react";

const PRESETS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0f766e",
];

/** A dot that keeps its own color and opens the picker with presets, reporting each color it settles on once. */
export function AccentColor(): ReactElement {
  const [saved, setSaved] = useState("#2563eb");
  return (
    <Inline gap={3} align="center">
      <ColorDot
        label="Accent"
        defaultValue="#2563eb"
        presets={PRESETS}
        onValueCommit={setSaved}
      />
      <Text variant="body-sm" tone="secondary">{`Saved ${saved}`}</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Accent, #2563eb");
  await press("radio", "#16a34a");
  await see("Saved #16a34a");
};
