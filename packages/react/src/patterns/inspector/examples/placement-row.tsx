import { useState } from "react";
import type { ReactElement } from "react";
import { AnchorGrid, Chip, Inspector, TiltPad } from "@buttery/react";
import type { Anchor, TiltValue } from "@buttery/react";

/** A split row: a tilt pad with its reset chip beside an anchor grid, inside a section. */
export function PlacementRow(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0, y: 0 });
  const [anchor, setAnchor] = useState<Anchor>("center");
  return (
    <Inspector.Section title="Position">
      <Inspector.Row.Split>
        <Inspector.Row
          label="Tilt"
          extra={
            <Chip
              disabled={tilt.x === 0 && tilt.y === 0}
              onClick={() => {
                setTilt({ x: 0, y: 0 });
              }}
            >
              Reset
            </Chip>
          }
        >
          <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
        </Inspector.Row>
        <Inspector.Row label="Position">
          <AnchorGrid
            label="Position"
            value={anchor}
            onValueChange={setAnchor}
          />
        </Inspector.Row>
      </Inspector.Row.Split>
    </Inspector.Section>
  );
}
