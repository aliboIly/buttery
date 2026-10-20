import { useState } from "react";
import type { ReactElement } from "react";
import { AnchorGrid } from "@buttery/react";
import type { Anchor } from "@buttery/react";

/** A caption's corner, with the anchor names translated for screen readers. */
export function CaptionCorner(): ReactElement {
  const [corner, setCorner] = useState<Anchor>("bottom-right");
  return (
    <AnchorGrid
      label="Position de la légende"
      value={corner}
      onValueChange={setCorner}
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
