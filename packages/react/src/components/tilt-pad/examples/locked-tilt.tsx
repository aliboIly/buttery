import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Switch, TiltPad, ValueBadge } from "@butteryui/react";
import type { TiltValue } from "@butteryui/react";

function tiltOf({ x, y }: TiltValue): string {
  const amount = (value: number): string =>
    `${String(Math.round(Math.abs(value) * 100))}%`;
  const parts: string[] = [];
  if (x !== 0) parts.push(`${amount(x)} ${x < 0 ? "left" : "right"}`);
  if (y !== 0) parts.push(`${amount(y)} ${y < 0 ? "up" : "down"}`);
  return parts.length === 0 ? "Level" : parts.join(", ");
}

/** A disabled pad: the tilt holds while it's locked, dimmed and ignoring drags and keys, and moves once it's unlocked. */
export function LockedTilt(): ReactElement {
  const [locked, setLocked] = useState(true);
  const [tilt, setTilt] = useState<TiltValue>({ x: 0.3, y: 0 });
  return (
    <Stack gap={4}>
      <Switch
        label="Lock the tilt"
        checked={locked}
        onCheckedChange={setLocked}
      />
      <Inline gap={3} align="center">
        <TiltPad
          label="Tilt"
          value={tilt}
          onValueChange={setTilt}
          disabled={locked}
        />
        <ValueBadge reserve={["71% right, 71% down"]}>
          {tiltOf(tilt)}
        </ValueBadge>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await see("30% right");
  await press("switch", "Lock the tilt");
  await press("group", "Tilt");
  await key("ArrowLeft");
  await see("20% right");
};
