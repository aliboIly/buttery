import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { Chip } from "@buttery/react";

/** A reset beside a value, disabled while the value is already the default. */
export function ResetRotation(): ReactElement {
  const [rotation, setRotation] = useState(-8);
  return (
    <Inline gap={2} align="center">
      <Text variant="label">Rotation {rotation}°</Text>
      <Chip
        disabled={rotation === 0}
        onClick={() => {
          setRotation(0);
        }}
      >
        Reset
      </Chip>
    </Inline>
  );
}
