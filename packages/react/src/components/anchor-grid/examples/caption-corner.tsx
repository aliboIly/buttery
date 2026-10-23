import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AnchorGrid } from "@butteryui/react";
import type { Anchor } from "@butteryui/react";

const LABELS: Readonly<Record<Anchor, string>> = {
  "top-left": "En haut à gauche",
  top: "En haut",
  "top-right": "En haut à droite",
  left: "À gauche",
  center: "Au centre",
  right: "À droite",
  "bottom-left": "En bas à gauche",
  bottom: "En bas",
  "bottom-right": "En bas à droite",
};

/** A caption's corner kept in state, with each anchor named in French for screen readers and beside the grid. */
export function CaptionCorner(): ReactElement {
  const [corner, setCorner] = useState<Anchor>("bottom-right");
  return (
    <Inline gap={3} align="center">
      <AnchorGrid
        label="Position de la légende"
        value={corner}
        onValueChange={setCorner}
        labels={LABELS}
      />
      <Text variant="body" tone="secondary">
        {LABELS[corner]}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("En bas à droite");
  await press("radio", "En haut à gauche");
  await see("En haut à gauche");
};
