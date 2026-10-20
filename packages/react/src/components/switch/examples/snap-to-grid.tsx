import { useState } from "react";
import type { ReactElement } from "react";
import { Switch } from "@buttery/react";

/** A setting that takes effect the moment it's flipped. */
export function SnapToGrid(): ReactElement {
  const [snap, setSnap] = useState(true);
  return (
    <Switch label="Snap to the grid" checked={snap} onCheckedChange={setSnap} />
  );
}
