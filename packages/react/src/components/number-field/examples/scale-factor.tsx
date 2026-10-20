import type { ReactElement } from "react";
import { NumberField } from "@buttery/react";

/** A scale factor in tenths, from 0.1 to 4. */
export function ScaleFactor(): ReactElement {
  return (
    <NumberField label="Scale" step={0.1} min={0.1} max={4} defaultValue={1} />
  );
}
