import type { ReactElement } from "react";
import { AnchorGrid } from "@buttery/react";
import type { Anchor } from "@buttery/react";

/** A caption's corner, with the anchor names translated for screen readers. */
export function CaptionCorner({
  value,
  onValueChange,
}: {
  readonly value: Anchor;
  readonly onValueChange: (value: Anchor) => void;
}): ReactElement {
  return (
    <AnchorGrid
      label="Position de la légende"
      value={value}
      onValueChange={onValueChange}
      labels={{
        "top-left": "En haut à gauche",
        top: "En haut",
        "top-right": "En haut à droite",
        left: "À gauche",
        center: "Au centre",
        right: "À droite",
        "bottom-left": "En bas à gauche",
        bottom: "En bas",
        "bottom-right": "En bas à droite",
      }}
    />
  );
}
