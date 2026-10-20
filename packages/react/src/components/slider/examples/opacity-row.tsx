import type { ReactElement } from "react";
import { Slider } from "@buttery/react";

/** An opacity in percent, saved when the drag ends rather than on every frame. */
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
