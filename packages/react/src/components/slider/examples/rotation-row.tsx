import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Slider } from "@buttery/react";

/** A rotation from -180° to 180° that catches at 0° while dragging and goes back to 0° on a double-click or Backspace. */
export function RotationRow(): ReactElement {
  const [rotation, setRotation] = useState(0);
  return (
    <Slider
      label="Rotation"
      min={-180}
      max={180}
      format="°"
      detents={[0]}
      resetValue={0}
      value={rotation}
      onValueChange={setRotation}
    />
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ key, see }) => {
  await key("Tab");
  await key("PageUp");
  await see("10°");
  await key("Backspace");
  await see("0°");
};
