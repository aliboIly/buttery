import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { Chip, TiltPad } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

const LEVEL: TiltValue = { x: 0, y: 0 };

/** A lean pad paired with a chip that lays it flat, quiet but still focusable once it is. */
export function TiltWithReset(): ReactElement {
  const [lean, setLean] = useState<TiltValue>(LEVEL);
  return (
    <Inline gap={2} align="center">
      <Chip
        aria-disabled={lean.x === 0 && lean.y === 0}
        onClick={() => {
          setLean(LEVEL);
        }}
      >
        Flat
      </Chip>
      <TiltPad label="Lean" value={lean} onValueChange={setLean} />
    </Inline>
  );
}
