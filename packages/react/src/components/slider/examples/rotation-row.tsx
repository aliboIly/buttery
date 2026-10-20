import { useState } from "react";
import type { ReactElement } from "react";
import { Slider } from "@buttery/react";

/** A rotation from -180° to 180° that catches at 0° while dragging and resets on double-click. */
export function RotationRow(): ReactElement {
  const [rotation, setRotation] = useState(0);
  return (
    <Slider
      label="Rotation"
      min={-180}
      max={180}
      format="°"
      detents={[0]}
      value={rotation}
      onValueChange={setRotation}
    />
  );
}
