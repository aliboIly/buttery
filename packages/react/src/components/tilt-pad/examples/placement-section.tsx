import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Chip, Inspector, Slider, TiltPad, ValueBadge } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

const LEVEL: TiltValue = { x: 0, y: 0 };

function leanOf({ x, y }: TiltValue): string {
  const amount = (value: number): string =>
    `${String(Math.round(Math.abs(value) * 100))}%`;
  const parts: string[] = [];
  if (x !== 0) parts.push(`${x < 0 ? "←" : "→"} ${amount(x)}`);
  if (y !== 0) parts.push(`${y < 0 ? "↑" : "↓"} ${amount(y)}`);
  return parts.length === 0 ? "Level" : parts.join(" ");
}

/** An inspector's placement section: a lean row with its value and a chip that lays it flat, over a turn slider, and Reset for both. */
export function PlacementSection(): ReactElement {
  const [lean, setLean] = useState<TiltValue>(LEVEL);
  const [turn, setTurn] = useState(0);
  const level = lean.x === 0 && lean.y === 0;
  return (
    <Inspector label="Card settings">
      <Inspector.Section
        title="Placement"
        resettable={!level || turn !== 0}
        onReset={() => {
          setLean(LEVEL);
          setTurn(0);
        }}
      >
        <Inspector.Row
          label="Lean"
          extra={
            <Inline gap={2}>
              <ValueBadge reserve={["→ 71% ↓ 71%"]}>{leanOf(lean)}</ValueBadge>
              <Chip
                aria-disabled={level}
                onClick={() => {
                  setLean(LEVEL);
                }}
              >
                Flat
              </Chip>
            </Inline>
          }
        >
          <TiltPad label="Lean" value={lean} onValueChange={setLean} />
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
  await press("group", "Lean");
  await key("ArrowDown");
  await key("ArrowDown");
  await key("ArrowDown");
  await see("↓ 30%");
  await press("button", "Reset Placement");
  await see("Level");
};
