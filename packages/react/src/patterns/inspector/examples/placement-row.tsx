import { useState } from "react";
import type { ReactElement } from "react";
import { AnchorGrid, Chip, Inspector, TiltPad } from "@buttery/react";
import type { Anchor, TiltValue } from "@buttery/react";

const LEVEL: TiltValue = { x: 0, y: 0 };

/** A split row: a lean pad with the chip that lays it flat, beside an anchor grid, inside a section. */
export function PlacementRow(): ReactElement {
  const [lean, setLean] = useState<TiltValue>(LEVEL);
  const [anchor, setAnchor] = useState<Anchor>("center");
  return (
    <Inspector.Section title="Placement">
      <Inspector.Row.Split>
        <Inspector.Row
          label="Lean"
          extra={
            <Chip
              aria-disabled={lean.x === 0 && lean.y === 0}
              onClick={() => {
                setLean(LEVEL);
              }}
            >
              Flat
            </Chip>
          }
        >
          <TiltPad label="Lean" value={lean} onValueChange={setLean} />
        </Inspector.Row>
        <Inspector.Row label="Anchor">
          <AnchorGrid label="Anchor" value={anchor} onValueChange={setAnchor} />
        </Inspector.Row>
      </Inspector.Row.Split>
    </Inspector.Section>
  );
}
