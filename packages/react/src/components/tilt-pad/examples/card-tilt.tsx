import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { TiltPad } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

function leanOf({ x, y }: TiltValue): string {
  const amount = (value: number): string =>
    `${String(Math.round(Math.abs(value) * 100))}%`;
  const parts: string[] = [];
  if (x !== 0) parts.push(`${amount(x)} ${x < 0 ? "left" : "right"}`);
  if (y !== 0) parts.push(`${amount(y)} ${y < 0 ? "up" : "down"}`);
  return parts.length === 0 ? "Lying flat" : `Leaning ${parts.join(" and ")}`;
}

/** A lean mapped to a card's 3D transform: ±20° each way at 1200px of perspective. */
export function CardTilt(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0, y: 0 });
  const transform = `perspective(1200px) rotateY(${String(tilt.x * 20)}deg) rotateX(${String(-tilt.y * 20)}deg)`;
  return (
    <Inline gap={8} align="center">
      <TiltPad label="Lean" value={tilt} onValueChange={setTilt} />
      <Surface level="card" pad={6} asChild style={{ transform }}>
        <output aria-label="Card preview">
          <Stack gap={2}>
            <Text variant="title">Launch card</Text>
            <Text variant="caption" tone="secondary">
              {leanOf(tilt)}
            </Text>
          </Stack>
        </output>
      </Surface>
    </Inline>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await see("Lying flat");
  await press("group", "Lean");
  await key("ArrowRight");
  await key("ArrowUp");
  await see("Leaning 10% right and 10% up");
};
