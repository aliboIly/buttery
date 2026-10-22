import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Chip, TiltPad, ValueBadge } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

const LEVEL: TiltValue = { x: 0, y: 0 };

function leanOf({ x, y }: TiltValue): string {
  const amount = (value: number): string =>
    `${String(Math.round(Math.abs(value) * 100))}%`;
  const parts: string[] = [];
  if (x !== 0) parts.push(`${amount(x)} ${x < 0 ? "left" : "right"}`);
  if (y !== 0) parts.push(`${amount(y)} ${y < 0 ? "up" : "down"}`);
  return parts.length === 0 ? "Level" : parts.join(", ");
}

/** A lean pad paired with a chip that lays it flat, quiet but still focusable once it is. */
export function TiltWithReset(): ReactElement {
  const [lean, setLean] = useState<TiltValue>(LEVEL);
  return (
    <Inline gap={2} align="center">
      <ValueBadge reserve={["71% right, 71% down"]}>{leanOf(lean)}</ValueBadge>
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("group", "Lean");
  await key("ArrowRight");
  await key("ArrowRight");
  await see("20% right");
  await press("button", "Flat");
  await see("Level");
};
