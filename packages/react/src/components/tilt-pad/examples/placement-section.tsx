import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Chip, Inspector, Slider, TiltPad, ValueBadge } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

const LEVEL: TiltValue = { x: 0, y: 0 };

function tiltOf({ x, y }: TiltValue): string {
  const amount = (value: number): string =>
    `${String(Math.round(Math.abs(value) * 100))}%`;
  const parts: string[] = [];
  if (x !== 0) parts.push(`${x < 0 ? "←" : "→"} ${amount(x)}`);
  if (y !== 0) parts.push(`${y < 0 ? "↑" : "↓"} ${amount(y)}`);
  return parts.length === 0 ? "Level" : parts.join(" ");
}

/** An inspector's placement section: a tilt row with its value and a chip that lays it flat, over a turn slider, and Reset for both. */
export function PlacementSection(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>(LEVEL);
  const [turn, setTurn] = useState(0);
  const level = tilt.x === 0 && tilt.y === 0;
  return (
    <Inspector label="Picture settings">
      <Inspector.Section
        title="Placement"
        resettable={!level || turn !== 0}
        onReset={() => {
          setTilt(LEVEL);
          setTurn(0);
        }}
      >
        <Inspector.Row
          label="Tilt"
          extra={
            <Inline gap={2}>
              <ValueBadge reserve={["→ 71% ↓ 71%"]}>{tiltOf(tilt)}</ValueBadge>
              <Chip
                aria-disabled={level}
                onClick={() => {
                  setTilt(LEVEL);
                }}
              >
                Flat
              </Chip>
            </Inline>
          }
        >
          <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Turn"
            min={-180}
            max={180}
            format="°"
            detents={[0]}
            resetValue={0}
            value={turn}
            onValueChange={setTurn}
          />
        </Inspector.Row>
      </Inspector.Section>
    </Inspector>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("group", "Tilt");
  await key("ArrowDown");
  await key("ArrowDown");
  await key("ArrowDown");
  await see("↓ 30%");
  await press("button", "Reset Placement");
  await see("Level");
};
