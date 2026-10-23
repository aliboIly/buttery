import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Chip } from "@buttery/react";

/** A reset beside a value, unavailable while the value is already the default, keeping focus after a reset. */
export function ResetRotation(): ReactElement {
  const [rotation, setRotation] = useState(-8);
  return (
    <Inline gap={2} align="center">
      <Text variant="label">Rotation {rotation}°</Text>
      <Chip
        aria-disabled={rotation === 0}
        onClick={() => {
          setRotation(0);
        }}
      >
        Reset
      </Chip>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Rotation -8°");
  await press("button", "Reset");
  await see("Rotation 0°");
};
