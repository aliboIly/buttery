import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { Chip, TiltPad } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

/** A tilt pad paired with a reset chip that turns off once it's level. */
export function TiltWithReset(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0, y: 0 });
  return (
    <Inline gap={2} align="center">
      <Chip
        disabled={tilt.x === 0 && tilt.y === 0}
        onClick={() => {
          setTilt({ x: 0, y: 0 });
        }}
      >
        Reset
      </Chip>
      <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
    </Inline>
  );
}
