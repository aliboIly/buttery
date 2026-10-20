import { useState } from "react";
import type { ReactElement } from "react";
import { AnchorGrid } from "@buttery/react";
import type { Anchor } from "@buttery/react";

const PLACE: Readonly<Record<Anchor, string>> = {
  "top-left": "start start",
  top: "start center",
  "top-right": "start end",
  left: "center start",
  center: "center center",
  right: "center end",
  "bottom-left": "end start",
  bottom: "end center",
  "bottom-right": "end end",
};

/** An anchor mapped to where a card sits in its frame, through CSS `place-items`. */
export function CardPlacement(): ReactElement {
  const [anchor, setAnchor] = useState<Anchor>("center");
  return (
    <>
      <AnchorGrid label="Position" value={anchor} onValueChange={setAnchor} />
      <output style={{ display: "grid", placeItems: PLACE[anchor] }}>
        <span>Launch card</span>
      </output>
    </>
  );
}
