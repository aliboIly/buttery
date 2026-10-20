import type { ReactElement } from "react";
import { Slider } from "@buttery/react";

/** An opacity in percent, saved when a drag ends or a reset lands rather than on every frame. */
export function OpacityRow(): ReactElement {
  return (
    <Slider
      label="Opacity"
      defaultValue={80}
      format="%"
      onValueCommit={() => undefined}
    />
  );
}
