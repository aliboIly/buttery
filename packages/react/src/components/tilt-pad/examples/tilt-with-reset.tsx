import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Chip, TiltPad, ValueBadge } from "@butteryui/react";
import type { TiltValue } from "@butteryui/react";

const LEVEL: TiltValue = { x: 0, y: 0 };

function tiltOf({ x, y }: TiltValue): string {
  const amount = (value: number): string =>
    `${String(Math.round(Math.abs(value) * 100))}%`;
  const parts: string[] = [];
  if (x !== 0) parts.push(`${amount(x)} ${x < 0 ? "left" : "right"}`);
  if (y !== 0) parts.push(`${amount(y)} ${y < 0 ? "up" : "down"}`);
  return parts.length === 0 ? "Level" : parts.join(", ");
}

/** A tilt pad paired with a chip that lays it flat, quiet but still focusable once it is. */
export function TiltWithReset(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>(LEVEL);
  return (
    <Inline gap={2} align="center">
      <ValueBadge reserve={["71% right, 71% down"]}>{tiltOf(tilt)}</ValueBadge>
      <Chip
        aria-disabled={tilt.x === 0 && tilt.y === 0}
        onClick={() => {
          setTilt(LEVEL);
        }}
      >
        Flat
      </Chip>
      <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("group", "Tilt");
  await key("ArrowRight");
  await key("ArrowRight");
  await see("20% right");
  await press("button", "Flat");
  await see("Level");
};
